<template>
<transition name="fade">
  <div class="title">
    <div class="english" :class="preferredStyle(english)">
      {{ english }}
    </div>

    <div class="romaji" :class="preferredStyle(romaji)">
      {{ romaji }}
    </div>

    <div class="native" :class="preferredStyle(native)">
      {{ native }}
    </div>
  </div>
</transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { PropOptions, Prop as IProp } from 'vue/types/options'

const prop = (type: IProp<any>, required?: boolean): PropOptions => ({
  type,
  required: !!required,
})

@Component
export default class AnimeTitle extends Vue {
  @Prop(prop(Boolean, true))
  public loading!: boolean
  @Prop(prop(String))
  public english!: string | null
  @Prop(prop(String))
  public romaji!: string | null
  @Prop(prop(String))
  public native!: string | null
  @Prop(prop(String))
  public preferred!: string | null

  public preferredStyle(str: string) {
    return str === this.preferred ? 'preferred' : null
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.title {
  display: flex;
  flex-direction: column;

  & > div {
    font-family: 'Raleway', sans-serif;
    margin: 5px 0;
    font-weight: 500;
    color: darken($white, 10%);
    text-align: left;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.75);
    user-select: initial;
    order: 2;

    &.preferred {
      margin: 0;
      font-size: 2em;
      font-weight: 300;
      color: $white;
      order: 1;
    }
  }
}
</style>
