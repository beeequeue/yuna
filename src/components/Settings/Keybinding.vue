<template>
<div class="keybinding">
  <div class="action-name">{{getPrettyActionName(action)}}:</div>

  <div class="actions">
    <raised-button
      v-for="key in keys"
      :key="key"
      :icon="getIconForKey(key)"
      :title="key === ' ' ? 'Spacebar' : key"
      :content="getIconForKey(key) ? null : key.toUpperCase()"
      @click.native="unbindKey({key, action})"
    />

    <raised-button v-if="keys.length < 2" @click.native="openKeybindModal(action)" :icon="plusSvg"/>
  </div>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Key } from 'ts-key-enum'
import {
  mdiAppleKeyboardShift,
  mdiArrowDownBold,
  mdiArrowLeftBold,
  mdiArrowRightBold,
  mdiArrowUpBold,
  mdiColorHelper,
  mdiKeyboardTab,
  mdiPlus,
  mdiSubdirectoryArrowLeft,
} from '@mdi/js'

import { getKeysForAction, KeybindingAction } from '../../state/settings'
import RaisedButton from '../RaisedButton.vue'

@Component({
  components: { RaisedButton },
})
export default class Keybinding extends Vue {
  @Prop(String) public action!: KeybindingAction
  @Prop(Function)
  public unbindKey!: (
    opts: { key: Key | string; action: KeybindingAction },
  ) => void
  @Prop(Function) public openKeybindModal!: (action: KeybindingAction) => void

  public plusSvg = mdiPlus

  public get keys() {
    return getKeysForAction(this.$store)(this.action)
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

  public getIconForKey(key: Key | string) {
    switch (key) {
      case Key.ArrowLeft:
        return mdiArrowLeftBold
      case Key.ArrowRight:
        return mdiArrowRightBold
      case Key.ArrowUp:
        return mdiArrowUpBold
      case Key.ArrowDown:
        return mdiArrowDownBold
      case ' ':
        return mdiColorHelper
      case Key.Shift:
        return mdiAppleKeyboardShift
      case Key.Tab:
        return mdiKeyboardTab
      case Key.Enter:
        return mdiSubdirectoryArrowLeft
      default:
        return null
    }
  }
}
</script>

<style scoped lang="scss">
.keybinding {
  position: relative;
  width: 100%;
  min-height: 35px;
  display: flex;
  align-items: center;
  margin: 10px 0;

  & > * {
    width: 100%;
  }

  & > .action-name {
    text-align: right;
    margin-right: 10px;
    font-family: 'Raleway', sans-serif;
    font-size: 0.9em;
    font-weight: 300;
  }

  & > .actions {
    grid-area: keys;
    display: flex;

    & > .button {
      margin-right: 5px;
      font-weight: 600;
      min-width: 35px;
      min-height: 35px;
      justify-content: center;
    }
  }
}
</style>
