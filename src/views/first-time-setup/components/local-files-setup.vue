<template>
  <div class="step local-files-setup" @keydown.enter="login">
    <h2>Local Files</h2>

    <section class="folder">
      <div>Anime Folder</div>

      <c-button
        :icon="folderSvg"
        :content="localFilesFolder == null ? 'Select folder' : 'Change folder'"
        v-tooltip="localFilesFolder"
        :click="setTemporaryLocalFilesFolder"
      />
    </section>

    <section class="external-players">
      <div>External Players</div>
      <div class="small">Click a player to manually set the path to them</div>

      <div class="container">
        <div class="vlc">
          <icon
            :icon="vlcSvg"
            :class="{ exists: vlcPath != null }"
            v-tooltip="vlcPath"
            @click="setTemporaryVLCPath"
          />
          <div v-if="vlcPath != null">Found!</div>
        </div>
      </div>
    </section>

    <c-button content="Continue" :click="finishStep" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiFolderSearch, mdiVlc } from '@mdi/js'

import CButton from '@/common/components/button.vue'
import Icon from '@/common/components/icon.vue'
import Checkbox from '@/common/components/form/checkbox.vue'

import { VLC } from '@/lib/players/vlc'
import { getSettings, setLocalFilesFolder, setVLCPath } from '@/state/settings'
import { isNil } from '@/utils'
import { getFilePath, getFolderPath } from '@/utils/paths'

@Component({ components: { Icon, CButton, Checkbox } })
export default class Discord extends Vue {
  @Prop() public goToNextStep!: () => any

  public vlcSvg = mdiVlc
  public folderSvg = mdiFolderSearch

  public localFilesFolder = getSettings(this.$store).localFilesFolder
  public vlcPath =
    getSettings(this.$store).externalPlayers.vlc || VLC.getVLCPath()

  public setTemporaryLocalFilesFolder() {
    const path = getFolderPath({
      title: 'Set directory for Local Files',
    })

    if (isNil(path)) return

    this.localFilesFolder = path
  }

  public setTemporaryVLCPath() {
    const path = getFilePath({
      title: 'Set directory for Local Files',
      filters: [{ name: 'vlc', extensions: ['exe'] }],
    })

    if (isNil(path)) return

    this.vlcPath = path
  }

  public finishStep() {
    setLocalFilesFolder(this.$store, this.localFilesFolder)
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
  user-select: none;

  & > section {
    margin: 5px 0 10px;

    & > .small {
      font-size: 0.9em;
      color: $gray;
    }
  }

  & > .folder {
    & > .button {
      margin-top: 10px;
    }
  }

  & > .external-players > .container {
    & > .vlc {
      margin-top: 10px;
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

  & > .button {
    width: 100%;
    padding: 10px;
  }
}
</style>
