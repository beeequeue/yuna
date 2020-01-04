import { api } from 'electron-util'
import ffmpeg from 'fluent-ffmpeg'
import { existsSync, promises as fs } from 'fs'
import path, { basename } from 'path'
import crypto from 'crypto'

import { SettingsStore } from '@/state/settings'
import { isNil, isNotNil, mapAsync } from '@/utils'
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
      let parsed = await this.parseFileName(f, localAnime.folderPath)

      if (isNil(parsed)) return null

      return {
        filePath: path.join(localAnime.folderPath, files[i]),
        ...parsed,
      }
    })

    const promises = fileNames
      .filter(isNotNil)
      // Filter out files that don't belong to our anime
      .filter(item => item.animeTitle === localAnime.title)
      // Map to result
      .map<Promise<LocalAnimeFile>>(async item => {
        const id = this.generateId(item.filePath)
        const episodeNumber = Number(item.episodeNumber)
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
            item.episodeTitle ||
            this.getVideoStreamTitle(probeData) ||
            `Episode ${episodeNumber}`,
          thumbnail: `file://${thumbnailPath}`,
          episodeNumber,
          duration: Math.round(probeData.format.duration!),
          format: item.extension!,
        }
      })

    return Promise.all(promises)
  }

  private static bannedWords = [
    /[Ee][Nn][Hh][Aa][Nn][Cc][Ee][Dd]/,
    /HEVC|hevc/,
    /(?:FLAC|flac)(?:x\d*)? ?(?:\d.\d)?/,
    /WEBP|webp/,
    /AAC|aac/,
    /AVC|avc/,
    /[Hh][Ii]10/,
    /BD|[Bb]lu[- .]?[Rr]ay/,
    /[Dd]ual[ .-_][Aa]udio/,
    /(?:1080|1920|1820|720|540|360|2160)p?/,
    /\d{2}bit/, // 10bit etc
    /[XxHh].?\d{3}(?:-\w*)?/, // x264 etc
  ]

  private static cleanupFilename(name: string): string {
    // Remove extension if necessary
    if (/(\..{1,4})$/.exec(name)) {
      name = name.slice(0, name.lastIndexOf('.'))
    }

    // Remove metadata ( [*] )
    name = name.replace(/\[.*?\]/g, '').trim()

    this.bannedWords.forEach(regex => {
      name = name
        .replace(new RegExp(`\\(.*(?:${regex.source}).*\\)`), '')
        .trim()
    })

    this.bannedWords.forEach(regex => {
      name = name.replace(regex, '').trim()
    })

    // Fix separators
    name = name.replace(/[._]/g, ' ').trim()

    return name
  }

  private static getGoodBackupTitle(folderPath: string): string {
    const lastPart = basename(folderPath)

    if (/[Ss](?:eason) ?\d+/.exec(lastPart)) {
      const separator = folderPath.includes('\\') ? '\\' : '/'
      const oneStepUp = folderPath.slice(0, folderPath.lastIndexOf(separator))
      return `${basename(oneStepUp)} - ${lastPart}`
    }

    return lastPart
  }

  private static async parseFileName(filename: string, folderPath: string) {
    const original = filename
    const backupTitle = this.cleanupFilename(
      this.getGoodBackupTitle(folderPath),
    )

    const extension = filename.slice(
      filename.lastIndexOf('.') + 1,
      filename.length,
    )

    filename = this.cleanupFilename(filename)

    // Remove season info
    filename = filename
      .replace(/[Ss]\d{1,2}/g, '')
      .replace(/[Ss][Ee][Aa][Ss][Oo][Nn] *\d{1,2}/g, '')
      .trim()

    let match = /[Ee](?:[Pp](?:isode)?)? ?(\d{1,4})/.exec(filename) || []
    let num = Number(match[1])

    if (!match[1] || isNaN(num)) {
      match = /(\d{2,4})/.exec(filename) || []
      num = Number(match[1])
    }

    if (!match[1] || isNaN(num)) {
      match = /\[(\d{2,4})\]/.exec(original) || []
      num = Number(match[1])
    }

    if (/(ova|special|op\d+|ed\d+)/.exec(original.toLowerCase())) {
      return null
    }

    const [animeTitle, episodeTitle] = filename.split(match[0]).map(str =>
      str
        .replace(/ - $/, '')
        .replace(/^ - /, '')
        .trim(),
    )

    // || so it overrides empty strings
    return {
      animeTitle: animeTitle || backupTitle,
      episodeTitle: episodeTitle || !isNaN(num) ? `Episode ${num}` : null,
      episodeNumber: !isNaN(num) ? num : null,
      extension,
    }
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
  public static async getAnimeInFolder(
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

    const parsedFileNames = await mapAsync(fileNames, path =>
      this.parseFileName(path, folderPath),
    )

    parsedFileNames
      .filter(isNotNil)
      .filter(element => {
        const ext = (element.extension ?? '').toLowerCase()
        return (
          ACCEPTED_EXTENSIONS.includes(ext) &&
          !isNil(element.animeTitle) &&
          !isNil(element.episodeNumber)
        )
      })
      .map<LocalAnime>(el => ({
        folderPath,
        title: el.animeTitle,
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
