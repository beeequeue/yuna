 // tslint:disable
 // THIS IS A GENERATED FILE
export type Maybe<T> = T | null;

/** Notification option input */
export interface NotificationOptionInput {
  /** The type of notification */
  readonly type: Maybe<NotificationType>;
  /** Whether this type of notification is enabled */
  readonly enabled: Maybe<boolean>;
}
/** A user's list options for anime or manga lists */
export interface MediaListOptionsInput {
  /** The order each list should be displayed in */
  readonly sectionOrder: Maybe<ReadonlyArray<string>>;
  /** If the completed sections of the list should be separated by format */
  readonly splitCompletedSectionByFormat: Maybe<boolean>;
  /** The names of the user's custom lists */
  readonly customLists: Maybe<ReadonlyArray<string>>;
  /** The names of the user's advanced scoring sections */
  readonly advancedScoring: Maybe<ReadonlyArray<string>>;
  /** If advanced scoring is enabled */
  readonly advancedScoringEnabled: Maybe<boolean>;
  /** list theme */
  readonly theme: Maybe<string>;
}
/** Date object that allows for incomplete date values (fuzzy) */
export interface FuzzyDateInput {
  /** Numeric Year (2017) */
  readonly year: Maybe<number>;
  /** Numeric Month (3) */
  readonly month: Maybe<number>;
  /** Numeric Day (24) */
  readonly day: Maybe<number>;
}

export interface AiringScheduleInput {
  
  readonly airingAt: Maybe<number>;
  
  readonly episode: Maybe<number>;
  
  readonly timeUntilAiring: Maybe<number>;
}
/** The names of the character */
export interface CharacterNameInput {
  /** The character's given name */
  readonly first: Maybe<string>;
  /** The character's surname */
  readonly last: Maybe<string>;
  /** The character's full name in their native language */
  readonly native: Maybe<string>;
  /** Other names the character might be referred by */
  readonly alternative: Maybe<ReadonlyArray<string>>;
}
/** An external link to another site related to the media */
export interface MediaExternalLinkInput {
  /** The id of the external link */
  readonly id: number;
  /** The url of the external link */
  readonly url: string;
  /** The site location of the external link */
  readonly site: string;
}
/** The official titles of the media in various languages */
export interface MediaTitleInput {
  /** The romanization of the native language title */
  readonly romaji: Maybe<string>;
  /** The official english title */
  readonly english: Maybe<string>;
  /** Official title in it's native language */
  readonly native: Maybe<string>;
}
/** The names of the staff member */
export interface StaffNameInput {
  /** The person's given name */
  readonly first: Maybe<string>;
  /** The person's surname */
  readonly last: Maybe<string>;
  /** The person's full name in their native language */
  readonly native: Maybe<string>;
}
/** User sort enums */
export enum UserSort {
  Id = "ID",
  IdDesc = "ID_DESC",
  Username = "USERNAME",
  UsernameDesc = "USERNAME_DESC",
  WatchedTime = "WATCHED_TIME",
  WatchedTimeDesc = "WATCHED_TIME_DESC",
  ChaptersRead = "CHAPTERS_READ",
  ChaptersReadDesc = "CHAPTERS_READ_DESC",
  SearchMatch = "SEARCH_MATCH",
}
/** The language the user wants to see media titles in */
export enum UserTitleLanguage {
  Romaji = "ROMAJI",
  English = "ENGLISH",
  Native = "NATIVE",
  RomajiStylised = "ROMAJI_STYLISED",
  EnglishStylised = "ENGLISH_STYLISED",
  NativeStylised = "NATIVE_STYLISED",
}
/** Notification type enum */
export enum NotificationType {
  ActivityMessage = "ACTIVITY_MESSAGE",
  ActivityReply = "ACTIVITY_REPLY",
  Following = "FOLLOWING",
  ActivityMention = "ACTIVITY_MENTION",
  ThreadCommentMention = "THREAD_COMMENT_MENTION",
  ThreadSubscribed = "THREAD_SUBSCRIBED",
  ThreadCommentReply = "THREAD_COMMENT_REPLY",
  Airing = "AIRING",
  ActivityLike = "ACTIVITY_LIKE",
  ActivityReplyLike = "ACTIVITY_REPLY_LIKE",
  ThreadLike = "THREAD_LIKE",
  ThreadCommentLike = "THREAD_COMMENT_LIKE",
  ActivityReplySubscribed = "ACTIVITY_REPLY_SUBSCRIBED",
}
/** Media list scoring type */
export enum ScoreFormat {
  Point_100 = "POINT_100",
  Point_10Decimal = "POINT_10_DECIMAL",
  Point_10 = "POINT_10",
  Point_5 = "POINT_5",
  Point_3 = "POINT_3",
}
/** Media type enum, anime or manga. */
export enum MediaType {
  Anime = "ANIME",
  Manga = "MANGA",
}
/** The format the media was released in */
export enum MediaFormat {
  Tv = "TV",
  TvShort = "TV_SHORT",
  Movie = "MOVIE",
  Special = "SPECIAL",
  Ova = "OVA",
  Ona = "ONA",
  Music = "MUSIC",
  Manga = "MANGA",
  Novel = "NOVEL",
  OneShot = "ONE_SHOT",
}
/** The current releasing status of the media */
export enum MediaStatus {
  Finished = "FINISHED",
  Releasing = "RELEASING",
  NotYetReleased = "NOT_YET_RELEASED",
  Cancelled = "CANCELLED",
}

export enum MediaSeason {
  Winter = "WINTER",
  Spring = "SPRING",
  Summer = "SUMMER",
  Fall = "FALL",
}
/** Source type the media was adapted from */
export enum MediaSource {
  Original = "ORIGINAL",
  Manga = "MANGA",
  LightNovel = "LIGHT_NOVEL",
  VisualNovel = "VISUAL_NOVEL",
  VideoGame = "VIDEO_GAME",
  Other = "OTHER",
  Novel = "NOVEL",
  Doujinshi = "DOUJINSHI",
  Anime = "ANIME",
}
/** Character sort enums */
export enum CharacterSort {
  Id = "ID",
  IdDesc = "ID_DESC",
  Role = "ROLE",
  RoleDesc = "ROLE_DESC",
  SearchMatch = "SEARCH_MATCH",
  Favourites = "FAVOURITES",
  FavouritesDesc = "FAVOURITES_DESC",
}
/** The role the character plays in the media */
export enum CharacterRole {
  Main = "MAIN",
  Supporting = "SUPPORTING",
  Background = "BACKGROUND",
}
/** Media sort enums */
export enum MediaSort {
  Id = "ID",
  IdDesc = "ID_DESC",
  TitleRomaji = "TITLE_ROMAJI",
  TitleRomajiDesc = "TITLE_ROMAJI_DESC",
  TitleEnglish = "TITLE_ENGLISH",
  TitleEnglishDesc = "TITLE_ENGLISH_DESC",
  TitleNative = "TITLE_NATIVE",
  TitleNativeDesc = "TITLE_NATIVE_DESC",
  Type = "TYPE",
  TypeDesc = "TYPE_DESC",
  Format = "FORMAT",
  FormatDesc = "FORMAT_DESC",
  StartDate = "START_DATE",
  StartDateDesc = "START_DATE_DESC",
  EndDate = "END_DATE",
  EndDateDesc = "END_DATE_DESC",
  Score = "SCORE",
  ScoreDesc = "SCORE_DESC",
  Popularity = "POPULARITY",
  PopularityDesc = "POPULARITY_DESC",
  Trending = "TRENDING",
  TrendingDesc = "TRENDING_DESC",
  Episodes = "EPISODES",
  EpisodesDesc = "EPISODES_DESC",
  Duration = "DURATION",
  DurationDesc = "DURATION_DESC",
  Status = "STATUS",
  StatusDesc = "STATUS_DESC",
  Chapters = "CHAPTERS",
  ChaptersDesc = "CHAPTERS_DESC",
  Volumes = "VOLUMES",
  VolumesDesc = "VOLUMES_DESC",
  UpdatedAt = "UPDATED_AT",
  UpdatedAtDesc = "UPDATED_AT_DESC",
  SearchMatch = "SEARCH_MATCH",
  Favourites = "FAVOURITES",
  FavouritesDesc = "FAVOURITES_DESC",
}
/** The primary language of the voice actor */
export enum StaffLanguage {
  Japanese = "JAPANESE",
  English = "ENGLISH",
  Korean = "KOREAN",
  Italian = "ITALIAN",
  Spanish = "SPANISH",
  Portuguese = "PORTUGUESE",
  French = "FRENCH",
  German = "GERMAN",
  Hebrew = "HEBREW",
  Hungarian = "HUNGARIAN",
}
/** Staff sort enums */
export enum StaffSort {
  Id = "ID",
  IdDesc = "ID_DESC",
  Role = "ROLE",
  RoleDesc = "ROLE_DESC",
  Language = "LANGUAGE",
  LanguageDesc = "LANGUAGE_DESC",
  SearchMatch = "SEARCH_MATCH",
  Favourites = "FAVOURITES",
  FavouritesDesc = "FAVOURITES_DESC",
}
/** Studio sort enums */
export enum StudioSort {
  Id = "ID",
  IdDesc = "ID_DESC",
  Name = "NAME",
  NameDesc = "NAME_DESC",
  SearchMatch = "SEARCH_MATCH",
  Favourites = "FAVOURITES",
  FavouritesDesc = "FAVOURITES_DESC",
}
/** Media trend sort enums */
export enum MediaTrendSort {
  Id = "ID",
  IdDesc = "ID_DESC",
  MediaId = "MEDIA_ID",
  MediaIdDesc = "MEDIA_ID_DESC",
  Date = "DATE",
  DateDesc = "DATE_DESC",
  Score = "SCORE",
  ScoreDesc = "SCORE_DESC",
  Popularity = "POPULARITY",
  PopularityDesc = "POPULARITY_DESC",
  Trending = "TRENDING",
  TrendingDesc = "TRENDING_DESC",
  Episode = "EPISODE",
  EpisodeDesc = "EPISODE_DESC",
}
/** The type of ranking */
export enum MediaRankType {
  Rated = "RATED",
  Popular = "POPULAR",
}
/** Media list watching/reading status enum. */
export enum MediaListStatus {
  Current = "CURRENT",
  Planning = "PLANNING",
  Completed = "COMPLETED",
  Dropped = "DROPPED",
  Paused = "PAUSED",
  Repeating = "REPEATING",
}
/** Review sort enums */
export enum ReviewSort {
  Id = "ID",
  IdDesc = "ID_DESC",
  Score = "SCORE",
  ScoreDesc = "SCORE_DESC",
  Rating = "RATING",
  RatingDesc = "RATING_DESC",
  CreatedAt = "CREATED_AT",
  CreatedAtDesc = "CREATED_AT_DESC",
  UpdatedAt = "UPDATED_AT",
  UpdatedAtDesc = "UPDATED_AT_DESC",
}
/** Review rating enums */
export enum ReviewRating {
  NoVote = "NO_VOTE",
  UpVote = "UP_VOTE",
  DownVote = "DOWN_VOTE",
}
/** Type of relation media has to its parent. */
export enum MediaRelation {
  Adaptation = "ADAPTATION",
  Prequel = "PREQUEL",
  Sequel = "SEQUEL",
  Parent = "PARENT",
  SideStory = "SIDE_STORY",
  Character = "CHARACTER",
  Summary = "SUMMARY",
  Alternative = "ALTERNATIVE",
  SpinOff = "SPIN_OFF",
  Other = "OTHER",
  Source = "SOURCE",
  Compilation = "COMPILATION",
  Contains = "CONTAINS",
}
/** Media list sort enums */
export enum MediaListSort {
  MediaId = "MEDIA_ID",
  MediaIdDesc = "MEDIA_ID_DESC",
  Score = "SCORE",
  ScoreDesc = "SCORE_DESC",
  Status = "STATUS",
  StatusDesc = "STATUS_DESC",
  Progress = "PROGRESS",
  ProgressDesc = "PROGRESS_DESC",
  ProgressVolumes = "PROGRESS_VOLUMES",
  ProgressVolumesDesc = "PROGRESS_VOLUMES_DESC",
  Repeat = "REPEAT",
  RepeatDesc = "REPEAT_DESC",
  Priority = "PRIORITY",
  PriorityDesc = "PRIORITY_DESC",
  StartedOn = "STARTED_ON",
  StartedOnDesc = "STARTED_ON_DESC",
  FinishedOn = "FINISHED_ON",
  FinishedOnDesc = "FINISHED_ON_DESC",
  AddedTime = "ADDED_TIME",
  AddedTimeDesc = "ADDED_TIME_DESC",
  UpdatedTime = "UPDATED_TIME",
  UpdatedTimeDesc = "UPDATED_TIME_DESC",
  MediaTitleRomaji = "MEDIA_TITLE_ROMAJI",
  MediaTitleRomajiDesc = "MEDIA_TITLE_ROMAJI_DESC",
  MediaTitleEnglish = "MEDIA_TITLE_ENGLISH",
  MediaTitleEnglishDesc = "MEDIA_TITLE_ENGLISH_DESC",
  MediaTitleNative = "MEDIA_TITLE_NATIVE",
  MediaTitleNativeDesc = "MEDIA_TITLE_NATIVE_DESC",
  MediaPopularity = "MEDIA_POPULARITY",
  MediaPopularityDesc = "MEDIA_POPULARITY_DESC",
}
/** Airing schedule sort enums */
export enum AiringSort {
  Id = "ID",
  IdDesc = "ID_DESC",
  MediaId = "MEDIA_ID",
  MediaIdDesc = "MEDIA_ID_DESC",
  Time = "TIME",
  TimeDesc = "TIME_DESC",
  Episode = "EPISODE",
  EpisodeDesc = "EPISODE_DESC",
}
/** Activity type enum. */
export enum ActivityType {
  Text = "TEXT",
  AnimeList = "ANIME_LIST",
  MangaList = "MANGA_LIST",
  Message = "MESSAGE",
  MediaList = "MEDIA_LIST",
}
/** Activity sort enums */
export enum ActivitySort {
  Id = "ID",
  IdDesc = "ID_DESC",
}
/** Thread sort enums */
export enum ThreadSort {
  Id = "ID",
  IdDesc = "ID_DESC",
  Title = "TITLE",
  TitleDesc = "TITLE_DESC",
  CreatedAt = "CREATED_AT",
  CreatedAtDesc = "CREATED_AT_DESC",
  UpdatedAt = "UPDATED_AT",
  UpdatedAtDesc = "UPDATED_AT_DESC",
  RepliedAt = "REPLIED_AT",
  RepliedAtDesc = "REPLIED_AT_DESC",
  ReplyCount = "REPLY_COUNT",
  ReplyCountDesc = "REPLY_COUNT_DESC",
  ViewCount = "VIEW_COUNT",
  ViewCountDesc = "VIEW_COUNT_DESC",
  IsSticky = "IS_STICKY",
  SearchMatch = "SEARCH_MATCH",
}

export enum Provider {
  Crunchyroll = "CRUNCHYROLL",
}
/** Types that can be liked */
export enum LikeableType {
  Thread = "THREAD",
  ThreadComment = "THREAD_COMMENT",
  Activity = "ACTIVITY",
  ActivityReply = "ACTIVITY_REPLY",
}
/** Submission status */
export enum SubmissionStatus {
  Pending = "PENDING",
  Rejected = "REJECTED",
  PartiallyAccepted = "PARTIALLY_ACCEPTED",
  Accepted = "ACCEPTED",
}
/** Revision history actions */
export enum RevisionHistoryAction {
  Create = "CREATE",
  Edit = "EDIT",
}


export type Json = any;

/** ISO 3166-1 alpha-2 country code */
export type CountryCode = any;

/** 8 digit long date integer (YYYYMMDD). Unknown dates represented by 0. E.g. 2016: 20160000, May 1976: 19760500 */
export type FuzzyDateInt = any;


// ====================================================
// Documents
// ====================================================



  export type AddEntryMutationVariables = {
    readonly mediaId: Maybe<number>;
    readonly status: Maybe<MediaListStatus>;
  }

  export type AddEntryMutationMutation = {
    readonly __typename?: "Mutation";
    
    readonly SaveMediaListEntry: Maybe<AddEntryMutationSaveMediaListEntry>;
  }

  export type AddEntryMutationSaveMediaListEntry = {
    readonly __typename?: "MediaList";
    
    readonly id: number;
    
    readonly progress: Maybe<number>;
    
    readonly status: Maybe<MediaListStatus>;
    
    readonly score: Maybe<number>;
    
    readonly repeat: Maybe<number>;
  } 

  export type AnimePageQueryVariables = {
    readonly id: Maybe<number>;
  }

  export type AnimePageQueryQuery = {
    readonly __typename?: "Query";
    
    readonly anime: Maybe<AnimePageQueryAnime>;
  }

  export type AnimePageQueryAnime = {
    readonly __typename?: "Media";
    
    readonly id: number;
    
    readonly idMal: Maybe<number>;
    
    readonly title: Maybe<AnimePageQueryTitle>;
    
    readonly description: Maybe<string>;
    
    readonly duration: Maybe<number>;
    
    readonly episodes: Maybe<number>;
    
    readonly isFavourite: boolean;
    
    readonly averageScore: Maybe<number>;
    
    readonly bannerImage: Maybe<string>;
    
    readonly coverImage: Maybe<AnimePageQueryCoverImage>;
    
    readonly nextAiringEpisode: Maybe<AnimePageQueryNextAiringEpisode>;
    
    readonly relations: Maybe<AnimePageQueryRelations>;
    
    readonly mediaListEntry: Maybe<AnimePageQueryMediaListEntry>;
  } 

  export type AnimePageQueryTitle = {
    readonly __typename?: "MediaTitle";
    
    readonly english: Maybe<string>;
    
    readonly native: Maybe<string>;
    
    readonly romaji: Maybe<string>;
    
    readonly userPreferred: Maybe<string>;
  } 

  export type AnimePageQueryCoverImage = {
    readonly __typename?: "MediaCoverImage";
    
    readonly extraLarge: Maybe<string>;
    
    readonly color: Maybe<string>;
  } 

  export type AnimePageQueryNextAiringEpisode = {
    readonly __typename?: "AiringSchedule";
    
    readonly airingAt: number;
    
    readonly timeUntilAiring: number;
  } 

  export type AnimePageQueryRelations = {
    readonly __typename?: "MediaConnection";
    
    readonly edges: Maybe<ReadonlyArray<AnimePageQueryEdges>>;
  } 

  export type AnimePageQueryEdges = {
    readonly __typename?: "MediaEdge";
    
    readonly relationType: Maybe<MediaRelation>;
    
    readonly node: Maybe<AnimePageQueryNode>;
  } 

  export type AnimePageQueryNode = {
    readonly __typename?: "Media";
    
    readonly id: number;
    
    readonly title: Maybe<AnimePageQuery_Title>;
    
    readonly bannerImage: Maybe<string>;
    
    readonly type: Maybe<MediaType>;
  } 

  export type AnimePageQuery_Title = {
    readonly __typename?: "MediaTitle";
    
    readonly userPreferred: Maybe<string>;
  } 

  export type AnimePageQueryMediaListEntry = {
    readonly __typename?: "MediaList";
    
    readonly id: number;
    
    readonly progress: Maybe<number>;
    
    readonly status: Maybe<MediaListStatus>;
    
    readonly score: Maybe<number>;
    
    readonly repeat: Maybe<number>;
  } 

  export type AnimeQueueQueryVariables = {
    readonly id: Maybe<number>;
  }

  export type AnimeQueueQueryQuery = {
    readonly __typename?: "Query";
    
    readonly anime: Maybe<AnimeQueueQueryAnime>;
  }

  export type AnimeQueueQueryAnime = {
    readonly __typename?: "Media";
    
    readonly id: number;
    
    readonly idMal: Maybe<number>;
    
    readonly title: Maybe<AnimeQueueQueryTitle>;
    
    readonly episodes: Maybe<number>;
    
    readonly status: Maybe<MediaStatus>;
    
    readonly siteUrl: Maybe<string>;
    
    readonly bannerImage: Maybe<string>;
    
    readonly nextAiringEpisode: Maybe<AnimeQueueQueryNextAiringEpisode>;
    
    readonly mediaListEntry: Maybe<AnimeQueueQueryMediaListEntry>;
    
    readonly relations: Maybe<AnimeQueueQueryRelations>;
  } 

  export type AnimeQueueQueryTitle = {
    readonly __typename?: "MediaTitle";
    
    readonly userPreferred: Maybe<string>;
  } 

  export type AnimeQueueQueryNextAiringEpisode = {
    readonly __typename?: "AiringSchedule";
    
    readonly airingAt: number;
    
    readonly timeUntilAiring: number;
  } 

  export type AnimeQueueQueryMediaListEntry = {
    readonly __typename?: "MediaList";
    
    readonly id: number;
    
    readonly progress: Maybe<number>;
    
    readonly status: Maybe<MediaListStatus>;
    
    readonly repeat: Maybe<number>;
    
    readonly score: Maybe<number>;
  } 

  export type AnimeQueueQueryRelations = {
    readonly __typename?: "MediaConnection";
    
    readonly edges: Maybe<ReadonlyArray<AnimeQueueQueryEdges>>;
  } 

  export type AnimeQueueQueryEdges = {
    readonly __typename?: "MediaEdge";
    
    readonly relationType: Maybe<MediaRelation>;
    
    readonly node: Maybe<AnimeQueueQueryNode>;
  } 

  export type AnimeQueueQueryNode = {
    readonly __typename?: "Media";
    
    readonly id: number;
    
    readonly title: Maybe<AnimeQueueQuery_Title>;
    
    readonly bannerImage: Maybe<string>;
  } 

  export type AnimeQueueQuery_Title = {
    readonly __typename?: "MediaTitle";
    
    readonly userPreferred: Maybe<string>;
  } 

  export type EpisodesQueryVariables = {
    readonly id: number;
  }

  export type EpisodesQueryQuery = {
    readonly __typename?: "Query";
    
    readonly episode: Maybe<ReadonlyArray<EpisodesQueryEpisode>>;
  }

  export type EpisodesQueryEpisode = {
    readonly __typename?: "Episode";
    
    readonly id: number;
  } 

  export type DeleteListEntryMutationVariables = {
    readonly id: number;
  }

  export type DeleteListEntryMutationMutation = {
    readonly __typename?: "Mutation";
    
    readonly DeleteMediaListEntry: Maybe<DeleteListEntryMutationDeleteMediaListEntry>;
  }

  export type DeleteListEntryMutationDeleteMediaListEntry = {
    readonly __typename?: "Deleted";
    
    readonly deleted: Maybe<boolean>;
  } 

  export type ListQueryVariables = {
    readonly userId: number;
    readonly statuses: Maybe<ReadonlyArray<MediaListStatus>>;
  }

  export type ListQueryQuery = {
    readonly __typename?: "Query";
    
    readonly listCollection: Maybe<ListQueryListCollection>;
  }

  export type ListQueryListCollection = {
    readonly __typename?: "MediaListCollection";
    
    readonly lists: Maybe<ReadonlyArray<ListQueryLists>>;
  } 

  export type ListQueryLists = {
    readonly __typename?: "MediaListGroup";
    
    readonly isCustomList: Maybe<boolean>;
    
    readonly name: Maybe<string>;
    
    readonly entries: Maybe<ReadonlyArray<ListQueryEntries>>;
  } 

  export type ListQueryEntries = {
    readonly __typename?: "MediaList";
    
    readonly id: number;
    
    readonly status: Maybe<MediaListStatus>;
    
    readonly progress: Maybe<number>;
    
    readonly score: Maybe<number>;
    
    readonly repeat: Maybe<number>;
    
    readonly anime: Maybe<ListQueryAnime>;
  } 

  export type ListQueryAnime = {
    readonly __typename?: "Media";
    
    readonly id: number;
    
    readonly title: Maybe<ListQueryTitle>;
    
    readonly coverImage: Maybe<ListQueryCoverImage>;
    
    readonly isFavourite: boolean;
    
    readonly episodes: Maybe<number>;
  } 

  export type ListQueryTitle = {
    readonly __typename?: "MediaTitle";
    
    readonly userPreferred: Maybe<string>;
    
    readonly english: Maybe<string>;
    
    readonly romaji: Maybe<string>;
    
    readonly native: Maybe<string>;
  } 

  export type ListQueryCoverImage = {
    readonly __typename?: "MediaCoverImage";
    
    readonly medium: Maybe<string>;
    
    readonly color: Maybe<string>;
  } 

  export type PausedQueryVariables = {
    readonly userId: number;
  }

  export type PausedQueryQuery = {
    readonly __typename?: "Query";
    
    readonly listCollection: Maybe<PausedQueryListCollection>;
  }

  export type PausedQueryListCollection = {
    readonly __typename?: "MediaListCollection";
    
    readonly lists: Maybe<ReadonlyArray<PausedQueryLists>>;
  } 

  export type PausedQueryLists = {
    readonly __typename?: "MediaListGroup";
    
    readonly isCustomList: Maybe<boolean>;
    
    readonly entries: Maybe<ReadonlyArray<PausedQueryEntries>>;
  } 

  export type PausedQueryEntries = {
    readonly __typename?: "MediaList";
    
    readonly info: Maybe<PausedQueryInfo>;
  } 

  export type PausedQueryInfo = {
    readonly __typename?: "Media";
    
    readonly id: number;
  } 

  export type PlanningQueryVariables = {
    readonly userId: number;
  }

  export type PlanningQueryQuery = {
    readonly __typename?: "Query";
    
    readonly listCollection: Maybe<PlanningQueryListCollection>;
  }

  export type PlanningQueryListCollection = {
    readonly __typename?: "MediaListCollection";
    
    readonly lists: Maybe<ReadonlyArray<PlanningQueryLists>>;
  } 

  export type PlanningQueryLists = {
    readonly __typename?: "MediaListGroup";
    
    readonly isCustomList: Maybe<boolean>;
    
    readonly entries: Maybe<ReadonlyArray<PlanningQueryEntries>>;
  } 

  export type PlanningQueryEntries = {
    readonly __typename?: "MediaList";
    
    readonly info: Maybe<PlanningQueryInfo>;
  } 

  export type PlanningQueryInfo = {
    readonly __typename?: "Media";
    
    readonly id: number;
  } 

  export type SaveListEntryMutationVariables = {
    readonly id: number;
    readonly progress: number;
    readonly status: MediaListStatus;
    readonly repeat: number;
    readonly score: number;
  }

  export type SaveListEntryMutationMutation = {
    readonly __typename?: "Mutation";
    
    readonly SaveMediaListEntry: Maybe<SaveListEntryMutationSaveMediaListEntry>;
  }

  export type SaveListEntryMutationSaveMediaListEntry = {
    readonly __typename?: "MediaList";
    
    readonly id: number;
    
    readonly score: Maybe<number>;
    
    readonly progress: Maybe<number>;
    
    readonly status: Maybe<MediaListStatus>;
    
    readonly repeat: Maybe<number>;
  } 

  export type SearchQueryVariables = {
    readonly search: Maybe<string>;
  }

  export type SearchQueryQuery = {
    readonly __typename?: "Query";
    
    readonly anime: Maybe<SearchQueryAnime>;
  }

  export type SearchQueryAnime = {
    readonly __typename?: "Page";
    
    readonly pageInfo: Maybe<SearchQueryPageInfo>;
    
    readonly results: Maybe<ReadonlyArray<SearchQueryResults>>;
  } 

  export type SearchQueryPageInfo = {
    readonly __typename?: "PageInfo";
    
    readonly total: Maybe<number>;
  } 

  export type SearchQueryResults = {
    readonly __typename?: "Media";
    
    readonly id: number;
    
    readonly type: Maybe<MediaType>;
    
    readonly title: Maybe<SearchQueryTitle>;
    
    readonly coverImage: Maybe<SearchQueryCoverImage>;
    
    readonly streamingEpisodes: Maybe<ReadonlyArray<SearchQueryStreamingEpisodes>>;
  } 

  export type SearchQueryTitle = {
    readonly __typename?: "MediaTitle";
    
    readonly userPreferred: Maybe<string>;
  } 

  export type SearchQueryCoverImage = {
    readonly __typename?: "MediaCoverImage";
    
    readonly medium: Maybe<string>;
  } 

  export type SearchQueryStreamingEpisodes = {
    readonly __typename?: "MediaStreamingEpisode";
    
    readonly site: Maybe<string>;
  } 

  export type SetStatusMutationVariables = {
    readonly id: Maybe<number>;
    readonly status: Maybe<MediaListStatus>;
  }

  export type SetStatusMutationMutation = {
    readonly __typename?: "Mutation";
    
    readonly SaveMediaListEntry: Maybe<SetStatusMutationSaveMediaListEntry>;
  }

  export type SetStatusMutationSaveMediaListEntry = {
    readonly __typename?: "MediaList";
    
    readonly id: number;
    
    readonly status: Maybe<MediaListStatus>;
  } 

  export type UpdateProgressMutationVariables = {
    readonly id: Maybe<number>;
    readonly progress: Maybe<number>;
  }

  export type UpdateProgressMutationMutation = {
    readonly __typename?: "Mutation";
    
    readonly SaveMediaListEntry: Maybe<UpdateProgressMutationSaveMediaListEntry>;
  }

  export type UpdateProgressMutationSaveMediaListEntry = {
    readonly __typename?: "MediaList";
    
    readonly id: number;
    
    readonly progress: Maybe<number>;
    
    readonly status: Maybe<MediaListStatus>;
    
    readonly repeat: Maybe<number>;
  } 

  export type UpdateScoreMutationVariables = {
    readonly id: Maybe<number>;
    readonly score: Maybe<number>;
  }

  export type UpdateScoreMutationMutation = {
    readonly __typename?: "Mutation";
    
    readonly SaveMediaListEntry: Maybe<UpdateScoreMutationSaveMediaListEntry>;
  }

  export type UpdateScoreMutationSaveMediaListEntry = {
    readonly __typename?: "MediaList";
    
    readonly id: number;
    
    readonly score: Maybe<number>;
    
    readonly progress: Maybe<number>;
    
    readonly status: Maybe<MediaListStatus>;
    
    readonly repeat: Maybe<number>;
  } 

  export type WatchingQueryVariables = {
    readonly userId: number;
  }

  export type WatchingQueryQuery = {
    readonly __typename?: "Query";
    
    readonly listCollection: Maybe<WatchingQueryListCollection>;
  }

  export type WatchingQueryListCollection = {
    readonly __typename?: "MediaListCollection";
    
    readonly lists: Maybe<ReadonlyArray<WatchingQueryLists>>;
  } 

  export type WatchingQueryLists = {
    readonly __typename?: "MediaListGroup";
    
    readonly isCustomList: Maybe<boolean>;
    
    readonly entries: Maybe<ReadonlyArray<WatchingQueryEntries>>;
  } 

  export type WatchingQueryEntries = {
    readonly __typename?: "MediaList";
    
    readonly info: Maybe<WatchingQueryInfo>;
  } 

  export type WatchingQueryInfo = {
    readonly __typename?: "Media";
    
    readonly id: number;
  } 

