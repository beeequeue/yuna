<template>
<div class="container">
  <span class="button">D</span>

  <Item text="Queue" path="/queue"/>

  <span>Search goes here</span>

  <Item text="List" path="/list"/>

  <span class="button">S</span>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Item from './Item.vue'

@Component({
  components: { Item },
})
export default class Navbar extends Vue {}
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

    cursor: pointer;
  }
}
</style>
