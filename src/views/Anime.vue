<template>
<ApolloQuery class="anime" :query="animeQuery" :variables="{ id }">
  <template v-if="data && data.Media" slot-scope="{ result: { loading, error, data } }">
    <cover-image
      :loading="loading"
      :mediaListStatus="getMediaListStatus(data)"
      :src="data.Media.coverImage.large"
      class="slide-down"
    />

    <div class="buttons slide-up">
      <raised-button
        content="Set as Planning"
      />

      <raised-button
        content="Add to Queue"
      />

      <raised-button
        @click.native="$router.push('/anime/10165')"
        content="Go to Nichijou"
      />

      <raised-button
        @click.native="$router.push(`/anime/404}`)"
        content="Go to 404"
      />
    </div>

    <anime-title
      class="slide-down"
      :loading="loading"
      :english="data.Media.title.english"
      :romaji="data.Media.title.romaji"
      :native="data.Media.title.native"
      :preferred="data.Media.title.userPreferred"
    />

    <div class="description slide-up" v-html="data.Media.description"/>
  </template>
</ApolloQuery>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { pathOr } from 'rambda'

import AnimeTitle from '../components/Anime/Title.vue'
import CoverImage from '../components/Anime/CoverImage.vue'
import RaisedButton from '../components/RaisedButton.vue'

import AnimePageQuery from '../graphql/AnimePage.graphql'
import { AnimePage } from '../graphql/AnimePage'

@Component({
  components: { CoverImage, AnimeTitle, RaisedButton },
})
export default class Anime extends Vue {
  public get id() {
    return Number(this.$route.params.id)
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

  & > .buttons {
    grid-column: 1 / span 1;
    grid-row: 3 / span 1;
    align-self: stretch;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;

    & > .button {
      margin-bottom: 10px;
      box-shadow: $shadow;
    }
  }

  & > .title {
    grid-column: 2 / span 1;
    grid-row: 1 / span 1;
  }

  & > .description {
    grid-column: 2 / span 1;
    grid-row: 2 / 4;
    align-self: flex-start;
    padding: 15px 20px;
    background: $dark;
    border-radius: 5px;
    text-align: left;
    box-shadow: $shadow;
    user-select: initial;
  }
}

.route-enter-active,
.route-leave-active {
  will-change: background-color;
  transition: background-color 0.75s;

  & .slide-up,
  & .slide-down {
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
  }
}
</style>
