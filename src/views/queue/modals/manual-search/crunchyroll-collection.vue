<template>
  <div class="collection">
    <div class="header" @click="toggleItemOpen">
      <icon class="collapser" :class="{ flip: !open }" :icon="expandSvg" />

      <span class="title">{{ collection.name }}</span>

      <span class="count">
        {{ humanizedSelectedNumbers }}
      </span>

      <checkbox
        :setting="`checked-${collection.collection_id}`"
        :checked="isFullySelected"
        :onChange="handleCheckChange"
      />
    </div>

    <div v-if="open" class="episodes">
      <crunchyroll-episode
        v-for="episode in collection.episodes"
        :key="episode.key"
        :episode="episode"
        :selectedEpisode="getSelectedEpisode(episode.id)"
        :selectEpisodes="selectEpisodes"
        :unselectEpisodes="unselectEpisodes"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mdiChevronDown } from '@mdi/js'

import { EpisodeListEpisodes } from '@/graphql/types'
import Icon from '@/common/components/icon.vue'
import Checkbox from '@/common/components/form/checkbox.vue'
import AnimatedHeight from '@/common/components/animated-height.vue'
import CrunchyrollEpisode from './crunchyroll-episode.vue'

import { Required } from '@/decorators'
import { _CollectionWithEpisodes } from '@/lib/crunchyroll'
import { humanizeNumberList, isNotNil, pluck, prop, propEq } from '@/utils'

const pluckId = (obj: Array<{ id: string }>) => pluck('id', obj)

@Component({
  components: { AnimatedHeight, CrunchyrollEpisode, Checkbox, Icon },
})
export default class CrunchyrollCollection extends Vue {
  @Required(Object) collection!: _CollectionWithEpisodes
  @Required(Array) public selectedEpisodes!: EpisodeListEpisodes[]
  @Required(Function) selectEpisodes!: (ids: EpisodeListEpisodes[]) => void
  @Required(Function) unselectEpisodes!: (ids: string[]) => void

  public open = false

  public expandSvg = mdiChevronDown

  public get ownedSelectedEpisodes() {
    const selectedIds = pluckId(this.selectedEpisodes)
    const ownedIds = pluckId(this.collection.episodes)

    return selectedIds.filter(id => ownedIds.includes(id))
  }

  public get isFullySelected() {
    return this.ownedSelectedEpisodes.length === this.collection.episodes.length
  }

  public get humanizedSelectedNumbers() {
    if (this.ownedSelectedEpisodes.length < 1) return null

    const selectedNumbers = this.ownedSelectedEpisodes
      .map(id => this.selectedEpisodes.find(propEq('id', id)))
      .filter(isNotNil)
      .map(prop('episodeNumber'))

    return humanizeNumberList(selectedNumbers)
  }

  public toggleItemOpen() {
    this.open = !this.open
  }

  public handleCheckChange(checked: boolean) {
    if (checked) {
      this.selectEpisodes(this.collection.episodes)
    } else {
      this.unselectEpisodes(pluckId(this.collection.episodes))
    }
  }

  public getSelectedEpisode(id: string) {
    return this.selectedEpisodes.find(propEq('id', id))
  }
}
</script>

<style scoped lang="scss">
@import '../../../../colors';

.collection {
  position: relative;
  width: 100%;

  &:nth-child(even) {
    background: color($dark, 500);
  }

  & > .header {
    position: relative;
    width: 100%;
    padding: 2px 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    & > .collapser {
      height: 32px;
      width: 35px;
      fill: $white;
      padding: 0 5px;

      & /deep/ svg {
        transition: transform 0.5s;
      }

      &.flip /deep/ svg {
        transform: rotateZ(-180deg);
      }
    }

    & > .title {
      text-align: left;
    }

    & > .count {
      flex-shrink: 0;
      padding-left: 10px;
      margin: 0 10px 0 auto;
    }
  }

  & > .episodes {
  }
}
</style>
