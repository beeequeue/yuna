/* THIS IS A GENERATED FILE */

export type IntrospectionResultData = {
  __schema: {
    types: {
      kind: string
      name: string
      possibleTypes: {
        name: string
      }[]
    }[]
  }
}
const result: IntrospectionResultData = {
  __schema: {
    types: [
      {
        kind: 'UNION',
        name: 'NotificationUnion',
        possibleTypes: [
          {
            name: 'AiringNotification',
          },
          {
            name: 'FollowingNotification',
          },
          {
            name: 'ActivityMessageNotification',
          },
          {
            name: 'ActivityMentionNotification',
          },
          {
            name: 'ActivityReplyNotification',
          },
          {
            name: 'ActivityReplySubscribedNotification',
          },
          {
            name: 'ActivityLikeNotification',
          },
          {
            name: 'ActivityReplyLikeNotification',
          },
          {
            name: 'ThreadCommentMentionNotification',
          },
          {
            name: 'ThreadCommentReplyNotification',
          },
          {
            name: 'ThreadCommentSubscribedNotification',
          },
          {
            name: 'ThreadCommentLikeNotification',
          },
          {
            name: 'ThreadLikeNotification',
          },
          {
            name: 'RelatedMediaAdditionNotification',
          },
        ],
      },
      {
        kind: 'UNION',
        name: 'ActivityUnion',
        possibleTypes: [
          {
            name: 'TextActivity',
          },
          {
            name: 'ListActivity',
          },
          {
            name: 'MessageActivity',
          },
        ],
      },
      {
        kind: 'UNION',
        name: 'LikeableUnion',
        possibleTypes: [
          {
            name: 'ListActivity',
          },
          {
            name: 'TextActivity',
          },
          {
            name: 'MessageActivity',
          },
          {
            name: 'ActivityReply',
          },
          {
            name: 'Thread',
          },
          {
            name: 'ThreadComment',
          },
        ],
      },
    ],
  },
}
export default result
