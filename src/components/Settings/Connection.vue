<template>
  <div class="connection">
    <img class="logo" v-if="type !== 'anilist'" :src="image" />
    <span v-else class="logo" v-html="image" />

    <c-button
      :icon="!isConnected ? connectSvg : disconnectSvg"
      :click="!isConnected ? connect : disconnect"
      :type="!isConnected ? null : 'danger'"
    />

    <a class="name" v-if="user != null" :href="user.url">
      {{ user.name }}
    </a>
    <span v-else>{{ capitalize(type) }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { pathOr } from 'rambdax'
import { mdiLinkVariant, mdiLinkVariantOff } from '@mdi/js'

import crIcon from '@/assets/crunchyroll.webp'
import alIcon from '@/assets/anilist.svg'

import { Required } from '@/decorators'
import { capitalize } from '@/utils'
import CButton from '@/components/CButton.vue'
import { AnilistData, CrunchyrollData, getIsConnectedTo } from '@/state/auth'
import { Crunchyroll } from '@/lib/crunchyroll'
import { logoutAnilist } from '@/lib/anilist'

@Component({
  components: { CButton },
})
export default class Connection extends Vue {
  @Required(String) public type!: 'crunchyroll' | 'anilist'

  public connectSvg = mdiLinkVariant
  public disconnectSvg = mdiLinkVariantOff

  public get isConnected() {
    return getIsConnectedTo(this.$store)[this.type] === true
  }

  public get user() {
    return pathOr(null, ['auth', this.type, 'user'], this.$store.state) as
      | CrunchyrollData['user']
      | AnilistData['user']
      | null
  }

  public async connect() {
    /* no-op */
  }

  public async disconnect() {
    switch (this.type) {
      case 'crunchyroll':
        await Crunchyroll.logOut(this.$store)
        break

      case 'anilist':
        await logoutAnilist(this.$store)
        break
    }

    if (!getIsConnectedTo(this.$store).all) {
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
    }
  }

  public capitalize = capitalize
}
</script>

<style scoped lang="scss">
@import '../../colors';

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

    & /deep/ svg {
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
