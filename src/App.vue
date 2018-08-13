<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
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

  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-bottom: 25px;

  & * {
    box-sizing: border-box;
  }
}
</style>
