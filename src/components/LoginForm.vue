<template>
<div @keydown.enter="handleLogin">
  <br/>
  <div v-if="error">{{error}}</div>
  <input :value="username" @input="updateUsername" placeholder="Username" />
  <br/>
  <input :value="password" @input="updatePassword" type="password" placeholder="Password" />
  <br/>
  <br/>
  <button @click="handleLogin">Login</button>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class LoginForm extends Vue {
  @Prop() public login!: (user: string, pass: string) => Promise<void>
  public username = ''
  public password = ''
  public error: string | null = null

  public updateUsername(e: any) {
    this.username = e.currentTarget.value
  }

  public updatePassword(e: any) {
    this.password = e.currentTarget.value
  }

  public async handleLogin() {
    try {
      await this.login(this.username, this.password)
    } catch (e) {
      if (e.message) {
        this.error = e.message
      }

      return
    }

    this.username = ''
    this.password = ''
    this.error = null
  }
}
</script>

<style scoped lang="scss">
</style>
