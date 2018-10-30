/* tslint:disable */
// This file was automatically generated and should not be edited.

import { MediaType } from "./..\\graphql-types";

// ====================================================
// GraphQL query operation: SearchQuery
// ====================================================

export interface SearchQuery_anime_pageInfo {
  __typename: "PageInfo";
  /**
   * The total number of items
   */
  total: number | null;
}

export interface SearchQuery_anime_results_title {
  __typename: "MediaTitle";
  /**
   * The currently authenticated users preferred title language. Default romaji for non-authenticated
   */
  userPreferred: string | null;
}

export interface SearchQuery_anime_results_coverImage {
  __typename: "MediaCoverImage";
  /**
   * The cover image url of the media at medium size
   */
  medium: string | null;
}

export interface SearchQuery_anime_results_streamingEpisodes {
  __typename: "MediaStreamingEpisode";
  /**
   * The site location of the streaming episodes
   */
  site: string | null;
}

export interface SearchQuery_anime_results {
  __typename: "Media";
  /**
   * The id of the media
   */
  id: number;
  /**
   * The type of the media; anime or manga
   */
  type: MediaType | null;
  /**
   * The official titles of the media in various languages
   */
  title: SearchQuery_anime_results_title | null;
  /**
   * The cover images of the media
   */
  coverImage: SearchQuery_anime_results_coverImage | null;
  /**
   * Data and links to legal streaming episodes on external sites
   */
  streamingEpisodes: (SearchQuery_anime_results_streamingEpisodes | null)[] | null;
}

export interface SearchQuery_anime {
  __typename: "Page";
  /**
   * The pagination information
   */
  pageInfo: SearchQuery_anime_pageInfo | null;
  results: (SearchQuery_anime_results | null)[] | null;
}

export interface SearchQuery {
  anime: SearchQuery_anime | null;
}

export interface SearchQueryVariables {
  search?: string | null;
}
