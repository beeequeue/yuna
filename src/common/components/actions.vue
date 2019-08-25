<template>
  <transition name="fade">
    <transition-group tag="div" class="actions" :class="{ small }">
      <c-button
        v-if="
          (isNotExcluded(ActionKeys.ADD) && !isOnList) ||
            (!isPlanning &&
              !isWatching &&
              !isCompleted &&
              !isDropped &&
              !isPaused)
        "
        :key="ActionKeys.ADD"
        :icon="addToListSvg"
        :content="ifBig('Set as Planning')"
        v-tooltip.right="ifSmall('Set as Planning')"
        :click="() => createListEntry()"
      />

      <c-button
        v-if="isPlanning && isNotExcluded(ActionKeys.START)"
        :key="ActionKeys.START"
        type="success"
        :icon="setCurrentSvg"
        :content="ifBig('Set as Watching')"
        v-tooltip.right="ifSmall('Set as Watching')"
        :click="() => statusMutation(MediaListStatus.Current)"
      />

      <c-button
        v-if="isDropped || (isPaused && isNotExcluded(ActionKeys.RESUME))"
        :key="ActionKeys.RESUME"
        :icon="setToRepeatSvg"
        type="success"
        :content="ifBig('Resume')"
        v-tooltip.right="ifSmall('Resume')"
        :click="() => statusMutation(MediaListStatus.Current)"
      />

      <div
        v-if="isWatching && ifBig(true)"
        class="multi-button"
        key="isWatching"
      >
        <c-button
          v-if="isNotExcluded(ActionKeys.PAUSE)"
          :icon="pauseSvg"
          type="warning"
          :content="ifBig('Pause')"
          v-tooltip.right="ifSmall('Pause')"
          :click="() => statusMutation(MediaListStatus.Paused)"
        />

        <c-button
          v-if="isNotExcluded(ActionKeys.DROP)"
          :icon="dropSvg"
          type="danger"
          :content="ifBig('Drop')"
          v-tooltip.right="ifSmall('Drop')"
          :click="() => statusMutation(MediaListStatus.Dropped)"
        />
      </div>

      <c-button
        v-if="ifSmall(true) && isWatching && isNotExcluded(ActionKeys.PAUSE)"
        :key="ActionKeys.PAUSE"
        :icon="pauseSvg"
        type="warning"
        :content="ifBig('Pause')"
        v-tooltip.right="ifSmall('Pause')"
        :click="() => statusMutation(MediaListStatus.Paused)"
      />

      <c-button
        v-if="ifSmall(true) && isWatching && isNotExcluded(ActionKeys.DROP)"
        :icon="dropSvg"
        :key="ActionKeys.DROP"
        type="danger"
        :content="ifBig('Drop')"
        v-tooltip.right="ifSmall('Drop')"
        :click="() => statusMutation(MediaListStatus.Dropped)"
      />

      <c-button
        v-if="isCompleted && isNotExcluded(ActionKeys.REPEAT)"
        :key="ActionKeys.REPEAT"
        type="success"
        :icon="setToRepeatSvg"
        :content="ifBig('Rewatch')"
        v-tooltip.right="ifSmall('Rewatch')"
        :click="() => statusMutation(MediaListStatus.Repeating)"
      />

      <c-button
        v-if="!isInQueue && isNotExcluded(ActionKeys.ADD_QUEUE)"
        :key="ActionKeys.ADD_QUEUE"
        :icon="addToQueueSvg"
        :content="ifBig('Add to Queue')"
        v-tooltip.right="ifSmall('Add to Queue')"
        :click="addToQueue"
      />
      <c-button
        v-else-if="isNotExcluded(ActionKeys.REMOVE_QUEUE)"
        :key="ActionKeys.REMOVE_QUEUE"
        :icon="removeFromQueueSvg"
        :content="ifBig('Remove from Queue')"
        v-tooltip.right="ifSmall('Remove from Queue')"
        :click="removeFromQueue"
      />

      <c-button
        v-if="isOnList && isNotExcluded(ActionKeys.EDIT)"
        :key="ActionKeys.EDIT"
        :icon="editSvg"
        :content="ifBig('Edit')"
        v-tooltip.right="ifSmall('Edit')"
        :click="editAnime"
      />
    </transition-group>
  </transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { oc } from 'ts-optchain'
import {
  mdiClose,
  mdiPause,
  mdiPencil,
  mdiPlay,
  mdiPlaylistMinus,
  mdiPlaylistPlay,
  mdiPlaylistPlus,
  mdiRepeat,
} from '@mdi/js'

import {
  addToList,
  startRewatching,
  updateStatus,
} from '@/common/mutations/list-entry'
import {
  AnimeViewAnime,
  AnimeViewMediaListEntry,
  MediaListStatus,
} from '@/graphql/types'

import { getAnilistUserId } from '@/state/auth'
import {
  addToQueue,
  getIsInQueue,
  getQueue,
  removeFromQueueByIndex,
} from '@/state/user'
import { initEditModal, sendErrorToast } from '@/state/app'
import { getSettings } from '@/state/settings'
import { isNil, propEq } from '@/utils'

import CButton from '@/common/components/button.vue'

export enum ActionKeys {
  ADD = 'addEntry',
  START = 'startEntry',
  RESUME = 'resumeEntry',
  PAUSE = 'pauseEntry',
  DROP = 'dropEntry',
  REPEAT = 'repeatEntry',
  ADD_QUEUE = 'addToQueue',
  REMOVE_QUEUE = 'removeFromQueue',
  EDIT = 'editEntry',
}

@Component({
  components: { CButton },
})
export default class Actions extends Vue {
  @Prop(Object) public mediaListEntry!: AnimeViewMediaListEntry | null
  @Prop(Object) public anime!: AnimeViewAnime | null
  @Prop(Boolean) public small!: boolean | null
  @Prop({ type: Array, default: () => [] })
  public exclude!: string[]

  public get mediaListStatus(): MediaListStatus | null {
    return oc(this.mediaListEntry).status(null)!
  }

  public ActionKeys = ActionKeys
  public MediaListStatus = MediaListStatus
  public addToListSvg = mdiPlaylistPlus
  public addToQueueSvg = mdiPlaylistPlay
  public removeFromQueueSvg = mdiPlaylistMinus
  public setToRepeatSvg = mdiRepeat
  public setCurrentSvg = mdiPlay
  public pauseSvg = mdiPause
  public dropSvg = mdiClose
  public editSvg = mdiPencil

  public get userId() {
    return getAnilistUserId(this.$store)
  }

  public get isOnList() {
    return this.mediaListStatus != null
  }

  public get isPlanning() {
    return this.mediaListStatus === MediaListStatus.Planning
  }

  public get isWatching() {
    return [MediaListStatus.Current, MediaListStatus.Repeating].includes(this
      .mediaListStatus as MediaListStatus)
  }

  public get isCompleted() {
    return this.mediaListStatus === MediaListStatus.Completed
  }

  public get isDropped() {
    return this.mediaListStatus === MediaListStatus.Dropped
  }

  public get isPaused() {
    return this.mediaListStatus === MediaListStatus.Paused
  }

  public get isInQueue() {
    if (isNil(this.anime)) return false

    return getIsInQueue(this.$store)(this.anime.id)
  }

  public get shouldAddToListAsWell() {
    return getSettings(this.$store).autoMarkAsPlanning
  }

  public isNotExcluded(key: string) {
    return !this.exclude.includes(key)
  }

  public ifBig(value: any) {
    return !this.small ? value : null
  }

  public ifSmall(value: any) {
    return this.small ? value : null
  }

  public editAnime() {
    if (!this.anime) return

    initEditModal(this.$store, this.anime as any)
  }

  public async addToQueue() {
    if (!this.anime) {
      return sendErrorToast(this.$store, 'No anime found..?')
    }

    if (!this.mediaListEntry && this.shouldAddToListAsWell) {
      await this.createListEntry()
    }

    addToQueue(this.$store, this.anime as any)
  }

  public async removeFromQueue() {
    if (!this.anime) {
      return sendErrorToast(this.$store, 'No anime found..?')
    }

    const index = getQueue(this.$store).findIndex(propEq('id', this.anime.id))

    removeFromQueueByIndex(this.$store, index)
  }

  public async statusMutation(status: MediaListStatus) {
    if (!this.anime) {
      return sendErrorToast(this.$store, 'No anime found..?')
    }

    if (status === MediaListStatus.Repeating) {
      return startRewatching(this, this.anime.id)
    }

    await updateStatus(this, this.anime.id, status)
  }

  public async createListEntry() {
    if (!this.anime) {
      return sendErrorToast(this.$store, 'No anime found..?')
    }

    await addToList(this, this.anime.id)
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
    border-radius: 5px;
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

  &.small {
    & > .button,
    & > .multi-button {
      margin-bottom: 0;
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
