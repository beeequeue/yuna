import { MediaListStatus } from '../../graphql-types'
<template>
<transition name="fade">
  <div class="actions">
    <raised-button
      v-if="!isOnList || (!isPlanning && !isWatching && !isCompleted)"
      :icon="addToListSvg"
      content="Set as Planning"
    />


    <div v-if="isWatching" class="multi-button">
      <raised-button
        content="+"
      />

      <raised-button
        content="-"
      />
    </div>
    <div v-if="isWatching" class="multi-button">
      <raised-button
        content="Complete"
      />

      <raised-button
        type="danger"
        content="Drop"
      />
    </div>
    <raised-button
      v-else
      :icon="setToRepeatSvg"
      content="Set as Rewatching"
    />

    <raised-button
      v-if="!isInQueue"
      :icon="addToQueueSvg"
      content="Add to Queue"
    />

    <raised-button
      @click.native="$router.push('/anime/10165')"
      content="Go to Nichijou"
    />

    <raised-button
      @click.native="$router.push(`/anime/404}`)"
      type="danger"
      content="Go to 404"
    />
  </div>
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

@Component({
  components: { RaisedButton },
})
export default class Actions extends Vue {
  @Prop(prop(Boolean, true))
  public loading!: boolean
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
    return this.mediaListStatus === MediaListStatus.CURRENT
  }

  public get isCompleted() {
    return this.mediaListStatus === MediaListStatus.COMPLETED
  }

  public get isInQueue() {
    return any(propEq('anilist', this.id))(getQueue(this.$store))
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
