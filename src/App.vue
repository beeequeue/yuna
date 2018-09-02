<template>
<div id="app" :style="`background-image: url(${backgroundImage})`">
  <title-bar v-if="isElectron"/>

  <transition>
    <navbar v-if="isLoggedIn"/>
  </transition>

  <transition>
    <router-view/>
  </transition>

  <player-container v-if="isLoggedIn"/>
</div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator'
import Component from 'vue-class-component'

import Navbar from './components/Navbar/Navbar.vue'
import PlayerContainer from './components/Player/Container.vue'
import TitleBar from './components/TitleBar.vue'
import { createSession, getSessionId, isLoggedIn } from './state/auth'

const requireBg = require.context('@/assets/bg')
const backgrounds = requireBg.keys()

@Component({
  components: { TitleBar, PlayerContainer, Navbar },
})
export default class App extends Vue {
  public isElectron = process.env.IS_ELECTRON

  get isLoggedIn() {
    return isLoggedIn(this.$store)
  }

  public backgroundImage = requireBg(
    backgrounds[Math.floor(Math.random() * backgrounds.length)],
  )

  public async mounted() {
    if (getSessionId(this.$store).length < 1 || !this.isLoggedIn) {
      await createSession(this.$store)
    }

    if (!this.isLoggedIn) {
      return this.$router.push('login')
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
