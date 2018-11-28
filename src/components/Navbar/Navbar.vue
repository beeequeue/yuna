<template>
<div class="container">
  <router-link to="/">
    <icon class="button" :icon="homeOutlineSvg"/>
  </router-link>

  <item
    text="Queue"
    path="/queue"
    class="align-right"
    v-tooltip="getTooltip('queue')"
  />

  <search />

  <item
    text="List"
    path="/list"
    class="align-left"
    v-tooltip="getTooltip('list')"
  />

  <icon
    class="button align-left"
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
import { TooltipSettings } from 'v-tooltip'
import { mdiHomeOutline, mdiSettingsOutline } from '@mdi/js'

import Search from '../Search/Search.vue'
import Icon from '../Icon.vue'
import Item from './Item.vue'
import SettingsDropdown from './SettingsDropdown.vue'

@Component({
  components: { Search, SettingsDropdown, Icon, Item },
})
export default class Navbar extends Vue {
  public settingsOpen = false
  public showFirstTimetooltips = false

  public homeOutlineSvg = mdiHomeOutline
  public settingsSvg = mdiSettingsOutline

  public mounted() {
    setTimeout(() => {
      this.showFirstTimetooltips = this.isInFirstSetup
    }, 500)
  }

  public get openClass() {
    return {
      open: this.settingsOpen,
    }
  }

  public get isInFirstSetup() {
    return this.$route.path.includes('/first-time-setup')
  }

  public getTooltip(item: 'queue' | 'list'): TooltipSettings | false {
    let content = ''

    switch (item) {
      case 'queue':
        content = 'Try importing your current shows from your List!'
        break
      case 'list':
        content = 'Look through your List for your next show to watch!'
        break
    }

    return {
      content,
      show: this.showFirstTimetooltips && this.isInFirstSetup,
      autoHide: false,
      trigger: 'manual',
    }
  }

  public toggleOpen() {
    this.settingsOpen = !this.settingsOpen
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.container {
  position: relative;
  display: grid;
  grid-template-columns: 50px 1fr 1.5fr 1fr 50px;
  grid-gap: 50px;
  justify-items: center;
  align-items: center;
  background: $dark;
  z-index: 10;
  user-select: none;

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
