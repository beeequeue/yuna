import { remote, FileFilter } from 'electron'
import os from 'os'
import { join } from 'path'
import { isNil } from '@/utils/index'

const ext = os.platform() === 'win32' ? '.exe' : ''

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

export const getFolderPath = async ({ title }: { title: string }) => {
  const { filePaths } = await remote.dialog.showOpenDialog({
    title,
    buttonLabel: 'Select',
    properties: ['openDirectory'],
  })

  if (isNil(filePaths)) return null

  return filePaths[0] || null
}

const getPath = (name: string) => join(process.resourcesPath, name + ext)

export const FFMPEG_PATH = getPath('ffmpeg')
export const FFPROBE_PATH = getPath('ffprobe')
