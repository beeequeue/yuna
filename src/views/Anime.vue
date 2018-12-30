<template>
  <ApolloQuery class="anime" :query="ANIME_PAGE_QUERY" :variables="{ id }" @result="fetchedAnime">
    <template slot-scope="{ result: { loading, error, data } }">
      <transition-group tag="span">
        <div v-if="error" key="error" class="error-container slide-down">
          <h1>{{ error.graphQLErrors[0].message }}</h1>

          <c-button content="Go back" @click.native="$router.back()"/>
        </div>

        <cover-image
          v-if="data && data.anime"
          key="cover-image"
          class="slide-down"
          :src="data.anime.coverImage.extraLarge"
          :color="data.anime.coverImage.color"
          :mediaListEntry="getMediaListEntry(data)"
          :length="data.anime.episodes"
        />

        <actions
          v-if="data && data.anime"
          key="actions"
          class="slide-up"
          :anime="data.anime"
          :mediaListEntry="data.anime.mediaListEntry"
        />

        <anime-title
          v-if="data && data.anime"
          key="title"
          class="slide-down"
          :title="data.anime.title"
        />

        <center-container
          v-if="data && data.anime"
          key="center"
          class="slide-up"
          :id="data.anime.id"
          :idMal="data.anime.idMal"
          :rating="data.anime.averageScore"
          :content="data.anime.description"
          :nextAiringEpisode="data.anime.nextAiringEpisode"
          :blurDescription="getShouldBlurDescription(data)"
        />

        <episodes
          key="episodes"
          v-if="data && data.anime && data.anime.idMal"
          class="slide-up"
          :id="data.anime.id"
          :idMal="data.anime.idMal"
          :listEntry="data.anime.mediaListEntry"
          :animeName="data.anime.title.userPreferred"
          :episodesInAnime="data.anime.episodes"
          :nextAiringEpisode="data.anime.nextAiringEpisode"
          :sequels="getSequels(data)"
          showScroller
          rightPadding
        />

        <relations
          v-if="data && data.anime"
          key="relations"
          class="slide-left"
          :relations="data.anime.relations"
        />
      </transition-group>
    </template>
  </ApolloQuery>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { path, pathOr } from 'rambdax'

import CoverImage from '../components/Anime/CoverImage.vue'
import AnimeTitle from '../components/Anime/Title.vue'
import Actions from '../components/Anime/Actions.vue'
import CenterContainer from '../components/Anime/CenterContainer.vue'
import Relations from '../components/Anime/Relations.vue'
import Episodes from '../components/Episodes.vue'
import CButton from '../components/CButton.vue'

import { MediaRelation } from '@/graphql-types'
import ANIME_PAGE_QUERY from '@/graphql/AnimePageQuery.graphql'
import {
  AnimePageQuery,
  AnimePageQuery_anime_relations_edges,
  AnimePageQuery_anime_relations_edges_node,
  AnimePageQuery_anime_mediaListEntry,
} from '@/graphql/AnimePageQuery'
import { Sequel } from '@/state/app'
import { getSpoilerSettings } from '@/state/settings'
import { trackPageView, Page } from '@/lib/tracking'

@Component({
  components: {
    Episodes,
    CenterContainer,
    Relations,
    Actions,
    CoverImage,
    AnimeTitle,
    CButton,
  },
})
export default class Anime extends Vue {
  ANIME_PAGE_QUERY = ANIME_PAGE_QUERY
  data?: AnimePageQuery
  tracked = false

  public get id() {
    return Number(this.$route.params.id)
  }

  public async fetchedAnime(result: { data: AnimePageQuery }) {
    if (this.tracked) return

    trackPageView(
      Page.ANIME,
      this.id,
      path('data.anime.title.english', result) ||
        path('data.anime.title.userPreferred', result),
    )

    this.tracked = true
  }

  public getShouldBlurDescription(data: AnimePageQuery) {
    if (!data || !data.anime) {
      return false
    }

    const progress = pathOr(0, ['progress'], this.getMediaListEntry(data))
    const setting = getSpoilerSettings(this.$store).anime.description
    const shouldBlur =
      progress < Math.ceil((data.anime.episodes as number) * 0.33)

    return shouldBlur && setting
  }

  public getMediaListEntry(
    data: AnimePageQuery,
  ): AnimePageQuery_anime_mediaListEntry | null {
    return pathOr(null, ['anime', 'mediaListEntry'], data)
  }

  public getMediaListStatus(data: AnimePageQuery) {
    return pathOr(null, ['anime', 'mediaListEntry', 'status'], data)
  }

  public getSequels(data?: AnimePageQuery): Sequel[] {
    if (!data) return []

    const edges: AnimePageQuery_anime_relations_edges[] = pathOr(
      [],
      ['anime', 'relations', 'edges'],
      data,
    )

    const nodes = edges.filter(
      node => node.relationType === MediaRelation.SEQUEL,
    )

    return nodes
      .map(edge => edge.node as AnimePageQuery_anime_relations_edges_node)
      .map(node => ({
        id: node.id as number,
        title: pathOr('TITLE', ['title', 'userPreferred'], node),
        bannerImage: node.bannerImage as string,
      }))
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.anime {
  position: absolute;
  top: 80px;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.65);

  & > span {
    position: relative;
    padding: 25px;
    display: grid;
    cursor: auto;
    grid-template-columns: 200px 600px 1fr;
    grid-template-rows: 90px auto 1fr;
    grid-gap: 20px;
    user-select: none;
    z-index: 0 !important;

    & > * {
      will-change: opacity, transform;

      /*
        Need to duplicate enter animations here
        due to initial data loading slightly after entering the route
      */

      &.v-enter-active {
        transition: transform 0.75s, opacity 0.75s;
      }

      &.v-enter {
        &.slide- {
          &down {
            opacity: 0;
            transform: translateY(-10%);
          }
          &up {
            opacity: 0;
            transform: translateY(10%);
          }
          &left {
            opacity: 0;
            transform: translateX(10%);
          }
        }
      }
    }

    & > .error-container {
      position: fixed;
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      justify-content: center;
      align-items: center;
      text-shadow: 0 0 5px black;

      & > h1 {
        font-family: 'Raleway', sans-serif;
      }

      & > .button {
        font-size: 1.5em;
      }
    }

    & > .cover-image {
      grid-column: 1 / span 1;
      grid-row: 1 / span 2;
    }

    & > .actions {
      grid-column: 1 / span 1;
      grid-row: 3 / span 1;
      align-self: stretch;
    }

    & > .title {
      grid-column: 2 / span 2;
      grid-row: 1 / span 1;
    }

    & > .center-container {
      grid-column: 2 / span 1;
      grid-row: 2 / span 2;
    }

    & > .episodes {
      grid-column: 2 / span 2;
      grid-row: 3 / span 1;
      align-self: flex-start;
    }

    & > .relations {
      grid-column: 3 / span 1;
      grid-row: 2 / span 2;
      align-self: flex-start;
    }
  }
}

.route-enter-active,
.route-leave-active {
  will-change: background-color;
  transition: background-color 0.75s;

  & .slide-up,
  & .slide-down,
  & .slide-left {
    transition: transform 0.75s, opacity 0.75s;
  }
}

.route-enter,
.route-leave-to {
  background-color: transparent;

  & .slide- {
    &down {
      opacity: 0;
      transform: translateY(-10%);
    }
    &up {
      opacity: 0;
      transform: translateY(10%);
    }
    &left {
      opacity: 0;
      transform: translateX(10%);
    }
  }
}
</style>
