<template>
  <div class="anime">
    <transition-group tag="span">
      <div v-if="error" key="error" class="error-container slide-down">
        <h1>{{ error.graphQLErrors[0].message }}</h1>

        <c-button content="Go back" @click.native="$router.back()" />
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
        :score="data.anime.averageScore"
        :content="data.anime.description"
        :nextAiringEpisode="data.anime.nextAiringEpisode"
        :blurDescription="getShouldBlurDescription(data)"
      />

      <queue-episode-list
        key="episodes"
        v-if="data && data.anime"
        class="slide-up"
        :anime="data.anime"
        :episodes="episodes"
        padRight
      />

      <relations
        v-if="data && data.anime"
        key="relations"
        class="slide-left"
        :prequels="getRelations(data, 'PREQUEL')"
        :sequels="getRelations(data, 'SEQUEL')"
      />
    </transition-group>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { path, pathOr } from 'rambdax'

import CoverImage from '@/components/Anime/CoverImage.vue'
import AnimeTitle from '@/components/Anime/Title.vue'
import Actions from '@/components/Anime/Actions.vue'
import CenterContainer from '@/components/Anime/CenterContainer.vue'
import Relations from '@/components/Anime/Relations.vue'
import CButton from '@/components/CButton.vue'
import QueueEpisodeList from '@/components/QueueItem/QueueEpisodeList.vue'

import EPISODE_LIST from '@/graphql/EpisodeList.graphql'
import ANIME_PAGE_QUERY from '@/graphql/AnimePageQuery.graphql'
import {
  AnimePageQueryMediaListEntry,
  AnimePageQueryQuery,
  AnimePageQueryVariables,
  EpisodeListEpisodes,
  EpisodeListQuery,
  EpisodeListVariables,
} from '@/graphql/types'

import { Query } from '@/decorators'
import { getSpoilerSettings } from '@/state/settings'
import { Page, trackPageView } from '@/lib/tracking'
import { getRelations } from '@/utils'

@Component({
  components: {
    QueueEpisodeList,
    CenterContainer,
    Relations,
    Actions,
    CoverImage,
    AnimeTitle,
    CButton,
  },
})
export default class Anime extends Vue {
  @Query<Anime, AnimePageQueryQuery, AnimePageQueryVariables>({
    query: ANIME_PAGE_QUERY,
    variables() {
      return {
        id: this.id,
      }
    },
    error(err: Error) {
      this.error = err.message
    },
    result(data) {
      this.fetchedAnime(data)
    },
  })
  public data!: AnimePageQueryQuery | null
  error: string | null = null

  @Query<Anime, EpisodeListQuery, EpisodeListVariables>({
    fetchPolicy: 'network-only',
    query: EPISODE_LIST,
    loadingKey: 'episodesLoading',
    variables() {
      return {
        id: this.id,
      }
    },
    skip() {
      return !this.id
    },
    error(err) {
      if (typeof err === 'string') {
        this.episodesFetchingError = err.replace('Network error: ', '')
        return
      }

      if (typeof err.message === 'string') {
        this.episodesFetchingError = err.message.replace('Network error: ', '')
        return
      }

      this.episodesFetchingError =
        'Something went wrong fetching the episodes. :('
    },
  })
  public episodes!: EpisodeListEpisodes[] | null
  public episodesLoading = 0
  public episodesFetchingError: string | null = null

  tracked = false

  public get id() {
    return Number(this.$route.params.id)
  }

  public async fetchedAnime(data: AnimePageQueryQuery) {
    if (this.tracked) return

    trackPageView(
      Page.ANIME,
      this.id,
      path('anime.title.english', data) ||
        path('anime.title.userPreferred', data),
    )

    this.tracked = true
  }

  public getShouldBlurDescription(data: AnimePageQueryQuery) {
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
    data: AnimePageQueryQuery,
  ): AnimePageQueryMediaListEntry | null {
    return pathOr(null, ['anime', 'mediaListEntry'], data)
  }

  public getRelations = getRelations
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

    & > .episode-list {
      grid-column: 2 / span 2;
      grid-row: 3 / span 1;
      align-self: flex-start;
    }

    & > .source-list {
      grid-column: 2 / span 1;
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
