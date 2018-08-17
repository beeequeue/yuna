<template>
  <div>
    <div v-if="!isLoggedIn">
      <div>Username: {{username}}</div>
      <input :value="username" @input="updateUsername" placeholder="Username" />
      <br/>
      <input :value="password" @input="updatePassword" type="password" placeholder="Password" />
      <br/>
      <br/>
      <button @click="handleLogin">Login</button>
    </div>

    <div v-if="isLoggedIn">
      Logged in!
    </div>
  </div>
</template>

<script lang="ts">
  import {
    Component,
    Prop,
    Vue
  } from 'vue-property-decorator'

  @Component
  export default class LoginForm extends Vue {
    @Prop() login!: (user: string, pass: string) => void
    @Prop() isLoggedIn!: boolean
    username = ''
    password = ''

    updateUsername(e: any) {
      this.username = e.currentTarget.value
    }

    updatePassword(e: any) {
      this.password = e.currentTarget.value
    }

    handleLogin() {
      this.login(this.username, this.password)
    }
  }
</script>

<style scoped lang="scss">
</style>
