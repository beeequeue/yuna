<template>
<div class="settings">
  <section class="category" id="keybindings">
    <h3>Keybindings</h3>

    <span>Click a binding to remove it</span>

    <keybinding
      v-for="action in keybindingActions"
      :key="action"
      :action="action"
      :unbindKey="unbindKey"
      :openKeybindModal="openKeybindModal"
    />

    <raised-button
      type="danger"
      content="Reset keybindings to default"
      :icon="resetSvg"
      @click.native="resetKeybindings"
    />
  </section>

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
import { Key } from 'ts-key-enum'
import { mdiUndoVariant } from '@mdi/js'

import {
  addKeybinding,
  getSettings,
  KeybindingAction,
  removeKeybinding,
  resetKeybindings,
  SettingsState,
} from '../state/settings'
import Keybinding from '../components/Settings/Keybinding.vue'
import RaisedButton from '../components/RaisedButton.vue'

@Component({
  components: { RaisedButton, Keybinding },
})
export default class Settings extends Vue {
  public actionToBind: KeybindingAction | null = null

  public resetSvg = mdiUndoVariant

  public get keybindingActions(): string[] {
    return Object.keys(KeybindingAction)
      .map((key: any) => KeybindingAction[key])
      .filter(item => typeof item === 'string')
  }

  public get settings(): SettingsState {
    return getSettings(this.$store)
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
}
</script>

<style scoped lang="scss">
@import '../colors';

.settings {
  position: absolute;
  top: 80px;
  background: darken($dark, 2%);
  height: 100%;
  min-width: 400px;

  & h3 {
    font-family: 'Raleway', sans-serif;
    font-weight: 500;
    margin-top: 10px;
  }

  & > .category {
    width: 100%;
    padding: 15px;
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

.route-enter-active,
.route-leave-active {
  &.settings {
    transition: transform 0.5s;
  }
}

.route-enter,
.route-leave-to {
  &.settings {
    transform: translateX(-100%);
  }
}
</style>
