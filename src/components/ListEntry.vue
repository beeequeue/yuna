<template>
  <div class="entry" v-tooltip="entry.anime.title.userPreferred">
    <router-link :to="`/anime/${entry.anime.id}`">
      <cover-image
        :src="entry.anime.coverImage.medium"
        :color="entry.anime.coverImage.color"
      />
    </router-link>

    <div class="info">
      <actions
        :mediaListEntry="entry"
        :anime="entry.anime"
        :exclude="['editEntry']"
        small
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { ListQueryEntries } from '@/graphql/types'
import { Required } from '@/decorators'

import CoverImage from './Anime/CoverImage.vue'
import CButton from './CButton.vue'
import Actions from './Anime/Actions.vue'

@Component({ components: { CoverImage, CButton, Actions } })
export default class ListEntry extends Vue {
  @Required(Object) public entry!: ListQueryEntries
}
</script>

<style scoped lang="scss">
@import '../colors';

.entry {
  position: relative;
  height: 150px;
  width: 100px;
  flex-shrink: 0;
  display: flex;
  margin: 10px 25px;
  border-radius: 5px;

  & .cover-image,
  & > .info {
    transition: transform 0.15s;
  }

  & > a {
    position: relative;
    height: 100%;
    width: 100%;

    & > .cover-image {
      height: 100%;
      width: 100%;
      flex-shrink: 0;
      margin-right: 10px;
      box-shadow: $shadow;
      z-index: 2;
    }
  }

  & > .info {
    position: absolute;
    top: 5px;
    bottom: 5px;
    right: 0;
    display: flex;
    flex-direction: column;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    z-index: 1;

    & /deep/ .button {
      opacity: 0;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      transition: opacity 0s;
      transition-delay: 0.15s;
    }
  }

  &:hover {
    & .cover-image {
      transform: translateX(-15px);
    }
    & > .info {
      transform: translateX(15px);

      & /deep/ .button {
        opacity: 1;
        transition-delay: 0s;
      }
    }
  }
}
</style>
