<template>
  <div v-if="supportedSources.length > 0" class="source-select">
    <div class="dropdown" @click="toggleOpen">
      <img
        v-for="source in supportedSources"
        :key="source.site"
        :src="getImageUrl(source)"
        class="source"
        :alt="source.site"
      />

      <icon :icon="expandSvg" class="expand" />
    </div>

    <transition>
      <div v-if="open" class="menu">
        <div
          class="menu-item crunchyroll"
          @click="handleClick(Provider.Crunchyroll)"
        >
          <img :src="crIcon" />
          Automatic
        </div>

        <div
          class="menu-item crunchyroll-search"
          @click="handleClick(Provider.CrunchyrollManual)"
        >
          <img :src="crIcon" />
          Manual
        </div>

        <div v-if="unsupportedSources.length > 0" class="menu-item unsupported">
          <a
            v-for="source in unsupportedSources"
            :key="source.site"
            :href="source.url"
          >
            <img :src="getImageUrl(source)" />
          </a>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { isNil } from 'rambdax'
import { mdiChevronDown } from '@mdi/js'

import crIcon from '@/assets/crunchyroll.webp'
import Icon from '@/components/Icon.vue'

import { QueueAnime, QueueExternalLinks, Provider } from '@/graphql/types'

import { Required } from '@/decorators'
import { StreamingSource, SupportedSources } from '@/types'
import { getStreamingSources } from '@/utils'

const streamingSiteCtx = require.context('@/assets', false)
const siteImages = streamingSiteCtx.keys()

@Component({ components: { Icon } })
export default class SourceSelect extends Vue {
  @Required(Object) public anime!: QueueAnime
  @Required(Function) public setProvider!: (provider: Provider) => void

  public open = false

  public Provider = Provider
  public crIcon = crIcon
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

  public handleClick(provider: Provider) {
    this.setProvider(provider)
    this.toggleOpen()
  }

  public toggleOpen() {
    this.open = !this.open
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.source-select {
  position: relative;

  & > .dropdown {
    background: $main;
    height: 100%;
    min-width: 125px;
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

  & > .menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    z-index: 100;
    transition: none 75ms;

    &.v-enter,
    &.v-leave-to {
      & > .menu-item {
        opacity: 0;
        transform: scale(0.9);
      }
    }

    & > .menu-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: color($main, 600);
      padding: 5px 10px;
      font-weight: 500;
      font-size: 0.9em;
      box-shadow: $shadow;
      cursor: pointer;
      transition: background 0.1s, transform 75ms, opacity 75ms;
      z-index: 99;

      &.unsupported {
        justify-content: flex-start;
        background: color($main, 400);
        cursor: default;

        & > a {
          display: flex;
          transition: transform 75ms;

          &:hover {
            transform: scale(1.1);
          }
        }

        & img {
          height: 16px;
        }

        &:hover {
          background: color($main, 400);
        }
      }

      &:hover {
        background: color($main, 800);
      }

      &:last-child {
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
      }

      & img {
        height: 20px;
        filter: drop-shadow(0 1px 1px black);
        margin-right: 5px;
      }
    }
  }
}
</style>
