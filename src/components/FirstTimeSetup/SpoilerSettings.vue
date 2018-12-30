<template>
  <div class="step spoiler-settings">
    <h2>Spoiler settings</h2>

    <h3>Anime Info
      <icon
        :icon="infoSvg"
        v-tooltip.right="'These spoilers will stop being<br/>hidden after watching one third<br/>of the season\'s episodes.'"
      />
    </h3>

    <checkbox
      setting="spoiler-descriptions"
      text="Descriptions"
      :checked="settings.spoilers.anime.description"
      :onChange="checked => setSpoiler('anime.description', checked)"
    />

    <h3>Episode Info
      <icon
        :icon="infoSvg"
        v-tooltip.right="'These spoilers will stop<br/>being hidden after watching<br/>the episode.'"
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

    <c-button content="Next" :click="goToNextStep"/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiInformationOutline } from '@mdi/js'

import Icon from '@/components/Icon.vue'
import Checkbox from '@/components/Settings/Checkbox.vue'
import { getSettings, setSpoiler } from '@/state/settings'
import CButton from '@/components/CButton.vue'

@Component({ components: { CButton, Icon, Checkbox } })
export default class SpoilerSettings extends Vue {
  @Prop() public goToNextStep!: () => any

  public infoSvg = mdiInformationOutline

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
@import '../../colors';

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
</style>
