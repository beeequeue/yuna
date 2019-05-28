<template>
  <div class="login-container">
    <div class="login">
      <div class="steps">
        <div>
          <transition name="fade">
            <login-a-l
              v-if="!isConnectedTo.anilist"
              :loginAnilist="loginAnilist"
            />

            <icon v-else :icon="checkSvg" />
          </transition>
        </div>

        <div>
          <transition name="fade">
            <login-h-d
              v-if="!isConnectedTo.hidive || !selectedHidiveProfile"
              :onFinished="confirmHidiveProfile"
              fullWidth
            />

            <icon v-else :icon="checkSvg" />
          </transition>
        </div>

        <div>
          <transition name="fade">
            <login-c-r
              v-if="!isConnectedTo.crunchyroll"
              :onFinished="onSuccessfulLogin"
              fullWidth
            />

            <icon v-else :icon="checkSvg" />
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mdiCheck } from '@mdi/js'

import Icon from '@/common/components/icon.vue'
import CButton from '@/common/components/button.vue'
import LoginCR from '@/common/components/login/crunchyroll.vue'
import LoginAL from '@/common/components/login/anilist.vue'
import LoginHD from '@/common/components/login/hidive.vue'

import { Anilist } from '@/lib/anilist'
import { getFinishedConnecting, getIsConnectedTo } from '@/state/auth'

@Component({
  components: {
    LoginHD,
    CButton,
    Icon,
    LoginCR,
    LoginAL,
  },
})
export default class Login extends Vue {
  public checkSvg = mdiCheck

  public selectedHidiveProfile = false

  private get isFinished() {
    return getFinishedConnecting(this.$store)
  }

  public confirmHidiveProfile() {
    this.selectedHidiveProfile = true
  }

  public onSuccessfulLogin() {
    if (this.isFinished) {
      if (window.initialLogin) {
        window.initialLogin = false
        return this.$router.push('/')
      }

      this.$router.back()
    }
  }

  public async loginAnilist() {
    await Anilist.login()

    this.onSuccessfulLogin()
  }

  get isConnectedTo() {
    return getIsConnectedTo(this.$store)
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

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

      & > div {
        position: relative;
        display: flex;
        align-items: center;
        margin: 0 15px;
        width: 200px;
        height: 285px;

        & > * {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          transform: translate(-50%, -50%);
        }
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
