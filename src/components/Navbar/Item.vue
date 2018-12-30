<template>
  <router-link class="item" :to="path">
    <span class="text">
      {{text}}
      <span class="underline"/>
    </span>
  </router-link>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Item extends Vue {
  @Prop(String) public text!: string
  @Prop(String) public path!: string
}
</script>

<style scoped lang="scss">
@import '../../colors';

.item {
  align-self: stretch;
  display: flex;
  justify-content: center;
  align-items: stretch;
  padding: 0 25px;

  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  font-size: 1.25em;
  color: $white;
  text-decoration: none;
  cursor: pointer;

  &.align-right {
    justify-self: flex-end;
  }
  &.align-left {
    justify-self: flex-start;
  }

  & > .text {
    position: relative;
    display: flex;
    align-items: center;

    & > .underline {
      position: absolute;
      height: 3px;
      width: 0;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);

      background: $white;
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;

      transition: width 0.25s;
    }
  }

  &:hover > .text > .underline {
    width: 80%;
  }

  &.router-link-active > .text > .underline {
    width: 120%;
  }
}
</style>
