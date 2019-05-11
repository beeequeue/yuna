import { api } from 'electron-util'
import { parse } from 'anitomyscript'
import ffmpeg from 'fluent-ffmpeg'
import { existsSync, readdirSync, statSync } from 'fs'
import { join, resolve } from 'path'
import crypto from 'crypto'

import { SettingsStore } from '@/state/settings'
import { isNil } from '@/utils'
import { FFMPEG_PATH, FFPROBE_PATH } from '@/utils/paths'

export interface LocalAnime {
  title: string
  folderPath: string
  episodes: number
}

interface LocalAnimeFile {
  id: string
  filePath: string
  title: string
  thumbnail: string
  episodeNumber: number
  duration: number
  format: string
}

ffmpeg.setFfmpegPath(FFMPEG_PATH)
ffmpeg.setFfprobePath(FFPROBE_PATH)

const acceptedExtensions = ['mp4', 'mkv']

const isDirectory = (path: string) => {
  if (!existsSync(path)) return false

  return statSync(path).isDirectory()
}

const isPlayableFile = (path: string) =>
  !isDirectory(path) &&
  // eslint-disable-next-line no-useless-escape
  path.match(new RegExp(`\.${acceptedExtensions.join('|')}$`))

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
  public static readonly thumbnailFolder = resolve(
    api.app.getPath('userData'),
    'thumbnails',
  )

  private static get folderPath() {
    return SettingsStore.get('localFilesFolder', null)
  }

  public static getLocalAnime(): LocalAnime[] {
    return this.getAnimeInFolder(this.folderPath)
  }

  public static async getLocalAnimeFiles(
    anilistId: number,
    localAnime: LocalAnime,
  ): Promise<LocalAnimeFile[]> {
    // Get files in directory
    const files = readdirSync(localAnime.folderPath).filter(isPlayableFile)

    const promises = files
      // Parse file names
      .map(f => parse(f))
      // Filter out files that don't belong to our anime
      .filter(item => item.anime_title === localAnime.title)
      // Map to result
      .map<Promise<LocalAnimeFile>>(async (item, i) => {
        const filePath = join(localAnime.folderPath, files[i])
        const id = this.generateId(filePath)
        const episodeNumber = Number(item.episode_number)
        const thumbnailName = `${anilistId}-${episodeNumber}`
        const thumbnailPath = join(this.thumbnailFolder, `${thumbnailName}.png`)

        const command = ffmpeg(filePath)

        const probeData = await this.probeFile(command)

        if (!existsSync(thumbnailPath)) {
          await this.generateScreenshot(command, thumbnailName)
        }

        return {
          id,
          filePath,
          title: item.episode_title || `Episode ${episodeNumber}`,
          thumbnail: thumbnailPath,
          episodeNumber,
          duration: Math.round(probeData.format.duration),
          format: item.file_extension!,
        }
      })

    return await Promise.all(promises)
  }

  private static generateId(path: string) {
    return crypto
      .createHash('md5')
      .update(path)
      .digest('hex')
      .substr(0, 10)
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
      .map<LocalAnime>(el => ({
        folderPath,
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

  private static probeFile(command: ffmpeg.FfmpegCommand) {
    return new Promise<ffmpeg.FfprobeData>((resolve, reject) => {
      command.ffprobe((err, data) => {
        if (!isNil(err)) {
          reject(err)
        }

        resolve(data)
      })
    })
  }

  private static generateScreenshot(
    command: ffmpeg.FfmpegCommand,
    filename: string,
  ) {
    return new Promise<ffmpeg.FfprobeData>((resolve, reject) => {
      command
        .screenshot({
          count: 1,
          timestamps: ['50%'],
          filename,
          size: '?x250',
          folder: this.thumbnailFolder,
        })
        .on('end', resolve)
        .on('error', reject)
    })
  }
}
