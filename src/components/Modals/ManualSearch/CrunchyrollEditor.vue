<template>
  <div v-if="loading || episodeCountLoading !== 0" class="loading-wrapper">
    <loading :size="50" />
  </div>

  <div v-else-if="anime" class="crunchyroll-editor">
    <div class="header">
      <c-button
        flat
        type="white"
        :icon="backSvg"
        @click.native="setSelectedId(null)"
      />

      <div class="title">{{ anime.title }}</div>

      <c-button flat type="success" :icon="confirmSvg" />
    </div>

    <div class="editor"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { isNil } from 'rambdax'
import { mdiArrowLeft, mdiCheck } from '@mdi/js'

import EPISODE_COUNT_QUERY from '@/graphql/EpisodeCount.graphql'
import { EpisodeCountQuery, EpisodeCountVariables } from '@/graphql/types'
import Loading from '@/components/Loading.vue'
import Icon from '@/components/Icon.vue'
import CButton from '@/components/CButton.vue'

import { Query, Required } from '@/decorators'
import { ManualSearchOptions } from '@/state/app'
import AnimeBanner from '@/components/AnimeBanner.vue'
import { _SeriesWithEpisodes, Crunchyroll } from '@/lib/crunchyroll'

@Component({ components: { CButton, AnimeBanner, Icon, Loading } })
export default class CrunchyrollEditor extends Vue {
  @Query<CrunchyrollEditor, EpisodeCountQuery, EpisodeCountVariables>({
    query: EPISODE_COUNT_QUERY,
    skip() {
      return isNil(this.searchOptions.anilistId)
    },
    variables() {
      return {
        id: this.searchOptions.anilistId,
      }
    },
    loadingKey: 'episodeCountLoading',
    update: data => data.anime!.episodes,
  })
  public episodeCount!: number
  public episodeCountLoading = 0

  @Required(Object)
  searchOptions!: ManualSearchOptions
  @Required(Number) id!: number
  @Required(Function) setSelectedId!: (id: number | null) => void

  public loading = false
  public anime: _SeriesWithEpisodes | null = null

  public backSvg = mdiArrowLeft
  public confirmSvg = mdiCheck

  public mounted() {
    this.fetchAnime()
  }

  @Watch('id')
  public async fetchAnime() {
    this.loading = true

    this.anime = await Crunchyroll.fetchSeries(
      this.searchOptions.anilistId as number,
      this.id,
    )

    this.loading = false
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.loading-wrapper {
  position: absolute;
  display: flex;
  align-items: center;
  height: 100%;
  min-height: 60px;
}

.crunchyroll-editor {
  position: relative;
  width: 100%;

  & > .header {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    white-space: nowrap;
    font-size: 1.2em;
    font-family: Raleway, sans-serif;
    font-weight: 500;
    background: color($dark, 500);
    border-bottom: 1px solid color($dark, 300);

    & > .title {
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 10px;
    }

    & > .button {
      flex-shrink: 0;
      height: 40px;
      width: 40px;
      padding: 0;
      fill: $white;
      cursor: pointer;

      & /deep/ .icon {
        height: 43px;
        width: 30px;
      }
    }
  }

  & > .editor {
    height: 100px;
  }
}
</style>
