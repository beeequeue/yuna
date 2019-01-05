<template>
  <div class="center-container">
    <info
      :id="id"
      :idMal="idMal"
      :rating="rating"
      :ratingMal="ratingMal"
      :nextAiringEpisode="nextAiringEpisode"
    />

    <description :content="content" :blur="blurDescription" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { AnimePageQueryNextAiringEpisode } from '@/graphql/types'

import Description from './Description.vue'
import Info from './Info.vue'
import Icon from '../Icon.vue'

@Component({
  components: { Description, Icon, Info },
})
export default class CenterContainer extends Vue {
  @Prop(String) public content!: string | null
  @Prop(Boolean) public blurDescription!: boolean | null
  @Prop(Number) public id!: number | null
  @Prop(Number) public idMal!: number | null
  @Prop(Number) public rating!: number | null
  @Prop(Number) public ratingMal!: number | null
  @Prop(Object)
  public nextAiringEpisode!: AnimePageQueryNextAiringEpisode | null
}
</script>

<style scoped lang="scss">
@import '../../colors';

.center-container {
  position: relative;
  pointer-events: none;

  & > * {
    pointer-events: all;
  }
}
</style>
