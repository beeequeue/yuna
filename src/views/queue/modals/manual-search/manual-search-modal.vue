<template>
  <modal-base name="manualSearch" :toggleVisible="toggleModal">
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
        :toggleVisible="toggleModal"
      />
    </animated-height>
  </modal-base>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import AnimatedHeight from '@/common/components/animated-height.vue'
import ModalBase from '@/common/modals/base.vue'
import CrunchyrollEditor from './crunchyroll-editor.vue'
import SearchStep from './search-step.vue'

import {
  getManualSearchOptions, getModalStates,
  getSelectedEpisodes,
  ModalName,
  toggleModal,
} from '@/state/app'

@Component({
  components: { CrunchyrollEditor, SearchStep, AnimatedHeight, ModalBase },
})
export default class ManualSearchModal extends Vue {
  public readonly modalName: ModalName = 'manualSearch'
  public selectedId: number | null = null

  public get modalVisible() {
    return getModalStates(this.$store).manualSearch
  }

  public get searchOptions() {
    return getManualSearchOptions(this.$store)
  }

  public get selectedEpisodes() {
    return getSelectedEpisodes(this.$store)
  }

  public setSelectedId(id: number | null) {
    this.selectedId = id
  }

  public toggleModal(force?: boolean) {
    if (
      this.modalVisible &&
      !force &&
      this.selectedEpisodes.length > 0 &&
      !confirm(
        'Are you sure you want to cancel your selections?\nYou have to click the green checkmark in the top right to confirm your selection!',
      )
    ) {
      return
    }

    if (this.modalVisible) {
      setTimeout(() => this.setSelectedId(null), 500)
    }

    toggleModal(this.$store, this.modalName)
  }
}
</script>

<style scoped lang="scss">
@import '../../../../colors';

.manual-search-modal {
  position: relative;
  min-width: 300px;
  max-width: 750px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: $dark;
  border-radius: 5px;
  box-shadow: $shadow;
}
</style>
