import { api } from 'electron-util'
import anitomy from 'anitomy-js'
import ffmpeg from 'fluent-ffmpeg'
import { existsSync, promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

import { SettingsStore } from '@/state/settings'
import { isNil, mapAsync } from '@/utils'
import { FFMPEG_PATH, FFPROBE_PATH } from '@/utils/paths'

export type LocalAnime = {
  title: string
  folderPath: string
  episodes: number
}

type LocalAnimeFile = {
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

const ACCEPTED_EXTENSIONS = ['mp4', 'mkv', 'av1']

const isDirectory = async (path: string) => {
  if (!existsSync(path)) return false

  return (await fs.stat(path)).isDirectory()
}

const isPlayableFile = (path: string) =>
  // eslint-disable-next-line no-useless-escape
  path.match(new RegExp(`\.${ACCEPTED_EXTENSIONS.join('|')}$`))

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
  public static readonly thumbnailFolder = path.resolve(
    api.app.getPath('userData'),
    'thumbnails',
  )

  private static get folderPath() {
    return SettingsStore.get('localFilesFolder', null)
  }

  public static async getLocalAnime(): Promise<LocalAnime[]> {
    return this.getAnimeInFolder(this.folderPath)
  }

  public static async getLocalAnimeFiles(
    anilistId: number,
    localAnime: LocalAnime,
  ): Promise<LocalAnimeFile[]> {
    // Get files in directory
    const files = (await fs.readdir(localAnime.folderPath)).filter(
      isPlayableFile,
    )

    const fileNames = await mapAsync(files, async (f, i) => {
      let parsed = await anitomy.parse(f)

      return {
        filePath: path.join(localAnime.folderPath, files[i]),
        ...parsed,
      }
    })

    const promises = fileNames
      // Filter out files that don't belong to our anime
      .filter(item => item.anime_title === localAnime.title)
      // Map to result
      .map<Promise<LocalAnimeFile>>(async item => {
        const id = this.generateId(item.filePath)
        const episodeNumber = Number(item.episode_number)
        const filename = `${anilistId}-${episodeNumber}`

        const command = ffmpeg(item.filePath)

        const probeData = await this.probeFile(command)

        const thumbnailPath = path.join(this.thumbnailFolder, `${filename}.png`)
        if (!existsSync(thumbnailPath)) {
          await this.generateScreenshot(command, filename)
        }

        return {
          id,
          filePath: item.filePath,
          title:
            item.episode_title ||
            this.getVideoStreamTitle(probeData) ||
            `Episode ${episodeNumber}`,
          thumbnail: `file://${thumbnailPath}`,
          episodeNumber,
          duration: Math.round(probeData.format.duration!),
          format: item.file_extension!,
        }
      })

    return Promise.all(promises)
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
  private static async getAnimeInFolder(
    folderPath: string,
    maxDepth = 2,
    level = 0,
  ): Promise<LocalAnime[]> {
    let content: string[]

    try {
      content = await fs.readdir(folderPath)
    } catch {
      return []
    }

    const childFolderPaths: string[] = []
    const fileNames: string[] = []
    const results: LocalAnime[] = []

    await mapAsync(content, async item => {
      if (await isDirectory(path.join(folderPath, item))) {
        return childFolderPaths.push(path.join(folderPath, item))
      }

      fileNames.push(item)
    })

    const parsedFileNames = await mapAsync(fileNames, async path =>
      anitomy.parse(path),
    )

    parsedFileNames
      .filter(element => {
        const ext = (element.file_extension ?? '').toLowerCase()
        return (
          ACCEPTED_EXTENSIONS.includes(ext) &&
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
      await mapAsync(childFolderPaths, async f => {
        const items = await this.getAnimeInFolder(f, maxDepth, level + 1)
        items.forEach(result => results.push(result))
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

  private static getVideoStreamTitle(data: ffmpeg.FfprobeData) {
    const videoStream = data.streams.find(
      stream => stream.codec_type === 'video',
    )

    return videoStream?.tags.title ?? (null as string | null)
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
