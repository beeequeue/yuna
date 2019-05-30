<template>
  <div class="first-time-setup">
    <div class="content">
      <steps :steps="steps" :current="currentStep" />

      <transition-group
        tag="div"
        class="steps"
        :class="{ hide: currentStep == null }"
      >
        <login-al
          key="al"
          v-if="currentStep === SetupStep.LOGIN_AL"
          :loginAnilist="loginAnilist"
        />

        <connections
          key="connections"
          v-if="currentStep === SetupStep.CONNECT"
          :continue="finishStep"
        />

        <spoiler-settings
          key="s-s"
          v-if="currentStep === SetupStep.SPOILERS"
          :goToNextStep="finishStep"
        />

        <discord
          key="discord"
          v-if="currentStep === SetupStep.DISCORD"
          :goToNextStep="finishStep"
        />

        <local-files-setup
          key="local-files-setup"
          v-if="currentStep === SetupStep.LOCAL_FILES"
          :goToNextStep="finishStep"
        />
      </transition-group>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import LoginAl from '@/common/components/login/anilist.vue'
import Connections from './components/connections.vue'
import Steps from './components/steps.vue'
import SpoilerSettings from './components/spoiler-settings.vue'
import Discord from './components/discord.vue'
import LocalFilesSetup from './components/local-files-setup.vue'

import { Anilist } from '@/lib/anilist'
import {
  _setupSteps,
  addFinishedStep,
  getNextUnfinishedStep,
  removeFinishedStep,
  SetupStep,
} from '@/state/settings'
import { getIsConnectedTo } from '@/state/auth'

@Component({
  components: {
    LocalFilesSetup,
    Connections,
    LoginAl,
    Steps,
    SpoilerSettings,
    Discord,
  },
})
export default class FirstTimeSetup extends Vue {
  public currentStep: SetupStep | null = SetupStep.LOGIN_AL
  public steps = _setupSteps
  public SetupStep = SetupStep

  public get nextUnfinishedStep() {
    return getNextUnfinishedStep(this.$store)
  }

  public created() {
    this.confirmStepsCompleted()

    this.currentStep = getNextUnfinishedStep(this.$store)
  }

  public finishStep() {
    if (this.currentStep == null) return

    addFinishedStep(this.$store, this.currentStep)
    this.currentStep = getNextUnfinishedStep(this.$store)
  }

  public async loginAnilist() {
    await Anilist.login()

    this.finishStep()
  }

  private confirmStepsCompleted() {
    const isConnectedTo = getIsConnectedTo(this.$store)

    if (!isConnectedTo.anilist) {
      removeFinishedStep(this.$store, SetupStep.LOGIN_AL)
    }

    if (!isConnectedTo.crunchyroll && !isConnectedTo.hidive) {
      removeFinishedStep(this.$store, SetupStep.CONNECT)
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

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
      width: 400px;
      transition: width 0.75s;

      &.hide {
        width: 0;
      }

      & > .step {
        position: absolute;
        top: 50%;
        left: 0;
        width: 400px;
        background: linear-gradient(color($dark, 350), $dark);
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

          &:last-child {
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
