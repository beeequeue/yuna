<template>
  <span class="icon" :aria-label="label">
    <svg viewBox="0 0 24 24">
      <path :d="icon"></path>
    </svg>
  </span>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api"

export default defineComponent({
  props: {
    icon: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: null,
    },
  },
})
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
