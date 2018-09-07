<template>
<div class="wrapper">
  <div v-if="open" class="fader" @click="toggleOpen"/>

  <div class="menu" :class="{ open }" @click="toggleOpen">
    <div class="item log-out" @click="logOut">
      <icon :icon="logOutSvg"/>
      <span>Log out</span>
    </div>

    <div class="item clear-cache" @click="clearCache">
      <span/>
      <span>Clear cache</span>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiLogout, mdiSettingsOutline } from '@mdi/js'

import Icon from '../Icon.vue'
import { logOutCrunchyroll } from '../../state/auth'
import { AnimeCache } from '../../lib/cache'

@Component({
  components: { Icon },
})
export default class SettingsDropdown extends Vue {
  @Prop(Boolean) public open!: boolean
  @Prop() public toggleOpen!: () => any

  public settingsSvg = mdiSettingsOutline
  public logOutSvg = mdiLogout

  public logOut() {
    logOutCrunchyroll(this.$store)

    this.$router.push('login')
  }

  public clearCache() {
    AnimeCache.clear()
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.wrapper {
  position: fixed;
  top: 30px;
  left: 0;
  height: 100%;
  width: 100%;
  pointer-events: none;
}

.fader {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: all;
}

.menu {
  position: absolute;
  top: 50px;
  right: 0;
  min-width: 150px;
  background: $white;
  fill: $highlight;
  color: $highlight;
  font-size: 18px;
  font-weight: 600;
  pointer-events: all;
  transition: transform 0.25s;

  & > .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    cursor: pointer;

    & > .icon {
      height: 1.15em;
      width: 1.15em;
      margin-right: 10px;
    }
  }

  &:not(.open) {
    transform: translateX(100%);
  }
}
</style>
