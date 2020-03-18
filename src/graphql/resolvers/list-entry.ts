import { Store } from 'vuex'
import ApolloClient from 'apollo-client'
import { activeWindow } from 'electron-util'
import { SINGLE_MEDIA_QUERY } from '@/graphql/documents/queries'
import {
  ListEntry,
  Media,
  QueryListEntriesArgs,
  SingleMediaQuery,
  SingleMediaQueryVariables,
  SingleMediaSingleMedia,
} from '@/graphql/generated/types'
import { ListEntryWithoutMedia, ListPlugin } from '@/plugins/list/plugin'
import { getListPlugins } from '@/state/auth'
import { getMainListPlugin } from '@/state/settings'
import { store } from '@/state/store'
import { SHOW_ERROR } from '@/messages'
import { isNil } from '@/utils'

const browserWindow = activeWindow()

const getEnabledPlugins = (store: Store<any>) => {
  const enabledPlugins = getListPlugins(store)
    .filter(p => p.available)
    .map(p => p.name)

  return window.listPlugins.filter(plugin =>
    enabledPlugins.includes(plugin.service),
  )
}

export const GetListEntry = async (
  media: Media | null,
  variables: { mediaId: number } | null,
  _cache: { cache: RealProxy },
): Promise<ListEntryWithoutMedia | null> => {
  const mainListPlugin = getMainListPlugin(store)
  const plugin = window.listPlugins.find(
    plugin => plugin.service === mainListPlugin,
  )

  if (isNil(plugin)) throw new Error('Selected List Plugin could not be found.')

  return plugin.GetListEntry((media?.id || variables?.mediaId)!)
}

export const GetListEntries = async (
  _: undefined,
  variables: QueryListEntriesArgs,
  _cache: { cache: RealProxy },
): Promise<ListEntryWithoutMedia[] | null> => {
  const mainListPlugin = getMainListPlugin(store)
  const plugin = window.listPlugins.find(
    plugin => plugin.service === mainListPlugin,
  )

  if (isNil(plugin)) throw new Error('Selected List Plugin could not be found.')

  return plugin.GetListEntries(variables)
}

export const GetMedia = async (
  { mediaId }: ListEntry,
  _: undefined,
  { client }: { cache: RealProxy; client: ApolloClient<any> },
): Promise<SingleMediaSingleMedia> => {
  const result = await client.query<SingleMediaQuery>({
    query: SINGLE_MEDIA_QUERY,
    variables: { mediaId } as SingleMediaQueryVariables,
  })

  return result.data.SingleMedia!
}

const DoAction = (
  action: keyof Pick<
    ListPlugin,
    | 'AddToList'
    | 'DeleteFromList'
    | 'UpdateStatus'
    | 'StartRewatching'
    | 'UpdateProgress'
    | 'UpdateScore'
    | 'EditListEntry'
  >,
) => async (
  _root: undefined,
  { anilistId, ...rest }: any,
  _cache: { cache: RealProxy },
) => {
  const mainPlugin = getMainListPlugin(store)!
  const errors: { [key: string]: Error } = {}
  const secondParameter = Object.values(rest)[0]

  const promises = getEnabledPlugins(store).map(plugin =>
    (plugin[action](anilistId, secondParameter as never) as Promise<any>).catch(
      err => {
        errors[plugin.service] = err
      },
    ),
  )

  const results = await Promise.all(promises as any)

  const minorErrors = Object.entries(errors).filter(
    ([plugin]) => plugin !== mainPlugin,
  )
  minorErrors.forEach(([plugin, error]) => {
    browserWindow.webContents.send(
      SHOW_ERROR,
      `${plugin}-plugin: ${error.message}`,
    )
  })

  const mainPluginError = errors[mainPlugin]
  if (!isNil(mainPluginError)) {
    throw new Error(
      `${getMainListPlugin(store)}-plugin: ${mainPluginError.message}`,
    )
  }

  return results[0] as ReturnType<ListPlugin[typeof action]>
}

export const AddToList = DoAction('AddToList')

export const DeleteFromList = DoAction('DeleteFromList')

export const UpdateStatus = DoAction('UpdateStatus')

export const StartRewatching = DoAction('StartRewatching')

export const UpdateProgress = DoAction('UpdateProgress')

export const UpdateScore = DoAction('UpdateScore')

export const EditListEntry = DoAction('EditListEntry')
