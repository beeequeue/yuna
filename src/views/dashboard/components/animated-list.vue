<template>
  <transition-group tag="div" class="episodes">
    <router-link
      v-for="(schedule, i) in airingSchedules"
      :key="schedule.id"
      :to="`/anime/${schedule.media.id}`"
      :data-index="i"
      class="episode"
      :class="getEpisodeClass(schedule)"
    >
      <img
        :src="schedule.media.coverImage.medium"
        class="cover-image"
        :style="{ backgroundColor: schedule.media.coverImage.color }"
      />

      <div class="info">
        <div class="title">{{ schedule.media.title.userPreferred }}</div>

        <next-episode-info
          :next-airing-episode="{
            episode: schedule.episode,
            airingAt: schedule.airingAt,
          }"
          class="airing"
        />
      </div>
    </router-link>
  </transition-group>
</template>

<script lang="ts">
import { addDays as _addDays, startOfDay } from "date-fns"
import { useQuery, useResult } from "@vue/apollo-composable"
import { defineComponent, ref } from "@vue/composition-api"

import NextEpisodeInfo from "@/common/components/next-episode-info.vue"
import {
  AiringFeedItemFragment,
  EpisodeFeedQuery,
  EpisodeFeedVariables,
} from "@/graphql/generated/types"
import EPISODE_FEED_QUERY from "./episode-feed.graphql"

// startOfDay is used to make sure we can cache the results properly
// if we don't, every query will have different time variables
const addDays = (days: number) =>
  Math.round(startOfDay(_addDays(new Date(), days)).valueOf() / 1000)

export default defineComponent<{ ids: number[] }>({
  components: { NextEpisodeInfo },
  props: {
    ids: {
      type: Array,
      required: true,
    },
  },
  setup: (props) => {
    const page = ref(1)

    const query = useQuery<EpisodeFeedQuery, EpisodeFeedVariables>(
      EPISODE_FEED_QUERY,
      () => ({
        ids: props.ids,
        page: page.value,
        startDate: addDays(-1),
        endDate: addDays(7),
      }),
      // Required for type inference
      () => ({
        enabled: props.ids.length > 0,
      }),
    )
    const airingSchedules = useResult(
      query.result,
      [],
      (data) => data.Page?.airingSchedules,
    )

    const getEpisodeClass = (schedule: AiringFeedItemFragment) => ({
      aired: schedule.airingAt * 1000 < Date.now(),
    })

    return {
      page,
      airingSchedules,
      getEpisodeClass,
    }
  },
})
</script>

<style scoped lang="scss">
@import "../../../colors";

.episodes {
  direction: ltr;
  overflow: visible;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;

  & .episode {
    flex-shrink: 0;

    width: 95%;
    display: flex;
    position: relative;
    margin-top: 15px;

    background: $dark;
    border-radius: 5px;
    color: $white;
    text-decoration: none;
    box-shadow: $shadow;

    &:last-child {
      margin-bottom: 15px;
    }

    &.aired {
      background: color($dark, 600);
      opacity: 0.9;
    }

    &.v-move {
      transition: transform 500ms;
    }

    &.v-enter-active,
    &.v-leave-active {
      transition: opacity 350ms, transform 500ms;

      &.v-leave-active {
        position: absolute;
      }
    }

    &.v-enter,
    &.v-leave-to {
      opacity: 0;
      transform: translateY(-100px);
    }

    &.v-enter-to {
      opacity: 1;
      transform: translateY(0);
    }

    & > .cover-image {
      position: relative;
      flex-shrink: 0;
      min-height: 78px;
      height: 100%;
      width: 55px;
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
        font-family: "Raleway", sans-serif;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 5px;
      }
    }
  }
}
</style>
