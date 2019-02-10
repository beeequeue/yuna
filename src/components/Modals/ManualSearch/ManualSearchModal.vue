<template>
  <modal :visible="visible" :toggleVisible="toggleVisible">
    <animated-height class="manual-search-modal">
      <search-step class="manual-search-modal" />
    </animated-height>
  </modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import AnimatedHeight from '@/components/AnimatedHeight.vue'
import Modal from '../Modal.vue'

import { Required } from '@/decorators'
import SearchStep from '@/components/Modals/ManualSearch/SearchStep.vue'

@Component({ components: { SearchStep, AnimatedHeight, Modal } })
export default class ManualSearchModal extends Vue {
  @Prop(Boolean) public visible!: boolean | null
  @Required(Function) public toggleVisible!: () => any
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
