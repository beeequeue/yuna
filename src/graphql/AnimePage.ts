/* tslint:disable */
// This file was automatically generated and should not be edited.

import { MediaStatus, MediaRelation, MediaListStatus } from "./..\\graphql-types";

// ====================================================
// GraphQL query operation: AnimePage
// ====================================================

export interface AnimePage_Media_title {
  __typename: "MediaTitle";
  /**
   * The official english title
   */
  english: string | null;
  /**
   * Official title in it's native language
   */
  native: string | null;
  /**
   * The romanization of the native language title
   */
  romaji: string | null;
  /**
   * The currently authenticated users preferred title language. Default romaji for non-authenticated
   */
  userPreferred: string | null;
}

export interface AnimePage_Media_coverImage {
  __typename: "MediaCoverImage";
  /**
   * The cover image of media at its largest size
   */
  large: string | null;
}

export interface AnimePage_Media_relations_edges_node_title {
  __typename: "MediaTitle";
  /**
   * The currently authenticated users preferred title language. Default romaji for non-authenticated
   */
  userPreferred: string | null;
}

export interface AnimePage_Media_relations_edges_node {
  __typename: "Media";
  /**
   * The id of the media
   */
  id: number;
  /**
   * The official titles of the media in various languages
   */
  title: AnimePage_Media_relations_edges_node_title | null;
  /**
   * The banner image of the media
   */
  bannerImage: string | null;
}

export interface AnimePage_Media_relations_edges {
  __typename: "MediaEdge";
  /**
   * The type of relation to the parent model
   */
  relationType: MediaRelation | null;
  node: AnimePage_Media_relations_edges_node | null;
}

export interface AnimePage_Media_relations {
  __typename: "MediaConnection";
  edges: (AnimePage_Media_relations_edges | null)[] | null;
}

export interface AnimePage_Media_mediaListEntry {
  __typename: "MediaList";
  /**
   * The id of the list entry
   */
  id: number;
  /**
   * The amount of episodes/chapters consumed by the user
   */
  progress: number | null;
  /**
   * The watching/reading status
   */
  status: MediaListStatus | null;
  /**
   * The score of the entry
   */
  score: number | null;
}

export interface AnimePage_Media_streamingEpisodes {
  __typename: "MediaStreamingEpisode";
  /**
   * Title of the episode
   */
  title: string | null;
  /**
   * The site location of the streaming episodes
   */
  site: string | null;
  /**
   * The url of the episode
   */
  url: string | null;
  /**
   * Url of episode image thumbnail
   */
  thumbnail: string | null;
}

export interface AnimePage_Media {
  __typename: "Media";
  /**
   * The id of the media
   */
  id: number;
  /**
   * The mal id of the media
   */
  idMal: number | null;
  /**
   * The official titles of the media in various languages
   */
  title: AnimePage_Media_title | null;
  /**
   * Short description of the media's story and characters
   */
  description: string | null;
  /**
   * The general length of each anime episode in minutes
   */
  duration: number | null;
  /**
   * The amount of episodes the anime has when complete
   */
  episodes: number | null;
  /**
   * The genres of the media
   */
  genres: (string | null)[] | null;
  /**
   * The current releasing status of the media
   */
  status: MediaStatus | null;
  /**
   * If the media is marked as favourite by the current authenticated user
   */
  isFavourite: boolean;
  /**
   * The amount of user's who have favourited the media
   */
  favourites: number | null;
  /**
   * A weighted average score of all the user's scores of the media
   */
  averageScore: number | null;
  /**
   * The url for the media page on the AniList website
   */
  siteUrl: string | null;
  /**
   * The banner image of the media
   */
  bannerImage: string | null;
  /**
   * The cover images of the media
   */
  coverImage: AnimePage_Media_coverImage | null;
  /**
   * Other media in the same or connecting franchise
   */
  relations: AnimePage_Media_relations | null;
  /**
   * The authenticated user's media list entry for the media
   */
  mediaListEntry: AnimePage_Media_mediaListEntry | null;
  /**
   * Data and links to legal streaming episodes on external sites
   */
  streamingEpisodes: (AnimePage_Media_streamingEpisodes | null)[] | null;
}

export interface AnimePage {
  /**
   * Media query
   */
  Media: AnimePage_Media | null;
}

export interface AnimePageVariables {
  id?: number | null;
}
