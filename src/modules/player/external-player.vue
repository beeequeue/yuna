<template>
  <div class="external-player">
    <span class="progress" :style="{ width: progress * 100 + '%' }" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { parse } from 'anitomyscript'

import { EpisodeListEpisodes, Provider } from '@/graphql/types'

import { Required } from '@/decorators'
import {
  ExternalPlayer as ExternalPlayerClass,
  ExternalPlayerEvent,
} from '@/lib/players/external-player'
import { VLC } from '@/lib/players/vlc'
import { isNil } from '@/utils'

@Component
export default class ExternalPlayer extends Vue {
  @Required(Number) currentEpisodeNumber!: number
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

  @Watch('episodeFilePath')
  public async handleNewFile() {
    if (this.firstEpisode.provider !== Provider.Local) return

    if (!isNil(this.process)) {
      this.process.close()
    }

    // Open VLC/MPC-HC/whatever
    this.process = new VLC(
      this.$store,
      this.episodes.map(ep => ep.url).slice(this.currentEpisodeNumber - 1),
      {
        animeId: this.firstEpisode.animeId,
        title: this.title.userPreferred,
      },
    )
      .on(ExternalPlayerEvent.FINISHED_EPISODE, () => {
        const anitomy = parse()
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
