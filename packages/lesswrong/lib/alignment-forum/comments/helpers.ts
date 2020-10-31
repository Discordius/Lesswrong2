import * as _ from 'underscore';

export const commentSuggestForAlignment = async ({ currentUser, comment, updateComment }) => {
  const suggestUserIds = comment.suggestForAlignmentUserIds || []
  const newSuggestUserIds = _.uniq([...suggestUserIds, currentUser._id])
  updateComment({
    selector: { _id: comment._id},
    data: {suggestForAlignmentUserIds: newSuggestUserIds},
  })
}

export const commentUnSuggestForAlignment = async ({ currentUser, comment, updateComment }) => {
  const suggestUserIds = comment.suggestForAlignmentUserIds || []
  const newSuggestUserIds = _.without([...suggestUserIds], currentUser._id)
  await updateComment({
    selector: { _id: comment._id},
    data: {suggestForAlignmentUserIds: newSuggestUserIds},
  })
}
