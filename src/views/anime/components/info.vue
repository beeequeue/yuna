<template>
  <div class="info-container">
    <a class="item" :href="alLink">
      <span v-html="alLogo" class="logo" />

      <span v-if="score" class="rating">{{ score }}%</span>
    </a>

    <a class="item" :href="malLink">
      <img class="logo mal" :src="malLogo" />

      <span v-if="$apollo.loading || scoreMal != null" class="rating">
        {{ !$apollo.loading ? scoreMal.toFixed(2) : '...' }}
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
import gql from 'graphql-tag'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { oc } from 'ts-optchain'
import { mdiChevronDown } from '@mdi/js'

import malLogo from '@/assets/myanimelist.webp'
import alLogo from '@/assets/anilist.svg'

import { Query, Required } from '@/decorators'
import { AnimeViewNextAiringEpisode } from '@/graphql/types'

import NextEpisodeInfo from '@/common/components/next-episode-info.vue'
import Icon from '@/components/Icon.vue'

@Component({
  components: { NextEpisodeInfo, Icon },
})
export default class Info extends Vue {
  @Required(Number) public id!: number
  @Prop(Number) public idMal!: number | null
  @Prop(Number) public score!: number | null
  @Prop(Object)
  public nextAiringEpisode!: AnimeViewNextAiringEpisode | null

  @Query<Info, { anime: { scoreMal: number | null } }, { id: number }>({
    query: gql`
      query MalScore($id: Int!) {
        anime: Media(id: $id) {
          idMal
          scoreMal @client
        }
      }
    `,
    variables() {
      return { id: this.id }
    },
    update: data => oc(data).anime.scoreMal(null),
  })
  public scoreMal!: number | null

  $refs!: {
    content: HTMLElement
  }

  public malLogo = malLogo
  public alLogo = alLogo
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
