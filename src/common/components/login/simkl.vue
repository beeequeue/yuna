<template>
  <div class="step login-cr" @keydown.enter="start">
    <span v-html="logo" class="logo" />

    <animated-height>
      <c-button v-if="!codeDetails" content="Connect" :click="start" />

      <div v-if="codeDetails" class="code-details">
        Copy this code into the Simkl page:
        <div class="code">{{ codeDetails.code }}</div>

        <div v-if="openCountdown > 0">
          The window will open in {{ openCountdown }}...
        </div>
        <div v-else>
          The code will time out in
          {{ secondsToTimeString(enterTimeout) }}.
        </div>
      </div>
    </animated-height>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { shell } from 'electron'
import { mdiArrowRight } from '@mdi/js'

import simklLogo from '@/assets/simkl.svg'
import CButton from '@/common/components/button.vue'
import TextInput from '@/common/components/form/text-input.vue'
import AnimatedHeight from '@/common/components/animated-height.vue'
import { Simkl } from '@/lib/simkl'
import { countdown, isNil, secondsToTimeString } from '@/utils'

@Component({ components: { AnimatedHeight, TextInput, CButton } })
export default class LoginSimkl extends Vue {
  @Prop(Function) public onFinished!: (() => any) | null
  public arrowSvg = mdiArrowRight
  public logo = simklLogo

  public openCountdown = 0
  public enterTimeout = 0
  public codeDetails: PromiseReturnType<
    typeof Simkl.getDeviceCode
  > | null = null

  public secondsToTimeString = secondsToTimeString

  public async start() {
    this.codeDetails = await Simkl.getDeviceCode()
    this.startEnterTimout()

    const { code, expires, url, interval } = this.codeDetails

    countdown(5, seconds => {
      if (seconds === 0) {
        shell.openExternal(url)
      }

      this.openCountdown = seconds
    })

    await Simkl.pollForToken({
      store: this.$store,
      code,
      timeout: expires,
      interval,
    })

    this.onFinished && this.onFinished()
  }

  public startEnterTimout() {
    countdown(this.codeDetails!.expires, seconds => {
      if (seconds === 0) {
        this.codeDetails = null
      }

      this.enterTimeout = seconds
    })
  }

  public openSimkl() {
    if (isNil(this.codeDetails)) return
  }
}
</script>

<style scoped lang="scss">
.login-cr {
  display: flex;
  flex-direction: column;
  align-items: center;

  & > .logo {
    margin: 15px;

    &,
    & /deep/ svg {
      height: 75px;
      width: 75px;
    }
  }

  & .code-details {
    & > .code {
      margin: 5px 0;
      font-size: 1.5em;
      font-weight: bold;
    }

    & > a {
      text-decoration: none;
    }
  }
}
</style>
