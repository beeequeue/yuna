<template>
  <div id="app" :style="`background-image: url(${backgroundImage})`">
    <title-bar v-if="!isFullscreen" />

    <transition>
      <navbar v-if="isConnectedTo.all && hasFinishedSetup && !isFullscreen" />
    </transition>

    <transition name="route">
      <router-view
        :key="$route.params.id ? $route.params.id : $route.path"
        class="route"
      />
    </transition>

    <player-container v-if="isConnectedTo.all" />

    <toast-overlay />

    <about-modal
      :visible="modalStates.about"
      :toggleVisible="() => toggleModal('about')"
    />

    <edit-modal
      :visible="modalStates.edit"
      :toggleVisible="() => toggleModal('edit')"
    />

    <manual-search-modal
      :visible="true || modalStates.manualSearch"
      :toggleVisible="() => toggleModal('manualSearch')"
    />
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator'
import Component from 'vue-class-component'
import { ipcRenderer } from 'electron'

import { Crunchyroll } from '@/lib/crunchyroll'
import { getIsConnectedTo } from '@/state/auth'
import { getHasFinishedSetup } from '@/state/settings'
import {
  AppState,
  getEditingAnime,
  getIsFullscreen,
  getModalStates,
  toggleModal,
} from '@/state/app'
import { CHECK_FOR_UPDATES } from '@/messages'

import TitleBar from './components/TitleBar.vue'
import Navbar from './components/Navbar/Navbar.vue'
import PlayerContainer from './components/Player/Container.vue'
import ToastOverlay from './components/ToastOverlay.vue'
import AboutModal from './components/Modals/AboutModal.vue'
import EditModal from './components/Modals/EditModal.vue'
import ManualSearchModal from '@/components/Modals/ManualSearch/ManualSearchModal.vue'

const requireBg = require.context('@/assets/bg')
const backgrounds = requireBg.keys().filter(name => name.includes('.webp'))

@Component({
  components: {
    ManualSearchModal,
    TitleBar,
    PlayerContainer,
    Navbar,
    ToastOverlay,
    AboutModal,
    EditModal,
  },
})
export default class App extends Vue {
  get isConnectedTo() {
    return getIsConnectedTo(this.$store)
  }

  get isFullscreen() {
    return getIsFullscreen(this.$store)
  }

  get modalStates() {
    return getModalStates(this.$store)
  }

  get editingAnime() {
    return getEditingAnime(this.$store)
  }

  get hasFinishedSetup() {
    return getHasFinishedSetup(this.$store)
  }

  public errorCaptured(err: any) {
    //eslint-disable-next-line no-console
    console.error(err)
  }

  public backgroundImage = requireBg(
    backgrounds[Math.floor(Math.random() * backgrounds.length)],
  )

  public async created() {
    if (!this.hasFinishedSetup) {
      this.$router.push('/first-time-setup')
    }

    if (!this.isConnectedTo.all && this.hasFinishedSetup) {
      window.initialLogin = true
      this.$router.push('login')
    }

    await Crunchyroll.createSession(this.$store)

    if (process.env.NODE_ENV === 'production') {
      ipcRenderer.send(CHECK_FOR_UPDATES)
    }
  }

  public toggleModal(modal: keyof AppState['modals']) {
    toggleModal(this.$store, modal)
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
