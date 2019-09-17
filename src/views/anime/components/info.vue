<template>
  <div class="info-container">
    <a class="item" :href="alLink">
      <span v-html="alLogo" class="logo" />

      <span v-if="score" class="rating">{{ score }}%</span>
    </a>

    <a class="item" :href="malLink">
      <img class="logo mal" :src="malLogo" />

      <span v-if="$apollo.loading || scoreMal" class="rating">
        {{ !$apollo.loading ? scoreMal.toFixed(2) : '...' }}
      </span>
    </a>

    <a v-if="simklInfo" class="item" :href="simklInfo.linkSimkl" title="simkl">
      <span v-html="simklLogo" class="logo simkl" />

      <span
        v-if="$apollo.loading || simklInfo.scoreSimkl != null"
        class="rating"
      >
        {{ !$apollo.loading ? simklInfo.scoreSimkl.toFixed(2) : '...' }}
      </span>
    </a>

    <div class="item">
      <next-episode-info
        v-if="nextAiringEpisode"
        :nextAiringEpisode="nextAiringEpisode"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { oc } from 'ts-optchain'
import { mdiChevronDown } from '@mdi/js'

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
} from '@/graphql/types'

import NextEpisodeInfo from '@/common/components/next-episode-info.vue'
import Icon from '@/common/components/icon.vue'

@Component({
  components: { NextEpisodeInfo, Icon },
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
    update: data => oc(data).anime.scoreMal(null),
  })
  public scoreMal!: number | null

  @Query<Info, SimklInfoQuery, SimklInfoQueryVariables>({
    query: SIMKL_INFO_QUERY,
    variables() {
      return { id: this.id }
    },
    update: data => oc(data).Media(null),
  })
  public simklInfo!: SimklInfoQuery['Media']

  $refs!: {
    content: HTMLElement
  }

  public alLogo = alLogo
  public malLogo = malLogo
  public simklLogo = simklLogo
  public openSvg = mdiChevronDown

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

    & > .logo {
      position: relative;
      height: 20px;
      padding: 5px 10px;
      box-sizing: initial !important;
      object-fit: contain;

      &.mal {
        padding: 5px 10px;
        height: 15px;
      }

      & /deep/ svg {
        height: 20px;
        width: 20px;
      }
    }

    & > .rating {
      font-weight: 800;
      font-size: 18px;
      padding: 5px 10px;
      padding-left: 0;
    }
  }
}
</style>
