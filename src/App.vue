<template>
  <transition name="fade">
    <div id="app" tabindex="0" :style="`background-image: url(${backgroundImage})`">
      <title-bar v-if="!isFullscreen" />

      <transition>
        <navbar v-if="isFinishedConnecting && hasFinishedSetup && !isFullscreen" />
      </transition>

      <transition name="route">
        <!-- Needed for views to not be unloaded, but breaks hot reloading in development -->
        <keep-alive v-if="!isDev" :include="/List|Queue/">
          <router-view
            :key="$route.params.id ? $route.params.id : $route.path"
            class="route"
          />
        </keep-alive>
        <router-view
          v-else
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
import { ipcRenderer, shell } from "electron"
import { captureException } from "@sentry/browser"
import {
  computed,
  defineComponent,
  onErrorCaptured,
  watchEffect,
} from "@vue/composition-api"

import TitleBar from "@/common/components/title-bar.vue"
import ToastOverlay from "@/common/components/toast-overlay.vue"
import AboutModal from "@/common/modals/about-modal.vue"
import EditModal from "@/common/modals/edit-modal.vue"
import LocalSourceModal from "@/common/modals/local-source/local-source.vue"
import PlayerContainer from "@/modules/player/player-container.vue"
import Navbar from "@/modules/navbar/navbar.vue"
import { Crunchyroll } from "@/lib/crunchyroll"
import { Hidive } from "@/lib/hidive"
import { getFinishedConnecting } from "@/state/auth"
import { getHasFinishedSetup, setFfmpegFailed } from "@/state/settings"
import {
  getIsFullscreen,
  sendErrorToast,
  sendToast,
  setIsUpdateAvailable,
} from "@/state/app"
import {
  CHECK_FOR_UPDATES,
  FFMPEG_DOWNLOADED,
  FFMPEG_FAILED,
  UPDATE_AVAILABLE,
} from "@/messages"
import { AnilistListPlugin } from "@/plugins/list/anilist/anilist-plugin"
import { SimklListPlugin } from "@/plugins/list/simkl-plugin"
import { router } from "@/router"
import { ProvidePlayer } from "@/state/player"

const requireBg = require.context("@/assets/bg", false, /\.webp$/)
const backgrounds = requireBg.keys()

export default defineComponent({
  components: {
    TitleBar,
    PlayerContainer,
    Navbar,
    ToastOverlay,
    AboutModal,
    LocalSourceModal,
    EditModal,
  },
  setup: (_props, context) => {
    if (process.env.NODE_ENV === "production") {
      ipcRenderer.send(CHECK_FOR_UPDATES)
    }

    onErrorCaptured((err: Error) => {
      sendErrorToast(context.root.$store, err.message)

      switch (process.env.NODE_ENV) {
        case "development":
          //eslint-disable-next-line no-console
          console.error(err)
          break
        case "production":
          captureException(err)
          break
      }
    })

    const plugins = [AnilistListPlugin, SimklListPlugin]
    window.listPlugins = plugins.map(
      (plugin) => new plugin(context.root.$apollo, context.root.$store),
    )

    const hasFinishedSetup = computed(() => getHasFinishedSetup(context.root.$store))
    const isFinishedConnecting = computed(() =>
      getFinishedConnecting(context.root.$store),
    )

    if (!hasFinishedSetup.value) {
      context.root.$router.push("/first-time-setup")
    }

    if (!isFinishedConnecting.value && hasFinishedSetup.value) {
      window.initialLogin = true
      context.root.$router.push("login")
    }

    Hidive.createVisit(context.root.$store)
    Crunchyroll.createSession(context.root.$store)

    watchEffect(() => {
      if (!isFinishedConnecting.value && hasFinishedSetup.value) {
        context.root.$router.push("login")
      }
    })

    ProvidePlayer()

    ipcRenderer.on(UPDATE_AVAILABLE, (_, downloadUrl) => {
      setIsUpdateAvailable(context.root.$store, downloadUrl)

      sendToast(context.root.$store, {
        type: "info",
        title: "A new update is available!",
        message: "Click here to download it.",
        timeout: 15 * 1000,
        click: () => shell.openExternal(downloadUrl),
      })
    })

    ipcRenderer.on(FFMPEG_FAILED, () => {
      setFfmpegFailed(context.root.$store, true)

      sendToast(context.root.$store, {
        type: "error",
        title: "Could not download FFMPEG.",
        message: "Local file support will not work.",
        click: () => router.push("/settings#ffmpeg"),
      })
    })

    ipcRenderer.on(FFMPEG_DOWNLOADED, () => {
      setFfmpegFailed(context.root.$store, false)

      sendToast(context.root.$store, {
        type: "success",
        title: "Successfully downloaded FFMPEG!",
        message: "Local file support will work now!",
      })
    })

    return {
      isDev: process.env.NODE_ENV === "development",
      backgroundImage: requireBg(
        backgrounds[Math.floor(Math.random() * backgrounds.length)],
      ),
      isFinishedConnecting,
      hasFinishedSetup,
      isFullscreen: computed(() => getIsFullscreen(context.root.$store)),
    }
  },
})
</script>

<style lang="scss">
@import "colors";
@import "tooltip";

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
  font-family: "Lato", sans-serif;
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
    font-family: "Raleway", sans-serif;
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
