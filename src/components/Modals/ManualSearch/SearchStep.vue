<template>
  <div class="search-step">
    <text-input
      class="search-bar"
      placeholder="..."
      :onChange="handleSearchChange"
    />

    <transition name="fade">
      <loading v-if="loading" />
      <div v-else class="results">
        <anime-banner
          v-for="result in results"
          :key="result.id"
          :anime="{ title: result.title, bannerImage: result.landscapeImage }"
        />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { debounce } from 'rambdax'

import TextInput from '@/components/Form/TextInput.vue'
import Loading from '@/components/QueueItem/Loading.vue'

import { Crunchyroll, SearchResult } from '@/lib/crunchyroll'
import AnimeBanner from '@/components/AnimeBanner.vue'

@Component({ components: { AnimeBanner, Loading, TextInput } })
export default class SearchStep extends Vue {
  public searchString = ''
  public loading = false
  public results: SearchResult[] = []

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
    this.results = await Crunchyroll.searchByString(this.searchString)
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

  & > .loading {
    position: relative;

    &.v-leave-to {
      position: absolute;
    }
  }

  & > .results {
    position: relative;
    width: 100%;

    & > .result {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 50px;
      margin-bottom: 10px;
      overflow: hidden;

      & > .title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 1.25em;
        font-family: 'Raleway', sans-serif;
      }
    }

    &:last-child {
      margin-bottom: 0;
    }

    & > img {
      flex-shrink: 0;
      display: block;
      height: 100%;
      width: 150px;
      object-fit: cover;
      margin-right: 15px;
    }
  }
}
</style>
