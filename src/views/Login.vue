<template>
  <div class="login">
    <Logo class="logo"/>

    <LoginForm :login="login" :isLoggedIn="isLoggedIn" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Logo from '@/assets/logo.svg'
import LoginForm from '@/components/LoginForm.vue'
import { isLoggedIn, loginCrunchyroll } from '../state/auth'

@Component({
  components: {
    Logo,
    LoginForm,
  },
})
export default class Login extends Vue {
  async login(user: string, pass: string) {
    await loginCrunchyroll(this.$store, { user, pass })

    if (this.isLoggedIn) {
      this.$router.push('/')
    }
  }

  get isLoggedIn() {
    return isLoggedIn(this.$store)
  }
}
</script>

<style lang="scss" scoped>
@import '../colors';

.logo {
  height: 100px;
  fill: $main;
}
</style>
