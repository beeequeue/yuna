<template>
  <div
    ref="container"
    class="animated-height"
    :style="{ height: `${height}px`, width: `${width}px` }"
  >
    <transition name="h-w" mode="out-in">
      <slot />
    </transition>
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
  public width = 0
  public observer!: MutationObserver

  public mounted() {
    this.observer = new MutationObserver(() => this.update())
    this.observer.observe(this.$refs.container, {
      attributes: true,
      subtree: true,
      childList: true,
    })

    this.update()
  }

  private getExtreme(
    children: Element[],
    property: 'top' | 'bottom' | 'left' | 'right',
  ) {
    const extreme = ['top', 'left'].includes(property) ? 'min' : 'max'

    return children.reduce(
      (last, child) => {
        const value = child.getBoundingClientRect()[property]

        return Math[extreme](value, last)
      },
      extreme === 'min' ? Infinity : -Infinity,
    )
  }

  public update(type: 'height' = 'height') {
    this.$nextTick(() => {
      if (isNil(this.$refs.container)) {
        return
      }

      const children = Array.from(this.$refs.container.children)

      if (children.length < 1) {
        this[type] = 0

        return
      }

      const top = this.getExtreme(children, 'top')
      const bottom = this.getExtreme(children, 'bottom')
      const left = this.getExtreme(children, 'left')
      const right = this.getExtreme(children, 'right')

      this.height = bottom - top
      this.width = right - left
    })
  }
}
</script>

<style scoped lang="scss">
.animated-height {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  transition: height 0.25s, width 0.25s;

  & /deep/ *.h-w {
    &-enter-active,
    &-leave-active {
      transition: opacity 0.25s;
    }

    &-enter,
    &-leave-to {
      opacity: 0;
    }

    &-enter-active {
      transition-delay: 0.25s;
    }
  }
}
</style>
