<template>
  <div class="queue-item">
    <icon :icon="hamburgerSvg" class="handle" />

    <anime-banner :anime="anime" :faded="!isWatching" />

    <div class="controls">
      <icon
        class="collapser"
        :class="{ flip: !open }"
        :icon="expandSvg"
        @click.native="toggleItemOpen"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { path } from 'rambdax'
import { mdiChevronDown, mdiMenu } from '@mdi/js'
import { MediaListStatus, QueueAnime } from '@/graphql/types'

import AnimeBanner from '@/components/AnimeBanner.vue'
import Icon from '@/components/Icon.vue'

import { Required } from '@/decorators'
import { toggleQueueItemOpen } from '@/state/user'

@Component({ components: { AnimeBanner, Icon } })
export default class NewQueueItem extends Vue {
  @Required(Object) public anime!: QueueAnime
  @Required(Boolean) public open!: boolean

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
}
</script>

<style scoped lang="scss">
@import '../../colors';

.queue-item {
  left: 0;
  position: relative;
  width: 100%;
  margin-bottom: 15px;
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

  & > .controls {
    display: flex;
    background: $dark;

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
