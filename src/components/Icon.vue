<template>
<svg viewBox="0 0 24 24" :class="this.class" :style="style">
  <path :d="icon"/>
</svg>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Icon extends Vue {
  @Prop(String) icon!: string
  @Prop(String) class!: string
  @Prop(String) style!: any
}
</script>
