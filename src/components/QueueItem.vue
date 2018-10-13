<template>
<ApolloQuery class="anime" :query="ANIME_QUEUE_QUERY" :variables="{ id }" @result="fetchEpisodes">
  <template slot-scope="{ result }">
    <router-link
      class="title-container"
      :to="`/anime/${id}`">
      <img
        class="image"
        :class="{faded: !getIsStatus(result.data, MediaListStatus.CURRENT, MediaListStatus.REPEATING)}"
        :src="result.data.anime.bannerImage"
      />

      <span class="title">{{result.data.anime.title.userPreferred}}</span>
    </router-link>

    <div class="content-container">
      <div>
        <span class="state">
          {{getHumanizedStatus(result.data)}}
        </span>

        <span :style="{width: '100%'}"/>

        <div class="buttons">
          <raised-button
            v-if="getIsStatus(result.data, MediaListStatus.CURRENT, MediaListStatus.REPEATING)"
            class="small"
            content="+"
            @click.native="incrementProgress(result.data, 1)"
          />

          <raised-button
            v-if="getIsStatus(result.data, MediaListStatus.CURRENT, MediaListStatus.REPEATING)"
            class="small"
            content="-"
            @click.native="incrementProgress(result.data, -1)"
          />

          <raised-button
            v-if="getIsStatus(result.data, MediaListStatus.PLANNING)"
            type="success"
            content="Start"
            @click.native="statusMutation(result.data, MediaListStatus.CURRENT)"
          />

          <raised-button
            v-if="getIsStatus(result.data, MediaListStatus.PAUSED, MediaListStatus.DROPPED)"
            type="success"
            content="Resume"
            @click.native="statusMutation(result.data, MediaListStatus.CURRENT)"
          />

          <raised-button
            v-if="getIsStatus(result.data, MediaListStatus.COMPLETED)"
            type="success"
            content="Rewatch"
            @click.native="statusMutation(result.data, MediaListStatus.REPEATING)"
          />

          <raised-button
            v-if="getIsStatus(result.data, MediaListStatus.CURRENT, MediaListStatus.REPEATING)"
            type="warning"
            content="Pause"
            @click.native="statusMutation(result.data, MediaListStatus.PAUSED)"
          />

          <raised-button
            v-if="getIsStatus(result.data, MediaListStatus.CURRENT, MediaListStatus.REPEATING)"
            type="danger"
            content="Drop"
            @click.native="statusMutation(result.data, MediaListStatus.DROPPED)"
          />

          <raised-button
            v-if="getIsStatus(result.data, MediaListStatus.DROPPED, MediaListStatus.PAUSED, MediaListStatus.COMPLETED, MediaListStatus.PLANNING)"
            class="large"
            content="Remove from Queue"
            @click.native="removeFromQueue(id)"
          />
        </div>
      </div>

      <loader v-if="!episodes"/>

      <div
        v-else-if="episodes.length > 0"
        class="episode-container"
      >
        <episodes
          :episodes="episodes"
          :clickEpisode="() => {}"
          small
        />
      </div>
    </div>
  </template>
</ApolloQuery>
</template>

<script lang="ts">
import { Prop, Vue } from 'vue-property-decorator'
import Component from 'vue-class-component'
import { path } from 'rambda'
import { mdiPlayCircleOutline } from '@mdi/js'

import Icon from './Icon.vue'
import Loader from './Loader.vue'
import RaisedButton from './RaisedButton.vue'
import Episodes from './Anime/Episodes.vue'
import ANIME_QUEUE_QUERY from '../graphql/AnimeQueueQuery.graphql'
import {
  AnimeQueueQuery,
  AnimeQueueQuery_anime_mediaListEntry,
} from '../graphql/AnimeQueueQuery'
import { sendErrorToast } from '../state/app'
import { Episode } from '../types'
import { humanizeMediaListStatus, prop } from '../utils'
import { MediaListStatus } from '../graphql-types'
import { AnimeCache } from '../lib/cache'
import { removeFromQueueById } from '../state/user'
import { setProgressMutation, setStatusMutation } from '../graphql/mutations'

@Component({
  components: { Loader, Episodes, RaisedButton, Icon },
})
export default class QueueItem extends Vue {
  @Prop(prop(Number, true))
  public id!: number

  public episodes: Episode[] | null = null

  public getHumanizedStatus(data?: AnimeQueueQuery) {
    const length = path<number>(['anime', 'episodes'], data)
    const listEntry = path<AnimeQueueQuery_anime_mediaListEntry>(
      'anime.mediaListEntry',
      data,
    )

    if (!length) return 'Error'

    if (!listEntry) return 'Not in List'

    return humanizeMediaListStatus(listEntry, length)
  }

  public getIsStatus(data?: AnimeQueueQuery, ...statuses: MediaListStatus[]) {
    return statuses.includes(
      path<MediaListStatus>(['anime', 'mediaListEntry', 'status'], data),
    )
  }

  public playSvg = mdiPlayCircleOutline
  public MediaListStatus = MediaListStatus
  public ANIME_QUEUE_QUERY = ANIME_QUEUE_QUERY

  private fetchedEpisodes = false

  public async fetchEpisodes({ data }: { data: AnimeQueueQuery }) {
    const listEntryId = path<number>('anime.idMal', data)

    if (this.fetchedEpisodes || !listEntryId) return

    this.fetchedEpisodes = true

    this.episodes = await AnimeCache.getSeasonFromMedia(listEntryId.toString())
  }

  public removeFromQueue(id: number) {
    removeFromQueueById(this.$store, id)
  }

  public async statusMutation(data: AnimeQueueQuery, status: MediaListStatus) {
    const listEntryId = path<number>('anime.mediaListEntry.id', data)

    if (!listEntryId) {
      return sendErrorToast(this.$store, 'No entry found..?')
    }

    await setStatusMutation(this.$apollo, listEntryId, status)
  }

  public async incrementProgress(data: AnimeQueueQuery, amount: number) {
    const listEntryId = path<number>('anime.mediaListEntry.id', data)
    const progress = path<number>('anime.mediaListEntry.progress', data) || 0
    if (!listEntryId) {
      return sendErrorToast(this.$store, 'No entry found..?')
    }

    if (progress + amount > data.anime.episodes || progress + amount < 0) {
      return
    }

    await setProgressMutation(
      this.$apollo,
      listEntryId,
      progress + amount,
      data.anime.mediaListEntry,
    )
  }

  // public setEpisode(episode: IEpisode) {
  //   setCurrentEpisode(this.$store, episode)
  // }
}
</script>

<style scoped lang="scss">
@import '../colors';

.anime {
  display: flex;
  flex-direction: column;

  position: relative;
  width: 100%;
  margin-bottom: 35px;
  border-radius: 5px;
  overflow: hidden;
  cursor: -webkit-grab;
  box-shadow: $shadow;

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
      transition: filter 500ms;

      &.faded {
        filter: grayscale(0.5) opacity(0.5) brightness(0.75);
      }
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
    background: lighten($dark, 5%);

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
