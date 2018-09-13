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
import { getIsLoggedIn, loginCrunchyroll } from '@/state/auth'
import { setAnilist } from '@/state/auth'

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

    if(this.$route.query.access_token) {
      this.saveAnilistData()
    }
  }

  public saveAnilistData() {
    const { query } = this.$route

    setAnilist(this.$store, {
      token: query.access_token,
      expires: Date.now() + Number(query.expires_in),
    })
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

  public async authAnilist() {
    window.location.href = `https://anilist.co/api/v2/oauth/authorize?client_id=${
      process.env.ANILIST_ID
    }&response_type=token`
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
