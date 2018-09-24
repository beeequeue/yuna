<template>
<ApolloQuery class="anime" :query="animeQuery" :variables="{ id }">
  <template v-if="data && data.Media" slot-scope="{ result: { loading, error, data } }">
    <cover-image
      class="slide-down"
      :loading="loading"
      :src="data.Media.coverImage.large"
      :mediaListEntry="getMediaListEntry(data)"
      :length="data.Media.episodes"
    />

    <actions
      class="slide-up"
      :loading="loading"
      :mediaListStatus="getMediaListStatus(data)"
    />

    <anime-title
      class="slide-down"
      :loading="loading"
      :title="data.Media.title"
    />

    <center-container
      class="slide-up"
      :loading="loading"
      :content="data.Media.description"
    />

    <relations
      class="slide-left"
      :loading="loading"
      :relations="data.Media.relations"
    />
  </template>
</ApolloQuery>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { pathOr } from 'rambda'

import AnimeTitle from '../components/Anime/Title.vue'
import Actions from '../components/Anime/Actions.vue'
import CoverImage from '../components/Anime/CoverImage.vue'
import Relations from '../components/Anime/Relations.vue'
import CenterContainer from '../components/Anime/CenterContainer.vue'
import RaisedButton from '../components/RaisedButton.vue'

import AnimePageQuery from '../graphql/AnimePage.graphql'
import { AnimePage } from '../graphql/AnimePage'

@Component({
  components: {
    CenterContainer,
    Relations,
    Actions,
    CoverImage,
    AnimeTitle,
    RaisedButton,
  },
})
export default class Anime extends Vue {
  public get id() {
    return Number(this.$route.params.id)
  }

  public getMediaListEntry(data: AnimePage) {
    return pathOr(null, ['Media', 'mediaListEntry'], data)
  }

  public getMediaListStatus(data: AnimePage) {
    return pathOr(null, ['Media', 'mediaListEntry', 'status'], data)
  }

  animeQuery = AnimePageQuery
  data?: AnimePage
}
</script>

<style scoped lang="scss">
@import '../colors';

$shadow: 1px 5px 15px rgba(0, 0, 0, 0.5);

.anime {
  position: absolute;
  top: 80px;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 25px;
  display: grid;
  background-color: rgba(0, 0, 0, 0.65);
  cursor: auto;
  grid-template-columns: 200px 600px 1fr;
  grid-template-rows: 82px auto 1fr;
  grid-gap: 20px;
  user-select: none;
  z-index: 0 !important;

  & > .cover-image {
    grid-column: 1 / span 1;
    grid-row: 1 / span 2;
    will-change: transform, opacity;
  }

  & > .actions {
    grid-column: 1 / span 1;
    grid-row: 3 / span 1;
    align-self: stretch;
  }

  & > .title {
    grid-column: 2 / span 1;
    grid-row: 1 / span 1;
  }

  & > .center-container {
    grid-column: 2 / span 1;
    grid-row: 2 / span 2;
  }

  & > .relations {
    grid-column: 3 / span 1;
    grid-row: 2 / 4;
    align-self: flex-start;
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
