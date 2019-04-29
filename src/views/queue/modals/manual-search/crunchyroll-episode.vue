<template>
  <div class="episode">
    <div class="space" />

    <div class="title">{{ episode.title }}</div>

    <div class="filler" />

    <div class="episode-number" :class="{ visible: episodeNumber != null }">
      {{ episodeNumber }}
    </div>

    <checkbox
      :setting="`checked-${episode.id}`"
      :checked="selectedEpisode != null"
      :onChange="handleCheckChange"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { EpisodeListEpisodes } from '@/graphql/types'
import Checkbox from '@/common/components/form/checkbox.vue'

import { Required } from '@/decorators'
import { isNil, isNotNil } from '@/utils'

@Component({ components: { Checkbox } })
export default class CrunchyrollEpisode extends Vue {
  @Required(Object) episode!: EpisodeListEpisodes
  @Prop(Object) public selectedEpisode!: EpisodeListEpisodes | null
  @Required(Function) selectEpisodes!: (ids: EpisodeListEpisodes[]) => void
  @Required(Function) unselectEpisodes!: (ids: number[]) => void

  public get episodeNumber() {
    if (isNil(this.selectedEpisode)) return null

    return this.selectedEpisode.episodeNumber
  }

  public handleCheckChange(checked: boolean) {
    if (checked) {
      this.selectEpisodes([this.episode])
    } else if (isNotNil(this.selectedEpisode)) {
      this.unselectEpisodes([Number(this.selectedEpisode.id)])
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../../colors';

.episode {
  display: flex;
  align-items: center;
  padding: 0 15px;

  &:nth-child(odd) {
    background: color($dark, 300);
  }

  & > .space {
    width: 35px;
  }

  & > .filler {
    margin-left: auto;
  }

  & > .title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 450px;
  }

  & > .episode-number {
    flex-shrink: 0;
    margin: 0 10px;
    min-width: 20px;
    text-align: center;
    opacity: 0;
    transition: opacity 0.5s;

    &.visible {
      opacity: 1;
    }
  }
}
</style>
