<template>
<button class="button" :class="typeClass">
  <slot/>
</button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

export enum Type {
  NORMAL = 'normal',
  DANGER = 'danger',
}

@Component
export default class RaisedButton extends Vue {
  @Prop(String) type?: Type

  public get typeClass() {
    return this.type
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

@mixin buttonEvents($color) {
  &:hover {
    background: lighten($color, 4%);
  }
  &:active {
    background: darken($color, 4%);
  }
}

.button {
  padding: 6px 15px;
  border: none;
  border-radius: 3px;
  background: $highlight;
  color: $white;
  cursor: pointer;

  transition: background 0.1s;

  @include buttonEvents($highlight);

  &.danger {
    background: $danger;
    @include buttonEvents($danger);
  }
}
</style>
