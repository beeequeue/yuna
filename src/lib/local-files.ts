import { existsSync, readdirSync, statSync } from 'fs'
import { parse } from 'anitomyscript'

import { SettingsStore } from '@/state/settings'
import { join } from 'path'
import { isNil } from '@/utils'

export interface LocalAnime {
  title: string
  folder: string
  episodes: number
}

const acceptedExtensions = ['mp4', 'mkv']

const isDirectory = (path: string) => {
  if (!existsSync(path)) return false

  return statSync(path).isDirectory()
}

const removeDuplicates = (array: LocalAnime[]) => {
  const newArray: LocalAnime[] = []

  array.forEach(anime => {
    const index = newArray.findIndex(item => item.title === anime.title)

    if (index !== -1) {
      newArray[index].episodes++

      return
    }

    newArray.push(anime)
  })

  return newArray
}

export class LocalFiles {
  private static get folderPath() {
    return SettingsStore.get('localFilesFolder', null)
  }

  public static getLocalAnime(): LocalAnime[] {
    return this.getAnimeInFolder(this.folderPath)
  }

  /**
   * Searches a folder and its children for anime episode files, and then returns them in an array.
   */
  private static getAnimeInFolder(
    folderPath: string,
    maxDepth = 2,
    level = 0,
  ): LocalAnime[] {
    const content = readdirSync(folderPath)
    const childFolderPaths: string[] = []
    const fileNames: string[] = []
    const results: LocalAnime[] = []

    content.forEach(item => {
      if (isDirectory(join(folderPath, item))) {
        return childFolderPaths.push(join(folderPath, item))
      }

      fileNames.push(item)
    })

    fileNames
      .map(path => parse(path))
      .filter(element => {
        const ext = (element.file_extension || '').toLowerCase()
        return (
          acceptedExtensions.includes(ext) &&
          !isNil(element.anime_title) &&
          !isNil(element.episode_number)
        )
      })
      .filter(element => !isNil(element.anime_title))
      .map<LocalAnime>(el => ({
        folder: folderPath,
        title: el.anime_title!,
        episodes: 1,
      }))
      .forEach(el => results.push(el))

    if (maxDepth > level) {
      childFolderPaths.forEach(f => {
        this.getAnimeInFolder(f, maxDepth, level + 1).forEach(result =>
          results.push(result),
        )
      })
    }

    return removeDuplicates(results)
  }
}
