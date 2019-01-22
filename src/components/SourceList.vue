<template>
  <div class="source-list">
    <a v-for="link in sources" :href="link.url" class="link">
      <img :src="getImageUrl(link.site)" :title="link.site" />
    </a>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { contains, flip } from 'rambdax'

import { AnimePageQueryExternalLinks } from '@/graphql/types'

import { Default } from '@/decorators'
import { enumKeysToArray } from '@/utils'

import CButton from './CButton.vue'
import Icon from './Icon.vue'

const streamingSiteCtx = require.context('@/assets', false)
const siteImages = streamingSiteCtx.keys()

enum StreamingSource {
  Crunchyroll = 'crunchyroll',
  Hulu = 'hulu',
  Hidive = 'hidive',
  Animelab = 'animelab',
  Funimation = 'funimation',
}

const streamingSites = enumKeysToArray(StreamingSource)
const isStreamingSite = flip<AnimePageQueryExternalLinks[], string[], any>(
  contains,
)(streamingSites)

@Component({ components: { CButton, Icon } })
export default class SourceList extends Vue {
  @Default(Array, [])
  public links!: AnimePageQueryExternalLinks[]

  public get sources() {
    return this.links.filter(link => isStreamingSite(link.site))
  }

  public getImageUrl(source: keyof StreamingSource) {
    const image = `./${StreamingSource[source as any]}.webp`

    if (!siteImages.includes(image)) {
      return null
    }

    return streamingSiteCtx(image)
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.source-list {
  width: 100%;
  padding: 15px;
  position: relative;
  display: flex;
  justify-content: center;

  & > .link {
    position: relative;
    height: 50px;
    margin-right: 20px;
    filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.75));
    transition: transform 0.15s;

    & > img {
      height: 100%;
    }

    &:hover {
      transform: translateY(-2px);
    }
  }
}
</style>
