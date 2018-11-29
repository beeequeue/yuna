<template>
<div class="steps-container">
  <div v-for="(_, i) in steps" class="step" :class="{ current: current === i, done: current > i }">
    {{ i + 1 }}
  </div>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Step } from '@/views/FirstTimeSetup.vue'
import { prop } from '@/utils'

@Component({ components: {} })
export default class Steps extends Vue {
  @Prop(prop(Array, true))
  public steps!: Step[]
  @Prop(prop(Number, true))
  public current!: number
}
</script>

<style scoped lang="scss">
@import '../../colors';

.steps-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  user-select: none;

  & > .step {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 35px;
    width: 35px;
    margin: 5px 0;
    margin-right: 15px;
    border: 2px solid $dark;
    border-radius: 100%;
    background: $dark;
    font-size: 1.35em;
    font-weight: 500;
    box-shadow: $shadow;

    transition: background 0.5s, color 0.5s, border-color 0.5s;

    &.current {
      border-color: $highlight;
    }

    &.done {
      background: $success;
      border-color: $success;
      color: black;
    }
  }
}
</style>
