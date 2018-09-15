<template>
<div id="app" :style="`background-image: url(${backgroundImage})`">
  <title-bar v-if="!isFullscreen"/>

  <transition>
    <navbar v-if="isLoggedIn.all && !isFullscreen"/>
  </transition>

  <transition name="route">
    <router-view/>
  </transition>

  <player-container v-if="isLoggedIn.all"/>
</div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator'
import Component from 'vue-class-component'

import Navbar from './components/Navbar/Navbar.vue'
import PlayerContainer from './components/Player/Container.vue'
import TitleBar from './components/TitleBar.vue'
import { createSession, getIsLoggedIn, getSessionId } from './state/auth'
import { getIsFullscreen } from './state/app'

const requireBg = require.context('@/assets/bg')
const backgrounds = requireBg.keys()

@Component({
  components: { TitleBar, PlayerContainer, Navbar },
})
export default class App extends Vue {
  get isLoggedIn() {
    return getIsLoggedIn(this.$store)
  }

  get isFullscreen() {
    return getIsFullscreen(this.$store)
  }

  public backgroundImage = requireBg(
    backgrounds[Math.floor(Math.random() * backgrounds.length)],
  )

  public async mounted() {
    if (getSessionId(this.$store).length < 1 || !this.isLoggedIn.crunchyroll) {
      await createSession(this.$store)
    }

    if (!this.isLoggedIn.all) {
      let query = ''
      const indexOfAccessToken = this.$route.fullPath.indexOf('access_token')
      if (indexOfAccessToken > -1) {
        query = '?' + this.$route.fullPath.substr(indexOfAccessToken)
      }

      window.initialLogin = true
      return this.$router.push('login' + query)
    }
  }
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
    -webkit-tap-highlight-color: transparent !important;
    outline: none !important;
  }
}

// Global classes
.fill-container {
  position: absolute;
  width: 100%;
  height: 100%;
}

.no-interaction {
  pointer-events: none;
}

// Default transitions
.fade-enter-active,
.fade-leave-active {
  will-change: opacity;
  transition: opacity 0.1s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
