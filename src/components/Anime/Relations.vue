import { MediaRelation } from '../../graphql/types'
<template>
  <div class="relations">
    <div
      v-for="prequel in prequels"
      class="relation"
      @click="$router.push(`/anime/${prequel.node.id}`)"
      :key="prequel.node.id"
    >
      <img
        v-if="prequel.node.bannerImage"
        :src="prequel.node.bannerImage"
        class="banner"
      />

      <div class="title">
        <icon :icon="getRelationIcon(prequel.relationType)" />
        <span>{{ prequel.node.title.userPreferred }}</span>
      </div>
    </div>

    <div
      v-for="sequel in sequels"
      class="relation"
      @click="$router.push(`/anime/${sequel.node.id}`)"
      :key="sequel.node.id"
    >
      <img
        v-if="sequel.node.bannerImage"
        :src="sequel.node.bannerImage"
        class="banner"
      />

      <div class="title">
        <icon :icon="getRelationIcon(sequel.relationType)" />
        <span>{{ sequel.node.title.userPreferred }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { contains, equals, filter } from 'rambdax'
import { mdiArrowLeftBold, mdiArrowRightBold } from '@mdi/js'

import {
  AnimePageQueryRelations,
  MediaRelation,
  MediaType,
} from '@/graphql/types'
import { prop } from '@/utils'

import Icon from '../Icon.vue'

@Component({
  components: { Icon },
})
export default class Relations extends Vue {
  @Prop(prop(Object))
  public relations!: AnimePageQueryRelations | null

  public get prequels() {
    return this.getRelationOfType(MediaRelation.Prequel)
  }

  public get sequels() {
    return this.getRelationOfType(MediaRelation.Sequel)
  }

  public getRelationOfType(type: MediaRelation) {
    if (!this.relations || !this.relations.edges) return []

    return filter(
      edge =>
        edge != null &&
        edge.node != null &&
        equals(edge.relationType, type) &&
        contains(edge.node.type, [MediaType.Anime]),
      this.relations.edges,
    )
  }

  public getRelationIcon(relation: MediaRelation) {
    switch (relation) {
      case MediaRelation.Prequel:
        return mdiArrowLeftBold
      case MediaRelation.Sequel:
        return mdiArrowRightBold
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.relations {
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  padding-right: 5px;
  max-height: 180px;
  overflow-y: auto;

  & > .relation {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    position: relative;
    font-family: 'Raleway', sans-serif;
    margin-bottom: 10px;
    background: lighten($dark, 10%);
    text-align: left;
    border-radius: 5px;
    overflow: hidden;
    cursor: pointer;
    box-shadow: $shadow;

    &:last-child {
      margin-bottom: 0;
    }

    & > .title {
      display: flex;
      align-items: center;
      padding: 10px;

      & > .icon {
        height: 20px;
        width: 20px;
        margin-right: 8px;
        fill: $white;
      }
    }

    & > .banner {
      display: block;
      width: 100%;
      height: 45px;
      object-fit: cover;
    }
  }
}
</style>
