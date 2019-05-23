<template>
  <div class="step local-files-setup" @keydown.enter="login">
    <h2>Local Files</h2>

    <div class="external-players">
      <div>External Players</div>
      <div class="small">Click a player to manually set the path to them</div>

      <div class="container">
        <div class="vlc" v-tooltip="vlcPath">
          <icon :icon="vlcSvg" :class="{ exists: vlcPath != null }" />
          <div v-if="vlcPath != null">Found!</div>
        </div>
      </div>
    </div>

    <c-button content="Continue" :click="finishStep" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiVlc } from '@mdi/js'

import CButton from '@/common/components/button.vue'
import Icon from '@/common/components/icon.vue'
import Checkbox from '@/common/components/form/checkbox.vue'

import { VLC } from '@/lib/players/vlc'
import { getSettings, setVLCPath } from '@/state/settings'

@Component({ components: { Icon, CButton, Checkbox } })
export default class Discord extends Vue {
  @Prop() public goToNextStep!: () => any

  public vlcSvg = mdiVlc

  public vlcPath =
    getSettings(this.$store).externalPlayers.vlc || VLC.getVLCPath()

  public finishStep() {
    setVLCPath(this.$store, this.vlcPath)

    this.goToNextStep()
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.local-files-setup {
  display: flex;
  flex-direction: column;
  align-items: center;

  .external-players {
    & > .small {
      font-size: 0.9em;
      color: $gray;
    }

    & > .container {
      & > .vlc {
        margin: 15px;
        color: $success;
        font-weight: 600;

        & > .icon {
          height: 75px;
          width: 75px;
          fill: dimgray;
          opacity: 0.75;
          cursor: pointer;
          transition: fill 1s;

          &.exists {
            fill: $vlc;
          }
        }
      }
    }
  }

  & > .button {
    width: 100%;
    padding: 10px;
  }
}
</style>
