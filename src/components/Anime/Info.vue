<template>
<div class="info-container">
  <a class="item" :href="alLink">
    <span v-html="alLogo" class="logo"/>

    <span v-if="rating" class="rating">
      {{rating}}%
    </span>
  </a>

  <a class="item" :href="malLink">
    <img class="logo mal" :src="malLogo"/>

    <span v-if="malRating !== 'N/A'" class="rating">
      {{malRating || '...'}}
    </span>
  </a>

  <div
    v-if="nextAiringEpisode"
    class="item next-episode"
    v-tooltip.top="nextEpisodeDateString"
  >
    New episode in {{nextEpisodeDistanceString}}
  </div>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { formatDistance, format } from 'date-fns'
import { mdiChevronDown } from '@mdi/js'

import malLogo from '@/assets/myanimelist.png'
import alLogo from '@/assets/anilist.svg'
import { AnimePageQuery_anime_nextAiringEpisode } from '@/graphql/AnimePageQuery'
import { sendErrorToast } from '@/state/app'
import { AnimeCache } from '@/lib/cache'
import Icon from '../Icon.vue'

@Component({
  components: { Icon },
})
export default class Info extends Vue {
  @Prop(Number) public id!: number | null
  @Prop(Number) public rating!: number | null
  @Prop(Number) public idMal!: number | null
  @Prop(Object)
  public nextAiringEpisode!: AnimePageQuery_anime_nextAiringEpisode | null

  $refs!: {
    content: HTMLElement
  }

  public malRating: string | null = null

  public malLogo = malLogo
  public alLogo = alLogo
  public openSvg = mdiChevronDown

  public get alLink() {
    return `https://anilist.co/anime/${this.id}`
  }

  public get malLink() {
    return `https://myanimelist.net/anime/${this.idMal}`
  }

  public get nextEpisodeDateString() {
    if (!this.nextAiringEpisode) return null

    return format(
      this.nextAiringEpisode.airingAt * 1000,
      'iiii, do MMM - kk:mm',
    )
  }

  public get nextEpisodeDistanceString() {
    if (!this.nextAiringEpisode) return null

    return formatDistance(new Date(), this.nextAiringEpisode.airingAt * 1000)
  }

  public mounted() {
    this.fetchMALRating()
  }

  public async fetchMALRating() {
    if (this.malRating || !this.idMal) return

    let rating

    try {
      rating = await AnimeCache.getMalRating(this.idMal)
    } catch (e) {
      return sendErrorToast(this.$store, e)
    }

    this.malRating = rating
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.info-container {
  display: flex;
  margin-top: -10px;
  margin-bottom: 10px;

  & > .item {
    display: inline-block;
    background: $dark;
    margin-right: 10px;
    border-radius: 5px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    color: $white;
    text-decoration: none;

    &.next-episode {
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
