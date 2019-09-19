<template>
  <div class="checkbox-container" :class="{ impossible }">
    <input
      v-show="false"
      :id="setting"
      type="checkbox"
      @change="handleChange"
      :checked="checked"
    />

    <label :for="setting">
      <div class="checkbox" :class="{ checked }">
        <icon :icon="!impossible ? checkSvg : crossSvg" />
      </div>
      {{ text }}
    </label>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiCheck, mdiClose } from '@mdi/js'

import { Required } from '@/decorators'

import CButton from '@/common/components/button.vue'
import Icon from '@/common/components/icon.vue'

@Component({
  components: { CButton, Icon },
})
export default class Checkbox extends Vue {
  @Prop(String) public text!: string | null
  @Required(String) public setting!: string
  @Required(Boolean) public checked!: boolean
  @Prop(Boolean) public impossible!: boolean
  @Required(Function) public onChange!: (value: boolean) => any

  public checkSvg = mdiCheck
  public crossSvg = mdiClose

  public handleChange(e: Event) {
    const target = e.target as HTMLInputElement

    this.onChange(target.checked)
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.checkbox-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
  user-select: none;

  &.impossible {
    pointer-events: none;

    & > label > .checkbox {
      background: $danger !important;
    }
  }

  & > label {
    width: 100%;
    display: flex;
    align-items: center;
    font-family: 'Raleway', sans-serif;
    font-size: 0.9em;
    font-weight: 300;
    cursor: pointer;

    & > .checkbox {
      flex-shrink: 0;
      height: 25px;
      width: 25px;
      padding: 2px;
      margin-right: 8px;
      background: $white;
      border-radius: 3px;
      overflow: hidden;
      transition: background 0.1s;

      &.checked {
        background: $success;
      }

      & > .icon {
        fill: $white;
        filter: drop-shadow(0 0 1px $white);
      }
    }
  }
}
</style>
