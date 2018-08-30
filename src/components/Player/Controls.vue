<template>
<div class="controls">
  <div class="cover" @click="playOrPause"/>

  <!--<icon v-if=""/>-->

  <div class="toolbar">
    <span class="button-collapser">
      <transition>
        <icon v-if="paused" key="play" class="button" :icon="playSvg" @click.native="playOrPause"/>
        <icon v-else class="button" key="pause" :icon="pauseSvg" @click.native="playOrPause"/>
      </transition>
    </span>

    <span class="separator"/>

    <span class="button-collapser">
      <transition>
        <icon v-if="this.$route.path !== '/player-big'" key="max" class="button" :icon="maximizeSvg" @click.native="maximizePlayer"/>
        <icon v-else class="button" key="min" :icon="minimizeSvg" @click.native="$router.back()"/>
      </transition>
    </span>
  </div>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiArrowCollapse, mdiArrowExpand, mdiPause, mdiPlay } from '@mdi/js'

import Icon from '../Icon.vue'

@Component({
  components: { Icon },
})
export default class Controls extends Vue {
  @Prop(Boolean) public paused!: boolean
  @Prop() public playOrPause!: () => void

  public maximizePlayer() {
    this.$router.push('/player-big')
  }

  public playSvg = mdiPlay
  public pauseSvg = mdiPause
  public maximizeSvg = mdiArrowExpand
  public minimizeSvg = mdiArrowCollapse
}
</script>

<style scoped lang="scss">
@import '../../colors';

$buttonSize: 45px;

.controls {
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;

   & > .cover {
     position: absolute;
     top: 0;
     height: 100%;
     width: 100%;
   }
}

.toolbar {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 5px;
  display: flex;
  align-items: center;

  background: rgba(0, 0, 0, 0.75);

  & > .separator {
    width: 100%;
  }

  & > .button-collapser {
    position: relative;
    display: inline-block;
    flex-shrink: 0;
    height: $buttonSize;
    width: $buttonSize;

    & > .button {
      position: absolute;
      top: 0;
      left: 0;
    }
  }

  & .button {
    height: $buttonSize;
    width: $buttonSize;
    padding: 5px;

    fill: white;
    cursor: pointer;

    &.v-enter-active,
    &.v-leave-active {
      will-change: opacity;
      transition: opacity 0.1s, transform 0.1s;
    }

    &.v-enter,
    &.v-leave-to {
      opacity: 0;
      transform: scale(0.5);
    }
  }
}
</style>
