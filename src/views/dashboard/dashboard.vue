<template>
  <div class="container">
    <changelog />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import CButton from '@/common/components/button.vue'
import Changelog from './components/changelog.vue'

@Component({ components: { Changelog, CButton } })
export default class Dashboard extends Vue {}
</script>

<style scoped lang="scss">
@import '../../colors';

.container {
  position: absolute;
  top: 80px;
  bottom: 0;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
}

.route-enter-active,
.route-leave-active {
  transition: none 0.5s; // Required for Vue to realize there are transitions

  & > .changelog {
    transition: opacity 0.5s, transform 0.5s;
  }
}

.route-enter,
.route-leave-to {
  & > .changelog {
    opacity: 0;
    transform: translateY(-10%);
  }
}
</style>
