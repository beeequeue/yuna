<template>
<span class="icon">
  <svg viewBox="0 0 24 24">
    <path :d="icon"/>
  </svg>
</span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { prop } from '../utils'

@Component
export default class Icon extends Vue {
  @Prop(prop(String, true))
  public icon!: string
}
</script>

<style scoped lang="scss">
.icon {
  position: relative;
  display: inline-block;

  & > svg {
    height: 100%;
    width: 100%;
  }
}
</style>
