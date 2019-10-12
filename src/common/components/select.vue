<template>
  <transition>
    <div ref="button" class="multi-select" @click="open = !open">
      <span class="count">
        {{ selectedLabel ? selectedLabel : 'Streaming Sources' }}
      </span>

      <icon :icon="backSvg" class="tick" :class="tickClasses" />

      <portal to="modal">
        <div
          v-if="open"
          class="backdrop"
          key="backdrop"
          @click="open = false"
        />

        <div
          v-if="open"
          key="dropdown"
          class="dropdown"
          :style="dropdownPosition"
          ref="dropdown"
        >
          <div
            v-for="item in items"
            class="item"
            :key="item.value"
            @click="select(item)"
          >
            {{ item.label }}
          </div>
        </div>
      </portal>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator'
import { mdiChevronDown } from '@mdi/js'

import Icon from './icon.vue'
import { capitalize, px } from '@/utils'
import { SelectItem, StreamingSource } from '@/types'

@Component<CSelect>({ components: { Icon } })
export default class CSelect extends Vue {
  @Prop(String)
  public value!: string | null

  public $refs!: {
    button: HTMLDivElement
    dropdown: HTMLDivElement
  }

  public backSvg = mdiChevronDown

  public open = false
  public dropdownPosition: CSSProps = {}

  public items: SelectItem[] = [
    {
      label: capitalize(StreamingSource.Crunchyroll),
      value: StreamingSource.Crunchyroll,
    },
    {
      label: capitalize(StreamingSource.Hidive),
      value: StreamingSource.Hidive,
    },
  ]

  public get tickClasses() {
    return {
      down: this.open,
    }
  }

  public get selectedLabel() {
    const item = this.items.find(item => item.value === this.value)
    return item ? item.label : null
  }

  @Emit('input')
  public select(item: SelectItem) {
    this.open = false

    if (this.value && this.value === item.value) {
      return null
    }

    return item.value
  }

  @Watch('open')
  public async updatePosition() {
    if (!this.open) return

    await this.$nextTick()

    const buttonRect = this.$refs.button.getBoundingClientRect()
    const dropdownRect = this.$refs.dropdown.getBoundingClientRect()

    this.dropdownPosition = {
      top: px(buttonRect.top + buttonRect.height + 10),
      left: px(buttonRect.left + buttonRect.width / 2 - dropdownRect.width / 2),
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.multi-select {
  position: relative;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  & > .count {
    position: relative;
    bottom: 5px;
    font-weight: 600;
    transition: opacity 0.15s;

    &.v-enter,
    &.v-leave-to {
      opacity: 0;
    }
  }

  & > .tick {
    position: absolute;
    height: 25px;
    width: 25px;
    fill: $white;
    bottom: -10px;
    transition: 0.15s;

    &.down {
      bottom: -12px;
    }
  }
}

.backdrop {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9;
}

.dropdown {
  position: absolute;
  width: 150px;
  background: $dark;
  border-radius: 5px;
  box-shadow: $shadow;
  overflow: hidden;
  z-index: 10;
  transition: transform 0.15s, opacity 0.15s;

  &.v-enter,
  &.v-leave-to {
    opacity: 0;
    transform: translateY(-5px);
  }

  & > .item {
    padding: 6px 10px;
    cursor: pointer;
    user-select: none;
    transition: background 0.15s;

    &:hover {
      background: color($dark, 500);
    }
  }
}
</style>
