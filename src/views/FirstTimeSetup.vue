<template>
<div class="first-time-setup">
  <div class="content">
    <steps :steps="steps" :current="currentStep"/>

    <transition-group tag="div" class="steps" :class="{ hide: hasFinishedSetup }">
      <login-al
        key="al"
        v-if="currentStep === 0"
        :loginAnilist="loginAnilist"
      />

      <login-cr
        key="cr"
        v-if="currentStep === 1"
        :loginCrunchyroll="loginCrunchyroll"
      />

      <spoiler-settings
        key="s-s"
        v-if="currentStep === 2"
        :goToNextStep="finishSetup"
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

import { getIsLoggedIn, loginCrunchyroll } from '@/state/auth'
import { loginAnilist } from '@/lib/anilist'
import { getHasFinishedSetup, setHasFinishedSetup } from '@/state/app'

export const steps = ['LOGIN_AL', 'LOGIN_CR', 'SPOILER_SETTINGS']

@Component({
  components: { LoginAl, LoginCr, Steps, SpoilerSettings },
})
export default class FirstTimeSetup extends Vue {
  public currentStep: number = 0
  public steps = steps

  public get hasFinishedSetup() {
    return getHasFinishedSetup(this.$store)
  }

  public get isLoggedIn() {
    return getIsLoggedIn(this.$store)
  }

  public created() {
    this.updateCurrentStep()
  }

  public updateCurrentStep() {
    if (this.hasFinishedSetup) {
      return (this.currentStep = 10)
    }

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

  public finishSetup() {
    this.currentStep++
    setHasFinishedSetup(this.$store, true)
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
      transition: width 0.75s;

      &.hide {
        width: 0;
      }

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

          &.spoiler-settings {
            transform: translate(50px, -50%);
          }
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
