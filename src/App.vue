<template>
  <div id="app" :style="`background-image: url(${backgroundImage})`">
    <navbar v-if="isLoggedIn"/>

    <router-view/>

    <button class="logout-button" v-if="isLoggedIn" @click="logOut">log out</button>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator'
import Component from 'vue-class-component'

import Navbar from './components/Navbar/Navbar.vue'
import { createSession, isLoggedIn, logOutCrunchyroll } from './state/auth'

const requireBg = require.context('@/assets/bg')
const backgrounds = requireBg.keys()

@Component({
  components: { Navbar },
})
export default class App extends Vue {
  mounted() {
    createSession(this.$store)

    if (!this.isLoggedIn) {
      return this.$router.push('/login')
    }
  }

  get isLoggedIn() {
    return isLoggedIn(this.$store)
  }

  logOut() {
    logOutCrunchyroll(this.$store)

    this.$router.push('/login')
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
