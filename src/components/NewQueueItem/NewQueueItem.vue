<template>
  <div class="queue-item">
    <icon :icon="hamburgerSvg" class="handle" />

    <anime-banner :anime="anime" :faded="!isWatching" />

    <animated-height class="episodes-container">
      <transition>
        <queue-episode-list
          v-if="open"
          :anime="anime"
          :episodes="episodes"
          :loading="episodesLoading !== 0"
        />
      </transition>
    </animated-height>

    <div class="controls">
      <icon
        class="collapser"
        :class="{ flip: open }"
        :icon="expandSvg"
        @click.native="toggleItemOpen"
      />

      <span class="filler" />

      <next-episode-info
        v-if="anime.nextAiringEpisode"
        :nextAiringEpisode="anime.nextAiringEpisode"
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
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { isNil, path, pathOr } from 'rambdax'
import { mdiChevronDown, mdiMenu } from '@mdi/js'

import {
  rewatchMutation,
  setEpisodeUnwatched,
  setEpisodeWatched,
  setStatusMutation,
} from '@/graphql/mutations'
import EPISODE_LIST from '@/graphql/EpisodeList.graphql'
import {
  EpisodeListEpisodes,
  EpisodeListQuery,
  EpisodeListVariables,
  MediaListStatus,
  Provider,
  QueueAnime,
  QueueMediaListEntry,
} from '@/graphql/types'

import Icon from '@/components/Icon.vue'
import AnimeBanner from '@/components/AnimeBanner.vue'
import EpisodeList from '@/components/EpisodeList.vue'
import QueueEpisodeList from '@/components/NewQueueItem/QueueEpisodeList.vue'
import AnimatedHeight from '@/components/AnimatedHeight.vue'
import SourceList from '@/components/SourceList.vue'
import Loading from '@/components/NewQueueItem/Loading.vue'
import NextEpisodeInfo from '@/components/Anime/NextEpisodeInfo.vue'
import CButton from '@/components/CButton.vue'

import { Query, Required } from '@/decorators'
import { removeFromQueueById, toggleQueueItemOpen } from '@/state/user'
import { sendErrorToast } from '@/state/app'

@Component({
  components: {
    NextEpisodeInfo,
    CButton,
    Loading,
    SourceList,
    AnimatedHeight,
    QueueEpisodeList,
    EpisodeList,
    AnimeBanner,
    Icon,
  },
})
export default class NewQueueItem extends Vue {
  @Query<QueueEpisodeList, EpisodeListQuery, EpisodeListVariables>({
    fetchPolicy: 'network-only',
    query: EPISODE_LIST,
    loadingKey: 'episodesLoading',
    variables() {
      return {
        id: this.anime.id,
      }
    },
    skip() {
      return !this.anime.id || !this.open
    },
    error(err) {
      if (typeof err === 'string') {
        this.episodesFetchingError = err.replace('Network error: ', '')
        return
      }

      if (typeof err.message === 'string') {
        this.episodesFetchingError = err.message
        return
      }

      this.episodesFetchingError =
        'Something went wrong fetching the episodes. :('
    },
  })
  public episodes!: EpisodeListEpisodes[] | null
  public episodesLoading = 0
  public episodesFetchingError: string | null = null

  @Required(Object) public anime!: QueueAnime
  @Required(Boolean) public open!: boolean

  public MediaListStatus = MediaListStatus
  public expandSvg = mdiChevronDown
  public hamburgerSvg = mdiMenu

  public get listEntry() {
    return pathOr(
      null,
      ['mediaListEntry'],
      this.anime,
    ) as QueueMediaListEntry | null
  }

  public get isWatching() {
    return this.isStatus(MediaListStatus.Current, MediaListStatus.Repeating)
  }

  public toggleItemOpen() {
    toggleQueueItemOpen(this.$store, this.anime.id)
  }

  public setOpenState(newState: boolean) {
    if (this.open === newState) return

    this.toggleItemOpen()
  }

  public isStatus(...statuses: MediaListStatus[]) {
    return statuses.includes(
      path<MediaListStatus>(['mediaListEntry', 'status'], this.anime),
    )
  }

  public removeFromQueue() {
    removeFromQueueById(this.$store, this.anime.id)
  }

  public async statusMutation(status: MediaListStatus) {
    const listEntryId = path<number>('mediaListEntry.id', this.anime)

    if (!listEntryId) {
      return sendErrorToast(this.$store, 'No entry found..?')
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

    if (status === MediaListStatus.Repeating) {
      return rewatchMutation(this, listEntryId)
    }

    await setStatusMutation(this, listEntryId, status)
  }

  public async incrementProgress() {
    if (isNil(this.listEntry) || isNil(this.listEntry.progress)) {
      return
    }

    return setEpisodeWatched(
      this,
      {
        animeId: this.anime.id,
        provider: Provider.Crunchyroll,
        episodeNumber: this.listEntry.progress + 1,
      },
      this.listEntry,
    )
  }

  public async decrementProgress() {
    if (isNil(this.listEntry) || isNil(this.listEntry.progress)) {
      return
    }

    return setEpisodeUnwatched(
      this,
      {
        animeId: this.anime.id,
        provider: Provider.Crunchyroll,
        episodeNumber: this.listEntry.progress,
      },
      this.listEntry,
    )
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.queue-item {
  left: 0;
  position: relative;
  width: 100%;
  margin-bottom: 30px;
  display: inline-block;
  border-radius: 5px;
  box-shadow: 1px 2px 15px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: 2;

  & > .handle {
    position: absolute;
    top: 0;
    right: 0;
    height: 75px;
    width: 25px;
    padding: 2px;
    background: $dark;
    cursor: -webkit-grab;
    z-index: 5;

    & /deep/ svg {
      fill: $highlight;
    }

    transform: translateX(100%);
    transition: transform 0.15s;
  }

  &:hover > .handle {
    transform: none;
  }

  & > .episodes-container {
    position: relative;
    background: $dark;
  }

  & > .controls {
    display: flex;
    align-items: center;
    background: lighten($dark, 5%);

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

      & /deep/ svg {
        transition: transform 0.5s;
      }

      &.flip /deep/ svg {
        transform: rotateZ(-180deg);
      }
    }

    & > .next-episode-info {
      margin-right: 15px;
    }

    & > .buttons {
      display: flex;

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
