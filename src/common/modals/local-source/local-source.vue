<template>
  <modal-base v-if="anime && $apolloData.loading === 0" :name="modalName">
    <div class="modal-body local-source-modal">
      <div class="header">
        <div>Selecting Local Folder for</div>
        <div class="title">{{ anime.title.userPreferred }}</div>
        <div>({{ anime.episodes }} episodes)</div>

        <a
          href="https://github.com/BeeeQueue/yuna/blob/master/docs/local-files.md#my-show-isnt-showing-up--the-episodes-are-numbered-incorrectly"
          class="help-link"
        >
          Is your show not showing up (heh)?
        </a>
      </div>

      <div class="folder" :title="selectedFolder">
        <div class="placeholder" />

        <div class="text">
          {{ selectedFolder }}
        </div>

        <c-button
          v-tooltip.top="
            !manuallySelected
              ? 'Manually select folder'
              : 'Reset to default local folder'
          "
          :click="!manuallySelected ? manuallySelectFolder : updateLocalAnime"
          :icon="!manuallySelected ? folderSvg : resetSvg"
          class="manually-select"
        />
      </div>

      <animated-size>
        <div v-if="loadingLocalAnime || creatingEpisodes">
          <loading :size="50" />
          <div v-if="creatingEpisodes" class="creating-info">
            Extracting thumbnails...
          </div>
        </div>

        <recycle-scroller
          v-else
          v-slot="{ item }"
          class="anime-container"
          :items="localAnime"
          :item-size="45"
          key-field="folderPath"
        >
          <div
            :key="item.title + item.folderPath"
            :title="item.folderPath"
            class="anime-item"
            @click="select(item)"
          >
            {{ item.title }} ({{ item.episodes }})
          </div>
        </recycle-scroller>
      </animated-size>
    </div>
  </modal-base>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { RecycleScroller } from 'vue-virtual-scroller'
import Fuse from 'fuse.js'
import { mdiClose, mdiFolder } from '@mdi/js'

import ModalBase from '@/common/modals/base.vue'
import Loading from '@/common/components/loading.vue'
import { cacheEpisodes } from '@/graphql/mutations/episodes'
import LOCAL_SOURCE_ANIME from './local-source-anime.graphql'
import {
  EpisodeListEpisodes,
  LocalSourceAnimeQuery,
  LocalSourceAnimeVariables,
  Provider,
} from '@/graphql/generated/types'

import { Query } from '@/decorators'
import {
  getLocalSourceOptions,
  ModalName,
  sendToast,
  setLocalSourceAnime,
  toggleModal,
} from '@/state/app'
import { LocalAnime, LocalFiles } from '@/lib/local-files'
import { getLocalFilesFolder } from '@/state/settings'
import CButton from '@/common/components/button.vue'
import AnimatedSize from '@/common/components/animated-size.vue'
import { isNil } from '@/utils'
import { getFolderPath } from '@/utils/ffmpeg'

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

@Component({
  components: { CButton, AnimatedSize, Loading, ModalBase, RecycleScroller },
})
export default class LocalSourceModal extends Vue {
  public readonly modalName: ModalName = 'localSource'

  @Query<LocalSourceModal, LocalSourceAnimeQuery, LocalSourceAnimeVariables>({
    query: LOCAL_SOURCE_ANIME,
    skip() {
      return isNil(this.animeId)
    },
    variables() {
      return {
        id: this.animeId!,
      }
    },
  })
  public anime!: LocalSourceAnimeQuery['anime']

  public selectedFolder = getLocalFilesFolder(this.$store)
  public localAnime: LocalAnime[] = []
  public loadingLocalAnime = false
  public creatingEpisodes = false

  public folderSvg = mdiFolder
  public resetSvg = mdiClose

  public get animeId() {
    return getLocalSourceOptions(this.$store)?.anilistId || null
  }

  public get titles() {
    return {
      english: this.anime?.title?.english ?? '',
      romaji: this.anime?.title?.romaji ?? '',
    }
  }

  public folderPathLimit = 50
  public get shortFolderPath() {
    if (isNil(this.selectedFolder)) return null

    const { length } = this.selectedFolder
    if (length < this.folderPathLimit) {
      return this.selectedFolder
    }

    return (
      '...' + this.selectedFolder.slice(length - this.folderPathLimit, length)
    )
  }

  public get manuallySelected() {
    if (isNil(this.selectedFolder)) return false

    return this.selectedFolder !== getLocalFilesFolder(this.$store)
  }

  @Watch('titles')
  public async updateLocalAnime() {
    this.selectedFolder = getLocalFilesFolder(this.$store)
    this.loadingLocalAnime = true
    this.localAnime = await LocalFiles.getLocalAnime()
    this.loadingLocalAnime = false

    const fuse = new Fuse(this.localAnime, {
      caseSensitive: false,
      keys: ['title'],
      threshold: 0.75,
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

  public async manuallySelectFolder() {
    const folder = await getFolderPath({
      title: 'Manually select anime folder...',
    })

    if (isNil(folder)) return

    this.selectedFolder = folder
    this.localAnime = await LocalFiles.getAnimeInFolder(folder)
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

    const progress = this.anime?.listEntry?.progress ?? 0

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
      subtitles: [],
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

    setLocalSourceAnime(this.$store, null)
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
  min-width: 600px;
  background: $dark;
  border-radius: 5px;
  box-shadow: $shadow;
  z-index: 1;

  & > .header {
    padding: 15px 35px;

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

    & > .help-link {
      display: inline-block;
      margin-top: 15px;
      font-weight: 700;
      font-size: 0.85em;
      text-decoration: none;
      color: color($highlight, 600);
      transition: color 0.15s;

      &:hover {
        color: color($highlight, 800);
      }
    }
  }

  & > .folder {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 600px;
    border-bottom: 2px solid color($dark, 600);
    border-top: 2px solid color($dark, 600);
    padding: 8px 15px;
    font-weight: 400;
    font-size: 0.9em;
    color: gray;

    & > .text {
      width: 500px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    & > .placeholder {
      margin-right: auto;
      height: 30px;
      width: 30px;
      flex-shrink: 0;
    }

    & > .manually-select {
      margin-left: auto;
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
    min-width: 600px;
    width: 100%;
    overflow-y: auto;
    padding: 10px 20px;

    & .anime-item {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 45px;
      padding: 0 10px;
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
