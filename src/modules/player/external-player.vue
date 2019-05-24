<template>
  <div class="external-player">
    <span class="progress" :style="{ width: progress * 100 + '%' }" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { basename } from 'path'

import { setProgress } from '@/common/mutations/episodes'
import { EpisodeListEpisodes } from '@/graphql/types'

import { Required } from '@/decorators'
import {
  ExternalPlayer as ExternalPlayerClass,
  ExternalPlayerEvent,
} from '@/lib/players/external-player'
import { VLC } from '@/lib/players/vlc'

@Component
export default class ExternalPlayer extends Vue {
  @Required(Number) index!: number
  @Required(Array) episodes!: EpisodeListEpisodes[]
  @Prop(Object) title!: { userPreferred: string }

  public progress = 0

  public finished = false

  public process: ExternalPlayerClass | null = null

  public get firstEpisode() {
    return this.episodes[0]
  }

  public mounted() {
    this.handleNewFile()
  }

  @Watch('index')
  public async handleNewFile() {
    // Open VLC/MPC-HC/whatever
    this.process = new VLC(
      this.$store,
      this.episodes.map(ep => ep.url).slice(this.index),
      {
        animeId: this.firstEpisode.animeId,
        title: this.title.userPreferred,
      },
    )
      .on(ExternalPlayerEvent.FINISHED_EPISODE, ({ fileName }) => {
        const episode = this.episodes.find(
          episode => basename(episode.url) === fileName,
        )!

        setProgress(this, episode)
      })
      .on(
        ExternalPlayerEvent.PROGRESS,
        ({ progress }) => (this.progress = progress),
      )
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.external-player {
  position: relative;
  height: 100%;
  width: 100%;

  & > .progress {
    position: absolute;
    bottom: 0;
    left: 0;
    background: $highlight;
    height: 100%;

    transition: width 1s;
  }
}
</style>
