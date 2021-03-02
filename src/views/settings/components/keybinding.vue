<template>
  <div class="keybinding">
    <c-button
      v-for="key in keys"
      :key="key"
      :icon="getIconForKey(key)"
      :title="key === ' ' ? 'Spacebar' : key"
      :content="getIconForKey(key) ? null : key.toUpperCase()"
      @click.native="unbindKey({ key, action })"
    />

    <c-button
      v-if="keys.length < 2"
      :icon="plusSvg"
      @click.native="openKeybindModal(action)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"
import { Key } from "ts-key-enum"
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
} from "@mdi/js"

import CButton from "@/common/components/button.vue"
import { getKeysForAction, KeybindingAction } from "@/state/settings"

@Component({
  components: { CButton },
})
export default class Keybinding extends Vue {
  @Prop(String) public action!: KeybindingAction
  @Prop(Function)
  public unbindKey!: (opts: { key: Key | string; action: KeybindingAction }) => void
  @Prop(Function) public openKeybindModal!: (action: KeybindingAction) => void

  public plusSvg = mdiPlus

  public get keys() {
    return getKeysForAction(this.$store)(this.action)
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
      case " ":
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
  height: 35px;
  display: flex;
  align-items: center;

  & > .button {
    margin-right: 5px;
    font-weight: 600;
    min-width: 35px;
    height: 35px;
    justify-content: center;
  }
}
</style>
