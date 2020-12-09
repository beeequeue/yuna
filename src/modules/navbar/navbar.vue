<template>
  <div class="navbar">
    <router-link to="/">
      <icon class="button" :icon="homeOutlineSvg" />
    </router-link>

    <item
      v-tooltip="getTooltip('queue')"
      text="Queue"
      path="/queue"
      class="align-right"
    />

    <search />

    <item
      v-tooltip="getTooltip('list')"
      text="List"
      path="/list"
      class="align-left"
    />

    <icon
      class="button align-left"
      :class="openClass"
      :icon="menuSvg"
      @click.native="toggleOpen"
    />

    <settings-dropdown
      :class="openClass"
      :open="settingsOpen"
      :toggle-open="toggleOpen"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { TooltipSettings } from "v-tooltip"
import { mdiHomeOutline, mdiMenu } from "@mdi/js"

import Icon from "@/common/components/icon.vue"
import Search from "@/modules/search/search.vue"
import Item from "./item.vue"
import SettingsDropdown from "./settings-dropdown.vue"

@Component({
  components: { Search, SettingsDropdown, Icon, Item },
})
export default class Navbar extends Vue {
  public settingsOpen = false
  public showFirstTimeTooltips = false

  public homeOutlineSvg = mdiHomeOutline
  public menuSvg = mdiMenu

  public mounted() {
    setTimeout(() => {
      this.showFirstTimeTooltips = this.isInFirstSetup
    }, 500)
  }

  public get openClass() {
    return {
      open: this.settingsOpen,
    }
  }

  public get isInFirstSetup() {
    return this.$route.path.includes("/first-time-setup")
  }

  public getTooltip(item: "queue" | "list"): TooltipSettings | false {
    let content = ""

    switch (item) {
      case "queue":
        content = "Try importing your current shows from your List!"
        break
      case "list":
        content = "Look through your List for your next show to watch!"
        break
    }

    return {
      content,
      show: this.showFirstTimeTooltips && this.isInFirstSetup,
      autoHide: false,
      trigger: "manual",
    }
  }

  public toggleOpen() {
    this.settingsOpen = !this.settingsOpen
  }
}
</script>

<style scoped lang="scss">
@import "../../colors";

.navbar {
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
