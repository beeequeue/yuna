<template>
<ApolloQuery
  class="anime"
  :query="ANIME_PAGE_QUERY"
  :variables="{ id }"
>
  <template slot-scope="{ result: { loading, error, data } }">
    <transition-group tag="span">
      <div
        v-if="error"
        key="error"
        class="error-container slide-down"
      >
        <h1>{{ error.graphQLErrors[0].message }}</h1>

        <raised-button
          content="Go back"
          @click.native="$router.back()"
        />
      </div>

      <cover-image
        v-if="data && data.anime"
        key="cover-image"
        class="slide-down"
        :src="data.anime.coverImage.large"
        :mediaListEntry="getMediaListEntry(data)"
        :length="data.anime.episodes"
      />

      <actions
        v-if="data && data.anime"
        key="actions"
        class="slide-up"
        :mediaId="data.anime.id"
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
        :content="data.anime.description"
      />

      <episodes
        key="episodes"
        v-if="data && data.anime && data.anime.idMal"
        class="slide-up"
        :id="data.anime.id"
        :idMal="data.anime.idMal"
        :listEntry="data.anime.mediaListEntry"
        showScroller
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
import { pathOr } from 'rambda'

import CoverImage from '../components/Anime/CoverImage.vue'
import AnimeTitle from '../components/Anime/Title.vue'
import Actions from '../components/Anime/Actions.vue'
import CenterContainer from '../components/Anime/CenterContainer.vue'
import Relations from '../components/Anime/Relations.vue'
import Episodes from '../components/Episodes.vue'
import RaisedButton from '../components/RaisedButton.vue'

import ANIME_PAGE_QUERY from '../graphql/AnimePageQuery.graphql'
import { AnimePageQuery } from '../graphql/AnimePageQuery'

@Component({
  components: {
    Episodes,
    CenterContainer,
    Relations,
    Actions,
    CoverImage,
    AnimeTitle,
    RaisedButton,
  },
})
export default class Anime extends Vue {
  ANIME_PAGE_QUERY = ANIME_PAGE_QUERY
  data?: AnimePageQuery

  public get id() {
    return Number(this.$route.params.id)
  }

  public getMediaListEntry(data: AnimePageQuery) {
    return pathOr(null, ['anime', 'mediaListEntry'], data)
  }

  public getMediaListStatus(data: AnimePageQuery) {
    return pathOr(null, ['anime', 'mediaListEntry', 'status'], data)
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
      grid-row: 2 / 4;
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
