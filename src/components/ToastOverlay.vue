<template>
<div class="toast-container">
  <transition-group>
    <div
      v-for="(toast, i) in toasts"
      :key="toast.id"
      class="toast"
      :class="{[toast.type]: true}"
      :style="{top: i * 75 + 'px'}"
      @click="close(toast.id)"
    >
      <div class="title">{{toast.title}}</div>
      <div class="message">{{toast.message}}</div>

      <icon :icon="closeSvg" class="close"/>
    </div>
  </transition-group>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mdiClose } from '@mdi/js'

import Icon from './Icon.vue'
import { getToasts, removeToast } from '../state/app'

@Component({
  components: { Icon },
})
export default class ToastOverlay extends Vue {
  public get toasts() {
    return getToasts(this.$store)
  }

  public closeSvg = mdiClose

  public close(id: string) {
    removeToast(this.$store, id)
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.toast-container {
  position: absolute;
  top: 100px;
  bottom: 0;
  right: 20px;
  pointer-events: none;
  width: 750px;

  & > span {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  & .toast {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    position: absolute;
    right: 0;
    height: 65px;
    min-width: 150px;
    width: auto;
    padding: 10px 35px 10px 20px;
    background: #888;
    color: black;
    pointer-events: all;
    border-radius: 6px;
    box-shadow: 1px 2px 12px black;
    cursor: pointer;

    &.info {
      background: $main;
      color: $white;
      fill: $white;
    }
    &.success {
      background: #65cb58;
    }
    &.warning {
      background: #ea9a47;
    }
    &.error {
      background: #da2028;
      color: $white;
      fill: $white;
    }

    & > .title {
      font-family: 'Raleway', sans-serif;
      font-size: 1.1em;
      font-weight: 700;
    }

    & > .close {
      position: absolute;
      top: 16px;
      right: 15px;
      height: 15px;
      width: 15px;
    }

    &.v-move,
    &.v-enter-active,
    &.v-leave-active {
      will-change: opacity;
      transition: transform 0.25s, opacity 0.15s;
    }

    &.v-enter,
    &.v-leave-to {
      opacity: 0;
      transform: translateX(15%);
    }
  }
}
</style>
