/* tslint:disable */
// This file was automatically generated and should not be edited.

import { MediaRelation, MediaType, MediaListStatus } from "./..\\graphql-types";

// ====================================================
// GraphQL query operation: AnimePageQuery
// ====================================================

export interface AnimePageQuery_anime_title {
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

export interface AnimePageQuery_anime_coverImage {
  __typename: "MediaCoverImage";
  /**
   * The cover image url of the media at its largest size. If this size isn't available, large will be provided instead.
   */
  extraLarge: string | null;
}

export interface AnimePageQuery_anime_relations_edges_node_title {
  __typename: "MediaTitle";
  /**
   * The currently authenticated users preferred title language. Default romaji for non-authenticated
   */
  userPreferred: string | null;
}

export interface AnimePageQuery_anime_relations_edges_node {
  __typename: "Media";
  /**
   * The id of the media
   */
  id: number;
  /**
   * The official titles of the media in various languages
   */
  title: AnimePageQuery_anime_relations_edges_node_title | null;
  /**
   * The banner image of the media
   */
  bannerImage: string | null;
  /**
   * The type of the media; anime or manga
   */
  type: MediaType | null;
}

export interface AnimePageQuery_anime_relations_edges {
  __typename: "MediaEdge";
  /**
   * The type of relation to the parent model
   */
  relationType: MediaRelation | null;
  node: AnimePageQuery_anime_relations_edges_node | null;
}

export interface AnimePageQuery_anime_relations {
  __typename: "MediaConnection";
  edges: (AnimePageQuery_anime_relations_edges | null)[] | null;
}

export interface AnimePageQuery_anime_mediaListEntry {
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
  /**
   * The amount of times the user has rewatched/read the media
   */
  repeat: number | null;
}

export interface AnimePageQuery_anime {
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
  title: AnimePageQuery_anime_title | null;
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
   * If the media is marked as favourite by the current authenticated user
   */
  isFavourite: boolean;
  /**
   * A weighted average score of all the user's scores of the media
   */
  averageScore: number | null;
  /**
   * The banner image of the media
   */
  bannerImage: string | null;
  /**
   * The cover images of the media
   */
  coverImage: AnimePageQuery_anime_coverImage | null;
  /**
   * Other media in the same or connecting franchise
   */
  relations: AnimePageQuery_anime_relations | null;
  /**
   * The authenticated user's media list entry for the media
   */
  mediaListEntry: AnimePageQuery_anime_mediaListEntry | null;
}

export interface AnimePageQuery {
  /**
   * Media query
   */
  anime: AnimePageQuery_anime | null;
}

export interface AnimePageQueryVariables {
  id?: number | null;
}
