<template>
<div class="center-container">
  <description
    :loading="loading"
    :content="content"
  />
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import Description from './Description.vue'
import Icon from '../Icon.vue'
import { prop } from '../../utils'

@Component({
  components: { Description, Icon },
})
export default class CenterContainer extends Vue {
  @Prop(prop(Boolean, true))
  public loading!: boolean
  @Prop(prop(String))
  public content!: string | null
}
</script>

<style scoped lang="scss">
@import '../../colors';

.center-container {
  position: relative;
  overflow: auto;
}
</style>
