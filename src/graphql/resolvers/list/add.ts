import { AddToListVariables, ListEntryFragment } from '@/graphql/types'
import { SettingsStore } from '@/state/settings'
import { ListPlugin } from '@/plugins/list/plugin'

export const AddToList = async (
  _root: undefined,
  { anilistId }: AddToListVariables,
  _cache: { cache: RealProxy },
): Promise<ListEntryFragment> => {
  const plugins = SettingsStore.get('listPlugins') as ListPlugin[]

  const promises = plugins.map(plugin => plugin.AddToList(anilistId))
  const results = await Promise.all(promises)

  return results[0]
}
