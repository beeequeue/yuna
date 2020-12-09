<template>
  <div
    v-if="currentWindow === Window.Main"
    :key="Window.Main"
    class="step list-plugins"
  >
    <div class="list-manager-container">
      <div
        class="list-manager"
        :class="{ connected: connected.anilist }"
        @click="setCurrentWindow(Window.Anilist)"
      >
        <span class="logo" v-html="alLogo" />
      </div>

      <div
        class="list-manager"
        :class="{ connected: connected.simkl }"
        @click="setCurrentWindow(Window.Simkl)"
      >
        <span class="logo" v-html="simklLogo" />
      </div>
    </div>

    <c-button
      :content="canContinue ? 'Next' : 'Connect at least one manager!'"
      :disabled="!canContinue"
      :click="finishStep"
    />
  </div>

  <login-a-l
    v-else-if="currentWindow === Window.Anilist"
    :key="Window.Anilist"
    :on-finished="showMainWindow"
    :cancel="showMainWindow"
  />

  <login-simkl
    v-else-if="currentWindow === Window.Simkl"
    :key="Window.Simkl"
    :on-finished="showMainWindow"
    :cancel="showMainWindow"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"

import anilistSvg from "@/assets/anilist.svg"
import simklSvg from "@/assets/simkl.svg"
import CButton from "@/common/components/button.vue"
import LoginAL from "@/common/components/login/anilist.vue"
import LoginSimkl from "@/common/components/login/simkl.vue"
import { getIsConnectedTo } from "@/state/auth"

enum Window {
  Main = "MAIN",
  Anilist = "ANILIST",
  Simkl = "SIMKL",
}

@Component({ components: { CButton, LoginAL, LoginSimkl } })
export default class ListPlugins extends Vue {
  @Prop() public finishStep!: () => any

  public get connected() {
    return getIsConnectedTo(this.$store)
  }

  public get canContinue() {
    return this.connected.anilist || this.connected.simkl
  }

  public currentWindow = Window.Main
  public Window = Window
  public alLogo = anilistSvg
  public simklLogo = simklSvg

  public setCurrentWindow(window: Window) {
    this.currentWindow = window
  }

  public showMainWindow() {
    this.currentWindow = Window.Main
  }
}
</script>

<style scoped lang="scss">
@import "../../../colors";

.list-plugins {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  & > .button:last-child {
    width: 100%;
    padding: 10px;
  }

  & > .list-manager-container {
    display: flex;
    width: 100%;

    & > .list-manager {
      padding: 20px 0;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: background 0.15s;

      &.connected {
        background: color($main, 300);
        pointer-events: none;

        & > .logo {
          filter: drop-shadow(0 0 8px transparentize(white, 0.5));
        }
      }

      &:hover {
        background: color($dark, 450);
      }

      & > .logo {
        filter: grayscale(0.75) brightness(0.5);

        &,
        & ::v-deep svg {
          height: 75px;
          width: 75px;
        }
      }
    }
  }
}
</style>
