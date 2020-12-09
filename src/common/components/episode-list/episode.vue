<template>
  <div data-testid="episode" class="episode" :class="classes">
    <img
      class="thumbnail"
      :class="{ blur: blur.thumbnail }"
      :src="episode.thumbnail"
      :alt="`Episode ${episode.episodeNumber}`"
      @click="handleClick"
    />

    <div class="title-container">
      <div class="episode-number">Episode {{ episode.episodeNumber }}</div>
      <div class="title" :class="{ blur: blur.title }">{{ episode.title }}</div>
    </div>

    <transition v-if="listEntry != null" name="fade">
      <c-button
        v-if="!episode.isWatched"
        v-tooltip.top="buttonTooltip"
        data-testid="setWatched"
        :icon="bookmarkSvg"
        :click="setProgress"
        :disabled="episode.episodeNumber === 0"
      />
      <c-button
        v-else
        v-tooltip.top="buttonTooltip"
        data-testid="setUnwatched"
        type="danger"
        :icon="unbookmarkSvg"
        :click="setProgress"
        :disabled="episode.episodeNumber === 0"
      />
    </transition>

    <transition>
      <icon
        v-if="episode.isWatched"
        :icon="checkSvg"
        label="watched"
        class="check"
      />
    </transition>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue"
import { mdiBookmark, mdiBookmarkRemove, mdiCheckCircleOutline } from "@mdi/js"

import { getSpoilerSettings } from "@/state/settings"

import CButton from "../button.vue"
import Icon from "../icon.vue"
import { ListEntry } from "@/state/app"
import { Episode as IEpisode } from "@/graphql/generated/types"

export default Vue.extend({
  components: { CButton, Icon },
  props: {
    episode: {
      type: Object as PropType<
        Pick<
          IEpisode,
          | "animeId"
          | "index"
          | "provider"
          | "episodeNumber"
          | "thumbnail"
          | "title"
          | "isWatched"
        >
      >,
      required: true,
    },
    listEntry: {
      type: Object as PropType<ListEntry | null>,
      default: null,
    },
    scrollerValue: {
      type: String,
      default: null,
    },
    small: Boolean,
  },
  // TODO: uncomment in Vue 3
  // emits: ["click", "update-progress"],
  data: () => ({
    bookmarkSvg: mdiBookmark,
    unbookmarkSvg: mdiBookmarkRemove,
    checkSvg: mdiCheckCircleOutline,
  }),
  computed: {
    blur(): { title: boolean; thumbnail: boolean } {
      const { episode: settings } = getSpoilerSettings(this.$store)

      return {
        title: settings.name && !this.episode.isWatched,
        thumbnail: settings.thumbnail && !this.episode.isWatched,
      }
    },
    buttonTooltip(): string | null {
      return this.episode.episodeNumber > 0
        ? null
        : "This episode shares watched status with episode 1."
    },
    classes(): Record<string, boolean> {
      return {
        watched: this.episode.isWatched,
        active:
          !this.small &&
          Number(this.scrollerValue) === this.episode.episodeNumber,
        small: this.small,
      }
    },
  },
  methods: {
    handleClick() {
      this.$emit("click")
    },
    setProgress() {
      const newProgress =
        this.episode.episodeNumber + (this.episode.isWatched ? -1 : 0)

      this.$emit("update-progress", newProgress)
    },
  },
})
</script>

<style scoped lang="scss">
@import "../../../colors";

.episode {
  position: relative;
  flex-shrink: 0;
  width: 300px;
  height: 175px;
  margin: 0 10px;
  border-radius: 8px;
  box-shadow: 1px 2px 5px rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
  overflow: hidden;

  will-change: height;
  transition: height 0.25s;

  &:first-child {
    margin-left: 0;
  }

  &:hover > .button {
    bottom: 0;
  }

  &.small {
    height: 125px;
    width: 215px;
    font-size: 0.85em;
  }

  &.active {
    height: 200px;
  }

  & > * {
    pointer-events: none;
  }

  & > .button {
    position: absolute;
    left: 0;
    bottom: -30px;
    border-top-left-radius: 0;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 0;
    transition: bottom 0.15s;
    pointer-events: all;
  }

  & > .check {
    display: block;
    position: absolute;
    bottom: -30px;
    right: -35px;
    height: 25px;
    width: 100px;
    fill: $white;
    background: $success;
    transform-origin: 0% 0%;
    transform: rotateZ(-45deg);

    &.v-enter-active,
    &.v-leave-active {
      transition: transform 0.5s;
    }

    &.v-enter,
    &.v-leave-to {
      transform: rotateZ(-45deg) translateX(100%);
    }

    &.v-enter-to,
    &.v-leave {
      transform: rotateZ(-45deg) translateX(0);
    }

    & ::v-deep svg {
      transform: rotateZ(45deg);
    }
  }

  & > .title-container {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: calc(100% - 20px);
    overflow: hidden;

    & > div {
      width: 100%;
      text-align: left;
      font-family: "Raleway", sans-serif;
      font-weight: 600;
      font-size: 1.1em;
      text-shadow: $outline;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      transition: opacity 0.75s, transform 0.75s;
    }

    & > .title.blur {
      opacity: 0;
      transform: translateX(10%);
    }
  }

  & > .thumbnail {
    display: block;
    height: 100%;
    width: 100%;
    border-radius: 5px;
    object-fit: cover;
    cursor: pointer;
    pointer-events: all;
    transition: filter 0.75s;

    &.blur {
      filter: blur(15px);
    }
  }
}
</style>
