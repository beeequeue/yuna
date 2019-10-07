<template>
  <div class="menu">
    <div class="aside">
      <a class="anichart" href="https://anichart.net" v-html="anichartLogo" />

      <a
        v-if="isConnectedTo.anilist"
        class="anilist"
        :href="`https://anilist.co/user/${userId}/animelist`"
        v-html="alLogo"
      />

      <a
        v-if="isConnectedTo.simkl"
        class="simkl"
        :href="`${simklUser.url}/dashboard`"
        v-html="simklLogo"
      />
    </div>

    <text-input
      placeholder="Search in List..."
      :onChange="debouncedSetSearchString"
    />

    <div class="aside right">
      <transition name="fade">
        <loading v-if="$apollo.loading" :size="26" />
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Vue, Watch } from 'vue-property-decorator'
import Fuse from 'fuse.js'

import anichartSvg from '@/assets/anichart.svg'
import anilistSvg from '@/assets/anilist.svg'
import simklSvg from '@/assets/simkl.svg'
import TextInput from '@/common/components/form/text-input.vue'
import Loading from '@/common/components/loading.vue'

import { getAnilistUserId, getIsConnectedTo, getSimklUser } from '@/state/auth'
import { MediaListStatus } from '@/graphql/types'
import { debounce, prop } from '@/utils'

type EmittedLists = {
  [key in MediaListStatus]: number[]
}

@Component({ components: { Loading, TextInput } })
export default class Filters extends Vue {
  public anichartLogo = anichartSvg
  public alLogo = anilistSvg
  public simklLogo = simklSvg

  public lists = [
    MediaListStatus.Current,
    MediaListStatus.Repeating,
    MediaListStatus.Planning,
    MediaListStatus.Paused,
    MediaListStatus.Completed,
    MediaListStatus.Dropped,
  ] as const

  public data: any[] = []

  public searchString = ''

  public get isConnectedTo() {
    return getIsConnectedTo(this.$store)
  }

  public get userId() {
    return getAnilistUserId(this.$store)
  }

  public get simklUser() {
    return getSimklUser(this.$store)
  }

  public filteredItems: any[] = []

  @Watch('searchString')
  public updateFilteredItems() {
    const items = this.data

    const filteredByTitles = this.filterByTitles(items, this.searchString)

    this.filteredItems = filteredByTitles
  }

  @Watch('filteredItems')
  @Emit('show-filtered')
  public emitFilteredItem(): EmittedLists | null {
    if (this.searchString.length < 4) return null

    return this.lists.reduce(
      (obj, status) => {
        obj[status] = this.filteredItems
          .filter(e => e.status === status)
          .map(prop('mediaId'))

        return obj
      },
      {} as EmittedLists,
    )
  }

  public filterByTitles(entries: any[], str: string): any[] {
    if (str.length < 4) return this.data

    const fuse = new Fuse<any[][number]>(entries, {
      caseSensitive: false,
      shouldSort: true,
      keys: ['media.title.english', 'media.title.romaji'] as any,
      threshold: 0.35,
    })
    const result = fuse.search(str)

    // console.log(result)
    return result
  }

  // beautiful!
  public debouncedSetSearchString = debounce((str: string) => {
    if (str.length < 3) return

    this.setSearchString(str)
  }, 500)

  public setSearchString(str: string) {
    this.searchString = str
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.menu {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 10px 0;
  background: color($dark, 300);
  flex-shrink: 0;

  & > .aside {
    position: absolute;
    top: calc(50% + 2px);
    left: 12px;
    display: flex;
    align-items: center;
    text-decoration: none;
    transform: translateY(-50%);

    &.right {
      left: auto;
      right: 12px;
    }

    & /deep/ svg {
      height: 26px;
      width: 26px;
      margin-right: 15px;
    }
  }

  & > .text-input,
  & > .number-input {
    & /deep/ input {
      text-align: center;
    }
  }
}
</style>
