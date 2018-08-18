<template>
<div>
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
  import {
    Component,
    Prop,
    Vue
  } from 'vue-property-decorator'

  @Component
  export default class LoginForm extends Vue {
    @Prop() login!: (user: string, pass: string) => Promise<void>
    username = ''
    password = ''
    error: string | null = null

    updateUsername(e: any) {
      this.username = e.currentTarget.value
    }

    updatePassword(e: any) {
      this.password = e.currentTarget.value
    }

    async handleLogin() {
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
