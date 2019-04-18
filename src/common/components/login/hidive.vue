<template>
  <div class="step login-hidive" @keydown.enter="login">
    <span v-html="hidiveIcon" class="logo" />

    <div class="container" v-if="hidiveProfiles.length < 1">
      <text-input
        placeholder="Email"
        :class="{ 'full-width': fullWidth }"
        :onChange="value => handleChange('email', value)"
      />

      <text-input
        password
        placeholder="Password"
        :class="{ 'full-width': fullWidth }"
        :onChange="value => handleChange('password', value)"
      />

      <transition>
        <div v-if="error" class="error">{{ error }}</div>
      </transition>
    </div>
    <div v-else class="container">
      <dropdown
        :items="hidiveProfiles"
        :value="selectedProfileIndex"
        :onChange="setHidiveProfile"
      />
    </div>

    <transition name="fade">
      <loading v-if="loading" class="loading" />
    </transition>

    <c-button v-if="hidiveProfiles.length < 1" content="Login" :click="login" />
    <c-button v-else content="Continue" :click="onFinished" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import hidiveIcon from '@/assets/hidive.svg'
import TextInput from '@/components/Form/TextInput.vue'
import CButton from '@/components/CButton.vue'
import Loading from '@/components/Loading.vue'
import Dropdown, { DropdownItem } from '@/components/Form/Dropdown.vue'

import { Hidive } from '@/lib/hidive'
import {
  getHidiveProfileIndex,
  getHidiveProfiles,
  setHidiveProfile,
} from '@/state/auth'

@Component({ components: { Dropdown, Loading, CButton, TextInput } })
export default class LoginHd extends Vue {
  @Prop(Function) public onFinished!: (() => any) | null
  @Prop(Boolean) public fullWidth!: boolean | null

  public loading: boolean | null = null
  public error: string | null = null
  public email = ''
  public password = ''

  public hidiveIcon = hidiveIcon

  public get hidiveProfiles(): DropdownItem[] {
    return getHidiveProfiles(this.$store).map<DropdownItem>((profile, i) => ({
      label: profile.Nickname,
      value: i as any,
    }))
  }

  public get selectedProfileIndex() {
    return getHidiveProfileIndex(this.$store)
  }

  public handleChange(key: keyof this, value: any) {
    this[key] = value
  }

  public setHidiveProfile(index: number) {
    setHidiveProfile(this.$store, index)
  }

  public async login() {
    this.error = null

    try {
      this.loading = true
      await Hidive.connect(this.$store, this.email, this.password)
      this.loading = false
    } catch (err) {
      this.loading = false
      this.error = err
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.login-hidive {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  & > .logo {
    width: 75px;
    margin: 15px;
  }

  & > .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 15px;

    & > .text-input {
      margin: 0 25px 10px;

      & /deep/ input {
        text-align: center;
      }
    }

    & > .error {
      color: $danger;
      font-weight: 700;
      padding: 0 20px;
      max-height: 36px;
      overflow: hidden;
      transition: max-height 0.25s, margin 0.25s;

      &.v-enter,
      &.v-leave-to {
        max-height: 0;
        margin-bottom: 0;
      }
    }
  }

  & > .button {
    width: 100%;
    padding: 10px;
  }

  & > .loading {
    position: absolute;
    top: 50%;
    right: 75px;
    height: 25px;
    width: 25px;
  }
}

.full-width {
  margin: 0 0 10px !important;
}
</style>
