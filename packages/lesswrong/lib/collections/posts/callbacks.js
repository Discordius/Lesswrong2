import { addCallback, runCallbacks, runCallbacksAsync, newMutation } from 'meteor/vulcan:core';
import { Posts } from './collection';
import { Comments } from '../comments/collection';
import Users from 'meteor/vulcan:users';
import { performVoteServer } from '../../../server/voteServer.js';
import Localgroups from '../localgroups/collection.js';
import { addEditableCallbacks } from '../../../server/editor/make_editable_callbacks'
import { makeEditableOptions, makeEditableOptionsModeration } from './custom_fields.js'
import { PostRelations } from '../postRelations/index';
const MINIMUM_APPROVAL_KARMA = 5

function PostsEditRunPostUndraftedSyncCallbacks (data, { oldDocument: post }) {
  if (data.draft === false && post.draft) {
    data = runCallbacks("post.undraft.before", data, post);
  }
  return data;
}
addCallback("post.update.before", PostsEditRunPostUndraftedSyncCallbacks);

function PostsEditRunPostUndraftedAsyncCallbacks (newPost, oldPost) {
  if (!newPost.draft && oldPost.draft) {
    runCallbacksAsync("posts.undraft.async", newPost, oldPost)
  }
  return newPost
}
addCallback("posts.edit.async", PostsEditRunPostUndraftedAsyncCallbacks);

function PostsEditRunPostDraftedAsyncCallbacks (newPost, oldPost) {
  if (newPost.draft && !oldPost.draft) {
    runCallbacksAsync("posts.draft.async", newPost, oldPost)
  }
  return newPost
}
addCallback("posts.edit.async", PostsEditRunPostDraftedAsyncCallbacks);

/**
 * @summary set postedAt when a post is moved out of drafts
 */
function PostsSetPostedAt (data, oldPost) {
  data.postedAt = new Date();
  return data;
}
addCallback("post.undraft.before", PostsSetPostedAt);

function increaseMaxBaseScore ({newDocument, vote}, collection, user, context) {
  if (vote.collectionName === "Posts" && newDocument.baseScore > (newDocument.maxBaseScore || 0)) {
    let thresholdTimestamp = {};
    if (!newDocument.scoreExceeded2Date && newDocument.baseScore >= 2) {
      thresholdTimestamp.scoreExceeded2Date = new Date();
    }
    if (!newDocument.scoreExceeded30Date && newDocument.baseScore >= 30) {
      thresholdTimestamp.scoreExceeded30Date = new Date();
    }
    if (!newDocument.scoreExceeded45Date && newDocument.baseScore >= 45) {
      thresholdTimestamp.scoreExceeded45Date = new Date();
    }
    if (!newDocument.scoreExceeded75Date && newDocument.baseScore >= 75) {
      thresholdTimestamp.scoreExceeded75Date = new Date();
    }
    Posts.update({_id: newDocument._id}, {$set: {maxBaseScore: newDocument.baseScore, ...thresholdTimestamp}})
  }
}

addCallback("votes.smallUpvote.async", increaseMaxBaseScore);
addCallback("votes.bigUpvote.async", increaseMaxBaseScore);

function PostsNewDefaultLocation (post) {
  if (post.isEvent && post.groupId && !post.location) {
    const { location, googleLocation, mongoLocation } = Localgroups.findOne(post.groupId)
    post = {...post, location, googleLocation, mongoLocation}
  }
  return post
}

addCallback("posts.new.sync", PostsNewDefaultLocation);

function PostsNewDefaultTypes (post) {
  if (post.isEvent && post.groupId && !post.types) {
    const { types } = Localgroups.findOne(post.groupId)
    post = {...post, types}
  }
  return post
}

addCallback("posts.new.sync", PostsNewDefaultTypes);

// LESSWRONG – bigUpvote
async function LWPostsNewUpvoteOwnPost(post) {
 var postAuthor = Users.findOne(post.userId);
 const votedPost = await performVoteServer({ document: post, voteType: 'bigUpvote', collection: Posts, user: postAuthor })
 return {...post, ...votedPost};
}

addCallback('posts.new.after', LWPostsNewUpvoteOwnPost);

function PostsNewUserApprovedStatus (post) {
  const postAuthor = Users.findOne(post.userId);
  if (!postAuthor.reviewedByUserId && (postAuthor.karma || 0) < MINIMUM_APPROVAL_KARMA) {
    return {...post, authorIsUnreviewed: true}
  }
}

addCallback("posts.new.sync", PostsNewUserApprovedStatus);

function AddReferrerToPost(post, properties)
{
  if (properties && properties.context && properties.context.headers) {
    let referrer = properties.context.headers["referer"];
    let userAgent = properties.context.headers["user-agent"];
    
    return {
      ...post,
      referrer: referrer,
      userAgent: userAgent,
    };
  }
}
addCallback("post.create.before", AddReferrerToPost);

addEditableCallbacks({collection: Posts, options: makeEditableOptions})
addEditableCallbacks({collection: Posts, options: makeEditableOptionsModeration})

function PostsNewPostRelation (post) {
  if (post.originalPostRelationSourceId) {
    newMutation({
      collection: PostRelations,
      document: {
        type: "subQuestion",
        sourcePostId: post.originalPostRelationSourceId,
        targetPostId: post._id,
      },
      validate: false,
    })
  }
  return post
}
addCallback("posts.new.after", PostsNewPostRelation);

function UpdatePostShortform (newPost, oldPost) {
  if (!!newPost.shortform !== !!oldPost.shortform) {
    const shortform = !!newPost.shortform;
    Comments.update(
      { postId: newPost._id },
      { $set: {
        shortform: shortform
      } },
      { multi: true }
    );
  }
  return newPost;
}
addCallback("posts.edit.async", UpdatePostShortform );

function MoveCommentsFromConvertedComment (newPost, oldPost, user) {
  const published = newPost.draft === false  && !!oldPost.draft
  const moveComments = newPost.convertedFromCommentId && newPost.moveCommentsFromConvertedComment
  const comment = Comments.findOne({_id: newPost.convertedFromCommentId})
  const userHasPermission = Users.canMoveChildComments(user, comment)
  
  // This currently is intended to work on top-level shortform comments. 

  // TODO — build a version of this that works on children of non-top-level comments,
  // either by building a recursive function that grabs children here, or changing comment architecture to 
  // make it easier to grab all children-comments of an arbitrary comment at once
  if (published && moveComments && userHasPermission) {
    Comments.update(
      { topLevelCommentId: newPost.convertedFromCommentId },
      { $set: {
        postId: newPost._id,
        topLevelCommentId: null,
        shortform: false
      } },
      { multi: true }
    );
    Comments.update(
      { parentCommentId: newPost.convertedFromCommentId },
      { $set: {
        postId: newPost._id,
        parentCommentId: null,
        shortform: false
      } },
      { multi: true }
    );
  }
  return newPost;
}
addCallback("posts.edit.async", MoveCommentsFromConvertedComment );

function PostsNewConvertedFrom (post, user) {
  const comment = Comments.findOne({_id:post.convertedFromCommentId})
  const canEditComment = Users.canDo(user, 'comments.edit.own') && Users.owns(user, comment)
  if (post.convertedFromCommentId && canEditComment) {
    Comments.update(
      { _id: post.convertedFromCommentId },
      { $set: {
        convertedToPostId: post._id,
      }},
    );
  }
  return post
}
addCallback("posts.new.after", PostsNewConvertedFrom);