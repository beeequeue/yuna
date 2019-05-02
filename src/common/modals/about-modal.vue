<template>
  <modal-base :name="modalName">
    <div class="modal-body about-modal">
      <h2>Yuna v{{ version }}</h2>

      <div>Electron: {{ electronVersion }}</div>
      <div>Chrome: {{ chromeVersion }}</div>

      <a href="https://subtlepatterns.com">
        <div>Subtle Patterns</div>
      </a>

      <a href="https://github.com/beeequeue/yuna">
        <div>Source on GitHub</div>
      </a>
    </div>
  </modal-base>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { chromeVersion, electronVersion } from 'electron-util'

import ModalBase from '@/common/modals/base.vue'
import { ModalName } from '@/state/app'
import { version } from '../../../package.json'

@Component({ components: { ModalBase } })
export default class AboutModal extends Vue {
  public readonly modalName: ModalName = 'about'

  public readonly version = version
  public readonly electronVersion = electronVersion
  public readonly chromeVersion = chromeVersion
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
    color: $highlight;
    transition: color 0.15s;

    &:last-child {
      margin: 10px 0 25px;
    }

    &:hover {
      color: color($highlight, 800);
    }
  }
}
</style>
