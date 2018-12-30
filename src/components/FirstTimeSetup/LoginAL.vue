<template>
  <div class="step login-cr" @keydown.enter="login">
    <span v-html="alLogo" class="logo"/>

    <c-button content="Login" :click="login"/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import anilistLogoSvg from '@/assets/anilist.svg'
import { prop } from '@/utils'

import CButton from '@/components/CButton.vue'

@Component({ components: { CButton } })
export default class LoginAl extends Vue {
  @Prop(prop(Function, true))
  public loginAnilist!: () => any

  public alLogo = anilistLogoSvg

  public handleChange(key: keyof this, value: any) {
    this[key] = value
  }

  public login() {
    this.loginAnilist()
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
