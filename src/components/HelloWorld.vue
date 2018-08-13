<template>
  <div>
    <div v-if="!loggedIn">
      <div>Username: {{username}}</div>
      <input :value="username" @input="updateUsername" placeholder="Username" />
      <br/>
      <input :value="password" @input="updatePassword" type="password" placeholder="Password" />
      <br/>
      <br/>
      <button @click="logIn">Login</button>
    </div>

    <div v-if="loggedIn">
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
  import * as crunchyroll from '@/lib/crunchyroll'

  @Component
  export default class HelloWorld extends Vue {
    username = ''
    password = ''
    loggedIn = false

    updateUsername(e: any) {
      this.username = e.currentTarget.value
    }

    updatePassword(e: any) {
      this.password = e.currentTarget.value
    }

    async logIn() {
      const result = await crunchyroll.login(this.username, this.password)

      if (result.user.username === this.username) this.loggedIn = true
    }
  }
</script>

<style lang="scss">

</style>
