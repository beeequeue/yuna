<template>
  <modal-base v-if="anime != null" :name="modalName">
    <div class="modal-body edit-modal">
      <anime-banner :anime="anime" />

      <div class="list-entry-fields">
        <dropdown
          :disabled="saving"
          label="Status"
          :items="statusItems"
          :on-change="(value) => setValue('status', value)"
          :value="status"
        />

        <number-input
          :disabled="saving"
          label="Progress"
          :suffix="`/ ${anime.episodes ? anime.episodes : '?'}`"
          :min="0"
          :max="anime.episodes"
          :value="progress"
          :on-change="(value) => setValue('progress', value)"
        />

        <number-input
          :disabled="saving"
          label="Score"
          suffix="/ 100"
          :min="0"
          :max="100"
          :value="score"
          :on-change="(value) => setValue('score', value)"
        />

        <number-input
          :disabled="saving"
          label="Repeated"
          suffix=" times"
          :min="0"
          :max="999"
          :value="repeated"
          :on-change="(value) => setValue('rewatched', value)"
        />

        <transition name="fade">
          <div v-if="anime && anime.listEntry == null" class="not-in-list">
            Not in List
            <c-button :disabled="saving" content="Add to List" />
          </div>
        </transition>
      </div>

      <div class="buttons">
        <c-button
          :disabled="saving"
          type="danger"
          flat
          confirm
          content="Delete"
          :icon="deleteSvg"
          :click="deleteEntry"
        />

        <transition name="fade">
          <loading v-if="saving" :size="30" class="loader" />
        </transition>

        <c-button
          :disabled="saving"
          type="success"
          content="Save changes"
          :click="save"
        />
      </div>
    </div>
  </modal-base>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { mdiCloseCircle } from "@mdi/js"

import { deleteFromList, editListEntry } from "@/graphql/mutations/list-entry"
import { MediaListStatus } from "@/graphql/generated/types"

import {
  EditModalAnime,
  getEditingAnime,
  ModalName,
  setEditingAnimeValue,
  toggleModal,
} from "@/state/app"
import { enumToArray, humanizeMediaListStatus } from "@/utils"

import CButton from "@/common/components/button.vue"
import NumberInput from "@/common/components/form/number-input.vue"
// @ts-ignore
import Dropdown, { DropdownItem } from "@/common/components/form/dropdown.vue"
import ModalBase from "@/common/modals/base.vue"
import AnimeBanner from "@/common/components/anime-banner.vue"
import Icon from "@/common/components/icon.vue"
import Loading from "@/common/components/loading.vue"

@Component({
  components: {
    Loading,
    ModalBase,
    AnimeBanner,
    Icon,
    NumberInput,
    Dropdown,
    CButton,
  },
})
export default class EditModal extends Vue {
  public saving = false
  public error: string | null = null

  public async save() {
    this.saving = true

    await editListEntry(this, this.anime!.animeId, this.anime!.listEntry)

    this.saving = false
  }

  public statusItems: DropdownItem[] = enumToArray(MediaListStatus).map((status) => ({
    label: humanizeMediaListStatus({ progress: null, status: status as any }, false),
    value: status.toString(),
  }))

  public readonly modalName: ModalName = "edit"
  public readonly deleteSvg = mdiCloseCircle

  public get anime() {
    return getEditingAnime(this.$store)
  }

  public get status() {
    if (!this.anime || !this.anime.listEntry) return null

    return this.anime.listEntry.status
  }

  public get progress() {
    if (!this.anime || !this.anime.listEntry) return null

    return this.anime.listEntry.progress
  }

  public get score() {
    if (!this.anime || !this.anime.listEntry) return 0

    return this.anime.listEntry.score
  }

  public get repeated() {
    if (!this.anime || !this.anime.listEntry) return null

    return this.anime.listEntry.rewatched
  }

  public setValue(key: keyof EditModalAnime["listEntry"], value: any) {
    setEditingAnimeValue(this.$store, { key, value })
  }

  public toggleVisible() {
    toggleModal(this.$store, this.modalName)
  }

  public async deleteEntry() {
    if (!this.anime || !this.anime.listEntry) return

    await deleteFromList(this, this.anime.animeId)

    this.toggleVisible()
  }
}
</script>

<style scoped lang="scss">
@import "../../colors";

$gutter: 25px;

.edit-modal {
  position: relative;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 400px;
  background: $dark;
  border-radius: 5px;
  box-shadow: $shadow;
  overflow: hidden;
  user-select: none;
  z-index: 1;

  & > .anime-banner {
    margin-bottom: 15px;
    pointer-events: none;
    overflow: hidden;
  }

  & > .favourite {
    position: relative;

    & > .button ::v-deep .icon {
      height: 35px;
      width: 35px;
    }
  }

  & .number-input,
  & .dropdown {
    flex-shrink: 0;
    width: 150px;
    margin-bottom: 10px;
  }

  & > .list-entry-fields {
    position: relative;
    width: 100%;
    padding: 0 $gutter;
    margin-bottom: 10px;
    flex-wrap: wrap;
    display: flex;
    justify-content: space-between;

    & > .not-in-list {
      position: absolute;
      top: -5px;
      left: 0;
      height: calc(100% + 5px);
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      background: rgba(0, 0, 0, 0.25);
      text-shadow: $outline;
      font-weight: 700;
      font-size: 1.2em;
      box-shadow: 0 0 20px rgb(10, 10, 10);

      & > * {
        filter: drop-shadow(1px 2px 10px rgba(0, 0, 0, 0.75));
      }
    }
  }

  & > .buttons {
    width: 100%;
    padding: 0 $gutter;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    & > .loader {
      margin-left: auto;
      margin-right: 15px;
    }
  }
}
</style>
