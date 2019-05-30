<template>
  <div class="step spoiler-settings">
    <h2>Spoiler settings</h2>

    <h3>
      Anime Info
      <icon
        :icon="infoSvg"
        v-tooltip.right="
          'These spoilers will stop being<br/>hidden after watching one third<br/>of the season\'s episodes.'
        "
      />
    </h3>

    <checkbox
      setting="spoiler-descriptions"
      text="Descriptions"
      :checked="settings.spoilers.anime.description"
      :onChange="checked => setSpoiler('anime.description', checked)"
    />

    <h3>
      Episode Info
      <icon
        :icon="infoSvg"
        v-tooltip.right="
          'These spoilers will stop<br/>being hidden after watching<br/>the episode.'
        "
      />
    </h3>

    <checkbox
      setting="spoiler-episode-title"
      text="Titles"
      :checked="settings.spoilers.episode.name"
      :onChange="checked => setSpoiler('episode.name', checked)"
    />

    <checkbox
      setting="spoiler-episode-thumbnail"
      text="Thumbnails"
      :checked="settings.spoilers.episode.thumbnail"
      :onChange="checked => setSpoiler('episode.thumbnail', checked)"
    />

    <c-button content="Next" :click="goToNextStep" />

    <div class="example">
      <episode :episode="episodes[0]" :setCurrentEpisode="() => {}" small />
      <span class="cover" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiInformationOutline } from '@mdi/js'

import Icon from '@/common/components/icon.vue'
import Checkbox from '@/common/components/form/checkbox.vue'
import CButton from '@/common/components/button.vue'
import Episode from '@/common/components/episode.vue'

import { EpisodeListEpisodes } from '@/graphql/types'
import thumbnailWebp from '@/assets/setup/episode_thumb.webp'
import { getSettings, setSpoiler } from '@/state/settings'

@Component({ components: { Episode, CButton, Icon, Checkbox } })
export default class SpoilerSettings extends Vue {
  @Prop() public goToNextStep!: () => any

  public episodes: EpisodeListEpisodes = [
    {
      title: 'A Really Good Episode',
      thumbnail: thumbnailWebp,
      duration: 60 * 25,
      index: 2,
      episodeNumber: 3,
      progress: 2,
    },
  ] as any

  public infoSvg = mdiInformationOutline
  public thumbnailWebp = thumbnailWebp

  public get settings() {
    return getSettings(this.$store)
  }

  public setSpoiler(key: string, value: boolean) {
    setSpoiler(this.$store, {
      path: key.split('.') as any,
      value,
    })
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.spoiler-settings {
  & > .checkbox-container {
    width: 120px;
    margin-left: auto;
    margin-right: auto;
  }

  & > h3 {
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Raleway', sans-serif;
    font-weight: 500;

    & > .icon {
      margin-left: 5px;
      height: 20px;
      width: 20px;
      fill: $white;
    }
  }

  & > .button {
    width: 100%;
    padding: 10px;
    margin-top: 10px;
  }
}

.example {
  position: absolute;
  top: 50%;
  right: -25px;
  transform: translate(100%, -50%);
  padding: 25px;
  background: $dark;
  border-radius: 5px;
  box-shadow: $shadow;
  user-select: none;

  & > .cover {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
