<template>
  <div
    class="description"
    :class="{ open }"
    :style="{ maxHeight: open ? `${realMaxHeight}px` : null }"
  >
    <transition>
      <span ref="content" class="content" :class="{ blur }" v-html="content" />
    </transition>

    <div v-if="isContentTooBig" class="fade-overlay" @click="toggleOpen">
      <icon :icon="openSvg" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"
import { mdiChevronDown } from "@mdi/js"

import Icon from "@/common/components/icon.vue"

@Component({
  components: { Icon },
})
export default class Description extends Vue {
  @Prop(String) public content!: string | null
  @Prop(Boolean) public blur!: boolean | null

  $refs!: {
    content: HTMLElement
  }

  public open = false
  public realMaxHeight = 0
  public isContentTooBig = false

  public openSvg = mdiChevronDown

  public mounted() {
    this.doHeightChecks()
  }

  public updated() {
    this.doHeightChecks()
  }

  public doHeightChecks() {
    this.realMaxHeight = this.$refs.content.clientHeight + 10
    this.isContentTooBig = this.realMaxHeight > 160
  }

  public toggleOpen() {
    this.open = !this.open
  }
}
</script>

<style scoped lang="scss">
@import "../../../colors";

.description {
  position: relative;
  display: flex;
  flex-direction: column;
  background: $dark;
  border-radius: 5px;
  max-height: 150px;
  box-shadow: $shadow;
  overflow: hidden;
  will-change: max-height;
  transition: max-height 0.5s;

  & > .content {
    padding: 15px 20px;
    text-align: left;
    box-shadow: $shadow;
    user-select: initial;
    transition: filter 0.15s;
  }

  &:not(:hover) > .content.blur {
    filter: blur(4px);
  }

  & > .fade-overlay {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    bottom: 0;
    width: 100%;
    height: 35px;
    cursor: pointer;
    background: linear-gradient(
      0deg,
      $dark 0%,
      transparentize($dark, 0.25) 50%,
      transparentize($dark, 1) 100%
    );

    & > .icon {
      height: 25px;
      width: 25px;
      fill: $white;

      transition: transform 0.5s;
    }
  }

  &.open {
    & > .fade-overlay {
      background: transparent;

      & > .icon {
        transform: rotateZ(180deg);
      }
    }
  }
}
</style>
