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

      <icon
        v-if="isConnectedTo.simkl"
        v-tooltip.bottom="
          'Some list entries may be missing due to Simkl missing ID matching data.'
        "
        :icon="infoSvg"
      />
    </div>

    <c-select
      v-model="selectedAiringStatus"
      class="airing-status"
      label="Airing Status"
      :items="airingStatuses"
    />

    <text-input
      class="search"
      placeholder="Search in List..."
      :on-change="debouncedSetSearchString"
    />

    <c-select
      v-model="selectedSource"
      class="sources"
      label="Streaming Source"
      :items="sources"
    />

    <div class="aside loader">
      <transition name="fade">
        <loading v-if="$apollo.loading" :size="26" />
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Vue, Watch } from 'vue-property-decorator'
import Fuse from 'fuse.js'
import { mdiInformationOutline } from '@mdi/js'

import anichartSvg from '@/assets/anichart.svg'
import anilistSvg from '@/assets/anilist.svg'
import simklSvg from '@/assets/simkl.svg'
import TextInput from '@/common/components/form/text-input.vue'
import CSelect from '@/common/components/select.vue'
import Loading from '@/common/components/loading.vue'
import Icon from '@/common/components/icon.vue'

import { Default } from '@/decorators'
import { getAnilistUserId, getIsConnectedTo, getSimklUser } from '@/state/auth'
import { ListViewListEntries, MediaStatus } from '@/graphql/types'
import {
  capitalize,
  debounce,
  enumKeysToArray,
  enumToArray,
  getStreamingSources,
  isNil,
  isNotNil,
  prop,
} from '@/utils'
import { ListMedia } from '../types'
import { SelectItem, StreamingSource } from '@/types'
type Media = NonNullable<NonNullable<ListMedia[number]>['media']>

@Component({ components: { Icon, CSelect, Loading, TextInput } })
export default class Filters extends Vue {
  @Default(Array, () => []) public entries!: ListViewListEntries[]
  @Default(Object, () => {}) public media!: ListMedia

  public anichartLogo = anichartSvg
  public alLogo = anilistSvg
  public simklLogo = simklSvg
  public infoSvg = mdiInformationOutline

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

  @Watch('searchString')
  @Watch('selectedSource')
  @Watch('selectedAiringStatus')
  public updateFilteredMedia() {
    const media = Object.values(this.media)
      .map(m => m!.media)
      .filter(isNotNil)

    const filteredByTitles = this.filterByTitles(media)

    const filteredBySources = this.filterBySources(filteredByTitles)

    const filteredByStatus = this.filterByStatus(filteredBySources)

    this.filteredMedia = filteredByStatus.map(prop('id'))
  }

  @Watch('filteredMedia')
  @Emit('show-filtered')
  public emitFilteredItem(): number[] | null {
    return this.entries
      .filter(entry => this.filteredMedia.includes(entry.mediaId))
      .map(prop('id'))
  }

  // Name filter

  public searchString = ''

  // beautiful!
  public debouncedSetSearchString = debounce(
    (str: string) => this.setSearchString(str),
    500,
  )

  public setSearchString(str: string) {
    this.searchString = str
  }

  public filterByTitles(media: Media[]): Media[] {
    if (this.searchString.length < 3) return media

    const fuse = new Fuse(media, {
      caseSensitive: false,
      shouldSort: true,
      keys: ['title.english', 'title.romaji'] as any,
      threshold: 0.35,
    })

    return fuse.search(this.searchString)
  }

  // Sources

  public sources: SelectItem[] = enumToArray(StreamingSource).map<SelectItem>(
    source => ({
      label: capitalize(source.toString()),
      value: source.toString(),
    }),
  )

  public selectedSource: string | null = null

  public filterBySources(media: Media[]): Media[] {
    if (isNil(this.selectedSource)) return media

    return media.filter(m => {
      const links = (m.externalLinks ?? []).filter(isNotNil)
      const sources = getStreamingSources(links)

      return sources.some(
        source => source.site.toLowerCase() === this.selectedSource!,
      )
    })
  }

  // Airing Status
  public airingStatuses: SelectItem[] = enumKeysToArray(MediaStatus).map<
    SelectItem
  >(status => ({
    label: status
      .toString()
      .replace(/([A-Z])/g, ' $1')
      .trim(),
    value: MediaStatus[status],
  }))

  public selectedAiringStatus: string | null = null

  public filterByStatus(media: Media[]): Media[] {
    if (isNil(this.selectedAiringStatus)) return media

    return media.filter(
      m => !isNil(m) && m.airingStatus === this.selectedAiringStatus,
    )
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.menu {
  width: 100%;
  padding: 10px 15px;
  position: relative;
  display: grid;
  grid-template-columns: 125px 1fr 250px 1fr 125px;
  grid-template-areas: 'links airing-status search sources loader';
  grid-gap: 10px;
  justify-items: center;
  align-items: center;
  background: color($dark, 300);
  flex-shrink: 0;

  & > .aside {
    grid-area: links;
    display: flex;
    justify-self: flex-start;
    align-items: center;
    text-decoration: none;

    &.loader {
      grid-area: loader;
      justify-self: flex-end;
    }

    & > a,
    & > span {
      height: 26px;
      margin-right: 15px;

      &:last-child {
        margin-right: 0;
      }
    }

    & > span {
      margin-left: -15px;
      fill: $white;
      height: 20px;

      & /deep/ svg {
        height: 20px;
      }
    }

    & /deep/ svg {
      height: 26px;
      width: 26px;
    }
  }

  & > .airing-status {
    grid-area: airing-status;
  }

  & > .search {
    grid-area: search;
  }

  & > .sources {
    grid-area: sources;
  }

  & > .text-input,
  & > .number-input {
    width: 100%;

    & /deep/ input {
      &::-webkit-input-placeholder {
        font-weight: 400;
      }
      text-align: center;
    }
  }
}
</style>
