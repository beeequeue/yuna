<template>
<div class="entry" v-tooltip="entry.anime.title.userPreferred">
  <router-link :to="`/anime/${entry.anime.id}`">
    <cover-image
      :src="entry.anime.coverImage.large"
    />
  </router-link>

  <div class="info">
    <actions
      :mediaListEntry="entry"
      :anime="entry.anime"
      small
      :exclude="['editEntry']"
    />
  </div>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { ListQuery_listCollection_lists_entries } from '@/graphql/ListQuery'
import { prop } from '@/utils'

import CoverImage from './Anime/CoverImage.vue'
import CButton from './CButton.vue'
import Actions from './Anime/Actions.vue'

@Component({ components: { CoverImage, CButton, Actions } })
export default class ListEntry extends Vue {
  @Prop(prop(Object, true))
  public entry!: ListQuery_listCollection_lists_entries
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

  & .cover-image {
    height: 100%;
    flex-shrink: 0;
    margin-right: 10px;
    box-shadow: $shadow;
    z-index: 2;
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
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }

  &:hover {
    & .cover-image {
      transform: translateX(-15px);
    }
    & > .info {
      transform: translateX(15px);
    }
  }
}
</style>
