<template>
  <div class="queue-item" :class="{ [`anime-${anime.id}`]: true }">
    <div v-if="listEntry != null" v-tooltip.right="capitalize(status)" class="status">
      <transition name="fade" mode="out-in">
        <icon v-if="iconForStatus" :icon="iconForStatus" />

        <animated-size v-if="isWatching">
          <div class="progress">
            <div class="watched">{{ listEntry.progress }}</div>
            <div class="total">{{ anime.episodes || "?" }}</div>
          </div>
        </animated-size>
      </transition>
    </div>

    <anime-banner :anime="anime" :faded="!isWatching" link />

    <div class="handle-wrapper">
      <icon :icon="hamburgerSvg" class="handle" />
    </div>

    <animated-size class="episodes-container">
      <episode-list
        v-if="item.open"
        :anime="anime"
        :episodes="episodes"
        :loading="episodesLoading !== 0"
        :open="item.open"
        small
        scroll-to-next-episode
      />
    </animated-size>

    <div class="controls">
      <icon
        class="collapser"
        :class="{ flip: item.open }"
        :icon="expandSvg"
        @click.native="toggleItemOpen"
      />

      <source-select
        :anime="anime"
        :current-provider="item.provider"
        :set-provider="setProvider"
        :highlight="highlightSourceSelector"
      />

      <span class="filler" />

      <next-episode-info
        v-if="anime.nextAiringEpisode"
        :next-airing-episode="anime.nextAiringEpisode"
      />

      <div class="buttons">
        <c-button
          v-if="isWatching"
          content="+"
          :disabled="listEntry && listEntry.progress >= anime.episodes"
          :click="incrementProgress"
          class="small"
        />
        <c-button
          v-if="isWatching"
          content="-"
          :disabled="listEntry && listEntry.progress < 1"
          :click="decrementProgress"
          class="small"
        />

        <c-button
          v-if="isStatus(MediaListStatus.Planning)"
          type="success"
          content="Start"
          :click="() => statusMutation(MediaListStatus.Current)"
        />

        <c-button
          v-if="isStatus(MediaListStatus.Paused, MediaListStatus.Dropped)"
          type="success"
          content="Resume"
          :click="() => statusMutation(MediaListStatus.Current)"
        />

        <c-button
          v-if="isStatus(MediaListStatus.Completed)"
          type="success"
          content="Rewatch"
          :click="() => statusMutation(MediaListStatus.Repeating)"
        />

        <c-button
          v-if="isWatching"
          type="warning"
          content="Pause"
          :click="() => statusMutation(MediaListStatus.Paused)"
        />

        <c-button
          v-if="isWatching"
          type="danger"
          content="Drop"
          :click="() => statusMutation(MediaListStatus.Dropped)"
        />

        <c-button
          v-if="!isWatching"
          type="danger"
          content="Remove from Queue"
          :click="removeFromQueue"
        />

        <c-button
          v-if="anime.listEntry"
          :icon="editSvg"
          class="small"
          :click="openEditModal"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { mdiChevronDown, mdiMenu, mdiPencil } from "@mdi/js"

import { EPISODE_LIST } from "@/graphql/documents/queries"
import {
  setProgress,
  startRewatching,
  updateStatus,
} from "@/graphql/mutations/list-entry"
import {
  EpisodeListEpisodes,
  EpisodeListQuery,
  EpisodeListVariables,
  MediaListStatus,
  Provider,
  QueueAnime,
} from "@/graphql/generated/types"

import NextEpisodeInfo from "@/common/components/next-episode-info.vue"
import Icon from "@/common/components/icon.vue"
import AnimeBanner from "@/common/components/anime-banner.vue"
import EpisodeList from "@/common/components/episode-list/episode-list.vue"
import AnimatedSize from "@/common/components/animated-size.vue"
import SourceList from "@/common/components/source-list.vue"
import CButton from "@/common/components/button.vue"
import SourceSelect from "./source-select.vue"

import { Query, Required } from "@/decorators"
import { removeFromQueueById, toggleQueueItemOpen } from "@/state/user"
import { initEditModal, sendErrorToast } from "@/state/app"
import { QueueItem as IQueueItem } from "@/lib/user"
import { capitalize, delay, getIconForStatus, isNil } from "@/utils"
import { CrunchyrollProviders } from "@/types"

@Component({
  components: {
    SourceSelect,
    NextEpisodeInfo,
    CButton,
    SourceList,
    AnimatedSize,
    EpisodeList,
    AnimeBanner,
    Icon,
  },
})
export default class QueueItem extends Vue {
  @Query<QueueItem, EpisodeListQuery, EpisodeListVariables>({
    fetchPolicy: "network-only",
    query: EPISODE_LIST,
    loadingKey: "episodesLoading",
    variables() {
      return {
        id: this.anime.id,
        provider: this.item.provider,
      }
    },
    skip() {
      return !this.anime.id || !this.item.open
    },
    error(err) {
      if (typeof err === "string") {
        this.episodesFetchingError = err.replace("Network error: ", "")
        return
      }

      if (typeof err.message === "string") {
        this.episodesFetchingError = err.message
        return
      }

      this.episodesFetchingError = "Something went wrong fetching the episodes. :("
    },
    async result() {
      if (!isNil(this.episodes) || !CrunchyrollProviders.includes(this.item.provider)) {
        return
      }

      sendErrorToast(
        this.$store,
        "Could not find episodes on Crunchyroll! Try using the manual search!",
      )

      this.highlightSourceSelector = true

      await delay(5000)

      this.highlightSourceSelector = false
    },
  })
  public episodes!: EpisodeListEpisodes[] | null
  public episodesLoading = 0
  public episodesFetchingError: string | null = null

  @Required(Object) public anime!: QueueAnime
  @Required(Object) public item!: IQueueItem
  @Required(Function) public setProvider!: (provider: Provider) => void

  public highlightSourceSelector = false

  public MediaListStatus = MediaListStatus
  public expandSvg = mdiChevronDown
  public hamburgerSvg = mdiMenu
  public editSvg = mdiPencil

  public capitalize = capitalize

  public get listEntry() {
    return this.anime.listEntry ?? null
  }

  public get status() {
    if (isNil(this.listEntry)) return null

    return this.listEntry.status
  }

  public get isWatching() {
    return this.isStatus(MediaListStatus.Current, MediaListStatus.Repeating)
  }

  public get iconForStatus() {
    return getIconForStatus(this.status)
  }

  public toggleItemOpen() {
    toggleQueueItemOpen(this.$store, this.anime.id)
  }

  public setOpenState(newState: boolean) {
    if (this.item.open === newState) return

    this.toggleItemOpen()
  }

  public isStatus(...statuses: MediaListStatus[]) {
    if (isNil(this.status)) return false

    return statuses.includes(this.status)
  }

  public removeFromQueue() {
    removeFromQueueById(this.$store, this.anime.id)
  }

  public async statusMutation(status: MediaListStatus) {
    const listEntryId = this.anime.listEntry?.id

    if (isNil(listEntryId)) {
      return sendErrorToast(this.$store, "No entry found..?")
    }

    switch (status) {
      case MediaListStatus.Current:
      case MediaListStatus.Repeating:
        this.setOpenState(true)
        break
      case MediaListStatus.Completed:
      case MediaListStatus.Dropped:
      case MediaListStatus.Paused:
        this.setOpenState(false)
        break
    }

    try {
      if (status === MediaListStatus.Repeating) {
        return startRewatching(this, this.anime.id)
      }

      await updateStatus(this, this.anime.id, status)
    } catch (err) {
      this.setOpenState(!this.item.open)
    }
  }

  public async incrementProgress() {
    if (isNil(this.listEntry) || isNil(this.listEntry.progress)) {
      return
    }

    return setProgress(this, {
      animeId: this.anime.id,
      provider: Provider.Crunchyroll,
      episodeNumber: this.listEntry.progress + 1,
      ...this.listEntry,
    })
  }

  public async decrementProgress() {
    if (isNil(this.listEntry) || isNil(this.listEntry.progress)) {
      return
    }

    return setProgress(this, {
      animeId: this.anime.id,
      provider: Provider.Crunchyroll,
      episodeNumber: this.listEntry.progress - 1,
      ...this.listEntry,
    })
  }

  public openEditModal() {
    initEditModal(this.$store, {
      animeId: this.anime.id,
      ...(this.anime as any),
    })
  }
}
</script>

<style scoped lang="scss">
@import "../../../colors";

@function gradient($color, $opacity: 0.5) {
  @return linear-gradient(90deg, transparentize($color, $opacity), transparent);
}

.queue-item {
  left: 0;
  position: relative;
  width: 100%;
  margin-bottom: 30px;
  display: inline-block;
  border-radius: 5px;
  box-shadow: 1px 2px 15px rgba(0, 0, 0, 0.5);

  & > .status {
    position: absolute;
    top: 0;
    height: 75px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-weight: 700;
    border-top-left-radius: 5px;
    z-index: 5;

    & > * {
      flex-shrink: 0;
    }

    & .progress {
      padding: 5px 20px 5px 10px;
      text-shadow: $outline-light;
      filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 5px black);

      & > .total {
        margin-top: 3px;
        padding-top: 2px;
        border-top: 1px solid $white;
      }
    }

    & > .icon {
      box-sizing: content-box !important;
      padding-left: 10px;
      padding-right: 20px;
      width: 20px;
      fill: $white;
      filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 5px black);
    }
  }

  & > .anime-banner {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    overflow: hidden;
  }

  & > .handle-wrapper {
    position: absolute;
    top: 0;
    right: 0;
    border-top-right-radius: 5px;
    overflow: hidden;

    & > .handle {
      height: 75px;
      width: 25px;
      padding: 2px;
      background: $dark;
      //noinspection CssInvalidPropertyValue
      cursor: -webkit-grab;
      z-index: 5;

      & ::v-deep svg {
        fill: $highlight;
      }

      transform: translateX(100%);
      transition: transform 0.15s;
    }
  }

  &:hover > .handle-wrapper > .handle {
    transform: none;
  }

  & > .episodes-container {
    position: relative;
    background: $dark;
    width: 100% !important;
  }

  & > .controls {
    display: flex;
    align-items: stretch;
    background: color($dark, 600);
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;

    & > * {
      flex-shrink: 0;
    }

    & > .filler {
      width: 100%;
      flex-shrink: 1;
    }

    & > .collapser {
      height: 32px;
      width: 35px;
      fill: $white;
      padding: 0 5px;
      cursor: pointer;

      & ::v-deep svg {
        transition: transform 0.5s;
      }

      &.flip ::v-deep svg {
        transform: rotateZ(-180deg);
      }
    }

    & > .next-episode-info {
      margin-right: 15px;
    }

    & > .buttons {
      display: flex;
      border-bottom-right-radius: 5px;
      overflow: hidden;

      & > .button {
        min-width: 85px;
        border-radius: 0;

        &.small {
          min-width: 0;
          width: 35px;
        }
      }
    }
  }
}
</style>
