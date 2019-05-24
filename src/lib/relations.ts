import Store from 'electron-store'
import superagent from 'superagent/dist/superagent'
import { EpisodeListEpisodes } from '@/graphql/types'

// Branches

// interface RelationsCacheSchema {
//   updatedAt: number
//   relations: any
// }
const relationsCache = new Store<any>({
  name: 'relationsCache',
})

interface Branch {
  id: number
  type: string
  item: any
}

interface SectionLabel extends Branch {
  type: 'label'
  item: string
}

const getLabel = (str: string) => {
  const match = str.match(/^::(\w+)/)

  if (match) return match[1]
}

interface Comment extends Branch {
  type: 'comment'
  item: string[]
}

const isComment = (obj: any): obj is Comment => {
  return obj != null && (/^#.*/.test(obj) || obj.type === 'comment')
}

interface KeyValue extends Branch {
  type: 'key-value'
  name: string
  item: string
}

const keyValueRegex = /^- (.+): (.+).*/
const isKeyValue = (obj: any): obj is KeyValue => {
  return obj != null && (keyValueRegex.test(obj) || obj.type === 'key-value')
}
const getKeyValue = (line: string) => {
  const match = line.match(keyValueRegex) as RegExpMatchArray

  return {
    key: match[1],
    value: match[2],
  }
}

interface Rule extends Branch {
  type: 'rule'
  name: string
  item: {
    from: {
      myanimelist: string
      kitsu: string
      anilist: string
      episodeRange: string
    }
    to: {
      myanimelist: string
      kitsu: string
      anilist: string
      episodeRange: string
    }
    redirectsToSelf: boolean
  }
}

const ruleRegex = /([\d?~]+)\|([\d?~]+)\|([\d?~]+):(\d+(?:-\d+)?)/
const isRule = (obj: any): obj is Rule => {
  return obj != null && (ruleRegex.test(obj) || obj.type === 'rule')
}
const getRule = (line: string): Rule['item'] => {
  const [from, to] = line.split(' -> ')

  const fromMatch = from.match(ruleRegex) as RegExpMatchArray
  const toMatch = to.match(ruleRegex) as RegExpMatchArray

  return {
    from: {
      myanimelist: fromMatch[1],
      kitsu: fromMatch[2],
      anilist: fromMatch[3],
      episodeRange: fromMatch[4],
    },
    to: {
      myanimelist: toMatch[1],
      kitsu: toMatch[2],
      anilist: toMatch[3],
      episodeRange: toMatch[4],
    },
    redirectsToSelf: line.endsWith('!'),
  }
}

// Parsing

let ids = 0
const generateId = () => {
  ids++
  return ids
}

const parseBranch = (line: string) => {
  if (getLabel(line)) {
    const label: SectionLabel = {
      id: generateId(),
      type: 'label',
      item: getLabel(line) as string,
    }

    return label
  }

  if (isComment(line)) {
    const comment: Comment = {
      id: generateId(),
      type: 'comment',
      item: [line.substr(2)],
    }

    return comment
  }

  if (isKeyValue(line)) {
    const { key, value } = getKeyValue(line)

    const keyValue: KeyValue = {
      id: generateId(),
      type: 'key-value',
      name: key,
      item: value,
    }

    return keyValue
  }

  if (isRule(line)) {
    const rule: Rule = {
      id: generateId(),
      type: 'rule',
      name: 'MISSING_NAME',
      item: getRule(line),
    }

    return rule
  }
}

type Branches = SectionLabel | Comment | KeyValue | Rule

export const parseData = (data: string): ReadonlyArray<Branches> => {
  const lines = data.split('\n')
  const tree: any[] = []
  let lastBranch: Branch | null = null
  let lastBranchIndex: number = -1

  const updateLastBranch = () => {
    lastBranch = tree[tree.length - 1]
    lastBranchIndex = tree.length - 1
  }

  lines
    .filter(l => l.length > 0)
    .forEach(line => {
      const branch = parseBranch(line)

      if (isComment(branch) && lastBranch && isComment(lastBranch)) {
        lastBranch.item.push(branch.item[0])

        updateLastBranch()
        return
      }

      if (isRule(branch) && lastBranch && isComment(lastBranch)) {
        branch.name = lastBranch.item[0]
        tree.splice(lastBranchIndex, 1)
        tree.push(branch)

        updateLastBranch()
        return
      }

      tree.push(branch)
      updateLastBranch()
    })

  return tree
}

export interface Format {
  version: string
  lastModified: Date
  relations: {
    [key: string]:
      | undefined
      | Array<{
          description?: string
          id: string
          episodes: {
            from: string
            to: string
          }
        }>
  }
}

export const convert = (data: ReadonlyArray<Branches>) => {
  const toReturn: Format = { relations: {} } as any

  data.forEach(branch => {
    if (isKeyValue(branch)) {
      if (branch.name === 'version') {
        toReturn.version = branch.item

        return
      }

      if (branch.name === 'last_modified') {
        toReturn.lastModified = new Date(branch.item)

        return
      }
    }

    if (isRule(branch)) {
      const from = branch.item.from.anilist
      const to =
        branch.item.to.anilist !== '~'
          ? branch.item.to.anilist
          : branch.item.from.anilist

      if (to === '?' || from === '?') return

      if (!toReturn.relations[branch.item.from.anilist]) {
        toReturn.relations[branch.item.from.anilist] = []
      }

      toReturn.relations[branch.item.from.anilist]!.push({
        description: branch.name,
        id: to,
        episodes: {
          from: branch.item.from.episodeRange,
          to: branch.item.to.episodeRange,
        },
      })

      if (branch.item.redirectsToSelf) {
        toReturn.relations[branch.item.from.anilist]!.push({
          description: branch.name,
          id: branch.item.from.anilist,
          episodes: {
            from: branch.item.from.episodeRange,
            to: branch.item.to.episodeRange,
          },
        })
      }

      return
    }
  })

  return toReturn
}

let relations!: Format['relations']

const DAY = 1000 * 60 * 60 * 24
const WEEK = DAY * 7
const isStale = (updatedAt: number, time: number) =>
  updatedAt + time < Date.now()

export const updateRelations = async () => {
  const stale = isStale(relationsCache.get('updatedAt', 0), WEEK)

  if (!stale) {
    relations = relationsCache.get('relations')
    return relationsCache.get('relations')
  }

  const response = await superagent.get(
    'https://raw.githubusercontent.com/erengy/anime-relations/master/anime-relations.txt',
  )

  if (!response.ok || response.error) {
    throw new Error(
      `❌  Failed fetching anime-relations.txt - ${response.status}`,
    )
  }

  const data = convert(parseData(response.text)).relations

  relations = data
  relationsCache.set({
    updatedAt: Date.now(),
    relations: data,
  })
}

export interface EpisodeRelations {
  [id: number]: EpisodeListEpisodes[]
}

export const getEpisodeRelations = (
  id: number,
  episodes: EpisodeListEpisodes[],
): EpisodeRelations => {
  const relation = relations[id]
  const toReturn: any = {}

  if (!relation) return { [id]: episodes }

  relation.forEach(rel => {
    const from = rel.episodes.from.split('-').map(Number)
    const to = rel.episodes.to.split('-').map(Number)

    if (episodes[from[0] - 1] != null) {
      toReturn[rel.id] = episodes
        .splice(from[0] - 1, from[1] ? from[1] - from[0] : 1)
        .map((ep, i) => ({
          ...ep,
          index: i,
          episodeNumber: to[0] + i,
          animeId: rel.id,
        }))
    }
  })

  toReturn[id] = episodes

  return toReturn
}
