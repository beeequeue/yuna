<template>
<transition-group class="toast-container">
  <div
    v-for="(toast, i) in toasts"
    ref="toasts"
    :key="toast.id"
    class="toast"
    :class="{[toast.type]: true}"
    :style="{top: getDistanceFromTop(i) + 'px'}"
    @click="e => handleClick(e, toast)"
  >
    <div class="title">{{toast.title}}</div>
    <div class="message">{{toast.message}}</div>

    <icon
      class="close"
      :icon="closeSvg"
    />
  </div>
</transition-group>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mdiClose } from '@mdi/js'

import { getToasts, removeToast, Toast } from '@/state/app'
import Icon from './Icon.vue'

@Component({
  components: { Icon },
})
export default class ToastOverlay extends Vue {
  public get toasts() {
    return getToasts(this.$store)
  }

  public closeSvg = mdiClose
  public $refs!: {
    toasts: HTMLDivElement[]
  }

  public getDistanceFromTop(index: number) {
    if (!this.$refs.toasts) return 0

    return this.$refs.toasts
      .slice(0, index)
      .reduce((accum, el) => accum + el.clientHeight + 10, 0)
  }

  public handleClick(e: any, toast: Toast) {
    const clickedOnClose = e.path.some(
      (el: HTMLElement) =>
        el.className && el.className.toString().includes('close'),
    )

    if (!clickedOnClose && toast.click) toast.click()

    this.close(toast.id)
  }

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
  width: 350px;
  z-index: 100;

  & .toast {
    display: inline-flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    position: absolute;
    right: 0;
    min-width: 150px;
    max-width: 100%;
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

    & > .message {
      text-align: left;
    }

    & > .close {
      position: absolute;
      top: 0;
      right: 0;
      height: 35px;
      width: 35px;
      padding: 6px;
    }

    &.v-move,
    &.v-enter-active,
    &.v-leave-active {
      will-change: transform, opacity;
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
