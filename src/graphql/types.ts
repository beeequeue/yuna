/* THIS IS A GENERATED FILE */
export type Maybe<T> = T | null
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  Json: any
  /** ISO 3166-1 alpha-2 country code */
  CountryCode: any
  /** 8 digit long date integer (YYYYMMDD). Unknown dates represented by 0. E.g. 2016: 20160000, May 1976: 19760500 */
  FuzzyDateInt: any
}

/** Notification for when a activity is liked */
export type ActivityLikeNotification = {
  __typename?: 'ActivityLikeNotification'
  /** The id of the Notification */
  id: Scalars['Int']
  /** The id of the user who liked to the activity */
  userId: Scalars['Int']
  /** The type of notification */
  type: Maybe<NotificationType>
  /** The id of the activity which was liked */
  activityId: Scalars['Int']
  /** The notification context text */
  context: Maybe<Scalars['String']>
  /** The time the notification was created at */
  createdAt: Maybe<Scalars['Int']>
  /** The liked activity */
  activity: Maybe<ActivityUnion>
  /** The user who liked the activity */
  user: Maybe<User>
}

/** Notification for when authenticated user is @ mentioned in activity or reply */
export type ActivityMentionNotification = {
  __typename?: 'ActivityMentionNotification'
  /** The id of the Notification */
  id: Scalars['Int']
  /** The id of the user who mentioned the authenticated user */
  userId: Scalars['Int']
  /** The type of notification */
  type: Maybe<NotificationType>
  /** The id of the activity where mentioned */
  activityId: Scalars['Int']
  /** The notification context text */
  context: Maybe<Scalars['String']>
  /** The time the notification was created at */
  createdAt: Maybe<Scalars['Int']>
  /** The liked activity */
  activity: Maybe<ActivityUnion>
  /** The user who mentioned the authenticated user */
  user: Maybe<User>
}

/** Notification for when a user is send an activity message */
export type ActivityMessageNotification = {
  __typename?: 'ActivityMessageNotification'
  /** The id of the Notification */
  id: Scalars['Int']
  /** The if of the user who send the message */
  userId: Scalars['Int']
  /** The type of notification */
  type: Maybe<NotificationType>
  /** The id of the activity message */
  activityId: Scalars['Int']
  /** The notification context text */
  context: Maybe<Scalars['String']>
  /** The time the notification was created at */
  createdAt: Maybe<Scalars['Int']>
  /** The message activity */
  message: Maybe<MessageActivity>
  /** The user who sent the message */
  user: Maybe<User>
}

/** Replay to an activity item */
export type ActivityReply = {
  __typename?: 'ActivityReply'
  /** The id of the reply */
  id: Scalars['Int']
  /** The id of the replies creator */
  userId: Maybe<Scalars['Int']>
  /** The id of the parent activity */
  activityId: Maybe<Scalars['Int']>
  /** The reply text */
  text: Maybe<Scalars['String']>
  /** The time the reply was created at */
  createdAt: Scalars['Int']
  /** The user who created reply */
  user: Maybe<User>
  /** The users who liked the reply */
  likes: Maybe<Array<Maybe<User>>>
}

/** Replay to an activity item */
export type ActivityReplyTextArgs = {
  asHtml: Maybe<Scalars['Boolean']>
}

/** Notification for when a activity reply is liked */
export type ActivityReplyLikeNotification = {
  __typename?: 'ActivityReplyLikeNotification'
  /** The id of the Notification */
  id: Scalars['Int']
  /** The id of the user who liked to the activity reply */
  userId: Scalars['Int']
  /** The type of notification */
  type: Maybe<NotificationType>
  /** The id of the activity where the reply which was liked */
  activityId: Scalars['Int']
  /** The notification context text */
  context: Maybe<Scalars['String']>
  /** The time the notification was created at */
  createdAt: Maybe<Scalars['Int']>
  /** The liked activity */
  activity: Maybe<ActivityUnion>
  /** The user who liked the activity reply */
  user: Maybe<User>
}

/** Notification for when a user replies to the authenticated users activity */
export type ActivityReplyNotification = {
  __typename?: 'ActivityReplyNotification'
  /** The id of the Notification */
  id: Scalars['Int']
  /** The id of the user who replied to the activity */
  userId: Scalars['Int']
  /** The type of notification */
  type: Maybe<NotificationType>
  /** The id of the activity which was replied too */
  activityId: Scalars['Int']
  /** The notification context text */
  context: Maybe<Scalars['String']>
  /** The time the notification was created at */
  createdAt: Maybe<Scalars['Int']>
  /** The liked activity */
  activity: Maybe<ActivityUnion>
  /** The user who replied to the activity */
  user: Maybe<User>
}

/** Notification for when a user replies to activity the authenticated user has replied to */
export type ActivityReplySubscribedNotification = {
  __typename?: 'ActivityReplySubscribedNotification'
  /** The id of the Notification */
  id: Scalars['Int']
  /** The id of the user who replied to the activity */
  userId: Scalars['Int']
  /** The type of notification */
  type: Maybe<NotificationType>
  /** The id of the activity which was replied too */
  activityId: Scalars['Int']
  /** The notification context text */
  context: Maybe<Scalars['String']>
  /** The time the notification was created at */
  createdAt: Maybe<Scalars['Int']>
  /** The liked activity */
  activity: Maybe<ActivityUnion>
  /** The user who replied to the activity */
  user: Maybe<User>
}

/** Activity sort enums */
export enum ActivitySort {
  Id = 'ID',
  IdDesc = 'ID_DESC',
}

/** Activity type enum. */
export enum ActivityType {
  /** A text activity */
  Text = 'TEXT',
  /** A anime list update activity */
  AnimeList = 'ANIME_LIST',
  /** A manga list update activity */
  MangaList = 'MANGA_LIST',
  /** A text message activity sent to another user */
  Message = 'MESSAGE',
  /** Anime & Manga list update, only used in query arguments */
  MediaList = 'MEDIA_LIST',
}

/** Activity union type */
export type ActivityUnion = TextActivity | ListActivity | MessageActivity

/** Notification for when an episode of anime airs */
export type AiringNotification = {
  __typename?: 'AiringNotification'
  /** The id of the Notification */
  id: Scalars['Int']
  /** The type of notification */
  type: Maybe<NotificationType>
  /** The id of the aired anime */
  animeId: Scalars['Int']
  /** The episode number that just aired */
  episode: Scalars['Int']
  /** The notification context text */
  contexts: Maybe<Array<Maybe<Scalars['String']>>>
  /** The time the notification was created at */
  createdAt: Maybe<Scalars['Int']>
  /** The associated media of the airing schedule */
  media: Maybe<Media>
}

/** Score & Watcher stats for airing anime by episode and mid-week */
export type AiringProgression = {
  __typename?: 'AiringProgression'
  /** The episode the stats were recorded at. .5 is the mid point between 2 episodes airing dates. */
  episode: Maybe<Scalars['Float']>
  /** The average score for the media */
  score: Maybe<Scalars['Float']>
  /** The amount of users watching the anime */
  watching: Maybe<Scalars['Int']>
}

/** Media Airing Schedule */
export type AiringSchedule = {
  __typename?: 'AiringSchedule'
  /** The id of the airing schedule item */
  id: Scalars['Int']
  /** The time the episode airs at */
  airingAt: Scalars['Int']
  /** Seconds until episode starts airing */
  timeUntilAiring: Scalars['Int']
  /** The airing episode number */
  episode: Scalars['Int']
  /** The associate media id of the airing episode */
  mediaId: Scalars['Int']
  /** The associate media of the airing episode */
  media: Maybe<Media>
}

export type AiringScheduleConnection = {
  __typename?: 'AiringScheduleConnection'
  edges: Maybe<Array<Maybe<AiringScheduleEdge>>>
  nodes: Maybe<Array<Maybe<AiringSchedule>>>
  /** The pagination information */
  pageInfo: Maybe<PageInfo>
}

/** AiringSchedule connection edge */
export type AiringScheduleEdge = {
  __typename?: 'AiringScheduleEdge'
  node: Maybe<AiringSchedule>
  /** The id of the connection */
  id: Maybe<Scalars['Int']>
}

export type AiringScheduleInput = {
  airingAt: Maybe<Scalars['Int']>
  episode: Maybe<Scalars['Int']>
  timeUntilAiring: Maybe<Scalars['Int']>
}

/** Airing schedule sort enums */
export enum AiringSort {
  Id = 'ID',
  IdDesc = 'ID_DESC',
  MediaId = 'MEDIA_ID',
  MediaIdDesc = 'MEDIA_ID_DESC',
  Time = 'TIME',
  TimeDesc = 'TIME_DESC',
  Episode = 'EPISODE',
  EpisodeDesc = 'EPISODE_DESC',
}

export type AniChartHighlightInput = {
  mediaId: Maybe<Scalars['Int']>
  highlight: Maybe<Scalars['String']>
}

export type AniChartUser = {
  __typename?: 'AniChartUser'
  user: Maybe<User>
  settings: Maybe<Scalars['Json']>
  highlights: Maybe<Scalars['Json']>
}

/** A character that features in an anime or manga */
export type Character = {
  __typename?: 'Character'
  /** The id of the character */
  id: Scalars['Int']
  /** The names of the character */
  name: Maybe<CharacterName>
  /** Character images */
  image: Maybe<CharacterImage>
  /** A general description of the character */
  description: Maybe<Scalars['String']>
  /** If the character is marked as favourite by the currently authenticated user */
  isFavourite: Scalars['Boolean']
  /** The url for the character page on the AniList website */
  siteUrl: Maybe<Scalars['String']>
  /** Media that includes the character */
  media: Maybe<MediaConnection>
  /** When the character's data was last updated */
  updatedAt: Maybe<Scalars['Int']>
  /** The amount of user's who have favourited the character */
  favourites: Maybe<Scalars['Int']>
}

/** A character that features in an anime or manga */
export type CharacterDescriptionArgs = {
  asHtml: Maybe<Scalars['Boolean']>
}

/** A character that features in an anime or manga */
export type CharacterMediaArgs = {
  sort: Maybe<Array<Maybe<MediaSort>>>
  type: Maybe<MediaType>
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

export type CharacterConnection = {
  __typename?: 'CharacterConnection'
  edges: Maybe<Array<Maybe<CharacterEdge>>>
  nodes: Maybe<Array<Maybe<Character>>>
  /** The pagination information */
  pageInfo: Maybe<PageInfo>
}

/** Character connection edge */
export type CharacterEdge = {
  __typename?: 'CharacterEdge'
  node: Maybe<Character>
  /** The id of the connection */
  id: Maybe<Scalars['Int']>
  /** The characters role in the media */
  role: Maybe<CharacterRole>
  /** The voice actors of the character */
  voiceActors: Maybe<Array<Maybe<Staff>>>
  /** The media the character is in */
  media: Maybe<Array<Maybe<Media>>>
  /** The order the character should be displayed from the users favourites */
  favouriteOrder: Maybe<Scalars['Int']>
}

/** Character connection edge */
export type CharacterEdgeVoiceActorsArgs = {
  language: Maybe<StaffLanguage>
  sort: Maybe<Array<Maybe<StaffSort>>>
}

export type CharacterImage = {
  __typename?: 'CharacterImage'
  /** The character's image of media at its largest size */
  large: Maybe<Scalars['String']>
  /** The character's image of media at medium size */
  medium: Maybe<Scalars['String']>
}

/** The names of the character */
export type CharacterName = {
  __typename?: 'CharacterName'
  /** The character's given name */
  first: Maybe<Scalars['String']>
  /** The character's surname */
  last: Maybe<Scalars['String']>
  /** The character's full name */
  full: Maybe<Scalars['String']>
  /** The character's full name in their native language */
  native: Maybe<Scalars['String']>
  /** Other names the character might be referred to as */
  alternative: Maybe<Array<Maybe<Scalars['String']>>>
}

/** The names of the character */
export type CharacterNameInput = {
  /** The character's given name */
  first: Maybe<Scalars['String']>
  /** The character's surname */
  last: Maybe<Scalars['String']>
  /** The character's full name in their native language */
  native: Maybe<Scalars['String']>
  /** Other names the character might be referred by */
  alternative: Maybe<Array<Maybe<Scalars['String']>>>
}

/** The role the character plays in the media */
export enum CharacterRole {
  /** A primary character role in the media */
  Main = 'MAIN',
  /** A supporting character role in the media */
  Supporting = 'SUPPORTING',
  /** A background character in the media */
  Background = 'BACKGROUND',
}

/** Character sort enums */
export enum CharacterSort {
  Id = 'ID',
  IdDesc = 'ID_DESC',
  Role = 'ROLE',
  RoleDesc = 'ROLE_DESC',
  SearchMatch = 'SEARCH_MATCH',
  Favourites = 'FAVOURITES',
  FavouritesDesc = 'FAVOURITES_DESC',
}

/** A submission for a character that features in an anime or manga */
export type CharacterSubmission = {
  __typename?: 'CharacterSubmission'
  /** The id of the submission */
  id: Scalars['Int']
  /** Character that the submission is referencing */
  character: Maybe<Character>
  /** The character submission changes */
  submission: Maybe<Character>
  /** Submitter for the submission */
  submitter: Maybe<User>
  /** Status of the submission */
  status: Maybe<SubmissionStatus>
  /** Inner details of submission status */
  notes: Maybe<Scalars['String']>
  createdAt: Maybe<Scalars['Int']>
}

export type CharacterSubmissionConnection = {
  __typename?: 'CharacterSubmissionConnection'
  edges: Maybe<Array<Maybe<CharacterSubmissionEdge>>>
  nodes: Maybe<Array<Maybe<CharacterSubmission>>>
  /** The pagination information */
  pageInfo: Maybe<PageInfo>
}

/** CharacterSubmission connection edge */
export type CharacterSubmissionEdge = {
  __typename?: 'CharacterSubmissionEdge'
  node: Maybe<CharacterSubmission>
  /** The characters role in the media */
  role: Maybe<CharacterRole>
  /** The voice actors of the character */
  voiceActors: Maybe<Array<Maybe<Staff>>>
  /** The submitted voice actors of the character */
  submittedVoiceActors: Maybe<Array<Maybe<StaffSubmission>>>
}

/** Deleted data type */
export type Deleted = {
  __typename?: 'Deleted'
  /** If an item has been successfully deleted */
  deleted: Maybe<Scalars['Boolean']>
}

export type EditListEntryOptions = {
  status: MediaListStatus
  score: Maybe<Scalars['Int']>
  progress: Scalars['Int']
  rewatched: Scalars['Int']
}

export type Episode = {
  __typename?: 'Episode'
  provider: Provider
  id: Scalars['String']
  animeId: Scalars['Int']
  title: Scalars['String']
  duration: Scalars['Int']
  progress: Maybe<Scalars['Int']>
  /** Index in the Array */
  index: Scalars['Int']
  /** Number in Season */
  episodeNumber: Scalars['Int']
  thumbnail: Scalars['String']
  url: Scalars['String']
  subtitles: Array<Array<Scalars['String']>>
  isWatched: Scalars['Boolean']
}

export type EpisodeInput = {
  provider: Provider
  id: Scalars['String']
  animeId: Scalars['Int']
  title: Scalars['String']
  duration: Scalars['Int']
  progress: Maybe<Scalars['Int']>
  index: Scalars['Int']
  episodeNumber: Scalars['Int']
  thumbnail: Scalars['String']
  url: Scalars['String']
  subtitles: Array<Array<Scalars['String']>>
  isWatched: Scalars['Boolean']
}

/** User's favourite anime, manga, characters, staff & studios */
export type Favourites = {
  __typename?: 'Favourites'
  /** Favourite anime */
  anime: Maybe<MediaConnection>
  /** Favourite manga */
  manga: Maybe<MediaConnection>
  /** Favourite characters */
  characters: Maybe<CharacterConnection>
  /** Favourite staff */
  staff: Maybe<StaffConnection>
  /** Favourite studios */
  studios: Maybe<StudioConnection>
}

/** User's favourite anime, manga, characters, staff & studios */
export type FavouritesAnimeArgs = {
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

/** User's favourite anime, manga, characters, staff & studios */
export type FavouritesMangaArgs = {
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

/** User's favourite anime, manga, characters, staff & studios */
export type FavouritesCharactersArgs = {
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

/** User's favourite anime, manga, characters, staff & studios */
export type FavouritesStaffArgs = {
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

/** User's favourite anime, manga, characters, staff & studios */
export type FavouritesStudiosArgs = {
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

/** Notification for when the authenticated user is followed by another user */
export type FollowingNotification = {
  __typename?: 'FollowingNotification'
  /** The id of the Notification */
  id: Scalars['Int']
  /** The id of the user who followed the authenticated user */
  userId: Scalars['Int']
  /** The type of notification */
  type: Maybe<NotificationType>
  /** The notification context text */
  context: Maybe<Scalars['String']>
  /** The time the notification was created at */
  createdAt: Maybe<Scalars['Int']>
  /** The liked activity */
  user: Maybe<User>
}

/** User's format statistics */
export type FormatStats = {
  __typename?: 'FormatStats'
  format: Maybe<MediaFormat>
  amount: Maybe<Scalars['Int']>
}

/** Date object that allows for incomplete date values (fuzzy) */
export type FuzzyDate = {
  __typename?: 'FuzzyDate'
  /** Numeric Year (2017) */
  year: Maybe<Scalars['Int']>
  /** Numeric Month (3) */
  month: Maybe<Scalars['Int']>
  /** Numeric Day (24) */
  day: Maybe<Scalars['Int']>
}

/** Date object that allows for incomplete date values (fuzzy) */
export type FuzzyDateInput = {
  /** Numeric Year (2017) */
  year: Maybe<Scalars['Int']>
  /** Numeric Month (3) */
  month: Maybe<Scalars['Int']>
  /** Numeric Day (24) */
  day: Maybe<Scalars['Int']>
}

/** User's genre statistics */
export type GenreStats = {
  __typename?: 'GenreStats'
  genre: Maybe<Scalars['String']>
  amount: Maybe<Scalars['Int']>
  meanScore: Maybe<Scalars['Int']>
  /** The amount of time in minutes the genre has been watched by the user */
  timeWatched: Maybe<Scalars['Int']>
}

/** Page of data (Used for internal use only) */
export type InternalPage = {
  __typename?: 'InternalPage'
  mediaSubmissions: Maybe<Array<Maybe<MediaSubmission>>>
  characterSubmissions: Maybe<Array<Maybe<CharacterSubmission>>>
  staffSubmissions: Maybe<Array<Maybe<StaffSubmission>>>
  revisionHistory: Maybe<Array<Maybe<RevisionHistory>>>
  reports: Maybe<Array<Maybe<Report>>>
  modActions: Maybe<Array<Maybe<ModAction>>>
  /** The pagination information */
  pageInfo: Maybe<PageInfo>
  users: Maybe<Array<Maybe<User>>>
  media: Maybe<Array<Maybe<Media>>>
  characters: Maybe<Array<Maybe<Character>>>
  staff: Maybe<Array<Maybe<Staff>>>
  studios: Maybe<Array<Maybe<Studio>>>
  mediaList: Maybe<Array<Maybe<MediaList>>>
  airingSchedules: Maybe<Array<Maybe<AiringSchedule>>>
  mediaTrends: Maybe<Array<Maybe<MediaTrend>>>
  notifications: Maybe<Array<Maybe<NotificationUnion>>>
  followers: Maybe<Array<Maybe<User>>>
  following: Maybe<Array<Maybe<User>>>
  activities: Maybe<Array<Maybe<ActivityUnion>>>
  activityReplies: Maybe<Array<Maybe<ActivityReply>>>
  threads: Maybe<Array<Maybe<Thread>>>
  threadComments: Maybe<Array<Maybe<ThreadComment>>>
  reviews: Maybe<Array<Maybe<Review>>>
}

/** Page of data (Used for internal use only) */
export type InternalPageMediaSubmissionsArgs = {
  mediaId: Maybe<Scalars['Int']>
  submissionId: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  status: Maybe<SubmissionStatus>
  type: Maybe<MediaType>
}

/** Page of data (Used for internal use only) */
export type InternalPageCharacterSubmissionsArgs = {
  characterId: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  status: Maybe<SubmissionStatus>
}

/** Page of data (Used for internal use only) */
export type InternalPageStaffSubmissionsArgs = {
  staffId: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  status: Maybe<SubmissionStatus>
}

/** Page of data (Used for internal use only) */
export type InternalPageRevisionHistoryArgs = {
  userId: Maybe<Scalars['Int']>
  mediaId: Maybe<Scalars['Int']>
  characterId: Maybe<Scalars['Int']>
  staffId: Maybe<Scalars['Int']>
  studioId: Maybe<Scalars['Int']>
}

/** Page of data (Used for internal use only) */
export type InternalPageModActionsArgs = {
  userId: Maybe<Scalars['Int']>
}

/** Page of data (Used for internal use only) */
export type InternalPageUsersArgs = {
  id: Maybe<Scalars['Int']>
  name: Maybe<Scalars['String']>
  search: Maybe<Scalars['String']>
  sort: Maybe<Array<Maybe<UserSort>>>
}

/** Page of data (Used for internal use only) */
export type InternalPageMediaArgs = {
  id: Maybe<Scalars['Int']>
  idMal: Maybe<Scalars['Int']>
  startDate: Maybe<Scalars['FuzzyDateInt']>
  endDate: Maybe<Scalars['FuzzyDateInt']>
  season: Maybe<MediaSeason>
  seasonYear: Maybe<Scalars['Int']>
  type: Maybe<MediaType>
  format: Maybe<MediaFormat>
  status: Maybe<MediaStatus>
  episodes: Maybe<Scalars['Int']>
  duration: Maybe<Scalars['Int']>
  chapters: Maybe<Scalars['Int']>
  volumes: Maybe<Scalars['Int']>
  isAdult: Maybe<Scalars['Boolean']>
  genre: Maybe<Scalars['String']>
  tag: Maybe<Scalars['String']>
  tagCategory: Maybe<Scalars['String']>
  onList: Maybe<Scalars['Boolean']>
  licensedBy: Maybe<Scalars['String']>
  averageScore: Maybe<Scalars['Int']>
  popularity: Maybe<Scalars['Int']>
  source: Maybe<MediaSource>
  countryOfOrigin: Maybe<Scalars['CountryCode']>
  search: Maybe<Scalars['String']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  idMal_not: Maybe<Scalars['Int']>
  idMal_in: Maybe<Array<Maybe<Scalars['Int']>>>
  idMal_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  startDate_greater: Maybe<Scalars['FuzzyDateInt']>
  startDate_lesser: Maybe<Scalars['FuzzyDateInt']>
  startDate_like: Maybe<Scalars['String']>
  endDate_greater: Maybe<Scalars['FuzzyDateInt']>
  endDate_lesser: Maybe<Scalars['FuzzyDateInt']>
  endDate_like: Maybe<Scalars['String']>
  format_in: Maybe<Array<Maybe<MediaFormat>>>
  format_not: Maybe<MediaFormat>
  format_not_in: Maybe<Array<Maybe<MediaFormat>>>
  status_in: Maybe<Array<Maybe<MediaStatus>>>
  status_not: Maybe<MediaStatus>
  status_not_in: Maybe<Array<Maybe<MediaStatus>>>
  episodes_greater: Maybe<Scalars['Int']>
  episodes_lesser: Maybe<Scalars['Int']>
  duration_greater: Maybe<Scalars['Int']>
  duration_lesser: Maybe<Scalars['Int']>
  chapters_greater: Maybe<Scalars['Int']>
  chapters_lesser: Maybe<Scalars['Int']>
  volumes_greater: Maybe<Scalars['Int']>
  volumes_lesser: Maybe<Scalars['Int']>
  genre_in: Maybe<Array<Maybe<Scalars['String']>>>
  genre_not_in: Maybe<Array<Maybe<Scalars['String']>>>
  tag_in: Maybe<Array<Maybe<Scalars['String']>>>
  tag_not_in: Maybe<Array<Maybe<Scalars['String']>>>
  tagCategory_in: Maybe<Array<Maybe<Scalars['String']>>>
  tagCategory_not_in: Maybe<Array<Maybe<Scalars['String']>>>
  licensedBy_in: Maybe<Array<Maybe<Scalars['String']>>>
  averageScore_not: Maybe<Scalars['Int']>
  averageScore_greater: Maybe<Scalars['Int']>
  averageScore_lesser: Maybe<Scalars['Int']>
  popularity_not: Maybe<Scalars['Int']>
  popularity_greater: Maybe<Scalars['Int']>
  popularity_lesser: Maybe<Scalars['Int']>
  source_in: Maybe<Array<Maybe<MediaSource>>>
  sort: Maybe<Array<Maybe<MediaSort>>>
}

/** Page of data (Used for internal use only) */
export type InternalPageCharactersArgs = {
  id: Maybe<Scalars['Int']>
  search: Maybe<Scalars['String']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  sort: Maybe<Array<Maybe<CharacterSort>>>
}

/** Page of data (Used for internal use only) */
export type InternalPageStaffArgs = {
  id: Maybe<Scalars['Int']>
  search: Maybe<Scalars['String']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  sort: Maybe<Array<Maybe<StaffSort>>>
}

/** Page of data (Used for internal use only) */
export type InternalPageStudiosArgs = {
  id: Maybe<Scalars['Int']>
  search: Maybe<Scalars['String']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  sort: Maybe<Array<Maybe<StudioSort>>>
}

/** Page of data (Used for internal use only) */
export type InternalPageMediaListArgs = {
  id: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  userName: Maybe<Scalars['String']>
  type: Maybe<MediaType>
  status: Maybe<MediaListStatus>
  mediaId: Maybe<Scalars['Int']>
  isFollowing: Maybe<Scalars['Boolean']>
  notes: Maybe<Scalars['String']>
  startedAt: Maybe<Scalars['FuzzyDateInt']>
  completedAt: Maybe<Scalars['FuzzyDateInt']>
  compareWithAuthList: Maybe<Scalars['Boolean']>
  userId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  status_in: Maybe<Array<Maybe<MediaListStatus>>>
  status_not_in: Maybe<Array<Maybe<MediaListStatus>>>
  status_not: Maybe<MediaListStatus>
  mediaId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  notes_like: Maybe<Scalars['String']>
  startedAt_greater: Maybe<Scalars['FuzzyDateInt']>
  startedAt_lesser: Maybe<Scalars['FuzzyDateInt']>
  startedAt_like: Maybe<Scalars['String']>
  completedAt_greater: Maybe<Scalars['FuzzyDateInt']>
  completedAt_lesser: Maybe<Scalars['FuzzyDateInt']>
  completedAt_like: Maybe<Scalars['String']>
  sort: Maybe<Array<Maybe<MediaListSort>>>
}

/** Page of data (Used for internal use only) */
export type InternalPageAiringSchedulesArgs = {
  id: Maybe<Scalars['Int']>
  mediaId: Maybe<Scalars['Int']>
  episode: Maybe<Scalars['Int']>
  airingAt: Maybe<Scalars['Int']>
  notYetAired: Maybe<Scalars['Boolean']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not: Maybe<Scalars['Int']>
  mediaId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  episode_not: Maybe<Scalars['Int']>
  episode_in: Maybe<Array<Maybe<Scalars['Int']>>>
  episode_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  episode_greater: Maybe<Scalars['Int']>
  episode_lesser: Maybe<Scalars['Int']>
  airingAt_greater: Maybe<Scalars['Int']>
  airingAt_lesser: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<AiringSort>>>
}

/** Page of data (Used for internal use only) */
export type InternalPageMediaTrendsArgs = {
  mediaId: Maybe<Scalars['Int']>
  date: Maybe<Scalars['Int']>
  trending: Maybe<Scalars['Int']>
  averageScore: Maybe<Scalars['Int']>
  popularity: Maybe<Scalars['Int']>
  episode: Maybe<Scalars['Int']>
  releasing: Maybe<Scalars['Boolean']>
  mediaId_not: Maybe<Scalars['Int']>
  mediaId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  date_greater: Maybe<Scalars['Int']>
  date_lesser: Maybe<Scalars['Int']>
  trending_greater: Maybe<Scalars['Int']>
  trending_lesser: Maybe<Scalars['Int']>
  trending_not: Maybe<Scalars['Int']>
  averageScore_greater: Maybe<Scalars['Int']>
  averageScore_lesser: Maybe<Scalars['Int']>
  averageScore_not: Maybe<Scalars['Int']>
  popularity_greater: Maybe<Scalars['Int']>
  popularity_lesser: Maybe<Scalars['Int']>
  popularity_not: Maybe<Scalars['Int']>
  episode_greater: Maybe<Scalars['Int']>
  episode_lesser: Maybe<Scalars['Int']>
  episode_not: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<MediaTrendSort>>>
}

/** Page of data (Used for internal use only) */
export type InternalPageNotificationsArgs = {
  type: Maybe<NotificationType>
  resetNotificationCount: Maybe<Scalars['Boolean']>
  type_in: Maybe<Array<Maybe<NotificationType>>>
}

/** Page of data (Used for internal use only) */
export type InternalPageFollowersArgs = {
  userId: Scalars['Int']
  sort: Maybe<Array<Maybe<UserSort>>>
}

/** Page of data (Used for internal use only) */
export type InternalPageFollowingArgs = {
  userId: Scalars['Int']
  sort: Maybe<Array<Maybe<UserSort>>>
}

/** Page of data (Used for internal use only) */
export type InternalPageActivitiesArgs = {
  id: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  messengerId: Maybe<Scalars['Int']>
  mediaId: Maybe<Scalars['Int']>
  type: Maybe<ActivityType>
  isFollowing: Maybe<Scalars['Boolean']>
  hasReplies: Maybe<Scalars['Boolean']>
  hasRepliesOrTypeText: Maybe<Scalars['Boolean']>
  createdAt: Maybe<Scalars['Int']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  userId_not: Maybe<Scalars['Int']>
  userId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  userId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  messengerId_not: Maybe<Scalars['Int']>
  messengerId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  messengerId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not: Maybe<Scalars['Int']>
  mediaId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  type_not: Maybe<ActivityType>
  type_in: Maybe<Array<Maybe<ActivityType>>>
  type_not_in: Maybe<Array<Maybe<ActivityType>>>
  createdAt_greater: Maybe<Scalars['Int']>
  createdAt_lesser: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<ActivitySort>>>
}

/** Page of data (Used for internal use only) */
export type InternalPageActivityRepliesArgs = {
  id: Maybe<Scalars['Int']>
  activityId: Maybe<Scalars['Int']>
}

/** Page of data (Used for internal use only) */
export type InternalPageThreadsArgs = {
  id: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  replyUserId: Maybe<Scalars['Int']>
  subscribed: Maybe<Scalars['Boolean']>
  categoryId: Maybe<Scalars['Int']>
  mediaCategoryId: Maybe<Scalars['Int']>
  search: Maybe<Scalars['String']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  sort: Maybe<Array<Maybe<ThreadSort>>>
}

/** Page of data (Used for internal use only) */
export type InternalPageThreadCommentsArgs = {
  id: Maybe<Scalars['Int']>
  threadId: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<ThreadCommentSort>>>
}

/** Page of data (Used for internal use only) */
export type InternalPageReviewsArgs = {
  id: Maybe<Scalars['Int']>
  mediaId: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  mediaType: Maybe<MediaType>
  sort: Maybe<Array<Maybe<ReviewSort>>>
}

/** Types that can be liked */
export enum LikeableType {
  Thread = 'THREAD',
  ThreadComment = 'THREAD_COMMENT',
  Activity = 'ACTIVITY',
  ActivityReply = 'ACTIVITY_REPLY',
}

/** User list activity (anime & manga updates) */
export type ListActivity = {
  __typename?: 'ListActivity'
  /** The id of the activity */
  id: Scalars['Int']
  /** The user id of the activity's creator */
  userId: Maybe<Scalars['Int']>
  /** The type of activity */
  type: Maybe<ActivityType>
  /** The number of activity replies */
  replyCount: Scalars['Int']
  /** The list item's textual status */
  status: Maybe<Scalars['String']>
  /** The list progress made */
  progress: Maybe<Scalars['String']>
  /** If the activity is locked and can receive replies */
  isLocked: Maybe<Scalars['Boolean']>
  /** The url for the activity page on the AniList website */
  siteUrl: Maybe<Scalars['String']>
  /** The time the activity was created at */
  createdAt: Scalars['Int']
  /** The owner of the activity */
  user: Maybe<User>
  /** The associated media to the activity update */
  media: Maybe<Media>
  /** The written replies to the activity */
  replies: Maybe<Array<Maybe<ActivityReply>>>
  /** The users who liked the activity */
  likes: Maybe<Array<Maybe<User>>>
}

export type ListEntry = {
  __typename?: 'ListEntry'
  /** Entry ID in service */
  id: Scalars['Int']
  /** Anime AniList ID */
  mediaId: Scalars['Int']
  /** AniList Anime */
  media: Media
  /** Status converted to AniList status */
  status: MediaListStatus
  /** Score formatted as 0-100 */
  score: Maybe<Scalars['Int']>
  /**
   * Progress in episodes
   * Not started = 0
   **/
  progress: Scalars['Int']
  /** Times rewatched */
  rewatched: Scalars['Int']
}

/** User's list score statistics */
export type ListScoreStats = {
  __typename?: 'ListScoreStats'
  meanScore: Maybe<Scalars['Int']>
  standardDeviation: Maybe<Scalars['Int']>
}

/** Anime or Manga */
export type Media = {
  __typename?: 'Media'
  /** The id of the media */
  id: Scalars['Int']
  /** The mal id of the media */
  idMal: Maybe<Scalars['Int']>
  /** The official titles of the media in various languages */
  title: Maybe<MediaTitle>
  /** The type of the media; anime or manga */
  type: Maybe<MediaType>
  /** The format the media was released in */
  format: Maybe<MediaFormat>
  /** The current releasing status of the media */
  status: Maybe<MediaStatus>
  /** Short description of the media's story and characters */
  description: Maybe<Scalars['String']>
  /** The first official release date of the media */
  startDate: Maybe<FuzzyDate>
  /** The last official release date of the media */
  endDate: Maybe<FuzzyDate>
  /** The year & season the media was initially released in */
  season: Maybe<MediaSeason>
  /** The year & season the media was initially released in */
  seasonInt: Maybe<Scalars['Int']>
  /** The amount of episodes the anime has when complete */
  episodes: Maybe<Scalars['Int']>
  /** The general length of each anime episode in minutes */
  duration: Maybe<Scalars['Int']>
  /** The amount of chapters the manga has when complete */
  chapters: Maybe<Scalars['Int']>
  /** The amount of volumes the manga has when complete */
  volumes: Maybe<Scalars['Int']>
  /** Where the media was created. (ISO 3166-1 alpha-2) */
  countryOfOrigin: Maybe<Scalars['CountryCode']>
  /** If the media is officially licensed or a self-published doujin release */
  isLicensed: Maybe<Scalars['Boolean']>
  /** Source type the media was adapted from. */
  source: Maybe<MediaSource>
  /** Official Twitter hashtags for the media */
  hashtag: Maybe<Scalars['String']>
  /** Media trailer or advertisement */
  trailer: Maybe<MediaTrailer>
  /** When the media's data was last updated */
  updatedAt: Maybe<Scalars['Int']>
  /** The cover images of the media */
  coverImage: Maybe<MediaCoverImage>
  /** The banner image of the media */
  bannerImage: Maybe<Scalars['String']>
  /** The genres of the media */
  genres: Maybe<Array<Maybe<Scalars['String']>>>
  /** Alternative titles of the media */
  synonyms: Maybe<Array<Maybe<Scalars['String']>>>
  /** A weighted average score of all the user's scores of the media */
  averageScore: Maybe<Scalars['Int']>
  /** Mean score of all the user's scores of the media */
  meanScore: Maybe<Scalars['Int']>
  /** The number of users with the media on their list */
  popularity: Maybe<Scalars['Int']>
  /** Locked media may not be added to lists our favorited. This may be due to the entry pending for deletion or other reasons. */
  isLocked: Maybe<Scalars['Boolean']>
  /** The amount of related activity in the past hour */
  trending: Maybe<Scalars['Int']>
  /** The amount of user's who have favourited the media */
  favourites: Maybe<Scalars['Int']>
  /** List of tags that describes elements and themes of the media */
  tags: Maybe<Array<Maybe<MediaTag>>>
  /** Other media in the same or connecting franchise */
  relations: Maybe<MediaConnection>
  /** The characters in the media */
  characters: Maybe<CharacterConnection>
  /** The staff who produced the media */
  staff: Maybe<StaffConnection>
  /** The companies who produced the media */
  studios: Maybe<StudioConnection>
  /** If the media is marked as favourite by the current authenticated user */
  isFavourite: Scalars['Boolean']
  /** If the media is intended only for 18+ adult audiences */
  isAdult: Maybe<Scalars['Boolean']>
  /** The media's next episode airing schedule */
  nextAiringEpisode: Maybe<AiringSchedule>
  /** The media's entire airing schedule */
  airingSchedule: Maybe<AiringScheduleConnection>
  /** The media's daily trend stats */
  trends: Maybe<MediaTrendConnection>
  /** External links to another site related to the media */
  externalLinks: Maybe<Array<Maybe<MediaExternalLink>>>
  /** Data and links to legal streaming episodes on external sites */
  streamingEpisodes: Maybe<Array<Maybe<MediaStreamingEpisode>>>
  /** The ranking of the media in a particular time span and format compared to other media */
  rankings: Maybe<Array<Maybe<MediaRank>>>
  /** The authenticated user's media list entry for the media */
  mediaListEntry: Maybe<MediaList>
  /** User reviews of the media */
  reviews: Maybe<ReviewConnection>
  stats: Maybe<MediaStats>
  /** The url for the media page on the AniList website */
  siteUrl: Maybe<Scalars['String']>
  /** If the media should have forum thread automatically created for it on airing episode release */
  autoCreateForumThread: Maybe<Scalars['Boolean']>
  /** Notes for site moderators */
  modNotes: Maybe<Scalars['String']>
  scoreMal: Maybe<Scalars['Int']>
  scoreSimkl: Maybe<Scalars['Int']>
  linkSimkl: Maybe<Scalars['String']>
  listEntry: Maybe<ListEntry>
}

/** Anime or Manga */
export type MediaDescriptionArgs = {
  asHtml: Maybe<Scalars['Boolean']>
}

/** Anime or Manga */
export type MediaSourceArgs = {
  version: Maybe<Scalars['Int']>
}

/** Anime or Manga */
export type MediaCharactersArgs = {
  sort: Maybe<Array<Maybe<CharacterSort>>>
  role: Maybe<CharacterRole>
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

/** Anime or Manga */
export type MediaStaffArgs = {
  sort: Maybe<Array<Maybe<StaffSort>>>
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

/** Anime or Manga */
export type MediaStudiosArgs = {
  sort: Maybe<Array<Maybe<StudioSort>>>
  isMain: Maybe<Scalars['Boolean']>
}

/** Anime or Manga */
export type MediaAiringScheduleArgs = {
  notYetAired: Maybe<Scalars['Boolean']>
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

/** Anime or Manga */
export type MediaTrendsArgs = {
  sort: Maybe<Array<Maybe<MediaTrendSort>>>
  releasing: Maybe<Scalars['Boolean']>
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

/** Anime or Manga */
export type MediaReviewsArgs = {
  limit: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<ReviewSort>>>
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

/** Internal - Media characters separated */
export type MediaCharacter = {
  __typename?: 'MediaCharacter'
  /** The id of the connection */
  id: Maybe<Scalars['Int']>
  /** The characters role in the media */
  role: Maybe<CharacterRole>
  /** The characters in the media voiced by the parent actor */
  character: Maybe<Character>
  /** The voice actor of the character */
  voiceActor: Maybe<Staff>
}

export type MediaConnection = {
  __typename?: 'MediaConnection'
  edges: Maybe<Array<Maybe<MediaEdge>>>
  nodes: Maybe<Array<Maybe<Media>>>
  /** The pagination information */
  pageInfo: Maybe<PageInfo>
}

export type MediaCoverImage = {
  __typename?: 'MediaCoverImage'
  /** The cover image url of the media at its largest size. If this size isn't available, large will be provided instead. */
  extraLarge: Maybe<Scalars['String']>
  /** The cover image url of the media at a large size */
  large: Maybe<Scalars['String']>
  /** The cover image url of the media at medium size */
  medium: Maybe<Scalars['String']>
  /** Average #hex color of cover image */
  color: Maybe<Scalars['String']>
}

/** Media connection edge */
export type MediaEdge = {
  __typename?: 'MediaEdge'
  node: Maybe<Media>
  /** The id of the connection */
  id: Maybe<Scalars['Int']>
  /** The type of relation to the parent model */
  relationType: Maybe<MediaRelation>
  /** If the studio is the main animation studio of the media (For Studio->MediaConnection field only) */
  isMainStudio: Scalars['Boolean']
  /** The characters in the media voiced by the parent actor */
  characters: Maybe<Array<Maybe<Character>>>
  /** The characters role in the media */
  characterRole: Maybe<CharacterRole>
  /** The role of the staff member in the production of the media */
  staffRole: Maybe<Scalars['String']>
  /** The voice actors of the character */
  voiceActors: Maybe<Array<Maybe<Staff>>>
  /** The order the media should be displayed from the users favourites */
  favouriteOrder: Maybe<Scalars['Int']>
}

/** Media connection edge */
export type MediaEdgeRelationTypeArgs = {
  version: Maybe<Scalars['Int']>
}

/** Media connection edge */
export type MediaEdgeVoiceActorsArgs = {
  language: Maybe<StaffLanguage>
  sort: Maybe<Array<Maybe<StaffSort>>>
}

/** An external link to another site related to the media */
export type MediaExternalLink = {
  __typename?: 'MediaExternalLink'
  /** The id of the external link */
  id: Scalars['Int']
  /** The url of the external link */
  url: Scalars['String']
  /** The site location of the external link */
  site: Scalars['String']
}

/** An external link to another site related to the media */
export type MediaExternalLinkInput = {
  /** The id of the external link */
  id: Scalars['Int']
  /** The url of the external link */
  url: Scalars['String']
  /** The site location of the external link */
  site: Scalars['String']
}

/** The format the media was released in */
export enum MediaFormat {
  /** Anime broadcast on television */
  Tv = 'TV',
  /** Anime which are under 15 minutes in length and broadcast on television */
  TvShort = 'TV_SHORT',
  /** Anime movies with a theatrical release */
  Movie = 'MOVIE',
  /** Special episodes that have been included in DVD/Blu-ray releases, picture dramas, pilots, etc */
  Special = 'SPECIAL',
  /**
   * (Original Video Animation) Anime that have been released directly on
   * DVD/Blu-ray without originally going through a theatrical release or
   * television broadcast
   **/
  Ova = 'OVA',
  /** (Original Net Animation) Anime that have been originally released online or are only available through streaming services. */
  Ona = 'ONA',
  /** Short anime released as a music video */
  Music = 'MUSIC',
  /** Professionally published manga with more than one chapter */
  Manga = 'MANGA',
  /** Written books released as a series of light novels */
  Novel = 'NOVEL',
  /** Manga with just one chapter */
  OneShot = 'ONE_SHOT',
}

/** List of anime or manga */
export type MediaList = {
  __typename?: 'MediaList'
  /** The id of the list entry */
  id: Scalars['Int']
  /** The id of the user owner of the list entry */
  userId: Scalars['Int']
  /** The id of the media */
  mediaId: Scalars['Int']
  /** The watching/reading status */
  status: Maybe<MediaListStatus>
  /** The score of the entry */
  score: Maybe<Scalars['Float']>
  /** The amount of episodes/chapters consumed by the user */
  progress: Maybe<Scalars['Int']>
  /** The amount of volumes read by the user */
  progressVolumes: Maybe<Scalars['Int']>
  /** The amount of times the user has rewatched/read the media */
  repeat: Maybe<Scalars['Int']>
  /** Priority of planning */
  priority: Maybe<Scalars['Int']>
  /** If the entry should only be visible to authenticated user */
  private: Maybe<Scalars['Boolean']>
  /** Text notes */
  notes: Maybe<Scalars['String']>
  /** If the entry shown be hidden from non-custom lists */
  hiddenFromStatusLists: Maybe<Scalars['Boolean']>
  /** Map of booleans for which custom lists the entry are in */
  customLists: Maybe<Scalars['Json']>
  /** Map of advanced scores with name keys */
  advancedScores: Maybe<Scalars['Json']>
  /** When the entry was started by the user */
  startedAt: Maybe<FuzzyDate>
  /** When the entry was completed by the user */
  completedAt: Maybe<FuzzyDate>
  /** When the entry data was last updated */
  updatedAt: Maybe<Scalars['Int']>
  /** When the entry data was created */
  createdAt: Maybe<Scalars['Int']>
  media: Maybe<Media>
  user: Maybe<User>
}

/** List of anime or manga */
export type MediaListScoreArgs = {
  format: Maybe<ScoreFormat>
}

/** List of anime or manga */
export type MediaListCustomListsArgs = {
  asArray: Maybe<Scalars['Boolean']>
}

/** List of anime or manga */
export type MediaListCollection = {
  __typename?: 'MediaListCollection'
  /** Grouped media list entries */
  lists: Maybe<Array<Maybe<MediaListGroup>>>
  /** The owner of the list */
  user: Maybe<User>
  /** If there is another chunk */
  hasNextChunk: Maybe<Scalars['Boolean']>
  /** A map of media list entry arrays grouped by status */
  statusLists: Maybe<Array<Maybe<Array<Maybe<MediaList>>>>>
  /** A map of media list entry arrays grouped by custom lists */
  customLists: Maybe<Array<Maybe<Array<Maybe<MediaList>>>>>
}

/** List of anime or manga */
export type MediaListCollectionStatusListsArgs = {
  asArray: Maybe<Scalars['Boolean']>
}

/** List of anime or manga */
export type MediaListCollectionCustomListsArgs = {
  asArray: Maybe<Scalars['Boolean']>
}

/** List group of anime or manga entries */
export type MediaListGroup = {
  __typename?: 'MediaListGroup'
  /** Media list entries */
  entries: Maybe<Array<Maybe<MediaList>>>
  name: Maybe<Scalars['String']>
  isCustomList: Maybe<Scalars['Boolean']>
  isSplitCompletedList: Maybe<Scalars['Boolean']>
  status: Maybe<MediaListStatus>
}

/** A user's list options */
export type MediaListOptions = {
  __typename?: 'MediaListOptions'
  /** The score format the user is using for media lists */
  scoreFormat: Maybe<ScoreFormat>
  /** The default order list rows should be displayed in */
  rowOrder: Maybe<Scalars['String']>
  /** (Site only) If the user should be using legacy css-supporting list versions */
  useLegacyLists: Maybe<Scalars['Boolean']>
  /** The user's anime list options */
  animeList: Maybe<MediaListTypeOptions>
  /** The user's manga list options */
  mangaList: Maybe<MediaListTypeOptions>
  /** The list theme options for both lists */
  sharedTheme: Maybe<Scalars['Json']>
  /** If the shared theme should be used instead of the individual list themes */
  sharedThemeEnabled: Maybe<Scalars['Boolean']>
}

/** A user's list options for anime or manga lists */
export type MediaListOptionsInput = {
  /** The order each list should be displayed in */
  sectionOrder: Maybe<Array<Maybe<Scalars['String']>>>
  /** If the completed sections of the list should be separated by format */
  splitCompletedSectionByFormat: Maybe<Scalars['Boolean']>
  /** The names of the user's custom lists */
  customLists: Maybe<Array<Maybe<Scalars['String']>>>
  /** The names of the user's advanced scoring sections */
  advancedScoring: Maybe<Array<Maybe<Scalars['String']>>>
  /** If advanced scoring is enabled */
  advancedScoringEnabled: Maybe<Scalars['Boolean']>
  /** list theme */
  theme: Maybe<Scalars['String']>
}

/** Media list sort enums */
export enum MediaListSort {
  MediaId = 'MEDIA_ID',
  MediaIdDesc = 'MEDIA_ID_DESC',
  Score = 'SCORE',
  ScoreDesc = 'SCORE_DESC',
  Status = 'STATUS',
  StatusDesc = 'STATUS_DESC',
  Progress = 'PROGRESS',
  ProgressDesc = 'PROGRESS_DESC',
  ProgressVolumes = 'PROGRESS_VOLUMES',
  ProgressVolumesDesc = 'PROGRESS_VOLUMES_DESC',
  Repeat = 'REPEAT',
  RepeatDesc = 'REPEAT_DESC',
  Priority = 'PRIORITY',
  PriorityDesc = 'PRIORITY_DESC',
  StartedOn = 'STARTED_ON',
  StartedOnDesc = 'STARTED_ON_DESC',
  FinishedOn = 'FINISHED_ON',
  FinishedOnDesc = 'FINISHED_ON_DESC',
  AddedTime = 'ADDED_TIME',
  AddedTimeDesc = 'ADDED_TIME_DESC',
  UpdatedTime = 'UPDATED_TIME',
  UpdatedTimeDesc = 'UPDATED_TIME_DESC',
  MediaTitleRomaji = 'MEDIA_TITLE_ROMAJI',
  MediaTitleRomajiDesc = 'MEDIA_TITLE_ROMAJI_DESC',
  MediaTitleEnglish = 'MEDIA_TITLE_ENGLISH',
  MediaTitleEnglishDesc = 'MEDIA_TITLE_ENGLISH_DESC',
  MediaTitleNative = 'MEDIA_TITLE_NATIVE',
  MediaTitleNativeDesc = 'MEDIA_TITLE_NATIVE_DESC',
  MediaPopularity = 'MEDIA_POPULARITY',
  MediaPopularityDesc = 'MEDIA_POPULARITY_DESC',
}

/** Media list watching/reading status enum. */
export enum MediaListStatus {
  /** Currently watching/reading */
  Current = 'CURRENT',
  /** Planning to watch/read */
  Planning = 'PLANNING',
  /** Finished watching/reading */
  Completed = 'COMPLETED',
  /** Stopped watching/reading before completing */
  Dropped = 'DROPPED',
  /** Paused watching/reading */
  Paused = 'PAUSED',
  /** Re-watching/reading */
  Repeating = 'REPEATING',
}

/** A user's list options for anime or manga lists */
export type MediaListTypeOptions = {
  __typename?: 'MediaListTypeOptions'
  /** The order each list should be displayed in */
  sectionOrder: Maybe<Array<Maybe<Scalars['String']>>>
  /** If the completed sections of the list should be separated by format */
  splitCompletedSectionByFormat: Maybe<Scalars['Boolean']>
  /** The list theme options */
  theme: Maybe<Scalars['Json']>
  /** The names of the user's custom lists */
  customLists: Maybe<Array<Maybe<Scalars['String']>>>
  /** The names of the user's advanced scoring sections */
  advancedScoring: Maybe<Array<Maybe<Scalars['String']>>>
  /** If advanced scoring is enabled */
  advancedScoringEnabled: Maybe<Scalars['Boolean']>
}

/** The ranking of a media in a particular time span and format compared to other media */
export type MediaRank = {
  __typename?: 'MediaRank'
  /** The id of the rank */
  id: Scalars['Int']
  /** The numerical rank of the media */
  rank: Scalars['Int']
  /** The type of ranking */
  type: MediaRankType
  /** The format the media is ranked within */
  format: MediaFormat
  /** The year the media is ranked within */
  year: Maybe<Scalars['Int']>
  /** The season the media is ranked within */
  season: Maybe<MediaSeason>
  /** If the ranking is based on all time instead of a season/year */
  allTime: Maybe<Scalars['Boolean']>
  /** String that gives context to the ranking type and time span */
  context: Scalars['String']
}

/** The type of ranking */
export enum MediaRankType {
  /** Ranking is based on the media's ratings/score */
  Rated = 'RATED',
  /** Ranking is based on the media's popularity */
  Popular = 'POPULAR',
}

/** Type of relation media has to its parent. */
export enum MediaRelation {
  /** An adaption of this media into a different format */
  Adaptation = 'ADAPTATION',
  /** Released before the relation */
  Prequel = 'PREQUEL',
  /** Released after the relation */
  Sequel = 'SEQUEL',
  /** The media a side story is from */
  Parent = 'PARENT',
  /** A side story of the parent media */
  SideStory = 'SIDE_STORY',
  /** Shares at least 1 character */
  Character = 'CHARACTER',
  /** A shortened and summarized version */
  Summary = 'SUMMARY',
  /** An alternative version of the same media */
  Alternative = 'ALTERNATIVE',
  /** An alternative version of the media with a different primary focus */
  SpinOff = 'SPIN_OFF',
  /** Other */
  Other = 'OTHER',
  /** Version 2 only. The source material the media was adapted from */
  Source = 'SOURCE',
  /** Version 2 only. */
  Compilation = 'COMPILATION',
  /** Version 2 only. */
  Contains = 'CONTAINS',
}

export enum MediaSeason {
  /** Months December to February */
  Winter = 'WINTER',
  /** Months March to May */
  Spring = 'SPRING',
  /** Months June to August */
  Summer = 'SUMMER',
  /** Months September to November */
  Fall = 'FALL',
}

/** Media sort enums */
export enum MediaSort {
  Id = 'ID',
  IdDesc = 'ID_DESC',
  TitleRomaji = 'TITLE_ROMAJI',
  TitleRomajiDesc = 'TITLE_ROMAJI_DESC',
  TitleEnglish = 'TITLE_ENGLISH',
  TitleEnglishDesc = 'TITLE_ENGLISH_DESC',
  TitleNative = 'TITLE_NATIVE',
  TitleNativeDesc = 'TITLE_NATIVE_DESC',
  Type = 'TYPE',
  TypeDesc = 'TYPE_DESC',
  Format = 'FORMAT',
  FormatDesc = 'FORMAT_DESC',
  StartDate = 'START_DATE',
  StartDateDesc = 'START_DATE_DESC',
  EndDate = 'END_DATE',
  EndDateDesc = 'END_DATE_DESC',
  Score = 'SCORE',
  ScoreDesc = 'SCORE_DESC',
  Popularity = 'POPULARITY',
  PopularityDesc = 'POPULARITY_DESC',
  Trending = 'TRENDING',
  TrendingDesc = 'TRENDING_DESC',
  Episodes = 'EPISODES',
  EpisodesDesc = 'EPISODES_DESC',
  Duration = 'DURATION',
  DurationDesc = 'DURATION_DESC',
  Status = 'STATUS',
  StatusDesc = 'STATUS_DESC',
  Chapters = 'CHAPTERS',
  ChaptersDesc = 'CHAPTERS_DESC',
  Volumes = 'VOLUMES',
  VolumesDesc = 'VOLUMES_DESC',
  UpdatedAt = 'UPDATED_AT',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  SearchMatch = 'SEARCH_MATCH',
  Favourites = 'FAVOURITES',
  FavouritesDesc = 'FAVOURITES_DESC',
}

/** Source type the media was adapted from */
export enum MediaSource {
  /** An original production not based of another work */
  Original = 'ORIGINAL',
  /** Asian comic book */
  Manga = 'MANGA',
  /** Written work published in volumes */
  LightNovel = 'LIGHT_NOVEL',
  /** Video game driven primary by text and narrative */
  VisualNovel = 'VISUAL_NOVEL',
  /** Video game */
  VideoGame = 'VIDEO_GAME',
  /** Other */
  Other = 'OTHER',
  /** Version 2 only. Written works not published in volumes */
  Novel = 'NOVEL',
  /** Version 2 only. Self-published works */
  Doujinshi = 'DOUJINSHI',
  /** Version 2 only. Japanese Anime */
  Anime = 'ANIME',
}

/** A media's statistics */
export type MediaStats = {
  __typename?: 'MediaStats'
  scoreDistribution: Maybe<Array<Maybe<ScoreDistribution>>>
  statusDistribution: Maybe<Array<Maybe<StatusDistribution>>>
  airingProgression: Maybe<Array<Maybe<AiringProgression>>>
}

/** The current releasing status of the media */
export enum MediaStatus {
  /** Has completed and is no longer being released */
  Finished = 'FINISHED',
  /** Currently releasing */
  Releasing = 'RELEASING',
  /** To be released at a later date */
  NotYetReleased = 'NOT_YET_RELEASED',
  /** Ended before the work could be finished */
  Cancelled = 'CANCELLED',
}

/** Data and links to legal streaming episodes on external sites */
export type MediaStreamingEpisode = {
  __typename?: 'MediaStreamingEpisode'
  /** Title of the episode */
  title: Maybe<Scalars['String']>
  /** Url of episode image thumbnail */
  thumbnail: Maybe<Scalars['String']>
  /** The url of the episode */
  url: Maybe<Scalars['String']>
  /** The site location of the streaming episodes */
  site: Maybe<Scalars['String']>
}

/** Media submission */
export type MediaSubmission = {
  __typename?: 'MediaSubmission'
  /** The id of the submission */
  id: Scalars['Int']
  /** User submitter of the submission */
  submitter: Maybe<User>
  /** Status of the submission */
  status: Maybe<SubmissionStatus>
  submitterStats: Maybe<Scalars['Json']>
  notes: Maybe<Scalars['String']>
  source: Maybe<Scalars['String']>
  changes: Maybe<Array<Maybe<Scalars['String']>>>
  media: Maybe<Media>
  submission: Maybe<Media>
  characters: Maybe<Array<Maybe<MediaSubmissionComparison>>>
  staff: Maybe<Array<Maybe<MediaSubmissionComparison>>>
  studios: Maybe<Array<Maybe<MediaSubmissionComparison>>>
  relations: Maybe<Array<Maybe<MediaEdge>>>
  externalLinks: Maybe<Array<Maybe<MediaExternalLink>>>
  createdAt: Maybe<Scalars['Int']>
}

/** Media submission with comparison to current data */
export type MediaSubmissionComparison = {
  __typename?: 'MediaSubmissionComparison'
  submission: Maybe<MediaSubmissionEdge>
  character: Maybe<MediaCharacter>
  staff: Maybe<StaffEdge>
  studio: Maybe<StudioEdge>
}

export type MediaSubmissionEdge = {
  __typename?: 'MediaSubmissionEdge'
  /** The id of the direct submission */
  id: Maybe<Scalars['Int']>
  characterRole: Maybe<CharacterRole>
  staffRole: Maybe<Scalars['String']>
  isMain: Maybe<Scalars['Boolean']>
  character: Maybe<Character>
  characterSubmission: Maybe<Character>
  voiceActor: Maybe<Staff>
  voiceActorSubmission: Maybe<Staff>
  staff: Maybe<Staff>
  staffSubmission: Maybe<Staff>
  studio: Maybe<Studio>
  media: Maybe<Media>
}

/** A tag that describes a theme or element of the media */
export type MediaTag = {
  __typename?: 'MediaTag'
  /** The id of the tag */
  id: Scalars['Int']
  /** The name of the tag */
  name: Scalars['String']
  /** A general description of the tag */
  description: Maybe<Scalars['String']>
  /** The categories of tags this tag belongs to */
  category: Maybe<Scalars['String']>
  /** The relevance ranking of the tag out of the 100 for this media */
  rank: Maybe<Scalars['Int']>
  /** If the tag could be a spoiler for any media */
  isGeneralSpoiler: Maybe<Scalars['Boolean']>
  /** If the tag is a spoiler for this media */
  isMediaSpoiler: Maybe<Scalars['Boolean']>
  /** If the tag is only for adult 18+ media */
  isAdult: Maybe<Scalars['Boolean']>
}

/** The official titles of the media in various languages */
export type MediaTitle = {
  __typename?: 'MediaTitle'
  /** The romanization of the native language title */
  romaji: Maybe<Scalars['String']>
  /** The official english title */
  english: Maybe<Scalars['String']>
  /** Official title in it's native language */
  native: Maybe<Scalars['String']>
  /** The currently authenticated users preferred title language. Default romaji for non-authenticated */
  userPreferred: Maybe<Scalars['String']>
}

/** The official titles of the media in various languages */
export type MediaTitleRomajiArgs = {
  stylised: Maybe<Scalars['Boolean']>
}

/** The official titles of the media in various languages */
export type MediaTitleEnglishArgs = {
  stylised: Maybe<Scalars['Boolean']>
}

/** The official titles of the media in various languages */
export type MediaTitleNativeArgs = {
  stylised: Maybe<Scalars['Boolean']>
}

/** The official titles of the media in various languages */
export type MediaTitleInput = {
  /** The romanization of the native language title */
  romaji: Maybe<Scalars['String']>
  /** The official english title */
  english: Maybe<Scalars['String']>
  /** Official title in it's native language */
  native: Maybe<Scalars['String']>
}

/** Media trailer or advertisement */
export type MediaTrailer = {
  __typename?: 'MediaTrailer'
  /** The trailer video id */
  id: Maybe<Scalars['String']>
  /** The site the video is hosted by (Currently either youtube or dailymotion) */
  site: Maybe<Scalars['String']>
  /** The url for the thumbnail image of the video */
  thumbnail: Maybe<Scalars['String']>
}

/** Daily media statistics */
export type MediaTrend = {
  __typename?: 'MediaTrend'
  /** The id of the tag */
  mediaId: Scalars['Int']
  /** The day the data was recorded (timestamp) */
  date: Scalars['Int']
  /** The amount of media activity on the day */
  trending: Scalars['Int']
  /** A weighted average score of all the user's scores of the media */
  averageScore: Maybe<Scalars['Int']>
  /** The number of users with the media on their list */
  popularity: Maybe<Scalars['Int']>
  /** The number of users with watching/reading the media */
  inProgress: Maybe<Scalars['Int']>
  /** If the media was being released at this time */
  releasing: Scalars['Boolean']
  /** The episode number of the anime released on this day */
  episode: Maybe<Scalars['Int']>
  /** The related media */
  media: Maybe<Media>
}

export type MediaTrendConnection = {
  __typename?: 'MediaTrendConnection'
  edges: Maybe<Array<Maybe<MediaTrendEdge>>>
  nodes: Maybe<Array<Maybe<MediaTrend>>>
  /** The pagination information */
  pageInfo: Maybe<PageInfo>
}

/** Media trend connection edge */
export type MediaTrendEdge = {
  __typename?: 'MediaTrendEdge'
  node: Maybe<MediaTrend>
}

/** Media trend sort enums */
export enum MediaTrendSort {
  Id = 'ID',
  IdDesc = 'ID_DESC',
  MediaId = 'MEDIA_ID',
  MediaIdDesc = 'MEDIA_ID_DESC',
  Date = 'DATE',
  DateDesc = 'DATE_DESC',
  Score = 'SCORE',
  ScoreDesc = 'SCORE_DESC',
  Popularity = 'POPULARITY',
  PopularityDesc = 'POPULARITY_DESC',
  Trending = 'TRENDING',
  TrendingDesc = 'TRENDING_DESC',
  Episode = 'EPISODE',
  EpisodeDesc = 'EPISODE_DESC',
}

/** Media type enum, anime or manga. */
export enum MediaType {
  /** Japanese Anime */
  Anime = 'ANIME',
  /** Asian comic */
  Manga = 'MANGA',
}

/** User message activity */
export type MessageActivity = {
  __typename?: 'MessageActivity'
  /** The id of the activity */
  id: Scalars['Int']
  /** The user id of the activity's recipient */
  recipientId: Maybe<Scalars['Int']>
  /** The user id of the activity's sender */
  messengerId: Maybe<Scalars['Int']>
  /** The type of the activity */
  type: Maybe<ActivityType>
  /** The number of activity replies */
  replyCount: Scalars['Int']
  /** The message text (Markdown) */
  message: Maybe<Scalars['String']>
  /** If the activity is locked and can receive replies */
  isLocked: Maybe<Scalars['Boolean']>
  /** The url for the activity page on the AniList website */
  siteUrl: Maybe<Scalars['String']>
  /** The time the activity was created at */
  createdAt: Scalars['Int']
  /** The user who the activity message was sent to */
  recipient: Maybe<User>
  /** The user who sent the activity message */
  messenger: Maybe<User>
  /** The written replies to the activity */
  replies: Maybe<Array<Maybe<ActivityReply>>>
  /** The users who liked the activity */
  likes: Maybe<Array<Maybe<User>>>
}

/** User message activity */
export type MessageActivityMessageArgs = {
  asHtml: Maybe<Scalars['Boolean']>
}

export type ModAction = {
  __typename?: 'ModAction'
  /** The id of the action */
  id: Scalars['Int']
  user: Maybe<User>
  mod: Maybe<User>
  type: Maybe<ModActionType>
  objectId: Maybe<Scalars['Int']>
  objectType: Maybe<Scalars['String']>
  data: Maybe<Scalars['String']>
  createdAt: Scalars['Int']
}

export enum ModActionType {
  Note = 'NOTE',
  Ban = 'BAN',
  Delete = 'DELETE',
  Edit = 'EDIT',
  Expire = 'EXPIRE',
  Report = 'REPORT',
  Reset = 'RESET',
}

export type Mutation = {
  __typename?: 'Mutation'
  UpdateUser: Maybe<User>
  /** Create or update a media list entry */
  SaveMediaListEntry: Maybe<MediaList>
  /** Update multiple media list entries to the same values */
  UpdateMediaListEntries: Maybe<Array<Maybe<MediaList>>>
  /** Delete a media list entry */
  DeleteMediaListEntry: Maybe<Deleted>
  /** Delete a custom list and remove the list entries from it */
  DeleteCustomList: Maybe<Deleted>
  /** Create or update text activity for the currently authenticated user */
  SaveTextActivity: Maybe<TextActivity>
  /** Create or update message activity for the currently authenticated user */
  SaveMessageActivity: Maybe<MessageActivity>
  /** Update list activity (Mod Only) */
  SaveListActivity: Maybe<ListActivity>
  /** Delete an activity item of the authenticated users */
  DeleteActivity: Maybe<Deleted>
  /** Create or update an activity reply */
  SaveActivityReply: Maybe<ActivityReply>
  /** Delete an activity reply of the authenticated users */
  DeleteActivityReply: Maybe<Deleted>
  /**
   * Add or remove a like from a likeable type.
   *                           Returns all the users who liked the same model
   **/
  ToggleLike: Maybe<Array<Maybe<User>>>
  /** Toggle the un/following of a user */
  ToggleFollow: Maybe<User>
  /** Favourite or unfavourite an anime, manga, character, staff member, or studio */
  ToggleFavourite: Maybe<Favourites>
  /** Update the order favourites are displayed in */
  UpdateFavouriteOrder: Maybe<Favourites>
  /** Create or update a review */
  SaveReview: Maybe<Review>
  /** Delete a review */
  DeleteReview: Maybe<Deleted>
  /** Rate a review */
  RateReview: Maybe<Review>
  /** Create or update a forum thread */
  SaveThread: Maybe<Thread>
  /** Delete a thread */
  DeleteThread: Maybe<Deleted>
  /** Toggle the subscription of a forum thread */
  ToggleThreadSubscription: Maybe<Thread>
  /** Create or update a thread comment */
  SaveThreadComment: Maybe<ThreadComment>
  /** Delete a thread comment */
  DeleteThreadComment: Maybe<Deleted>
  UpdateAniChartSettings: Maybe<Scalars['Json']>
  UpdateAniChartHighlights: Maybe<Scalars['Json']>
  CacheEpisodes: Scalars['Boolean']
  AddToList: ListEntry
  DeleteFromList: Scalars['Boolean']
  UpdateStatus: ListEntry
  StartRewatching: ListEntry
  UpdateProgress: ListEntry
  UpdateScore: ListEntry
  EditListEntry: ListEntry
}

export type MutationUpdateUserArgs = {
  about: Maybe<Scalars['String']>
  titleLanguage: Maybe<UserTitleLanguage>
  displayAdultContent: Maybe<Scalars['Boolean']>
  airingNotifications: Maybe<Scalars['Boolean']>
  scoreFormat: Maybe<ScoreFormat>
  rowOrder: Maybe<Scalars['String']>
  profileColor: Maybe<Scalars['String']>
  donatorBadge: Maybe<Scalars['String']>
  notificationOptions: Maybe<Array<Maybe<NotificationOptionInput>>>
  animeListOptions: Maybe<MediaListOptionsInput>
  mangaListOptions: Maybe<MediaListOptionsInput>
}

export type MutationSaveMediaListEntryArgs = {
  id: Maybe<Scalars['Int']>
  mediaId: Maybe<Scalars['Int']>
  status: Maybe<MediaListStatus>
  score: Maybe<Scalars['Float']>
  scoreRaw: Maybe<Scalars['Int']>
  progress: Maybe<Scalars['Int']>
  progressVolumes: Maybe<Scalars['Int']>
  repeat: Maybe<Scalars['Int']>
  priority: Maybe<Scalars['Int']>
  private: Maybe<Scalars['Boolean']>
  notes: Maybe<Scalars['String']>
  hiddenFromStatusLists: Maybe<Scalars['Boolean']>
  customLists: Maybe<Array<Maybe<Scalars['String']>>>
  advancedScores: Maybe<Array<Maybe<Scalars['Float']>>>
  startedAt: Maybe<FuzzyDateInput>
  completedAt: Maybe<FuzzyDateInput>
}

export type MutationUpdateMediaListEntriesArgs = {
  status: Maybe<MediaListStatus>
  score: Maybe<Scalars['Float']>
  scoreRaw: Maybe<Scalars['Int']>
  progress: Maybe<Scalars['Int']>
  progressVolumes: Maybe<Scalars['Int']>
  repeat: Maybe<Scalars['Int']>
  priority: Maybe<Scalars['Int']>
  private: Maybe<Scalars['Boolean']>
  notes: Maybe<Scalars['String']>
  hiddenFromStatusLists: Maybe<Scalars['Boolean']>
  advancedScores: Maybe<Array<Maybe<Scalars['Float']>>>
  startedAt: Maybe<FuzzyDateInput>
  completedAt: Maybe<FuzzyDateInput>
  ids: Maybe<Array<Maybe<Scalars['Int']>>>
}

export type MutationDeleteMediaListEntryArgs = {
  id: Maybe<Scalars['Int']>
}

export type MutationDeleteCustomListArgs = {
  customList: Maybe<Scalars['String']>
  type: Maybe<MediaType>
}

export type MutationSaveTextActivityArgs = {
  id: Maybe<Scalars['Int']>
  text: Maybe<Scalars['String']>
  locked: Maybe<Scalars['Boolean']>
}

export type MutationSaveMessageActivityArgs = {
  id: Maybe<Scalars['Int']>
  message: Maybe<Scalars['String']>
  recipientId: Maybe<Scalars['Int']>
  locked: Maybe<Scalars['Boolean']>
}

export type MutationSaveListActivityArgs = {
  id: Maybe<Scalars['Int']>
  locked: Maybe<Scalars['Boolean']>
}

export type MutationDeleteActivityArgs = {
  id: Maybe<Scalars['Int']>
}

export type MutationSaveActivityReplyArgs = {
  id: Maybe<Scalars['Int']>
  activityId: Maybe<Scalars['Int']>
  text: Maybe<Scalars['String']>
}

export type MutationDeleteActivityReplyArgs = {
  id: Maybe<Scalars['Int']>
}

export type MutationToggleLikeArgs = {
  id: Maybe<Scalars['Int']>
  type: Maybe<LikeableType>
}

export type MutationToggleFollowArgs = {
  userId: Maybe<Scalars['Int']>
}

export type MutationToggleFavouriteArgs = {
  animeId: Maybe<Scalars['Int']>
  mangaId: Maybe<Scalars['Int']>
  characterId: Maybe<Scalars['Int']>
  staffId: Maybe<Scalars['Int']>
  studioId: Maybe<Scalars['Int']>
}

export type MutationUpdateFavouriteOrderArgs = {
  animeIds: Maybe<Array<Maybe<Scalars['Int']>>>
  mangaIds: Maybe<Array<Maybe<Scalars['Int']>>>
  characterIds: Maybe<Array<Maybe<Scalars['Int']>>>
  staffIds: Maybe<Array<Maybe<Scalars['Int']>>>
  studioIds: Maybe<Array<Maybe<Scalars['Int']>>>
  animeOrder: Maybe<Array<Maybe<Scalars['Int']>>>
  mangaOrder: Maybe<Array<Maybe<Scalars['Int']>>>
  characterOrder: Maybe<Array<Maybe<Scalars['Int']>>>
  staffOrder: Maybe<Array<Maybe<Scalars['Int']>>>
  studioOrder: Maybe<Array<Maybe<Scalars['Int']>>>
}

export type MutationSaveReviewArgs = {
  id: Maybe<Scalars['Int']>
  mediaId: Maybe<Scalars['Int']>
  body: Maybe<Scalars['String']>
  summary: Maybe<Scalars['String']>
  score: Maybe<Scalars['Int']>
  private: Maybe<Scalars['Boolean']>
}

export type MutationDeleteReviewArgs = {
  id: Maybe<Scalars['Int']>
}

export type MutationRateReviewArgs = {
  reviewId: Maybe<Scalars['Int']>
  rating: Maybe<ReviewRating>
}

export type MutationSaveThreadArgs = {
  id: Maybe<Scalars['Int']>
  title: Maybe<Scalars['String']>
  body: Maybe<Scalars['String']>
  categories: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaCategories: Maybe<Array<Maybe<Scalars['Int']>>>
  sticky: Maybe<Scalars['Boolean']>
  locked: Maybe<Scalars['Boolean']>
}

export type MutationDeleteThreadArgs = {
  id: Maybe<Scalars['Int']>
}

export type MutationToggleThreadSubscriptionArgs = {
  threadId: Maybe<Scalars['Int']>
  subscribe: Maybe<Scalars['Boolean']>
}

export type MutationSaveThreadCommentArgs = {
  id: Maybe<Scalars['Int']>
  threadId: Maybe<Scalars['Int']>
  parentCommentId: Maybe<Scalars['Int']>
  comment: Maybe<Scalars['String']>
}

export type MutationDeleteThreadCommentArgs = {
  id: Maybe<Scalars['Int']>
}

export type MutationUpdateAniChartSettingsArgs = {
  titleLanguage: Maybe<Scalars['String']>
  outgoingLinkProvider: Maybe<Scalars['String']>
  theme: Maybe<Scalars['String']>
  sort: Maybe<Scalars['String']>
}

export type MutationUpdateAniChartHighlightsArgs = {
  highlights: Maybe<Array<Maybe<AniChartHighlightInput>>>
}

export type MutationCacheEpisodesArgs = {
  episodes: Array<EpisodeInput>
}

export type MutationAddToListArgs = {
  anilistId: Scalars['Int']
}

export type MutationDeleteFromListArgs = {
  anilistId: Scalars['Int']
}

export type MutationUpdateStatusArgs = {
  anilistId: Scalars['Int']
  status: MediaListStatus
}

export type MutationStartRewatchingArgs = {
  anilistId: Scalars['Int']
}

export type MutationUpdateProgressArgs = {
  anilistId: Scalars['Int']
  progress: Scalars['Int']
}

export type MutationUpdateScoreArgs = {
  anilistId: Scalars['Int']
  score: Scalars['Int']
}

export type MutationEditListEntryArgs = {
  anilistId: Scalars['Int']
  options: EditListEntryOptions
}

/** Notification option */
export type NotificationOption = {
  __typename?: 'NotificationOption'
  /** The type of notification */
  type: Maybe<NotificationType>
  /** Whether this type of notification is enabled */
  enabled: Maybe<Scalars['Boolean']>
}

/** Notification option input */
export type NotificationOptionInput = {
  /** The type of notification */
  type: Maybe<NotificationType>
  /** Whether this type of notification is enabled */
  enabled: Maybe<Scalars['Boolean']>
}

/** Notification type enum */
export enum NotificationType {
  /** A user has sent you message */
  ActivityMessage = 'ACTIVITY_MESSAGE',
  /** A user has replied to your activity */
  ActivityReply = 'ACTIVITY_REPLY',
  /** A user has followed you */
  Following = 'FOLLOWING',
  /** A user has mentioned you in their activity */
  ActivityMention = 'ACTIVITY_MENTION',
  /** A user has mentioned you in a forum comment */
  ThreadCommentMention = 'THREAD_COMMENT_MENTION',
  /** A user has commented in one of your subscribed forum threads */
  ThreadSubscribed = 'THREAD_SUBSCRIBED',
  /** A user has replied to your forum comment */
  ThreadCommentReply = 'THREAD_COMMENT_REPLY',
  /** An anime you are currently watching has aired */
  Airing = 'AIRING',
  /** A user has liked your activity */
  ActivityLike = 'ACTIVITY_LIKE',
  /** A user has liked your activity reply */
  ActivityReplyLike = 'ACTIVITY_REPLY_LIKE',
  /** A user has liked your forum thread */
  ThreadLike = 'THREAD_LIKE',
  /** A user has liked your forum comment */
  ThreadCommentLike = 'THREAD_COMMENT_LIKE',
  /** A user has replied to activity you have also replied to */
  ActivityReplySubscribed = 'ACTIVITY_REPLY_SUBSCRIBED',
  /** A new anime or manga has been added to the site where its related media is on the user's list */
  RelatedMediaAddition = 'RELATED_MEDIA_ADDITION',
}

/** Notification union type */
export type NotificationUnion =
  | AiringNotification
  | FollowingNotification
  | ActivityMessageNotification
  | ActivityMentionNotification
  | ActivityReplyNotification
  | ActivityReplySubscribedNotification
  | ActivityLikeNotification
  | ActivityReplyLikeNotification
  | ThreadCommentMentionNotification
  | ThreadCommentReplyNotification
  | ThreadCommentSubscribedNotification
  | ThreadCommentLikeNotification
  | ThreadLikeNotification
  | RelatedMediaAdditionNotification

/** Page of data */
export type Page = {
  __typename?: 'Page'
  /** The pagination information */
  pageInfo: Maybe<PageInfo>
  users: Maybe<Array<Maybe<User>>>
  media: Maybe<Array<Maybe<Media>>>
  characters: Maybe<Array<Maybe<Character>>>
  staff: Maybe<Array<Maybe<Staff>>>
  studios: Maybe<Array<Maybe<Studio>>>
  mediaList: Maybe<Array<Maybe<MediaList>>>
  airingSchedules: Maybe<Array<Maybe<AiringSchedule>>>
  mediaTrends: Maybe<Array<Maybe<MediaTrend>>>
  notifications: Maybe<Array<Maybe<NotificationUnion>>>
  followers: Maybe<Array<Maybe<User>>>
  following: Maybe<Array<Maybe<User>>>
  activities: Maybe<Array<Maybe<ActivityUnion>>>
  activityReplies: Maybe<Array<Maybe<ActivityReply>>>
  threads: Maybe<Array<Maybe<Thread>>>
  threadComments: Maybe<Array<Maybe<ThreadComment>>>
  reviews: Maybe<Array<Maybe<Review>>>
}

/** Page of data */
export type PageUsersArgs = {
  id: Maybe<Scalars['Int']>
  name: Maybe<Scalars['String']>
  search: Maybe<Scalars['String']>
  sort: Maybe<Array<Maybe<UserSort>>>
}

/** Page of data */
export type PageMediaArgs = {
  id: Maybe<Scalars['Int']>
  idMal: Maybe<Scalars['Int']>
  startDate: Maybe<Scalars['FuzzyDateInt']>
  endDate: Maybe<Scalars['FuzzyDateInt']>
  season: Maybe<MediaSeason>
  seasonYear: Maybe<Scalars['Int']>
  type: Maybe<MediaType>
  format: Maybe<MediaFormat>
  status: Maybe<MediaStatus>
  episodes: Maybe<Scalars['Int']>
  duration: Maybe<Scalars['Int']>
  chapters: Maybe<Scalars['Int']>
  volumes: Maybe<Scalars['Int']>
  isAdult: Maybe<Scalars['Boolean']>
  genre: Maybe<Scalars['String']>
  tag: Maybe<Scalars['String']>
  tagCategory: Maybe<Scalars['String']>
  onList: Maybe<Scalars['Boolean']>
  licensedBy: Maybe<Scalars['String']>
  averageScore: Maybe<Scalars['Int']>
  popularity: Maybe<Scalars['Int']>
  source: Maybe<MediaSource>
  countryOfOrigin: Maybe<Scalars['CountryCode']>
  search: Maybe<Scalars['String']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  idMal_not: Maybe<Scalars['Int']>
  idMal_in: Maybe<Array<Maybe<Scalars['Int']>>>
  idMal_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  startDate_greater: Maybe<Scalars['FuzzyDateInt']>
  startDate_lesser: Maybe<Scalars['FuzzyDateInt']>
  startDate_like: Maybe<Scalars['String']>
  endDate_greater: Maybe<Scalars['FuzzyDateInt']>
  endDate_lesser: Maybe<Scalars['FuzzyDateInt']>
  endDate_like: Maybe<Scalars['String']>
  format_in: Maybe<Array<Maybe<MediaFormat>>>
  format_not: Maybe<MediaFormat>
  format_not_in: Maybe<Array<Maybe<MediaFormat>>>
  status_in: Maybe<Array<Maybe<MediaStatus>>>
  status_not: Maybe<MediaStatus>
  status_not_in: Maybe<Array<Maybe<MediaStatus>>>
  episodes_greater: Maybe<Scalars['Int']>
  episodes_lesser: Maybe<Scalars['Int']>
  duration_greater: Maybe<Scalars['Int']>
  duration_lesser: Maybe<Scalars['Int']>
  chapters_greater: Maybe<Scalars['Int']>
  chapters_lesser: Maybe<Scalars['Int']>
  volumes_greater: Maybe<Scalars['Int']>
  volumes_lesser: Maybe<Scalars['Int']>
  genre_in: Maybe<Array<Maybe<Scalars['String']>>>
  genre_not_in: Maybe<Array<Maybe<Scalars['String']>>>
  tag_in: Maybe<Array<Maybe<Scalars['String']>>>
  tag_not_in: Maybe<Array<Maybe<Scalars['String']>>>
  tagCategory_in: Maybe<Array<Maybe<Scalars['String']>>>
  tagCategory_not_in: Maybe<Array<Maybe<Scalars['String']>>>
  licensedBy_in: Maybe<Array<Maybe<Scalars['String']>>>
  averageScore_not: Maybe<Scalars['Int']>
  averageScore_greater: Maybe<Scalars['Int']>
  averageScore_lesser: Maybe<Scalars['Int']>
  popularity_not: Maybe<Scalars['Int']>
  popularity_greater: Maybe<Scalars['Int']>
  popularity_lesser: Maybe<Scalars['Int']>
  source_in: Maybe<Array<Maybe<MediaSource>>>
  sort: Maybe<Array<Maybe<MediaSort>>>
}

/** Page of data */
export type PageCharactersArgs = {
  id: Maybe<Scalars['Int']>
  search: Maybe<Scalars['String']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  sort: Maybe<Array<Maybe<CharacterSort>>>
}

/** Page of data */
export type PageStaffArgs = {
  id: Maybe<Scalars['Int']>
  search: Maybe<Scalars['String']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  sort: Maybe<Array<Maybe<StaffSort>>>
}

/** Page of data */
export type PageStudiosArgs = {
  id: Maybe<Scalars['Int']>
  search: Maybe<Scalars['String']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  sort: Maybe<Array<Maybe<StudioSort>>>
}

/** Page of data */
export type PageMediaListArgs = {
  id: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  userName: Maybe<Scalars['String']>
  type: Maybe<MediaType>
  status: Maybe<MediaListStatus>
  mediaId: Maybe<Scalars['Int']>
  isFollowing: Maybe<Scalars['Boolean']>
  notes: Maybe<Scalars['String']>
  startedAt: Maybe<Scalars['FuzzyDateInt']>
  completedAt: Maybe<Scalars['FuzzyDateInt']>
  compareWithAuthList: Maybe<Scalars['Boolean']>
  userId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  status_in: Maybe<Array<Maybe<MediaListStatus>>>
  status_not_in: Maybe<Array<Maybe<MediaListStatus>>>
  status_not: Maybe<MediaListStatus>
  mediaId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  notes_like: Maybe<Scalars['String']>
  startedAt_greater: Maybe<Scalars['FuzzyDateInt']>
  startedAt_lesser: Maybe<Scalars['FuzzyDateInt']>
  startedAt_like: Maybe<Scalars['String']>
  completedAt_greater: Maybe<Scalars['FuzzyDateInt']>
  completedAt_lesser: Maybe<Scalars['FuzzyDateInt']>
  completedAt_like: Maybe<Scalars['String']>
  sort: Maybe<Array<Maybe<MediaListSort>>>
}

/** Page of data */
export type PageAiringSchedulesArgs = {
  id: Maybe<Scalars['Int']>
  mediaId: Maybe<Scalars['Int']>
  episode: Maybe<Scalars['Int']>
  airingAt: Maybe<Scalars['Int']>
  notYetAired: Maybe<Scalars['Boolean']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not: Maybe<Scalars['Int']>
  mediaId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  episode_not: Maybe<Scalars['Int']>
  episode_in: Maybe<Array<Maybe<Scalars['Int']>>>
  episode_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  episode_greater: Maybe<Scalars['Int']>
  episode_lesser: Maybe<Scalars['Int']>
  airingAt_greater: Maybe<Scalars['Int']>
  airingAt_lesser: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<AiringSort>>>
}

/** Page of data */
export type PageMediaTrendsArgs = {
  mediaId: Maybe<Scalars['Int']>
  date: Maybe<Scalars['Int']>
  trending: Maybe<Scalars['Int']>
  averageScore: Maybe<Scalars['Int']>
  popularity: Maybe<Scalars['Int']>
  episode: Maybe<Scalars['Int']>
  releasing: Maybe<Scalars['Boolean']>
  mediaId_not: Maybe<Scalars['Int']>
  mediaId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  date_greater: Maybe<Scalars['Int']>
  date_lesser: Maybe<Scalars['Int']>
  trending_greater: Maybe<Scalars['Int']>
  trending_lesser: Maybe<Scalars['Int']>
  trending_not: Maybe<Scalars['Int']>
  averageScore_greater: Maybe<Scalars['Int']>
  averageScore_lesser: Maybe<Scalars['Int']>
  averageScore_not: Maybe<Scalars['Int']>
  popularity_greater: Maybe<Scalars['Int']>
  popularity_lesser: Maybe<Scalars['Int']>
  popularity_not: Maybe<Scalars['Int']>
  episode_greater: Maybe<Scalars['Int']>
  episode_lesser: Maybe<Scalars['Int']>
  episode_not: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<MediaTrendSort>>>
}

/** Page of data */
export type PageNotificationsArgs = {
  type: Maybe<NotificationType>
  resetNotificationCount: Maybe<Scalars['Boolean']>
  type_in: Maybe<Array<Maybe<NotificationType>>>
}

/** Page of data */
export type PageFollowersArgs = {
  userId: Scalars['Int']
  sort: Maybe<Array<Maybe<UserSort>>>
}

/** Page of data */
export type PageFollowingArgs = {
  userId: Scalars['Int']
  sort: Maybe<Array<Maybe<UserSort>>>
}

/** Page of data */
export type PageActivitiesArgs = {
  id: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  messengerId: Maybe<Scalars['Int']>
  mediaId: Maybe<Scalars['Int']>
  type: Maybe<ActivityType>
  isFollowing: Maybe<Scalars['Boolean']>
  hasReplies: Maybe<Scalars['Boolean']>
  hasRepliesOrTypeText: Maybe<Scalars['Boolean']>
  createdAt: Maybe<Scalars['Int']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  userId_not: Maybe<Scalars['Int']>
  userId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  userId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  messengerId_not: Maybe<Scalars['Int']>
  messengerId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  messengerId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not: Maybe<Scalars['Int']>
  mediaId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  type_not: Maybe<ActivityType>
  type_in: Maybe<Array<Maybe<ActivityType>>>
  type_not_in: Maybe<Array<Maybe<ActivityType>>>
  createdAt_greater: Maybe<Scalars['Int']>
  createdAt_lesser: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<ActivitySort>>>
}

/** Page of data */
export type PageActivityRepliesArgs = {
  id: Maybe<Scalars['Int']>
  activityId: Maybe<Scalars['Int']>
}

/** Page of data */
export type PageThreadsArgs = {
  id: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  replyUserId: Maybe<Scalars['Int']>
  subscribed: Maybe<Scalars['Boolean']>
  categoryId: Maybe<Scalars['Int']>
  mediaCategoryId: Maybe<Scalars['Int']>
  search: Maybe<Scalars['String']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  sort: Maybe<Array<Maybe<ThreadSort>>>
}

/** Page of data */
export type PageThreadCommentsArgs = {
  id: Maybe<Scalars['Int']>
  threadId: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<ThreadCommentSort>>>
}

/** Page of data */
export type PageReviewsArgs = {
  id: Maybe<Scalars['Int']>
  mediaId: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  mediaType: Maybe<MediaType>
  sort: Maybe<Array<Maybe<ReviewSort>>>
}

export type PageInfo = {
  __typename?: 'PageInfo'
  /** The total number of items */
  total: Maybe<Scalars['Int']>
  /** The count on a page */
  perPage: Maybe<Scalars['Int']>
  /** The current page */
  currentPage: Maybe<Scalars['Int']>
  /** The last page */
  lastPage: Maybe<Scalars['Int']>
  /** If there is another page */
  hasNextPage: Maybe<Scalars['Boolean']>
}

/** Provides the parsed markdown as html */
export type ParsedMarkdown = {
  __typename?: 'ParsedMarkdown'
  /** The parsed markdown as html */
  html: Maybe<Scalars['String']>
}

export enum Provider {
  Crunchyroll = 'CRUNCHYROLL',
  CrunchyrollManual = 'CRUNCHYROLL_MANUAL',
  Hidive = 'HIDIVE',
  Local = 'LOCAL',
}

export type Query = {
  __typename?: 'Query'
  Page: Maybe<Page>
  /** Media query */
  Media: Maybe<Media>
  /** Media Trend query */
  MediaTrend: Maybe<MediaTrend>
  /** Airing schedule query */
  AiringSchedule: Maybe<AiringSchedule>
  /** Character query */
  Character: Maybe<Character>
  /** Staff query */
  Staff: Maybe<Staff>
  /** Media list query */
  MediaList: Maybe<MediaList>
  /**
   * Media list collection query, provides list pre-grouped by status & custom
   * lists. User ID and Media Type arguments required.
   **/
  MediaListCollection: Maybe<MediaListCollection>
  /** Collection of all the possible media genres */
  GenreCollection: Maybe<Array<Maybe<Scalars['String']>>>
  /** Collection of all the possible media tags */
  MediaTagCollection: Maybe<Array<Maybe<MediaTag>>>
  /** User query */
  User: Maybe<User>
  /** Get the currently authenticated user */
  Viewer: Maybe<User>
  /** Notification query */
  Notification: Maybe<NotificationUnion>
  /** Studio query */
  Studio: Maybe<Studio>
  /** Review query */
  Review: Maybe<Review>
  /** Activity query */
  Activity: Maybe<ActivityUnion>
  /** Activity reply query */
  ActivityReply: Maybe<ActivityReply>
  /** Follow query */
  Following: Maybe<User>
  /** Follow query */
  Follower: Maybe<User>
  /** Thread query */
  Thread: Maybe<Thread>
  /** Comment query */
  ThreadComment: Maybe<Array<Maybe<ThreadComment>>>
  /** Provide AniList markdown to be converted to html (Requires auth) */
  Markdown: Maybe<ParsedMarkdown>
  AniChartUser: Maybe<AniChartUser>
  /** Site statistics query */
  SiteStatistics: Maybe<SiteStatistics>
  Episodes: Maybe<Array<Episode>>
  ListEntry: ListEntry
  ListEntries: Array<ListEntry>
}

export type QueryPageArgs = {
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

export type QueryMediaArgs = {
  id: Maybe<Scalars['Int']>
  idMal: Maybe<Scalars['Int']>
  startDate: Maybe<Scalars['FuzzyDateInt']>
  endDate: Maybe<Scalars['FuzzyDateInt']>
  season: Maybe<MediaSeason>
  seasonYear: Maybe<Scalars['Int']>
  type: Maybe<MediaType>
  format: Maybe<MediaFormat>
  status: Maybe<MediaStatus>
  episodes: Maybe<Scalars['Int']>
  duration: Maybe<Scalars['Int']>
  chapters: Maybe<Scalars['Int']>
  volumes: Maybe<Scalars['Int']>
  isAdult: Maybe<Scalars['Boolean']>
  genre: Maybe<Scalars['String']>
  tag: Maybe<Scalars['String']>
  tagCategory: Maybe<Scalars['String']>
  onList: Maybe<Scalars['Boolean']>
  licensedBy: Maybe<Scalars['String']>
  averageScore: Maybe<Scalars['Int']>
  popularity: Maybe<Scalars['Int']>
  source: Maybe<MediaSource>
  countryOfOrigin: Maybe<Scalars['CountryCode']>
  search: Maybe<Scalars['String']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  idMal_not: Maybe<Scalars['Int']>
  idMal_in: Maybe<Array<Maybe<Scalars['Int']>>>
  idMal_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  startDate_greater: Maybe<Scalars['FuzzyDateInt']>
  startDate_lesser: Maybe<Scalars['FuzzyDateInt']>
  startDate_like: Maybe<Scalars['String']>
  endDate_greater: Maybe<Scalars['FuzzyDateInt']>
  endDate_lesser: Maybe<Scalars['FuzzyDateInt']>
  endDate_like: Maybe<Scalars['String']>
  format_in: Maybe<Array<Maybe<MediaFormat>>>
  format_not: Maybe<MediaFormat>
  format_not_in: Maybe<Array<Maybe<MediaFormat>>>
  status_in: Maybe<Array<Maybe<MediaStatus>>>
  status_not: Maybe<MediaStatus>
  status_not_in: Maybe<Array<Maybe<MediaStatus>>>
  episodes_greater: Maybe<Scalars['Int']>
  episodes_lesser: Maybe<Scalars['Int']>
  duration_greater: Maybe<Scalars['Int']>
  duration_lesser: Maybe<Scalars['Int']>
  chapters_greater: Maybe<Scalars['Int']>
  chapters_lesser: Maybe<Scalars['Int']>
  volumes_greater: Maybe<Scalars['Int']>
  volumes_lesser: Maybe<Scalars['Int']>
  genre_in: Maybe<Array<Maybe<Scalars['String']>>>
  genre_not_in: Maybe<Array<Maybe<Scalars['String']>>>
  tag_in: Maybe<Array<Maybe<Scalars['String']>>>
  tag_not_in: Maybe<Array<Maybe<Scalars['String']>>>
  tagCategory_in: Maybe<Array<Maybe<Scalars['String']>>>
  tagCategory_not_in: Maybe<Array<Maybe<Scalars['String']>>>
  licensedBy_in: Maybe<Array<Maybe<Scalars['String']>>>
  averageScore_not: Maybe<Scalars['Int']>
  averageScore_greater: Maybe<Scalars['Int']>
  averageScore_lesser: Maybe<Scalars['Int']>
  popularity_not: Maybe<Scalars['Int']>
  popularity_greater: Maybe<Scalars['Int']>
  popularity_lesser: Maybe<Scalars['Int']>
  source_in: Maybe<Array<Maybe<MediaSource>>>
  sort: Maybe<Array<Maybe<MediaSort>>>
}

export type QueryMediaTrendArgs = {
  mediaId: Maybe<Scalars['Int']>
  date: Maybe<Scalars['Int']>
  trending: Maybe<Scalars['Int']>
  averageScore: Maybe<Scalars['Int']>
  popularity: Maybe<Scalars['Int']>
  episode: Maybe<Scalars['Int']>
  releasing: Maybe<Scalars['Boolean']>
  mediaId_not: Maybe<Scalars['Int']>
  mediaId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  date_greater: Maybe<Scalars['Int']>
  date_lesser: Maybe<Scalars['Int']>
  trending_greater: Maybe<Scalars['Int']>
  trending_lesser: Maybe<Scalars['Int']>
  trending_not: Maybe<Scalars['Int']>
  averageScore_greater: Maybe<Scalars['Int']>
  averageScore_lesser: Maybe<Scalars['Int']>
  averageScore_not: Maybe<Scalars['Int']>
  popularity_greater: Maybe<Scalars['Int']>
  popularity_lesser: Maybe<Scalars['Int']>
  popularity_not: Maybe<Scalars['Int']>
  episode_greater: Maybe<Scalars['Int']>
  episode_lesser: Maybe<Scalars['Int']>
  episode_not: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<MediaTrendSort>>>
}

export type QueryAiringScheduleArgs = {
  id: Maybe<Scalars['Int']>
  mediaId: Maybe<Scalars['Int']>
  episode: Maybe<Scalars['Int']>
  airingAt: Maybe<Scalars['Int']>
  notYetAired: Maybe<Scalars['Boolean']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not: Maybe<Scalars['Int']>
  mediaId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  episode_not: Maybe<Scalars['Int']>
  episode_in: Maybe<Array<Maybe<Scalars['Int']>>>
  episode_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  episode_greater: Maybe<Scalars['Int']>
  episode_lesser: Maybe<Scalars['Int']>
  airingAt_greater: Maybe<Scalars['Int']>
  airingAt_lesser: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<AiringSort>>>
}

export type QueryCharacterArgs = {
  id: Maybe<Scalars['Int']>
  search: Maybe<Scalars['String']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  sort: Maybe<Array<Maybe<CharacterSort>>>
}

export type QueryStaffArgs = {
  id: Maybe<Scalars['Int']>
  search: Maybe<Scalars['String']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  sort: Maybe<Array<Maybe<StaffSort>>>
}

export type QueryMediaListArgs = {
  id: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  userName: Maybe<Scalars['String']>
  type: Maybe<MediaType>
  status: Maybe<MediaListStatus>
  mediaId: Maybe<Scalars['Int']>
  isFollowing: Maybe<Scalars['Boolean']>
  notes: Maybe<Scalars['String']>
  startedAt: Maybe<Scalars['FuzzyDateInt']>
  completedAt: Maybe<Scalars['FuzzyDateInt']>
  compareWithAuthList: Maybe<Scalars['Boolean']>
  userId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  status_in: Maybe<Array<Maybe<MediaListStatus>>>
  status_not_in: Maybe<Array<Maybe<MediaListStatus>>>
  status_not: Maybe<MediaListStatus>
  mediaId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  notes_like: Maybe<Scalars['String']>
  startedAt_greater: Maybe<Scalars['FuzzyDateInt']>
  startedAt_lesser: Maybe<Scalars['FuzzyDateInt']>
  startedAt_like: Maybe<Scalars['String']>
  completedAt_greater: Maybe<Scalars['FuzzyDateInt']>
  completedAt_lesser: Maybe<Scalars['FuzzyDateInt']>
  completedAt_like: Maybe<Scalars['String']>
  sort: Maybe<Array<Maybe<MediaListSort>>>
}

export type QueryMediaListCollectionArgs = {
  userId: Maybe<Scalars['Int']>
  userName: Maybe<Scalars['String']>
  type: Maybe<MediaType>
  status: Maybe<MediaListStatus>
  notes: Maybe<Scalars['String']>
  startedAt: Maybe<Scalars['FuzzyDateInt']>
  completedAt: Maybe<Scalars['FuzzyDateInt']>
  forceSingleCompletedList: Maybe<Scalars['Boolean']>
  chunk: Maybe<Scalars['Int']>
  perChunk: Maybe<Scalars['Int']>
  status_in: Maybe<Array<Maybe<MediaListStatus>>>
  status_not_in: Maybe<Array<Maybe<MediaListStatus>>>
  status_not: Maybe<MediaListStatus>
  notes_like: Maybe<Scalars['String']>
  startedAt_greater: Maybe<Scalars['FuzzyDateInt']>
  startedAt_lesser: Maybe<Scalars['FuzzyDateInt']>
  startedAt_like: Maybe<Scalars['String']>
  completedAt_greater: Maybe<Scalars['FuzzyDateInt']>
  completedAt_lesser: Maybe<Scalars['FuzzyDateInt']>
  completedAt_like: Maybe<Scalars['String']>
  sort: Maybe<Array<Maybe<MediaListSort>>>
}

export type QueryMediaTagCollectionArgs = {
  status: Maybe<Scalars['Int']>
}

export type QueryUserArgs = {
  id: Maybe<Scalars['Int']>
  name: Maybe<Scalars['String']>
  search: Maybe<Scalars['String']>
  sort: Maybe<Array<Maybe<UserSort>>>
}

export type QueryNotificationArgs = {
  type: Maybe<NotificationType>
  resetNotificationCount: Maybe<Scalars['Boolean']>
  type_in: Maybe<Array<Maybe<NotificationType>>>
}

export type QueryStudioArgs = {
  id: Maybe<Scalars['Int']>
  search: Maybe<Scalars['String']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  sort: Maybe<Array<Maybe<StudioSort>>>
}

export type QueryReviewArgs = {
  id: Maybe<Scalars['Int']>
  mediaId: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  mediaType: Maybe<MediaType>
  sort: Maybe<Array<Maybe<ReviewSort>>>
}

export type QueryActivityArgs = {
  id: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  messengerId: Maybe<Scalars['Int']>
  mediaId: Maybe<Scalars['Int']>
  type: Maybe<ActivityType>
  isFollowing: Maybe<Scalars['Boolean']>
  hasReplies: Maybe<Scalars['Boolean']>
  hasRepliesOrTypeText: Maybe<Scalars['Boolean']>
  createdAt: Maybe<Scalars['Int']>
  id_not: Maybe<Scalars['Int']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  id_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  userId_not: Maybe<Scalars['Int']>
  userId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  userId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  messengerId_not: Maybe<Scalars['Int']>
  messengerId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  messengerId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not: Maybe<Scalars['Int']>
  mediaId_in: Maybe<Array<Maybe<Scalars['Int']>>>
  mediaId_not_in: Maybe<Array<Maybe<Scalars['Int']>>>
  type_not: Maybe<ActivityType>
  type_in: Maybe<Array<Maybe<ActivityType>>>
  type_not_in: Maybe<Array<Maybe<ActivityType>>>
  createdAt_greater: Maybe<Scalars['Int']>
  createdAt_lesser: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<ActivitySort>>>
}

export type QueryActivityReplyArgs = {
  id: Maybe<Scalars['Int']>
  activityId: Maybe<Scalars['Int']>
}

export type QueryFollowingArgs = {
  userId: Scalars['Int']
  sort: Maybe<Array<Maybe<UserSort>>>
}

export type QueryFollowerArgs = {
  userId: Scalars['Int']
  sort: Maybe<Array<Maybe<UserSort>>>
}

export type QueryThreadArgs = {
  id: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  replyUserId: Maybe<Scalars['Int']>
  subscribed: Maybe<Scalars['Boolean']>
  categoryId: Maybe<Scalars['Int']>
  mediaCategoryId: Maybe<Scalars['Int']>
  search: Maybe<Scalars['String']>
  id_in: Maybe<Array<Maybe<Scalars['Int']>>>
  sort: Maybe<Array<Maybe<ThreadSort>>>
}

export type QueryThreadCommentArgs = {
  id: Maybe<Scalars['Int']>
  threadId: Maybe<Scalars['Int']>
  userId: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<ThreadCommentSort>>>
}

export type QueryMarkdownArgs = {
  markdown: Scalars['String']
}

export type QueryEpisodesArgs = {
  id: Scalars['Int']
  provider: Provider
}

export type QueryListEntryArgs = {
  mediaId: Scalars['Int']
}

export type QueryListEntriesArgs = {
  id_in: Maybe<Array<Scalars['Int']>>
  status: Maybe<MediaListStatus>
  status_not: Maybe<MediaListStatus>
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

/** Notification for when new media is added to the site */
export type RelatedMediaAdditionNotification = {
  __typename?: 'RelatedMediaAdditionNotification'
  /** The id of the Notification */
  id: Scalars['Int']
  /** The type of notification */
  type: Maybe<NotificationType>
  /** The id of the new media */
  mediaId: Scalars['Int']
  /** The notification context text */
  context: Maybe<Scalars['String']>
  /** The time the notification was created at */
  createdAt: Maybe<Scalars['Int']>
  /** The associated media of the airing schedule */
  media: Maybe<Media>
}

export type Report = {
  __typename?: 'Report'
  id: Scalars['Int']
  reporter: Maybe<User>
  reported: Maybe<User>
  reason: Maybe<Scalars['String']>
  /** When the entry data was created */
  createdAt: Maybe<Scalars['Int']>
}

/** A Review that features in an anime or manga */
export type Review = {
  __typename?: 'Review'
  /** The id of the review */
  id: Scalars['Int']
  /** The id of the review's creator */
  userId: Scalars['Int']
  /** The id of the review's media */
  mediaId: Scalars['Int']
  /** For which type of media the review is for */
  mediaType: Maybe<MediaType>
  /** A short summary of the review */
  summary: Maybe<Scalars['String']>
  /** The main review body text */
  body: Maybe<Scalars['String']>
  /** The total user rating of the review */
  rating: Maybe<Scalars['Int']>
  /** The amount of user ratings of the review */
  ratingAmount: Maybe<Scalars['Int']>
  /** The rating of the review by currently authenticated user */
  userRating: Maybe<ReviewRating>
  /** The review score of the media */
  score: Maybe<Scalars['Int']>
  /** If the review is not yet publicly published and is only viewable by creator */
  private: Maybe<Scalars['Boolean']>
  /** The url for the review page on the AniList website */
  siteUrl: Maybe<Scalars['String']>
  /** The time of the thread creation */
  createdAt: Scalars['Int']
  /** The time of the thread last update */
  updatedAt: Scalars['Int']
  /** The creator of the review */
  user: Maybe<User>
  /** The media the review is of */
  media: Maybe<Media>
}

/** A Review that features in an anime or manga */
export type ReviewBodyArgs = {
  asHtml: Maybe<Scalars['Boolean']>
}

export type ReviewConnection = {
  __typename?: 'ReviewConnection'
  edges: Maybe<Array<Maybe<ReviewEdge>>>
  nodes: Maybe<Array<Maybe<Review>>>
  /** The pagination information */
  pageInfo: Maybe<PageInfo>
}

/** Review connection edge */
export type ReviewEdge = {
  __typename?: 'ReviewEdge'
  node: Maybe<Review>
}

/** Review rating enums */
export enum ReviewRating {
  NoVote = 'NO_VOTE',
  UpVote = 'UP_VOTE',
  DownVote = 'DOWN_VOTE',
}

/** Review sort enums */
export enum ReviewSort {
  Id = 'ID',
  IdDesc = 'ID_DESC',
  Score = 'SCORE',
  ScoreDesc = 'SCORE_DESC',
  Rating = 'RATING',
  RatingDesc = 'RATING_DESC',
  CreatedAt = 'CREATED_AT',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAt = 'UPDATED_AT',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
}

/** Feed of mod edit activity */
export type RevisionHistory = {
  __typename?: 'RevisionHistory'
  /** The id of the media */
  id: Scalars['Int']
  /** The action taken on the objects */
  action: Maybe<RevisionHistoryAction>
  /** A JSON object of the fields that changed */
  changes: Maybe<Scalars['Json']>
  /** The user who made the edit to the object */
  user: Maybe<User>
  /** The media the mod feed entry references */
  media: Maybe<Media>
  /** The character the mod feed entry references */
  character: Maybe<Character>
  /** The staff member the mod feed entry references */
  staff: Maybe<Staff>
  /** The studio the mod feed entry references */
  studio: Maybe<Studio>
  /** When the mod feed entry was created */
  createdAt: Maybe<Scalars['Int']>
}

/** Revision history actions */
export enum RevisionHistoryAction {
  Create = 'CREATE',
  Edit = 'EDIT',
}

/** A user's list score distribution. */
export type ScoreDistribution = {
  __typename?: 'ScoreDistribution'
  score: Maybe<Scalars['Int']>
  /** The amount of list entries with this score */
  amount: Maybe<Scalars['Int']>
}

/** Media list scoring type */
export enum ScoreFormat {
  /** An integer from 0-100 */
  Point_100 = 'POINT_100',
  /** A float from 0-10 with 1 decimal place */
  Point_10Decimal = 'POINT_10_DECIMAL',
  /** An integer from 0-10 */
  Point_10 = 'POINT_10',
  /** An integer from 0-5. Should be represented in Stars */
  Point_5 = 'POINT_5',
  /** An integer from 0-3. Should be represented in Smileys. 0 => No Score, 1 => :(, 2 => :|, 3 => :) */
  Point_3 = 'POINT_3',
}

export type SiteStatistics = {
  __typename?: 'SiteStatistics'
  users: Maybe<SiteTrendConnection>
  anime: Maybe<SiteTrendConnection>
  manga: Maybe<SiteTrendConnection>
  characters: Maybe<SiteTrendConnection>
  staff: Maybe<SiteTrendConnection>
  studios: Maybe<SiteTrendConnection>
  reviews: Maybe<SiteTrendConnection>
}

export type SiteStatisticsUsersArgs = {
  sort: Maybe<Array<Maybe<SiteTrendSort>>>
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

export type SiteStatisticsAnimeArgs = {
  sort: Maybe<Array<Maybe<SiteTrendSort>>>
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

export type SiteStatisticsMangaArgs = {
  sort: Maybe<Array<Maybe<SiteTrendSort>>>
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

export type SiteStatisticsCharactersArgs = {
  sort: Maybe<Array<Maybe<SiteTrendSort>>>
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

export type SiteStatisticsStaffArgs = {
  sort: Maybe<Array<Maybe<SiteTrendSort>>>
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

export type SiteStatisticsStudiosArgs = {
  sort: Maybe<Array<Maybe<SiteTrendSort>>>
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

export type SiteStatisticsReviewsArgs = {
  sort: Maybe<Array<Maybe<SiteTrendSort>>>
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

/** Daily site statistics */
export type SiteTrend = {
  __typename?: 'SiteTrend'
  /** The day the data was recorded (timestamp) */
  date: Scalars['Int']
  count: Scalars['Int']
  /** The change from yesterday */
  change: Scalars['Int']
}

export type SiteTrendConnection = {
  __typename?: 'SiteTrendConnection'
  edges: Maybe<Array<Maybe<SiteTrendEdge>>>
  nodes: Maybe<Array<Maybe<SiteTrend>>>
  /** The pagination information */
  pageInfo: Maybe<PageInfo>
}

/** Site trend connection edge */
export type SiteTrendEdge = {
  __typename?: 'SiteTrendEdge'
  node: Maybe<SiteTrend>
}

/** Site trend sort enums */
export enum SiteTrendSort {
  Date = 'DATE',
  DateDesc = 'DATE_DESC',
  Count = 'COUNT',
  CountDesc = 'COUNT_DESC',
  Change = 'CHANGE',
  ChangeDesc = 'CHANGE_DESC',
}

/** Voice actors or production staff */
export type Staff = {
  __typename?: 'Staff'
  /** The id of the staff member */
  id: Scalars['Int']
  /** The names of the staff member */
  name: Maybe<StaffName>
  /** The primary language of the staff member */
  language: Maybe<StaffLanguage>
  /** The staff images */
  image: Maybe<StaffImage>
  /** A general description of the staff member */
  description: Maybe<Scalars['String']>
  /** If the staff member is marked as favourite by the currently authenticated user */
  isFavourite: Scalars['Boolean']
  /** The url for the staff page on the AniList website */
  siteUrl: Maybe<Scalars['String']>
  /** Media where the staff member has a production role */
  staffMedia: Maybe<MediaConnection>
  /** Characters voiced by the actor */
  characters: Maybe<CharacterConnection>
  /** When the staff's data was last updated */
  updatedAt: Maybe<Scalars['Int']>
  /** Staff member that the submission is referencing */
  staff: Maybe<Staff>
  /** Submitter for the submission */
  submitter: Maybe<User>
  /** Status of the submission */
  submissionStatus: Maybe<Scalars['Int']>
  /** Inner details of submission status */
  submissionNotes: Maybe<Scalars['String']>
  /** The amount of user's who have favourited the staff member */
  favourites: Maybe<Scalars['Int']>
}

/** Voice actors or production staff */
export type StaffDescriptionArgs = {
  asHtml: Maybe<Scalars['Boolean']>
}

/** Voice actors or production staff */
export type StaffStaffMediaArgs = {
  sort: Maybe<Array<Maybe<MediaSort>>>
  type: Maybe<MediaType>
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

/** Voice actors or production staff */
export type StaffCharactersArgs = {
  sort: Maybe<Array<Maybe<CharacterSort>>>
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

export type StaffConnection = {
  __typename?: 'StaffConnection'
  edges: Maybe<Array<Maybe<StaffEdge>>>
  nodes: Maybe<Array<Maybe<Staff>>>
  /** The pagination information */
  pageInfo: Maybe<PageInfo>
}

/** Staff connection edge */
export type StaffEdge = {
  __typename?: 'StaffEdge'
  node: Maybe<Staff>
  /** The id of the connection */
  id: Maybe<Scalars['Int']>
  /** The role of the staff member in the production of the media */
  role: Maybe<Scalars['String']>
  /** The order the staff should be displayed from the users favourites */
  favouriteOrder: Maybe<Scalars['Int']>
}

export type StaffImage = {
  __typename?: 'StaffImage'
  /** The person's image of media at its largest size */
  large: Maybe<Scalars['String']>
  /** The person's image of media at medium size */
  medium: Maybe<Scalars['String']>
}

/** The primary language of the voice actor */
export enum StaffLanguage {
  /** Japanese */
  Japanese = 'JAPANESE',
  /** English */
  English = 'ENGLISH',
  /** Korean */
  Korean = 'KOREAN',
  /** Italian */
  Italian = 'ITALIAN',
  /** Spanish */
  Spanish = 'SPANISH',
  /** Portuguese */
  Portuguese = 'PORTUGUESE',
  /** French */
  French = 'FRENCH',
  /** German */
  German = 'GERMAN',
  /** Hebrew */
  Hebrew = 'HEBREW',
  /** Hungarian */
  Hungarian = 'HUNGARIAN',
}

/** The names of the staff member */
export type StaffName = {
  __typename?: 'StaffName'
  /** The person's given name */
  first: Maybe<Scalars['String']>
  /** The person's surname */
  last: Maybe<Scalars['String']>
  /** The person's full name */
  full: Maybe<Scalars['String']>
  /** The person's full name in their native language */
  native: Maybe<Scalars['String']>
  /** Other names the staff member might be referred to as (pen names) */
  alternative: Maybe<Array<Maybe<Scalars['String']>>>
}

/** The names of the staff member */
export type StaffNameInput = {
  /** The person's given name */
  first: Maybe<Scalars['String']>
  /** The person's surname */
  last: Maybe<Scalars['String']>
  /** The person's full name in their native language */
  native: Maybe<Scalars['String']>
  /** Other names the character might be referred by */
  alternative: Maybe<Array<Maybe<Scalars['String']>>>
}

/** Staff sort enums */
export enum StaffSort {
  Id = 'ID',
  IdDesc = 'ID_DESC',
  Role = 'ROLE',
  RoleDesc = 'ROLE_DESC',
  Language = 'LANGUAGE',
  LanguageDesc = 'LANGUAGE_DESC',
  SearchMatch = 'SEARCH_MATCH',
  Favourites = 'FAVOURITES',
  FavouritesDesc = 'FAVOURITES_DESC',
}

/** User's staff statistics */
export type StaffStats = {
  __typename?: 'StaffStats'
  staff: Maybe<Staff>
  amount: Maybe<Scalars['Int']>
  meanScore: Maybe<Scalars['Int']>
  /** The amount of time in minutes the staff member has been watched by the user */
  timeWatched: Maybe<Scalars['Int']>
}

/** A submission for a staff that features in an anime or manga */
export type StaffSubmission = {
  __typename?: 'StaffSubmission'
  /** The id of the submission */
  id: Scalars['Int']
  /** Staff that the submission is referencing */
  staff: Maybe<Staff>
  /** The staff submission changes */
  submission: Maybe<Staff>
  /** Submitter for the submission */
  submitter: Maybe<User>
  /** Status of the submission */
  status: Maybe<SubmissionStatus>
  /** Inner details of submission status */
  notes: Maybe<Scalars['String']>
  createdAt: Maybe<Scalars['Int']>
}

/** The distribution of the watching/reading status of media or a user's list */
export type StatusDistribution = {
  __typename?: 'StatusDistribution'
  /** The day the activity took place (Unix timestamp) */
  status: Maybe<MediaListStatus>
  /** The amount of entries with this status */
  amount: Maybe<Scalars['Int']>
}

/** Animation or production company */
export type Studio = {
  __typename?: 'Studio'
  /** The id of the studio */
  id: Scalars['Int']
  /** The name of the studio */
  name: Scalars['String']
  /** If the studio is an animation studio or a different kind of company */
  isAnimationStudio: Scalars['Boolean']
  /** The media the studio has worked on */
  media: Maybe<MediaConnection>
  /** The url for the studio page on the AniList website */
  siteUrl: Maybe<Scalars['String']>
  /** If the studio is marked as favourite by the currently authenticated user */
  isFavourite: Scalars['Boolean']
  /** The amount of user's who have favourited the studio */
  favourites: Maybe<Scalars['Int']>
}

/** Animation or production company */
export type StudioMediaArgs = {
  sort: Maybe<Array<Maybe<MediaSort>>>
  isMain: Maybe<Scalars['Boolean']>
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
}

export type StudioConnection = {
  __typename?: 'StudioConnection'
  edges: Maybe<Array<Maybe<StudioEdge>>>
  nodes: Maybe<Array<Maybe<Studio>>>
  /** The pagination information */
  pageInfo: Maybe<PageInfo>
}

/** Studio connection edge */
export type StudioEdge = {
  __typename?: 'StudioEdge'
  node: Maybe<Studio>
  /** The id of the connection */
  id: Maybe<Scalars['Int']>
  /** If the studio is the main animation studio of the anime */
  isMain: Scalars['Boolean']
  /** The order the character should be displayed from the users favourites */
  favouriteOrder: Maybe<Scalars['Int']>
}

/** Studio sort enums */
export enum StudioSort {
  Id = 'ID',
  IdDesc = 'ID_DESC',
  Name = 'NAME',
  NameDesc = 'NAME_DESC',
  SearchMatch = 'SEARCH_MATCH',
  Favourites = 'FAVOURITES',
  FavouritesDesc = 'FAVOURITES_DESC',
}

/** User's studio statistics */
export type StudioStats = {
  __typename?: 'StudioStats'
  studio: Maybe<Studio>
  amount: Maybe<Scalars['Int']>
  meanScore: Maybe<Scalars['Int']>
  /** The amount of time in minutes the studio's works have been watched by the user */
  timeWatched: Maybe<Scalars['Int']>
}

/** Submission status */
export enum SubmissionStatus {
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  PartiallyAccepted = 'PARTIALLY_ACCEPTED',
  Accepted = 'ACCEPTED',
}

/** User's tag statistics */
export type TagStats = {
  __typename?: 'TagStats'
  tag: Maybe<MediaTag>
  amount: Maybe<Scalars['Int']>
  meanScore: Maybe<Scalars['Int']>
  /** The amount of time in minutes the tag has been watched by the user */
  timeWatched: Maybe<Scalars['Int']>
}

/** User text activity */
export type TextActivity = {
  __typename?: 'TextActivity'
  /** The id of the activity */
  id: Scalars['Int']
  /** The user id of the activity's creator */
  userId: Maybe<Scalars['Int']>
  /** The type of activity */
  type: Maybe<ActivityType>
  /** The number of activity replies */
  replyCount: Scalars['Int']
  /** The status text (Markdown) */
  text: Maybe<Scalars['String']>
  /** The url for the activity page on the AniList website */
  siteUrl: Maybe<Scalars['String']>
  /** If the activity is locked and can receive replies */
  isLocked: Maybe<Scalars['Boolean']>
  /** The time the activity was created at */
  createdAt: Scalars['Int']
  /** The user who created the activity */
  user: Maybe<User>
  /** The written replies to the activity */
  replies: Maybe<Array<Maybe<ActivityReply>>>
  /** The users who liked the activity */
  likes: Maybe<Array<Maybe<User>>>
}

/** User text activity */
export type TextActivityTextArgs = {
  asHtml: Maybe<Scalars['Boolean']>
}

/** Forum Thread */
export type Thread = {
  __typename?: 'Thread'
  /** The id of the thread */
  id: Scalars['Int']
  /** The title of the thread */
  title: Maybe<Scalars['String']>
  /** The text body of the thread (Markdown) */
  body: Maybe<Scalars['String']>
  /** The id of the thread owner user */
  userId: Scalars['Int']
  /** The id of the user who most recently commented on the thread */
  replyUserId: Maybe<Scalars['Int']>
  /** The id of the most recent comment on the thread */
  replyCommentId: Maybe<Scalars['Int']>
  /** The number of comments on the thread */
  replyCount: Maybe<Scalars['Int']>
  /** The number of times users have viewed the thread */
  viewCount: Maybe<Scalars['Int']>
  /** If the thread is locked and can receive comments */
  isLocked: Maybe<Scalars['Boolean']>
  /** If the thread is stickied and should be displayed at the top of the page */
  isSticky: Maybe<Scalars['Boolean']>
  /** If the currently authenticated user is subscribed to the thread */
  isSubscribed: Maybe<Scalars['Boolean']>
  /** The time of the last reply */
  repliedAt: Maybe<Scalars['Int']>
  /** The time of the thread creation */
  createdAt: Scalars['Int']
  /** The time of the thread last update */
  updatedAt: Scalars['Int']
  /** The owner of the thread */
  user: Maybe<User>
  /** The user to last reply to the thread */
  replyUser: Maybe<User>
  /** The users who liked the thread */
  likes: Maybe<Array<Maybe<User>>>
  /** The url for the thread page on the AniList website */
  siteUrl: Maybe<Scalars['String']>
  /** The categories of the thread */
  categories: Maybe<Array<Maybe<ThreadCategory>>>
  /** The media categories of the thread */
  mediaCategories: Maybe<Array<Maybe<Media>>>
}

/** Forum Thread */
export type ThreadBodyArgs = {
  asHtml: Maybe<Scalars['Boolean']>
}

/** A forum thread category */
export type ThreadCategory = {
  __typename?: 'ThreadCategory'
  /** The id of the category */
  id: Scalars['Int']
  /** The name of the category */
  name: Scalars['String']
}

/** Forum Thread Comment */
export type ThreadComment = {
  __typename?: 'ThreadComment'
  /** The id of the comment */
  id: Scalars['Int']
  /** The user id of the comment's owner */
  userId: Maybe<Scalars['Int']>
  /** The id of thread the comment belongs to */
  threadId: Maybe<Scalars['Int']>
  /** The text content of the comment (Markdown) */
  comment: Maybe<Scalars['String']>
  /** The url for the comment page on the AniList website */
  siteUrl: Maybe<Scalars['String']>
  /** The time of the comments creation */
  createdAt: Scalars['Int']
  /** The time of the comments last update */
  updatedAt: Scalars['Int']
  /** The thread the comment belongs to */
  thread: Maybe<Thread>
  /** The user who created the comment */
  user: Maybe<User>
  /** The users who liked the comment */
  likes: Maybe<Array<Maybe<User>>>
  /** The comment's child reply comments */
  childComments: Maybe<Scalars['Json']>
}

/** Forum Thread Comment */
export type ThreadCommentCommentArgs = {
  asHtml: Maybe<Scalars['Boolean']>
}

/** Notification for when a thread comment is liked */
export type ThreadCommentLikeNotification = {
  __typename?: 'ThreadCommentLikeNotification'
  /** The id of the Notification */
  id: Scalars['Int']
  /** The id of the user who liked to the activity */
  userId: Scalars['Int']
  /** The type of notification */
  type: Maybe<NotificationType>
  /** The id of the activity which was liked */
  commentId: Scalars['Int']
  /** The notification context text */
  context: Maybe<Scalars['String']>
  /** The time the notification was created at */
  createdAt: Maybe<Scalars['Int']>
  /** The thread that the relevant comment belongs to */
  thread: Maybe<Thread>
  /** The thread comment that was liked */
  comment: Maybe<ThreadComment>
  /** The user who liked the activity */
  user: Maybe<User>
}

/** Notification for when authenticated user is @ mentioned in a forum thread comment */
export type ThreadCommentMentionNotification = {
  __typename?: 'ThreadCommentMentionNotification'
  /** The id of the Notification */
  id: Scalars['Int']
  /** The id of the user who mentioned the authenticated user */
  userId: Scalars['Int']
  /** The type of notification */
  type: Maybe<NotificationType>
  /** The id of the comment where mentioned */
  commentId: Scalars['Int']
  /** The notification context text */
  context: Maybe<Scalars['String']>
  /** The time the notification was created at */
  createdAt: Maybe<Scalars['Int']>
  /** The thread that the relevant comment belongs to */
  thread: Maybe<Thread>
  /** The thread comment that included the @ mention */
  comment: Maybe<ThreadComment>
  /** The user who mentioned the authenticated user */
  user: Maybe<User>
}

/** Notification for when a user replies to your forum thread comment */
export type ThreadCommentReplyNotification = {
  __typename?: 'ThreadCommentReplyNotification'
  /** The id of the Notification */
  id: Scalars['Int']
  /** The id of the user who create the comment reply */
  userId: Scalars['Int']
  /** The type of notification */
  type: Maybe<NotificationType>
  /** The id of the reply comment */
  commentId: Scalars['Int']
  /** The notification context text */
  context: Maybe<Scalars['String']>
  /** The time the notification was created at */
  createdAt: Maybe<Scalars['Int']>
  /** The thread that the relevant comment belongs to */
  thread: Maybe<Thread>
  /** The reply thread comment */
  comment: Maybe<ThreadComment>
  /** The user who replied to the activity */
  user: Maybe<User>
}

/** Thread comments sort enums */
export enum ThreadCommentSort {
  Id = 'ID',
  IdDesc = 'ID_DESC',
}

/** Notification for when a user replies to a subscribed forum thread */
export type ThreadCommentSubscribedNotification = {
  __typename?: 'ThreadCommentSubscribedNotification'
  /** The id of the Notification */
  id: Scalars['Int']
  /** The id of the user who commented on the thread */
  userId: Scalars['Int']
  /** The type of notification */
  type: Maybe<NotificationType>
  /** The id of the new comment in the subscribed thread */
  commentId: Scalars['Int']
  /** The notification context text */
  context: Maybe<Scalars['String']>
  /** The time the notification was created at */
  createdAt: Maybe<Scalars['Int']>
  /** The thread that the relevant comment belongs to */
  thread: Maybe<Thread>
  /** The reply thread comment */
  comment: Maybe<ThreadComment>
  /** The user who replied to the subscribed thread */
  user: Maybe<User>
}

/** Notification for when a thread is liked */
export type ThreadLikeNotification = {
  __typename?: 'ThreadLikeNotification'
  /** The id of the Notification */
  id: Scalars['Int']
  /** The id of the user who liked to the activity */
  userId: Scalars['Int']
  /** The type of notification */
  type: Maybe<NotificationType>
  /** The id of the thread which was liked */
  threadId: Scalars['Int']
  /** The notification context text */
  context: Maybe<Scalars['String']>
  /** The time the notification was created at */
  createdAt: Maybe<Scalars['Int']>
  /** The thread that the relevant comment belongs to */
  thread: Maybe<Thread>
  /** The liked thread comment */
  comment: Maybe<ThreadComment>
  /** The user who liked the activity */
  user: Maybe<User>
}

/** Thread sort enums */
export enum ThreadSort {
  Id = 'ID',
  IdDesc = 'ID_DESC',
  Title = 'TITLE',
  TitleDesc = 'TITLE_DESC',
  CreatedAt = 'CREATED_AT',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAt = 'UPDATED_AT',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  RepliedAt = 'REPLIED_AT',
  RepliedAtDesc = 'REPLIED_AT_DESC',
  ReplyCount = 'REPLY_COUNT',
  ReplyCountDesc = 'REPLY_COUNT_DESC',
  ViewCount = 'VIEW_COUNT',
  ViewCountDesc = 'VIEW_COUNT_DESC',
  IsSticky = 'IS_STICKY',
  SearchMatch = 'SEARCH_MATCH',
}

/** A user */
export type User = {
  __typename?: 'User'
  /** The id of the user */
  id: Scalars['Int']
  /** The name of the user */
  name: Scalars['String']
  /** The bio written by user (Markdown) */
  about: Maybe<Scalars['String']>
  /** The user's avatar images */
  avatar: Maybe<UserAvatar>
  /** The user's banner images */
  bannerImage: Maybe<Scalars['String']>
  /** If the authenticated user if following this user */
  isFollowing: Maybe<Scalars['Boolean']>
  /** If the user is blocked by the authenticated user */
  isBlocked: Maybe<Scalars['Boolean']>
  bans: Maybe<Scalars['Json']>
  /** The user's general options */
  options: Maybe<UserOptions>
  /** The user's media list options */
  mediaListOptions: Maybe<MediaListOptions>
  /** The users favourites */
  favourites: Maybe<Favourites>
  /** The users anime & manga list statistics */
  statistics: Maybe<UserStatisticTypes>
  /** The number of unread notifications the user has */
  unreadNotificationCount: Maybe<Scalars['Int']>
  /** The url for the user page on the AniList website */
  siteUrl: Maybe<Scalars['String']>
  /** The donation tier of the user */
  donatorTier: Maybe<Scalars['Int']>
  /** Custom donation badge text */
  donatorBadge: Maybe<Scalars['String']>
  /** If the user is a moderator or data moderator */
  moderatorStatus: Maybe<Scalars['String']>
  /** When the user's data was last updated */
  updatedAt: Maybe<Scalars['Int']>
  /** The user's statistics */
  stats: Maybe<UserStats>
}

/** A user */
export type UserAboutArgs = {
  asHtml: Maybe<Scalars['Boolean']>
}

/** A user */
export type UserFavouritesArgs = {
  page: Maybe<Scalars['Int']>
}

/** A user's activity history stats. */
export type UserActivityHistory = {
  __typename?: 'UserActivityHistory'
  /** The day the activity took place (Unix timestamp) */
  date: Maybe<Scalars['Int']>
  /** The amount of activity on the day */
  amount: Maybe<Scalars['Int']>
  /** The level of activity represented on a 1-10 scale */
  level: Maybe<Scalars['Int']>
}

/** A user's avatars */
export type UserAvatar = {
  __typename?: 'UserAvatar'
  /** The avatar of user at its largest size */
  large: Maybe<Scalars['String']>
  /** The avatar of user at medium size */
  medium: Maybe<Scalars['String']>
}

export type UserCountryStatistic = {
  __typename?: 'UserCountryStatistic'
  count: Scalars['Int']
  meanScore: Scalars['Float']
  minutesWatched: Scalars['Int']
  chaptersRead: Scalars['Int']
  mediaIds: Array<Maybe<Scalars['Int']>>
  country: Maybe<Scalars['CountryCode']>
}

export type UserFormatStatistic = {
  __typename?: 'UserFormatStatistic'
  count: Scalars['Int']
  meanScore: Scalars['Float']
  minutesWatched: Scalars['Int']
  chaptersRead: Scalars['Int']
  mediaIds: Array<Maybe<Scalars['Int']>>
  format: Maybe<MediaFormat>
}

export type UserGenreStatistic = {
  __typename?: 'UserGenreStatistic'
  count: Scalars['Int']
  meanScore: Scalars['Float']
  minutesWatched: Scalars['Int']
  chaptersRead: Scalars['Int']
  mediaIds: Array<Maybe<Scalars['Int']>>
  genre: Maybe<Scalars['String']>
}

export type UserLengthStatistic = {
  __typename?: 'UserLengthStatistic'
  count: Scalars['Int']
  meanScore: Scalars['Float']
  minutesWatched: Scalars['Int']
  chaptersRead: Scalars['Int']
  mediaIds: Array<Maybe<Scalars['Int']>>
  length: Maybe<Scalars['String']>
}

/** User data for moderators */
export type UserModData = {
  __typename?: 'UserModData'
  alts: Maybe<Array<Maybe<User>>>
  bans: Maybe<Scalars['Json']>
  ip: Maybe<Scalars['Json']>
  counts: Maybe<Scalars['Json']>
}

/** A user's general options */
export type UserOptions = {
  __typename?: 'UserOptions'
  /** The language the user wants to see media titles in */
  titleLanguage: Maybe<UserTitleLanguage>
  /** Whether the user has enabled viewing of 18+ content */
  displayAdultContent: Maybe<Scalars['Boolean']>
  /** Whether the user receives notifications when a show they are watching aires */
  airingNotifications: Maybe<Scalars['Boolean']>
  /** Profile highlight color (blue, purple, pink, orange, red, green, gray) */
  profileColor: Maybe<Scalars['String']>
  /** Notification options */
  notificationOptions: Maybe<Array<Maybe<NotificationOption>>>
}

export type UserReleaseYearStatistic = {
  __typename?: 'UserReleaseYearStatistic'
  count: Scalars['Int']
  meanScore: Scalars['Float']
  minutesWatched: Scalars['Int']
  chaptersRead: Scalars['Int']
  mediaIds: Array<Maybe<Scalars['Int']>>
  releaseYear: Maybe<Scalars['Int']>
}

export type UserScoreStatistic = {
  __typename?: 'UserScoreStatistic'
  count: Scalars['Int']
  meanScore: Scalars['Float']
  minutesWatched: Scalars['Int']
  chaptersRead: Scalars['Int']
  mediaIds: Array<Maybe<Scalars['Int']>>
  score: Maybe<Scalars['Int']>
}

/** User sort enums */
export enum UserSort {
  Id = 'ID',
  IdDesc = 'ID_DESC',
  Username = 'USERNAME',
  UsernameDesc = 'USERNAME_DESC',
  WatchedTime = 'WATCHED_TIME',
  WatchedTimeDesc = 'WATCHED_TIME_DESC',
  ChaptersRead = 'CHAPTERS_READ',
  ChaptersReadDesc = 'CHAPTERS_READ_DESC',
  SearchMatch = 'SEARCH_MATCH',
}

export type UserStaffStatistic = {
  __typename?: 'UserStaffStatistic'
  count: Scalars['Int']
  meanScore: Scalars['Float']
  minutesWatched: Scalars['Int']
  chaptersRead: Scalars['Int']
  mediaIds: Array<Maybe<Scalars['Int']>>
  staff: Maybe<Staff>
}

export type UserStartYearStatistic = {
  __typename?: 'UserStartYearStatistic'
  count: Scalars['Int']
  meanScore: Scalars['Float']
  minutesWatched: Scalars['Int']
  chaptersRead: Scalars['Int']
  mediaIds: Array<Maybe<Scalars['Int']>>
  startYear: Maybe<Scalars['Int']>
}

export type UserStatistics = {
  __typename?: 'UserStatistics'
  count: Scalars['Int']
  meanScore: Scalars['Float']
  standardDeviation: Scalars['Float']
  minutesWatched: Scalars['Int']
  episodesWatched: Scalars['Int']
  chaptersRead: Scalars['Int']
  volumesRead: Scalars['Int']
  formats: Maybe<Array<Maybe<UserFormatStatistic>>>
  statuses: Maybe<Array<Maybe<UserStatusStatistic>>>
  scores: Maybe<Array<Maybe<UserScoreStatistic>>>
  lengths: Maybe<Array<Maybe<UserLengthStatistic>>>
  releaseYears: Maybe<Array<Maybe<UserReleaseYearStatistic>>>
  startYears: Maybe<Array<Maybe<UserStartYearStatistic>>>
  genres: Maybe<Array<Maybe<UserGenreStatistic>>>
  tags: Maybe<Array<Maybe<UserTagStatistic>>>
  countries: Maybe<Array<Maybe<UserCountryStatistic>>>
  voiceActors: Maybe<Array<Maybe<UserVoiceActorStatistic>>>
  staff: Maybe<Array<Maybe<UserStaffStatistic>>>
  studios: Maybe<Array<Maybe<UserStudioStatistic>>>
}

export type UserStatisticsFormatsArgs = {
  limit: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<UserStatisticsSort>>>
}

export type UserStatisticsStatusesArgs = {
  limit: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<UserStatisticsSort>>>
}

export type UserStatisticsScoresArgs = {
  limit: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<UserStatisticsSort>>>
}

export type UserStatisticsLengthsArgs = {
  limit: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<UserStatisticsSort>>>
}

export type UserStatisticsReleaseYearsArgs = {
  limit: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<UserStatisticsSort>>>
}

export type UserStatisticsStartYearsArgs = {
  limit: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<UserStatisticsSort>>>
}

export type UserStatisticsGenresArgs = {
  limit: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<UserStatisticsSort>>>
}

export type UserStatisticsTagsArgs = {
  limit: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<UserStatisticsSort>>>
}

export type UserStatisticsCountriesArgs = {
  limit: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<UserStatisticsSort>>>
}

export type UserStatisticsVoiceActorsArgs = {
  limit: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<UserStatisticsSort>>>
}

export type UserStatisticsStaffArgs = {
  limit: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<UserStatisticsSort>>>
}

export type UserStatisticsStudiosArgs = {
  limit: Maybe<Scalars['Int']>
  sort: Maybe<Array<Maybe<UserStatisticsSort>>>
}

/** User statistics sort enum */
export enum UserStatisticsSort {
  Id = 'ID',
  IdDesc = 'ID_DESC',
  Count = 'COUNT',
  CountDesc = 'COUNT_DESC',
  Progress = 'PROGRESS',
  ProgressDesc = 'PROGRESS_DESC',
  MeanScore = 'MEAN_SCORE',
  MeanScoreDesc = 'MEAN_SCORE_DESC',
}

export type UserStatisticTypes = {
  __typename?: 'UserStatisticTypes'
  anime: Maybe<UserStatistics>
  manga: Maybe<UserStatistics>
}

/** A user's statistics */
export type UserStats = {
  __typename?: 'UserStats'
  /** The amount of anime the user has watched in minutes */
  watchedTime: Maybe<Scalars['Int']>
  /** The amount of manga chapters the user has read */
  chaptersRead: Maybe<Scalars['Int']>
  activityHistory: Maybe<Array<Maybe<UserActivityHistory>>>
  animeStatusDistribution: Maybe<Array<Maybe<StatusDistribution>>>
  mangaStatusDistribution: Maybe<Array<Maybe<StatusDistribution>>>
  animeScoreDistribution: Maybe<Array<Maybe<ScoreDistribution>>>
  mangaScoreDistribution: Maybe<Array<Maybe<ScoreDistribution>>>
  animeListScores: Maybe<ListScoreStats>
  mangaListScores: Maybe<ListScoreStats>
  favouredGenresOverview: Maybe<Array<Maybe<GenreStats>>>
  favouredGenres: Maybe<Array<Maybe<GenreStats>>>
  favouredTags: Maybe<Array<Maybe<TagStats>>>
  favouredActors: Maybe<Array<Maybe<StaffStats>>>
  favouredStaff: Maybe<Array<Maybe<StaffStats>>>
  favouredStudios: Maybe<Array<Maybe<StudioStats>>>
  favouredYears: Maybe<Array<Maybe<YearStats>>>
  favouredFormats: Maybe<Array<Maybe<FormatStats>>>
}

export type UserStatusStatistic = {
  __typename?: 'UserStatusStatistic'
  count: Scalars['Int']
  meanScore: Scalars['Float']
  minutesWatched: Scalars['Int']
  chaptersRead: Scalars['Int']
  mediaIds: Array<Maybe<Scalars['Int']>>
  status: Maybe<MediaListStatus>
}

export type UserStudioStatistic = {
  __typename?: 'UserStudioStatistic'
  count: Scalars['Int']
  meanScore: Scalars['Float']
  minutesWatched: Scalars['Int']
  chaptersRead: Scalars['Int']
  mediaIds: Array<Maybe<Scalars['Int']>>
  studio: Maybe<Studio>
}

export type UserTagStatistic = {
  __typename?: 'UserTagStatistic'
  count: Scalars['Int']
  meanScore: Scalars['Float']
  minutesWatched: Scalars['Int']
  chaptersRead: Scalars['Int']
  mediaIds: Array<Maybe<Scalars['Int']>>
  tag: Maybe<MediaTag>
}

/** The language the user wants to see media titles in */
export enum UserTitleLanguage {
  /** The romanization of the native language title */
  Romaji = 'ROMAJI',
  /** The official english title */
  English = 'ENGLISH',
  /** Official title in it's native language */
  Native = 'NATIVE',
  /** The romanization of the native language title, stylised by media creator */
  RomajiStylised = 'ROMAJI_STYLISED',
  /** The official english title, stylised by media creator */
  EnglishStylised = 'ENGLISH_STYLISED',
  /** Official title in it's native language, stylised by media creator */
  NativeStylised = 'NATIVE_STYLISED',
}

export type UserVoiceActorStatistic = {
  __typename?: 'UserVoiceActorStatistic'
  count: Scalars['Int']
  meanScore: Scalars['Float']
  minutesWatched: Scalars['Int']
  chaptersRead: Scalars['Int']
  mediaIds: Array<Maybe<Scalars['Int']>>
  voiceActor: Maybe<Staff>
  characterIds: Array<Maybe<Scalars['Int']>>
}

/** User's year statistics */
export type YearStats = {
  __typename?: 'YearStats'
  year: Maybe<Scalars['Int']>
  amount: Maybe<Scalars['Int']>
  meanScore: Maybe<Scalars['Int']>
}
export type LocalSourceAnimeQueryVariables = {
  id: Scalars['Int']
}

export type LocalSourceAnimeQuery = { __typename?: 'Query' } & {
  anime: Maybe<
    { __typename?: 'Media' } & Pick<Media, 'episodes'> & {
        title: Maybe<
          { __typename?: 'MediaTitle' } & Pick<
            MediaTitle,
            'english' | 'romaji' | 'userPreferred'
          >
        >
        listEntry: Maybe<
          { __typename?: 'ListEntry' } & Pick<ListEntry, 'progress'>
        >
      }
  >
}

export type ListEntryFragment = { __typename?: 'ListEntry' } & Pick<
  ListEntry,
  'id' | 'mediaId' | 'score' | 'progress' | 'status' | 'rewatched'
>

export type MediaListEntryFragment = { __typename?: 'Media' } & {
  listEntry: Maybe<{ __typename?: 'ListEntry' } & ListEntryFragment>
}

export type AniListEntryFragment = { __typename?: 'MediaList' } & Pick<
  MediaList,
  'id' | 'mediaId' | 'score' | 'progress' | 'status' | 'repeat'
>

export type AddToListMutationVariables = {
  anilistId: Scalars['Int']
}

export type AddToListMutation = { __typename?: 'Mutation' } & {
  AddToList: { __typename?: 'ListEntry' } & ListEntryFragment
}

export type UpdateStatusMutationVariables = {
  anilistId: Scalars['Int']
  status: MediaListStatus
}

export type UpdateStatusMutation = { __typename?: 'Mutation' } & {
  UpdateStatus: { __typename?: 'ListEntry' } & ListEntryFragment
}

export type StartRewatchingMutationVariables = {
  anilistId: Scalars['Int']
}

export type StartRewatchingMutation = { __typename?: 'Mutation' } & {
  StartRewatching: { __typename?: 'ListEntry' } & ListEntryFragment
}

export type UpdateProgressMutationVariables = {
  anilistId: Scalars['Int']
  progress: Scalars['Int']
}

export type UpdateProgressMutation = { __typename?: 'Mutation' } & {
  UpdateProgress: { __typename?: 'ListEntry' } & ListEntryFragment
}

export type UpdateScoreMutationVariables = {
  anilistId: Scalars['Int']
  score: Scalars['Int']
}

export type UpdateScoreMutation = { __typename?: 'Mutation' } & {
  UpdateScore: { __typename?: 'ListEntry' } & ListEntryFragment
}

export type DeleteFromListMutationVariables = {
  anilistId: Scalars['Int']
}

export type DeleteFromListMutation = { __typename?: 'Mutation' } & Pick<
  Mutation,
  'DeleteFromList'
>

export type EditListEntryMutationVariables = {
  anilistId: Scalars['Int']
  options: EditListEntryOptions
}

export type EditListEntryMutation = { __typename?: 'Mutation' } & {
  EditListEntry: { __typename?: 'ListEntry' } & ListEntryFragment
}

export type CacheEpisodesMutationVariables = {
  episodes: Array<EpisodeInput>
}

export type CacheEpisodesMutation = { __typename?: 'Mutation' } & Pick<
  Mutation,
  'CacheEpisodes'
>

export type SingleMediaQueryVariables = {
  mediaId: Scalars['Int']
}

export type SingleMediaQuery = { __typename?: 'Query' } & {
  SingleMedia: Maybe<
    { __typename?: 'Media' } & Pick<
      Media,
      'id' | 'isFavourite' | 'episodes'
    > & {
        title: Maybe<
          { __typename?: 'MediaTitle' } & Pick<
            MediaTitle,
            'userPreferred' | 'english' | 'romaji' | 'native'
          >
        >
        coverImage: Maybe<
          { __typename?: 'MediaCoverImage' } & Pick<
            MediaCoverImage,
            'medium' | 'color'
          >
        >
      }
  >
}

export type ListMediaQueryVariables = {
  mediaIds: Array<Scalars['Int']>
}

export type ListMediaQuery = { __typename?: 'Query' } & {
  Page: Maybe<
    { __typename?: 'Page' } & {
      media: Maybe<
        Array<
          Maybe<
            { __typename?: 'Media' } & Pick<
              Media,
              'id' | 'isFavourite' | 'episodes'
            > & {
                title: Maybe<
                  { __typename?: 'MediaTitle' } & Pick<
                    MediaTitle,
                    'userPreferred' | 'english' | 'romaji' | 'native'
                  >
                >
                coverImage: Maybe<
                  { __typename?: 'MediaCoverImage' } & Pick<
                    MediaCoverImage,
                    'medium' | 'color'
                  >
                >
              }
          >
        >
      >
    }
  >
}

export type ListEntryQueryVariables = {
  mediaId: Scalars['Int']
}

export type ListEntryQuery = { __typename?: 'Query' } & {
  ListEntry: { __typename?: 'ListEntry' } & Pick<ListEntry, 'id' | 'score'>
}

export type MediaListEntryFromMediaIdQueryVariables = {
  mediaId: Scalars['Int']
  userId: Scalars['Int']
}

export type MediaListEntryFromMediaIdQuery = { __typename?: 'Query' } & {
  MediaList: Maybe<{ __typename?: 'MediaList' } & AniListEntryFragment>
}

export type EpisodeListQueryVariables = {
  id: Scalars['Int']
  provider: Provider
}

export type EpisodeListQuery = { __typename?: 'Query' } & {
  episodes: Maybe<
    Array<
      { __typename?: 'Episode' } & Pick<
        Episode,
        | 'provider'
        | 'id'
        | 'animeId'
        | 'title'
        | 'duration'
        | 'progress'
        | 'index'
        | 'episodeNumber'
        | 'url'
        | 'subtitles'
        | 'thumbnail'
        | 'isWatched'
      >
    >
  >
}

export type MalIdFromAnilistIdQueryVariables = {
  mediaId: Scalars['Int']
}

export type MalIdFromAnilistIdQuery = { __typename?: 'Query' } & {
  Media: Maybe<{ __typename?: 'Media' } & Pick<Media, 'id' | 'idMal'>>
}

export type AnilistIdsFromMalIdsQueryVariables = {
  malIds: Array<Scalars['Int']>
}

export type AnilistIdsFromMalIdsQuery = { __typename?: 'Query' } & {
  Page: Maybe<
    { __typename?: 'Page' } & {
      media: Maybe<
        Array<Maybe<{ __typename?: 'Media' } & Pick<Media, 'id' | 'idMal'>>>
      >
    }
  >
}

export type EpisodeFeedListIdsQueryVariables = {}

export type EpisodeFeedListIdsQuery = { __typename?: 'Query' } & {
  ListEntries: Array<
    { __typename?: 'ListEntry' } & Pick<ListEntry, 'id' | 'mediaId'>
  >
}

export type MalScoreQueryVariables = {
  id: Scalars['Int']
}

export type MalScoreQuery = { __typename?: 'Query' } & {
  anime: Maybe<
    { __typename?: 'Media' } & Pick<Media, 'id' | 'idMal' | 'scoreMal'>
  >
}

export type SimklInfoQueryVariables = {
  id: Scalars['Int']
}

export type SimklInfoQuery = { __typename?: 'Query' } & {
  Media: Maybe<
    { __typename?: 'Media' } & Pick<Media, 'id' | 'scoreSimkl' | 'linkSimkl'>
  >
}

export type CacheEpisodesAiringQueryVariables = {
  id: Scalars['Int']
}

export type CacheEpisodesAiringQuery = { __typename?: 'Query' } & {
  AiringSchedule: Maybe<
    { __typename?: 'AiringSchedule' } & Pick<
      AiringSchedule,
      'id' | 'episode' | 'airingAt'
    >
  >
}

export type PlayerAnimeQueryVariables = {
  id: Scalars['Int']
}

export type PlayerAnimeQuery = { __typename?: 'Query' } & {
  anime: Maybe<
    { __typename?: 'Media' } & Pick<Media, 'id' | 'idMal' | 'episodes'> & {
        title: Maybe<
          { __typename?: 'MediaTitle' } & Pick<MediaTitle, 'userPreferred'>
        >
        nextAiringEpisode: Maybe<
          { __typename?: 'AiringSchedule' } & Pick<
            AiringSchedule,
            'airingAt' | 'timeUntilAiring'
          >
        >
        relations: Maybe<
          { __typename?: 'MediaConnection' } & {
            edges: Maybe<
              Array<
                Maybe<
                  { __typename?: 'MediaEdge' } & Pick<
                    MediaEdge,
                    'relationType'
                  > & {
                      node: Maybe<
                        { __typename?: 'Media' } & Pick<
                          Media,
                          'id' | 'bannerImage'
                        > & {
                            title: Maybe<
                              { __typename?: 'MediaTitle' } & Pick<
                                MediaTitle,
                                'userPreferred'
                              >
                            >
                          }
                      >
                    }
                >
              >
            >
          }
        >
        listEntry: Maybe<
          { __typename?: 'ListEntry' } & Pick<
            ListEntry,
            'id' | 'mediaId' | 'status' | 'progress' | 'score'
          >
        >
      }
  >
}

export type SearchQueryVariables = {
  search: Maybe<Scalars['String']>
}

export type SearchQuery = { __typename?: 'Query' } & {
  anime: Maybe<
    { __typename?: 'Page' } & {
      pageInfo: Maybe<{ __typename?: 'PageInfo' } & Pick<PageInfo, 'total'>>
      results: Maybe<
        Array<
          Maybe<
            { __typename?: 'Media' } & Pick<Media, 'id' | 'type'> & {
                title: Maybe<
                  { __typename?: 'MediaTitle' } & Pick<
                    MediaTitle,
                    'userPreferred'
                  >
                >
                coverImage: Maybe<
                  { __typename?: 'MediaCoverImage' } & Pick<
                    MediaCoverImage,
                    'medium'
                  >
                >
                streamingEpisodes: Maybe<
                  Array<
                    Maybe<
                      { __typename?: 'MediaStreamingEpisode' } & Pick<
                        MediaStreamingEpisode,
                        'site'
                      >
                    >
                  >
                >
                externalLinks: Maybe<
                  Array<
                    Maybe<
                      { __typename?: 'MediaExternalLink' } & Pick<
                        MediaExternalLink,
                        'site'
                      >
                    >
                  >
                >
              }
          >
        >
      >
    }
  >
}

export type AnilistSetScoreMutationVariables = {
  mediaId: Maybe<Scalars['Int']>
  score: Maybe<Scalars['Int']>
}

export type AnilistSetScoreMutation = { __typename?: 'Mutation' } & {
  SaveMediaListEntry: Maybe<{ __typename?: 'MediaList' } & AniListEntryFragment>
}

export type AnilistSetStatusMutationVariables = {
  mediaId: Maybe<Scalars['Int']>
  status: Maybe<MediaListStatus>
}

export type AnilistSetStatusMutation = { __typename?: 'Mutation' } & {
  SaveMediaListEntry: Maybe<{ __typename?: 'MediaList' } & AniListEntryFragment>
}

export type AnilistSetProgressMutationVariables = {
  mediaId: Maybe<Scalars['Int']>
  progress: Maybe<Scalars['Int']>
}

export type AnilistSetProgressMutation = { __typename?: 'Mutation' } & {
  SaveMediaListEntry: Maybe<{ __typename?: 'MediaList' } & AniListEntryFragment>
}

export type AnilistCreateEntryMutationVariables = {
  mediaId: Maybe<Scalars['Int']>
}

export type AnilistCreateEntryMutation = { __typename?: 'Mutation' } & {
  SaveMediaListEntry: Maybe<{ __typename?: 'MediaList' } & AniListEntryFragment>
}

export type AnilistStartRewatchingMutationVariables = {
  mediaId: Maybe<Scalars['Int']>
}

export type AnilistStartRewatchingMutation = { __typename?: 'Mutation' } & {
  SaveMediaListEntry: Maybe<{ __typename?: 'MediaList' } & AniListEntryFragment>
}

export type AnilistDeleteEntryMutationVariables = {
  id: Scalars['Int']
}

export type AnilistDeleteEntryMutation = { __typename?: 'Mutation' } & {
  DeleteMediaListEntry: Maybe<
    { __typename?: 'Deleted' } & Pick<Deleted, 'deleted'>
  >
}

export type AnilistEditListEntryMutationVariables = {
  id: Scalars['Int']
  progress: Scalars['Int']
  status: MediaListStatus
  repeat: Scalars['Int']
  score: Maybe<Scalars['Int']>
}

export type AnilistEditListEntryMutation = { __typename?: 'Mutation' } & {
  SaveMediaListEntry: Maybe<
    { __typename?: 'MediaList' } & Pick<
      MediaList,
      'id' | 'score' | 'progress' | 'status' | 'repeat'
    >
  >
}

export type AnilistAllListEntriesQueryVariables = {
  userId: Scalars['Int']
  page: Maybe<Scalars['Int']>
  perPage: Maybe<Scalars['Int']>
  status: Maybe<MediaListStatus>
  status_not: Maybe<MediaListStatus>
}

export type AnilistAllListEntriesQuery = { __typename?: 'Query' } & {
  listCollection: Maybe<
    { __typename?: 'MediaListCollection' } & {
      lists: Maybe<
        Array<
          Maybe<
            { __typename?: 'MediaListGroup' } & Pick<
              MediaListGroup,
              'name' | 'isCustomList'
            > & {
                entries: Maybe<
                  Array<
                    Maybe<{ __typename?: 'MediaList' } & AniListEntryFragment>
                  >
                >
              }
          >
        >
      >
    }
  >
}

export type CachedAnimeListEntryFragment = { __typename?: 'Media' } & {
  listEntry: Maybe<{ __typename?: 'ListEntry' } & Pick<ListEntry, 'progress'>>
}

export type CachedMalIdFragment = { __typename?: 'Media' } & Pick<
  Media,
  'idMal'
>

export type CachedExternalLinksFragment = { __typename?: 'Media' } & {
  externalLinks: Maybe<
    Array<
      Maybe<
        { __typename?: 'MediaExternalLink' } & Pick<
          MediaExternalLink,
          'site' | 'url'
        >
      >
    >
  >
}

export type CacheAiringDataFragment = { __typename?: 'Media' } & {
  nextAiringEpisode: Maybe<
    { __typename?: 'AiringSchedule' } & Pick<AiringSchedule, 'airingAt'>
  >
}

export type AnimeViewQueryVariables = {
  id: Maybe<Scalars['Int']>
}

export type AnimeViewQuery = { __typename?: 'Query' } & {
  anime: Maybe<
    { __typename?: 'Media' } & Pick<
      Media,
      | 'id'
      | 'idMal'
      | 'description'
      | 'duration'
      | 'episodes'
      | 'isFavourite'
      | 'averageScore'
      | 'bannerImage'
    > & {
        title: Maybe<
          { __typename?: 'MediaTitle' } & Pick<
            MediaTitle,
            'english' | 'native' | 'romaji' | 'userPreferred'
          >
        >
        coverImage: Maybe<
          { __typename?: 'MediaCoverImage' } & Pick<
            MediaCoverImage,
            'extraLarge' | 'color'
          >
        >
        nextAiringEpisode: Maybe<
          { __typename?: 'AiringSchedule' } & Pick<
            AiringSchedule,
            'airingAt' | 'timeUntilAiring' | 'episode'
          >
        >
        externalLinks: Maybe<
          Array<
            Maybe<
              { __typename?: 'MediaExternalLink' } & Pick<
                MediaExternalLink,
                'site' | 'url'
              >
            >
          >
        >
        relations: Maybe<
          { __typename?: 'MediaConnection' } & {
            edges: Maybe<
              Array<
                Maybe<
                  { __typename?: 'MediaEdge' } & Pick<
                    MediaEdge,
                    'relationType'
                  > & {
                      node: Maybe<
                        { __typename?: 'Media' } & Pick<
                          Media,
                          'id' | 'bannerImage'
                        > & {
                            title: Maybe<
                              { __typename?: 'MediaTitle' } & Pick<
                                MediaTitle,
                                'userPreferred'
                              >
                            >
                          }
                      >
                    }
                >
              >
            >
          }
        >
        listEntry: Maybe<
          { __typename?: 'ListEntry' } & Pick<
            ListEntry,
            'id' | 'mediaId' | 'progress' | 'status' | 'score' | 'rewatched'
          >
        >
      }
  >
}

export type EpisodeFeedQueryVariables = {
  page: Scalars['Int']
  startDate: Scalars['Int']
  endDate: Scalars['Int']
  ids: Array<Scalars['Int']>
}

export type EpisodeFeedQuery = { __typename?: 'Query' } & {
  Page: Maybe<
    { __typename?: 'Page' } & {
      airingSchedules: Maybe<
        Array<
          Maybe<
            { __typename?: 'AiringSchedule' } & Pick<
              AiringSchedule,
              'id' | 'episode' | 'airingAt'
            > & {
                media: Maybe<
                  { __typename?: 'Media' } & Pick<Media, 'id'> & {
                      title: Maybe<
                        { __typename?: 'MediaTitle' } & Pick<
                          MediaTitle,
                          'userPreferred'
                        >
                      >
                      coverImage: Maybe<
                        { __typename?: 'MediaCoverImage' } & Pick<
                          MediaCoverImage,
                          'color' | 'medium'
                        >
                      >
                    }
                >
              }
          >
        >
      >
      pageInfo: Maybe<
        { __typename?: 'PageInfo' } & Pick<PageInfo, 'hasNextPage'>
      >
    }
  >
}

export type ListViewQueryVariables = {
  page: Scalars['Int']
}

export type ListViewQuery = { __typename?: 'Query' } & {
  ListEntries: Array<
    { __typename?: 'ListEntry' } & Pick<
      ListEntry,
      'id' | 'mediaId' | 'status' | 'progress' | 'score' | 'rewatched'
    >
  >
}

export type QueueQueryVariables = {
  ids: Array<Scalars['Int']>
}

export type QueueQuery = { __typename?: 'Query' } & {
  queue: Maybe<
    { __typename?: 'Page' } & {
      anime: Maybe<
        Array<
          Maybe<
            { __typename?: 'Media' } & Pick<
              Media,
              'id' | 'idMal' | 'episodes' | 'status' | 'siteUrl' | 'bannerImage'
            > & {
                title: Maybe<
                  { __typename?: 'MediaTitle' } & Pick<
                    MediaTitle,
                    'userPreferred'
                  >
                >
                nextAiringEpisode: Maybe<
                  { __typename?: 'AiringSchedule' } & Pick<
                    AiringSchedule,
                    'airingAt' | 'timeUntilAiring' | 'episode'
                  >
                >
                externalLinks: Maybe<
                  Array<
                    Maybe<
                      { __typename?: 'MediaExternalLink' } & Pick<
                        MediaExternalLink,
                        'site' | 'url'
                      >
                    >
                  >
                >
                listEntry: Maybe<
                  { __typename?: 'ListEntry' } & Pick<
                    ListEntry,
                    'id' | 'progress' | 'status' | 'rewatched' | 'score'
                  >
                >
              }
          >
        >
      >
    }
  >
}

export type ImportQueryVariables = {
  status: MediaListStatus
  useExtraStatus: Scalars['Boolean']
  extraStatus: Maybe<MediaListStatus>
}

export type ImportQuery = { __typename?: 'Query' } & {
  ListEntries: Array<
    { __typename?: 'ListEntry' } & Pick<ListEntry, 'id' | 'mediaId' | 'status'>
  >
  ExtraListEntries: Array<
    { __typename?: 'ListEntry' } & Pick<ListEntry, 'id' | 'mediaId' | 'status'>
  >
}

export type ImportExternalLinksQueryVariables = {
  mediaId: Scalars['Int']
}

export type ImportExternalLinksQuery = { __typename?: 'Query' } & {
  Media: Maybe<
    { __typename?: 'Media' } & Pick<Media, 'id'> & {
        externalLinks: Maybe<
          Array<
            Maybe<
              { __typename?: 'MediaExternalLink' } & Pick<
                MediaExternalLink,
                'id' | 'site' | 'url'
              >
            >
          >
        >
      }
  >
}
export type LocalSourceAnimeVariables = LocalSourceAnimeQueryVariables
export type LocalSourceAnimeAnime = NonNullable<LocalSourceAnimeQuery['anime']>
export type LocalSourceAnimeTitle = NonNullable<
  (NonNullable<LocalSourceAnimeQuery['anime']>)['title']
>
export type LocalSourceAnimeListEntry = NonNullable<
  (NonNullable<LocalSourceAnimeQuery['anime']>)['listEntry']
>
export type MediaListEntryListEntry = ListEntryFragment
export type AddToListVariables = AddToListMutationVariables
export type AddToListAddToList = ListEntryFragment
export type UpdateStatusVariables = UpdateStatusMutationVariables
export type UpdateStatusUpdateStatus = ListEntryFragment
export type StartRewatchingVariables = StartRewatchingMutationVariables
export type StartRewatchingStartRewatching = ListEntryFragment
export type UpdateProgressVariables = UpdateProgressMutationVariables
export type UpdateProgressUpdateProgress = ListEntryFragment
export type UpdateScoreVariables = UpdateScoreMutationVariables
export type UpdateScoreUpdateScore = ListEntryFragment
export type DeleteFromListVariables = DeleteFromListMutationVariables
export type EditListEntryVariables = EditListEntryMutationVariables
export type EditListEntryEditListEntry = ListEntryFragment
export type CacheEpisodesVariables = CacheEpisodesMutationVariables
export type SingleMediaVariables = SingleMediaQueryVariables
export type SingleMediaSingleMedia = NonNullable<
  SingleMediaQuery['SingleMedia']
>
export type SingleMediaTitle = NonNullable<
  (NonNullable<SingleMediaQuery['SingleMedia']>)['title']
>
export type SingleMediaCoverImage = NonNullable<
  (NonNullable<SingleMediaQuery['SingleMedia']>)['coverImage']
>
export type ListMediaVariables = ListMediaQueryVariables
export type ListMediaPage = NonNullable<ListMediaQuery['Page']>
export type ListMediaMedia = NonNullable<
  (NonNullable<(NonNullable<ListMediaQuery['Page']>)['media']>)[0]
>
export type ListMediaTitle = NonNullable<
  (NonNullable<
    (NonNullable<(NonNullable<ListMediaQuery['Page']>)['media']>)[0]
  >)['title']
>
export type ListMediaCoverImage = NonNullable<
  (NonNullable<
    (NonNullable<(NonNullable<ListMediaQuery['Page']>)['media']>)[0]
  >)['coverImage']
>
export type ListEntryVariables = ListEntryQueryVariables
export type ListEntryListEntry = ListEntryQuery['ListEntry']
export type MediaListEntryFromMediaIdVariables = MediaListEntryFromMediaIdQueryVariables
export type MediaListEntryFromMediaIdMediaList = AniListEntryFragment
export type EpisodeListVariables = EpisodeListQueryVariables
export type EpisodeListEpisodes = NonNullable<
  (NonNullable<EpisodeListQuery['episodes']>)[0]
>
export type MalIdFromAnilistIdVariables = MalIdFromAnilistIdQueryVariables
export type MalIdFromAnilistIdMedia = NonNullable<
  MalIdFromAnilistIdQuery['Media']
>
export type AnilistIdsFromMalIdsVariables = AnilistIdsFromMalIdsQueryVariables
export type AnilistIdsFromMalIdsPage = NonNullable<
  AnilistIdsFromMalIdsQuery['Page']
>
export type AnilistIdsFromMalIdsMedia = NonNullable<
  (NonNullable<(NonNullable<AnilistIdsFromMalIdsQuery['Page']>)['media']>)[0]
>
export type EpisodeFeedListIdsVariables = EpisodeFeedListIdsQueryVariables
export type EpisodeFeedListIdsListEntries = NonNullable<
  EpisodeFeedListIdsQuery['ListEntries'][0]
>
export type MalScoreVariables = MalScoreQueryVariables
export type MalScoreAnime = NonNullable<MalScoreQuery['anime']>
export type SimklInfoVariables = SimklInfoQueryVariables
export type SimklInfoMedia = NonNullable<SimklInfoQuery['Media']>
export type CacheEpisodesAiringVariables = CacheEpisodesAiringQueryVariables
export type CacheEpisodesAiringAiringSchedule = NonNullable<
  CacheEpisodesAiringQuery['AiringSchedule']
>
export type PlayerAnimeVariables = PlayerAnimeQueryVariables
export type PlayerAnimeAnime = NonNullable<PlayerAnimeQuery['anime']>
export type PlayerAnimeTitle = NonNullable<
  (NonNullable<PlayerAnimeQuery['anime']>)['title']
>
export type PlayerAnimeNextAiringEpisode = NonNullable<
  (NonNullable<PlayerAnimeQuery['anime']>)['nextAiringEpisode']
>
export type PlayerAnimeRelations = NonNullable<
  (NonNullable<PlayerAnimeQuery['anime']>)['relations']
>
export type PlayerAnimeEdges = NonNullable<
  (NonNullable<
    (NonNullable<
      (NonNullable<PlayerAnimeQuery['anime']>)['relations']
    >)['edges']
  >)[0]
>
export type PlayerAnimeNode = NonNullable<
  (NonNullable<
    (NonNullable<
      (NonNullable<
        (NonNullable<PlayerAnimeQuery['anime']>)['relations']
      >)['edges']
    >)[0]
  >)['node']
>
export type PlayerAnime_Title = NonNullable<
  (NonNullable<
    (NonNullable<
      (NonNullable<
        (NonNullable<
          (NonNullable<PlayerAnimeQuery['anime']>)['relations']
        >)['edges']
      >)[0]
    >)['node']
  >)['title']
>
export type PlayerAnimeListEntry = NonNullable<
  (NonNullable<PlayerAnimeQuery['anime']>)['listEntry']
>
export type SearchVariables = SearchQueryVariables
export type SearchAnime = NonNullable<SearchQuery['anime']>
export type SearchPageInfo = NonNullable<
  (NonNullable<SearchQuery['anime']>)['pageInfo']
>
export type SearchResults = NonNullable<
  (NonNullable<(NonNullable<SearchQuery['anime']>)['results']>)[0]
>
export type SearchTitle = NonNullable<
  (NonNullable<
    (NonNullable<(NonNullable<SearchQuery['anime']>)['results']>)[0]
  >)['title']
>
export type SearchCoverImage = NonNullable<
  (NonNullable<
    (NonNullable<(NonNullable<SearchQuery['anime']>)['results']>)[0]
  >)['coverImage']
>
export type SearchStreamingEpisodes = NonNullable<
  (NonNullable<
    (NonNullable<
      (NonNullable<(NonNullable<SearchQuery['anime']>)['results']>)[0]
    >)['streamingEpisodes']
  >)[0]
>
export type SearchExternalLinks = NonNullable<
  (NonNullable<
    (NonNullable<
      (NonNullable<(NonNullable<SearchQuery['anime']>)['results']>)[0]
    >)['externalLinks']
  >)[0]
>
export type AnilistSetScoreVariables = AnilistSetScoreMutationVariables
export type AnilistSetScoreSaveMediaListEntry = AniListEntryFragment
export type AnilistSetStatusVariables = AnilistSetStatusMutationVariables
export type AnilistSetStatusSaveMediaListEntry = AniListEntryFragment
export type AnilistSetProgressVariables = AnilistSetProgressMutationVariables
export type AnilistSetProgressSaveMediaListEntry = AniListEntryFragment
export type AnilistCreateEntryVariables = AnilistCreateEntryMutationVariables
export type AnilistCreateEntrySaveMediaListEntry = AniListEntryFragment
export type AnilistStartRewatchingVariables = AnilistStartRewatchingMutationVariables
export type AnilistStartRewatchingSaveMediaListEntry = AniListEntryFragment
export type AnilistDeleteEntryVariables = AnilistDeleteEntryMutationVariables
export type AnilistDeleteEntryDeleteMediaListEntry = NonNullable<
  AnilistDeleteEntryMutation['DeleteMediaListEntry']
>
export type AnilistEditListEntryVariables = AnilistEditListEntryMutationVariables
export type AnilistEditListEntrySaveMediaListEntry = NonNullable<
  AnilistEditListEntryMutation['SaveMediaListEntry']
>
export type AnilistAllListEntriesVariables = AnilistAllListEntriesQueryVariables
export type AnilistAllListEntriesListCollection = NonNullable<
  AnilistAllListEntriesQuery['listCollection']
>
export type AnilistAllListEntriesLists = NonNullable<
  (NonNullable<
    (NonNullable<AnilistAllListEntriesQuery['listCollection']>)['lists']
  >)[0]
>
export type AnilistAllListEntriesEntries = AniListEntryFragment
export type CachedAnimeListEntryListEntry = NonNullable<
  CachedAnimeListEntryFragment['listEntry']
>
export type CachedExternalLinksExternalLinks = NonNullable<
  (NonNullable<CachedExternalLinksFragment['externalLinks']>)[0]
>
export type CacheAiringDataNextAiringEpisode = NonNullable<
  CacheAiringDataFragment['nextAiringEpisode']
>
export type AnimeViewVariables = AnimeViewQueryVariables
export type AnimeViewAnime = NonNullable<AnimeViewQuery['anime']>
export type AnimeViewTitle = NonNullable<
  (NonNullable<AnimeViewQuery['anime']>)['title']
>
export type AnimeViewCoverImage = NonNullable<
  (NonNullable<AnimeViewQuery['anime']>)['coverImage']
>
export type AnimeViewNextAiringEpisode = NonNullable<
  (NonNullable<AnimeViewQuery['anime']>)['nextAiringEpisode']
>
export type AnimeViewExternalLinks = NonNullable<
  (NonNullable<(NonNullable<AnimeViewQuery['anime']>)['externalLinks']>)[0]
>
export type AnimeViewRelations = NonNullable<
  (NonNullable<AnimeViewQuery['anime']>)['relations']
>
export type AnimeViewEdges = NonNullable<
  (NonNullable<
    (NonNullable<(NonNullable<AnimeViewQuery['anime']>)['relations']>)['edges']
  >)[0]
>
export type AnimeViewNode = NonNullable<
  (NonNullable<
    (NonNullable<
      (NonNullable<
        (NonNullable<AnimeViewQuery['anime']>)['relations']
      >)['edges']
    >)[0]
  >)['node']
>
export type AnimeView_Title = NonNullable<
  (NonNullable<
    (NonNullable<
      (NonNullable<
        (NonNullable<
          (NonNullable<AnimeViewQuery['anime']>)['relations']
        >)['edges']
      >)[0]
    >)['node']
  >)['title']
>
export type AnimeViewListEntry = NonNullable<
  (NonNullable<AnimeViewQuery['anime']>)['listEntry']
>
export type EpisodeFeedVariables = EpisodeFeedQueryVariables
export type EpisodeFeedPage = NonNullable<EpisodeFeedQuery['Page']>
export type EpisodeFeedAiringSchedules = NonNullable<
  (NonNullable<(NonNullable<EpisodeFeedQuery['Page']>)['airingSchedules']>)[0]
>
export type EpisodeFeedMedia = NonNullable<
  (NonNullable<
    (NonNullable<(NonNullable<EpisodeFeedQuery['Page']>)['airingSchedules']>)[0]
  >)['media']
>
export type EpisodeFeedTitle = NonNullable<
  (NonNullable<
    (NonNullable<
      (NonNullable<
        (NonNullable<EpisodeFeedQuery['Page']>)['airingSchedules']
      >)[0]
    >)['media']
  >)['title']
>
export type EpisodeFeedCoverImage = NonNullable<
  (NonNullable<
    (NonNullable<
      (NonNullable<
        (NonNullable<EpisodeFeedQuery['Page']>)['airingSchedules']
      >)[0]
    >)['media']
  >)['coverImage']
>
export type EpisodeFeedPageInfo = NonNullable<
  (NonNullable<EpisodeFeedQuery['Page']>)['pageInfo']
>
export type ListViewVariables = ListViewQueryVariables
export type ListViewListEntries = NonNullable<ListViewQuery['ListEntries'][0]>
export type QueueVariables = QueueQueryVariables
export type QueueQueue = NonNullable<QueueQuery['queue']>
export type QueueAnime = NonNullable<
  (NonNullable<(NonNullable<QueueQuery['queue']>)['anime']>)[0]
>
export type QueueTitle = NonNullable<
  (NonNullable<
    (NonNullable<(NonNullable<QueueQuery['queue']>)['anime']>)[0]
  >)['title']
>
export type QueueNextAiringEpisode = NonNullable<
  (NonNullable<
    (NonNullable<(NonNullable<QueueQuery['queue']>)['anime']>)[0]
  >)['nextAiringEpisode']
>
export type QueueExternalLinks = NonNullable<
  (NonNullable<
    (NonNullable<
      (NonNullable<(NonNullable<QueueQuery['queue']>)['anime']>)[0]
    >)['externalLinks']
  >)[0]
>
export type QueueListEntry = NonNullable<
  (NonNullable<
    (NonNullable<(NonNullable<QueueQuery['queue']>)['anime']>)[0]
  >)['listEntry']
>
export type ImportVariables = ImportQueryVariables
export type ImportListEntries = NonNullable<ImportQuery['ListEntries'][0]>
export type ImportExtraListEntries = NonNullable<
  ImportQuery['ExtraListEntries'][0]
>
export type ImportExternalLinksVariables = ImportExternalLinksQueryVariables
export type ImportExternalLinksMedia = NonNullable<
  ImportExternalLinksQuery['Media']
>
export type ImportExternalLinksExternalLinks = NonNullable<
  (NonNullable<
    (NonNullable<ImportExternalLinksQuery['Media']>)['externalLinks']
  >)[0]
>
