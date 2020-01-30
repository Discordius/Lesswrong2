import React, { PureComponent } from 'react';
import { Components, registerComponent, getFragment, getSetting } from 'meteor/vulcan:core';
import { useMessages } from '../common/withMessages';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import { Posts } from '../../lib/collections/posts/collection'
import { useCurrentUser } from '../common/withUser';
import { useNavigation } from '../../lib/routeUtil';
import withMobileDialog from '@material-ui/core/withMobileDialog';

const styles = theme => ({
  formSubmit: {
    display: "flex",
    flexWrap: "wrap",
  }
})

const NewQuestionDialog = ({ onClose, fullScreen, classes }) => {
  const currentUser = useCurrentUser();
  const { flash } = useMessages();
  const { history } = useNavigation();
  const { PostSubmit, SubmitToFrontpageCheckbox } = Components
  
  const QuestionSubmit = (props) => {
    return <div className={classes.formSubmit}>
      <SubmitToFrontpageCheckbox {...props}/>
      <PostSubmit {...props} />
    </div>
  }
  const af = getSetting('forumType') === 'AlignmentForum'

  return (
    <Dialog
      open={true}
      maxWidth={false}
      onClose={onClose}
      fullScreen={fullScreen}
    >
      <DialogContent>
        <Components.WrappedSmartForm
          collection={Posts}
          fields={['title', 'contents', 'question', 'draft', 'submitToFrontpage', ...(af ? ['af'] : [])]}
          mutationFragment={getFragment('PostsList')}
          prefilledProps={{
            userId: currentUser!._id,
            question: true,
            af
          }}
          cancelCallback={onClose}
          successCallback={post => {
            history.push({pathname: Posts.getPageUrl(post)});
            flash({ id: 'posts.created_message', properties: { title: post.title }, type: 'success'});
            onClose()
          }}
          formComponents={{
            FormSubmit: QuestionSubmit,
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

const NewQuestionDialogComponent = registerComponent('NewQuestionDialog', NewQuestionDialog, {
  styles,
  hocs: [withMobileDialog()]
});

declare global {
  interface ComponentTypes {
    NewQuestionDialog: typeof NewQuestionDialogComponent
  }
}

