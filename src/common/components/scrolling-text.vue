<template>
  <div class="scrolling-text">
    <div ref="container" class="container" :class="{ hovering }">
      <span ref="text" class="text"><slot /></span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator"
import { Required } from "@/decorators"
import { isNil } from "@/utils"

@Component
export default class ScrollingText extends Vue {
  @Required(Boolean) hovering!: boolean

  private scrollId: number | null = null

  $refs!: {
    container: HTMLDivElement
    text: HTMLSpanElement
  }

  public destroyed() {
    this.reset()
  }

  @Watch("hovering")
  public onHoveringChange() {
    if (isNil(this.$refs.text)) return

    if (this.hovering) {
      this.startScrolling()
    } else {
      this.reset()
    }
  }

  private reset() {
    clearInterval(this.scrollId!)
  }

  private startScrolling() {
    this.scrollId = window.setInterval(() => {
      const before = this.$refs.container.scrollLeft

      this.$refs.container.scrollBy({ left: 2 })

      const after = this.$refs.container.scrollLeft

      if (before === after) {
        return this.reset()
      }
    }, 12)
  }
}
</script>

<style scoped lang="scss">
@import "../../colors";

.scrolling-text > .container {
  display: flex;
  overflow-x: scroll;

  &::-webkit-scrollbar {
    display: none;
  }

  & > .text {
    position: relative;
    display: inline-block;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow-x: hidden;
  }

  &.hovering > .text {
    overflow-x: visible;
  }
}
</style>
