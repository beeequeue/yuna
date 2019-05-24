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
import { isNil } from '@/utils'

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
      if (isNil(this.$refs.container)) {
        return
      }

      const children = this.$refs.container.children

      if (children.length < 1) {
        this.height = 0

        return
      }

      const lastChild = children.item(children.length - 1) as HTMLElement
      this.height =
        lastChild.offsetHeight +
        lastChild.offsetTop +
        parseInt(getComputedStyle(lastChild).marginBottom || '0')
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
