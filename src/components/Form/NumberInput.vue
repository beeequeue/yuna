<template>
  <label class="number-input" :class="classes" v-tooltip.bottom="error">
    <span v-if="label != null">{{ label }}</span>

    <input type="number" :value="value" @input="handleChange" @keydown.e.prevent="() => {}">

    <span v-if="suffix" class="suffix">{{ suffix }}</span>
  </label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Required } from '@/decorators'

@Component
export default class NumberInput extends Vue {
  @Prop(String) public label!: string
  @Required(Number) public value!: number
  @Required(Function) public onChange!: (value: number) => any
  @Prop(String) public suffix!: string | null
  @Prop(String) public error!: string | null
  @Prop(Boolean) public disabled!: boolean | null

  public get classes() {
    return {
      error: this.error != null,
      disabled: this.disabled,
    }
  }

  public handleChange(e: InputEvent) {
    this.onChange(Number(e.currentTarget.value))
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.number-input {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;

  & > span {
    margin-bottom: 5px;
    font-weight: 500;
    color: $white;
    transition: color 0.5s, font-weight 0.25s;
  }

  & > input {
    display: flex;
    align-items: center;
    padding: 5px 10px;
    height: 30px;
    width: 100%;
    border: 0;
    border-radius: 5px;
    background: $main;
    border-left: 2px solid $main;
    border-right: 2px solid $main;
    color: $white;
    font-weight: 300;
    transition: color 0.5s, border-color 0.5s, filter 0.5s;

    &::-webkit-inner-spin-button {
      display: none;
      width: 0;
    }
  }

  & > .suffix {
    position: absolute;
    bottom: 1px;
    right: 10px;
    font-weight: 300;
  }

  &.error {
    & > span {
      font-weight: 700;
      color: $danger;
    }

    & > input {
      border-color: $danger;
    }
  }

  &.disabled {
    pointer-events: none;
    filter: grayscale(0.35);

    & > span {
      color: $gray;
    }
  }
}
</style>
