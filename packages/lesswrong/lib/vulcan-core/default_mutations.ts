/*

Default mutations

*/

import { Utils, getTypeName, getCollectionName } from '../vulcan-lib';
import { userCanDo, userOwns } from '../vulcan-users/permissions';
import isEmpty from 'lodash/isEmpty';

interface MutationOptions<T extends DbObject> {
  create?: boolean
  update?: boolean
  upsert?: boolean
  delete?: boolean
  
  newCheck?: any
  createCheck?: any
  updateCheck?: any
  editCheck?: any
  deleteCheck?: any
  removeCheck?: any
}
const defaultOptions = { create: true, update: true, upsert: true, delete: true };

/**
 * Safe getter
 * Must returns null if the document is absent (eg in case of validation failure)
 * @param {*} mutation
 * @param {*} mutationName
 */

const getCreateMutationName = (typeName: string): string => `create${typeName}`;
const getUpdateMutationName = (typeName: string): string => `update${typeName}`;
const getDeleteMutationName = (typeName: string): string => `delete${typeName}`;
const getUpsertMutationName = (typeName: string): string => `upsert${typeName}`;


export function getDefaultMutations<N extends CollectionNameString>(collectionName: N, options?: MutationOptions<ObjectsByCollectionName[N]>) {
  type T = ObjectsByCollectionName[N];
  const typeName = getTypeName(collectionName);
  const mutationOptions: MutationOptions<T> = { ...defaultOptions, ...options };

  const mutations: any = {};

  if (mutationOptions.create) {
    // mutation for inserting a new document

    const mutationName = getCreateMutationName(typeName);

    const createMutation = {
      description: `Mutation for creating new ${typeName} documents`,
      name: mutationName,

      // check function called on a user to see if they can perform the operation
      check(user, document) {
        // OpenCRUD backwards compatibility
        const check = mutationOptions.createCheck || mutationOptions.newCheck;
        if (check) {
          return check(user, document);
        }
        // check if they can perform "foo.new" operation (e.g. "movie.new")
        // OpenCRUD backwards compatibility
        return userCanDo(user, [
          `${typeName.toLowerCase()}.create`,
          `${collectionName.toLowerCase()}.new`,
        ]);
      },

      async mutation(root, { data }, context: ResolverContext) {
        const collection = context[collectionName];

        // check if current user can pass check function; else throw error
        await Utils.performCheck(
          this.check,
          context.currentUser,
          data,
          
          context,
          '',
          `${typeName}.create`,
          collectionName
        );

        // pass document to boilerplate createMutator function
        return await Utils.createMutator({
          collection,
          data,
          currentUser: context.currentUser,
          validate: true,
          context,
        });
      },
    };
    mutations.create = createMutation;
    // OpenCRUD backwards compatibility
    mutations.new = createMutation;
  }

  if (mutationOptions.update) {
    // mutation for editing a specific document

    const mutationName = getUpdateMutationName(typeName);

    const updateMutation = {
      description: `Mutation for updating a ${typeName} document`,
      name: mutationName,

      // check function called on a user and document to see if they can perform the operation
      check(user, document) {
        // OpenCRUD backwards compatibility
        const check = mutationOptions.updateCheck || mutationOptions.editCheck;
        if (check) {
          return check(user, document);
        }

        if (!user || !document) return false;
        // check if user owns the document being edited.
        // if they do, check if they can perform "foo.edit.own" action
        // if they don't, check if they can perform "foo.edit.all" action
        // OpenCRUD backwards compatibility
        return userOwns(user, document)
          ? userCanDo(user, [
            `${typeName.toLowerCase()}.update.own`,
            `${collectionName.toLowerCase()}.edit.own`,
          ])
          : userCanDo(user, [
            `${typeName.toLowerCase()}.update.all`,
            `${collectionName.toLowerCase()}.edit.all`,
          ]);
      },

      async mutation(root, { selector, data }, context: ResolverContext) {
        const collection = context[collectionName];

        if (isEmpty(selector)) {
          throw new Error('Selector cannot be empty');
        }

        // get entire unmodified document from database
        const document = await Utils.Connectors.get(collection, selector);

        if (!document) {
          throw new Error(
            `Could not find document to update for selector: ${JSON.stringify(selector)}`
          );
        }

        // check if user can perform operation; if not throw error
        await Utils.performCheck(
          this.check,
          context.currentUser,
          document,
          
          context,
          document._id,
          `${typeName}.update`,
          collectionName
        );

        // call updateMutator boilerplate function
        return await Utils.updateMutator({
          collection,
          selector,
          data,
          currentUser: context.currentUser,
          validate: true,
          context,
          document,
        });
      },
    };

    mutations.update = updateMutation;
    // OpenCRUD backwards compatibility
    mutations.edit = updateMutation;

  }
  if (mutationOptions.upsert) {
    // mutation for upserting a specific document
    const mutationName = getUpsertMutationName(typeName);
    mutations.upsert = {
      description: `Mutation for upserting a ${typeName} document`,
      name: mutationName,

      async mutation(root, { selector, data }, context) {
        const collection = context[collectionName];

        // check if document exists already
        const existingDocument = await Utils.Connectors.get(collection, selector, {
          fields: { _id: 1 },
        });

        if (existingDocument) {
          return await collection.options.mutations.update.mutation(
            root,
            { selector, data },
            context
          );
        } else {
          return await collection.options.mutations.create.mutation(root, { data }, context);
        }
      },
    };
  }
  if (mutationOptions.delete) {
    // mutation for removing a specific document (same checks as edit mutation)

    const mutationName = getDeleteMutationName(typeName);

    const deleteMutation = {
      description: `Mutation for deleting a ${typeName} document`,
      name: mutationName,

      check(user, document) {
        // OpenCRUD backwards compatibility
        const check = mutationOptions.deleteCheck || mutationOptions.removeCheck;
        if (check) {
          return check(user, document);
        }

        if (!user || !document) return false;
        // OpenCRUD backwards compatibility
        return userOwns(user, document)
          ? userCanDo(user, [
            `${typeName.toLowerCase()}.delete.own`,
            `${collectionName.toLowerCase()}.remove.own`,
          ])
          : userCanDo(user, [
            `${typeName.toLowerCase()}.delete.all`,
            `${collectionName.toLowerCase()}.remove.all`,
          ]);
      },

      async mutation(root, { selector }, context: ResolverContext) {
        const collection = context[collectionName];

        if (isEmpty(selector)) {
          throw new Error('Selector cannot be empty');
        }

        const document = await Utils.Connectors.get(collection, selector);

        if (!document) {
          throw new Error(
            `Could not find document to delete for selector: ${JSON.stringify(selector)}`
          );
        }

        await Utils.performCheck(
          this.check,
          context.currentUser,
          document,
          context,
          document._id,
          `${typeName}.delete`,
          collectionName
        );

        return await Utils.deleteMutator({
          collection,
          selector,
          currentUser: context.currentUser,
          validate: true,
          context,
          document,
        });
      },
    };

    mutations.delete = deleteMutation;
    // OpenCRUD backwards compatibility
    mutations.remove = deleteMutation;

  }

  return mutations;
}
