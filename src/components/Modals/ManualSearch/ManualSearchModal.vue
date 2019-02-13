<template>
  <modal :visible="visible" :toggleVisible="toggleVisible">
    <animated-height class="manual-search-modal">
      <search-step
        v-if="selectedId == null"
        :searchOptions="searchOptions"
        :setSelectedId="setSelectedId"
      />
      <crunchyroll-editor
        v-else
        :searchOptions="searchOptions"
        :id="selectedId"
        :selectedEpisodes="selectedEpisodes"
        :setSelectedId="setSelectedId"
        :selectEpisodes="selectEpisodes"
        :unselectEpisodes="unselectEpisodes"
      />
    </animated-height>
  </modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { equals, filter, includes, map, pipe, pluck } from 'rambdax'

import AnimatedHeight from '@/components/AnimatedHeight.vue'
import Modal from '../Modal.vue'
import CrunchyrollEditor from './CrunchyrollEditor.vue'
import SearchStep from './SearchStep.vue'

import { Required } from '@/decorators'
import { getManualSearchOptions } from '@/state/app'
import { SelectedEpisode } from '@/types'

const doesNotInclude = <T>(array: T[]) => (item: T) => !includes(item, array)

@Component({
  components: { CrunchyrollEditor, SearchStep, AnimatedHeight, Modal },
})
export default class ManualSearchModal extends Vue {
  @Prop(Boolean) public visible!: boolean | null
  @Required(Function) public toggleVisible!: () => any

  public selectedId: number | null = null
  public selectedEpisodes: SelectedEpisode[] = []

  public get searchOptions() {
    return getManualSearchOptions(this.$store)
  }

  public setSelectedId(id: number | null) {
    this.selectedId = id
  }

  public selectEpisodes(...ids: number[]) {
    const count = this.selectedEpisodes.length
    const selectedIds = pluck<number>('id', this.selectedEpisodes)

    const getEpisodes = pipe<number[], number[], SelectedEpisode[]>(
      filter(doesNotInclude(selectedIds)),
      map<number, SelectedEpisode>((id, prop) => ({
        id,
        epNumber: count + Number(prop),
      })) as any,
    )

    this.selectedEpisodes.push(...getEpisodes(ids))
  }

  public unselectEpisodes(...ids: number[]) {
    const getFilteredEpisodes = filter<SelectedEpisode>(
      ep => ids.findIndex(equals(ep.id)) === -1,
    )

    let lastEpNumber = 0
    const updateEpisodeNumbers = map<SelectedEpisode, SelectedEpisode>(
      ({ id, epNumber }) => {
        // TODO: implement fix for multiple episodes with same number
        let realNum = lastEpNumber + 1
        lastEpNumber = realNum

        return { id, epNumber: realNum }
      },
    )

    this.selectedEpisodes = pipe<
      SelectedEpisode[],
      SelectedEpisode[],
      SelectedEpisode[]
    >(
      getFilteredEpisodes,
      updateEpisodeNumbers,
    )(this.selectedEpisodes)

    console.log(pluck('epNumber', this.selectedEpisodes))
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.manual-search-modal {
  position: relative;
  min-width: 250px;
  max-width: 750px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: $dark;
  border-radius: 5px;
  box-shadow: $shadow;
}
</style>
