<template>
  <div class="queue">
    <div class="series">
      <div v-for="item in queue" class="anime" :key="item.series.crunchyroll.id">
        <img class="image" :src="item.series.landscapeImage"/>

        <div class="details">
          <a
            class="anime-name"
            :href="item.series.crunchyroll.url"
            target="_blank">
            {{item.series.name}}
          </a>

          <p class="episode-name">
            {{item.episode.progress > 0 ? 'Current' : 'Next'}} episode:
            {{item.episode.name}}
          </p>
        </div>

        <a class="episode" :href="item.episode.crunchyroll.url" target="_blank">
          <img class="image" :src="item.episode.image"/>
          <icon class="play-button" :icon="playSvg"/>
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mdiPlayCircleOutline } from '@mdi/js'

import Icon from '../components/Icon.vue'
import { updateQueue } from '../state/user'

@Component({
  components: { Icon },
})
export default class Queue extends Vue {

  get queue() {
    return this.$store.state.user.queue
  }

  public playSvg = mdiPlayCircleOutline
  public mounted() {
    updateQueue(this.$store)
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.queue {
  width: 100%;
  height: 100%;

  .series {
    position: absolute;
    display: inline-block;
    left: 0;
    height: 100%;
    padding: 15px 25px;
    overflow-y: auto;

    min-width: 800px;
    background: #10111a;
  }

  .anime {
    display: grid;
    grid-template-columns: [anime] 200px [details] 1fr [episode] auto;
    grid-auto-rows: 100px;

    position: relative;
    width: 100%;
    background: rgba(0, 0, 0, 0.35);
    margin-bottom: 10px;
    border-radius: 5px;
    overflow: hidden;

    & .image {
      object-fit: cover;
      width: 200px;
      height: 100px;
    }

    & > .details {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 10px 15px;

      & > .anime-name {
        margin: 0;

        color: $white;
        text-align: left;
        text-decoration: none;
        font-family: 'Raleway', sans-serif;
        font-weight: 300;

        &:hover {
          text-decoration: underline;
        }
      }

      & > .episode-name {
        width: 100%;
        margin: auto 0 0;

        text-align: right;
        font-family: 'Raleway', sans-serif;
        font-weight: 300;
      }
    }

    & > .episode {
      position: relative;
      justify-self: end;
      background: black;

      & > .image {
        opacity: 0.65;
        transition: opacity 0.1s;
      }

      & > .play-button {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 50px;
        width: 50px;
        fill: $white;
      }

      &:hover {
        & > .image {
          opacity: 0.8;
        }
      }
    }
  }
}

.v-enter-active,
.v-leave-active {
  transition: none 0.5s; // Required for Vue to realize there are transitions

  & > .series {
    transition: transform 0.5s;
  }
}

.v-enter,
.v-leave-to {
  & > .series {
    transform: translateX(-100%);
  }
}
</style>
