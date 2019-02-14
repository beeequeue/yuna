<template>
  <div class="collection">
    <div class="header" @click="toggleItemOpen">
      <icon class="collapser" :class="{ flip: !open }" :icon="expandSvg" />

      <span class="title">{{ collection.name }}</span>

      <span class="count">
        {{ ownedSelectedEpisodes.length }}
        {{ ' / ' }}
        {{ collection.episodes.length }}
      </span>

      <checkbox
        :setting="`checked-${collection.collection_id}`"
        :checked="isFullySelected"
        :onChange="handleCheckChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { includes, prop, pluck } from 'rambdax'
import { mdiChevronDown } from '@mdi/js'

import Icon from '@/components/Icon.vue'
import CButton from '@/components/CButton.vue'
import Checkbox from '@/components/Checkbox.vue'

import { Required } from '@/decorators'
import { _CollectionWithEpisodes } from '@/lib/crunchyroll'
import { SelectedEpisode } from '@/types'

@Component({ components: { Checkbox, CButton, Icon } })
export default class CrunchyrollCollection extends Vue {
  @Required(Object) collection!: _CollectionWithEpisodes
  @Required(Array) public selectedEpisodes!: SelectedEpisode[]
  @Required(Function) selectEpisodes!: (...ids: number[]) => void
  @Required(Function) unselectEpisodes!: (...ids: number[]) => void

  public open = false

  public expandSvg = mdiChevronDown

  public get ownedSelectedEpisodes() {
    const selectedIds = pluck<number>('id', this.selectedEpisodes)
    const ownedIds = pluck<number>('id', this.collection.episodes)

    return selectedIds.filter(id => includes(id, ownedIds))
  }

  public get isFullySelected() {
    return this.ownedSelectedEpisodes.length === this.collection.episodes.length
  }

  public toggleItemOpen() {
    this.open = !this.open
  }

  public handleCheckChange(checked: boolean) {
    if (checked) {
      this.selectEpisodes(...this.collection.episodes.map(prop('id')))
    } else {
      this.unselectEpisodes(...this.collection.episodes.map(prop('id')))
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

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
}
</style>
