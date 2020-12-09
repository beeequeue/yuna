<template>
  <div class="search">
    <input
      ref="searchbar"
      placeholder="Search..."
      :value="searchString"
      @focus="isOpen = true"
      @blur="isOpen = false"
      @mouseup.left="selectAllInInput"
      @input="setSearchString"
      @keydown.esc.capture="$refs.searchbar.blur()"
    />

    <transition name="fade"> <span v-if="isOpen" class="fader" /> </transition>

    <div class="list" :class="{ open: isOpen }">
      <span v-if="fakeLoading" key="loader" class="loading-spinner">
        <icon :icon="loadingSvg" />
      </span>

      <div
        v-for="result in results"
        :key="result.id"
        class="item"
        @mousedown.left="$router.push(`/anime/${result.id}`)"
      >
        <img class="thumbnail" :src="result.coverImage.medium" />

        <div class="details">
          <div class="title">{{ result.title.userPreferred }}</div>
        </div>
      </div>

      <icon
        v-if="!fakeLoading && results.length < 1"
        :icon="emptySvg"
        class="empty"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { mdiClose, mdiLoading } from "@mdi/js"

import SEARCH_QUERY from "./search.graphql"
import {
  SearchQuery,
  SearchResults,
  SearchVariables,
} from "@/graphql/generated/types"

import { Query } from "@/decorators"

import Icon from "@/common/components/icon.vue"
import { isNotNil } from "@/utils"
@Component({ components: { Icon } })
export default class Search extends Vue {
  @Query<Search, SearchQuery, SearchVariables>({
    query: SEARCH_QUERY,
    variables(): SearchVariables {
      return {
        search: this.searchString,
      }
    },
    skip() {
      return this.searchString.length < 1
    },
    ["debounce" as any]: 750,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
    result() {
      this.onFinish()
    },
  })
  public search: SearchQuery | null = null

  public isOpen = false
  public fakeLoading = false
  public searchString = ""

  public emptySvg = mdiClose
  public loadingSvg = mdiLoading

  public get results(): SearchResults[] {
    return this.search?.anime?.results?.filter(isNotNil) ?? []
  }

  public selectAllInInput(e: MouseEvent) {
    const target = e.currentTarget as HTMLInputElement
    target.select()
  }

  public setSearchString(e: KeyboardEvent) {
    const { value: search } = e.currentTarget as HTMLInputElement
    this.searchString = search
    this.fakeLoading = true
  }

  public onFinish() {
    this.fakeLoading = false
  }
}
</script>

<style scoped lang="scss">
@import "../../colors";

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
    background: $main;
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
      background: color($main, 200);
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
