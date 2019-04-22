<template>
  <div class="episode-feed">
    <div class="episodes">
      <router-link
        v-for="schedule in airingSchedules"
        :key="schedule.id"
        :to="`/anime/${schedule.media.id}`"
        class="episode"
      >
        <img
          :src="schedule.media.coverImage.medium"
          class="banner"
          :style="{ backgroundColor: schedule.media.coverImage.color }"
        />

        <div class="info">
          <div class="title">{{ schedule.media.title.userPreferred }}</div>

          <next-episode-info
            :nextAiringEpisode="{
              episode: schedule.episode,
              airingAt: schedule.airingAt,
            }"
            class="airing"
          />
        </div>
      </router-link>
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
import { oc } from 'ts-optchain'
import { addDays as _addDays } from 'date-fns'
import { mdiClipboardTextOutline, mdiPlaylistCheck } from '@mdi/js'

import Icon from '@/common/components/icon.vue'
import NextEpisodeInfo from '@/common/components/next-episode-info.vue'
import EPISODE_FEED_QUERY from './episode-feed.graphql'
import LIST_IDS_QUERY from './episode-feed-list-ids.graphql'
import {
  EpisodeFeedAiringSchedules,
  EpisodeFeedListIdsQuery,
  EpisodeFeedListIdsVariables,
  EpisodeFeedQuery,
  EpisodeFeedVariables,
} from '@/graphql/types'

import { Query } from '@/decorators'
import {
  EpisodeFeedMode,
  getEpisodeFeedMode,
  setEpisodeFeedMode,
} from '@/state/settings'
import { getAnilistUserId } from '@/state/auth'
import { getQueue } from '@/state/user'
import { prop } from '@/utils'

const addDays = (days: number) =>
  Math.round(_addDays(new Date(), days).valueOf() / 1000)

@Component({ components: { Icon, NextEpisodeInfo } })
export default class EpisodeFeed extends Vue {
  @Query<EpisodeFeed, EpisodeFeedListIdsQuery, EpisodeFeedListIdsVariables>({
    query: LIST_IDS_QUERY,
    variables() {
      return {
        userId: this.userId,
      }
    },
    update(data) {
      const lists = oc(data).listCollection.lists([])

      const entries = lists.map(prop('entries')).flat()

      return entries.map(prop('mediaId'))
    },
  })
  public listIds!: number[]

  @Query<EpisodeFeed, EpisodeFeedQuery, EpisodeFeedVariables>({
    query: EPISODE_FEED_QUERY,
    variables() {
      return {
        page: this.page,
        startDate: addDays(-2),
        endDate: addDays(7),
        ids: this.mode === EpisodeFeedMode.LIST ? this.listIds : this.queueIds,
      }
    },
    update(data) {
      this.hasNextPage = oc(data).Page.pageInfo.hasNextPage(false)

      return oc(data).Page.airingSchedules(null)
    },
  })
  public airingSchedules!: EpisodeFeedAiringSchedules
  public hasNextPage = false
  public page = 1

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

  & > .control-panel {
    flex-shrink: 0;
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

  & > .episodes {
    height: 100%;
    padding: 15px 0;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    overflow: auto;
    direction: rtl;

    & .episode {
      direction: ltr;
      flex-shrink: 0;

      width: 95%;
      display: flex;
      position: relative;
      margin-bottom: 15px;
      overflow: hidden;

      background: $dark;
      border-radius: 5px;
      color: $white;
      text-decoration: none;
      box-shadow: $shadow;

      &:last-child {
        margin-bottom: 0;
      }

      & > .banner {
        flex-shrink: 0;
        height: 100%;
        width: 60px;
        object-fit: cover;
      }

      & > .info {
        width: calc(100% - 60px);
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 15px;
        text-align: left;

        & > .title {
          font-family: 'Raleway', sans-serif;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 5px;
        }
      }
    }
  }
}
</style>
