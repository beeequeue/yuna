<template>
  <portal to="modal">
    <div v-if="visible" :key="name" class="modal">
      <div class="cover" @click="toggleVisible" />

      <slot />
    </div>
  </portal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { Required } from '@/decorators'
import { RootState } from '@/state/store'
import { getModalStates, toggleModal } from '@/state/app'

@Component
export default class ModalBase extends Vue {
  @Required(String) public name!: keyof RootState['app']['modals']

  public get visible(): boolean {
    return getModalStates(this.$store)[this.name!]
  }

  public toggleVisible() {
    toggleModal(this.$store, this.name!)
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.modal {
  position: absolute;
  top: 30px;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;

  & > .cover {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.65);
  }

  &.v-enter-active,
  &.v-leave-active {
    transition: opacity 0.25s;

    & /deep/ .modal-body {
      transition: transform 0.25s;
    }
  }

  &.v-enter {
    opacity: 0;

    & /deep/ .modal-body {
      transform: translateY(10%);
    }
  }

  &.v-leave-to {
    opacity: 0;

    & /deep/ .modal-body {
      transform: translateY(-10%);
    }
  }
}
</style>
