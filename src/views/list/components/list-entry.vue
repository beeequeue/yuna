<template>
  <div class="entry" :class="{ [entry.mediaId]: true }">
    <transition mode="out-in">
      <loading
        v-if="!entry || !media || !media.media || media.loading"
        key="loader"
        :size="35"
      />
      <div
        v-else
        key="entry"
        class="content"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
      >
        <router-link :to="`/anime/${media.media.id}`" class="image">
          <img
            :src="
              media.media.bannerImage ||
              media.media.coverImage.extraLarge ||
              `http://lorempixel.com/325/115/abstract?${entry.id}`
            "
          />
        </router-link>

        <scrolling-text class="title" :hovering="hovering">
          {{ media.media.title.userPreferred }}
        </scrolling-text>

        <actions :anime="media.media" :list-entry="entry" small horizontal />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import Actions from '@/common/components/actions.vue'
import Loading from '@/common/components/loading.vue'
import ScrollingText from '@/common/components/scrolling-text.vue'
import { ListViewListEntries } from '@/graphql/generated/types'

import { Required } from '@/decorators'
import { ListMedia } from '../types'

@Component({ components: { ScrollingText, Loading, Actions } })
export default class ListEntry extends Vue {
  @Required(Object) public entry!: ListViewListEntries
  @Prop(Object) public media!: ListMedia

  public hovering = false

  public onMouseEnter() {
    this.hovering = true
  }

  public onMouseLeave() {
    this.hovering = false
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';
@import '../list-variables';

.entry {
  position: relative;
  height: 100%;
  max-height: $entryHeight;
  width: $entryWidth;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  clip-path: polygon(
    $triangleWidth 0,
    100% 0,
    calc(100% - #{$triangleWidth}) $entryHeight,
    0 $entryHeight
  );
  z-index: 2; // To go over entering ones

  & > .loader {
    &.v-leave-to {
      opacity: 0;
      transition: opacity 0.1s 0.8s;
    }
  }

  & > .content {
    transition: opacity 0.2s;
    &.v-enter {
      opacity: 0;
    }
  }

  & > .loader {
    align-items: center;
    justify-content: center;
  }

  & > .content {
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;

    &:hover {
      & > .actions {
        transform: translateX(0);
      }
    }

    & > .image {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;

      & > img {
        display: block;
        height: $entryHeight;
        width: $entryWidth;
        object-fit: cover;
      }
    }

    & > .title {
      width: 100%;
      padding-top: 8px;
      position: relative;
      overflow: hidden;

      font-family: 'Raleway', sans-serif;
      font-weight: 600;
      font-size: 1.35em;
      white-space: nowrap;
      text-align: left;
      text-overflow: ellipsis;
      color: white;
      text-shadow: outline(black);

      filter: drop-shadow(1px 2px 2px rgba(0, 0, 0, 0.15));
      pointer-events: none;

      & /deep/ .text {
        padding-left: $triangleWidth;
        padding-right: 30px;
      }
    }

    & > .actions {
      position: absolute;
      bottom: 0;
      right: calc(#{$triangleWidth} - 21px);
      filter: drop-shadow(-1px -2px 4px transparentize(black, 0.65));
      transform: translateX(calc(100% + #{$triangleWidth} - 21px));
      transition: transform 0.25s;

      & /deep/ .button {
        border-radius: 0;
        /*box-shadow: -1px -1px 4px transparentize(black, 0.25);*/
        box-shadow: none;

        & + .button.normal:not(:last-of-type) {
          border-right: 1px solid color($highlight, 600);
        }

        &:first-of-type {
          border-top-left-radius: 5px;
        }

        &:last-of-type {
          width: 40px;
          padding-right: 15px;
        }
      }
    }
  }

  &.v-enter,
  &.v-leave-to {
    transform: translateX(25%);
    opacity: 0;
  }

  &.v-move {
    transition: transform 0.25s;
  }

  &.v-enter-active,
  &.v-leave-active {
    z-index: 1; // To go under existing ones
    transition: opacity 0.15s, transform 0.25s;
  }

  &.v-leave-active {
    position: absolute;
    left: -15px;

    &:last-child,
    &.double:nth-last-child(2) {
      left: initial;
      right: -150px;
      top: 0;
    }

    &.double:last-child,
    &.double:nth-child(2) {
      top: initial;
      bottom: 0;
    }
  }
}
</style>
