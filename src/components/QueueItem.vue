<template>
<div v-if="anime" class="anime">
  <router-link
    class="title-container"
    :to="`/anime/${id}`">
    <img class="image" :src="anime.landscapeImage"/>
    <span class="title">{{anime.title}}</span>
  </router-link>

  <div class="content-container">
    <div>
      <span class="state">
        {{humanizedStatus}}
      </span>

      <span :style="{width: '100%'}"/>

      <div class="buttons">
        <raised-button
          v-if="isStatus(MediaListStatus.CURRENT, MediaListStatus.REPEATING)"
          class="small"
          content="+"
        />

        <raised-button
          v-if="isStatus(MediaListStatus.CURRENT, MediaListStatus.REPEATING)"
          class="small"
          content="-"
        />

        <raised-button
          v-if="isStatus(MediaListStatus.PAUSED, MediaListStatus.DROPPED)"
          type="success"
          content="Resume"
        />

        <raised-button
          v-if="isStatus(MediaListStatus.COMPLETED)"
          type="success"
          content="Rewatch"
        />

        <raised-button
          v-if="isStatus(MediaListStatus.CURRENT, MediaListStatus.REPEATING)"
          type="warning"
          content="Pause"
        />

        <raised-button
          v-if="isStatus(MediaListStatus.CURRENT, MediaListStatus.REPEATING)"
          type="danger"
          content="Drop"
        />

        <raised-button
          v-if="isStatus(MediaListStatus.DROPPED, MediaListStatus.PAUSED, MediaListStatus.COMPLETED)"
          class="large"
          content="Remove from Queue"
        />
      </div>
    </div>

    <loader v-if="!anime.episodes"/>

    <div
      v-else-if="anime.episodes.length > 0"
      class="episode-container"
    >
      <episodes
        :episodes="anime.episodes"
        :clickEpisode="() => {}"
        small
      />
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { Prop, Vue } from 'vue-property-decorator'
import Component from 'vue-class-component'
import { mdiPlayCircleOutline } from '@mdi/js'

import Icon from './Icon.vue'
import Loader from './Loader.vue'
import RaisedButton from './RaisedButton.vue'
import Episodes from './Anime/Episodes.vue'
import ANIME_QUEUE_QUERY from '../graphql/AnimeQueueQuery.graphql'
import { AnimeQueueQuery } from '../graphql/AnimeQueueQuery'
import { setCurrentEpisode } from '../state/app'
import { Anime, Episode as IEpisode } from '../types'
import { prop, humanizeMediaListStatus } from '../utils'
import { MediaListStatus } from '../graphql-types'
import { AnimeCache } from '../lib/cache'

interface IAnime extends Anime {
  anilistId: number
  episodes: IEpisode[] | null
}

@Component({
  components: { Loader, Episodes, RaisedButton, Icon },
  apollo: {
    getAnime: {
      query: ANIME_QUEUE_QUERY,
      variables() {
        return {
          id: this.id,
        }
      },
      result(result: any) {
        ;(this as any).getCrunchyrollData(result)
      },
    },
  },
})
export default class QueueItem extends Vue {
  @Prop(prop(Number, true))
  public id!: number

  public anime: IAnime | null = null

  public get humanizedStatus() {
    if (!this.anime || !this.anime.user) return 'Error'

    if (!this.anime.user.state) return 'Not in List'

    return humanizeMediaListStatus(
      {
        status: this.anime.user.state,
        progress: this.anime.user.progress,
      },
      this.anime.length,
    )
  }

  public isStatus(...statuses: MediaListStatus[]) {
    if (!this.anime || !this.anime.user || !this.anime.user.state) return false

    return statuses.includes(this.anime.user.state)
  }

  public playSvg = mdiPlayCircleOutline
  public MediaListStatus = MediaListStatus

  private fethedEpisodes = false

  public async getCrunchyrollData(result: { data: AnimeQueueQuery }) {
    if (
      this.fethedEpisodes ||
      !result.data ||
      !result.data.Media ||
      !result.data.Media.title ||
      !result.data.Media.coverImage ||
      !result.data.Media.mediaListEntry
      // !result.data.Media.coverImage ||
    ) {
      return
    }

    this.fethedEpisodes = true

    this.anime = {
      anilistId: result.data.Media.id as number,
      title: result.data.Media.title.userPreferred as string,
      description: '',
      length: result.data.Media.episodes as number,
      portraitImage: result.data.Media.coverImage.large as string,
      landscapeImage: result.data.Media.bannerImage as string,

      user: {
        progress: result.data.Media.mediaListEntry.progress as number,
        state: result.data.Media.mediaListEntry.status as MediaListStatus,
      },

      episodes: null,
    }

    this.anime.episodes = await AnimeCache.getSeasonFromMedia(
      result.data.Media.idMal.toString(),
    )
  }

  public setEpisode(episode: IEpisode) {
    setCurrentEpisode(this.$store, episode)
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.anime {
  display: flex;
  flex-direction: column;

  position: relative;
  width: 100%;
  margin-bottom: 25px;
  border-radius: 5px;
  overflow: hidden;
  cursor: -webkit-grab;

  &.sortable-ghost {
    opacity: 0;
  }

  &.v-move {
    transition: 0.5s;
  }

  & > .title-container {
    position: relative;
    height: 75px;

    & > .image {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }

    & > .title {
      position: absolute;
      top: 0;
      left: 10%;
      height: 100%;
      width: 80%;

      display: flex;
      justify-content: center;
      align-items: center;

      font-family: 'Raleway', sans-serif;
      font-weight: 700;
      font-size: 1.5em;
      color: $white;
      text-shadow: $outline;
      filter: drop-shadow(1px 2px 2px rgba(0, 0, 0, 0.75));
    }
  }

  & > .content-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: rgba(0, 0, 0, 0.35);

    & > div {
      display: flex;
      justify-content: flex-start;
      align-items: center;

      & > .state {
        margin-bottom: -1px;
        padding: 0 15px;
        flex-shrink: 0;
        font-family: 'Raleway', sans-serif;
      }

      & > .buttons {
        flex-shrink: 0;

        & > .button {
          width: 85px;
          border-radius: 0;

          &:first-child {
            border-bottom-left-radius: 5px;
          }

          &.small {
            width: 50px;
          }

          &.large {
            width: auto;
            min-width: 100px;
          }
        }
      }
    }

    & > .episode-container {
      position: relative;
      width: 100%;
      padding: 15px;

      & > .episodes {
        z-index: 1;
        width: 100%;
      }
    }
  }
}
</style>
