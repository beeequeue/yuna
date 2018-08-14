<template>
  <div class="home">
    <Logo class="logo"/>

    <HelloWorld />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Logo from '@/assets/logo.svg'
import LoginForm from '@/components/LoginForm.vue'

@Component({
  components: {
    Logo,
    LoginForm,
  },
})
export default class Login extends Vue {}
</script>

<style lang="scss" scoped>
@import '../colors';

.logo {
  height: 100px;
  fill: $purple;
}
</style>
