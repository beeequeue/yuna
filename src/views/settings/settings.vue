<template>
  <div class="container" tabindex="0" @keydown.ctrl.d="openDevTools">
    <div ref="settings" class="settings">
      <section id="general" class="category">
        <h1>General</h1>

        <checkbox
          setting="queue-auto-add-list"
          text="Mark shows as Planning when adding them to the queue."
          :checked="settings.autoMarkAsPlanning"
          :on-change="(checked) => setSetting('autoMarkAsPlanning', checked)"
        />

        <section id="discord">
          <h3>Discord</h3>

          <checkbox
            setting="enable-discord-rp"
            text="Enable Discord Rich Presence"
            :checked="settings.discord.richPresence"
            :on-change="handleDiscordPresenceChange"
          />
        </section>

        <section v-if="connectedTo.crunchyroll" id="crunchyroll">
          <h3>Crunchyroll</h3>

          <checkbox
            setting="use-cr-unblocker"
            text="Try to use the US catalogue."
            :checked="settings.useCRUnblocker"
            :on-change="handleUnblockerChange"
          />

          <div
            class="us-cr-failed"
            :class="{ visible: settings.useCRUnblocker && !isUsingUSSession }"
          >
            <div>
              There seems to have been an issue creating a US session. 😟
            </div>

            <c-button
              :icon="retrySvg"
              content="Retry creating US session"
              :click="createUBSession"
            />
          </div>

          <p>
            Sub Language
            <icon
              v-tooltip.top="
                'Changing this may cause some<br/>shows to be unavailable unless<br/>changed back to English (US).'
              "
              :icon="infoSvg"
            />
          </p>

          <dropdown
            :items="localeItems"
            :value="crunchyrollLocale"
            :on-change="setCrunchyrollLocale"
          />
        </section>

        <section id="local-files">
          <h3>Local Files</h3>

          <div id="local-files-path" class="path-container">
            <c-button
              v-if="!localFilesFolder"
              content="Set path"
              :click="setLocalFilesFolder"
            />
            <c-button
              v-else
              type="danger"
              :icon="removeSvg"
              :click="clearLocalFilesFolder"
            />

            <div
              v-tooltip.top="localFilesFolder"
              class="path"
              @click="!!localFilesFolder ? setLocalFilesFolder() : null"
            >
              {{ localFilesFolder }}
            </div>
          </div>

          <div id="vlc-path" class="path-container with-icon">
            <icon class="vlc" :icon="vlcSvg" />

            <div v-tooltip.top="vlcPath" class="path" @click="setVLCPath()">
              <c-button v-if="!vlcPath" content="Set VLC path" />
              <span v-else>{{ vlcPath }}</span>
            </div>
          </div>

          <div id="ffmpeg" class="path-container with-icon">
            <Icon
              :icon="ffmpegFailed ? crossSvg : checkSvg"
              class="ffmpeg"
              :class="{ failed: ffmpegFailed }"
            />

            <div v-if="ffmpegFailed" class="path" style="direction: ltr">
              <c-button content="Retry FFMPEG download" :click="retryFfmpeg" />
            </div>
            <div v-else class="item">
              FFMPEG downloaded.

              <c-button
                v-tooltip.top="'Re-download'"
                :icon="resetSvg"
                style="margin-left: 10px"
                :click="retryFfmpeg"
              />
            </div>
          </div>
        </section>
      </section>

      <section id="spoilers" class="category">
        <h1>Spoiler Hiding</h1>

        <h3>
          Anime Info
          <icon
            v-tooltip.top="
              'These spoilers will stop being<br/>hidden after watching one third<br/>of the season\'s episodes.'
            "
            :icon="infoSvg"
          />
        </h3>

        <checkbox
          setting="spoiler-descriptions"
          text="Descriptions"
          :checked="settings.spoilers.anime.description"
          :on-change="(checked) => setSpoiler('anime.description', checked)"
        />

        <h3>
          Episode Info
          <icon
            v-tooltip.top="
              'These spoilers will stop<br/>being hidden after watching<br/>the episode.'
            "
            :icon="infoSvg"
          />
        </h3>

        <checkbox
          setting="spoiler-episode-title"
          text="Titles"
          :checked="settings.spoilers.episode.name"
          :on-change="(checked) => setSpoiler('episode.name', checked)"
        />

        <checkbox
          setting="spoiler-episode-thumbnail"
          text="Thumbnails"
          :checked="settings.spoilers.episode.thumbnail"
          :on-change="(checked) => setSpoiler('episode.thumbnail', checked)"
        />
      </section>

      <section id="player" class="category">
        <h1>Player</h1>

        <checkbox
          setting="autoPlay"
          text="AutoPlay next epsiode"
          :checked="settings.autoPlay"
          :on-change="(checked) => setSetting('autoPlay', checked)"
        />

        <checkbox
          setting="autoMarkWatched"
          text="Automatically mark episodes as watched"
          :checked="settings.autoMarkWatched"
          :on-change="(checked) => setSetting('autoMarkWatched', checked)"
        />

        <section id="keybindings" class="category">
          <h3>
            Keybindings
            <icon
              v-tooltip.right="'Click a binding to remove it.'"
              :icon="infoSvg"
            />
          </h3>

          <div class="keybinding-container">
            <div class="names">
              <div
                v-for="action in keybindingActions"
                :key="action"
                class="name"
              >
                {{ getPrettyActionName(action) }}:
              </div>
            </div>

            <div class="actions">
              <keybinding
                v-for="action in keybindingActions"
                :key="action"
                :action="action"
                :unbind-key="unbindKey"
                :open-keybind-modal="openKeybindModal"
              />
            </div>
          </div>

          <c-button
            type="danger"
            confirm
            content="Reset keybindings to default"
            :icon="resetSvg"
            :click="resetKeybindings"
          />
        </section>
      </section>

      <section id="accounts" class="category">
        <h1>Accounts</h1>

        <h3>List managers</h3>

        <connection type="anilist" :set-current-window="setCurrentWindow" />

        <connection type="simkl" :set-current-window="setCurrentWindow" />

        <p>
          Main list manager

          <icon
            v-tooltip.top="{
              content:
                'This is the service that will be used to show what status shows are in etc.',
            }"
            :icon="infoSvg"
          />
        </p>
        <dropdown
          :items="mainListPluginSelectItems"
          :value="mainListPlugin"
          :on-change="setMainListPlugin"
        />

        <h3>Streaming services</h3>

        <connection type="crunchyroll" :set-current-window="setCurrentWindow" />

        <connection type="hidive" :set-current-window="setCurrentWindow" />
      </section>
    </div>

    <div class="info-container">
      <transition name="fade">
        <div v-if="currentWindow" class="login-window">
          <login-a-l
            v-if="currentWindow === Window.Anilist"
            :on-finished="() => setCurrentWindow(null)"
          />

          <login-c-r
            v-if="currentWindow === Window.Crunchyroll"
            :on-finished="() => setCurrentWindow(null)"
          />

          <login-h-d
            v-if="currentWindow === Window.Hidive"
            :on-finished="() => setCurrentWindow(null)"
          />

          <login-simkl
            v-if="currentWindow === Window.Simkl"
            :on-finished="() => setCurrentWindow(null)"
          />
        </div>
      </transition>
    </div>

    <transition name="fade">
      <div
        v-if="actionToBind"
        ref="keybindModal"
        class="keybinding-modal"
        tabindex="0"
        @keydown="bindKey"
      >
        <span class="backdrop" />

        <div class="body">
          <div>Press any key...</div>

          <div class="hint">escape to cancel</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { ipcRenderer, shell } from "electron"
import { Key } from "ts-key-enum"
import {
  mdiCheckBold,
  mdiCloseThick,
  mdiDelete,
  mdiInformationOutline,
  mdiRefresh,
  mdiUndoVariant,
  mdiVlc,
} from "@mdi/js"

import LoginAL from "@/common/components/login/anilist.vue"
import LoginSimkl from "@/common/components/login/simkl.vue"
import LoginCR from "@/common/components/login/crunchyroll.vue"
import LoginHD from "@/common/components/login/hidive.vue"
import Checkbox from "@/common/components/form/checkbox.vue"
import CButton from "@/common/components/button.vue"
import Icon from "@/common/components/icon.vue"
// @ts-ignore
import Dropdown, { DropdownItem } from "@/common/components/form/dropdown.vue"
import Connection from "./components/connection.vue"
import Keybinding from "./components/keybinding.vue"

import { Crunchyroll } from "@/lib/crunchyroll"
import {
  getCrunchyrollCountry,
  getIsConnectedTo,
  getListPlugins,
} from "@/state/auth"
import {
  addKeybinding,
  getCrunchyrollLocale,
  getLocalFilesFolder,
  getMainListPlugin,
  getSettings,
  KeybindingAction,
  removeKeybinding,
  resetKeybindings,
  setDiscordRichPresence,
  setLocalFilesFolder,
  setMainListPlugin,
  setSetting,
  setSpoiler,
  SettingsState,
  setVLCPath,
} from "@/state/settings"
import { FFMPEG_RETRY, OPEN_DEVTOOLS } from "@/messages"
import { capitalize, isNil } from "@/utils"
import { getFilePath, getFolderPath } from "@/utils/ffmpeg"

enum Window {
  Anilist = "Anilist",
  Simkl = "Simkl",
  Crunchyroll = "Crunchyroll",
  Hidive = "Hidive",
}

@Component({
  components: {
    LoginAL,
    LoginCR,
    LoginHD,
    LoginSimkl,
    Dropdown,
    Connection,
    CButton,
    Checkbox,
    Keybinding,
    Icon,
  },
})
export default class Settings extends Vue {
  public currentWindow: Window | null = null
  public actionToBind: KeybindingAction | null = null

  public infoSvg = mdiInformationOutline
  public retrySvg = mdiRefresh
  public removeSvg = mdiDelete
  public resetSvg = mdiUndoVariant
  public vlcSvg = mdiVlc
  public checkSvg = mdiCheckBold
  public crossSvg = mdiCloseThick
  public Window = Window

  public $refs!: {
    settings: HTMLDivElement
    keybindModal: HTMLDivElement
  }

  public mounted() {
    const { hash } = this.$route

    if (!isNil(hash) && hash.length > 2) {
      const section = document
        .getElementById(hash.replace("#", ""))!
        .getBoundingClientRect()
      this.$refs.settings.scrollTo({
        top: section.top - 90,
        behavior: "smooth",
      })
    }
  }

  public get keybindingActions(): string[] {
    return Object.keys(KeybindingAction)
      .map((key) => KeybindingAction[key as keyof typeof KeybindingAction])
      .filter((item) => typeof item === "string")
  }

  public get settings(): SettingsState {
    return getSettings(this.$store)
  }

  public get isUsingUSSession() {
    return getCrunchyrollCountry(this.$store) === "US"
  }

  public get crunchyrollLocale() {
    return getCrunchyrollLocale(this.$store)
  }

  public get localFilesFolder() {
    return getLocalFilesFolder(this.$store)
  }

  public get vlcPath() {
    return getSettings(this.$store).externalPlayers.vlc
  }

  public get localeItems() {
    return Crunchyroll.locales.map<DropdownItem>((locale) => ({
      label: locale.label,
      value: locale.locale_id,
    }))
  }

  public get connectedTo() {
    return getIsConnectedTo(this.$store)
  }

  public get mainListPlugin() {
    return getMainListPlugin(this.$store)
  }

  public get mainListPluginSelectItems(): DropdownItem[] {
    const plugins = getListPlugins(this.$store)

    return plugins.map((plugin) => ({
      label: capitalize(plugin.name),
      value: plugin.name,
      disabled: !plugin.available,
    }))
  }

  public get ffmpegFailed(): boolean {
    return this.$store.state.settings.ffmpegFailed
  }

  public openDevTools() {
    ipcRenderer.send(OPEN_DEVTOOLS)
  }

  public setSetting(
    setting: keyof SettingsState,
    value: SettingsState[typeof setting],
  ) {
    setSetting(this.$store, { setting, value })
  }

  public setSpoiler(key: string, value: boolean) {
    setSpoiler(this.$store, {
      path: key.split(".") as any,
      value,
    })
  }

  public setCrunchyrollLocale(value: string) {
    Crunchyroll.setLocale(this.$store, value)
  }

  public setCurrentWindow(window: Window | null) {
    this.currentWindow = window
  }

  public async createUBSession() {
    this.handleUnblockerChange(true)
  }

  public async handleUnblockerChange(checked: boolean) {
    this.setSetting("useCRUnblocker", checked)

    await Crunchyroll.createSession(this.$store)
  }

  public async setLocalFilesFolder() {
    const path = await getFolderPath({
      title: "Set directory for Local Files",
    })

    if (isNil(path)) return

    setLocalFilesFolder(this.$store, path)
  }

  public clearLocalFilesFolder() {
    setLocalFilesFolder(this.$store, null)
  }

  public async setVLCPath() {
    const path = await getFilePath({
      title: "Set directory for Local Files",
      filters: [{ name: "vlc", extensions: ["exe"] }],
    })

    if (isNil(path)) return

    setVLCPath(this.$store, path)
  }

  public pathClick() {
    if (isNil(this.localFilesFolder)) return

    shell.openItem(this.localFilesFolder)
  }

  public setMainListPlugin(plugin: string) {
    setMainListPlugin(this.$store, plugin)
  }

  public handleDiscordPresenceChange(checked: boolean) {
    setDiscordRichPresence(this.$store, checked)
  }

  public openKeybindModal(action: KeybindingAction) {
    this.actionToBind = action

    setImmediate(() => {
      const modalEl = this.$refs.keybindModal
      modalEl.focus()
    })
  }

  public bindKey({ key }: KeyboardEvent) {
    if (key === Key.Escape) return (this.actionToBind = null)

    addKeybinding(this.$store, {
      key,
      action: this.actionToBind as any,
    })

    this.actionToBind = null
  }

  public unbindKey(opts: { key: Key | string; action: KeybindingAction }) {
    removeKeybinding(this.$store, opts)
  }

  public resetKeybindings() {
    resetKeybindings(this.$store)
  }

  public getPrettyActionName(action: KeybindingAction) {
    switch (action) {
      case KeybindingAction.PAUSE:
        return "Pause"
      case KeybindingAction.PLAY:
        return "Play"
      case KeybindingAction.PAUSE_PLAY:
        return "Pause / Play"
      case KeybindingAction.SKIP_BACK:
        return "Skip backwards"
      case KeybindingAction.SKIP_FORWARD:
        return "Skip forwards"
      case KeybindingAction.TOGGLE_FULLSCREEN:
        return "Toggle fullscreen"
      case KeybindingAction.TOGGLE_MUTED:
        return "Toggle muted"
      case KeybindingAction.VOLUME_DOWN:
        return "Decrease volume"
      case KeybindingAction.VOLUME_UP:
        return "Increase volume"
      case KeybindingAction.FRAME_FORWARD:
        return "Skip forwards 1 frame"
      case KeybindingAction.FRAME_BACK:
        return "Skip backwards 1 frame"
      default:
        return action
    }
  }

  public retryFfmpeg() {
    ipcRenderer.send(FFMPEG_RETRY)
  }
}
</script>

<style scoped lang="scss">
@import "../../colors";

.container {
  position: absolute;
  top: 80px;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;

  & > .settings {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    background: linear-gradient(90deg, color($dark, 350), color($dark, 300));
    min-width: 425px;
    padding-bottom: 35px;
    user-select: none;
    overflow-y: auto;

    & > * {
      flex-shrink: 0;
    }

    & h1,
    & h2,
    & h3,
    & h4,
    & p {
      display: flex;
      align-items: center;
      position: relative;
      font-family: "Raleway", sans-serif;

      &:not(p) {
        font-weight: 500;
      }

      & > .icon {
        margin-left: 5px;
        height: 20px;
        width: 20px;
        fill: $white;
      }
    }

    h1 {
      margin-top: 0;
    }

    & > .category {
      position: relative;
      width: 100%;
      padding: 25px 50px 0;

      & .us-cr-failed {
        color: color($danger, 600);
        height: 0;
        padding: 0 15px;
        font-weight: 600;
        text-align: center;
        overflow: hidden;
        transition: height 0.5s;
        transition-delay: 0s;

        &.visible {
          transition-delay: 2s;
          height: 75px;
        }

        & > .button {
          margin-top: 5px;
        }
      }

      & .path-container {
        display: flex;
        align-items: center;

        &.with-icon {
          margin-top: 10px;

          & > .icon {
            height: 30px;
            width: 30px;

            &.vlc {
              fill: $vlc;
            }

            &.ffmpeg {
              fill: $success;

              &.failed {
                fill: $danger;
              }
            }
          }
        }

        & > .button {
          flex-shrink: 0;
        }

        & > .item {
          display: flex;
          align-items: center;
          margin-left: 10px;
          padding: 5px;
          max-width: 100%;
        }

        & > .path {
          direction: rtl;
          margin-left: 10px;
          padding: 5px;
          white-space: nowrap;
          max-width: 100%;
          text-overflow: ellipsis;
          overflow: hidden;
          cursor: pointer;
        }
      }

      .keybinding-container {
        display: flex;

        & > .names {
          margin-right: 10px;

          & > .name {
            display: flex;
            align-items: center;
            height: 35px;
            padding: 5px 0;
          }
        }

        & > .names > .name,
        & > .actions > .keybinding {
          margin-bottom: 10px;

          &:last-child {
            margin-bottom: 20px;
          }
        }
      }
    }
  }

  & > .info-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;

    & > .login-window {
      padding: 10px 25px 25px;
      width: 350px;
      border-radius: 5px;
      background: $dark;
      box-shadow: $shadow;
    }
  }
}

.keybinding-modal {
  user-select: none;

  & > .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: rgba(0, 0, 0, 0.5);
  }

  & > .body {
    position: fixed;
    top: 50%;
    left: 50%;
    min-height: 150px;
    min-width: 300px;
    background: $dark;
    box-shadow: 1px 2px 10px black;
    transform: translate(-50%, -50%);

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 1.5em;
    font-family: "Raleway", sans-serif;

    & > .hint {
      margin-top: 10px;
      font-size: 0.5em;
    }
  }
}

.container.route {
  &-enter-active,
  &-leave-active {
    transition: none 0.5s;

    & > .settings {
      transition: transform 0.5s;
    }
  }

  &-enter,
  &-leave-to {
    & > .settings {
      transform: translateX(-100%);
    }
  }
}
</style>
