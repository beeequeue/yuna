<template>
  <div class="source-list">
    <a
      v-for="link in sources"
      :key="link.url"
      :href="link.url"
      v-html="getLogo(link.site)"
      class="link"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { AnimePageQueryExternalLinks } from '@/graphql/types'

import { Default } from '@/decorators'
import { StreamingSource } from '@/types'
import { getStreamingSources } from '@/utils'

import CButton from './CButton.vue'
import Icon from './Icon.vue'

const streamingSiteCtx = require.context('@/assets', false)
const siteImages = streamingSiteCtx.keys()

@Component({ components: { CButton, Icon } })
export default class SourceList extends Vue {
  @Default(Array, [])
  public links!: AnimePageQueryExternalLinks[]

  public get sources() {
    return getStreamingSources(this.links)
  }

  public getLogo(source: keyof StreamingSource) {
    const image = `./${StreamingSource[source as any]}.svg`

    if (!siteImages.includes(image)) {
      return null
    }

    return streamingSiteCtx(image).default
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

    & /deep/ svg {
      height: 100%;
    }

    &:hover {
      transform: translateY(-2px);
    }
  }
}
</style>
