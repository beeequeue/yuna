<template>
  <div
    ref="container"
    class="animated-height"
    :style="{ height: height + 'px' }"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class AnimatedHeight extends Vue {
  $refs!: {
    container: HTMLDivElement
  }

  public height = 0
  public observer!: MutationObserver

  public mounted() {
    this.observer = new MutationObserver(this.updateHeight)
    this.observer.observe(this.$refs.container, {
      attributes: true,
      subtree: true,
      childList: true,
    })

    this.updateHeight()
  }

  public updateHeight() {
    this.$nextTick(() => {
      const children = Array.from(
        this.$refs.container.children,
      ) as HTMLElement[]
      this.height = children.reduce(
        (previous, child) =>
          previous + child.offsetHeight - previous + child.offsetTop,
        0,
      )
    })
  }
}
</script>

<style scoped lang="scss">
.animated-height {
  position: relative;
  overflow: hidden;

  transition: height 0.25s;
}
</style>
