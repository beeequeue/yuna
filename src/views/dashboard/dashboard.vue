<template>
  <div class="container">
    <episode-feed />

    <div class="main">
      <changelog />
    </div>
  </div>
</template>

<script lang="ts">
import EpisodeFeed from './components/episode-feed.vue'
import Changelog from './components/changelog.vue'

export default {
  components: { EpisodeFeed, Changelog },
}
</script>

<style scoped lang="scss">
@import '../../colors';

.container {
  position: absolute;
  top: 80px;
  bottom: 0;
  width: 100%;

  display: grid;
  grid-template-columns: 28% 1fr;
  grid-template-rows: 100%;
  justify-items: center;
  align-items: center;

  & > .main {
    height: 100%;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}

.route-enter-active,
.route-leave-active {
  transition: none 0.5s; // Required for Vue to realize there are transitions

  & > .episode-feed,
  & .changelog,
  & .patreon {
    transition: opacity 0.5s, transform 0.5s;
  }
}

.route-enter,
.route-leave-to {
  & > .episode-feed {
    transform: translateX(-100%);
  }

  & > .main {
    & > .patreon {
      opacity: 0;
      transform: translateY(-10%);
    }

    & > .changelog {
      opacity: 0;
      transform: translateY(2.5%);
    }
  }
}
</style>
