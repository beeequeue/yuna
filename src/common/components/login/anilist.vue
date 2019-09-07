<template>
  <div class="step login-cr" @keydown.enter="login">
    <a href="https://anilist.co" class="logo" v-tooltip.top="'AniList'">
      <span v-html="alLogo" />
    </a>

    <c-button content="Connect" :click="login" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import anilistLogoSvg from '@/assets/anilist.svg'
import CButton from '@/common/components/button.vue'
import { Anilist } from '@/lib/anilist'

@Component({ components: { CButton } })
export default class LoginAl extends Vue {
  @Prop(Function) public onFinished!: (() => any) | null

  public alLogo = anilistLogoSvg

  public async login() {
    await Anilist.login()

    this.onFinished && this.onFinished()
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

  & > .text-input {
    margin: 0 25px 8px;

    & /deep/ input {
      text-align: center;
    }
  }

  & > .button {
    width: 100%;
    padding: 10px;
  }
}
</style>
