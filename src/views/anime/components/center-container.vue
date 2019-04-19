<template>
  <div class="center-container">
    <info
      :id="id"
      :idMal="idMal"
      :score="score"
      :nextAiringEpisode="nextAiringEpisode"
    />

    <description :content="content" :blur="blurDescription" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { AnimeViewNextAiringEpisode } from '@/graphql/types'
import { Required } from '@/decorators'

import Icon from '@/common/components/icon.vue'
import Description from './description.vue'
import Info from './info.vue'

@Component({
  components: { Description, Icon, Info },
})
export default class CenterContainer extends Vue {
  @Prop(String) public content!: string | null
  @Prop(Boolean) public blurDescription!: boolean | null
  @Required(Number) public id!: number
  @Prop(Number) public idMal!: number | null
  @Prop(Number) public score!: number | null
  @Prop(Object)
  public nextAiringEpisode!: AnimeViewNextAiringEpisode | null
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.center-container {
  position: relative;
  pointer-events: none;

  & > * {
    pointer-events: all;
  }
}
</style>
