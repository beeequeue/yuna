import { MediaListStatus } from '../../graphql-types'
<template>
<transition name="fade">
  <transition-group class="actions" tag="div">
    <raised-button
      v-if="!isOnList || (!isPlanning && !isWatching && !isCompleted && !isDropped)"
      key="addEntry"
      :icon="addToListSvg"
      content="Set as Planning"
      @click.native="addEntryMutation(MediaListStatus.PLANNING)"
    />

    <raised-button
      v-if="isPlanning"
      key="startEntry"
      :icon="addToQueueSvg"
      content="Set as Watching"
      @click.native="statusMutation(MediaListStatus.CURRENT)"
    />

    <raised-button
      v-if="isDropped"
      key="resumeEntry"
      :icon="setToRepeatSvg"
      content="Resume"
      @click.native="statusMutation(MediaListStatus.CURRENT)"
    />

    <div v-if="isWatching" class="multi-button" key="isWatchingProgress">
      <raised-button
        content="+"
        @click.native="progressMutation(mediaListEntry.progress + 1)"
      />

      <raised-button
        content="-"
        @click.native="progressMutation(mediaListEntry.progress - 1)"
      />
    </div>
    <div v-if="isWatching" class="multi-button" key="isWatching">
      <raised-button
        content=""
        @click.native="sendNotImplementedToast"
      />

      <raised-button
        type="danger"
        content="Drop"
        @click.native="statusMutation(MediaListStatus.DROPPED)"
      />
    </div>

    <raised-button
      v-if="isCompleted"
      key="setToRepeating"
      :icon="setToRepeatSvg"
      content="Set as Repeating"
      @click.native="statusMutation(MediaListStatus.REPEATING)"
    />

    <raised-button
      v-if="!isInQueue"
      key="addToQueue"
      :icon="addToQueueSvg"
      content="Add to Queue"
      @click.native="addToQueue"
    />
    <raised-button
      v-else
      key="removeFromQueue"
      :icon="removeFromQueueSvg"
      content="Remove from Queue"
      @click.native="removeFromQueue"
    />

    <raised-button
      v-if="isOnList"
      key="editItem"
      content="Edit"
      @click.native="sendNotImplementedToast"
    />
  </transition-group>
</transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { contains, equals, findIndex, pathOr } from 'rambda'
import {
  mdiPlaylistMinus,
  mdiPlaylistPlay,
  mdiPlaylistPlus,
  mdiRepeat,
} from '@mdi/js'

import RaisedButton from '../RaisedButton.vue'
import { addToQueue, getQueue, removeFromQueue } from '../../state/user'
import { sendErrorToast, sendNotImplementedToast } from '../../state/app'
import { AnimePageQuery_Media_mediaListEntry } from '../../graphql/AnimePageQuery'
import {
  addEntryMutation,
  setProgressMutation,
  setStatusMutation,
} from '../../graphql/mutations'
import { MediaListStatus } from '../../graphql-types'
import { prop } from '../../utils'

@Component({
  components: { RaisedButton },
})
export default class Actions extends Vue {
  @Prop(prop(Number))
  public mediaId!: number | null
  @Prop(prop(Object))
  public mediaListEntry!: AnimePageQuery_Media_mediaListEntry | null

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

  public get isInQueue() {
    return contains(this.mediaId, getQueue(this.$store))
  }

  public sendNotImplementedToast() {
    sendNotImplementedToast(this.$store)
  }

  public async addToQueue() {
    if (!this.mediaId) {
      return sendErrorToast(this.$store, 'No entry found..?')
    }

    if (!this.mediaListEntry) {
      await this.addEntryMutation(MediaListStatus.PLANNING)
    }

    addToQueue(this.$store, this.mediaId)
  }

  public async removeFromQueue() {
    if (!this.mediaId) {
      return sendErrorToast(this.$store, 'No entry found..?')
    }

    removeFromQueue(
      this.$store,
      findIndex(equals(this.mediaId), getQueue(this.$store)),
    )
  }

  public async statusMutation(status: MediaListStatus) {
    if (!this.mediaListEntry) {
      return sendErrorToast(this.$store, 'No entry found..?')
    }

    await setStatusMutation(this.$apollo, this.mediaListEntry.id, status)
  }

  public async progressMutation(progress: number) {
    if (!this.mediaListEntry) {
      return sendErrorToast(this.$store, 'No entry found..?')
    }

    await setProgressMutation(this.$apollo, this.mediaListEntry.id, progress)
  }

  public async addEntryMutation(status: MediaListStatus) {
    if (!this.mediaId) {
      return sendErrorToast(this.$store, 'No entry found..?')
    }

    await addEntryMutation(this.$apollo, this.mediaId, status)
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
