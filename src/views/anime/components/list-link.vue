<template>
  <a class="item" :href="link" title="simkl">
    <span v-if="logo.trim().endsWith('</svg>')" class="logo" v-html="logo" />
    <img v-else class="logo" :src="logo" />

    <animated-size>
      <span v-if="loading" class="rating" key="loading">...</span>
      <span v-else-if="scoreString != null" class="rating" key="rating">{{
        scoreString
      }}</span>
    </animated-size>
  </a>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Default, Required } from '@/decorators'
import AnimatedSize from '@/common/components/animated-size.vue'
@Component({
  components: { AnimatedSize },
})
export default class ListLink extends Vue {
  @Required(String) public logo!: string
  @Default(String, 'hundred') public type!: 'percent' | 'hundred'
  @Prop(Boolean) public loading!: boolean
  @Prop(String) public link!: string | null
  @Prop(Number) public score!: number | null

  public get scoreString() {
    if (!this.score) return null

    return this.type === 'hundred' ? this.score.toFixed(2) : `${this.score}%`
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.item > .logo {
  position: relative;
  height: 20px;
  padding: 5px 10px;
  box-sizing: initial !important;
  object-fit: contain;

  & img {
    padding: 5px 10px;
    height: 15px;
  }

  & /deep/ svg {
    height: 20px;
    width: 20px;
  }
}

.rating {
  font-weight: 800;
  font-size: 18px;
  padding: 5px 10px;
  padding-left: 0;
}
</style>
