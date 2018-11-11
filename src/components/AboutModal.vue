<template>
<transition>
  <div v-if="visible" class="container">
    <div class="cover" @click="toggleModal"/>

    <div class="modal">
      <h2>Crunch v{{version}}</h2>

      <div>Electron: {{electronVersion}}</div>
      <div>Chrome: {{chromeVersion}}</div>

      <a href="https://github.com/beeequeue/crunch">
        <div>Source on GitHub</div>
      </a>
    </div>
  </div>
</transition>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { electronVersion, chromeVersion } from 'electron-util'

@Component
export default class AboutModal extends Vue {
  @Prop(String) public version!: string
  @Prop(Boolean) public visible!: boolean | null
  @Prop(Function) public toggleModal!: () => any

  public electronVersion = electronVersion
  public chromeVersion = chromeVersion
}
</script>


<style scoped lang="scss">
@import '../colors';

.container {
  position: absolute;
  top: 30px;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;

  & > .cover {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  & > .modal {
    position: relative;
    min-height: 100px;
    padding: 0 35px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: $dark;
    border-radius: 5px;
    box-shadow: $shadow;
    z-index: 1;

    & > a:last-child {
      margin: 10px 0 25px;
      font-weight: 800;
      color: lighten($main, 20%);
      transition: color 0.15s;

      &:hover {
        color: lighten($main, 30%);
      }
    }
  }

  &.v-enter-active,
  &.v-leave-active {
    transition: opacity 0.25s;

    & > .modal {
      transition: transform 0.25s;
    }
  }

  &.v-enter,
  &.v-leave-to {
    opacity: 0;

    & > .modal {
      transform: translateY(10%);
    }
  }
}
</style>
