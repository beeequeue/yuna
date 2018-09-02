<template>
<div class="container">
  <router-link to="/">
    <icon class="button" :icon="homeOutlineSvg"/>
  </router-link>

  <item text="Queue" path="/queue"/>

  <span>Search goes here</span>

  <item text="List" path="/list"/>

  <icon
    class="button"
    :class="openClass"
    :icon="settingsSvg"
    @click.native="toggleOpen"
  />

  <settings-dropdown
    :class="openClass"
    :open="settingsOpen"
    :toggleOpen="toggleOpen"
  />
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mdiHomeOutline, mdiSettingsOutline } from '@mdi/js'

import Item from './Item.vue'
import Icon from '../Icon.vue'
import SettingsDropdown from './SettingsDropdown.vue'

@Component({
  components: { SettingsDropdown, Icon, Item },
})
export default class Navbar extends Vue {
  public settingsOpen = true

  public get openClass() {
    return {
      open: this.settingsOpen,
    }
  }

  public toggleOpen() {
    this.settingsOpen = !this.settingsOpen
  }

  public homeOutlineSvg = mdiHomeOutline
  public settingsSvg = mdiSettingsOutline
}
</script>

<style scoped lang="scss">
@import '../../colors';

.container {
  position: relative;
  display: grid;
  grid-template-columns: 50px 1fr auto 1fr 50px;
  justify-items: center;
  align-items: center;
  background: $dark;
  z-index: 10;

  & .button {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    padding: 10px;
    fill: $white;

    cursor: pointer;

    transition: background 0.25s, fill 0.25s, color 0.25s;

    &.open {
      background: $white;
      color: $highlight;
      fill: $highlight;
      z-index: 10;
    }
  }
}

.v-enter-active,
.v-leave-active {
  transition: transform 0.5s;
}

.v-enter,
.v-leave-to {
  transform: translateY(-100%);
}
</style>
