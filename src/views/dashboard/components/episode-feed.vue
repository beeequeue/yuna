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
        v-tooltip.top="'All shows in List'"
        class="switch list"
        :class="{ active: mode === EpisodeFeedMode.LIST }"
        @click="mode = EpisodeFeedMode.LIST"
      >
        <icon :icon="listSvg" />
      </div>

      <div
        v-tooltip.top="'Shows in Queue'"
        class="switch queue"
        :class="{ active: mode === EpisodeFeedMode.QUEUE }"
        @click="mode = EpisodeFeedMode.QUEUE"
      >
        <icon :icon="queueSvg" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mdiClipboardTextOutline, mdiPlaylistCheck } from "@mdi/js"
import { computed, defineComponent, ref } from "@vue/composition-api"
import { useQuery, useResult } from "@vue/apollo-composable"

import Icon from "@/common/components/icon.vue"
import { EPISODE_FEED_LIST_IDS } from "@/graphql/documents/queries"
import { EpisodeFeedListIdsQuery } from "@/graphql/generated/types"

import { getAnilistUserId } from "@/state/auth"
import { getQueue } from "@/state/user"
import { prop } from "@/utils"

import AnimatedList from "./animated-list.vue"

enum EpisodeFeedMode {
  LIST = "LIST",
  QUEUE = "QUEUE",
}

export default defineComponent({
  components: { AnimatedList, Icon },
  setup: (_, { root }) => {
    const mode = ref(EpisodeFeedMode.QUEUE)

    const query = useQuery<EpisodeFeedListIdsQuery>(EPISODE_FEED_LIST_IDS)
    const listIds = useResult(query.result, null, (data) =>
      data.ListEntries.map(prop("mediaId")),
    )

    const queueIds = getQueue(root.$store).map(prop("id"))

    return {
      mode,
      EpisodeFeedMode,

      listIds,
      queueIds,

      userId: computed(() => getAnilistUserId(root.$store)),

      listSvg: mdiClipboardTextOutline,
      queueSvg: mdiPlaylistCheck,
    }
  },
})
</script>

<style scoped lang="scss">
@import "../../../colors";

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
