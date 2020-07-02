<template>
  <div
    class="player"
    tabindex="0"
    @keydown.exact="onKeyDown"
    @keydown.exact.escape.prevent="isFullscreen ? toggleFullscreen() : null"
    @wheel.capture="onScroll"
  >
    <transition name="fade">
      <video
        ref="player"
        preload
        :muted="state.muted"
        :autoplay="shouldAutoPlay"
        :poster="episode && episode.thumbnail"
        :class="{ ended: state.ended }"
      >
        <track
          v-if="subtitlesUrl && subtitlesUrl.length > 0"
          :src="subtitlesUrl"
          default
        />
      </video>
    </transition>

    <transition name="fade">
      <icon
        v-if="!state.initiated && state.loaded"
        class="uninitiated-icon"
        :icon="playCircleSvg"
      />
    </transition>

    <transition name="fade">
      <span v-if="loading || state.loading" class="loading-spinner">
        <icon :icon="loadingSvg" />
      </span>
    </transition>

    <controls
      v-if="anime && episode"
      :episode="episode"
      :next-episode="nextEpisode"
      :anime="anime"
      :loading="loading || state.loading"
      :paused="state.paused"
      :is-player-maximized="isPlayerMaximized"
      :muted="state.muted"
      :volume="state.volume"
      :duration="state.duration || episode.duration"
      :progress-percentage="state.progress.percent"
      :progress-in-seconds="state.progress.seconds"
      :loaded-percentage="state.loadProgress.percent"
      :speed="state.speed"
      :quality="state.quality"
      :levels="state.levels"
      :subtitles="subtitles.tracks"
      :subtitles-index="subtitles.selected"
      :on-set-time="onSetTime"
      :on-set-volume="onSetVolume"
      :on-toggle-mute="onToggleMute"
      :on-change-speed="onChangeSpeed"
      :on-change-quality="onChangeQuality"
      :on-change-subtitles="onChangeSubtitles"
      :play="play"
      :pause="pause"
      :set-progress="setProgress"
      :close-player="closePlayer"
    />

    <next-episode-overlay
      v-if="state.ended && nextEpisode"
      :next-episode="nextEpisode"
      :episodes-in-anime="anime && anime.episodes"
      :progress="listEntry && listEntry.progress"
      :is-player-maximized="isPlayerMaximized"
      :should-auto-play="shouldAutoPlay"
    />

    <end-of-season-overlay
      v-if="state.ended && !nextEpisode"
      :list-entry="listEntry"
      :sequels="sequels"
      :episode-number="episode.episodeNumber"
      :episodes-in-anime="anime && anime.episodes"
      :next-airing-episode="anime && anime.nextAiringEpisode"
      :is-player-maximized="isPlayerMaximized"
    />
  </div>
</template>

<script lang="ts">
import Hls from 'hls.js'
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  PropType,
  reactive,
  ref,
  watch,
} from '@vue/composition-api'
import { addBreadcrumb } from '@sentry/browser'
import { mdiLoading, mdiPlayCircle } from '@mdi/js'

import {
  EpisodeListEpisodes,
  MediaRelation,
  PlayerAnimeAnime,
  Provider,
} from '@/graphql/generated/types'
import { Crunchyroll } from '@/lib/crunchyroll'
import { Hidive, HidiveResponseCode } from '@/lib/hidive'
import { LocalStorageKey } from '@/lib/local-storage'
import {
  getIsFullscreen,
  sendErrorToast,
  toggleFullscreen as toggleFullScreenAction,
} from '@/state/app'
import { getAnilistUsername } from '@/state/auth'
import { getKeydownHandler, KeybindingAction } from '@/state/settings'
import { usePlayer } from '@/state/player'
import { Levels, Stream } from '@/types'
import { capitalize, clamp, getRelations, lastItem } from '@/utils'

import Icon from '@/common/components/icon.vue'
import Controls from './controls.vue'
import NextEpisodeOverlay from './next-episode-overlay.vue'
import EndOfSeasonOverlay from './end-of-season-overlay.vue'
import { registerMediaKeys } from './register-media-keys'
import { PlayerState } from './player.types'

const getNumberFromLocalStorage = (
  key: LocalStorageKey,
  defaultValue: number,
) => Number(localStorage.getItem(key) ?? defaultValue)

const fetchStream = async (
  provider: Provider,
  id: string,
): Promise<Stream | null> => {
  if ([Provider.Crunchyroll, Provider.CrunchyrollManual].includes(provider)) {
    return Crunchyroll.fetchStream(id)
  }

  if (provider === Provider.Hidive) {
    try {
      return await Hidive.fetchStream(id)
    } catch (err) {
      if (err.message === HidiveResponseCode.RegionRestricted) {
        throw new Error('This show is not available in your country.')
      }

      throw new Error(err)
    }
  }

  return null
}

export default defineComponent({
  components: { Controls, EndOfSeasonOverlay, Icon, NextEpisodeOverlay },
  props: {
    episode: {
      type: Object as PropType<EpisodeListEpisodes | null>,
      default: null,
    },
    nextEpisode: {
      type: Object as PropType<EpisodeListEpisodes | null>,
      default: null,
    },
    anime: {
      type: Object as PropType<PlayerAnimeAnime | null>,
      default: null,
    },
    loading: Boolean,
    shouldAutoPlay: Boolean,
    getShouldAutoMarkWatched: Boolean,
    setProgress: {
      type: Function as PropType<(p: number) => void>,
      required: true,
    },
  },
  setup(props, { root }) {
    const player = ref<HTMLVideoElement>(null)

    const username = computed(() => getAnilistUsername(root.$store))
    const listEntry = computed(() => props.anime?.listEntry ?? null)
    const sequels = computed(() => getRelations(props, MediaRelation.Sequel))

    const isFullscreen = computed(() => getIsFullscreen(root.$store))
    const toggleFullscreen = computed(() => toggleFullScreenAction(root.$store))

    const hls = ref(new Hls())
    const gainNode = ref<GainNode | null>(null)
    const initGainNode = () => {
      const audioContext = new AudioContext()
      gainNode.value = audioContext.createGain()
      gainNode.value.gain.value = state.volume / 100

      audioContext
        .createMediaElementSource(player.value!)
        .connect(gainNode.value)

      gainNode.value.connect(audioContext.destination)
    }

    const playlist = usePlayer()
    const state = reactive<PlayerState>({
      streamUrl: null as string | null,
      levels: null as Levels | null,

      loading: false,
      loaded: false,
      loadProgress: {
        percent: 0,
        seconds: 0,
      },

      initiated: !!props.shouldAutoPlay,
      ended: false,
      softEnded: false, // Gotten to the 'soft end' - e.g. 80% of the way
      paused: false,
      playhead: 0, // Where to start playing
      duration: 0,
      progress: {
        percent: 0,
        seconds: 0,
      },

      lastScrobble: 0,
      lastHeartbeat: 0,

      muted: localStorage.getItem(LocalStorageKey.Muted) === 'true',
      volume: getNumberFromLocalStorage(LocalStorageKey.Volume, 70),
      speed: getNumberFromLocalStorage(LocalStorageKey.Speed, 1),
      quality: localStorage.getItem(LocalStorageKey.Quality) ?? '1080',
    })

    // region Subtitles
    const subtitles = reactive({
      tracks: [] as [string, string][],
      selected: getNumberFromLocalStorage(LocalStorageKey.Subtitle, 0),
    })
    const subtitlesUrl = computed<string | undefined>(
      () => subtitles.tracks[subtitles.selected]?.[1],
    )
    const setSubtitleTracks = (arr: [string, string][]) => {
      subtitles.tracks =
        arr.length > 0 ? [...arr, ['None', '']] : (subtitles.tracks = arr)
    }
    const changeSubtitles = (index: number) => {
      localStorage.setItem(LocalStorageKey.Subtitle, index.toString())
      subtitles.selected = index
    }
    // endregion

    // region Actions
    const _pause = () => {
      if (state.paused || player.value == null) return

      player.value.pause()
      // TODO: watch paused and show controls in controls
    }

    const _setVolume = (e: Event) => {
      if (gainNode.value == null) return

      const { value: inputValue } = e.target as HTMLInputElement
      // TODO: check if we can use numberValue or whatever its called
      const value = clamp(+Number(inputValue).toFixed(2), 0, 200)

      state.volume = value
      gainNode.value.gain.value = value / 100
      localStorage.setItem(LocalStorageKey.Volume, value.toString())
    }

    const _setTime = (time: number) => {
      if (player.value == null) return

      state.lastHeartbeat = state.progress.seconds - 30

      if (!state.paused) {
        // TODO: setDiscordState('watching')
      }

      player.value.currentTime = time
    }

    const _skipBySeconds = (seconds: number) => {
      if (player.value == null) return

      _setTime(player.value.currentTime + seconds)
    }

    const actions = {
      play: () => {
        if (!state.paused || player.value == null) return

        if (!state.initiated) state.initiated = true

        player.value.play()
      },
      pause: _pause,
      setTime: _setTime,
      skipBySeconds: _skipBySeconds,
      traverseFrames: (frames: number) => {
        _pause()

        // We assume framerate to be 24 since there's no way to get it from the player :(
        _skipBySeconds(frames / 24)
      },
      setQuality: (quality: string) => {
        state.quality = quality
        hls.value.currentLevel = state.levels![quality]

        localStorage.setItem(LocalStorageKey.Quality, quality)
      },
      setVolume: _setVolume,
      incrementVolume: (amount: number) => {
        _setVolume({
          target: { value: clamp(state.volume + amount, 0, 200) },
        } as any)
      },
      toggleMute: () => {
        state.muted = !state.muted

        localStorage.setItem(LocalStorageKey.Muted, state.muted.toString())
      },
      setSpeed: (e: Event) => {
        if (player.value == null) return
        const { value } = e.target as HTMLSelectElement

        state.speed = Number(value)
        player.value.playbackRate = state.speed
        localStorage.setItem(LocalStorageKey.Speed, state.speed.toString())
      },
      close: () => {
        playlist.setPlaylist(null)
        // TODO: setDiscordState('paused')

        if (isFullscreen.value) {
          // toggleFullscreen
        }

        // Toggling fullscreen already goes back so we only manually do it on big player, not full
        if (root.$route.path === '/player-big') {
          root.$router.back()
        }
      },
    }
    // endregion

    // region Handlers
    const handlers = {
      playerScroll: (e: WheelEvent) => {
        const direction = Math.sign(-e.deltaY)

        actions.incrementVolume(direction * 10)
      },
      loadedProgress: (e: Event) => {
        const element = e.target as HTMLVideoElement

        if (props.episode == null || element.buffered.length < 1) return

        state.loadProgress.seconds = element.buffered.end(0)
        state.loadProgress.percent = state.loadProgress.seconds / state.duration
      },
      timeUpdate: (e: Event) => {
        if (!props.episode) return

        const element = e.target as HTMLVideoElement

        if (state.ended) {
          state.ended = false
        }

        state.progress.seconds = Math.round(element.currentTime)
        state.progress.percent = element.currentTime / state.duration

        if (!state.softEnded && state.progress.percent >= 0.8) {
          state.softEnded = true

          // TODO: updateProgressIfNecessary()
        }
      },
      ended: () => {
        state.softEnded = true
        state.ended = true

        // TODO: updateProgressIfNecessary()
      },
    }
    // endregion

    // region Keyboard Shortcuts
    const actionFunctionMap = {
      [KeybindingAction.PAUSE]: () => actions.pause(),
      [KeybindingAction.PLAY]: () => actions.pause(),
      [KeybindingAction.PAUSE_PLAY]: () =>
        state.paused ? actions.play() : actions.pause(),
      [KeybindingAction.SKIP_BACK]: () => actions.skipBySeconds(-5),
      [KeybindingAction.SKIP_FORWARD]: () => actions.skipBySeconds(5),
      [KeybindingAction.VOLUME_DOWN]: () => actions.incrementVolume(-10),
      [KeybindingAction.VOLUME_UP]: () => actions.incrementVolume(10),
      [KeybindingAction.TOGGLE_MUTED]: () => actions.toggleMute(),
      [KeybindingAction.TOGGLE_FULLSCREEN]: () => (toggleFullscreen as any)(),
      [KeybindingAction.FRAME_FORWARD]: () => actions.traverseFrames(1),
      [KeybindingAction.FRAME_BACK]: () => actions.traverseFrames(-1),
    }

    const keyDownHandler = computed(() =>
      getKeydownHandler(root.$store)(actionFunctionMap),
    )

    const onKeyDown = (e: KeyboardEvent) => {
      // @ts-ignore
      keyDownHandler.value(e.key)
    }
    // endregion

    const registerEventHandlers = () => {
      if (player.value == null || props.episode == null) return

      hls.value.on('hlsManifestParsed', (_event, data) => {
        let i = 0

        state.levels = (data.levels as any).reduce((map: any, level: Level) => {
          map[level.height.toString()] = i
          i++

          return map
        }, {} as any) as Levels

        if (state.levels[state.quality] == null) {
          const newQuality = lastItem(Object.keys(state.levels)) as string

          localStorage.setItem(LocalStorageKey.Quality, newQuality)
          state.quality = newQuality
        }

        hls.value.loadLevel = state.levels[state.quality]
      })

      hls.value.on('hlsMediaAttached', () => {
        player.value!.currentTime =
          state.playhead < (props.episode as EpisodeListEpisodes).duration * 0.8
            ? state.playhead
            : 0

        player.value!.playbackRate = state.speed
      })

      player.value.onplay = () => {
        state.paused = false

        // TODO: setDiscordState('watching')
      }
      player.value.onpause = () => {
        state.paused = true

        // TODO: setDiscordState('paused')
      }
      player.value.oncanplay = () => {
        state.loading = false
        state.loaded = true
        state.duration = Math.round(player.value!.duration)
      }
      player.value.onwaiting = () => {
        state.loading = true
      }

      player.value.onprogress = handlers.loadedProgress
      player.value.ontimeupdate = handlers.timeUpdate
      player.value.addEventListener('ended', handlers.ended)
    }

    const handleNewEpisode = async () => {
      if (!props.episode) return

      addBreadcrumb({
        category: 'action',
        message: `Started ${props.episode.provider}:${props.episode.animeId}:${props.episode.episodeNumber}`,
      })

      actions.pause()

      try {
        const stream = await fetchStream(
          props.episode.provider,
          props.episode.id,
        )

        if (!stream) {
          throw new Error(
            `Did not receive stream data from ${capitalize(
              props.episode.provider,
            )}.`,
          )
        }

        if (stream.subtitles.length > 0) {
          setSubtitleTracks(stream.subtitles)
        }

        state.streamUrl = stream.url
        state.playhead = stream.progress || 0
      } catch (e) {
        playlist.setPlaylist(null)
        return sendErrorToast(root.$store, e.message)
      }

      if (!state.streamUrl) return

      state.duration = 0
      state.progress.seconds = 0
      state.progress.percent = 0
      state.ended = false
      state.softEnded = false
      state.initiated = !!props.shouldAutoPlay
      state.paused = true
      state.loading = true
      state.loaded = false
      state.levels = null

      if (subtitles.tracks.length < 1) {
        setSubtitleTracks(props.episode.subtitles as any)
      }

      const oldHls = hls.value

      const newHls = new Hls()

      newHls.loadSource(state.streamUrl)
      newHls.attachMedia(player.value!)

      hls.value = newHls

      oldHls && oldHls.destroy()

      registerEventHandlers()
    }

    const fadeOutVolume = () => {
      const interval = window.setInterval(() => {
        if (gainNode.value == null) return

        if (gainNode.value.gain.value <= 0) {
          return clearInterval(interval)
        }

        gainNode.value.gain.value = clamp(
          gainNode.value.gain.value - 0.05,
          0,
          2,
        )
      }, 10)
    }

    registerMediaKeys(state, actions)

    watch(
      () => props.episode?.id ?? null,
      () => handleNewEpisode(),
    )

    onMounted(() => {
      handleNewEpisode()

      initGainNode()
    })

    onBeforeUnmount(() => {
      fadeOutVolume()

      setTimeout(() => hls.value.destroy(), 500)
    })

    return {
      player,

      listEntry,
      sequels,

      isFullscreen,
      toggleFullscreen,

      state,

      subtitles,
      subtitlesUrl,
      onChangeSubtitles: changeSubtitles,

      // Actions
      play: actions.play,
      pause: actions.pause,
      onSetTime: actions.setTime,
      pauseAndTraverseFrames: actions.traverseFrames,
      onChangeQuality: actions.setQuality,
      onSetVolume: actions.setVolume,
      onToggleMute: actions.toggleMute,
      onChangeSpeed: actions.setSpeed,
      closePlayer: actions.close,

      onScroll: handlers.playerScroll,

      onKeyDown,

      isPlayerMaximized: computed(() =>
        ['/player-big', '/player-full'].includes(root.$route.path),
      ),

      playCircleSvg: mdiPlayCircle,
      loadingSvg: mdiLoading,
    }
  },
})

// export class Player extends Vue {
//   public updateProgressIfNecessary() {
//     if (!this.episode) return
//
//     if (
//       !this.listEntry ||
//       !this.getShouldAutoMarkWatched ||
//       (this.listEntry.progress as number) >= this.episode.episodeNumber
//     ) {
//       return
//     }
//
//     this.setProgress(this.episode.episodeNumber)
//   }
//
//   private setDiscordState(state: 'watching' | 'paused') {
//     if (!this.episode || !this.anime) return
//
//     ipcRenderer.send(
//       state === 'watching' ? DISCORD_SET_WATCHING : DISCORD_PAUSE_WATCHING,
//       {
//         animeName: (this.anime.title as PlayerAnimeTitle).userPreferred,
//         episode: this.episode.episodeNumber,
//         totalEpisodes: this.anime.episodes,
//         progress: this.progressInSeconds,
//         username: this.username,
//       },
//     )
//   }
// }
</script>

<style scoped lang="scss">
@import '../../colors';

@keyframes spin {
  from {
    transform: rotateZ(0deg);
  }
  to {
    transform: rotateZ(360deg);
  }
}

.player {
  position: relative;
  width: 100%;
  height: 100%;
  box-shadow: $shadow;
  overflow: hidden;

  & > video {
    background: #050505;
    width: 100%;
    height: 100%;
    transition: filter 1s;

    & > track {
      pointer-events: none;
    }

    &::cue {
      background: none;
      font-family: 'Lato', sans-serif;
      text-shadow: $outline;
      font-weight: bold;

      &:nth-child(odd) {
        color: yellow;
      }
    }

    // Makes sure subtitles aren't too far down on the screen
    //noinspection CssInvalidPseudoSelector
    &::-webkit-media-text-track-container {
      padding: 5px 0;
    }

    &.ended {
      filter: blur(10px);
    }
  }

  & > .uninitiated-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 40%;
    fill: $white;
    filter: drop-shadow(1px 2px 3px black);
    transform: translate(-50%, -50%);
    z-index: 1;
    pointer-events: none;
  }

  & > .loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 40%;
    pointer-events: none;
    fill: $white;
    filter: drop-shadow(1px 2px 3px black);
    transform: translate(-50%, -50%);

    & > .icon {
      height: 100%;
      width: 100%;
      animation: spin 1s linear;
      animation-iteration-count: infinite;
    }
  }
}
</style>
