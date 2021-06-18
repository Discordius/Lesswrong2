// Convention: Migration scripts (starting from when this migration
// infrastructure was put in place) live in this directory (server/migrations),
// and are named "YYYY-MM-DD-migrationDescription.js", with the date when the
// script was written.

// to run a migration, enter in terminal:
// meteor shell
// 
// and then run:
// Vulcan.migrations.migrationName()

import './2019-01-04-voteSchema';
import './2019-01-21-denormalizeVoteCount';
import './2019-01-24-karmaChangeSettings';
import './2019-01-30-migrateEditableFields'
import './2019-02-04-testCommentMigration'
import './2019-02-04-addSchemaVersionEverywhere'
import './2019-02-04-replaceObjectIdsInEditableFields'
import './2019-02-06-fixBigPosts'
import './2019-02-14-computeWordCounts'
import './2019-03-07-schemaMismatchFixes1'
import './2019-03-21-fixDeletedBios'
import './2019-04-10-confirmLegacyEmails'
import './2019-04-10-dropObsoleteColumns'
import './2019-04-10-legacyDataCollection'
import './2019-04-24-migrateLinkPosts'
import './2019-05-01-migrateSubscriptions'
import './2019-05-09-denormalizeReadStatus'
import './2019-05-14-fixCapitalizedSlugs'
import './2019-06-03-updateMessageCounts'
import './2019-06-13-renameAllPostsSorting'
import './2019-07-24-fixMaxBaseScore'
import './2019-07-25-setDefaultShortformValue'
import './2019-09-05-setDefaultGroupActiveStatus'
import './2019-10-10-generatePingbacks'
import './2019-10-23-setAFShortformValues'
import './2019-10-23-setDefaultNotificationValues'
import './2019-11-04-postsModifiedAtField'
import './2019-11-24-editableLatestRevision1';
import './2019-11-25-fixLegacyJoinDates'
import './2019-11-27-setDefaultSubscriptionTypes'
import './2019-11-30-setDefaultEventSubscriptionType'
import './2019-12-02-trivialMigration'
import './2019-12-05-generatePingbacksAgain'
import './2020-01-02-fillMissingRevisionFieldNames'
import './2020-02-23-maxCount'
import './2020-03-11-denormalizeTagRelevance'
import './2020-03-11-updateFrontpageFilterSettings'
import './2020-03-30-fixLostUnapprovedComments'
import './2020-04-20-adminOnlyTags'
import './2020-04-28-tagDefaultOrder'
import './2020-05-05-addRevisionCollectionName'
import './2020-05-06-forceSecureImageLinks'
import './2020-05-13-noIndexLowKarma'
import './2020-05-19-fillDefaultNoIndex'
import './2020-05-22-deletedNotifications'
import './2020-06-08-clearOldPartiallyReadSequences'
import './2020-06-14-populateTagUser'
import './2020-06-22-directChildrenCount.ts'
import './2020-07-23-defaultWikiGrade.ts'
import './2020-09-08-onlineEvent.ts'
import './2020-09-03-createWikiImportUsers.ts'
import './2020-09-03-defaultWikiOnly.ts'
import './2020-09-19-afVoteMigration'
import './2020-09-19-legacyKarmaMigration'
import './2020-09-19-updateCollectionScores'
import './2020-09-15-tagLastCommentedAt.ts'
import './2020-09-15-revisionChangeMetrics.ts'
import './2020-10-26-postDefaultDraft.ts'
import './2020-11-12-guaranteedPostReviewer.ts'
import './2020-12-04-nominationCount2019.ts'
import './2021-03-11-readStatusesIndex.ts'
import './2021-04-28-populateCommentDescendentCounts';
import './2021-05-09-selfVoteOnTagRevisions';
import './2021-06-05-fillWikiEditCount'
