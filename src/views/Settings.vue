<template>
<div class="container">
  <div class="settings">
    <section class="category" id="updates">
      <h1>Updates</h1>

      <c-button
        v-if="updateIsAvailable"
        content="Install update!"
        type="success"
        :click="downloadUpdate"
      />

      <checkbox
        setting="auto-update"
        text="Automatically update the program."
        :checked="settings.autoUpdate"
        :onChange="checked => setSetting('autoUpdate', checked)"
      />

      <!-- <checkbox
        setting="beta"
        text="Install pre-releases (beta versions)."
        :checked="settings.beta"
        :onChange="checked => setSetting('beta', checked)"
      /> -->
    </section>

    <section class="category" id="spoilers">
      <h1>Spoiler Hiding</h1>

      <h3>
        Anime Info

        <icon :icon="infoSvg" v-tooltip.right="'These spoilers will stop being<br/>hidden after watching one third<br/>of the season\'s episodes.'"/>
      </h3>

      <checkbox
        setting="spoiler-descriptions"
        text="Descriptions"
        :checked="settings.spoilers.anime.description"
        :onChange="checked => setSpoiler('anime.description', checked)"
      />

      <h3>
        Episode Info

        <icon :icon="infoSvg" v-tooltip.right="'These spoilers will stop<br/>being hidden after watching<br/>the episode.'"/>
      </h3>

      <checkbox
        setting="spoiler-episode-title"
        text="Titles"
        :checked="settings.spoilers.episode.name"
        :onChange="checked => setSpoiler('episode.name', checked)"
      />

      <checkbox
        setting="spoiler-episode-thumbnail"
        text="Thumbnails"
        :checked="settings.spoilers.episode.thumbnail"
        :onChange="checked => setSpoiler('episode.thumbnail', checked)"
      />
    </section>

    <section class="category" id="player">
      <h1>Player</h1>

      <checkbox
        setting="autoPlay"
        text="AutoPlay next epsiode"
        :checked="settings.autoPlay"
        :onChange="checked => setSetting('autoPlay', checked)"
      />

      <checkbox
        setting="autoMarkWatched"
        text="Automatically mark episodes as watched"
        :checked="settings.autoMarkWatched"
        :onChange="checked => setSetting('autoMarkWatched', checked)"
      />

      <section class="category" id="keybindings">
        <h3>
          Keybindings

          <icon :icon="infoSvg" v-tooltip.right="'Click a binding to remove it.'"/>
        </h3>

        <div class="keybinding-container">
          <div class="names">
            <div v-for="action in keybindingActions" :key="action" class="name">
              {{getPrettyActionName(action)}}:
            </div>
          </div>

          <div class="actions">
            <keybinding
              v-for="action in keybindingActions"
              :key="action"
              :action="action"
              :unbindKey="unbindKey"
              :openKeybindModal="openKeybindModal"
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
  </div>

  <div class="info-container"></div>

  <transition name="fade">
    <div
      v-if="actionToBind"
      class="keybinding-modal"
      ref="keybindModal"
      tabindex="0"
      @keydown="bindKey"
    >
      <span class="backdrop"/>

      <div class="body">
        <div>Press any key...</div>

        <div class="hint">escape to cancel</div>
      </div>
    </div>
  </transition>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ipcRenderer } from 'electron'
import { Key } from 'ts-key-enum'
import { mdiUndoVariant, mdiInformationOutline } from '@mdi/js'

import { getIsUpdateAvailable } from '@/state/app'
import {
  addKeybinding,
  getSettings,
  KeybindingAction,
  removeKeybinding,
  resetKeybindings,
  setSetting,
  SettingsState,
  setSpoiler,
} from '@/state/settings'
import { DOWNLOAD_UPDATE } from '@/messages'

import Keybinding from '../components/Settings/Keybinding.vue'
import Group from '../components/Settings/Group.vue'
import Checkbox from '../components/Settings/Checkbox.vue'
import CButton from '../components/CButton.vue'
import Icon from '../components/Icon.vue'

@Component({
  components: { CButton, Checkbox, Group, Keybinding, Icon },
})
export default class Settings extends Vue {
  public actionToBind: KeybindingAction | null = null

  public infoSvg = mdiInformationOutline
  public resetSvg = mdiUndoVariant

  public get keybindingActions(): string[] {
    return Object.keys(KeybindingAction)
      .map((key: any) => KeybindingAction[key])
      .filter(item => typeof item === 'string')
  }

  public get settings(): SettingsState {
    return getSettings(this.$store)
  }

  public get updateIsAvailable() {
    return getIsUpdateAvailable(this.$store)
  }

  public setSetting(
    setting: keyof SettingsState,
    value: SettingsState[typeof setting],
  ) {
    setSetting(this.$store, { setting, value })
  }

  public setSpoiler(key: string, value: boolean) {
    setSpoiler(this.$store, {
      path: key.split('.') as any,
      value,
    })
  }

  public downloadUpdate() {
    ipcRenderer.send(DOWNLOAD_UPDATE)
  }

  public openKeybindModal(action: KeybindingAction) {
    this.actionToBind = action

    setImmediate(() => {
      const modalEl = this.$refs.keybindModal as HTMLElement
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
        return 'Pause'
      case KeybindingAction.PLAY:
        return 'Play'
      case KeybindingAction.PAUSE_PLAY:
        return 'Pause / Play'
      case KeybindingAction.SKIP_BACK:
        return 'Skip backwards'
      case KeybindingAction.SKIP_FORWARD:
        return 'Skip forwards'
      case KeybindingAction.TOGGLE_FULLSCREEN:
        return 'Toggle fullscreen'
      case KeybindingAction.TOGGLE_MUTED:
        return 'Toggle muted'
      case KeybindingAction.VOLUME_DOWN:
        return 'Decrease volume'
      case KeybindingAction.VOLUME_UP:
        return 'Increase volume'
      default:
        return action
    }
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

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
    background: darken($dark, 2%);
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
    & h4 {
      display: flex;
      align-items: center;
      position: relative;
      font-family: 'Raleway', sans-serif;
      font-weight: 500;

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
      width: 100%;
      padding: 25px 50px 0;

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

    & > .spoiler-window {
      height: 350px;
      width: 300px;
      background: $dark;
      box-shadow: $shadow;

      &.v-enter-active,
      &.v-leave-active {
        transition: transform 0.25s, opacity 0.25s;
      }

      &.v-enter,
      &.v-leave-to {
        transform: translateY(2.5%);
        opacity: 0;
      }
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
    font-family: 'Raleway', sans-serif;

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
