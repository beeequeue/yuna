<template>
  <div class="queue">
    <div ref="container" class="queue-container">
      <container
        lock-axis="y"
        drag-handle-selector=".handle"
        :get-child-payload="getChildPayload"
        @drop="handleDrop"
      >
        <draggable v-for="anime in animes" :key="anime.id">
          <queue-item
            v-if="anime != null && getItem(anime.id) != null"
            :key="anime.id"
            :anime="anime"
            :item="getItem(anime.id)"
            :setProvider="setProvider(anime.id)"
          />
        </draggable>
      </container>

      <transition name="fade">
        <div v-if="queue.length < 1" class="empty-message">
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

    <div
      class="sidebar"
      :class="{ small: isPlayerOpen, external: isExternalPlayer }"
    >
      <span class="fill" />

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

    <manual-search-modal />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Container, Draggable } from 'vue-smooth-dnd'
import { remote, shell } from 'electron'
import { activeWindow, api } from 'electron-util'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import indexBy from 'lodash.keyby'
import { oc } from 'ts-optchain'
import { mdiClockOutline, mdiPause, mdiPlay, mdiPlaylistRemove } from '@mdi/js'

import CButton from '@/common/components/button.vue'
import QueueItem from './components/queue-item.vue'
import ManualSearchModal from './modals/manual-search/manual-search-modal.vue'

import { pausedQuery, planningQuery, watchingQuery } from './queries'
import QUEUE_QUERY from './queue.graphql'
import {
  Provider,
  QueueAnime,
  QueueQuery,
  QueueVariables,
  WatchingQueryLists,
} from '@/graphql/types'

import { Query } from '@/decorators'
import { getPlayerData, sendErrorToast, sendToast } from '@/state/app'
import { getAnilistUserId, getAnilistUsername } from '@/state/auth'
import {
  addToQueue,
  getQueue,
  setQueue,
  setQueueItemProvider,
  toggleQueueItemOpen,
} from '@/state/user'
import { QueueItem as IQueueItem } from '@/lib/user'
import { complement, isNotNil, pick, prop, propEq, sortNumber } from '@/utils'

@Component({
  components: {
    ManualSearchModal,
    QueueItem,
    CButton,
    Container,
    Draggable,
  },
})
export default class Queue extends Vue {
  private defaultBackupPath = resolve(api.app.getPath('userData'), 'backups')
  private jsonFilter = { extensions: ['json'], name: '*' }

  @Query<Queue, QueueQuery, QueueVariables>({
    query: QUEUE_QUERY,
    variables() {
      return {
        ids: this.queue.map(prop<any, any>('id')).sort(sortNumber),
      }
    },
    update(data) {
      const items = indexBy(oc(data).queue.anime([] as QueueAnime[]), anime =>
        anime.id.toString(),
      )

      return this.queue.map(item => items[item.id])
    },
  })
  public animes!: QueueAnime[]

  public gridOptions = {
    animation: 150,
    handle: '.handle-wrapper',
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

  public get isExternalPlayer() {
    return oc(getPlayerData(this.$store)).provider() === Provider.Local
  }

  public get queue() {
    return getQueue(this.$store)
  }

  public set queue(value: IQueueItem[]) {
    setQueue(this.$store, value)
  }

  public getItem(id: number) {
    return this.queue.find(propEq('id', id)) as IQueueItem
  }

  public handleDrop({ removedIndex, addedIndex, payload }: any) {
    const newQueue = [...this.queue]

    newQueue.splice(removedIndex, 1)
    newQueue.splice(addedIndex, 0, payload)

    setQueue(this.$store, newQueue)
    this.$apollo.queries.animes.refresh()
  }

  public getChildPayload(index: number) {
    return this.queue[index]
  }

  public setProvider(id: number) {
    return (provider: Provider) => {
      setQueueItemProvider(this.$store, { id, provider })

      if (!this.getItem(id).open) {
        toggleQueueItemOpen(this.$store, id)
      }
    }
  }

  public async importFromQuery(
    query: typeof watchingQuery | typeof planningQuery | typeof pausedQuery,
    random: boolean = false,
  ) {
    if (!this.anilistUserId) return

    const queueBefore = [...this.queue]

    const { data, errors } = await query(this.$apollo, this.anilistUserId)

    const lists = oc(data).listCollection.lists([] as WatchingQueryLists[])

    if (!lists || lists.length < 1) {
      return sendErrorToast(
        this.$store,
        "Couldn't find any shows in that state!",
      )
    }

    const list = lists.find(complement(prop('isCustomList')))

    if (!list) {
      return sendErrorToast(
        this.$store,
        "Couldn't find any shows in that state!",
      )
    }

    const entries = prop<typeof list, 'entries'>('entries')(list)!.filter(
      isNotNil,
    )

    if (errors || !entries || entries.length < 1) {
      return sendErrorToast(
        this.$store,
        "Couldn't find any shows in that state!",
      )
    }

    const animes = entries.map(prop('info')).filter(isNotNil)

    if (random) {
      const entriesNotInQueue = entries.filter(entry => {
        const { id } = entry.info!

        return !this.queue.some(item => item.id === id)
      })

      if (entriesNotInQueue.length > 0) {
        const randomIdx = Math.floor(Math.random() * entriesNotInQueue.length)

        addToQueue(this.$store, entriesNotInQueue[randomIdx].info!)
      }
    } else {
      animes.forEach(anime => addToQueue(this.$store, anime))
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

    const data = this.animes.map(anime =>
      pick(anime, ['id', 'externalLinks', 'mediaListEntry']),
    )

    if (!existsSync(this.defaultBackupPath)) {
      mkdirSync(this.defaultBackupPath)
    }

    const savePath: string | undefined = remote.dialog.showSaveDialog(
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

    writeFileSync(savePath, JSON.stringify(data))

    sendToast(this.$store, {
      type: 'success',
      title: 'Exported Queue!',
      message: `Click this to see the file!`,
      timeout: 6000,
      click: () => shell.showItemInFolder(savePath),
    })
  }

  public importQueueFromBackup() {
    const openPaths: string[] | undefined = remote.dialog.showOpenDialog({
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

      if (typeof data !== 'object' || !Array.isArray(data)) {
        throw new Error('Could not parse backup file!')
      }

      if (data.some(({ id }) => typeof id !== 'number')) {
        throw new Error('This backup is too old and is not supported anymore.')
      }

      ;(data as any[]).forEach(item => addToQueue(this.$store, item))
    } catch (err) {
      sendErrorToast(this.$store, err.message)
    }
  }

  public clearQueue() {
    setQueue(this.$store, [])
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.queue {
  display: flex;

  position: absolute;
  top: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);

  .queue-container {
    position: relative;
    padding: 15px 25px;
    overflow-y: auto;
    overflow-x: hidden;

    width: 100%;
    min-width: 800px;
    user-select: none;

    & > .smooth-dnd-container {
      position: relative;
      height: 100%;

      & > .smooth-dnd-draggable-wrapper {
        position: relative;
        overflow: visible;
      }
    }

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
  }

  .sidebar {
    width: 325px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 20px 25px;
    background: #202130;
    transition: margin-bottom 0.25s;

    &.small {
      margin-bottom: 183px;
    }

    &.external {
      margin-bottom: 50px !important;
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
  transition: background 0.5s;

  & > .queue-container,
  & > .sidebar {
    transition: transform 0.5s;
  }

  & > .queue-container {
    overflow: visible;
  }
}

.route-enter,
.route-leave-to {
  background: none;

  & > .queue-container {
    transform: translateX(-100%);
  }

  & > .sidebar {
    transform: translateY(-125%);
  }
}
</style>
