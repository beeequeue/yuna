<template>
<modal :visible="visible" :toggleVisible="toggleVisible">
  <div class="modal-body about-modal">
    <h2>Crunch v{{version}}</h2>

    <div>Electron: {{electronVersion}}</div>
    <div>Chrome: {{chromeVersion}}</div>

    <a href="https://github.com/beeequeue/crunch">
      <div>Source on GitHub</div>
    </a>
  </div>
</modal>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { electronVersion, chromeVersion } from 'electron-util'

import { prop } from '@/utils'

import Modal from './Modal.vue'
import { version } from '../../../package.json'

@Component({ components: { Modal } })
export default class AboutModal extends Vue {
  @Prop(Boolean) public visible!: boolean | null
  @Prop(prop(Function, true))
  public toggleVisible!: () => any

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

  & > a:last-child {
    margin: 10px 0 25px;
    font-weight: 800;
    color: lighten($main, 20%);
    transition: color 0.15s;

    &:hover {
      color: lighten($main, 30%);
    }
  }
}
</style>
