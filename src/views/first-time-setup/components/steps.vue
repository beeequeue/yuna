<template>
  <div class="steps-container">
    <div
      v-for="(step, i) in steps"
      :key="step"
      class="step"
      :class="getClasses(step, i)"
    >
      <div class="name">{{ getStepName(step) }}</div>
      {{ i + 1 }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Required } from '@/decorators'
import { SetupStep } from '@/state/settings'

@Component
export default class Steps extends Vue {
  @Required(Array) public steps!: string[]
  @Prop(String) public current!: SetupStep | null

  public getStepName(step: SetupStep) {
    switch (step) {
      case SetupStep.LIST_MANAGERS:
        return 'List managers'
      case SetupStep.CONNECT:
        return 'Streaming services'
      case SetupStep.SPOILERS:
        return 'Spoiler settings'
      case SetupStep.DISCORD:
        return 'Discord Rich Presence'
      case SetupStep.LOCAL_FILES:
        return 'Local files'
    }
  }

  public getClasses(step: SetupStep, i: number) {
    return {
      current: this.current === step,
      done: this.current == null || this.steps.indexOf(this.current) > i,
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.steps-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  user-select: none;

  & > .step {
    position: relative;
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

      & > .name {
        opacity: 1;
      }
    }

    &.done {
      background: $success;
      border-color: $success;
      color: black;
    }

    & > .name {
      position: absolute;
      right: calc(100% + 10px);
      font-size: 14px;
      width: 100px;
      color: $white !important;
      text-align: right;
      text-shadow: $outline;
      font-family: 'Raleway', sans-serif;
      opacity: 0.6;
      transition: opacity 0.5s;
    }
  }
}
</style>
