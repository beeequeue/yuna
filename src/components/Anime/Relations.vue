import { MediaRelation } from '../../graphql-types'
<template>
<div class="relations">
  <div
    v-for="relation in relevantRelations"
    class="relation"
    @click="$router.push(`/anime/${relation.node.id}`)"
  >
    <img
      v-if="relation.node.bannerImage"
      :src="relation.node.bannerImage"
      class="banner"
    />

    <div class="title">
      <icon :icon="getRelationIcon(relation.relationType)"/>
      <span>{{ relation.node.title.userPreferred }}</span>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import * as R from 'rambda'
import { mdiArrowLeftBold, mdiArrowRightBold } from '@mdi/js'

import Icon from '../Icon.vue'
import { AnimePageQuery_Media_relations } from '../../graphql/AnimePageQuery'
import { MediaRelation } from '../../graphql-types'
import { prop } from '../../utils'

@Component({
  components: { Icon },
})
export default class Relations extends Vue {
  @Prop(prop(Object))
  public relations!: AnimePageQuery_Media_relations | null

  public get relevantRelations() {
    if (!this.relations || !this.relations.edges) return []

    return R.filter(
      edge =>
        edge != null &&
        R.contains(edge.relationType, [
          MediaRelation.PREQUEL,
          MediaRelation.SEQUEL,
        ]),
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

  & > .relation {
    display: flex;
    flex-direction: column;
    position: relative;
    font-family: 'Raleway', sans-serif;
    margin-bottom: 10px;
    background: lighten($dark, 10%);
    text-align: left;
    border-radius: 5px;
    overflow: hidden;
    cursor: pointer;
    box-shadow: $shadow;

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
