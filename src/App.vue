<template>
  <div id="app">
    <router-view/>
  </div>
</template>

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
  color: $purpleLight;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;

  & * {
    box-sizing: border-box;
  }
}
</style>
