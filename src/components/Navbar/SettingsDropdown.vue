<template>
  <div class="wrapper">
    <div v-if="open" class="fader" @click="toggleOpen"/>

    <div class="menu" :class="{ open }" @click="toggleOpen">
      <div class="item open-settings" @click="openSettings">
        <icon :icon="settingsSvg"/>
        <span>Settings</span>
      </div>

      <a href="https://github.com/beeequeue/yuna/issues/new">
        <div class="item report-bug">
          <icon :icon="bugSvg"/>
          <span>Report bug</span>
        </div>
      </a>

      <a href="https://github.com/beeequeue/yuna">
        <div class="item github">
          <icon :icon="githubSvg"/>
          <span>Source</span>
        </div>
      </a>

      <div class="item clear-cache" @click="clearCache">
        <icon :icon="clearSvg"/>
        <span>Clear caches</span>
      </div>

      <div class="item open-about" @click="toggleAboutModal">
        <icon :icon="infoSvg"/>
        <span>About</span>
      </div>

      <div class="item log-out" @click="logOut">
        <icon :icon="logOutSvg"/>
        <span>Log out</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import {
  mdiCached,
  mdiLogout,
  mdiSettingsOutline,
  mdiInformationOutline,
  mdiBugOutline,
  mdiGithubCircle,
} from '@mdi/js'

import { logOut } from '@/state/auth'
import { toggleModal } from '@/state/app'
import Icon from '../Icon.vue'

@Component({
  components: { Icon },
})
export default class SettingsDropdown extends Vue {
  @Prop(Boolean) public open!: boolean
  @Prop() public toggleOpen!: () => any

  public settingsSvg = mdiSettingsOutline
  public bugSvg = mdiBugOutline
  public githubSvg = mdiGithubCircle
  public clearSvg = mdiCached
  public infoSvg = mdiInformationOutline
  public logOutSvg = mdiLogout

  public logOut() {
    logOut(this.$store)

    this.$router.push('login')
  }

  public clearCache() {
    caches.delete('images')
  }

  public openSettings() {
    this.$router.push('/settings')
  }

  public toggleAboutModal() {
    toggleModal(this.$store, 'about')
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

  & a {
    color: $highlight;
    text-decoration: none;
  }

  & .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    cursor: pointer;

    transition: background 0.15s;

    &:hover {
      background: rgba(0, 0, 0, 0.075);
    }

    & > .icon {
      height: 1.15em;
      width: 1.15em;
      margin-right: 10px;
    }
  }

  &:not(.open) {
    transform: translateX(101%);
  }
}
</style>
