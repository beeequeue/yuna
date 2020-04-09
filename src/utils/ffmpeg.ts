import { remote, FileFilter } from 'electron'
import os from 'os'
import { join } from 'path'
import { isNil } from '@/utils/index'

const isDevelopment = process.env.NODE_ENV === 'development'

export const getFilePath = async ({
  title,
  filters = [],
}: {
  title: string
  filters?: FileFilter[]
}) => {
  const { filePaths } = await remote.dialog.showOpenDialog({
    title,
    buttonLabel: 'Select file',
    properties: ['openFile'],
    filters,
  })

  if (isNil(filePaths)) return null

  return filePaths[0] || null
}

const platform = os.platform()
const arch = os.arch()

export const getFolderPath = async ({ title }: { title: string }) => {
  const { filePaths } = await remote.dialog.showOpenDialog({
    title,
    buttonLabel: 'Select',
    properties: ['openDirectory'],
  })

  if (isNil(filePaths)) return null

  return filePaths[0] || null
}

const getPathWithBase = (basePath: string, name: string) =>
  join(basePath, 'lib', platform, arch, name)

const getPath = (name: string) =>
  getPathWithBase(
    isDevelopment ? process.env.DEV_BASE_PATH! : process.resourcesPath!,
    name,
  )

export const FFMPEG_PATH = getPath('ffmpeg')
export const FFPROBE_PATH = getPath('ffprobe')
