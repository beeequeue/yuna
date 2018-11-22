<template>
<transition name="fade">
  <transition-group class="actions" tag="div">
    <c-button
      v-if="!isOnList || (!isPlanning && !isWatching && !isCompleted && !isDropped && !isPaused)"
      key="addEntry"
      :icon="addToListSvg"
      content="Set as Planning"
      @click.native="addEntryMutation(MediaListStatus.PLANNING)"
    />

    <c-button
      v-if="isPlanning"
      key="startEntry"
      :icon="addToQueueSvg"
      content="Set as Watching"
      @click.native="statusMutation(MediaListStatus.CURRENT)"
    />

    <c-button
      v-if="isDropped || isPaused"
      key="resumeEntry"
      :icon="setToRepeatSvg"
      content="Resume"
      @click.native="statusMutation(MediaListStatus.CURRENT)"
    />

    <div v-if="isWatching" class="multi-button" key="isWatching">
      <c-button
        type="warning"
        content="Pause"
        @click.native="statusMutation(MediaListStatus.PAUSED)"
      />

      <c-button
        type="danger"
        content="Drop"
        @click.native="statusMutation(MediaListStatus.DROPPED)"
      />
    </div>

    <c-button
      v-if="isCompleted"
      key="setToRepeating"
      :icon="setToRepeatSvg"
      content="Set as Repeating"
      @click.native="statusMutation(MediaListStatus.REPEATING)"
    />

    <c-button
      v-if="!isInQueue"
      key="addToQueue"
      :icon="addToQueueSvg"
      content="Add to Queue"
      @click.native="addToQueue"
    />
    <c-button
      v-else
      key="removeFromQueue"
      :icon="removeFromQueueSvg"
      content="Remove from Queue"
      @click.native="removeFromQueueByIndex"
    />

    <c-button
      v-if="isOnList"
      key="editItem"
      content="Edit"
      :click="editAnime"
    />
  </transition-group>
</transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { contains, equals, findIndex, pathOr } from 'rambdax'
import {
  mdiPlaylistMinus,
  mdiPlaylistPlay,
  mdiPlaylistPlus,
  mdiRepeat,
} from '@mdi/js'

import { addToQueue, getQueue, removeFromQueueByIndex } from '@/state/user'
import {
  sendErrorToast,
  sendNotImplementedToast,
  initEditModal,
} from '@/state/app'
import {
  AnimePageQuery_anime_mediaListEntry,
  AnimePageQuery_anime,
} from '@/graphql/AnimePageQuery'
import { addEntryMutation, setStatusMutation } from '@/graphql/mutations'
import { MediaListStatus } from '@/graphql-types'
import { prop } from '@/utils'

import CButton from '../CButton.vue'

@Component({
  components: { CButton },
})
export default class Actions extends Vue {
  @Prop(prop(Object))
  public mediaListEntry!: AnimePageQuery_anime_mediaListEntry | null
  @Prop(prop(Object))
  public anime!: AnimePageQuery_anime | null

  public get mediaListStatus(): MediaListStatus | null {
    return pathOr(null, ['status'], this.mediaListEntry)
  }

  public MediaListStatus = MediaListStatus
  public addToListSvg = mdiPlaylistPlus
  public addToQueueSvg = mdiPlaylistPlay
  public removeFromQueueSvg = mdiPlaylistMinus
  public setToRepeatSvg = mdiRepeat

  public get id() {
    return Number(this.$route.params.id)
  }

  public get isOnList() {
    return this.mediaListStatus != null
  }

  public get isPlanning() {
    return this.mediaListStatus === MediaListStatus.PLANNING
  }

  public get isWatching() {
    return [MediaListStatus.CURRENT, MediaListStatus.REPEATING].includes(this
      .mediaListStatus as MediaListStatus)
  }

  public get isCompleted() {
    return this.mediaListStatus === MediaListStatus.COMPLETED
  }

  public get isDropped() {
    return this.mediaListStatus === MediaListStatus.DROPPED
  }

  public get isPaused() {
    return this.mediaListStatus === MediaListStatus.PAUSED
  }

  public get isInQueue() {
    if (!this.anime) return false

    return contains(this.anime.id, getQueue(this.$store))
  }

  public editAnime() {
    if (!this.anime) return

    initEditModal(this.$store, this.anime as any)
  }

  public sendNotImplementedToast() {
    sendNotImplementedToast(this.$store)
  }

  public async addToQueue() {
    if (!this.anime) {
      return sendErrorToast(this.$store, 'No anime found..?')
    }

    if (!this.mediaListEntry) {
      await this.addEntryMutation(MediaListStatus.PLANNING)
    }

    addToQueue(this.$store, this.anime.id)
  }

  public async removeFromQueue() {
    if (!this.anime) {
      return sendErrorToast(this.$store, 'No anime found..?')
    }

    removeFromQueueByIndex(
      this.$store,
      findIndex(equals(this.anime.id), getQueue(this.$store)),
    )
  }

  public async statusMutation(status: MediaListStatus) {
    if (!this.mediaListEntry) {
      return sendErrorToast(this.$store, 'No entry found..?')
    }

    await setStatusMutation(this.$apollo, this.mediaListEntry.id, status)
  }

  public async addEntryMutation(status: MediaListStatus) {
    if (!this.anime) {
      return sendErrorToast(this.$store, 'No anime found..?')
    }

    await addEntryMutation(this.$apollo, this.anime.id, status)
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.actions {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;

  & > .button,
  & > .multi-button {
    margin-bottom: 10px;
    box-shadow: $shadow;
    will-change: transform, opacity;

    &.v-move,
    &.v-enter-active {
      transition: transform 0.5s, opacity 0.5s;
    }

    &.v-leave-active {
      display: none;
      position: absolute;
      transition: none;
    }

    &.v-enter {
      transform: translateX(-100%);
      opacity: 0;
    }
  }

  & > .multi-button {
    display: flex;
    justify-content: space-between;

    & > .button {
      width: 100%;

      &:first-child {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      &:last-child {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
  }
}
</style>
