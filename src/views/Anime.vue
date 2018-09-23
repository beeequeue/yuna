<template>
<ApolloQuery class="anime" :query="animeQuery" :variables="{ id }">
  <template v-if="data && data.Media" slot-scope="{ result: { loading, error, data } }">
    <img :src="data.Media.coverImage.large" class="cover-image"/>

    <div class="buttons">
      <raised-button content="Set as Planning"/>
      <raised-button content="Add to Queue"/>
      <raised-button content="Add to planning"/>
    </div>

    <anime-title
      :loading="loading"
      :english="data.Media.title.english"
      :romaji="data.Media.title.romaji"
      :native="data.Media.title.native"
      :preferred="data.Media.title.userPreferred"
    />

    <div class="description" v-html="data.Media.description"/>
  </template>
</ApolloQuery>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import AnimeTitle from '../components/Anime/Title.vue'
import RaisedButton from '../components/RaisedButton.vue'
import AnimeQuery from '../graphql/Anime.graphql'

@Component({
  components: { AnimeTitle, RaisedButton },
})
export default class Anime extends Vue {
  public get id() {
    return 7791 || Number(this.$route.params.id)
  }

  animeQuery = AnimeQuery
  data: any
}
</script>

<style scoped lang="scss">
@import '../colors';

@mixin boxShadow {
  box-shadow: 1px 5px 15px rgba(0, 0, 0, 0.5);
}

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
    width: 100%;
    border-radius: 5px;
    @include boxShadow;
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
      @include boxShadow;
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
    @include boxShadow;
  }
}

.route-enter-active,
.route-leave-active {
  transition: background-color 0.5s;
}

.route-enter,
.route-leave-to {
  background-color: transparent;
}
</style>
