<template>
  <modal-base :name="modalName">
    <ApolloMutation
      :mutation="EDIT_LIST_ENTRY"
      :variables="listEntryVariables"
      :update="handleUpdate"
      @done="toggleVisible"
    >
      <template slot-scope="{ mutate, loading, error }">
        <div class="modal-body edit-modal">
          <anime-banner :anime="anime" />

          <div class="list-entry-fields">
            <dropdown
              :disabled="loading"
              label="Status"
              :items="statusItems"
              :onChange="value => setValue('status', value)"
              :value="status"
              :error="getValidationError(error, 'status')"
            />

            <number-input
              :disabled="loading"
              label="Progress"
              :suffix="`/ ${anime ? anime.episodes : 0}`"
              :min="0"
              :max="anime.episodes"
              :value="progress"
              :onChange="value => setValue('progress', value)"
              :error="getValidationError(error, 'progress')"
            />

            <number-input
              :disabled="loading"
              label="Score"
              suffix="/ 100"
              :min="0"
              :max="100"
              :value="score"
              :onChange="value => setValue('score', value)"
              :error="getValidationError(error, 'scoreRaw')"
            />

            <number-input
              :disabled="loading"
              label="Repeated"
              suffix=" times"
              :min="0"
              :max="999"
              :value="repeated"
              :onChange="value => setValue('rewatched', value)"
              :error="getValidationError(error, 'repeat')"
            />

            <transition name="fade">
              <div v-if="anime && anime.listEntry == null" class="not-in-list">
                Not in List
                <c-button :disabled="loading" content="Add to List" />
              </div>
            </transition>
          </div>

          <div class="buttons">
            <c-button
              :disabled="loading"
              type="danger"
              flat
              confirm
              content="Delete"
              :icon="deleteSvg"
              :click="deleteEntry"
            />

            <c-button
              :disabled="loading"
              type="success"
              :content="loading ? 'Saving...' : 'Save changes'"
              :click="mutate"
            />
          </div>
        </div>
      </template>
    </ApolloMutation>
  </modal-base>
</template>

<script lang="ts">
import { ApolloError } from 'apollo-client'
import { Component, Vue } from 'vue-property-decorator'
import { ApolloCache } from 'apollo-cache'
import { oc } from 'ts-optchain'
import { mdiCloseCircle } from '@mdi/js'

import ANIME_PAGE_QUERY from '@/views/anime/anime.graphql'
import { deleteFromList } from '@/common/mutations/list-entry'
import { EDIT_LIST_ENTRY } from '@/graphql/documents/mutations'
import {
  AnimeViewQuery,
  AnimeViewVariables,
  EditListEntryMutation,
  EditListEntryMutationVariables,
  MediaListStatus,
} from '@/graphql/types'

import {
  EditModalAnime,
  getEditingAnime,
  ModalName,
  setEditingAnimeValue,
  toggleModal,
} from '@/state/app'
import { capitalize, enumToArray } from '@/utils'

import CButton from '@/common/components/button.vue'
import NumberInput from '@/common/components/form/number-input.vue'
import Dropdown, { DropdownItem } from '@/common/components/form/dropdown.vue'
import ModalBase from '@/common/modals/base.vue'
import AnimeBanner from '@/common/components/anime-banner.vue'
import Icon from '@/common/components/icon.vue'

@Component({
  components: { ModalBase, AnimeBanner, Icon, NumberInput, Dropdown, CButton },
})
export default class EditModal extends Vue {
  public statusItems: DropdownItem[] = enumToArray(MediaListStatus).map(
    status => ({
      label: capitalize((status as unknown) as string),
      value: (status as unknown) as string,
    }),
  )

  public readonly modalName: ModalName = 'edit'
  public readonly EDIT_LIST_ENTRY = EDIT_LIST_ENTRY
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

  public get listEntryVariables(): EditListEntryMutationVariables {
    return {
      ...oc(this.anime).listEntry(),
      repeat: oc(this.anime).listEntry.rewatched(0),
    } as any
  }

  public setValue(key: keyof EditModalAnime['listEntry'], value: any) {
    setEditingAnimeValue(this.$store, { key, value })
  }

  public handleUpdate(
    cache: ApolloCache<any>,
    payload: { data: EditListEntryMutation },
  ) {
    let data = cache.readQuery<AnimeViewQuery, AnimeViewVariables>({
      query: ANIME_PAGE_QUERY,
      variables: { id: this.anime!.id },
    })!

    const newData: AnimeViewQuery = {
      anime: {
        ...data.anime!,
        listEntry: {
          __typename: 'ListEntry',
          id: oc(payload.data).SaveMediaListEntry.id()!,
          progress: oc(payload.data).SaveMediaListEntry.progress(0),
          rewatched: oc(payload.data).SaveMediaListEntry.repeat(0),
          score: oc(payload.data).SaveMediaListEntry.score(0),
          status: oc(payload.data).SaveMediaListEntry.status(
            MediaListStatus.Planning,
          ),
        }
      },
    }

    cache.writeQuery({ query: ANIME_PAGE_QUERY, data: newData })
  }

  public getValidationError(error: ApolloError, key: string) {
    if (!error || !error.networkError) return null

    const errors = oc(error as any).networkError.result.errors([])

    const validationError = errors.find(
      (obj: any) => oc(obj).validation() === 'message',
    ).validation[key]

    return oc(validationError)[0](null) as string | null
  }

  public toggleVisible() {
    toggleModal(this.$store, this.modalName)
  }

  public async deleteEntry() {
    if (!this.anime || !this.anime.listEntry) return

    await deleteFromList(this, this.anime.id)

    this.toggleVisible()
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

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

    & > .button /deep/ .icon {
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
    padding: 0px $gutter;
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
  }
}
</style>
