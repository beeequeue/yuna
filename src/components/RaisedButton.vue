<template>
<button class="button" :class="classes">
  <icon v-if="icon != null" :icon="icon"/>

  <span v-if="content" class="content">
    {{content}}
  </span>
</button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Icon from './Icon.vue'

@Component({
  components: { Icon },
})
export default class RaisedButton extends Vue {
  @Prop() public content?: any
  @Prop(String) public type?: 'normal' | 'danger'
  @Prop(String) public icon?: string

  public get classes() {
    return {
      [this.type as string]: !!this.type,
      'with-icon': !!this.icon,
    }
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
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  border: none;
  border-radius: 3px;
  background: $highlight;
  color: $white;
  cursor: pointer;
  user-select: none;

  transition: background 0.1s;

  @include buttonEvents($highlight);

  & > .icon {
    width: 20px;
    height: 20px;
    fill: $white;
  }

  & > .content {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 2px 5px;
  }

  &.danger {
    background: $danger;
    @include buttonEvents($danger);
  }
}
</style>
