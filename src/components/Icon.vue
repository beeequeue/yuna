<template>
<svg viewBox="0 0 24 24">
  <path :d="icon"/>
</svg>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Icon extends Vue {
  @Prop(String) icon!: string
}
</script>
