<template>
  <div id="app">
    <router-view/>

    <button class="logout-button" @click="logOut">log out</button>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator'
import Component from 'vue-class-component'
import { createSession, isLoggedIn, logOutCrunchyroll } from './state/auth'

@Component
export default class App extends Vue {
  mounted() {
    createSession(this.$store)

    if (!this.isLoggedIn) {
      return this.$router.push('/login')
    }
  }

  get isLoggedIn() {
    return isLoggedIn(this.$store)
  }

  logOut() {
    logOutCrunchyroll(this.$store)

    this.$router.push('/login')
  }
}
</script>

<style lang="scss">
@import 'colors';

html,
body,
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 25px;

  background: $dark;
  color: $white;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;

  & * {
    box-sizing: border-box;
  }
}

.logout-button {
  position: absolute;
  bottom: 5px;
  right: 5px;
}
</style>
