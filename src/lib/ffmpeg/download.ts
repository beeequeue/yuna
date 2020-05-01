import { BrowserWindow } from 'electron'
import { download } from 'electron-dl'
import extractZip from 'extract-zip'
import type * as TarFs from 'tar-fs'
import type * as LmzaNative from 'lzma-native'
import os from 'os'
import { join } from 'path'
import { createReadStream, existsSync, promises as fs } from 'fs'
import { captureException } from '@sentry/node'

import { delay } from '@/utils'
import { FFMPEG_DOWNLOADED, FFMPEG_FAILED } from '@/messages'

const platform = os.platform() as 'win32' | 'linux' | 'darwin'
const arch = os.arch() as 'x64' | 'ia32'
const ext = platform === 'win32' ? '.exe' : ''

const downloadUrls = {
  win32: {
    ia32:
      'https://ffmpeg.zeranoe.com/builds/win32/static/ffmpeg-4.2.2-win32-static.zip',
    x64:
      'https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-4.2.2-win64-static.zip',
  },
  linux: {
    ia32:
      'https://www.johnvansickle.com/ffmpeg/old-releases/ffmpeg-4.0.3-32bit-static.tar.xz',
    x64:
      'https://www.johnvansickle.com/ffmpeg/old-releases/ffmpeg-4.0.3-64bit-static.tar.xz',
  },
  darwin: {
    x64:
      'https://ffmpeg.zeranoe.com/builds/macos64/static/ffmpeg-4.2.2-macos64-static.zip',
    ia32: '', // doesn't exist
  },
}

const deleteFolderRecursive = async (path: string) => {
  const promises = (await fs.readdir(path)).map<Promise<void>>(async (file) => {
    const curPath = join(path, file)

    if ((await fs.lstat(curPath)).isDirectory()) {
      // recurse
      return deleteFolderRecursive(curPath)
    } else {
      // delete file
      return fs.unlink(curPath)
    }
  })

  await Promise.all(promises)

  await fs.rmdir(path)
}

const goodFileRegex = /((?:ffprobe|ffmpeg)(?:\.exe)?)$/

const extractZipBinaries = async () => {
  const zipFile = join(process.resourcesPath, 'ffmpeg.zip')
  let firstDirName = ''

  await extractZip(zipFile, {
    dir: process.resourcesPath,
    onEntry: (entry) => {
      if (firstDirName.length < 1) {
        firstDirName = entry.fileName.slice(0, entry.fileName.length - 1)
      }

      const match = goodFileRegex.exec(entry.fileName)
      if (!match || !match[1]) {
        return
      }

      entry.fileName = match[1]
    },
  })

  await deleteFolderRecursive(join(process.resourcesPath, firstDirName))
  await fs.unlink(zipFile)
}

const extractTarBinaries = async () => {
  const { createDecompressor } = require('lzma-native') as typeof LmzaNative
  const { extract: extractTar } = require('tar-fs') as typeof TarFs
  const tarFile = join(process.resourcesPath, 'ffmpeg.tar.xz')

  await new Promise((resolve) =>
    createReadStream(tarFile)
      .on('close', resolve)
      .pipe(createDecompressor())
      .pipe(
        extractTar(process.resourcesPath, {
          filter: (name) => !goodFileRegex.test(name),
        }),
      ),
  )

  await delay(1000)

  const extractedFolder = join(
    process.resourcesPath,
    'ffmpeg-4.0.3-64bit-static',
  )
  await Promise.all([
    fs.rename(
      join(extractedFolder, 'ffmpeg'),
      join(process.resourcesPath, 'ffmpeg'),
    ),
    fs.rename(
      join(extractedFolder, 'ffprobe'),
      join(process.resourcesPath, 'ffprobe'),
    ),
  ])

  await delay(1000)

  await fs.rmdir(extractedFolder)
  await fs.unlink(tarFile)
}

export const downloadBinariesIfNecessary = async (
  window: BrowserWindow,
  force?: boolean,
) => {
  if (
    !force &&
    existsSync(join(process.resourcesPath, 'ffmpeg' + ext)) &&
    existsSync(join(process.resourcesPath, 'ffprobe' + ext))
  ) {
    return
  }

  try {
    const filename = platform !== 'linux' ? 'ffmpeg.zip' : 'ffmpeg.tar.xz'

    if (!existsSync(join(process.resourcesPath, filename))) {
      await download(window, downloadUrls[platform][arch], {
        directory: process.resourcesPath,
        filename,
        showBadge: false,
      })
    }

    if (platform !== 'linux') {
      await extractZipBinaries()
    } else {
      await extractTarBinaries()
    }

    window.webContents.send(FFMPEG_DOWNLOADED)
  } catch (err) {
    window.webContents.send(FFMPEG_FAILED)

    captureException(err)
  }
}
