<template>
  <div
    v-if="nextAiringEpisode"
    class="next-episode-info"
    v-tooltip.top="nextEpisodeDateString"
  >
    Episode {{ nextAiringEpisode.episode }} in {{ nextEpisodeDistanceString }}
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { format, formatDistance } from 'date-fns'

import { Required } from '@/decorators'

@Component
export default class NextEpisodeInfo extends Vue {
  @Required(Object)
  public nextAiringEpisode!: {
    airingAt: number
    timeUntilAiring: number
    episode: number
  }

  public get nextEpisodeDateString() {
    if (!this.nextAiringEpisode) return null

    return format(
      this.nextAiringEpisode.airingAt * 1000,
      'iiii, do MMM - kk:mm',
    )
  }

  public get nextEpisodeDistanceString() {
    if (!this.nextAiringEpisode) return null

    return formatDistance(new Date(), this.nextAiringEpisode.airingAt * 1000)
  }
}
</script>
