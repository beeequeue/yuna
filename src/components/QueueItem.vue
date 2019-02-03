<template>
  <div class="anime">
    <div v-if="!$apollo.error && data" class="container">
      <anime-banner
        :anime="data.anime"
        :faded="
          !isStatus(data, MediaListStatus.Current, MediaListStatus.Repeating)
        "
      />

      <div class="handle"><icon :icon="listSvg" /></div>

      <div class="content-container">
        <div>
          <icon
            class="collapser"
            :class="{ flip: !item.open }"
            :icon="expandSvg"
            @click.native="toggleItemOpen"
          />

          <span class="state">{{ getHumanizedStatus(data) }}</span>

          <span :style="{ width: '100%' }" />

          <next-episode-info
            v-if="data.anime.nextAiringEpisode"
            :nextAiringEpisode="data.anime.nextAiringEpisode"
          />

          <div class="buttons">
            <c-button
              v-if="isStatus(data, MediaListStatus.Planning)"
              type="success"
              content="Start"
              @click.native="statusMutation(data, MediaListStatus.Current)"
            />

            <c-button
              v-if="
                isStatus(
                  data,
                  MediaListStatus.Paused,
                  MediaListStatus.Dropped,
                )
              "
              type="success"
              content="Resume"
              @click.native="statusMutation(data, MediaListStatus.Current)"
            />

            <c-button
              v-if="isStatus(data, MediaListStatus.Completed)"
              type="success"
              content="Rewatch"
              @click.native="statusMutation(data, MediaListStatus.Repeating)"
            />

            <c-button
              v-if="
                isStatus(
                  data,
                  MediaListStatus.Current,
                  MediaListStatus.Repeating,
                )
              "
              type="warning"
              content="Pause"
              @click.native="statusMutation(data, MediaListStatus.Paused)"
            />

            <c-button
              v-if="
                isStatus(
                  data,
                  MediaListStatus.Current,
                  MediaListStatus.Repeating,
                )
              "
              type="danger"
              content="Drop"
              @click.native="statusMutation(data, MediaListStatus.Dropped)"
            />

            <c-button
              v-if="
                !isStatus(
                  data,
                  MediaListStatus.Current,
                  MediaListStatus.Repeating,
                )
              "
              class="large"
              content="Remove from Queue"
              @click.native="removeFromQueue"
            />
          </div>
        </div>

        <transition>
          <div
            v-if="
              data.anime.idMal &&
                isStatus(
                  data,
                  MediaListStatus.Current,
                  MediaListStatus.Repeating,
                ) &&
                item.open
            "
            class="episode-container"
          >
            <episode-list
              :idMal="data.anime.idMal"
              :id="data.anime.id"
              :animeTitle="data.anime.title.userPreferred"
              :episodesInAnime="data.anime.episodes"
              :nextAiringEpisode="data.anime.nextAiringEpisode"
              :listEntry="data.anime.mediaListEntry"
              :links="data.anime.externalLinks"
              scrollToCurrentEpisode
              small
            />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator'
import Component from 'vue-class-component'
import { path } from 'rambdax'
import { mdiChevronDown, mdiMenu, mdiPlayCircleOutline } from '@mdi/js'

import { Query, Required } from '@/decorators'
import ANIME_QUEUE_QUERY from '@/graphql/AnimeQueueQuery.graphql'
import { rewatchMutation, setStatusMutation } from '@/graphql/mutations'
import {
  AnimeQueueQueryMediaListEntry,
  AnimeQueueQueryQuery,
  AnimeQueueQueryVariables,
  MediaListStatus,
} from '@/graphql/types'
import { QueueItem as IQueueItem } from '@/lib/user'
import { sendErrorToast } from '@/state/app'
import { removeFromQueueById, toggleQueueItemOpen } from '@/state/user'
import { humanizeMediaListStatus } from '@/utils'

import NextEpisodeInfo from './Anime/NextEpisodeInfo.vue'
import AnimeBanner from './AnimeBanner.vue'
import Icon from './Icon.vue'
import Loader from './Loader.vue'
import CButton from './CButton.vue'
import EpisodeList from './EpisodeList.vue'

@Component({
  components: {
    NextEpisodeInfo,
    AnimeBanner,
    Loader,
    EpisodeList,
    CButton,
    Icon,
  },
})
export default class QueueItem extends Vue {
  @Required(Object) public item!: IQueueItem

  @Query<QueueItem, AnimeQueueQueryQuery, AnimeQueueQueryVariables>({
    query: ANIME_QUEUE_QUERY,
    variables() {
      return {
        id: this.item.id,
      }
    },
    skip() {
      return !this.item.id
    },
  })
  public data: AnimeQueueQueryQuery | null = null

  public expandSvg = mdiChevronDown
  public listSvg = mdiMenu

  public getHumanizedStatus(data?: AnimeQueueQueryQuery) {
    const length = path<number>(['anime', 'episodes'], data)
    const listEntry = path<AnimeQueueQueryMediaListEntry>(
      'anime.mediaListEntry',
      data,
    )

    if (!listEntry) return 'Not in List'

    return humanizeMediaListStatus(listEntry, length)
  }

  public getIsStatus(
    data?: AnimeQueueQueryQuery,
    ...statuses: MediaListStatus[]
  ) {
    return statuses.includes(
      path<MediaListStatus>(['anime', 'mediaListEntry', 'status'], data),
    )
  }

  public playSvg = mdiPlayCircleOutline
  public MediaListStatus = MediaListStatus

  public removeFromQueue() {
    removeFromQueueById(this.$store, this.item.id)
  }

  public toggleItemOpen() {
    toggleQueueItemOpen(this.$store, this.item.id)
  }

  public async statusMutation(
    data: AnimeQueueQueryQuery,
    status: MediaListStatus,
  ) {
    const listEntryId = path<number>('anime.mediaListEntry.id', data)

    if (!listEntryId) {
      return sendErrorToast(this.$store, 'No entry found..?')
    }

    if (status === MediaListStatus.Repeating) {
      return rewatchMutation(this, listEntryId)
    }

    await setStatusMutation(this, listEntryId, status)
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.anime {
  position: relative;
  width: 100%;
  z-index: 2;
  will-change: transform, opacity;

  &:last-child {
    margin-bottom: 15px;
  }

  &.sortable-drag {
    height: 75px;
    width: 100%;
    overflow: hidden;
    opacity: 0.99;
  }

  &.v-enter,
  &.v-leave-to {
    z-index: 1;
    opacity: 0;
    position: absolute;
    transform: translateY(-75%);
    transition: transform 0.5s, opacity 0.35s;
  }

  & > .container {
    display: flex;
    flex-direction: column;

    position: relative;
    width: 100%;
    margin-bottom: 35px;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: $shadow;

    /* Fix for pixels showing behind .handle */
    & > .anime-banner /deep/ img {
      border-top-right-radius: 10px;
    }

    & > .handle {
      position: absolute;
      top: 0;
      right: 0;
      height: 75px;
      width: 45px;
      display: flex;
      align-items: center;
      background: $dark;
      cursor: -webkit-grab;

      & > .icon {
        fill: desaturate($highlight, 15%);
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

        & > .collapser {
          flex-shrink: 0;
          height: 32px;
          width: 45px;
          fill: $white;
          padding: 0 10px 0 10px;
          cursor: pointer;

          & /deep/ svg {
            transition: transform 0.5s;
          }

          &.flip /deep/ svg {
            transform: rotateZ(-180deg);
          }
        }

        & > .state {
          flex-shrink: 0;
          margin: 0 15px -1px 0;
          font-family: 'Raleway', sans-serif;
        }

        & > .next-episode-info {
          flex-shrink: 0;
          margin-right: 15px;
          margin-bottom: -1px;
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

      & > .episode-error {
        font-family: 'Raleway', sans-serif;
        font-weight: 300;
        font-size: 1.15em;
        margin: 10px 0;
      }

      & > .episode-container {
        position: relative;
        width: 100%;
        overflow-y: hidden;
        will-change: padding, max-height;

        & > .episodes {
          z-index: 1;
          width: 100%;
          padding: 15px;
          transition: padding 0.25s;

          &[data-episodes='0'] {
            padding: 0;
          }
        }

        &.v-enter-active,
        &.v-leave-active {
          transition: padding, 750ms, max-height 750ms;
        }

        &.v-enter,
        &.v-leave-to {
          max-height: 0;
          padding-top: 0;
          padding-bottom: 0;
        }

        &.v-enter-to,
        &.v-leave {
          max-height: 150px;
        }
      }
    }
  }
}
</style>
