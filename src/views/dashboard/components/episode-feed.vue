<template>
  <div class="episode-feed">
    <div class="episodes-container">
      <animated-list
        v-if="listIds && queueIds"
        :ids="mode === EpisodeFeedMode.LIST ? listIds : queueIds"
      />
    </div>

    <div class="control-panel">
      <div
        class="switch list"
        :class="{ active: mode === EpisodeFeedMode.LIST }"
        v-tooltip.top="'All shows in List'"
        @click="updateMode(EpisodeFeedMode.LIST)"
      >
        <icon :icon="listSvg" />
      </div>

      <div
        class="switch queue"
        :class="{ active: mode === EpisodeFeedMode.QUEUE }"
        v-tooltip.top="'Shows in Queue'"
        @click="updateMode(EpisodeFeedMode.QUEUE)"
      >
        <icon :icon="queueSvg" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mdiClipboardTextOutline, mdiPlaylistCheck } from '@mdi/js'

import Icon from '@/common/components/icon.vue'
import AnimatedList from './animated-list.vue'
import { EPISODE_FEED_LIST_IDS } from '@/graphql/documents/queries'
import { EpisodeFeedListIdsQuery } from '@/graphql/types'

import { Query } from '@/decorators'
import {
  EpisodeFeedMode,
  getEpisodeFeedMode,
  setEpisodeFeedMode,
} from '@/state/settings'
import { getAnilistUserId } from '@/state/auth'
import { getQueue } from '@/state/user'
import { prop } from '@/utils'

@Component({ components: { AnimatedList, Icon } })
export default class EpisodeFeed extends Vue {
  @Query<EpisodeFeed, EpisodeFeedListIdsQuery>({
    query: EPISODE_FEED_LIST_IDS,
    variables: null,
    update: data => data.ListEntries.map(prop('mediaId')),
  })
  public listIds!: number[]

  public get userId() {
    return getAnilistUserId(this.$store)
  }

  public get mode(): EpisodeFeedMode {
    return getEpisodeFeedMode(this.$store)
  }

  public get queueIds(): number[] {
    return getQueue(this.$store).map(prop('id'))
  }

  public updateMode(mode: EpisodeFeedMode) {
    setEpisodeFeedMode(this.$store, mode)
  }

  public EpisodeFeedMode = EpisodeFeedMode
  public listSvg = mdiClipboardTextOutline
  public queueSvg = mdiPlaylistCheck
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.episode-feed {
  display: flex;
  flex-direction: column;
  position: relative;

  height: 100%;
  width: 100%;

  & > .episodes-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    direction: rtl;
  }

  & > .control-panel {
    flex-shrink: 0;
    margin-top: auto;
    height: 45px;
    width: 100%;
    background: color($dark, 300);
    border-top-right-radius: 5px;
    overflow: hidden;

    display: flex;

    & > .switch {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: background 0.15s;

      &.active {
        background: color($dark, 700);
      }

      & > .icon {
        height: 30px;
        fill: $white;
      }
    }
  }
}
</style>
