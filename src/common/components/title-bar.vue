<template>
  <div class="title-bar">
    <button class="nav-button" @click="goBack">
      <icon class="back" :icon="backSvg" />
    </button>

    <button class="nav-button" @click="goForward">
      <icon class="forward" :icon="forwardSvg" />
    </button>

    <span class="title">{{ name }} | v{{ version }}</span>

    <span
      v-if="isConnectedTo.crunchyroll"
      v-html="flag"
      class="flag"
      v-tooltip.bottom="`Using ${country} Crunchyroll`"
    />

    <span class="separator" />

    <transition name="fade">
      <a v-if="!anilistOnline" class="alert" href="http://status.anilist.co/">
        It seems like AniList is down, most features will not work.
        <icon :icon="infoSvg" />
      </a>
    </transition>

    <span v-if="!isMac" class="menu-buttons">
      <icon class="button" :icon="minimizeSvg" @click.native="minimize" />
      <icon class="close" :icon="closeSvg" @click.native="close" />
    </span>
    <span v-else class="menu-buttons mac">
      <span class="close" @click="close" />
      <span class="minimize" @click="minimize" />
      <span class="maximize" />
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { activeWindow, is } from 'electron-util'
import gql from 'graphql-tag'
import { oc } from 'ts-optchain'
import {
  mdiChevronLeft,
  mdiChevronRight,
  mdiClose,
  mdiInformationOutline,
  mdiMinus,
} from '@mdi/js'

import { closeAllModals } from '@/state/app'
import { getCrunchyrollCountry, getIsConnectedTo } from '@/state/auth'
import { Query } from '@/decorators'

import Icon from './icon.vue'
import { version } from '../../../package.json'

const flagContext = require.context('svg-country-flags/svg')

@Component<TitleBar>({ components: { Icon } })
export default class TitleBar extends Vue {
  @Query({
    fetchPolicy: 'no-cache',
    query: gql`
      {
        Viewer {
          id
        }
      }
    `,
    variables: null,
    skip() {
      return !this.isConnectedTo.anilist
    },
    update(data) {
      return oc(data).Viewer.id() != null
    },
    error() {
      return false
    },
    errorPolicy: 'all',
    pollInterval: 60 * 1000,
  })
  public anilistOnline = true

  public version = version

  public backSvg = mdiChevronLeft
  public forwardSvg = mdiChevronRight
  public infoSvg = mdiInformationOutline
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
      flagSvg = flagContext(`./${this.country.toLowerCase()}.svg`).default
    } catch (e) {
      return null
    }

    return flagSvg
  }

  public get isConnectedTo() {
    return getIsConnectedTo(this.$store)
  }

  private restrictedViews = [/login/, /first-time-setup/]
  public get isOnRestrictedView(): boolean {
    return this.restrictedViews.some(
      view => view.exec(this.$route.path) != null,
    )
  }

  public get isMac() {
    return is.macos
  }

  public minimize() {
    activeWindow().minimize()
  }

  public close() {
    activeWindow().close()
  }

  public goBack() {
    if (this.isOnRestrictedView) return

    closeAllModals(this.$store)
    history.back()
  }

  public goForward() {
    if (this.isOnRestrictedView) return

    closeAllModals(this.$store)
    history.forward()
  }
}
</script>

<style lang="scss">
@import '../../colors';

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
    order: 1;
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
    order: 2;
    padding-left: 5px;
  }

  & > .flag {
    order: 3;
    height: 100%;
    margin-left: 10px;
    -webkit-app-region: no-drag;

    & > svg {
      height: 12px;
    }
  }

  & > .separator {
    order: 4;
    flex-shrink: 1;
    width: 100%;
  }

  & > .alert {
    order: 5;
    color: $danger;
    font-weight: 600;
    font-size: 0.85em;
    -webkit-app-region: no-drag;

    & > .icon {
      fill: $danger;
      padding: 6px;
    }
  }

  & .icon {
    fill: $white;
    height: 30px;
    padding: 2px;
    width: 35px;
    -webkit-app-region: no-drag;
    transition: background 75ms;

    &.button:hover {
      background: rgba(150, 150, 200, 0.1);
    }
  }

  & > .menu-buttons {
    order: 10;

    & > .close:hover {
      background: $danger;
    }

    &.mac {
      order: 0;
      display: flex;
      align-items: center;
      margin-left: 12px;

      & > span {
        border-radius: 100%;
        height: 12px;
        width: 12px;
        margin-right: 8px;
        -webkit-app-region: no-drag;

        &.close {
          background: #ff6058;
          border: 1px solid darken(#ff6058, 8%);
        }
        &.minimize {
          background: #ffbd30;
          border: 1px solid darken(#ffbd30, 8%);
        }
        &.maximize {
          background: gray;
          border: 1px solid darken(gray, 8%);
        }
      }
    }
  }
}
</style>
