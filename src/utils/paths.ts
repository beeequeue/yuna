import { path as ffmpegPath } from 'ffmpeg-static'
import { path as ffprobePath } from 'ffprobe-static'
import { join } from 'path'

const isDevelopment = process.env.NODE_ENV === 'development'

const getDevPath = (name: string, path: string) =>
  join(
    process.env.DEV_BASE_PATH!,
    'node_modules',
    name,
    path.substr(path.lastIndexOf('bin')),
  )
const getProdPath = (name: string, path: string) =>
  join(
    process.resourcesPath!,
    `node_modules/${name}`,
    path.substr(path.lastIndexOf('bin')),
  )
const getPath = (name: string, path: string) =>
  isDevelopment ? getDevPath(name, path) : getProdPath(name, path)

export const FFMPEG_PATH = getPath('ffmpeg-static', ffmpegPath)
export const FFPROBE_PATH = getPath('ffprobe-static', ffprobePath)
