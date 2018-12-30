<template>
  <div class="relations">
    <div
      v-for="relation in relevantRelations"
      class="relation"
      @click="$router.push(`/anime/${relation.node.id}`)"
      :key="relation.node.id"
    >
      <img v-if="relation.node.bannerImage" :src="relation.node.bannerImage" class="banner">

      <div class="title">
        <icon :icon="getRelationIcon(relation.relationType)"/>
        <span>{{ relation.node.title.userPreferred }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { filter, contains } from 'rambdax'
import { mdiArrowLeftBold, mdiArrowRightBold } from '@mdi/js'

import { AnimePageQuery_anime_relations } from '@/graphql/AnimePageQuery'
import { MediaRelation, MediaType } from '@/graphql-types'
import { prop } from '@/utils'
import Icon from '../Icon.vue'

@Component({
  components: { Icon },
})
export default class Relations extends Vue {
  @Prop(prop(Object))
  public relations!: AnimePageQuery_anime_relations | null

  public get relevantRelations() {
    if (!this.relations || !this.relations.edges) return []

    return filter(
      edge =>
        edge != null &&
        edge.node != null &&
        contains(edge.relationType, [
          MediaRelation.PREQUEL,
          MediaRelation.SEQUEL,
        ]) &&
        contains(edge.node.type, [MediaType.ANIME]),
      this.relations.edges,
    )
  }

  public getRelationIcon(relation: MediaRelation) {
    switch (relation) {
      case MediaRelation.PREQUEL:
        return mdiArrowLeftBold
      case MediaRelation.SEQUEL:
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
