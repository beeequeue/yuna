<template>
  <a href="https://patreon.com/yuna_app" class="patreon">
    <span class="logo" v-html="patreonImg" />
    Please support the development of this program!
  </a>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import patreonSvg from '@/assets/patreon.svg'

@Component({})
export default class Patreon extends Vue {
  public patreonImg = patreonSvg
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.patreon {
  display: flex;
  align-items: center;
  padding: 5px;
  padding-right: 15px;
  font-weight: 600;
  border-radius: 5px;
  background: $dark;
  color: white;
  text-decoration: none;
  margin-bottom: 10px;
  box-shadow: $shadow;

  & > .logo {
    display: inline-block;
    height: 50px;
    width: 50px;
  }
}
</style>
