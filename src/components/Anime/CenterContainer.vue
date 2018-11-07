<template>
<div class="center-container">
  <description
    :content="content"
    :blur="blurDescription"
  />
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import Description from './Description.vue'
import Icon from '../Icon.vue'

@Component({
  components: { Description, Icon },
})
export default class CenterContainer extends Vue {
  @Prop(String) public content!: string | null
  @Prop(Boolean) public blurDescription!: boolean | null
}
</script>

<style scoped lang="scss">
@import '../../colors';

.center-container {
  position: relative;
  overflow: auto;
  pointer-events: none;

  & > * {
    pointer-events: all;
  }
}
</style>
