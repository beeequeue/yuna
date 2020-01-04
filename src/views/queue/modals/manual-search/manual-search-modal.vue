<template>
  <modal-base name="manualSearch" :toggle-visible="toggleModal">
    <animated-size class="manual-search-modal">
      <search-step
        v-if="selectedId == null"
        :search-options="searchOptions"
        :set-selected-id="setSelectedId"
      />
      <crunchyroll-editor
        v-else
        :id="selectedId"
        :search-options="searchOptions"
        :selected-episodes="selectedEpisodes"
        :set-selected-id="setSelectedId"
        :toggle-visible="toggleModal"
      />
    </animated-size>
  </modal-base>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import AnimatedSize from '@/common/components/animated-size.vue'
import ModalBase from '@/common/modals/base.vue'
import CrunchyrollEditor from './crunchyroll-editor.vue'
import SearchStep from './search-step.vue'

import {
  getManualSearchOptions,
  getModalStates,
  getSelectedEpisodes,
  ModalName,
  toggleModal,
} from '@/state/app'

@Component({
  components: { CrunchyrollEditor, SearchStep, AnimatedSize, ModalBase },
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
