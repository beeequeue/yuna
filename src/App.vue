<template>
  <transition name="fade">
    <div
      id="app"
      tabindex="0"
      :style="`background-image: url(${backgroundImage})`"
    >
      <title-bar v-if="!isFullscreen" />

      <transition>
        <navbar
          v-if="isFinishedConnecting && hasFinishedSetup && !isFullscreen"
        />
      </transition>

      <transition name="route">
        <router-view
          :key="$route.params.id ? $route.params.id : $route.path"
          class="route"
        />
      </transition>

      <player-container v-if="isFinishedConnecting" />

      <toast-overlay />

      <portal-target slim name="modal" transition="transition-group" />

      <about-modal />

      <local-source-modal />

      <edit-modal />
    </div>
  </transition>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron'
import { Vue, Watch } from 'vue-property-decorator'
import Component from 'vue-class-component'
import { captureException } from '@sentry/browser'

import TitleBar from '@/common/components/title-bar.vue'
import ToastOverlay from '@/common/components/toast-overlay.vue'
import AboutModal from '@/common/modals/about-modal.vue'
import EditModal from '@/common/modals/edit-modal.vue'
import LocalSourceModal from '@/common/modals/local-source/local-source.vue'
import PlayerContainer from '@/modules/player/player-container.vue'
import Navbar from '@/modules/navbar/navbar.vue'
import { Crunchyroll } from '@/lib/crunchyroll'
import { Hidive } from '@/lib/hidive'
import { getFinishedConnecting } from '@/state/auth'
import { getHasFinishedSetup } from '@/state/settings'
import { getIsFullscreen, sendErrorToast } from '@/state/app'
import { CHECK_FOR_UPDATES } from '@/messages'
import { AnilistListPlugin } from '@/plugins/list/anilist/anilist-plugin'
import { SimklListPlugin } from '@/plugins/list/simkl-plugin'

const requireBg = require.context('@/assets/bg')
const backgrounds = requireBg.keys().filter(name => name.includes('.webp'))

@Component({
  components: {
    TitleBar,
    PlayerContainer,
    Navbar,
    ToastOverlay,
    AboutModal,
    LocalSourceModal,
    EditModal,
  },
})
export default class App extends Vue {
  public get isFinishedConnecting() {
    return getFinishedConnecting(this.$store)
  }

  public get isFullscreen() {
    return getIsFullscreen(this.$store)
  }

  public get hasFinishedSetup() {
    return getHasFinishedSetup(this.$store)
  }

  public errorCaptured(err: any) {
    sendErrorToast(this.$store, err)

    switch (process.env.NODE_ENV) {
      case 'development':
        //eslint-disable-next-line no-console
        console.error(err)
        break
      case 'production':
        captureException(err)
        break
    }
  }

  public backgroundImage = requireBg(
    backgrounds[Math.floor(Math.random() * backgrounds.length)],
  )

  public setupListPlugins() {
    const plugins = [AnilistListPlugin, SimklListPlugin]

    return plugins.map(plugin => new plugin(this.$apollo, this.$store))
  }

  @Watch('hasFinishedSetup')
  public finishedConnectingChanged() {
    if (!this.isFinishedConnecting && this.hasFinishedSetup) {
      this.$router.push('login')
    }
  }

  public async created() {
    window.listPlugins = this.setupListPlugins()

    if (!this.hasFinishedSetup) {
      this.$router.push('/first-time-setup')
    }

    if (!this.isFinishedConnecting && this.hasFinishedSetup) {
      window.initialLogin = true
      this.$router.push('login')
    }

    Hidive.createVisit(this.$store)
    Crunchyroll.createSession(this.$store)

    if (process.env.NODE_ENV === 'production') {
      ipcRenderer.send(CHECK_FOR_UPDATES)
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
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;

  color: $white;
  font-family: 'Lato', sans-serif;
  font-weight: 300;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

#app {
  display: flex;
  flex-direction: column;

  background-size: cover;
  background-position: center, center;

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
