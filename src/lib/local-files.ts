import { api } from 'electron-util'
import { parse } from 'anitomyscript'
import ffmpeg from 'fluent-ffmpeg'
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { cpus } from 'os'
import Bottleneck from 'bottleneck'
import { oc } from 'ts-optchain'

import { SettingsStore } from '@/state/settings'
import { isNil } from '@/utils'
import { FFMPEG_PATH, FFPROBE_PATH } from '@/utils/paths'
import { spawn } from 'child_process'

export interface LocalAnime {
  title: string
  folderPath: string
  episodes: number
}

interface LocalAnimeFile {
  id: string
  filePath: string
  subtitleFiles: string[] | null
  title: string
  thumbnail: string
  episodeNumber: number
  duration: number
  format: string
}

ffmpeg.setFfmpegPath(FFMPEG_PATH)
ffmpeg.setFfprobePath(FFPROBE_PATH)

const ACCEPTED_EXTENSIONS = ['mp4', 'mkv', 'av1']
const VIDEO_CODECS = ['h264', 'vp8', 'vp9', 'theora', 'av1']
const AUDIO_CODECS = [
  'mp3',
  'flac',
  'ogg',
  'opus',
  'vorbis',
  'aac',
  'pcm_s8',
  'pcm_s16le',
  'pcm_f32le',
]
const SUBTITLE_CODECS = ['srt', 'ass', 'vtt']
const CPUS = cpus().length

const spawnLimiter = new Bottleneck({
  maxConcurrent: 4,
})

const isDirectory = (path: string) => {
  if (!existsSync(path)) return false

  return statSync(path).isDirectory()
}

const isPlayableFile = (path: string) =>
  !isDirectory(path) &&
  // eslint-disable-next-line no-useless-escape
  path.match(new RegExp(`\.${ACCEPTED_EXTENSIONS.join('|')}$`))

const getSubtitleStreams = (data: ffmpeg.FfprobeData) => {
  const subtitleStreams = data.streams
    .filter(stream => stream.codec_type === 'subtitle')
    .filter(stream => SUBTITLE_CODECS.includes(stream.codec_name))

  return subtitleStreams.map(stream => ({
    index: stream.index as number,
    codec: stream.codec_name as string,
    title: oc(stream).tags.title('UNKNOWN_TITLE') as string,
    language: oc(stream).tags.language('UNKNOWN_LANGUAGE') as string,
  }))
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
  public static readonly thumbnailFolder = path.resolve(
    api.app.getPath('userData'),
    'thumbnails',
  )

  public static readonly subtitleFolder = path.resolve(
    api.app.getPath('userData'),
    'subtitles',
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
        const filePath = path.join(localAnime.folderPath, files[i])
        const id = this.generateId(filePath)
        const episodeNumber = Number(item.episode_number)
        const filename = `${anilistId}-${episodeNumber}`

        const command = ffmpeg(filePath)

        const probeData = await this.probeFile(command)

        const videoStream = probeData.streams.find(
          stream => stream.codec_type === 'video',
        )
        const videoCodec = oc(videoStream).codec_name('UNKNOWN_CODEC')
        if (!VIDEO_CODECS.includes(videoCodec)) {
          throw new Error(
            "The files' video codecs are not supported.|I will try to add solutions for this in the future.",
          )
        }

        const audioStream = probeData.streams.find(
          stream => stream.codec_type === 'audio',
        )
        const audioCodec = oc(audioStream).codec_name('UNKNOWN_CODEC')
        if (!AUDIO_CODECS.includes(audioCodec)) {
          throw new Error(
            "The files' audio codecs are not supported.|I will try to add solutions for this in the future.",
          )
        }

        const thumbnailPath = path.join(this.thumbnailFolder, `${filename}.png`)
        if (!existsSync(thumbnailPath)) {
          await this.generateScreenshot(command, filename)
        }

        const subtitleFiles = await this.extractSubtitles(
          filePath,
          probeData,
          filename,
        )

        return {
          id,
          filePath,
          subtitleFiles,
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
      if (isDirectory(path.join(folderPath, item))) {
        return childFolderPaths.push(path.join(folderPath, item))
      }

      fileNames.push(item)
    })

    fileNames
      .map(path => parse(path))
      .filter(element => {
        const ext = (element.file_extension || '').toLowerCase()
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

  private static __subtitleDirExists = false

  private static ensureSubtitleDirectoryExists() {
    if (this.__subtitleDirExists) return true

    const exists = existsSync(this.subtitleFolder)

    this.__subtitleDirExists = true

    if (exists) return true

    mkdirSync(this.subtitleFolder)
    this.__subtitleDirExists = true

    return true
  }

  private static extractSubtitles(
    filePath: string,
    probeData: ffmpeg.FfprobeData,
    filename: string,
  ) {
    return new Promise<string[]>((resolve, reject) => {
      this.ensureSubtitleDirectoryExists()

      const subtitleStreams = getSubtitleStreams(probeData)

      if (subtitleStreams.length < 1) {
        return resolve([])
      }

      const filePaths = subtitleStreams.map(stream => {
        const title = stream.title.replace(/ /g, '_').replace(/[\\/]/g, '-')

        return path.resolve(this.subtitleFolder, `${filename}-${title}.vtt`)
      })

      const allFilesAreValid = filePaths.every(path => {
        if (!existsSync(path)) return false

        return statSync(path).size > 7
      })

      if (allFilesAreValid) {
        return resolve(filePaths)
      }

      const mappingArgs = subtitleStreams
        .map((_, i) => ['-map', `0:s:${i}`, filePaths[i]])
        .flat()

      const args = [
        '-hide_banner',
        '-y',
        '-threads',
        Math.max(1, Math.round(CPUS / 4)).toString(),
        '-i',
        path.resolve(filePath),
        ...mappingArgs,
      ]

      spawnLimiter.submit(
        cb => {
          const onError = (err: Error | string) => {
            cb(err)
          }
          const process = spawn(FFMPEG_PATH, args)

          process.on('close', () => cb(null))
          process.stderr.on('error', onError)
        },
        (err: Error | undefined, _: void) => {
          if (err) return reject(err)

          resolve(filePaths)
        },
      )
    })
  }
}
