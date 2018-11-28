<template>
<div class="first-time-setup">
  <div class="content">
    <steps :steps="steps" :current="currentStep"/>

    <transition-group tag="div" class="steps">
      <login-al
        key="al"
        v-if="currentStep === Step.LOGIN_AL"
        :loginAnilist="loginAnilist"
      />

      <login-cr
        key="cr"
        v-if="currentStep === Step.LOGIN_CR"
        :loginCrunchyroll="loginCrunchyroll"
      />

      <spoiler-settings
        key="s-s"
        v-if="currentStep === Step.SPOILER_SETTINGS"
        :goToNextStep="goToNextStep"
      />
    </transition-group>
  </div>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Steps from '@/components/FirstTimeSetup/Steps.vue'
import LoginAl from '@/components/FirstTimeSetup/LoginAL.vue'
import LoginCr from '@/components/FirstTimeSetup/LoginCR.vue'
import SpoilerSettings from '@/components/FirstTimeSetup/SpoilerSettings.vue'

import { enumToArray, setFinishedSetup } from '@/utils'
import { getIsLoggedIn, loginCrunchyroll } from '@/state/auth'
import { loginAnilist } from '@/lib/anilist'

export enum Step {
  LOGIN_AL,
  LOGIN_CR,
  SPOILER_SETTINGS,
  QUEUE_TUTORIAL,
}

@Component({ components: { LoginAl, LoginCr, Steps, SpoilerSettings } })
export default class FirstTimeSetup extends Vue {
  public currentStep: Step = 0
  public steps = enumToArray(Step)

  public Step = Step

  public get isLoggedIn() {
    return getIsLoggedIn(this.$store)
  }

  public created() {
    this.updateCurrentStep()
  }

  public updateCurrentStep() {
    if (this.isLoggedIn.all) {
      return (this.currentStep = 2)
    }

    if (this.isLoggedIn.anilist) {
      return (this.currentStep = 1)
    }
  }

  public async loginAnilist() {
    await loginAnilist(this.$store)

    this.updateCurrentStep()
  }

  public async loginCrunchyroll(user: string, pass: string) {
    await loginCrunchyroll(this.$store, { user, pass })

    this.updateCurrentStep()
  }

  public goToNextStep() {
    this.currentStep++
  }

  public finishSetup() {
    setFinishedSetup(true)
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.first-time-setup {
  position: absolute;
  top: 30px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.75);

  & > .content {
    display: flex;
    justify-content: center;
    align-items: stretch;

    & > .steps {
      position: relative;
      width: 300px;

      & > .step {
        position: absolute;
        top: 50%;
        left: 0;
        width: 300px;
        background: $dark;
        border-radius: 5px;
        transform: translateY(-50%);
        box-shadow: $shadow;

        &.v-enter-active,
        &.v-leave-active {
          transition: transform 0.5s, opacity 0.5s;
        }

        &.v-enter {
          opacity: 0;
          transform: translateY(calc(-50% + 150px));
        }

        &.v-leave-to {
          opacity: 0;
          transform: translateY(calc(-50% - 150px));
        }
      }
    }
  }
}

.route-enter-active,
.route-leave-active {
  transition: background 0.5s;

  & > .menu {
    transition: transform 0.5s;
  }

  & > .list-container {
    transition: opacity 0.5s, transform 0.5s;
  }
}

.route-enter,
.route-leave-to {
  background: none;

  & > .menu {
    transform: translateY(-100%);
  }

  & > .list-container {
    opacity: 0;
    transform: translateY(2%);
  }
}
</style>
