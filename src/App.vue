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

  <about-modal
    :visible="showAboutModal"
    :toggleModal="toggleAboutModal"
    :version="version"
  />
</div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator'
import Component from 'vue-class-component'

import { createBothSessions } from '@/utils'
import TitleBar from './components/TitleBar.vue'
import Navbar from './components/Navbar/Navbar.vue'
import PlayerContainer from './components/Player/Container.vue'
import ToastOverlay from './components/ToastOverlay.vue'
import AboutModal from './components/AboutModal.vue'
import { getIsLoggedIn, setCrunchyrollCountry } from './state/auth'
import {
  getIsFullscreen,
  toggleShowAboutModal,
  getShowAboutModal,
} from './state/app'
import { version } from '../package.json'

const requireBg = require.context('@/assets/bg')
const backgrounds = requireBg.keys().filter(name => name.includes('.jpg'))

@Component({
  components: { TitleBar, PlayerContainer, Navbar, ToastOverlay, AboutModal },
})
export default class App extends Vue {
  get isLoggedIn() {
    return getIsLoggedIn(this.$store)
  }

  get isFullscreen() {
    return getIsFullscreen(this.$store)
  }

  get showAboutModal() {
    return getShowAboutModal(this.$store)
  }

  public version = version

  public backgroundImage = requireBg(
    backgrounds[Math.floor(Math.random() * backgrounds.length)],
  )

  public async mounted() {
    const data = await createBothSessions(this.$store)
    setCrunchyrollCountry(this.$store, data.country_code)

    if (!this.isLoggedIn.all) {
      window.initialLogin = true
      return this.$router.push('login')
    }
  }

  public toggleAboutModal() {
    toggleShowAboutModal(this.$store)
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
  font-family: 'Lato', sans-serif;
  font-weight: 300;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;

  & > .route {
    z-index: 1;
  }

  & h1,
  & h2,
  & h3,
  & h4 {
    font-family: 'Raleway', sans-serif;
    font-weight: 300;
  }

  & * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent !important;
    outline: none !important;

    &::-webkit-scrollbar {
      width: 12px;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      background-color: rgba(0, 0, 0, 0.25);
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 5px;
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);
      background-color: desaturate($main, 20%);
    }
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
