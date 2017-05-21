import Posts from "meteor/vulcan:posts";
import PostEditor from '../../editor/PostEditor.jsx';

const formGroups = {
  admin: {
    name: "admin",
    order: 2
  }
};

Posts.addField([
  /**
    Drafts
  */
  {
    fieldName: "draft",
    fieldSchema: {
      type: Boolean,
      optional: true,
      defaultValue: false,
      viewableBy: ['members'],
      insertableBy: ['members'],
      editableBy: ['members'],
      control: "checkbox"
    }
  },

  /**
    draftJS
  */
  {
    fieldName: 'draftJS',
    fieldSchema: {
      type: Object,
      optional: true,
      viewableBy: ['guests'],
      editableBy: ['members'],
      insertableBy: ['members'],
      control: PostEditor,
      blackbox: true,
      order: 25,
    }
  },

  /**
    Legacy: Boolean used to indicate that post was imported from old LW database
  */
  {
    fieldName: 'legacy',
    fieldSchema: {
      type: Boolean,
      optional: true,
      hidden: true,
      defaultValue: false,
      viewableBy: ['guests'],
      editableBy: ['members'],
      insertableBy: ['members'],
    }
  },

  /**
    Legacy ID: ID used in the original LessWrong database
  */
  {
    fieldName: 'legacyId',
    fieldSchema: {
      type: String,
      optional: true,
      hidden: true,
      viewableBy: ['guests'],
      editableBy: ['members'],
      insertableBy: ['members'],
    }
  },

  /**
    Legacy Spam: True if the original post in the legacy LW database had this post
    marked as spam
  */
  {
    fieldName: 'legacySpam',
    fieldSchema: {
      type: Boolean,
      optional: true,
      defaultValue: false,
      hidden: true,
      viewableBy: ['guests'],
      editableBy: ['members'],
      insertableBy: ['members'],
    }
  },

  /**
    Feed Id: If this post was automatically generated by an integrated RSS feed
    then this field will have the ID of the relevant feed
  */
  {
    fieldName: 'feedId',
    fieldSchema: {
      type: String,
      optional: true,
      viewableBy: ['guests'],
      editableBy: ['admins'],
      insertableBy: ['members'],
      resolveAs: 'feed: RSSFeed',
      group: formGroups.admin
    }
  },

  /**
    Feed Link: If this post was automatically generated by an integrated RSS feed
    then this field will have the link to the original blogpost it was posted from
  */
  {
    fieldName: 'feedLink',
    fieldSchema: {
      type: String,
      optional: true,
      viewableBy: ['guests'],
      editableBy: ['admins'],
      insertableBy: ['members'],
      group: formGroups.admin
    }
  },
]);

Posts.removeField('body');
