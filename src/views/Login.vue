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
  mounted() {
    this.redirectTo = this.$route.query['redirect']

    if (this.isLoggedIn) {
      this.$router.push('..')
    }
  }

  redirectTo?: string

  async login(user: string, pass: string) {
    await loginCrunchyroll(this.$store, { user, pass })

    if (this.isLoggedIn) {
      this.$router.push(this.redirectTo || '..')
    }
  }

  get isLoggedIn() {
    return isLoggedIn(this.$store)
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.login {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 35px 50px;
  background: $dark;
  border-radius: 5px;
  box-shadow: 0 5px 6px $shadow;
}

.logo {
  height: 100px;
  fill: $main;
}
</style>
