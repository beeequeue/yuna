<template>
  <div class="loading">
    <icon :icon="loadingSvg"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mdiLoading } from '@mdi/js'

import Icon from '@/components/Icon.vue'

@Component({ components: { Icon } })
export default class Loading extends Vue {
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

.loading {
  position: absolute;
  width: 100%;
  padding: 10px;
  transition: opacity 0.5s;

  & > .icon {
    height: 35px;
    width: 35px;
    fill: $white;
    animation: spin 1s linear;
    animation-iteration-count: infinite;
  }

  &.v-enter,
  &.v-leave-to {
    opacity: 0;
  }
}
</style>
