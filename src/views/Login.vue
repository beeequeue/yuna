<template>
  <div class="login">
    <Logo class="logo"/>

    <LoginForm :login="login"/>
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
  redirectTo?: string

  mounted() {
    this.redirectTo = this.$route.query['redirect']

    if (this.isLoggedIn) {
      this.$router.push('..')
    }
  }

  async login(user: string, pass: string) {
    try {
      await loginCrunchyroll(this.$store, { user, pass })
    } catch (e) {
      return Promise.reject(e)
    }

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
  will-change: transform, opacity;

  & > .logo {
    height: 100px;
    fill: $main;
  }
}

.v-enter-active,
.v-leave-active {
  transition: transform 0.5s, opacity 0.5s;
}

.v-enter,
.v-leave-to {
  opacity: 0;
  transform: translate(-50%, -45%);
}
</style>
