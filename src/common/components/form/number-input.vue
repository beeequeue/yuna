<template>
  <label
    class="number-input"
    :class="classes"
    v-tooltip.bottom="validationError || error"
  >
    <span v-if="label != null">{{ label }}</span>

    <input :value="stringValue" @input="handleChange" />

    <span v-if="suffix" class="suffix">{{ suffix }}</span>
  </label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Required } from '@/decorators'
import { isNotNil } from '@/utils'

@Component
export default class NumberInput extends Vue {
  @Prop(String) public label!: string
  @Required(Number) public value!: number
  @Required(Function) public onChange!: (value: number) => any
  @Prop(String) public suffix!: string | null
  @Prop(Number) public min!: number | null
  @Prop(Number) public max!: number | null
  @Prop(String) public error!: string | null
  @Prop(Boolean) public disabled!: boolean | null

  public validationError: string | null = null
  public stringValue: string = this.value.toString()

  public get classes() {
    return {
      error: isNotNil(this.validationError) || isNotNil(this.error),
      disabled: this.disabled,
    }
  }

  public handleChange(e: InputEvent) {
    const value = Number(e.currentTarget.value)
    this.stringValue = e.currentTarget.value

    this.validationError = null

    if (isNaN(value)) {
      this.validationError = 'Not a number!'
      return
    }

    if (isNotNil(this.min) && value < this.min) {
      this.validationError = `Too low! (Minimum ${this.min})`
      return
    }

    if (isNotNil(this.max) && value > this.max) {
      this.validationError = `Too high! (Max ${this.max})`
      return
    }

    if (e.currentTarget.value === '') return this.onChange(0)

    this.onChange(value)
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

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
