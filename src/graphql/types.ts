 // tslint:disable
 // THIS IS A GENERATED FILE
export type Maybe<T> = T | null;

/** Notification option input */
export interface NotificationOptionInput {
  /** The type of notification */
  type: Maybe<NotificationType>;
  /** Whether this type of notification is enabled */
  enabled: Maybe<boolean>;
}
/** A user's list options for anime or manga lists */
export interface MediaListOptionsInput {
  /** The order each list should be displayed in */
  sectionOrder: Maybe<string[]>;
  /** If the completed sections of the list should be separated by format */
  splitCompletedSectionByFormat: Maybe<boolean>;
  /** The names of the user's custom lists */
  customLists: Maybe<string[]>;
  /** The names of the user's advanced scoring sections */
  advancedScoring: Maybe<string[]>;
  /** If advanced scoring is enabled */
  advancedScoringEnabled: Maybe<boolean>;
  /** list theme */
  theme: Maybe<string>;
}
/** Date object that allows for incomplete date values (fuzzy) */
export interface FuzzyDateInput {
  /** Numeric Year (2017) */
  year: Maybe<number>;
  /** Numeric Month (3) */
  month: Maybe<number>;
  /** Numeric Day (24) */
  day: Maybe<number>;
}

export interface AiringScheduleInput {
  
  airingAt: Maybe<number>;
  
  episode: Maybe<number>;
  
  timeUntilAiring: Maybe<number>;
}
/** The names of the character */
export interface CharacterNameInput {
  /** The character's given name */
  first: Maybe<string>;
  /** The character's surname */
  last: Maybe<string>;
  /** The character's full name in their native language */
  native: Maybe<string>;
  /** Other names the character might be referred by */
  alternative: Maybe<string[]>;
}
/** An external link to another site related to the media */
export interface MediaExternalLinkInput {
  /** The id of the external link */
  id: number;
  /** The url of the external link */
  url: string;
  /** The site location of the external link */
  site: string;
}
/** The official titles of the media in various languages */
export interface MediaTitleInput {
  /** The romanization of the native language title */
  romaji: Maybe<string>;
  /** The official english title */
  english: Maybe<string>;
  /** Official title in it's native language */
  native: Maybe<string>;
}
/** The names of the staff member */
export interface StaffNameInput {
  /** The person's given name */
  first: Maybe<string>;
  /** The person's surname */
  last: Maybe<string>;
  /** The person's full name in their native language */
  native: Maybe<string>;
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
    mediaId: Maybe<number>;
    status: Maybe<MediaListStatus>;
  }

  export type AddEntryMutationMutation = {
    __typename?: "Mutation";
    
    SaveMediaListEntry: Maybe<AddEntryMutationSaveMediaListEntry>;
  }

  export type AddEntryMutationSaveMediaListEntry = {
    __typename?: "MediaList";
    
    id: number;
    
    progress: Maybe<number>;
    
    status: Maybe<MediaListStatus>;
    
    score: Maybe<number>;
    
    repeat: Maybe<number>;
  } 

  export type AnimePageQueryVariables = {
    id: Maybe<number>;
  }

  export type AnimePageQueryQuery = {
    __typename?: "Query";
    
    anime: Maybe<AnimePageQueryAnime>;
  }

  export type AnimePageQueryAnime = {
    __typename?: "Media";
    
    id: number;
    
    idMal: Maybe<number>;
    
    title: Maybe<AnimePageQueryTitle>;
    
    description: Maybe<string>;
    
    duration: Maybe<number>;
    
    episodes: Maybe<number>;
    
    isFavourite: boolean;
    
    averageScore: Maybe<number>;
    
    scoreMal: Maybe<number>;
    
    bannerImage: Maybe<string>;
    
    coverImage: Maybe<AnimePageQueryCoverImage>;
    
    nextAiringEpisode: Maybe<AnimePageQueryNextAiringEpisode>;
    
    relations: Maybe<AnimePageQueryRelations>;
    
    mediaListEntry: Maybe<AnimePageQueryMediaListEntry>;
  } 

  export type AnimePageQueryTitle = {
    __typename?: "MediaTitle";
    
    english: Maybe<string>;
    
    native: Maybe<string>;
    
    romaji: Maybe<string>;
    
    userPreferred: Maybe<string>;
  } 

  export type AnimePageQueryCoverImage = {
    __typename?: "MediaCoverImage";
    
    extraLarge: Maybe<string>;
    
    color: Maybe<string>;
  } 

  export type AnimePageQueryNextAiringEpisode = {
    __typename?: "AiringSchedule";
    
    airingAt: number;
    
    timeUntilAiring: number;
    
    episode: number;
  } 

  export type AnimePageQueryRelations = {
    __typename?: "MediaConnection";
    
    edges: Maybe<AnimePageQueryEdges[]>;
  } 

  export type AnimePageQueryEdges = {
    __typename?: "MediaEdge";
    
    relationType: Maybe<MediaRelation>;
    
    node: Maybe<AnimePageQueryNode>;
  } 

  export type AnimePageQueryNode = {
    __typename?: "Media";
    
    id: number;
    
    title: Maybe<AnimePageQuery_Title>;
    
    bannerImage: Maybe<string>;
    
    type: Maybe<MediaType>;
  } 

  export type AnimePageQuery_Title = {
    __typename?: "MediaTitle";
    
    userPreferred: Maybe<string>;
  } 

  export type AnimePageQueryMediaListEntry = {
    __typename?: "MediaList";
    
    id: number;
    
    progress: Maybe<number>;
    
    status: Maybe<MediaListStatus>;
    
    score: Maybe<number>;
    
    repeat: Maybe<number>;
  } 

  export type AnimeQueueQueryVariables = {
    id: Maybe<number>;
  }

  export type AnimeQueueQueryQuery = {
    __typename?: "Query";
    
    anime: Maybe<AnimeQueueQueryAnime>;
  }

  export type AnimeQueueQueryAnime = {
    __typename?: "Media";
    
    id: number;
    
    idMal: Maybe<number>;
    
    title: Maybe<AnimeQueueQueryTitle>;
    
    episodes: Maybe<number>;
    
    status: Maybe<MediaStatus>;
    
    siteUrl: Maybe<string>;
    
    bannerImage: Maybe<string>;
    
    nextAiringEpisode: Maybe<AnimeQueueQueryNextAiringEpisode>;
    
    mediaListEntry: Maybe<AnimeQueueQueryMediaListEntry>;
    
    relations: Maybe<AnimeQueueQueryRelations>;
  } 

  export type AnimeQueueQueryTitle = {
    __typename?: "MediaTitle";
    
    userPreferred: Maybe<string>;
  } 

  export type AnimeQueueQueryNextAiringEpisode = {
    __typename?: "AiringSchedule";
    
    airingAt: number;
    
    timeUntilAiring: number;
    
    episode: number;
  } 

  export type AnimeQueueQueryMediaListEntry = {
    __typename?: "MediaList";
    
    id: number;
    
    progress: Maybe<number>;
    
    status: Maybe<MediaListStatus>;
    
    repeat: Maybe<number>;
    
    score: Maybe<number>;
  } 

  export type AnimeQueueQueryRelations = {
    __typename?: "MediaConnection";
    
    edges: Maybe<AnimeQueueQueryEdges[]>;
  } 

  export type AnimeQueueQueryEdges = {
    __typename?: "MediaEdge";
    
    relationType: Maybe<MediaRelation>;
    
    node: Maybe<AnimeQueueQueryNode>;
  } 

  export type AnimeQueueQueryNode = {
    __typename?: "Media";
    
    id: number;
    
    title: Maybe<AnimeQueueQuery_Title>;
    
    bannerImage: Maybe<string>;
  } 

  export type AnimeQueueQuery_Title = {
    __typename?: "MediaTitle";
    
    userPreferred: Maybe<string>;
  } 

  export type DeleteListEntryMutationVariables = {
    id: number;
  }

  export type DeleteListEntryMutationMutation = {
    __typename?: "Mutation";
    
    DeleteMediaListEntry: Maybe<DeleteListEntryMutationDeleteMediaListEntry>;
  }

  export type DeleteListEntryMutationDeleteMediaListEntry = {
    __typename?: "Deleted";
    
    deleted: Maybe<boolean>;
  } 

  export type EpisodeListVariables = {
    id: number;
  }

  export type EpisodeListQuery = {
    __typename?: "Query";
    
    episodes: Maybe<EpisodeListEpisodes[]>;
  }

  export type EpisodeListEpisodes = {
    __typename?: "Episode";
    
    provider: Provider;
    
    id: number;
    
    animeId: number;
    
    title: string;
    
    duration: number;
    
    progress: Maybe<number>;
    
    index: number;
    
    episodeNumber: number;
    
    isWatched: boolean;
    
    url: string;
    
    thumbnail: string;
  } 

  export type ListQueryVariables = {
    userId: number;
    statuses: Maybe<MediaListStatus[]>;
  }

  export type ListQueryQuery = {
    __typename?: "Query";
    
    listCollection: Maybe<ListQueryListCollection>;
  }

  export type ListQueryListCollection = {
    __typename?: "MediaListCollection";
    
    lists: Maybe<ListQueryLists[]>;
  } 

  export type ListQueryLists = {
    __typename?: "MediaListGroup";
    
    isCustomList: Maybe<boolean>;
    
    name: Maybe<string>;
    
    entries: Maybe<ListQueryEntries[]>;
  } 

  export type ListQueryEntries = {
    __typename?: "MediaList";
    
    id: number;
    
    status: Maybe<MediaListStatus>;
    
    progress: Maybe<number>;
    
    score: Maybe<number>;
    
    repeat: Maybe<number>;
    
    anime: Maybe<ListQueryAnime>;
  } 

  export type ListQueryAnime = {
    __typename?: "Media";
    
    id: number;
    
    title: Maybe<ListQueryTitle>;
    
    coverImage: Maybe<ListQueryCoverImage>;
    
    isFavourite: boolean;
    
    episodes: Maybe<number>;
  } 

  export type ListQueryTitle = {
    __typename?: "MediaTitle";
    
    userPreferred: Maybe<string>;
    
    english: Maybe<string>;
    
    romaji: Maybe<string>;
    
    native: Maybe<string>;
  } 

  export type ListQueryCoverImage = {
    __typename?: "MediaCoverImage";
    
    medium: Maybe<string>;
    
    color: Maybe<string>;
  } 

  export type PausedQueryVariables = {
    userId: number;
  }

  export type PausedQueryQuery = {
    __typename?: "Query";
    
    listCollection: Maybe<PausedQueryListCollection>;
  }

  export type PausedQueryListCollection = {
    __typename?: "MediaListCollection";
    
    lists: Maybe<PausedQueryLists[]>;
  } 

  export type PausedQueryLists = {
    __typename?: "MediaListGroup";
    
    isCustomList: Maybe<boolean>;
    
    entries: Maybe<PausedQueryEntries[]>;
  } 

  export type PausedQueryEntries = {
    __typename?: "MediaList";
    
    info: Maybe<PausedQueryInfo>;
  } 

  export type PausedQueryInfo = {
    __typename?: "Media";
    
    id: number;
  } 

  export type PlanningQueryVariables = {
    userId: number;
  }

  export type PlanningQueryQuery = {
    __typename?: "Query";
    
    listCollection: Maybe<PlanningQueryListCollection>;
  }

  export type PlanningQueryListCollection = {
    __typename?: "MediaListCollection";
    
    lists: Maybe<PlanningQueryLists[]>;
  } 

  export type PlanningQueryLists = {
    __typename?: "MediaListGroup";
    
    isCustomList: Maybe<boolean>;
    
    entries: Maybe<PlanningQueryEntries[]>;
  } 

  export type PlanningQueryEntries = {
    __typename?: "MediaList";
    
    info: Maybe<PlanningQueryInfo>;
  } 

  export type PlanningQueryInfo = {
    __typename?: "Media";
    
    id: number;
  } 

  export type PlayerAnimeVariables = {
    id: number;
  }

  export type PlayerAnimeQuery = {
    __typename?: "Query";
    
    anime: Maybe<PlayerAnimeAnime>;
  }

  export type PlayerAnimeAnime = {
    __typename?: "Media";
    
    id: number;
    
    idMal: Maybe<number>;
    
    title: Maybe<PlayerAnimeTitle>;
    
    episodes: Maybe<number>;
    
    nextAiringEpisode: Maybe<PlayerAnimeNextAiringEpisode>;
    
    relations: Maybe<PlayerAnimeRelations>;
    
    mediaListEntry: Maybe<PlayerAnimeMediaListEntry>;
  } 

  export type PlayerAnimeTitle = {
    __typename?: "MediaTitle";
    
    userPreferred: Maybe<string>;
  } 

  export type PlayerAnimeNextAiringEpisode = {
    __typename?: "AiringSchedule";
    
    airingAt: number;
    
    timeUntilAiring: number;
  } 

  export type PlayerAnimeRelations = {
    __typename?: "MediaConnection";
    
    edges: Maybe<PlayerAnimeEdges[]>;
  } 

  export type PlayerAnimeEdges = {
    __typename?: "MediaEdge";
    
    relationType: Maybe<MediaRelation>;
    
    node: Maybe<PlayerAnimeNode>;
  } 

  export type PlayerAnimeNode = {
    __typename?: "Media";
    
    id: number;
    
    title: Maybe<PlayerAnime_Title>;
    
    bannerImage: Maybe<string>;
  } 

  export type PlayerAnime_Title = {
    __typename?: "MediaTitle";
    
    userPreferred: Maybe<string>;
  } 

  export type PlayerAnimeMediaListEntry = {
    __typename?: "MediaList";
    
    id: number;
    
    status: Maybe<MediaListStatus>;
    
    progress: Maybe<number>;
  } 

  export type SaveListEntryMutationVariables = {
    id: number;
    progress: number;
    status: MediaListStatus;
    repeat: number;
    score: number;
  }

  export type SaveListEntryMutationMutation = {
    __typename?: "Mutation";
    
    SaveMediaListEntry: Maybe<SaveListEntryMutationSaveMediaListEntry>;
  }

  export type SaveListEntryMutationSaveMediaListEntry = {
    __typename?: "MediaList";
    
    id: number;
    
    score: Maybe<number>;
    
    progress: Maybe<number>;
    
    status: Maybe<MediaListStatus>;
    
    repeat: Maybe<number>;
  } 

  export type SearchQueryVariables = {
    search: Maybe<string>;
  }

  export type SearchQueryQuery = {
    __typename?: "Query";
    
    anime: Maybe<SearchQueryAnime>;
  }

  export type SearchQueryAnime = {
    __typename?: "Page";
    
    pageInfo: Maybe<SearchQueryPageInfo>;
    
    results: Maybe<SearchQueryResults[]>;
  } 

  export type SearchQueryPageInfo = {
    __typename?: "PageInfo";
    
    total: Maybe<number>;
  } 

  export type SearchQueryResults = {
    __typename?: "Media";
    
    id: number;
    
    type: Maybe<MediaType>;
    
    title: Maybe<SearchQueryTitle>;
    
    coverImage: Maybe<SearchQueryCoverImage>;
    
    streamingEpisodes: Maybe<SearchQueryStreamingEpisodes[]>;
    
    externalLinks: Maybe<SearchQueryExternalLinks[]>;
  } 

  export type SearchQueryTitle = {
    __typename?: "MediaTitle";
    
    userPreferred: Maybe<string>;
  } 

  export type SearchQueryCoverImage = {
    __typename?: "MediaCoverImage";
    
    medium: Maybe<string>;
  } 

  export type SearchQueryStreamingEpisodes = {
    __typename?: "MediaStreamingEpisode";
    
    site: Maybe<string>;
  } 

  export type SearchQueryExternalLinks = {
    __typename?: "MediaExternalLink";
    
    site: string;
  } 

  export type SetStatusMutationVariables = {
    id: Maybe<number>;
    status: Maybe<MediaListStatus>;
  }

  export type SetStatusMutationMutation = {
    __typename?: "Mutation";
    
    SaveMediaListEntry: Maybe<SetStatusMutationSaveMediaListEntry>;
  }

  export type SetStatusMutationSaveMediaListEntry = {
    __typename?: "MediaList";
    
    id: number;
    
    status: Maybe<MediaListStatus>;
  } 

  export type UpdateProgressMutationVariables = {
    id: Maybe<number>;
    progress: Maybe<number>;
  }

  export type UpdateProgressMutationMutation = {
    __typename?: "Mutation";
    
    SaveMediaListEntry: Maybe<UpdateProgressMutationSaveMediaListEntry>;
  }

  export type UpdateProgressMutationSaveMediaListEntry = {
    __typename?: "MediaList";
    
    id: number;
    
    progress: Maybe<number>;
    
    status: Maybe<MediaListStatus>;
    
    repeat: Maybe<number>;
  } 

  export type UpdateScoreMutationVariables = {
    id: Maybe<number>;
    score: Maybe<number>;
  }

  export type UpdateScoreMutationMutation = {
    __typename?: "Mutation";
    
    SaveMediaListEntry: Maybe<UpdateScoreMutationSaveMediaListEntry>;
  }

  export type UpdateScoreMutationSaveMediaListEntry = {
    __typename?: "MediaList";
    
    id: number;
    
    score: Maybe<number>;
    
    progress: Maybe<number>;
    
    status: Maybe<MediaListStatus>;
    
    repeat: Maybe<number>;
  } 

  export type WatchingQueryVariables = {
    userId: number;
  }

  export type WatchingQueryQuery = {
    __typename?: "Query";
    
    listCollection: Maybe<WatchingQueryListCollection>;
  }

  export type WatchingQueryListCollection = {
    __typename?: "MediaListCollection";
    
    lists: Maybe<WatchingQueryLists[]>;
  } 

  export type WatchingQueryLists = {
    __typename?: "MediaListGroup";
    
    isCustomList: Maybe<boolean>;
    
    entries: Maybe<WatchingQueryEntries[]>;
  } 

  export type WatchingQueryEntries = {
    __typename?: "MediaList";
    
    info: Maybe<WatchingQueryInfo>;
  } 

  export type WatchingQueryInfo = {
    __typename?: "Media";
    
    id: number;
  } 


      export interface IntrospectionResultData {
        __schema: {
          types: {
            kind: string;
            name: string;
            possibleTypes: {
              name: string;
            }[];
          }[];
        };
      }

      const result: IntrospectionResultData = {
  "__schema": {
    "types": [
      {
        "kind": "UNION",
        "name": "NotificationUnion",
        "possibleTypes": [
          {
            "name": "AiringNotification"
          },
          {
            "name": "FollowingNotification"
          },
          {
            "name": "ActivityMessageNotification"
          },
          {
            "name": "ActivityMentionNotification"
          },
          {
            "name": "ActivityReplyNotification"
          },
          {
            "name": "ActivityReplySubscribedNotification"
          },
          {
            "name": "ActivityLikeNotification"
          },
          {
            "name": "ActivityReplyLikeNotification"
          },
          {
            "name": "ThreadCommentMentionNotification"
          },
          {
            "name": "ThreadCommentReplyNotification"
          },
          {
            "name": "ThreadCommentSubscribedNotification"
          },
          {
            "name": "ThreadCommentLikeNotification"
          },
          {
            "name": "ThreadLikeNotification"
          }
        ]
      },
      {
        "kind": "UNION",
        "name": "ActivityUnion",
        "possibleTypes": [
          {
            "name": "TextActivity"
          },
          {
            "name": "ListActivity"
          },
          {
            "name": "MessageActivity"
          }
        ]
      }
    ]
  }
};

      export default result;
    