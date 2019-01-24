<template>
  <div v-if="!$apollo.error && anime" class="queue-item">
    <div class="handle" />

    <anime-banner :anime="anime" :faded="!isWatching" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { path } from 'rambdax'

import ANIME_QUEUE_QUERY from '@/graphql/AnimeQueueQuery.graphql'
import {
  AnimeQueueQueryAnime,
  AnimeQueueQueryQuery,
  AnimeQueueQueryVariables,
  MediaListStatus,
} from '@/graphql/types'

import AnimeBanner from '@/components/AnimeBanner.vue'

import { Query, Required } from '@/decorators'
import { QueueItem } from '@/lib/user'

@Component({
  components: { AnimeBanner },
})
export default class NewQueueItem extends Vue {
  @Required(Object) public item!: QueueItem

  @Query<NewQueueItem, AnimeQueueQueryQuery, AnimeQueueQueryVariables>({
    query: ANIME_QUEUE_QUERY,
    variables() {
      return {
        id: this.item.id,
      }
    },
    skip() {
      return !this.item.id
    },
    update(data) {
      return data.anime
    },
  })
  public anime: AnimeQueueQueryAnime | null = null

  public get isWatching() {
    return this.isStatus(MediaListStatus.Current, MediaListStatus.Repeating)
  }

  public isStatus(...statuses: MediaListStatus[]) {
    return statuses.includes(
      path<MediaListStatus>(['mediaListEntry', 'status'], this.anime),
    )
  }
}
</script>

<style scoped lang="scss">
.queue-item {
  left: 0;
  position: relative;
  width: 100%;
  margin-bottom: 15px;
  display: inline-block;
  border-radius: 5px;
  overflow: hidden;
  z-index: 2;

  & > .handle {
    position: absolute;
    top: 0;
    right: 0;
    height: 20px;
    width: 20px;
    border-bottom-left-radius: 15px;
    background: #5a5a5a;
    cursor: -webkit-grab;
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
