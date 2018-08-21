<template>
<span>
  <svg viewBox="0 0 24 24">
    <path :d="icon"/>
  </svg>
</span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Icon extends Vue {
  @Prop(String) public icon!: string
}
</script>

<style scoped lang="scss">
span {
  position: relative;
  display: inline-block;

  & > svg {
    height: 100%;
    width: 100%;
  }
}
</style>
