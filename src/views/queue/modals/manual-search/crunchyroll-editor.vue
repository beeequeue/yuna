<template>
  <div v-if="loading || episodeCountLoading !== 0" class="loading-wrapper">
    <loading :size="50" />
  </div>

  <div v-else-if="anime" class="crunchyroll-editor">
    <div class="header">
      <c-button flat type="white" :icon="backSvg" :click="goBack" />

      <div class="title">{{ anime.title }}</div>

      <c-button
        flat
        :confirm="!correctAmount"
        type="success"
        :icon="confirmSvg"
        :click="saveEpisodes"
        :onConfirm="saveEpisodes"
        v-tooltip.top="confirmTooltip"
      />
    </div>

    <div class="editor">
      <crunchyroll-collection
        v-for="collection in anime.collections"
        :key="collection.collection_id"
        :collection="collection"
        :selectedEpisodes="selectedEpisodes"
        :selectEpisodes="selectEpisodes"
        :unselectEpisodes="unselectEpisodes"
      />
    </div>

    <div class="status" :class="{ error: !correctAmount }">
      Selected episodes:
      <span class="selected">{{ selectedEpisodeCount }}</span>
      {{ ' / ' }}
      <span>{{ episodeCount }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { TooltipSettings } from 'v-tooltip'
import gql from 'graphql-tag'
import { mdiArrowLeft, mdiCheck } from '@mdi/js'

import { cacheEpisodes } from '@/common/mutations/episodes'
import { EpisodeListEpisodes, Provider, Maybe } from '@/graphql/types'
import Loading from '@/common/components/loading.vue'
import Icon from '@/common/components/icon.vue'
import CButton from '@/common/components/button.vue'
import AnimeBanner from '@/common/components/anime-banner.vue'
import CrunchyrollCollection from './crunchyroll-collection.vue'

import { Query, Required } from '@/decorators'
import {
  ManualSearchOptions,
  selectCrunchyrollEpisodes,
  unselectCrunchyrollEpisodes,
} from '@/state/app'
import { _SeriesWithCollections, Crunchyroll } from '@/lib/crunchyroll'
import { isNil, pluck } from '@/utils'

type EpisodeCountVariables = {
  id: Maybe<number>
}

type EpisodeCountQuery = {
  __typename?: 'Query'

  anime: Maybe<{
    __typename?: 'Media'

    episodes: Maybe<number>
  }>
}

@Component({
  components: { CrunchyrollCollection, CButton, AnimeBanner, Icon, Loading },
})
export default class CrunchyrollEditor extends Vue {
  @Query<CrunchyrollEditor, EpisodeCountQuery, EpisodeCountVariables>({
    query: gql`
      query EpisodeCount($id: Int) {
        anime: Media(id: $id) {
          episodes
        }
      }
    `,
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
  @Required(Array) public selectedEpisodes!: EpisodeListEpisodes[]
  @Required(Function) setSelectedId!: (id: number | null) => void
  @Required(Function) public toggleVisible!: () => any

  public loading = false
  public anime: _SeriesWithCollections | null = null

  public backSvg = mdiArrowLeft
  public confirmSvg = mdiCheck

  public confirming = false
  public get confirmTooltip(): TooltipSettings {
    return {
      content: "Are you sure? You haven't selected all the episodes!",
      trigger: 'manual',
      show: this.confirming,
    }
  }

  // Remove duplicate episode numbers
  public get selectedEpisodeCount() {
    const numbers = pluck('episodeNumber', this.selectedEpisodes)
    return new Set(numbers).size
  }

  public get correctAmount() {
    return this.selectedEpisodeCount === this.episodeCount
  }

  public mounted() {
    this.fetchAnime()
  }

  public clearSelectedEpisodes() {
    this.unselectEpisodes(pluck('id', this.selectedEpisodes))
  }

  public goBack() {
    this.setSelectedId(null)
    this.clearSelectedEpisodes()
  }

  public async saveEpisodes() {
    if (!this.correctAmount && !this.confirming) {
      this.confirming = true

      setTimeout(() => {
        this.confirming = false
      }, 2500)

      return
    }

    this.confirming = false

    await cacheEpisodes(
      this,
      this.searchOptions.anilistId as number,
      Provider.CrunchyrollManual,
      this.selectedEpisodes,
    )

    this.toggleVisible()
    this.setSelectedId(null)
    this.clearSelectedEpisodes()
  }

  public selectEpisodes(episodes: EpisodeListEpisodes[]) {
    selectCrunchyrollEpisodes(this.$store, episodes)
  }

  public unselectEpisodes(episodes: string[]) {
    unselectCrunchyrollEpisodes(this.$store, episodes)
  }

  @Watch('id')
  public async fetchAnime() {
    this.loading = true

    this.anime = await Crunchyroll.fetchSeriesAndCollections(
      this.searchOptions.anilistId as number,
      this.id,
    )

    this.anime.collections = this.anime.collections.map(coll => ({
      ...coll,
      episodes: coll.episodes.map(ep => ({
        ...ep,
        provider: Provider.CrunchyrollManual,
      })),
    }))

    this.loading = false
  }
}
</script>

<style scoped lang="scss">
@import '../../../../colors';

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
    background: color($dark, 600);
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
    max-height: 350px;
    overflow: auto;
    display: flex;
    flex-direction: column;
  }

  & > .status {
    padding: 10px;
    background: color($dark, 300);
    border-top: 1px solid $dark;
    font-size: 1.5em;

    & > .selected {
      color: $success;
      font-weight: 500;
      margin-left: 5px;
      transition: color 0.25s;
    }

    &.error > .selected {
      color: $danger;
    }
  }
}
</style>
