<template>
  <div v-if="supportedSources.length > 0" class="source-select">
    <div class="background" />

    <div class="dropdown">
      <img
        v-for="source in supportedSources"
        :key="source.site"
        :src="getImageUrl(source)"
        class="source"
      />

      <icon :icon="expandSvg" class="expand" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { isNil } from 'rambdax'
import { mdiChevronDown } from '@mdi/js'

import Icon from '@/components/Icon.vue'

import { QueueAnime, QueueExternalLinks } from '@/graphql/types'

import { Required } from '@/decorators'
import { StreamingSource, SupportedSources } from '@/types'
import { getStreamingSources } from '@/utils'

const streamingSiteCtx = require.context('@/assets', false)
const siteImages = streamingSiteCtx.keys()

@Component({ components: { Icon } })
export default class SourceSelect extends Vue {
  @Required(Object) public anime!: QueueAnime

  public expandSvg = mdiChevronDown

  public get streamingSources() {
    if (isNil(this.anime.externalLinks)) return []

    return getStreamingSources(this.anime.externalLinks)
  }

  public get supportedSources() {
    return this.streamingSources.filter(({ site }) =>
      SupportedSources.includes(site.toLowerCase() as StreamingSource),
    )
  }

  public get unsupportedSources() {
    return this.streamingSources.filter(
      ({ site }) =>
        !SupportedSources.includes(site.toLowerCase() as StreamingSource),
    )
  }

  public getImageUrl(source: QueueExternalLinks) {
    const image = `./${StreamingSource[source.site as any]}.webp`

    if (!siteImages.includes(image)) {
      return null
    }

    return streamingSiteCtx(image)
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.source-select {
  position: relative;
  overflow: hidden;
  padding: 0 6px;

  & > .background {
    position: absolute;
    top: 80px;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  & > .dropdown {
    background: $main;
    height: 100%;
    min-width: 150px;
    display: flex;
    align-items: center;
    cursor: pointer;
    padding-left: 10px;

    &.open {
      box-shadow: 0 0 10px transparentize(black, 0.5);
    }

    & > .source {
      height: 20px;
      margin-right: 6px;
      order: 10;
      filter: drop-shadow(0 1px 1px black);
    }

    & > .expand {
      height: 20px;
      width: 20px;
      padding: 0 5px;
      box-sizing: content-box !important;
      fill: color($highlight, 800);
      margin-left: auto;
      order: 99;
    }
  }
}
</style>
