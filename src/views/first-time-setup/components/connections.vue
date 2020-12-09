<template>
  <div v-if="currentWindow === Window.Main" class="step connections">
    <div class="connection-container">
      <div class="connection">
        <span class="logo" v-html="crIcon" />

        <c-button
          v-if="!connectedTo.crunchyroll"
          content="Connect"
          :click="() => setCurrentWindow(Window.Crunchyroll)"
        />
        <c-button
          v-else
          type="danger"
          content="Disconnect"
          :click="logoutCrunchyroll"
        />
      </div>

      <div class="connection">
        <span class="logo" v-html="hidiveIcon" />

        <c-button
          v-if="!connectedTo.hidive"
          content="Connect"
          :click="() => setCurrentWindow(Window.Hidive)"
        />
        <c-button
          v-else
          type="danger"
          content="Disconnect"
          :click="logoutHidive"
        />
      </div>
    </div>

    <c-button
      :disabled="!isFinishedConnecting"
      :content="isFinishedConnecting ? 'Next' : 'Connect at least one service!'"
      :click="finishStep"
    />
  </div>

  <login-cr
    v-else-if="currentWindow === Window.Crunchyroll"
    :login-crunchyroll="loginCrunchyroll"
    :on-finished="goToMainWindow"
  />

  <login-hd
    v-else-if="currentWindow === Window.Hidive"
    :login-hidive="loginHidive"
    :on-finished="goToMainWindow"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"

import crIcon from "@/assets/crunchyroll.svg"
import hidiveIcon from "@/assets/hidive.svg"
import LoginCr from "@/common/components/login/crunchyroll.vue"
import LoginHd from "@/common/components/login/hidive.vue"
import TextInput from "@/common/components/form/text-input.vue"
import CButton from "@/common/components/button.vue"

import { getFinishedConnecting, getIsConnectedTo } from "@/state/auth"
import { Crunchyroll } from "@/lib/crunchyroll"
import { Hidive } from "@/lib/hidive"

enum Window {
  Main = "MAIN",
  Crunchyroll = "CRUNCHYROLL",
  Hidive = "HIDIVE",
}

@Component({ components: { LoginHd, LoginCr, CButton, TextInput } })
export default class Connections extends Vue {
  @Prop(Function) public finishStep!: () => void

  public currentWindow = Window.Main

  public Window = Window
  public crIcon = crIcon
  public hidiveIcon = hidiveIcon

  public get connectedTo() {
    return getIsConnectedTo(this.$store)
  }

  public get isFinishedConnecting() {
    return getFinishedConnecting(this.$store)
  }

  public goToMainWindow() {
    this.currentWindow = Window.Main
  }

  public setCurrentWindow(win: Window) {
    this.currentWindow = win
  }

  public async loginCrunchyroll(user: string, pass: string) {
    await Crunchyroll.login(this.$store, user, pass)
  }

  public async logoutCrunchyroll() {
    await Crunchyroll.logOut(this.$store)
  }

  public async loginHidive(user: string, pass: string) {
    await Hidive.connect(this.$store, user, pass)
  }

  public async logoutHidive() {
    await Hidive.disconnect(this.$store)
  }
}
</script>

<style scoped lang="scss">
@import "../../../colors";

.connections {
  display: flex;
  flex-direction: column;
  align-items: center;

  & > .connection-container {
    width: 100%;
    display: flex;

    & > .connection {
      flex: 1;
      padding: 20px 0;
      min-width: 200px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      & > .logo {
        height: 75px;
        width: 75px;
        margin-bottom: 10px;
      }
    }
  }

  & > .button {
    width: 100%;
    padding: 10px;
  }
}
</style>
