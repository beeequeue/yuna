<template>
  <div class="step login-cr" @keydown.enter="login">
    <a
      v-tooltip.top="'Crunchyroll'"
      href="https://crunchyroll.com"
      class="logo"
    >
      <span v-html="crIcon" />
    </a>

    <text-input
      placeholder="Username"
      :class="{ 'full-width': fullWidth }"
      :on-change="value => handleChange('username', value)"
    />

    <text-input
      password
      placeholder="Password"
      :class="{ 'full-width': fullWidth }"
      :on-change="value => handleChange('password', value)"
    />

    <transition>
      <div v-if="error" class="error">{{ error }}</div>
    </transition>

    <transition name="fade">
      <loading v-if="loading" class="loading" />
    </transition>

    <c-button content="Login" :click="login" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import crIcon from '@/assets/crunchyroll.svg'
import TextInput from '@/common/components/form/text-input.vue'
import CButton from '@/common/components/button.vue'
import Loading from '@/common/components/loading.vue'

import { Crunchyroll } from '@/lib/crunchyroll'

@Component({ components: { Loading, CButton, TextInput } })
export default class LoginCr extends Vue {
  @Prop(Function) public onFinished!: (() => any) | null
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
      await Crunchyroll.login(this.$store, this.username, this.password)
      this.loading = false

      if (this.onFinished) {
        this.onFinished()
      }
    } catch (err) {
      this.loading = false
      this.error = err
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.login-cr {
  position: relative;
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
    max-height: 36px;
    overflow: hidden;
    transition: max-height 0.25s, margin 0.25s;
  }

  & > .loading {
    position: absolute;
    top: 50%;
    right: 75px;
    height: 25px;
    width: 25px;
  }

  & > .error,
  & > .loading {
    &.v-enter,
    &.v-leave-to {
      max-height: 0;
      margin-bottom: 0;
    }
  }
}

.full-width {
  margin: 0 0 10px !important;
}
</style>
