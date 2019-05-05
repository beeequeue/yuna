<template>
  <div class="source-select" :class="{ highlight }">
    <div :id="`source-select-${anime.id}`" class="dropdown" @click="toggleOpen">
      <span
        v-for="source in supportedSources"
        :key="source.site"
        v-html="getLogo(source)"
        class="source"
        :class="getDropdownClasses(source)"
        :alt="source.site"
      />

      <span class="text">
        Select source...
      </span>

      <icon :icon="expandSvg" class="expand" />
    </div>

    <transition>
      <div v-if="open" class="menu">
        <div
          v-if="getIsSupported(Provider.Crunchyroll)"
          class="menu-item crunchyroll"
          @click="handleClick(Provider.Crunchyroll)"
        >
          <span class="svg" v-html="crIcon" />
          Automatic
        </div>

        <div
          v-if="getIsSupported(Provider.Hidive)"
          class="menu-item hidive"
          @click="handleClick(Provider.Hidive)"
        >
          <span class="svg" v-html="hidiveIcon" />
          Automatic
        </div>

        <div
          class="menu-item crunchyroll-search"
          @click="handleClick(Provider.CrunchyrollManual)"
        >
          <span class="svg" v-html="crIcon" />
          Search
        </div>

        <div class="menu-item local-file" @click="handleClick(Provider.Local)">
          <icon class="svg file" :icon="fileSvg" />
          Local files
        </div>

        <div v-if="unsupportedSources.length > 0" class="menu-item unsupported">
          <a
            v-for="source in unsupportedSources"
            :key="source.site"
            :href="source.url"
          >
            <span class="svg" v-html="getLogo(source)" />
          </a>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiChevronDown, mdiFile } from '@mdi/js'

import crIcon from '@/assets/crunchyroll.svg'
import hidiveIcon from '@/assets/hidive.svg'
import Icon from '@/common/components/icon.vue'

import { Provider, QueueAnime, QueueExternalLinks } from '@/graphql/types'

import { Required } from '@/decorators'
import { initManualSearch, setLocalSourceAnime } from '@/state/app'
import { getLocalFilesFolder } from '@/state/settings'
import { StreamingSource, SupportedSources } from '@/types'
import { getStreamingSources, isNil, isNotNil } from '@/utils'

const streamingSiteCtx = require.context('@/assets', false)
const siteImages = streamingSiteCtx.keys()

@Component({ components: { Icon } })
export default class SourceSelect extends Vue {
  @Required(Object) public anime!: QueueAnime
  @Required(String) public currentProvider!: Provider
  @Required(Function) public setProvider!: (provider: Provider) => void
  @Prop(Boolean) public highlight!: boolean

  public open = false

  public Provider = Provider
  public crIcon = crIcon
  public hidiveIcon = hidiveIcon
  public expandSvg = mdiChevronDown
  public fileSvg = mdiFile

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

  public get localFilesFolder() {
    return getLocalFilesFolder(this.$store)
  }

  public getLogo(source: QueueExternalLinks) {
    const image = `./${StreamingSource[source.site as any]}.svg`

    if (!siteImages.includes(image)) {
      return null
    }

    return streamingSiteCtx(image).default
  }

  public getIsSupported(provider: Provider) {
    return isNotNil(
      this.supportedSources.find(
        source => source.site.toLowerCase() === provider.toLowerCase(),
      ),
    )
  }

  public getDropdownClasses(source: QueueExternalLinks) {
    return {
      fade:
        source.site.toUpperCase() !==
        this.currentProvider.replace('Manual', ''),
    }
  }

  public handleClick(provider: Provider) {
    if (provider === Provider.CrunchyrollManual) {
      initManualSearch(this.$store, {
        anilistId: this.anime.id,
        provider: Provider.Crunchyroll,
      })
    }

    if (provider === Provider.Local) {
      if (isNil(this.localFilesFolder)) {
        this.$router.push('/settings#local-files')

        return
      }

      setLocalSourceAnime(this.$store, this.anime.id)
    }

    this.setProvider(provider)
    this.toggleOpen()
  }

  public toggleOpen() {
    this.open = !this.open
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.source-select {
  position: relative;
  transition: box-shadow 0.5s;

  &.highlight {
    box-shadow: 0 0 20px white;
  }

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
      width: 20px;
      margin-right: 6px;
      order: 10;
      filter: drop-shadow(0 1px 1px black);

      &.fade {
        filter: brightness(0.5) drop-shadow(0 1px 1px black);
      }
    }

    & > .text {
      margin: 0 5px;
      order: 98;
      color: color($gray, 600);
      font-weight: 400;
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

        & .svg {
          height: 16px;
          width: 16px;
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

      & .svg {
        height: 20px;
        width: 20px;
        filter: drop-shadow(0 1px 1px black);
        margin-right: 5px;

        &.file {
          fill: $white;
        }
      }
    }
  }
}
</style>
