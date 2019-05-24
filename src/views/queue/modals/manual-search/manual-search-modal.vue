<template>
  <modal-base name="manualSearch">
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
        :toggleVisible="closeModal"
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
  getManualSearchOptions,
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

  public get searchOptions() {
    return getManualSearchOptions(this.$store)
  }

  public get selectedEpisodes() {
    return getSelectedEpisodes(this.$store)
  }

  public setSelectedId(id: number | null) {
    this.selectedId = id
  }

  public closeModal() {
    toggleModal(this.$store, this.modalName)

    setTimeout(() => this.setSelectedId(null), 500)
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
