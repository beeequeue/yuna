<template>
  <div class="queue">
    <div ref="container" class="container">
      <draggable
        v-model="fakeQueue"
        :options="draggableOptions"
        class="draggable-container"
      >
        <transition-group type="transition" tag="div" class="transition-group">
          <new-queue-item
            v-for="item in fakeQueue"
            :item="item"
            :key="item.id"
          />
        </transition-group>
      </draggable>

      <transition name="fade">
        <div v-if="fakeQueue.length < 1" class="empty-message">
          Seems your queue is empty! <br />You can import shows from your list
          or add some by searching! <br />

          <c-button
            content="Import Watching from List"
            :icon="currentSvg"
            :click="importWatching"
          />
        </div>
      </transition>
    </div>

    <div class="sidebar" :class="{ small: isPlayerOpen }">
      <span class="fill" />

      <span>{{ this.fakeQueue.length }}</span>

      <c-button content="+++++++++++" :click="affectFakeQueue" />

      <c-button content="-------------" :click="() => affectFakeQueue(true)" />

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
        content="Import Exported Queue"
        :click="importQueueFromBackup"
      />

      <c-button content="Export Queue" :click="exportQueue" />

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
import { remote, shell } from 'electron'
import { activeWindow, api } from 'electron-util'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { complement, path } from 'rambdax'
import { mdiClockOutline, mdiPause, mdiPlay, mdiPlaylistRemove } from '@mdi/js'

import CButton from '@/components/CButton.vue'
import QueueItem from '@/components/QueueItem.vue'

import { pausedQuery, planningQuery, watchingQuery } from '@/graphql/query'
import { WatchingQueryEntries, WatchingQueryLists } from '@/graphql/types'

import { Page, trackPageView } from '@/lib/tracking'
import { QueueItem as IQueueItem } from '@/lib/user'
import { getPlayerData, sendErrorToast, sendToast } from '@/state/app'
import { getAnilistUserId, getAnilistUsername } from '@/state/auth'
import { addToQueue, getQueue, setQueue } from '@/state/user'
import NewQueueItem from '@/components/NewQueueItem/NewQueueItem.vue'

@Component({ components: { NewQueueItem, Draggable, CButton, QueueItem } })
export default class Queue extends Vue {
  private defaultBackupPath = resolve(api.app.getPath('userData'), 'backups')
  private jsonFilter = { extensions: ['json'], name: '*' }

  public draggableOptions = {
    animation: 150,
    handle: '.handle',
  }

  public $refs!: {
    container: HTMLDivElement
  }

  public currentSvg = mdiPlay
  public planningSvg = mdiClockOutline
  public pausedSvg = mdiPause
  public clearListSvg = mdiPlaylistRemove

  public get anilistUserId() {
    return getAnilistUserId(this.$store)
  }

  public get isPlayerOpen() {
    return !!getPlayerData(this.$store)
  }

  public get queue() {
    return getQueue(this.$store)
  }

  public set queue(value: IQueueItem[]) {
    setQueue(this.$store, value)
  }

  public fakeQueue = [{ id: 5680, open: false }]

  public mounted() {
    trackPageView(Page.QUEUE)
  }

  public affectFakeQueue(doRemove = false) {
    const ids = [5680, 21699, 21856, 100077, 101291, 21460]

    if (doRemove) {
      const idx = Math.round(Math.random() * (this.fakeQueue.length - 1))
      const arr = [...this.fakeQueue]
      arr.splice(idx, 1)
      this.fakeQueue = arr
    } else {
      const id = ids.filter(
        id => !this.fakeQueue.find(item => item.id === id),
      )[0]
      if (!id) return
      this.fakeQueue = [...this.fakeQueue, { id, open: false }]
    }
  }

  public async importFromQuery(
    query: typeof watchingQuery | typeof planningQuery | typeof pausedQuery,
    random: boolean = false,
  ) {
    if (!this.anilistUserId) return

    const queueBefore = [...this.queue]

    const { data, errors } = await query(this.$apollo, this.anilistUserId)

    const lists = path<WatchingQueryLists[] | null>(
      'listCollection.lists',
      data,
    )

    if (!lists || lists.length < 1) {
      return sendErrorToast(
        this.$store,
        "Couldn't find any shows in that state!",
      )
    }

    const list = lists.find(complement(path<boolean>('isCustomList')))

    const entries = path<WatchingQueryEntries[]>('entries', list)

    if (errors || !entries || entries.length < 1) {
      return sendErrorToast(
        this.$store,
        "Couldn't find any shows in that state!",
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
        title: "Couldn't find any shows in that state!",
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
      this.$refs.container.scrollTo({
        top: 100000,
        behavior: 'smooth',
      })
    }, 350)
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
    const filePath = resolve(
      this.defaultBackupPath,
      `queue-${getAnilistUsername(this.$store)}-${Date.now()}.json`,
    )

    if (!existsSync(this.defaultBackupPath)) {
      mkdirSync(this.defaultBackupPath)

      writeFileSync(filePath, JSON.stringify(this.queue))
    }

    const savePath: string | null = remote.dialog.showSaveDialog(
      activeWindow(),
      {
        title: 'Export Queue...',
        buttonLabel: 'Export',
        defaultPath: filePath,
        showsTagField: false,
        filters: [this.jsonFilter],
      },
    )

    if (!savePath) return

    writeFileSync(savePath, JSON.stringify(this.queue))

    sendToast(this.$store, {
      type: 'success',
      title: 'Exported Queue!',
      message: `Click this to see the file!`,
      timeout: 6000,
      click: () => shell.showItemInFolder(savePath),
    })
  }

  public importQueueFromBackup() {
    const openPaths: string[] | null = remote.dialog.showOpenDialog({
      title: 'Import Backup...',
      buttonLabel: 'Import',
      defaultPath: this.defaultBackupPath,
      filters: [this.jsonFilter],
      properties: ['openFile'],
    })

    if (!openPaths || openPaths.length < 1) return
    const openPath = openPaths[0]

    try {
      const data = JSON.parse(readFileSync(openPath).toString())

      if (typeof data !== 'object' || !Array.isArray(data)) throw new Error()

      if (data.some(item => typeof item !== 'number')) throw new Error()

      data.forEach(id => addToQueue(this.$store, id))
    } catch (err) {
      sendErrorToast(this.$store, 'Could not parse backup file!')
    }
  }

  public clearQueue() {
    setQueue(this.$store, [])
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.queue {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 325px;
  grid-template-rows: 1fr 170px;
  grid-template-areas:
    'queue sidebar'
    'queue player';

  width: 100%;
  height: 100%;

  .container {
    position: relative;
    grid-area: queue;
    padding: 15px 25px;
    overflow-y: auto;
    overflow-x: hidden;

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

      & > .button {
        margin-top: 10px;
        font-size: 0.85em;
      }
    }

    & > .draggable-container > .transition-group {
      position: relative;
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

  & > .container,
  & > .sidebar {
    transition: transform 0.5s;
  }
}

.route-enter,
.route-leave-to {
  & > .container {
    transform: translateX(-100%);
  }

  & > .sidebar {
    transform: translateY(-125%);
  }
}
</style>
