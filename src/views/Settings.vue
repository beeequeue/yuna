<template>
<div class="settings">
  <div class="category" id="keybindings">
    <h3>Keybindings</h3>

    <keybinding
      v-for="action in keybindingActions"
      :key="action"
      :action="action"
    />

    <raised-button
      type="danger"
      content="Reset keybindings to default"
      @click=""
    />
  </div>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import {
  getSettings,
  KeybindingAction,
  resetKeybindings,
  SettingsState,
} from '../state/settings'
import Keybinding from '../components/Settings/Keybinding.vue'
import RaisedButton from '../components/RaisedButton.vue'

@Component({
  components: { RaisedButton, Keybinding },
})
export default class Settings extends Vue {
  public get keybindingActions(): string[] {
    return Object.keys(KeybindingAction)
      .map((key: any) => KeybindingAction[key])
      .filter(item => typeof item === 'string')
  }

  public get settings(): SettingsState {
    return getSettings(this.$store)
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
  width: 400px;

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
