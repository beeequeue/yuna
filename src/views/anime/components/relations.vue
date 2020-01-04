import { MediaRelation } from '../../graphql/types'
<template>
  <div class="relations">
    <div
      v-for="prequel in prequels"
      :key="prequel.id"
      class="relation"
      @click="$router.push(`/anime/${prequel.id}`)"
    >
      <img
        v-if="prequel.bannerImage"
        :src="prequel.bannerImage"
        class="banner"
      />

      <div class="title">
        <icon :icon="getRelationIcon('PREQUEL')" />
        <span>{{ prequel.title.userPreferred }}</span>
      </div>
    </div>

    <div
      v-for="sequel in sequels"
      :key="sequel.id"
      class="relation"
      @click="$router.push(`/anime/${sequel.id}`)"
    >
      <img v-if="sequel.bannerImage" :src="sequel.bannerImage" class="banner" />

      <div class="title">
        <icon :icon="getRelationIcon('SEQUEL')" />
        <span>{{ sequel.title.userPreferred }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mdiArrowLeftBold, mdiArrowRightBold } from '@mdi/js'

import { AnimeViewRelations } from '@/graphql/types'

import Icon from '@/common/components/icon.vue'
import { Required } from '@/decorators'

@Component({
  components: { Icon },
})
export default class Relations extends Vue {
  @Required(Array) public prequels!: AnimeViewRelations[]
  @Required(Array) public sequels!: AnimeViewRelations[]

  public getRelationIcon(relation: 'PREQUEL' | 'SEQUEL') {
    switch (relation) {
      case 'PREQUEL':
        return mdiArrowLeftBold
      case 'SEQUEL':
        return mdiArrowRightBold
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

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
    background: color($main, 200);
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
        flex-shrink: 0;
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
