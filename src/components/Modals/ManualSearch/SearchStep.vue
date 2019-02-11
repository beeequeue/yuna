<template>
  <div class="search-step">
    <text-input
      class="search-bar"
      placeholder="..."
      :onChange="handleSearchChange"
    />

    <div class="status">
      <transition name="fade">
        <loading v-if="loading" />
        <icon v-else-if="results && results.length < 1" :icon="emptySvg" />
        <icon v-else :icon="searchSvg" />
      </transition>
    </div>

    <div class="results">
      <anime-banner
        v-for="result in results"
        :key="result.id"
        :anime="{ title: result.title, bannerImage: result.landscapeImage }"
        @click.native="setSelectedId(result.id)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { debounce } from 'rambdax'
import { mdiClose, mdiMagnify } from '@mdi/js'

import TextInput from '@/components/Form/TextInput.vue'
import Loading from '@/components/Loading.vue'
import Icon from '@/components/Icon.vue'
import AnimeBanner from '@/components/AnimeBanner.vue'

import { Provider } from '@/graphql/types'
import { Required } from '@/decorators'
import { Crunchyroll, SearchResult } from '@/lib/crunchyroll'

@Component({ components: { Icon, AnimeBanner, Loading, TextInput } })
export default class SearchStep extends Vue {
  @Required(String) provider!: Provider
  @Required(Function) setSelectedId!: (id: number | null) => void

  public searchString = ''
  public loading = false
  public results: SearchResult[] | null = null

  public searchSvg = mdiMagnify
  public emptySvg = mdiClose

  public handleSearchChange(value: string) {
    this.loading = true
    this.searchString = value

    if (this.searchString.length > 2) {
      this.debouncedSearch()
    } else {
      this.loading = false
    }
  }

  public debouncedSearch = debounce(this.search, 750)

  public async search() {
    this.loading = true

    if (this.provider === Provider.Crunchyroll) {
      this.results = await Crunchyroll.searchByString(this.searchString)
    }

    this.loading = false
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.search-step {
  position: relative;
  width: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  & > .search-bar {
    font-family: 'Raleway', sans-serif;
    font-size: 1.15em;
    width: 100%;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom: 1px solid color($dark, 300);

    & /deep/ input {
      text-align: center;
      background: color($dark, 500);
      border: none;
    }
  }

  & > .status {
    display: flex;
    align-items: center;
    position: absolute;
    top: 0;
    right: 5px;
    height: 30px;
    width: 30px;
    padding: 5px;

    & > .icon {
      fill: $gray;
      display: flex;
      align-items: center;
    }
  }

  & > .results {
    position: relative;
    width: 100%;
    max-height: 500px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    overflow: auto;

    & > .anime-banner {
      display: flex;
      cursor: pointer;
    }
  }
}
</style>
