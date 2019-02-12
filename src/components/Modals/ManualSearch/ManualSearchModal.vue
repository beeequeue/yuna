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
        :setSelectedId="setSelectedId"
      />
    </animated-height>
  </modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import AnimatedHeight from '@/components/AnimatedHeight.vue'
import Modal from '../Modal.vue'

import { Required } from '@/decorators'
import SearchStep from '@/components/Modals/ManualSearch/SearchStep.vue'
import { getManualSearchOptions } from '@/state/app'
import CrunchyrollEditor from '@/components/Modals/ManualSearch/CrunchyrollEditor.vue'

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

  public setSelectedId(id: number | null) {
    this.selectedId = id
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.manual-search-modal {
  position: relative;
  width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: $dark;
  border-radius: 5px;
  box-shadow: $shadow;
}
</style>
