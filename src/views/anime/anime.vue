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
        :listEntry="getListEntry(data)"
        :length="data.anime.episodes"
        showRating
      />

      <actions
        v-if="data && data.anime"
        key="actions"
        class="slide-up"
        :anime="data.anime"
        :listEntry="data.anime.listEntry"
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

      <episode-list
        key="episodes"
        v-if="data && data.anime"
        class="slide-up"
        :loading="episodesLoading !== 0"
        :anime="data.anime"
        :episodes="episodes"
        padRight
        noVerticalPadding
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
import { oc } from 'ts-optchain'

import CButton from '@/common/components/button.vue'
import EpisodeList from '@/common/components/episode-list.vue'
import CoverImage from '@/common/components/cover-image.vue'
import Actions from '@/common/components/actions.vue'
import AnimeTitle from './components/title.vue'
import CenterContainer from './components/center-container.vue'
import Relations from './components/relations.vue'

import { EPISODE_LIST } from '@/graphql/documents/queries'
import ANIME_QUERY from './anime.graphql'
import {
  AnimeViewListEntry,
  AnimeViewQuery,
  AnimeViewVariables,
  EpisodeListEpisodes,
  EpisodeListQuery,
  EpisodeListVariables,
} from '@/graphql/types'

import { Query } from '@/decorators'
import { getDefaultProvider } from '@/state/auth'
import { getSpoilerSettings } from '@/state/settings'
import { getRelations, isNil } from '@/utils'

@Component({
  components: {
    EpisodeList,
    CenterContainer,
    Relations,
    Actions,
    CoverImage,
    AnimeTitle,
    CButton,
  },
})
export default class Anime extends Vue {
  @Query<Anime, AnimeViewQuery, AnimeViewVariables>({
    query: ANIME_QUERY,
    variables() {
      return {
        id: this.id,
      }
    },
    skip() {
      return isNil(this.id)
    },
    error(err) {
      this.error = typeof err === 'string' ? err : err.message
    },
  })
  public data!: AnimeViewQuery | null
  error: string | null = null

  @Query<Anime, EpisodeListQuery, EpisodeListVariables>({
    fetchPolicy: 'network-only',
    query: EPISODE_LIST,
    loadingKey: 'episodesLoading',
    variables() {
      return {
        id: this.id,
        provider: getDefaultProvider(this.$store.state.auth, this.data!.anime!),
      }
    },
    skip() {
      return isNil(this.id) || isNil(this.data) || isNil(this.data.anime)
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

  public get id() {
    return Number(this.$route.params.id)
  }

  public getShouldBlurDescription(data: AnimeViewQuery) {
    if (!data || !data.anime) {
      return false
    }

    const progress = oc(this.getListEntry(data)).progress(0)
    const setting = getSpoilerSettings(this.$store).anime.description
    const shouldBlur =
      progress < Math.ceil((data.anime.episodes as number) * 0.33)

    return shouldBlur && setting
  }

  public getListEntry(data: AnimeViewQuery): AnimeViewListEntry | null {
    return oc(data).anime.listEntry(null)
  }

  public getRelations = getRelations
}
</script>

<style scoped lang="scss">
@import '../../colors';

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
    & > .loading-wrapper {
      grid-column: 2 / span 1;
      grid-row: 3 / span 1;
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
