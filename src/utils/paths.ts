import { remote, FileFilter } from 'electron'
import { path as ffmpegPath } from 'ffmpeg-static'
import { path as ffprobePath } from 'ffprobe-static'
import { join } from 'path'
import { isNil } from '@/utils/index'

const isDevelopment = process.env.NODE_ENV === 'development'

export const getFilePath = ({
  title,
  filters = [],
}: {
  title: string
  filters?: FileFilter[]
}) => {
  const paths = remote.dialog.showOpenDialog({
    title,
    buttonLabel: 'Select file',
    properties: ['openFile'],
    filters,
  })

  if (isNil(paths)) return null

  return paths[0] || null
}

export const getFolderPath = ({ title }: { title: string }) => {
  const paths = remote.dialog.showOpenDialog({
    title,
    buttonLabel: 'Select',
    properties: ['openDirectory'],
  })

  if (isNil(paths)) return null

  return paths[0] || null
}

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
