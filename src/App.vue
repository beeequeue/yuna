<template>
<div id="app" :style="`background-image: url(${backgroundImage})`">
  <title-bar v-if="!isFullscreen"/>

  <transition>
    <navbar v-if="isLoggedIn.all && !isFullscreen"/>
  </transition>

  <transition name="route">
    <router-view :key="$route.params.id ? $route.params.id : $route.path" class="route"/>
  </transition>

  <player-container v-if="isLoggedIn.all"/>

  <toast-overlay/>
</div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator'
import Component from 'vue-class-component'

import TitleBar from './components/TitleBar.vue'
import Navbar from './components/Navbar/Navbar.vue'
import PlayerContainer from './components/Player/Container.vue'
import ToastOverlay from './components/ToastOverlay.vue'
import { createSession, getIsLoggedIn } from './state/auth'
import { getIsFullscreen } from './state/app'

const requireBg = require.context('@/assets/bg')
const backgrounds = requireBg.keys()

@Component({
  components: { TitleBar, PlayerContainer, Navbar, ToastOverlay },
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
    await createSession(this.$store)

    if (!this.isLoggedIn.all) {
      window.initialLogin = true
      return this.$router.push('login')
    }
  }
}
</script>

<style lang="scss">
@import 'colors';
@import 'tooltip';

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

  & > .route {
    z-index: 1;
  }

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
