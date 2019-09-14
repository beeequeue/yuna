<template>
  <div class="entry">
    <transition mode="out-in">
      <loading
        v-if="!entry || !media || media.loading"
        key="loader"
        :size="35"
      />
      <div v-else class="content" key="entry">
        <router-link :to="`/anime/${media.media.id}`" class="image">
          <img
            :src="
              media.media.bannerImage ||
                media.media.coverImage.extraLarge ||
                `http://lorempixel.com/325/115/abstract?${entry.id}`
            "
          />
        </router-link>

        <div class="title">
          {{ media.media.title.userPreferred }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { ListViewListEntries } from '@/graphql/types'
import { Required } from '@/decorators'

// @ts-ignore
import { ListMedia } from '@/views/list/list.vue'
import Actions from '@/common/components/actions.vue'
import Loading from '@/common/components/loading.vue'

@Component({ components: { Loading, Actions } })
export default class ListEntry extends Vue {
  @Required(Object) public entry!: ListViewListEntries
  @Prop(Object) public media!: ListMedia
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.entry {
  position: relative;
  height: 115px;
  width: 325px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  margin-left: calc(-325px / 4);
  margin-right: 5px;
  clip-path: polygon(25% 0, 100% 0, 75% 100%, 0 100%);
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

    & > .image {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;

      & > img {
        display: block;
        height: 100%;
        width: 100%;
        object-fit: cover;
      }
    }

    & > .title {
      width: 100%;
      padding: 8px;
      padding-right: 30px;
      padding-left: calc(25%);
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
    }
  }

  &.v-enter,
  &.v-leave-to {
    opacity: 0;
    transform: translateX(-100%);
  }

  &.v-enter-active,
  &.v-leave-active {
    z-index: 1; // To go under existing ones
    transition: transform 0.75s, opacity 0.5s;
  }

  &.v-leave-active {
    transition: transform 0.75s, opacity 0.75s;
  }
}
</style>
