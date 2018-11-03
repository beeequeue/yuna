<template>
<div class="login-container">
  <div class="login">
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

        <c-button
          v-if="!isLoggedIn.anilist"
          content="Link Account"
          @click.native="authAnilist"
        />
        <icon v-else :icon="checkSvg"/>
      </div>
    </div>

    <br/>

    <c-button
      type="danger"
      confirm
      content="Reset Login"
      v-tooltip.bottom="'In case logging in goes terribly wrong'"
      :click="reset"
    />
  </div>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mdiCheck } from '@mdi/js'

import Icon from '@/components/Icon.vue'
import CButton from '@/components/CButton.vue'
import LoginForm from '@/components/LoginForm.vue'
import { sendErrorToast } from '@/state/app'
import {
  getIsLoggedIn,
  loginCrunchyroll,
  logOut,
  setAnilist,
} from '@/state/auth'
import { loginAnilist, getAnilistData } from '@/lib/anilist'

@Component({
  components: {
    CButton,
    Icon,
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

  public onSuccessfullLogin() {
    if (this.isLoggedIn.all) {
      if (window.initialLogin) {
        window.initialLogin = false
        return this.$router.push('/')
      }

      this.$router.back()
    }
  }

  public async loginCR(user: string, pass: string) {
    try {
      await loginCrunchyroll(this.$store, { user, pass })
    } catch (e) {
      return Promise.reject(e)
    }

    this.onSuccessfullLogin()
  }

  public authAnilist() {
    loginAnilist(async newUrl => {
      const matches = newUrl.match(
        /access_token=(.*)&.*&expires_in=(\d+)/,
      ) as RegExpMatchArray

      const anilistData = await getAnilistData({
        token: matches[1],
        expires: Date.now() + Number(matches[2]),
      })

      if (!anilistData) {
        sendErrorToast(this.$store, 'Invalid Anilist token')
      }

      setAnilist(this.$store, anilistData)

      this.onSuccessfullLogin()
    })
  }

  public reset() {
    logOut(this.$store)
  }

  get isLoggedIn() {
    return getIsLoggedIn(this.$store)
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.login-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .login {
    padding: 25px 50px;
    background: $dark;
    border-radius: 5px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 1);
    filter: blur(0);
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
}

.route-enter-active,
.route-leave-active {
  transition: transform 0.5s, opacity 0.5s;
}

.route-enter,
.route-leave-to {
  opacity: 0;
  transform: translateY(-5%);
}
</style>
