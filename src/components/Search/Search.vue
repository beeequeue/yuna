<template>
<div class="search">
  <input
    placeholder="Search..."
    @focus="isOpen = true"
    @blur="isOpen = false"
    @mouseup.left="selectAllInInput"
    :value="searchString"
    @input="setSearchString"
  />

  <transition name="fade">
    <span
      v-if="isOpen"
      class="fader"
    />
  </transition>

  <div
    class="list"
    :class="{ open: isOpen }"
  >
    <span v-if="isLoading" key="loader" class="loading-spinner">
      <icon :icon="loadingSvg"/>
    </span>

    <div
        v-if="!isLoading && results.length > 0"
        v-for="result in results"
        :key="result.id"
        class="item"
        @mousedown.left="$router.push(`/anime/${result.id}`)"
      >
        <img class="thumbnail" :src="result.coverImage.medium"/>

        <div class="details">
          <div class="title">{{ result.title.userPreferred }}</div>

          <div class="sites">
            <img
              v-if="result.isOnCrunchyroll"
              class="cr"
              :src="crIcon"
            />
          </div>
        </div>
      </div>

    <icon v-if="!isLoading && results.length < 1" :icon="emptySvg" class="empty"/>
  </div>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mdiClose, mdiLoading } from '@mdi/js'

import Icon from '../Icon.vue'
import SEARCH_QUERY from '../../graphql/SearchQuery.graphql'
import {
  SearchQuery,
  SearchQuery_anime_results,
} from '../../graphql/SearchQuery'
import crIcon from '../../assets/crunchyroll.png'

interface Result extends SearchQuery_anime_results {
  isOnCrunchyroll: boolean
}

@Component<Search>({
  components: { Icon },
  apollo: {
    search: {
      query: SEARCH_QUERY,
      variables() {
        return {
          search: this.searchString,
        }
      },
      skip: true,
      deep: true,
      loadingKey: 'isLoading',
      debounce: 750,
      result(result: any) {
        this.handleResults(result.data)
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'network-only',
    },
  },
})
export default class Search extends Vue {
  public isOpen = false
  public isLoading = false
  public searchString = ''
  public results: Result[] = []

  public emptySvg = mdiClose
  public loadingSvg = mdiLoading
  public crIcon = crIcon

  public selectAllInInput(e: MouseEvent) {
    const target = e.currentTarget as HTMLInputElement
    target.select()
  }

  public setSearchString(e: KeyboardEvent) {
    const { value: search } = e.currentTarget as HTMLInputElement
    this.searchString = search

    if (search.length < 1) {
      this.results = []
      this.$apollo.queries.search.stop()
      this.isLoading = false

      return
    }

    this.isLoading = true

    if (this.$apollo.queries.search.skip) {
      this.$apollo.queries.search.start()
    } else {
      this.$apollo.queries.search.refetch()
    }
  }

  public async handleResults(result: SearchQuery) {
    if (!result.anime || !result.anime.results) return

    this.results = result.anime.results
      .filter((r): r is SearchQuery_anime_results => r != null)
      .map(result => {
        return {
          ...result,
          isOnCrunchyroll:
            !!result.streamingEpisodes && result.streamingEpisodes.length > 0,
        }
      })

    setTimeout(() => {
      this.isLoading = false
    }, 250)
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

@keyframes spin {
  from {
    transform: rotateZ(0deg);
  }
  to {
    transform: rotateZ(360deg);
  }
}

.search {
  position: relative;
  display: flex;
  justify-content: stretch;
  align-items: center;
  justify-self: stretch;
  height: 100%;

  & > input {
    width: 100%;
    text-align: center;
    background: none;
    border: none;
    padding: 5px;
    font-size: 1.25em;
    font-weight: 600;
    border-radius: 5px;
    background: darken($highlight, 17.5%);
    color: $white;
    z-index: 2;
  }

  & > .fader {
    position: fixed;
    top: 80px;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.75);
    transition: opacity 0.25s !important;
  }

  & > .list {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    max-height: 0;
    padding-top: 10px;
    overflow: hidden;
    z-index: 1;

    &.open {
      max-height: initial;
    }

    & > .item {
      position: relative;
      display: flex;
      align-items: flex-start;
      min-height: 60px;
      margin: 10px 0;
      border-radius: 5px;
      overflow: hidden;
      box-shadow: $shadow;
      background: darken($highlight, 17.5%);
      cursor: pointer;

      & > .thumbnail {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 20%;
        object-fit: cover;
      }

      & > .details {
        position: relative;
        display: flex;
        flex-direction: column;
        left: 20%;
        width: 80%;
        padding: 8px;
        text-align: left;

        & > * {
          display: flex;
          align-items: center;
          width: 100%;
        }

        & > .title {
          min-height: 20px;
        }

        & > .sites {
          height: 20px;
          justify-content: flex-end;

          & > img {
            height: 20px;
            width: 20px;
          }
        }
      }
    }

    & > .loading-spinner {
      position: relative;
      display: inline-block;
      height: 50px;
      width: 50px;
      padding: 10px 0;
      pointer-events: none;
      fill: $white;
      filter: drop-shadow(1px 2px 3px black);

      & > .icon {
        height: 100%;
        width: 100%;
        animation: spin 1s linear;
        animation-iteration-count: infinite;
      }
    }

    & > .empty {
      height: 50px;
      width: 50px;
      fill: $white;
    }
  }
}
</style>
