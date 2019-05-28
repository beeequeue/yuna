<template>
  <div class="connection">
    <span class="logo" :class="{ [type]: true }" v-html="image" />

    <c-button
      :icon="!isConnected ? connectSvg : disconnectSvg"
      :click="!isConnected ? connect : disconnect"
      :type="!isConnected ? null : 'danger'"
    />

    <a v-if="user != null" :href="user.url" class="name">
      {{ user.name }}
    </a>
    <span v-else>{{ capitalize(type) }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { oc } from 'ts-optchain'
import { mdiLinkVariant, mdiLinkVariantOff } from '@mdi/js'

import crIcon from '@/assets/crunchyroll.svg'
import alIcon from '@/assets/anilist.svg'
import hidiveIcon from '@/assets/hidive.svg'
import CButton from '@/common/components/button.vue'

import { Required } from '@/decorators'
import { RootState } from '@/state/store'
import { getIsConnectedTo, getFinishedConnecting } from '@/state/auth'
import { Crunchyroll } from '@/lib/crunchyroll'
import { Anilist } from '@/lib/anilist'
import { Hidive } from '@/lib/hidive'
import { capitalize } from '@/utils'

@Component({ components: { CButton } })
export default class Connection extends Vue {
  @Required(String) public type!: 'crunchyroll' | 'anilist' | 'hidive'
  @Required(Function) public setCurrentWindow!: (window: string) => any

  public connectSvg = mdiLinkVariant
  public disconnectSvg = mdiLinkVariantOff

  public get isConnected() {
    return getIsConnectedTo(this.$store)[this.type] === true
  }

  public get user() {
    return oc(this.$store.state as RootState).auth[this.type].user() || null
  }

  public async connect() {
    this.setCurrentWindow(capitalize(this.type))
  }

  public async disconnect() {
    switch (this.type) {
      case 'crunchyroll':
        await Crunchyroll.logOut(this.$store)
        break

      case 'anilist':
        await Anilist.logOut(this.$store)
        break

      case 'hidive':
        await Hidive.disconnect(this.$store)
        break
    }

    if (!getFinishedConnecting(this.$store)) {
      this.$router.push('/login')
    }
  }

  // eslint-disable-next-line
  public get image() {
    switch (this.type) {
      case 'crunchyroll':
        return crIcon
      case 'anilist':
        return alIcon
      case 'hidive':
        return hidiveIcon
    }
  }

  public capitalize = capitalize
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.connection {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 15px;
  overflow: hidden;

  & > .logo {
    flex-shrink: 0;
    position: relative;
    height: 40px;
    width: 40px;

    &.anilist /deep/ svg {
      position: absolute;
      height: calc(100% + 10px);
      width: calc(100% + 10px);
      top: -5px;
      left: -5px;
    }
  }

  & > .button {
    flex-shrink: 0;
    margin: 0 10px;
  }

  & > .name {
    font-size: 1.1em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & > a {
    color: $white;
    text-decoration: underline;
  }
}
</style>
