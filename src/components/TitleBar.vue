<template>
<div class="title-bar">
  <span class="title">Crunch v{{version}}</span>

  <span class="separator"/>

  <icon :icon="minimizeSvg" @click.native="minimize"/>
  <icon :icon="closeSvg" @click.native="close"/>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import electron from 'electron'
import { mdiClose, mdiMinus } from '@mdi/js'

import Icon from './Icon.vue'
import { version } from '../../package.json'

@Component({
  components: { Icon },
})
export default class TitleBar extends Vue {
  @Prop(String) public icon!: string

  public browserWindow = electron.remote.BrowserWindow.getFocusedWindow()

  public version = version

  public minimizeSvg = mdiMinus
  public closeSvg = mdiClose

  public minimize() {
    this.browserWindow.minimize()
  }

  public close() {
    this.browserWindow.close()
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.title-bar {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 30px;
  padding-left: 10px;
  flex-shrink: 0;
  background: rgb(21, 21, 26);
  user-select: none;
  cursor: default !important;
  -webkit-app-region: drag;
  z-index: 100;

  & > * {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  & > .separator {
    flex-shrink: 1;
    width: 100%;
  }

  & .icon {
    fill: $white;
    height: 30px;
    padding: 2px;
    width: 35px;
    -webkit-app-region: no-drag;

    &:hover {
      background: rgba(150, 150, 200, 0.1);
    }
  }
}
</style>
