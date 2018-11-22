<template>
<label
  class="dropdown"
  :class="classes"
  v-tooltip.bottom="error"
>
  <span>{{ label }}</span>

  <select
    :value="value"
    @input="handleChange"
  >
    <option
      v-for="item in items"
      :key="item.value"
      :value="item.value"
    >
      {{ item.label }}
    </option>
  </select>
</label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { MediaListStatus } from '@/graphql-types'
import { prop } from '@/utils'

export interface DropdownItem {
  label: string
  value: string
}

@Component
export default class Dropdown extends Vue {
  @Prop(prop(String, true))
  public label!: string
  @Prop(prop(Array, true))
  public items!: DropdownItem[]
  @Prop(String) public value!: MediaListStatus | null
  @Prop(prop(Function, true))
  public onChange!: (value: string) => any
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
@import '../../colors';

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
    background: darken($highlight, 15%);
    border-left: 2px solid darken($highlight, 15%);
    border-right: 2px solid darken($highlight, 15%);
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
      border-color: darken($danger, 10%);
    }
  }

  &.disabled {
    pointer-events: none;
    filter: grayscale(0.35);

    & > span {
      color: darken($white, 25%);
    }
  }
}
</style>
