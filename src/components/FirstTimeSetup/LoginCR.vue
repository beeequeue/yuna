<template>
<div class="step login-cr" @keydown.enter="login">
  <img :src="crIcon" class="logo"/>

  <text-input
    placeholder="Username"
    :onChange="value => handleChange('username', value)"
  />

  <text-input
    password
    placeholder="Password"
    :onChange="value => handleChange('password', value)"
  />

  <c-button
    content="Login"
    :click="login"
  />
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import crIcon from '@/assets/crunchyroll.webp'
import TextInput from '@/components/Form/TextInput.vue'
import { prop } from '@/utils'
import CButton from '@/components/CButton.vue'

@Component({ components: { CButton, TextInput } })
export default class LoginCr extends Vue {
  @Prop(Boolean) public loading!: boolean | null
  @Prop(prop(Function, true))
  public loginCrunchyroll!: (u: string, p: string) => any

  public username = ''
  public password = ''

  public crIcon = crIcon

  public handleChange(key: keyof this, value: any) {
    this[key] = value
  }

  public login() {
    this.loginCrunchyroll(this.username, this.password)
  }
}
</script>

<style scoped lang="scss">
.login-cr {
  display: flex;
  flex-direction: column;
  align-items: center;

  & > .logo {
    height: 75px;
    width: 75px;
    margin: 15px;
  }

  & > .text-input {
    margin: 0 25px 10px;

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
