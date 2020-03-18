<template>
  <div class="info-container">
    <list-link
      title="AniList"
      :logo="alLogo"
      :loading="$apollo.loading"
      :link="alLink"
      :score="score"
      type="percent"
    />

    <list-link
      title="MyAnimeList"
      :logo="malLogo"
      :loading="$apollo.loading"
      :link="malLink"
      :score="scoreMal"
    />

    <list-link
      title="Simkl"
      :logo="simklLogo"
      :loading="$apollo.loading"
      :link="simklInfo && simklInfo.linkSimkl"
      :score="simklInfo && simklInfo.scoreSimkl"
    />

    <div class="item">
      <next-episode-info
        v-if="nextAiringEpisode"
        :next-airing-episode="nextAiringEpisode"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import alLogo from '@/assets/anilist.svg'
import malLogo from '@/assets/myanimelist.webp'
import simklLogo from '@/assets/simkl.svg'

import { Query, Required } from '@/decorators'
import { MAL_SCORE_QUERY, SIMKL_INFO_QUERY } from '@/graphql/documents/queries'
import {
  AnimeViewNextAiringEpisode,
  MalScoreQuery,
  MalScoreQueryVariables,
  SimklInfoQuery,
  SimklInfoQueryVariables,
} from '@/graphql/generated/types'

import ListLink from '@/views/anime/components/list-link.vue'
import NextEpisodeInfo from '@/common/components/next-episode-info.vue'
import Icon from '@/common/components/icon.vue'

@Component({
  components: { ListLink, NextEpisodeInfo, Icon },
})
export default class Info extends Vue {
  @Required(Number) public id!: number
  @Prop(Number) public idMal!: number | null
  @Prop(Number) public score!: number | null
  @Prop(Object)
  public nextAiringEpisode!: AnimeViewNextAiringEpisode | null

  @Query<Info, MalScoreQuery, MalScoreQueryVariables>({
    query: MAL_SCORE_QUERY,
    variables() {
      return { id: this.id }
    },
    update: data => data.anime?.scoreMal ?? null,
  })
  public scoreMal!: number | null

  @Query<Info, SimklInfoQuery, SimklInfoQueryVariables>({
    query: SIMKL_INFO_QUERY,
    variables() {
      return { id: this.id }
    },
    update: data => data.Media ?? null,
  })
  public simklInfo: SimklInfoQuery['Media'] = {
    id: -1,
    linkSimkl: null,
    scoreSimkl: null,
  }

  $refs!: {
    content: HTMLElement
  }

  public alLogo = alLogo
  public malLogo = malLogo
  public simklLogo = simklLogo

  public get alLink() {
    return `https://anilist.co/anime/${this.id}`
  }

  public get malLink() {
    return `https://myanimelist.net/anime/${this.idMal}`
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.info-container {
  display: flex;
  margin-top: -10px;
  margin-bottom: 10px;

  & > .item {
    margin-right: 10px;
    border-radius: 5px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    color: $white;
    background: $dark;
    box-shadow: $shadow;
    text-decoration: none;

    & > .next-episode-info {
      font-weight: 600;
      padding: 0 10px;
    }
  }
}
</style>
