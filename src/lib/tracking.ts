import superagent from 'superagent'
import uuid from 'uuid/v4'

import { getConfig } from '@/config'
import { View } from '@/router'
import { SettingsStore } from '@/state/settings'
import { isNil, T } from '@/utils'

interface FathomQuery {
  /** Page ID? */
  id: string
  /** Site ID */
  sid: string
  /** Previous Page ID */
  pid: string
  /** Hostname */
  h: string
  /** Path */
  p: string
  /** New visitor */
  nv: string
  /** New session */
  ns: string
  /** Unique? */
  u: string
  /** Referrer */
  r?: string
}

const BASE_URL = getConfig('FATHOM_URL')
const SITE_ID = getConfig('FATHOM_SITE_ID')

const URL = `${BASE_URL}/collect`
let firstTimeUser = SettingsStore.get('setup.finishedSteps', []).length < 1
let newSession = true
let pageId = uuid()

const fromBoolean = (b: boolean) => (b ? '1' : '0')

export const trackView = async (view: View) => {
  if (isNil(BASE_URL) || isNil(SITE_ID)) return

  const previousPageId = pageId
  pageId = uuid()

  const query: FathomQuery = {
    id: pageId,
    pid: previousPageId,
    sid: SITE_ID,
    h: 'yuna.app',
    p: view,
    nv: fromBoolean(firstTimeUser),
    ns: fromBoolean(newSession),
    u: fromBoolean(false),
  }

  if (firstTimeUser) {
    firstTimeUser = false
  }

  if (newSession) {
    newSession = false
  }

  await superagent
    .get(URL)
    .query(query)
    .ok(T)
    .retry(5)
}
