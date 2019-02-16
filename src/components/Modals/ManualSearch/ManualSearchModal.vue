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
      />
    </animated-height>
  </modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import AnimatedHeight from '@/components/AnimatedHeight.vue'
import Modal from '../Modal.vue'
import CrunchyrollEditor from './CrunchyrollEditor.vue'
import SearchStep from './SearchStep.vue'

import { Required } from '@/decorators'
import { getManualSearchOptions, getSelectedEpisodes } from '@/state/app'

@Component({
  components: { CrunchyrollEditor, SearchStep, AnimatedHeight, Modal },
})
export default class ManualSearchModal extends Vue {
  @Prop(Boolean) public visible!: boolean | null
  @Required(Function) public toggleVisible!: () => any

  public selectedId: number | null = null

  public get searchOptions() {
    return getManualSearchOptions(this.$store)
  }

  public get selectedEpisodes() {
    return getSelectedEpisodes(this.$store)
  }

  public setSelectedId(id: number | null) {
    this.selectedId = id
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
