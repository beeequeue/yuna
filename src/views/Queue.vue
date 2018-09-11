<template>
  <div class="container">
    <div class="queue">
      <transition-group name="fade">
        <queue-item
          v-for="item in queueWithData"
          :item="item"
          :key="item.series.crunchyroll.id"
          class="anime"
        />
      </transition-group>

      <transition name="fade">
        <div v-if="queue.length < 1" class="empty-message">
          Seems your queue is empty!<br/>

          <strike>You can add some from your list or by searching,<br/></strike>

          or try to<br/><br/>

          <raised-button class="cr-import" @click.native="importQueue">
            Import from Crunchyroll
          </raised-button>
        </div>
      </transition>
    </div>

    <div class="sidebar">
      <raised-button class="cr-import" @click.native="importQueue">
        Import from Crunchyroll
      </raised-button>

      <raised-button type="danger" @click.native="clearQueue">
        Clear queue
      </raised-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { complement, filter, map, propEq } from 'rambda'

import QueueItem from '../components/QueueItem.vue'
import RaisedButton from '../components/RaisedButton.vue'
import { getQueue, setQueue, updateQueue } from '../state/user'
import { Anime, Episode } from '../types'
import { AnimeCache } from '../lib/cache'

interface ItemData {
  episode: Episode
  series: Anime
}

interface SafeQueueItem {
  crunchyroll: string
  nextEpisode: string
}

@Component({
  components: { QueueItem, RaisedButton },
})
export default class Queue extends Vue {
  public queueWithData: ItemData[] = []

  public get queue() {
    return getQueue(this.$store)
  }

  public mounted() {
    this.getQueueData()
  }

  @Watch('queue')
  public async getQueueData() {
    const onlyCR: SafeQueueItem[] = filter(
      complement(propEq('crunchyroll', null)),
    )(this.queue)

    const animes = (await Promise.all(
      map(item => AnimeCache.getAnime(item.crunchyroll), onlyCR),
    )) as Anime[]

    const episodes = (await Promise.all(
      animes.map((_anime, i) => AnimeCache.getEpisode(onlyCR[i].nextEpisode)),
    )) as Episode[]

    this.queueWithData = animes.map((anime, i) => ({
      series: anime,
      episode: episodes[i],
    }))
  }

  public importQueue() {
    updateQueue(this.$store)
  }

  public clearQueue() {
    setQueue(this.$store, [])
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.container {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-rows: 1fr 170px;
  grid-template-areas:
    'queue sidebar'
    'queue player';

  width: 100%;
  height: 100%;

  .queue {
    position: relative;
    grid-area: queue;
    padding: 15px 25px;
    overflow-y: auto;

    min-width: 800px;
    background: #10111a;
    user-select: none;

    & > .empty-message {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      font-size: 1.25em;
      font-weight: 600;
    }
  }

  .sidebar {
    grid-area: sidebar;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 20px 25px;

    background: #1a1b29;

    & > .button {
      margin: 8px 0;
    }

    & > .cr-import {
      margin-top: auto;
    }
  }
}

.route-enter-active,
.route-leave-active {
  transition: none 0.5s; // Required for Vue to realize there are transitions

  & > .queue,
  & > .sidebar {
    transition: transform 0.5s;
  }
}

.route-enter,
.route-leave-to {
  & > .queue {
    transform: translateX(-100%);
  }

  & > .sidebar {
    transform: translateY(-125%);
  }
}
</style>
