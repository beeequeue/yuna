<template>
  <div class="login">
    <Logo class="logo"/>

    <div class="steps">
      <div>
        Crunchyroll

        <br/>

        <LoginForm v-if="!isLoggedIn.crunchyroll" :login="loginCR"/>
        <icon v-else :icon="checkSvg"/>
      </div>

      <div>
        Anilist

        <br/>
        <br/>

        <button v-if="!isLoggedIn.anilist" @click="authAnilist">
          Link Account
        </button>
        <icon v-else :icon="checkSvg"/>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mdiCheck } from '@mdi/js'

import Logo from '@/assets/logo.svg'
import Icon from '@/components/Icon.vue'
import LoginForm from '@/components/LoginForm.vue'
import { getIsLoggedIn, loginCrunchyroll, setAnilist } from '../state/auth'
import { loginAnilist, isValidToken } from '../lib/anilist'

@Component({
  components: {
    Icon,
    Logo,
    LoginForm,
  },
})
export default class Login extends Vue {
  public checkSvg = mdiCheck

  public mounted() {
    if (this.isLoggedIn.all) {
      this.$router.back()
    }
  }

  public async loginCR(user: string, pass: string) {
    try {
      await loginCrunchyroll(this.$store, { user, pass })
    } catch (e) {
      return Promise.reject(e)
    }

    if (this.isLoggedIn.all) {
      if (window.initialLogin) {
        window.initialLogin = false
        return this.$router.push('/')
      }

      this.$router.back()
    }
  }

  public authAnilist() {
    loginAnilist(async newUrl => {
      const matches = newUrl.match(
        /access_token=(.*)&.*&expires_in=(\d+)/,
      ) as RegExpMatchArray

      const validToken = await isValidToken(matches[1])

      if (!validToken) {
        throw new Error('invalid token')
      }

      setAnilist(this.$store, {
        token: matches[1],
        expires: Date.now() + Number(matches[2]),
      })
    })
  }

  get isLoggedIn() {
    return getIsLoggedIn(this.$store)
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

  & > .steps {
    display: flex;
    justify-content: space-between;
    align-items: center;

    & > * {
      margin: 0 15px;
    }

    & .icon {
      height: 50px;
      width: 50px;
      fill: greenyellow;
    }
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
