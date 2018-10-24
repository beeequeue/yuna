<template>
<button class="button" :class="classes" @click="handleClick">
  <icon
    v-if="icon != null && !confirmTimeout"
    :icon="icon"
  />

  <icon
    v-if="confirmTimeout"
    class="alert"
    :icon="alertSvg"
  />

  <span v-if="content" class="content">
    {{confirm && confirmTimeout ? confirmText || 'Confirm' : content}}
  </span>
</button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Icon from './Icon.vue'
import { mdiAlertCircleOutline } from '@mdi/js'

@Component({ components: { Icon } })
export default class CButton extends Vue {
  @Prop(Function) public click?: () => any
  @Prop(String) public content?: string
  @Prop(String)
  public type?: 'normal' | 'success' | 'warning' | 'danger' | 'white'
  @Prop(String) public icon?: string
  @Prop(Boolean) public raised?: boolean
  @Prop(Boolean) public flat?: boolean
  @Prop(Boolean) public confirm?: boolean
  @Prop(String) public confirmText?: string

  public confirmTimeout: number | null = null

  public alertSvg = mdiAlertCircleOutline

  public get classes() {
    return {
      [this.type as string]: !!this.type,
      'with-icon': !!this.icon,
      raised: this.raised || (!this.flat && !this.raised),
      flat: this.flat,
    }
  }

  public handleClick() {
    if (!this.click) return

    if (!this.confirm) return this.click()

    if (!this.confirmTimeout) {
      this.confirmTimeout = window.setTimeout(() => {
        this.confirmTimeout = null
      }, 2500)
    } else {
      window.clearTimeout(this.confirmTimeout)
      this.confirmTimeout = null

      this.click()
    }
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

@mixin buttonEvents($property, $color) {
  &:hover {
    $property: lighten($color, 4%);
  }
  &:active {
    $property: darken($color, 4%);
  }
}

@mixin raised($color) {
  background: $color;

  &:hover {
    background: lighten($color, 4%);
  }
  &:active {
    background: darken($color, 4%);
  }

  & > .icon {
    fill: $white;
  }
}

@mixin flat($color) {
  background: transparent;
  color: $color;
  text-shadow: 0 0 1px transparentize($color, 0.65);

  &:active {
    background: rgba(0, 0, 0, 0.1);
  }

  & > .icon {
    fill: $color;
  }
}

@keyframes growBounce {
  0% {
    transform: scale(0.5);
  }
  35% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.button {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  user-select: none;

  transition: background 0.1s, color 0.1s, fill 0.1s;

  &.raised {
    color: $white;
    font-weight: 300;
    text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
    @include raised($highlight);

    &.success {
      @include raised($success);
    }

    &.warning {
      @include raised($warning);
    }

    &.danger {
      @include raised($danger);
    }

    &.white {
      font-weight: 400;
      color: #111;
      @include raised($white);

      & > .icon {
        fill: #111;
      }
    }
  }

  &.flat {
    font-weight: 600;
    @include flat($highlight);

    &.success {
      @include flat($success);
    }

    &.warning {
      @include flat($warning);
    }

    &.danger {
      @include flat($danger);
    }

    &.white {
      @include flat($white);
    }
  }

  & > .icon {
    width: 20px;
    height: 20px;

    &.alert {
      animation: growBounce 0.75s, shake 0.75s;
      animation-iteration-count: 1;
    }

    &.shake {
      animation: shake 0.25s;
      animation-iteration-count: 2;
    }
  }

  & > .content {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 2px 5px;
  }
}
</style>
