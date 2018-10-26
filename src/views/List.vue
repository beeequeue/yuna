<template>
  <div class="list">
    Not implemented yet!
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class List extends Vue {}
</script>

<style scoped lang="scss">
@import '../colors';

.list {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2em;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  text-shadow: $outline;
  filter: drop-shadow($shadow);
  height: 100%;
  width: 100%;
}

.route-enter-active,
.route-leave-active {
  transition: transform 0.5s, opacity 0.5s;
}

.route-enter,
.route-leave-to {
  opacity: 0;
  transform: translateY(-5%);
}
</style>
