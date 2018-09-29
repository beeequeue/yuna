import { MediaListStatus } from '../../graphql-types'
<template>
<transition name="fade">
  <transition-group class="actions" tag="div">
    <raised-button
      v-if="!isOnList || (!isPlanning && !isWatching && !isCompleted)"
      key="addEntry"
      :icon="addToListSvg"
      content="Set as Planning"
      @click.native="sendNotImplementedToast"
    />

    <div v-if="isWatching" class="multi-button" key="isWatchingProgress">
      <raised-button
        content="+"
        @click.native="sendNotImplementedToast"
      />

      <raised-button
        content="-"
        @click.native="sendNotImplementedToast"
      />
    </div>
    <div v-if="isWatching" class="multi-button" key="isWatching">
      <raised-button
        content="Edit"
        @click.native="sendNotImplementedToast"
      />

      <raised-button
        type="danger"
        content="Drop"
        @click.native="sendNotImplementedToast"
      />
    </div>

    <raised-button
      v-if="isCompleted"
      key="setToRepeating"
      :icon="setToRepeatSvg"
      content="Set as Repeating"
      @click.native="sendNotImplementedToast"
    />

    <raised-button
      v-if="!isInQueue"
      key="addToQueue"
      :icon="addToQueueSvg"
      content="Add to Queue"
      @click.native="sendNotImplementedToast"
    />

    <raised-button
      key="goToNichijou"
      @click.native="$router.push('/anime/10165')"
      content="Go to Nichijou"
    />

    <raised-button
      key="goTo404"
      @click.native="$router.push(`/anime/404}`)"
      type="danger"
      content="Go to 404"
    />
  </transition-group>
</transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { any, propEq } from 'rambda'
import { mdiPlaylistPlay, mdiPlaylistPlus, mdiRepeat } from '@mdi/js'

import RaisedButton from '../RaisedButton.vue'
import { prop } from '../../utils'
import { MediaListStatus } from '../../graphql-types'
import { getQueue } from '../../state/user'
import { sendNotImplementedToast } from '../../state/app'

@Component({
  components: { RaisedButton },
})
export default class Actions extends Vue {
  @Prop(prop(String))
  public mediaListStatus!: MediaListStatus | null

  public addToListSvg = mdiPlaylistPlus
  public addToQueueSvg = mdiPlaylistPlay
  public setToRepeatSvg = mdiRepeat

  public get id() {
    return Number(this.$route.params.id)
  }

  public get isOnList() {
    return this.mediaListStatus !== null
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

  public get isInQueue() {
    return any(propEq('anilist', this.id))(getQueue(this.$store))
  }

  public sendNotImplementedToast() {
    sendNotImplementedToast(this.$store)
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
      position: absolute;
      transition: transform 0.5s;
    }

    &.v-enter,
    &.v-leave-to {
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
