<template>
  <div class="container">
    <div class="queue">
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

    <div class="sidebar">
      <span class="fill"/>

      <c-button
        content="Import Watching from List"
        :click="sendNotImplementedToast"
      />

      <c-button
        content="Import from Crunchyroll"
        :click="sendNotImplementedToast"
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
import { mdiPlaylistRemove } from '@mdi/js'

import QueueItem from '../components/QueueItem.vue'
import CButton from '../components/CButton.vue'
import { getQueue, setQueue } from '../state/user'
import { sendNotImplementedToast } from '../state/app'

@Component({
  components: { Draggable, QueueItem, CButton },
})
export default class Queue extends Vue {
  public clearListSvg = mdiPlaylistRemove

  public draggableOptions = {
    animation: 150,
    handle: '.handle',
  }

  public get queue() {
    return getQueue(this.$store)
  }

  public set queue(value: number[]) {
    setQueue(this.$store, value)
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
    grid-area: sidebar;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 20px 25px;

    background: #1a1b29;

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
