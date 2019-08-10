<template>
  <div class="entry" v-tooltip="title">
    <router-link :to="`/anime/${animeId}`">
      <cover-image :src="coverImage.medium" :color="coverImage.color" />
    </router-link>

    <div class="info">
      <actions :mediaListEntry="mediaListEntry" :anime="mediaListEntry.anime" :exclude="['editEntry']" small />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { oc } from 'ts-optchain'

import { Required, Query } from '@/decorators'
import { MediaListQuery, MediaListQueryVariables } from '@/graphql/types'
import MEDIA_LIST from '@/common/queries/media-list.graphql'

import CoverImage from '@/common/components/cover-image.vue'
import Actions from '@/common/components/actions.vue'
import CButton from '@/common/components/button.vue'

@Component({ components: { CoverImage, CButton, Actions } })
export default class ListEntry extends Vue {
  @Required(Number)
  public id!: number

  @Query<ListEntry, MediaListQuery, MediaListQueryVariables>({
    query: MEDIA_LIST,
    variables() {
      return { id: this.id }
    },
  })
  public mediaListEntry!: MediaListQuery['mediaListEntry']

  public get title() {
    return oc(this.mediaListEntry).anime.title.userPreferred("")
  }

  public get animeId() {
    return oc(this.mediaListEntry).anime.id()!
  }

  public get coverImage() {
    return oc(this.mediaListEntry).anime.coverImage() || {}
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

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
