<template>
  <div class="step login-discord" @keydown.enter="login">
    <span v-html="discordSvg" class="icon" />

    <checkbox
      setting="discord-rp"
      text="Enable Discord Rich Presence"
      :checked="discordRichPresence"
      :onChange="toggleRichPresence"
    />

    <img
      class="rich-presence-preview"
      :class="{ fade: !discordRichPresence }"
      :src="richPresenceWebp"
    />

    <c-button content="Next" :click="goToNextStep" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import CButton from '@/components/CButton.vue'
import Checkbox from '@/components/Checkbox.vue'

import discordSvg from '@/assets/discord.svg'
import richPresenceWebp from '@/assets/setup/discord.webp'
import { getSettings, setDiscordRichPresence } from '@/state/settings'

@Component({ components: { CButton, Checkbox } })
export default class Discord extends Vue {
  @Prop() public goToNextStep!: () => any

  public discordSvg = discordSvg
  public richPresenceWebp = richPresenceWebp

  public get discordRichPresence() {
    return getSettings(this.$store).discord.richPresence
  }

  public toggleRichPresence(checked: boolean) {
    setDiscordRichPresence(this.$store, checked)
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.login-discord {
  display: flex;
  flex-direction: column;
  align-items: center;

  & > .icon {
    height: 75px;
    width: 75px;
    margin: 15px 15px 0;
  }

  & > .checkbox-container {
    margin-top: 0px;
    margin-bottom: 10px;
  }

  & > .rich-presence-preview {
    margin-bottom: 25px;
    border-radius: 5px;
    box-shadow: $shadow;
    transition: filter 0.5s;

    &.fade {
      filter: opacity(0.25) grayscale(0.5);
    }
  }

  & > .button {
    width: 100%;
    padding: 10px;
  }
}

.full-width {
  margin: 0 0 10px !important;
}
</style>
