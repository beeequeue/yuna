<template>
  <div class="title-bar">
    <button class="nav-button" @click="goBack">
      <icon class="back" :icon="backSvg"/>
    </button>

    <button class="nav-button" @click="goForward">
      <icon class="forward" :icon="forwardSvg"/>
    </button>

    <span class="title">{{name}} | v{{version}}</span>

    <span v-html="flag" class="flag" v-tooltip.bottom="`Using ${country} Crunchyroll`"/>

    <span class="separator"/>

    <icon :icon="minimizeSvg" @click.native="minimize"/>
    <icon :icon="closeSvg" @click.native="close"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { activeWindow } from 'electron-util'
import { mdiClose, mdiMinus, mdiChevronLeft, mdiChevronRight } from '@mdi/js'

import { closeAllModals } from '@/state/app'
import { getCrunchyrollCountry, getIsConnectedTo } from '@/state/auth'

import Icon from './Icon.vue'
import { version } from '../../package.json'

const flagContext = require.context('svg-country-flags/svg')

@Component<TitleBar>({
  components: { Icon },
})
export default class TitleBar extends Vue {
  public version = version

  public backSvg = mdiChevronLeft
  public forwardSvg = mdiChevronRight
  public minimizeSvg = mdiMinus
  public closeSvg = mdiClose

  public get name() {
    const shouldUseSillyName = Math.random() <= 0.1
    if (!shouldUseSillyName) return 'Yuna'

    return ['Yummy', '(○^ω^)_旦 '][Math.round(Math.random())]
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

  public get isConnectedTo() {
    return getIsConnectedTo(this.$store).all
  }

  public minimize() {
    activeWindow().minimize()
  }

  public close() {
    activeWindow().close()
  }

  public goBack() {
    if (!this.isConnectedTo) return

    closeAllModals(this.$store)
    history.back()
  }

  public goForward() {
    if (!this.isConnectedTo) return

    closeAllModals(this.$store)
    history.forward()
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

  & > .nav-button {
    background: transparent;
    border: 0;
    padding: 0;
    cursor: pointer;

    transition: background 0.15s;

    &:hover {
      background: rgba(150, 150, 150, 0.05);
    }

    &:active {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  & > .title {
    padding-left: 5px;
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
