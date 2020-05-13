<template>
  <transition name="fade">
    <transition-group tag="div" class="actions" :class="{ small, horizontal }">
      <c-button
        v-if="
          !isOnList ||
          (!isPlanning &&
            !isWatching &&
            !isCompleted &&
            !isDropped &&
            !isPaused)
        "
        :key="ActionKeys.ADD"
        v-tooltip="getTooltip('Set as Planning')"
        :icon="mdiPlaylistPlus"
        :content="ifBig('Set as Planning')"
        :click="() => createListEntry()"
      />

      <c-button
        v-if="isPlanning"
        :key="ActionKeys.START"
        v-tooltip="getTooltip('Set as Watching')"
        type="success"
        :icon="mdiPlay"
        :content="ifBig('Set as Watching')"
        :click="() => statusMutation(MediaListStatus.Current)"
      />

      <c-button
        v-if="isDropped || isPaused"
        :key="ActionKeys.RESUME"
        v-tooltip="getTooltip('Resume')"
        :icon="mdiRepeat"
        type="success"
        :content="ifBig('Resume')"
        :click="() => statusMutation(MediaListStatus.Current)"
      />

      <div
        v-if="isWatching && ifBig(true)"
        key="isWatching"
        class="multi-button"
      >
        <c-button
          v-tooltip="getTooltip('Pause')"
          :icon="mdiPause"
          type="warning"
          :content="ifBig('Pause')"
          :click="() => statusMutation(MediaListStatus.Paused)"
        />

        <c-button
          v-tooltip="getTooltip('Drop')"
          :icon="mdiClose"
          type="danger"
          :content="ifBig('Drop')"
          :click="() => statusMutation(MediaListStatus.Dropped)"
        />
      </div>

      <c-button
        v-if="ifBig(false, true) && isWatching"
        :key="ActionKeys.PAUSE"
        v-tooltip="getTooltip('Pause')"
        :icon="mdiPause"
        type="warning"
        :content="ifBig('Pause')"
        :click="() => statusMutation(MediaListStatus.Paused)"
      />

      <c-button
        v-if="ifBig(false, true) && isWatching"
        :key="ActionKeys.DROP"
        v-tooltip="getTooltip('Drop')"
        :icon="mdiClose"
        type="danger"
        :content="ifBig('Drop')"
        :click="() => statusMutation(MediaListStatus.Dropped)"
      />

      <c-button
        v-if="isCompleted"
        :key="ActionKeys.REPEAT"
        v-tooltip="getTooltip('Rewatch')"
        type="success"
        :icon="mdiRepeat"
        :content="ifBig('Rewatch')"
        :click="() => statusMutation(MediaListStatus.Repeating)"
      />

      <c-button
        v-if="!isInQueue"
        :key="ActionKeys.ADD_QUEUE"
        v-tooltip="getTooltip('Add to Queue')"
        :icon="mdiPlaylistPlay"
        :content="ifBig('Add to Queue')"
        :click="addToQueue"
      />
      <c-button
        v-else
        :key="ActionKeys.REMOVE_QUEUE"
        v-tooltip="getTooltip('Remove from Queue')"
        :icon="mdiPlaylistMinus"
        :content="ifBig('Remove from Queue')"
        :click="removeFromQueue"
      />

      <c-button
        v-if="isOnList"
        :key="ActionKeys.EDIT"
        v-tooltip="getTooltip('Edit')"
        :icon="mdiPencil"
        :content="ifBig('Edit')"
        :click="editAnime"
      />
    </transition-group>
  </transition>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
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
} from '@/graphql/mutations/list-entry'
import {
  AnimeViewAnime,
  AnimeViewListEntry,
  MediaListStatus,
} from '@/graphql/generated/types'
import {
  addToQueue as _addToQueue,
  getIsInQueue,
  getQueue,
  removeFromQueueByIndex,
} from '@/state/user'
import { initEditModal, sendErrorToast } from '@/state/app'
import { getSettings } from '@/state/settings'
import { isNil, propEq } from '@/utils'

import CButton from '@/common/components/button.vue'
import { TooltipSettings } from 'v-tooltip'
import { Maybe } from '@/types'

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

type Props = {
  listEntry: Maybe<AnimeViewListEntry>
  anime: Maybe<AnimeViewAnime>
  small: Maybe<boolean>
  horizontal: Maybe<boolean>
}

export default defineComponent<Props>({
  components: { CButton },
  props: {
    anime: Object,
    listEntry: Object,
    small: Boolean,
    horizontal: { type: Boolean },
  },
  setup: (props, { root }) => {
    const isInQueue = computed(
      () => !isNil(props.anime) && getIsInQueue(root.$store)(props.anime.id),
    )
    const shouldAddToListAsWell = computed(
      () => getSettings(root.$store).autoMarkAsPlanning,
    )

    const mediaListStatus = computed(() => props.listEntry?.status ?? null)

    const statusIs = (...statuses: MediaListStatus[]) =>
      statuses.includes(mediaListStatus.value!)

    const ifBig = <T1, T2>(bigValue: T1, smallValue?: T2) =>
      props.small !== true ? bigValue : smallValue

    const getTooltip = (content: string): TooltipSettings | false => {
      if (!props.small) return false

      return {
        content,
        placement: props.horizontal ? 'top' : 'right',
      }
    }

    const editAnime = () => {
      if (isNil(props.anime) || isNil(props.listEntry)) return

      initEditModal(root.$store, {
        animeId: props.anime.id,
        title: props.anime?.title?.userPreferred ?? 'MISSING_TITLE',
        episodes: props.anime.episodes,
        bannerImage: props.anime?.bannerImage ?? '',
        listEntry: props.listEntry,
      })
    }

    const createListEntry = async () => {
      if (!props.anime) {
        return sendErrorToast(root.$store, 'No anime found..?')
      }

      await addToList(root, props.anime.id)
    }

    const addToQueue = async () => {
      if (!props.anime) {
        return sendErrorToast(root.$store, 'No anime found..?')
      }

      if (!props.listEntry && shouldAddToListAsWell.value) {
        await createListEntry()
      }

      _addToQueue(root.$store, props.anime)
    }

    const removeFromQueue = () => {
      if (!props.anime) {
        return sendErrorToast(root.$store, 'No anime found..?')
      }

      const index = getQueue(root.$store).findIndex(
        propEq('id', props.anime.id),
      )

      removeFromQueueByIndex(root.$store, index)
    }

    const statusMutation = async (status: MediaListStatus) => {
      if (!props.anime) {
        return sendErrorToast(root.$store, 'No anime found..?')
      }

      if (status === MediaListStatus.Repeating) {
        return startRewatching(root, props.anime.id)
      }

      await updateStatus(root, props.anime.id, status)
    }

    return {
      // Computed
      mediaListStatus,
      isOnList: mediaListStatus.value != null,
      isPlanning: statusIs(MediaListStatus.Planning),
      isWatching: statusIs(MediaListStatus.Current, MediaListStatus.Repeating),
      isCompleted: statusIs(MediaListStatus.Completed),
      isDropped: statusIs(MediaListStatus.Dropped),
      isPaused: statusIs(MediaListStatus.Paused),
      isInQueue,
      shouldAddToListAsWell,

      // Util funcs
      ifBig,
      getTooltip,

      // Actions
      editAnime,
      createListEntry,
      addToQueue,
      removeFromQueue,
      statusMutation,

      // Constants
      ActionKeys,
      MediaListStatus,

      // Icons
      mdiPlaylistPlus,
      mdiPlaylistPlay,
      mdiPlaylistMinus,
      mdiRepeat,
      mdiPlay,
      mdiPause,
      mdiClose,
      mdiPencil,
    }
  },
})
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

  &.horizontal {
    flex-direction: row;

    & > .button,
    & > .multi-button {
      &.v-enter {
        transform: translateY(100%);
      }
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
