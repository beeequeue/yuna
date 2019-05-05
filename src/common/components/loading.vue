<template>
  <icon
    :icon="loadingSvg"
    :style="{ height: `${size}px`, width: `${size}px` }"
    class="loader loading"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiLoading } from '@mdi/js'

import Icon from './icon.vue'

@Component({ components: { Icon } })
export default class Loading extends Vue {
  @Prop(Number) size!: number | null

  public loadingSvg = mdiLoading
}
</script>

<style scoped lang="scss">
@import '../../colors';

@keyframes spin {
  from {
    transform: rotateZ(0deg);
  }
  to {
    transform: rotateZ(360deg);
  }
}

.icon {
  position: relative;
  width: 100%;
  height: 100%;
  fill: $white;
  animation: spin 1s linear;
  animation-iteration-count: infinite;
}
</style>
