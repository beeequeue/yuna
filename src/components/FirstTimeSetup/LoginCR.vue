<template>
  <div class="step login-cr" @keydown.enter="login">
    <span v-html="crIcon" class="logo" />

    <text-input
      placeholder="Username"
      :class="{ 'full-width': fullWidth }"
      :onChange="value => handleChange('username', value)"
    />

    <text-input
      password
      placeholder="Password"
      :class="{ 'full-width': fullWidth }"
      :onChange="value => handleChange('password', value)"
    />

    <transition>
      <div v-if="true" class="error">{{ error }}</div>
    </transition>

    <c-button content="Login" :click="login" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import crIcon from '@/assets/crunchyroll.svg'
import TextInput from '@/components/Form/TextInput.vue'
import CButton from '@/components/CButton.vue'

import { Required } from '@/decorators'

@Component({ components: { CButton, TextInput } })
export default class LoginCr extends Vue {
  @Required(Function) public loginCrunchyroll!: (
    u: string,
    p: string,
  ) => Promise<any>
  @Prop(Boolean) public fullWidth!: boolean | null

  public loading: boolean | null = null
  public error: string | null = null
  public username = ''
  public password = ''

  public crIcon = crIcon

  public handleChange(key: keyof this, value: any) {
    this[key] = value
  }

  public async login() {
    this.error = null

    try {
      this.loading = true
      await this.loginCrunchyroll(this.username, this.password)
      this.loading = false
    } catch (err) {
      this.loading = false
      this.error = err
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

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

  & > .error {
    color: $danger;
    font-weight: 700;
    padding: 0 20px;
    margin-bottom: 15px;
  }
}

.full-width {
  margin: 0 0 10px !important;
}
</style>
