<template>
  <span class="icon">
    <svg viewBox="0 0 24 24">
      <path :d="icon"></path>
    </svg>
  </span>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Required } from '@/decorators'

@Component
export default class Icon extends Vue {
  @Required(String) public icon!: string
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
