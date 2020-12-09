<template>
  <div class="source-list">
    <a
      v-for="link in sources"
      :key="link.url"
      :href="link.url"
      class="link"
      v-html="getLogo(link.site)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"

import { AnimeViewExternalLinks } from "@/graphql/generated/types"

import { Default } from "@/decorators"
import { StreamingSource } from "@/types"
import { getStreamingSources } from "@/utils"

import CButton from "./button.vue"
import Icon from "./icon.vue"

const streamingSiteCtx = require.context("@/assets", false)
const siteImages = streamingSiteCtx.keys()

@Component({ components: { CButton, Icon } })
export default class SourceList extends Vue {
  @Default(Array, () => [])
  public links!: AnimeViewExternalLinks[]

  public get sources() {
    return getStreamingSources(this.links)
  }

  public getLogo(source: keyof StreamingSource) {
    const image = `./${
      StreamingSource[source as keyof typeof StreamingSource]
    }.svg`

    if (!siteImages.includes(image)) {
      return null
    }

    return streamingSiteCtx(image).default
  }
}
</script>

<style scoped lang="scss">
@import "../../colors";

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

    & ::v-deep svg {
      height: 100%;
    }

    &:hover {
      transform: translateY(-2px);
    }
  }
}
</style>
