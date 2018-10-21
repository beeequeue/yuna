<template>
<div class="title-bar">
  <span class="title">{{name}} | v{{version}}</span>

  <span
    v-html="flag"
    class="flag"
    v-tooltip.bottom="`Using ${country} Crunchyroll`"
  />

  <span class="separator"/>

  <icon :icon="minimizeSvg" @click.native="minimize"/>
  <icon :icon="closeSvg" @click.native="close"/>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import electron from 'electron'
import { mdiClose, mdiMinus } from '@mdi/js'

import { getCrunchyrollCountry } from '@/state/auth'
import Icon from './Icon.vue'
import { version } from '../../package.json'

const flagContext = require.context('svg-country-flags/svg')

@Component<TitleBar>({
  components: { Icon },
})
export default class TitleBar extends Vue {
  public browserWindow = electron.remote.BrowserWindow.getFocusedWindow() as Electron.BrowserWindow
  public version = version

  public minimizeSvg = mdiMinus
  public closeSvg = mdiClose

  public get name() {
    const shouldUseSillyName = Math.random() <= 0.1
    if (!shouldUseSillyName) return 'Crunch'

    return ['cromch', '(○^ω^)_旦 '][Math.round(Math.random())]
  }

  public minimize() {
    this.browserWindow.minimize()
  }

  public close() {
    this.browserWindow.close()
  }

  public get country() {
    return getCrunchyrollCountry(this.$store)
  }

  public get flag() {
    if (!this.country) return null

    let flagSvg: any = null

    try {
      flagSvg = flagContext(`./${this.country.toLowerCase()}.svg`)
    } catch (e) {
      return null
    }

    return flagSvg
  }
}
</script>

<style lang="scss">
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

  & > .flag {
    height: 100%;
    margin-left: 10px;
    -webkit-app-region: no-drag;

    & > svg {
      height: 12px;
    }
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
