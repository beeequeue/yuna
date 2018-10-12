<template>
<icon :icon="loaderSvg"/>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mdiLoading } from '@mdi/js'
import Icon from './Icon.vue'

@Component({
  components: { Icon },
})
export default class Loader extends Vue {
  public loaderSvg = mdiLoading
}
</script>

<style scoped lang="scss">
@import '../colors';

@keyframes loader {
  0% {
    transform: rotateZ(0deg);
  }
  100% {
    transform: rotateZ(360deg);
  }
}

.icon {
  animation: loader 1s linear;
  animation-iteration-count: infinite;
  fill: $white;
  height: 30px;
  width: 30px;
  margin: auto;
}
</style>
