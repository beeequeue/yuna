<template>
  <div class="home">
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
  login(user: string, pass: string) {
    loginCrunchyroll(this.$store, { user, pass })
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
