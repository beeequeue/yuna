<template>
  <div class="container">
    <div class="queue">
      <queue-item v-for="item in queue" :item="item" :key="item.series.crunchyroll.id" class="anime"/>
    </div>

    <div class="sidebar"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Icon from '../components/Icon.vue'
import { updateQueue } from '../state/user'
import QueueItem from '../components/QueueItem.vue'


@Component({
  components: { QueueItem, Icon },
})
export default class Queue extends Vue {
  get queue() {
    return this.$store.state.user.queue
  }

  public mounted() {
    updateQueue(this.$store)
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.container {
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-rows: 1fr 170px;
  grid-template-areas:
    'queue sidebar'
    'queue player';

  width: 100%;
  height: 100%;

  .queue {
    grid-area: queue;
    padding: 15px 25px;
    overflow-y: auto;

    min-width: 800px;
    background: #10111a;
    user-select: none;
  }

  .sidebar {
    grid-area: sidebar;
    background: #1a1b29;
  }
}

.v-enter-active,
.v-leave-active {
  transition: none 0.5s; // Required for Vue to realize there are transitions

  & > .queue,
  & > .sidebar {
    transition: transform 0.5s;
  }
}

.v-enter,
.v-leave-to {
  & > .queue {
    transform: translateX(-100%);
  }

  & > .sidebar {
    transform: translateX(100%);
  }
}
</style>
