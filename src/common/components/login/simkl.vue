<template>
  <div class="step login-simkl" @keydown.enter="start">
    <c-button
      v-if="cancel"
      flat
      type="white"
      :icon="arrowSvg"
      :click="cancel"
      class="back-button"
    />

    <a v-tooltip.top="'Simkl'" href="https://simkl.com" class="logo">
      <span v-html="logo" />
    </a>

    <animated-size style="width: 100%">
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
    </animated-size>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { shell } from 'electron'
import { mdiArrowLeft } from '@mdi/js'

import simklLogo from '@/assets/simkl.svg'
import CButton from '@/common/components/button.vue'
import AnimatedSize from '@/common/components/animated-size.vue'
import { Simkl } from '@/lib/simkl'
import { countdown, isNil, secondsToTimeString } from '@/utils'

@Component({ components: { AnimatedSize, CButton } })
export default class LoginSimkl extends Vue {
  @Prop(Function) public onFinished!: (() => any) | null
  @Prop(Function) public cancel!: (() => any) | null

  public logo = simklLogo
  public arrowSvg = mdiArrowLeft

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
.login-simkl {
  display: flex;
  flex-direction: column;
  align-items: center;

  & > .back-button {
    position: absolute;
    top: 5px;
    left: 5px;
  }

  & .button:last-child {
    width: 100%;
    padding: 10px;
  }

  & > .logo {
    margin: 15px;

    &,
    & /deep/ svg {
      height: 75px;
      width: 75px;
    }
  }

  & .code-details {
    padding-bottom: 15px;

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
