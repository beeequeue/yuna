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

import { Default } from '@/decorators'
import { getAnilistUserId, getIsConnectedTo, getSimklUser } from '@/state/auth'
import { ListViewListEntries, MediaListStatus } from '@/graphql/types'
import { debounce, prop } from '@/utils'
import { ListMedia } from '../types'

type Media = NonNullable<NonNullable<ListMedia[number]>['media']>

@Component({ components: { Loading, TextInput } })
export default class Filters extends Vue {
  @Default(Array, () => []) public entries!: ListViewListEntries[]
  @Default(Object, () => {}) public media!: ListMedia

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

  public filteredMedia: number[] = []

  public filterByTitles(media: Media[]): Media[] {
    if (this.searchString.length < 3) return media

    const fuse = new Fuse<Media>(media, {
      caseSensitive: false,
      shouldSort: true,
      keys: ['title.english', 'title.romaji'] as any,
      threshold: 0.35,
    })

    return fuse.search(this.searchString)
  }

  @Watch('searchString')
  public updateFilteredMedia() {
    const media = Object.values(this.media).map(m => m!.media!)

    const filteredByTitles = this.filterByTitles(media)

    this.filteredMedia = filteredByTitles.map(prop('id'))
  }

  @Watch('filteredMedia')
  @Emit('show-filtered')
  public emitFilteredItem(): number[] | null {
    return this.entries
      .filter(entry => this.filteredMedia.includes(entry.mediaId))
      .map(prop('id'))
  }

  // beautiful!
  public debouncedSetSearchString = debounce(
    (str: string) => this.setSearchString(str),
    500,
  )

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
    width: 250px;

    & /deep/ input {
      &::-webkit-input-placeholder {
        font-weight: 400;
      }
      text-align: center;
    }
  }
}
</style>
