<template>
  <modal :visible="visible" :toggleVisible="toggleVisible">
    <div class="modal-body about-modal">
      <h2>Yuna v{{version}}</h2>

      <div>Electron: {{electronVersion}}</div>
      <div>Chrome: {{chromeVersion}}</div>

      <a href="https://subtlepatterns.com">
        <div>Subtle Patterns</div>
      </a>

      <a href="https://github.com/beeequeue/yuna">
        <div>Source on GitHub</div>
      </a>
    </div>
  </modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { chromeVersion, electronVersion } from 'electron-util'

import { Required } from '@/decorators'
import Modal from './Modal.vue'
import { version } from '../../../package.json'

@Component({ components: { Modal } })
export default class AboutModal extends Vue {
  @Prop(Boolean) public visible!: boolean | null
  @Required(Function) public toggleVisible!: () => any

  public version = version
  public electronVersion = electronVersion
  public chromeVersion = chromeVersion
}
</script>


<style scoped lang="scss">
@import '../../colors';

.about-modal {
  position: relative;
  min-height: 100px;
  padding: 0 35px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: $dark;
  border-radius: 5px;
  box-shadow: $shadow;
  z-index: 1;

  & > a {
    margin: 5px 0;
    font-weight: 800;
    color: lighten($main, 20%);
    transition: color 0.15s;

    &:last-child {
      margin: 10px 0 25px;
    }

    &:hover {
      color: lighten($main, 30%);
    }
  }
}
</style>
