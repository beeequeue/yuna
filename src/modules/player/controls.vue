<template>
  <div
    class="controls"
    :class="{ visible: settingsOpen || visible }"
    @mousemove="show"
    @click="show"
    @mouseleave="hide"
  >
    <div class="cover" @click="debounceCoverClick" />

    <transition name="fade">
      <player-title
        v-if="maximized"
        :anime-id="animeId"
        :title="title"
        :episode="episode"
        :watched="watched"
      />
    </transition>

    <icon class="button close" :icon="closeSvg" @click.native="close" />

    <div class="toolbar">
      <progress-bar
        :duration="state.duration"
        :progress-percentage="state.progress.percent"
        :loaded-percentage="state.loadProgress.percent"
        :on-set-time="timeskip"
        :visible="visible"
      />

      <transition name="shrink">
        <icon
          v-if="maximized"
          class="button"
          :class="{ disabled: episode.index < 1 }"
          :icon="prevSvg"
          @click.native="traversePlaylist(-1)"
        />
      </transition>

      <span class="play-pause button-collapser">
        <transition>
          <icon
            v-if="state.paused"
            key="play"
            class="button"
            :icon="playSvg"
            @click.native="play"
          />
          <icon
            v-else
            key="pause"
            class="button"
            :icon="pauseSvg"
            @click.native="pause"
          />
        </transition>
      </span>

      <transition name="shrink">
        <icon
          v-if="maximized"
          class="button"
          :class="{ disabled: nextEpisode == null }"
          :icon="nextSvg"
          @click.native="traversePlaylist(1)"
        />
      </transition>

      <volume-slider
        :muted="state.muted"
        :volume="state.volume"
        :on-change="setVolume"
        :on-toggle-mute="toggleMute"
        :open="maximized"
      />

      <transition name="shrink">
        <span v-if="maximized" class="time">{{ timeString }}</span>
      </transition>

      <span class="separator" />

      <transition name="shrink">
        <span
          v-if="maximized && listEntry"
          class="completed button-collapser"
          :class="{ disabled: episode.episodeNumber === 0 }"
        >
          <transition name="fade">
            <icon
              v-if="!watched"
              key="max"
              v-tooltip.top="markWatchedTooltip"
              class="button"
              :icon="bookmarkSvg"
              @click.native="updateProgress(episode.episodeNumber)"
            />
            <icon
              v-else
              key="min"
              v-tooltip.top="markWatchedTooltip"
              class="button"
              :icon="bookmarkRemoveSvg"
              @click.native="updateProgress(Math.max(0, episode.episodeNumber - 1))"
            />
          </transition>
        </span>
      </transition>

      <transition name="shrink">
        <span
          v-if="maximized"
          class="settings button-collapser"
          :class="{ open: settingsOpen }"
        >
          <icon class="button" :icon="settingSvg" @click.native="toggleSettingsOpen" />
        </span>
      </transition>

      <span v-if="!fullscreen" class="maximize button-collapser">
        <transition name="fade">
          <icon
            v-if="!maximized"
            key="max"
            class="button"
            :icon="maximizeSvg"
            @click.native="maximize"
          />
          <icon
            v-else
            key="min"
            class="button"
            :icon="minimizeSvg"
            @click.native="$router.back()"
          />
        </transition>
      </span>

      <span class="fullscreen button-collapser">
        <transition name="fade">
          <icon
            v-if="!fullscreen"
            key="fullscreen"
            class="button"
            :icon="fullscreenSvg"
            @click.native="toggleFullscreen"
          />
          <icon
            v-else
            key="fullscreenExit"
            class="button"
            :icon="fullscreenExitSvg"
            @click.native="toggleFullscreen"
          />
        </transition>
      </span>
    </div>

    <transition>
      <div v-if="maximized && settingsOpen" class="settings-menu">
        <label v-if="state.levels != null">
          Quality:
          <select :value="state.quality" @input="handleSetQuality">
            <option v-for="(_, q) in state.levels" :key="q" :value="q">{{ q }}p</option>
          </select>
        </label>

        <label v-if="subtitles.tracks.length > 0">
          Subtitles:
          <select :value="subtitles.selected" @input="handleSetSubtitlesTrack">
            <option v-for="(subtitle, q) in subtitles.tracks" :key="q" :value="q">
              {{ subtitle[0] }}
            </option>
          </select>
        </label>

        <label>
          Speed:
          <select :value="state.speed" @input="setSpeed">
            <option :value="0.25">0.25x</option>
            <option :value="0.5">0.5x</option>
            <option :value="1">1x</option>
            <option :value="1.5">1.5x</option>
            <option :value="2">2x</option>
          </select>
        </label>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from "@vue/composition-api"
import {
  mdiArrowCollapse,
  mdiArrowExpand,
  mdiBookmark,
  mdiBookmarkRemove,
  mdiClose,
  mdiCogOutline,
  mdiFullscreen,
  mdiFullscreenExit,
  mdiPause,
  mdiPlay,
  mdiSkipNext,
  mdiSkipPrevious,
} from "@mdi/js"
import { EpisodeListEpisodes, PlayerAnimeAnime } from "@/graphql/generated/types"

import { usePlayer } from "@/state/player"
import { secondsToTimeString } from "@/utils"

import Icon from "@/common/components/icon.vue"
import PlayerTitle from "./title.vue"
import ProgressBar from "./progress-bar.vue"
import VolumeSlider from "./volume-slider.vue"
import { PlayerState } from "./player.types"

enum ControlsEvent {
  Play = "play",
  Pause = "pause",
  Timeskip = "timeskip",
  SetVolume = "set-volume",
  ToggleMute = "toggle-mute",
  SetSpeed = "set-speed",
  SetQuality = "set-quality",
  SetSubtitlesTrack = "set-subtitles-track",
  SetFullscreen = "set-fullscreen",
  UpdateProgress = "update-progress",
  Close = "close",
}

export default defineComponent({
  components: { PlayerTitle, VolumeSlider, ProgressBar, Icon },
  props: {
    episode: {
      type: Object as PropType<EpisodeListEpisodes>,
      required: true,
    },
    nextEpisode: {
      type: Object as PropType<EpisodeListEpisodes | null>,
      default: null,
    },
    listEntry: {
      type: Object as PropType<PlayerAnimeAnime["listEntry"] | null>,
      default: null,
    },
    title: {
      type: String,
      default: "",
    },
    subtitles: {
      type: Object as PropType<{
        tracks: [string, string][]
        selected: number
      }>,
      required: true,
    },
    state: {
      type: Object as PropType<PlayerState>,
      required: true,
    },
    fullscreen: Boolean,
    maximized: Boolean,
  },
  setup(props, { emit, root }) {
    const playlist = usePlayer()

    const watched = computed(() => props.episode.isWatched)
    const markWatchedTooltip = computed(() => {
      if (props.episode.episodeNumber === 0) {
        return "This episode shares watched status with episode 1."
      }

      return watched.value ? "Unmark as watched" : "Mark as watched"
    })

    const settingsOpen = ref(false)

    const hovering = ref(false)
    const hoveringTimeout = ref<number | null>(null)
    const visible = computed(() => settingsOpen.value || hovering.value)
    const show = () => {
      hovering.value = true

      if (hoveringTimeout.value) window.clearTimeout(hoveringTimeout.value)

      hoveringTimeout.value = window.setTimeout(() => {
        hovering.value = false
        hoveringTimeout.value = null
      }, 2000)
    }
    const hide = () => {
      hovering.value = false

      if (hoveringTimeout.value) window.clearTimeout(hoveringTimeout.value)
    }

    // Show the controls temporarily when pausing
    watch(
      () => props.state.paused,
      (willPause) => {
        if (willPause != true) return

        show()
      },
    )

    const timeString = computed(() => {
      const current = secondsToTimeString(
        Math.min(props.state.progress.seconds, props.state.duration),
      )
      const duration = secondsToTimeString(props.state.duration)

      return `${current} / ${duration}`
    })
    const toggleFullscreen = () => emit(ControlsEvent.SetFullscreen, !props.fullscreen)

    const clickTimeout = ref<number | null>(null)
    const handleCoverClick = () => {
      if (props.state.ended) return

      props.state.paused ? emit(ControlsEvent.Play) : emit(ControlsEvent.Pause)
    }
    const debounceCoverClick = () => {
      handleCoverClick()

      if (!clickTimeout.value) {
        clickTimeout.value = window.setTimeout(() => {
          clickTimeout.value = null
        }, 175)

        return
      }

      clearTimeout(clickTimeout.value)
      clickTimeout.value = null

      handleCoverClick()
      toggleFullscreen()
    }

    watch(
      () => root.$route.path,
      (newPath) => {
        if (!newPath.includes("/player-full") && props.fullscreen) {
          emit(ControlsEvent.SetFullscreen, false)
        }
      },
      { immediate: true },
    )

    return {
      animeId: computed(() => playlist.current.value?.animeId),
      watched,
      markWatchedTooltip,

      settingsOpen,
      toggleSettingsOpen: () => (settingsOpen.value = !settingsOpen.value),

      hovering,
      visible,
      show,
      hide,

      timeString,
      toggleFullscreen,
      debounceCoverClick,
      traversePlaylist: playlist.traversePlaylist,
      updateProgress: (progress: number) =>
        // 0 is for Re:Zero's double first episode
        props.episode.episodeNumber !== 0 && emit(ControlsEvent.UpdateProgress, progress),
      maximize: () => root.$router.push("/player-big"),
      play: () => emit(ControlsEvent.Play),
      pause: () => emit(ControlsEvent.Pause),
      timeskip: (seconds: number) => emit(ControlsEvent.Timeskip, seconds),
      setVolume: (volume: number) => emit(ControlsEvent.SetVolume, volume),
      toggleMute: () => emit(ControlsEvent.ToggleMute),
      setSpeed: (speed: number) => emit(ControlsEvent.SetSpeed, speed),
      close: () => emit(ControlsEvent.Close),

      handleSetQuality: (e: Event) => {
        const element = e.target as HTMLSelectElement
        emit(ControlsEvent.SetQuality, element.value)
      },
      handleSetSubtitlesTrack: (e: Event) => {
        const element = e.target as HTMLSelectElement
        emit(ControlsEvent.SetSubtitlesTrack, element.value)
      },

      closeSvg: mdiClose,
      playSvg: mdiPlay,
      pauseSvg: mdiPause,
      prevSvg: mdiSkipPrevious,
      nextSvg: mdiSkipNext,
      bookmarkSvg: mdiBookmark,
      bookmarkRemoveSvg: mdiBookmarkRemove,
      maximizeSvg: mdiArrowExpand,
      minimizeSvg: mdiArrowCollapse,
      fullscreenSvg: mdiFullscreen,
      fullscreenExitSvg: mdiFullscreenExit,
      settingSvg: mdiCogOutline,
    }
  },
})
</script>

<style scoped lang="scss">
@import "../../colors";

$buttonSize: 50px;

.button {
  height: $buttonSize;
  width: $buttonSize;
  max-width: $buttonSize;
  padding: 5px;
  margin-top: 5px;

  fill: white;
  cursor: pointer;

  &.disabled {
    pointer-events: none;
    opacity: 0.25;
  }

  &.v-enter-active,
  &.v-leave-active {
    will-change: opacity;
    transition: opacity 0.1s, transform 0.1s;
  }

  &.v-enter,
  &.v-leave-to {
    opacity: 0;
    transform: scale(0.5);
  }
}

.controls {
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  opacity: 0;
  cursor: none;
  user-select: none;
  transition: opacity 0.15s;

  & > .cover {
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
  }

  & > .button.close {
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 1));
  }

  &.visible {
    opacity: 1;
    cursor: default;
  }

  & .settings-menu {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    bottom: 75px;
    right: 0;
    padding: 10px 15px;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    background: rgba(0, 0, 0, 0.85);
    transition: transform 0.35s;

    & label {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;

      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }

    & select {
      margin-left: 15px;
      background: $main;
      border: none;
      color: $white;
      padding: 3px;
    }

    &.v-enter,
    &.v-leave-to {
      transform: translateX(100%);
    }
  }
}

.toolbar {
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  align-items: center;

  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.75) 0%,
    rgba(0, 0, 0, 0.2) 75%,
    rgba(0, 0, 0, 0) 100%
  );

  & > * {
    &.shrink-enter-active {
      transition: opacity 0.5s ease-in-out, max-width 0.5s ease-in-out,
        padding 0.5s ease-in-out !important;
    }

    &.shrink-leave-active {
      transition: opacity 0.25s, max-width 0.25s, padding 0.25s !important;
    }

    &.shrink-enter,
    &.shrink-leave-to {
      opacity: 0 !important;
      max-width: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
  }

  & > .separator {
    width: 100%;
  }

  & > *:not(.separator) {
    flex-shrink: 0;
  }

  & > *:not(.progress) {
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 1));
  }

  & > .progress {
    filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.75));
  }

  & > .volume-slider {
    margin-top: 5px;
  }

  & > .time {
    padding: 0 12px;
    max-width: 175px;
    opacity: 1;
    overflow: hidden;
    white-space: nowrap;
    font-weight: 400;
    font-size: 1.5em;
    cursor: default;
    font-variant-numeric: tabular-nums;
  }

  & > .button-collapser {
    position: relative;
    display: inline-block;
    flex-shrink: 0;
    height: $buttonSize;
    width: $buttonSize;
    max-width: $buttonSize;
    overflow: hidden;
    margin-top: 5px;
    transition: opacity 0.25s, filter 0.25s;

    &.disabled {
      opacity: 0.75;
      filter: brightness(0.75);

      & > .button {
        cursor: default;
      }
    }

    & > .button {
      margin: 0;
      position: absolute;
      top: 0;
      left: 0;
    }
  }

  & .settings {
    transition: transform 0.35s;

    &.open {
      transform: rotate(-75deg);
    }
  }
}
</style>
