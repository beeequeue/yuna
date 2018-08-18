<template>
<div class="container">
  <icon class="button" :icon="homeOutlineSvg"/>

  <item text="Queue" path="/queue"/>

  <span>Search goes here</span>

  <item text="List" path="/list"/>

  <icon class="button" :icon="settingsSvg"/>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mdiHomeOutline, mdiSettingsOutline } from '@mdi/js'

import Item from './Item.vue'
import Icon from '../Icon.vue'

@Component({
  components: { Icon, Item },
})
export default class Navbar extends Vue {
  homeOutlineSvg = mdiHomeOutline
  settingsSvg = mdiSettingsOutline
}
</script>

<style scoped lang="scss">
@import '../../colors';

.container {
  display: grid;
  grid-template-columns: 50px 1fr 400px 1fr 50px;
  justify-items: center;
  align-items: center;
  background: $dark;

  & > .button {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    padding: 10px;
    fill: $white;

    cursor: pointer;
  }
}
</style>
