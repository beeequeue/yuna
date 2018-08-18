<template>
  <div id="app" :style="`background-image: url(${backgroundImage})`">
    <transition>
      <navbar v-if="isLoggedIn"/>
    </transition>

    <transition>
      <router-view/>
    </transition>

    <button class="logout-button" v-if="isLoggedIn" @click="logOut">log out</button>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator'
import Component from 'vue-class-component'

import Navbar from './components/Navbar/Navbar.vue'
import {
  createSession,
  getSessionId,
  isLoggedIn,
  logOutCrunchyroll,
} from './state/auth'
import { goToLogin } from './utils'

const requireBg = require.context('@/assets/bg')
const backgrounds = requireBg.keys()

@Component({
  components: { Navbar },
})
export default class App extends Vue {
  async mounted() {
    if (getSessionId(this.$store).length < 1) {
      await createSession(this.$store)
    }

    if (!this.isLoggedIn) {
      return goToLogin(this.$router)
    }
  }

  get isLoggedIn() {
    return isLoggedIn(this.$store)
  }

  logOut() {
    logOutCrunchyroll(this.$store)

    goToLogin(this.$router)
  }

  backgroundImage = requireBg(
    backgrounds[Math.floor(Math.random() * backgrounds.length)],
  )
}
</script>

<style lang="scss">
@import 'colors';

html,
body,
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  display: flex;
  flex-direction: column;

  background-size: cover;
  background-position: center, center;

  color: $white;
  font-family: 'Source Sans Pro', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;

  & * {
    box-sizing: border-box;
  }
}

.logout-button {
  position: absolute;
  bottom: 5px;
  right: 5px;
}
</style>
