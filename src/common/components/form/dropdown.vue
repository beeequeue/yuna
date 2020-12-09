<template>
  <label v-tooltip.bottom="error" class="dropdown" :class="classes">
    <span v-if="label != null">{{ label }}</span>

    <select :value="value" @input="handleChange">
      <option
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled"
      >
        {{ item.label }}
      </option>
    </select>
  </label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"

import { Required } from "@/decorators"

export type DropdownItem = {
  label: string
  value: string
  disabled?: boolean
}

@Component
export default class Dropdown extends Vue {
  @Required(Array) public items!: DropdownItem[]
  @Required(Function) public onChange!: (value: string) => any
  @Prop(String) public label!: string | null
  @Prop() public value!: any | null
  @Prop(String) public error!: string | null
  @Prop(Boolean) public disabled!: boolean | null

  public get classes() {
    return {
      error: this.error != null,
      disabled: this.disabled,
    }
  }

  public handleChange(e: InputEvent<HTMLSelectElement>) {
    this.onChange(e.currentTarget.value)
  }
}
</script>

<style scoped lang="scss">
@import "../../../colors";

.dropdown {
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

  & > select {
    display: flex;
    align-items: center;
    padding: 0 10px;
    width: 100%;
    height: 30px;
    border: 0;
    border-radius: 5px;
    background: $main;
    border-left: 2px solid $main;
    border-right: 2px solid $main;
    color: $white;
    font-weight: 300;
    transition: color 0.5s, border-color 0.5s;
  }

  &.error {
    & > span {
      font-weight: 700;
      color: $danger;
    }

    & > select {
      border-color: $danger;
    }
  }

  &.disabled {
    pointer-events: none;
    filter: grayscale(0.5);

    & > span {
      color: $gray;
    }
  }
}
</style>
