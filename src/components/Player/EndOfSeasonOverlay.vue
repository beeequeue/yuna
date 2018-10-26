<template>
<transition>
  <div class="next-episode-container">
    <h1 class="text">
      The End!
    </h1>

    <transition>
      <div v-for="sequel in sequels" v-if="isPlayerMaximized" :key="sequel.id" class="sequel">
        <h1 class="text">Next season{{sequels.length > 1 ? 's' : ''}}:</h1>

        <anime-banner class="banner" :anime="sequel"/>
      </div>
    </transition>
  </div>
</transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Sequel } from '@/state/app'
import { prop } from '@/utils'

import AnimeBanner from '../AnimeBanner.vue'
import CButton from '../CButton.vue'
import Icon from '../Icon.vue'

@Component({
  components: { AnimeBanner, CButton, Icon },
})
export default class EndOfSeasonOverlay extends Vue {
  @Prop(prop(Array, true))
  public sequels!: Sequel[]
  @Prop(prop(Boolean, true))
  public isPlayerMaximized!: boolean
}
</script>

<style scoped lang="scss">
@import '../../colors';

@keyframes expand {
  from {
    right: 100%;
  }
  to {
    right: 0;
  }
}

.text {
  font-size: 1.25em;
  padding: 5px;
  overflow: hidden;
  font-family: 'Raleway', sans-serif;
  text-shadow: $outline;
  font-weight: 600;
  margin: 0;
  filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.35));

  &.v-enter-active,
  &.v-leave-active {
    transition: 0.5s;
  }

  &.v-enter,
  &.v-leave-to {
    height: 0;
    padding: 0;
  }
}

.next-episode-container {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  user-select: none;

  & > .sequel {
    height: 150px;

    & > .button {
      position: relative;
      pointer-events: all;
      text-shadow: $outline !important;
      padding: 0.35em 2em 0.5em;
      font-size: 1.25em;
      height: 45px;
      overflow: hidden;

      &.v-enter-active {
        transition: 0.5s;
      }

      &.v-leave-active {
        transition: 0.25s;
      }

      &.v-enter,
      &.v-leave-to {
        height: 0;
        padding: 0;
      }

      &.v-leave,
      &.v-enter-to {
        height: 45px;
        padding: 0.35em 2em 0.5em;
      }
    }

    & > .banner {
      width: 750px;
      max-width: 90%;
      pointer-events: all;
      overflow: hidden;
      border-radius: 5px;
      box-shadow: $shadow;
    }

    &.v-enter-active {
      transition: opacity 0.5s, height 0.25s;
    }

    &.v-leave-active {
      transition: opacity 0.25s, height 0.5s;
    }

    &.v-enter,
    &.v-leave-to {
      height: 0;
      opacity: 0;
    }
  }

  &.v-enter-active,
  &.v-leave-active {
    transition: transform 0.75s;
  }

  &.v-enter {
    transform: translateX(100%);
  }

  &.v-leave-to {
    transform: translateX(-150%);
  }
}
</style>
