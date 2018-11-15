<template>
  <div class="container">
    <div ref="queue" class="queue">
      <draggable v-model="queue" :options="draggableOptions">
        <transition-group type="transition">
          <queue-item
            v-for="id in queue"
            :id="id"
            :key="id"
            class="anime"
          />
        </transition-group>
      </draggable>

      <transition name="fade">
        <div v-if="queue.length < 1" class="empty-message">
          Seems your queue is empty!<br/>

          You can add some from your list or by searching for one!<br/>
        </div>
      </transition>
    </div>

    <div class="sidebar" :class="{ small: isPlayerOpen }">
      <span class="fill"/>

      <c-button
        content="Import Watching from List"
        :icon="currentSvg"
        :click="importWatching"
      />

      <c-button
        content="Import Random from Planning"
        :icon="planningSvg"
        :click="importRandomFromPlanning"
      />

      <c-button
        content="Import Random from Paused"
        :icon="pausedSvg"
        :click="importRandomFromPaused"
      />

      <c-button
        content="Import from Crunchyroll"
        disabled
      />

      <c-button
        content="Backup Queue"
        :click="exportQueue"
      />

      <c-button
        type="danger"
        confirm
        :icon="clearListSvg"
        content="Clear queue"
        :click="clearQueue"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Draggable from 'vuedraggable'
import { shell } from 'electron'
import { api } from 'electron-util'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'
import { complement, path } from 'rambda'
import { mdiPlaylistRemove, mdiPause, mdiPlay, mdiClockOutline } from '@mdi/js'

import { getQueue, setQueue, addToQueue } from '@/state/user'
import {
  sendNotImplementedToast,
  getCurrentEpisode,
  sendErrorToast,
  sendToast,
} from '@/state/app'
import { watchingQuery, planningQuery, pausedQuery } from '@/graphql/query'
import { getAnilistUserId, getAnilistUsername } from '@/state/auth'
import {
  WatchingQuery_listCollection_lists_entries,
  WatchingQuery_listCollection_lists,
} from '@/graphql/WatchingQuery'

import CButton from '../components/CButton.vue'
import QueueItem from '../components/QueueItem.vue'
import Modal from '../components/Modal.vue'

@Component({ components: { Draggable, CButton, QueueItem, Modal } })
export default class Queue extends Vue {
  public isAnilistImportModalOpen = false

  public draggableOptions = {
    animation: 150,
    handle: '.handle',
  }

  public $refs!: {
    queue: HTMLDivElement
  }

  public currentSvg = mdiPlay
  public planningSvg = mdiClockOutline
  public pausedSvg = mdiPause
  public clearListSvg = mdiPlaylistRemove

  public get anilistUserId() {
    return getAnilistUserId(this.$store)
  }

  public get isPlayerOpen() {
    return !!getCurrentEpisode(this.$store)
  }

  public get queue() {
    return getQueue(this.$store)
  }

  public set queue(value: number[]) {
    setQueue(this.$store, value)
  }

  public async importFromQuery(
    query: typeof watchingQuery | typeof planningQuery | typeof pausedQuery,
    random: boolean = false,
  ) {
    if (!this.anilistUserId) return

    const queueBefore = [...this.queue]

    const { data, errors } = await query(this.$apollo, this.anilistUserId)

    const lists = path<WatchingQuery_listCollection_lists[] | null>(
      'listCollection.lists',
      data,
    )

    if (!lists || lists.length < 1) {
      return sendErrorToast(this.$store, "Couldn't find any lists!")
    }

    const list = lists.find(complement(path<boolean>('isCustomList')))

    const entries = path<WatchingQuery_listCollection_lists_entries[]>(
      'entries',
      list,
    )

    if (errors || !entries || entries.length < 1) {
      return sendErrorToast(
        this.$store,
        "Couldn't find any applicable shows in your List!",
      )
    }

    const ids = entries.map(path<number>('info.id'))

    if (random) {
      const randomIdx = Math.floor(Math.random() * ids.length)
      addToQueue(this.$store, ids[randomIdx])
    } else {
      ids.forEach(id => addToQueue(this.$store, id))
    }

    const diff = this.queue.length - queueBefore.length

    if (diff < 1) {
      return sendToast(this.$store, {
        type: 'error',
        title: "Couldn't find any applicable shows in your List!",
        message: "At least none that aren't already in the Queue",
      })
    }

    if (!random) {
      sendToast(this.$store, {
        type: 'success',
        title: `Imported ${diff} show${diff === 1 ? '' : 's'} into the Queue!`,
        message: '',
      })
    }

    setTimeout(() => {
      this.$refs.queue.scrollTo({
        top: 100000,
        behavior: 'smooth',
      })
    }, 0)
  }

  public async importWatching() {
    this.importFromQuery(watchingQuery)
  }

  public async importRandomFromPlanning() {
    this.importFromQuery(planningQuery, true)
  }

  public async importRandomFromPaused() {
    this.importFromQuery(pausedQuery, true)
  }

  public exportQueue() {
    const folderPath = resolve(api.app.getPath('userData'), 'backups')
    const filePath = resolve(
      folderPath,
      `queue-${getAnilistUsername(this.$store)}-${Date.now()}.json`,
    )

    if (!existsSync(folderPath)) {
      mkdirSync(folderPath)
    }

    writeFileSync(filePath, JSON.stringify(this.queue))

    sendToast(this.$store, {
      type: 'success',
      title: 'Exported Queue!',
      message: `Click this to see the file!`,
      timeout: 6000,
      click: () => shell.showItemInFolder(filePath),
    })
  }

  public clearQueue() {
    setQueue(this.$store, [])
  }

  public sendNotImplementedToast() {
    sendNotImplementedToast(this.$store)
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
    grid-area: sidebar / sidebar / player / player;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 20px 25px;

    background: #1a1b29;

    &.small {
      grid-area: sidebar;
    }

    & > .button {
      margin: 8px 0;
      flex-shrink: 0;
    }

    & > .fill {
      height: 100%;
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
