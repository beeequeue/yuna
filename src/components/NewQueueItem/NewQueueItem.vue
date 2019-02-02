<template>
  <div class="queue-item">
    <icon :icon="hamburgerSvg" class="handle" />

    <anime-banner :anime="anime" :faded="!isWatching" />

    <animated-height class="episodes-container">
      <transition>
        <queue-episode-list v-if="open" :anime="anime" />
      </transition>
    </animated-height>

    <div class="controls">
      <icon
        class="collapser"
        :class="{ flip: open }"
        :icon="expandSvg"
        @click.native="toggleItemOpen"
      />

      <div class="buttons">
        <c-button
          v-if="getIsStatus(MediaListStatus.Planning)"
          type="success"
          content="Start"
          @click.native="statusMutation(MediaListStatus.Current)"
        />

        <c-button
          v-if="getIsStatus(MediaListStatus.Paused, MediaListStatus.Dropped)"
          type="success"
          content="Resume"
          @click.native="statusMutation(MediaListStatus.Current)"
        />

        <c-button
          v-if="getIsStatus(MediaListStatus.Completed)"
          type="success"
          content="Rewatch"
          @click.native="statusMutation(MediaListStatus.Repeating)"
        />

        <c-button
          v-if="getIsStatus(MediaListStatus.Current, MediaListStatus.Repeating)"
          type="warning"
          content="Pause"
          @click.native="statusMutation(MediaListStatus.Paused)"
        />

        <c-button
          v-if="getIsStatus(MediaListStatus.Current, MediaListStatus.Repeating)"
          type="danger"
          content="Drop"
          @click.native="statusMutation(MediaListStatus.Dropped)"
        />

        <c-button
          v-if="
            !getIsStatus(MediaListStatus.Current, MediaListStatus.Repeating)
          "
          class="large"
          content="Remove from Queue"
          @click.native="removeFromQueue"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { path } from 'rambdax'
import { mdiChevronDown, mdiMenu } from '@mdi/js'
import { MediaListStatus, QueueAnime } from '@/graphql/types'

import Icon from '@/components/Icon.vue'
import AnimeBanner from '@/components/AnimeBanner.vue'
import EpisodeList from '@/components/EpisodeList.vue'
import QueueEpisodeList from '@/components/NewQueueItem/QueueEpisodeList.vue'
import AnimatedHeight from '@/components/AnimatedHeight.vue'
import SourceList from '@/components/SourceList.vue'
import Loading from '@/components/NewQueueItem/Loading.vue'

import { Required } from '@/decorators'
import { toggleQueueItemOpen } from '@/state/user'
import CButton from '@/components/CButton.vue'
import { sendErrorToast } from '@/state/app'
import { rewatchMutation, setStatusMutation } from '@/graphql/mutations'

@Component({
  components: {
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
  @Required(Object) public anime!: QueueAnime
  @Required(Boolean) public open!: boolean

  public MediaListStatus = MediaListStatus
  public expandSvg = mdiChevronDown
  public hamburgerSvg = mdiMenu

  public get isWatching() {
    return this.isStatus(MediaListStatus.Current, MediaListStatus.Repeating)
  }

  public toggleItemOpen() {
    toggleQueueItemOpen(this.$store, this.anime.id)
  }

  public isStatus(...statuses: MediaListStatus[]) {
    return statuses.includes(
      path<MediaListStatus>(['mediaListEntry', 'status'], this.anime),
    )
  }

  public getIsStatus(...statuses: MediaListStatus[]) {
    return statuses.includes(
      path<MediaListStatus>(['mediaListEntry', 'status'], this.anime),
    )
  }

  public async statusMutation(status: MediaListStatus) {
    const listEntryId = path<number>('mediaListEntry.id', this.anime)

    if (!listEntryId) {
      return sendErrorToast(this.$store, 'No entry found..?')
    }

    if (status === MediaListStatus.Repeating) {
      return rewatchMutation(this, listEntryId)
    }

    await setStatusMutation(this, listEntryId, status)
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
    background: lighten($dark, 5%);

    & > .collapser {
      flex-shrink: 0;
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

    & > .buttons {
      margin-left: auto;

      & > .button {
        min-width: 85px;
        border-radius: 0;
      }
    }
  }
}

.v-enter-active {
  z-index: 1;
  transition: opacity 0.25s, transform 0.35s;
}

.v-leave-active {
  z-index: 1;
  position: absolute;
  transition: opacity 0.25s;
}

.v-enter,
.v-leave-to {
  opacity: 0;
}

.v-enter {
  transform: translateY(25px);
}

.v-move {
  transition: 0.5s;
}
</style>
