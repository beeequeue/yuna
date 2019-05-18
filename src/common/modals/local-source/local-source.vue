<template>
  <modal-base v-if="anime && $apolloData.loading === 0" :name="modalName">
    <div class="modal-body local-source-modal">
      <div class="header">
        <div>Selecting Local Folder for</div>
        <div class="title">{{ anime.title.userPreferred }}</div>
        <div>({{ anime.episodes }} episodes)</div>
      </div>

      <animated-height>
        <div v-if="creatingEpisodes">
          <loading :size="50" />
          <div class="creating-info">
            Extracting thumbnails...
          </div>
        </div>
        <div v-else class="anime-container">
          <div
            v-for="local in localAnime"
            :key="local.title + local.folderPath"
            :title="local.folderPath"
            @click="select(local)"
          >
            {{ local.title }} ({{ local.episodes }})
          </div>
        </div>
      </animated-height>
    </div>
  </modal-base>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import Fuse from 'fuse.js'
import { oc } from 'ts-optchain'

import ModalBase from '@/common/modals/base.vue'
import Loading from '@/common/components/loading.vue'
import { cacheEpisodes } from '@/common/mutations/episodes'
import LOCAL_SOURCE_ANIME from './local-source-anime.graphql'
import {
  EpisodeListEpisodes,
  LocalSourceAnimeQuery,
  LocalSourceAnimeVariables,
  Provider,
} from '@/graphql/types'

import { Query } from '@/decorators'
import {
  getLocalSourceOptions,
  ModalName,
  sendToast,
  toggleModal,
} from '@/state/app'
import { LocalAnime, LocalFiles } from '@/lib/local-files'
import { isNil } from '@/utils'
import AnimatedHeight from '@/common/components/animated-height.vue'

const combineDuplicatesBasedOnScore = (
  anime: Fuse.FuseResult<LocalAnime>[],
) => {
  const newArray: Fuse.FuseResult<LocalAnime>[] = []

  anime.forEach(oldAnime => {
    const index = newArray.findIndex(
      newAnime => newAnime.item.title === oldAnime.item.title,
    )

    if (index !== -1) {
      newArray[index].score = Math.min(oldAnime.score!, newArray[index].score!)

      return
    }

    newArray.push(oldAnime)
  })

  return newArray
}

@Component({ components: { AnimatedHeight, Loading, ModalBase } })
export default class LocalSourceModal extends Vue {
  public readonly modalName: ModalName = 'localSource'

  @Query<LocalSourceModal, LocalSourceAnimeQuery, LocalSourceAnimeVariables>({
    query: LOCAL_SOURCE_ANIME,
    variables() {
      return {
        id: this.animeId,
      }
    },
    skip() {
      return isNil(this.animeId)
    },
  })
  public anime!: LocalSourceAnimeQuery['anime']

  public localAnime: LocalAnime[] = []
  public creatingEpisodes = false

  public get animeId() {
    return oc(getLocalSourceOptions(this.$store)).anilistId() || null
  }

  public get titles() {
    return {
      english: oc(this.anime).title.english(''),
      romaji: oc(this.anime).title.romaji(''),
    }
  }

  @Watch('titles')
  public updateLocalAnime() {
    this.localAnime = LocalFiles.getLocalAnime()

    const fuse = new Fuse(this.localAnime, {
      caseSensitive: false,
      keys: ['title'],
      threshold: 0.85,
      includeScore: true,
    })

    // Search using both titles
    const englishResult = fuse.search(this.titles.english)
    const romajiResult = fuse.search(this.titles.romaji)

    // Compare both scores and select the highest one
    const combinedResults = combineDuplicatesBasedOnScore([
      ...englishResult,
      ...romajiResult,
    ])

    this.localAnime = combinedResults
      // Sort results by score
      .sort((a, b) => a.score! - b.score!)
      // Map back to the anime
      .map(result => result.item)
  }

  public async select(localAnime: LocalAnime) {
    this.creatingEpisodes = true

    let files

    try {
      files = await LocalFiles.getLocalAnimeFiles(this.animeId!, localAnime)
    } catch (err) {
      toggleModal(this.$store, this.modalName)
      setTimeout(() => {
        this.creatingEpisodes = false
      }, 750)

      const [title, message] = err.message.split('|')
      return sendToast(this.$store, {
        type: 'error',
        title,
        message: message || '😢',
        timeout: 10000,
      })
    }

    const progress = oc(this.anime).mediaListEntry.progress(0)

    const episodes = files.map<EpisodeListEpisodes>((file, index) => ({
      __typename: 'Episode',
      provider: Provider.Local,
      id: file.id,
      animeId: this.animeId!,
      title: file.title,
      duration: file.duration,
      progress: 0,
      index,
      episodeNumber: file.episodeNumber,
      thumbnail: file.thumbnail,
      url: file.filePath,
      subtitles: null,
      isWatched: progress >= file.episodeNumber,
    }))

    await cacheEpisodes(this, this.animeId!, Provider.Local, episodes)

    setTimeout(() => {
      this.creatingEpisodes = false
    }, 500)

    toggleModal(this.$store, this.modalName)

    const notification = {
      title: 'Finished extracting!',
      message: `${localAnime.title} is ready for watching!`,
    }

    sendToast(this.$store, {
      type: 'success',
      title: notification.title,
      message: notification.message,
      timeout: 10_000,
    })

    new Notification(notification.title, { body: notification.message })
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.local-source-modal {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: $dark;
  border-radius: 5px;
  box-shadow: $shadow;
  z-index: 1;

  & > .header {
    padding: 15px 35px;
    border-bottom: 2px solid color($dark, 600);

    & > .title {
      margin: 15px 0 0;
      font-family: 'Raleway', sans-serif;
      font-size: 1.25em;
      font-weight: 200;
      max-width: 400px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  & .loader {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  & .creating-info {
    margin-bottom: 10px;
    padding: 0 15px;

    &:last-child {
      padding-bottom: 15px;
    }
  }

  & .anime-container {
    position: relative;
    max-height: 45vh;
    overflow-y: auto;
    padding: 10px 20px;

    & > div {
      padding: 8px 15px;
      margin-bottom: 8px;
      cursor: pointer;
      border-radius: 5px;

      font-family: 'Raleway', sans-serif;

      transition: background 75ms;

      &:hover {
        background: color($dark, 500);
      }
    }
  }
}
</style>
