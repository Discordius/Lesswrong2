import { addCallback, runCallbacks } from 'meteor/vulcan:core';
import Users from 'meteor/vulcan:users';

function PostsEditRunPostUndraftedSyncCallbacks (modifier, post) {
  if (modifier.$set && modifier.$set.draft === false && post.draft) {
    modifier = runCallbacks("posts.undraft.sync", modifier, post);
  }
  return modifier;
}
addCallback("posts.edit.sync", PostsEditRunPostUndraftedSyncCallbacks);

/**
 * @summary set postedAt when a post is moved out of drafts
 */
function PostsSetPostedAt (modifier, post) {
  modifier.$set.postedAt = new Date();
  if (modifier.$unset) {
    delete modifier.$unset.postedAt;
  }
  return modifier;
}
addCallback("posts.undraft.sync", PostsSetPostedAt);

/**
 * @summary update frontpagePostCount when post is moved into frontpage
 */
function postsEditIncreaseFrontpagePostCount (post, oldPost) {
  if (post.frontpage && !oldPost.frontpage) {
    Users.update({_id: post.userId}, {$inc: {frontpagePostCount: 1}})
  }
}
addCallback("posts.edit.async", postsEditIncreaseFrontpagePostCount);

/**
 * @summary update frontpagePostCount when post is moved out of frontpage
 */
function postsEditDecreaseFrontpagePostCount (post, oldPost) {
  if (!post.frontpage && oldPost.frontpage) {
    Users.update({_id: post.userId}, {$inc: {frontpagePostCount: -1}})
  }
}
addCallback("posts.edit.async", postsEditDecreaseFrontpagePostCount);
