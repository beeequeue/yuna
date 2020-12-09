<template>
  <div v-if="listEntry" class="scores-container" @mouseleave="onMouseLeave">
    <div
      v-for="(score, index) in scores"
      :key="score"
      class="score"
      :style="{ height: `${size}px`, width: `${size}px` }"
      @click="updateScore(score)"
      @mouseenter="onMouseEnter(index)"
    >
      <icon class="hollow" :icon="hollowStarSvg" />
      <transition>
        <icon v-if="getFill(score, index)" :icon="starSvg" />
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { mdiStar, mdiStarOutline } from "@mdi/js"

import Icon from "@/common/components/icon.vue"
import { Default, Query, Required } from "@/decorators"
import { LIST_ENTRY_SCORE_QUERY } from "@/graphql/documents/queries"
import { updateScore } from "@/graphql/mutations/list-entry"
import {
  ListEntryQuery,
  ListEntryQueryVariables,
} from "@/graphql/generated/types"

@Component({ components: { Icon } })
export default class Score extends Vue {
  @Required(Number) mediaId!: number
  @Default(Number, 50) size!: number

  @Query<Score, ListEntryQuery, ListEntryQueryVariables>({
    fetchPolicy: "cache-first",
    query: LIST_ENTRY_SCORE_QUERY,
    variables() {
      return {
        mediaId: this.mediaId,
      }
    },
    update(data) {
      return data.ListEntry
    },
  })
  public listEntry!: ListEntryQuery["ListEntry"]

  public scores = [1, 25, 50, 75, 100]
  public hoveredIndex = -1

  public starSvg = mdiStar
  public hollowStarSvg = mdiStarOutline

  public getFill(score: number, index: number) {
    return this.hoveredIndex >= index || this.listEntry!.score! >= score
  }

  public onMouseEnter(index: number) {
    this.hoveredIndex = index
  }

  public onMouseLeave() {
    this.hoveredIndex = -1
  }

  public async updateScore(score: number) {
    if (!this.listEntry) return

    await updateScore(this, this.mediaId, score)
  }
}
</script>

<style scoped lang="scss">
@import "../../colors";

.scores-container {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  pointer-events: all;
  overflow: hidden;
  filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 1));
  transition: height 0.25s, opacity 0.25s;

  & > .score {
    position: relative;
    cursor: pointer;
    pointer-events: all;
    transition: transform 0.15s;

    & > .icon {
      position: absolute;
      height: 100%;
      width: 100%;
      top: 0;
      left: 0;
      fill: gold;
      filter: pixelate(100);
      transform: scale(1);
      transition: transform 0.15s, fill 0.25s;

      &.hollow {
        transform: scale(1.1);

        & ::v-deep svg path {
          stroke: mix(black, gold, 40%);
          stroke-width: 0.5px;
          stroke-linejoin: round;
        }
      }

      &.v-enter,
      &.v-leave-to {
        transform: scale(0);
      }
    }
  }
}
</style>
