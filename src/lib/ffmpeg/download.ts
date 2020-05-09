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

const SAVE_FOLDER = process.resourcesPath
const PLATFORM = os.platform() as 'win32' | 'linux' | 'darwin'
const ARCH = os.arch() as 'x64' | 'ia32'
const EXT = PLATFORM === 'win32' ? '.exe' : ''

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
  const promises = (await fs.readdir(path)).map<Promise<void>>(async file => {
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
  const zipFile = join(SAVE_FOLDER, 'ffmpeg.zip')
  let firstDirName = ''

  await extractZip(zipFile, {
    dir: SAVE_FOLDER,
    onEntry: entry => {
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

  await deleteFolderRecursive(join(SAVE_FOLDER, firstDirName))
  await fs.unlink(zipFile)
}

const extractTarBinaries = async () => {
  // We do this instead of `import`ing so it only does it on the correct platforms.
  const { createDecompressor } = require('lzma-native') as typeof LmzaNative
  const { extract: extractTar } = require('tar-fs') as typeof TarFs
  const tarFile = join(SAVE_FOLDER, 'ffmpeg.tar.xz')

  await new Promise(resolve =>
    createReadStream(tarFile)
      .on('close', resolve)
      .pipe(createDecompressor())
      .pipe(
        extractTar(SAVE_FOLDER, {
          filter: name => !goodFileRegex.test(name),
        }),
      ),
  )

  await delay(1000)

  const extractedFolder = join(SAVE_FOLDER, 'ffmpeg-4.0.3-64bit-static')
  await Promise.all([
    fs.rename(join(extractedFolder, 'ffmpeg'), join(SAVE_FOLDER, 'ffmpeg')),
    fs.rename(join(extractedFolder, 'ffprobe'), join(SAVE_FOLDER, 'ffprobe')),
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
    existsSync(join(SAVE_FOLDER, 'ffmpeg' + EXT)) &&
    existsSync(join(SAVE_FOLDER, 'ffprobe' + EXT))
  ) {
    return
  }

  try {
    const filename = PLATFORM !== 'linux' ? 'ffmpeg.zip' : 'ffmpeg.tar.xz'

    if (!existsSync(join(SAVE_FOLDER, filename))) {
      await download(window, downloadUrls[PLATFORM][ARCH], {
        directory: SAVE_FOLDER,
        filename,
        showBadge: false,
      })
    }

    if (PLATFORM !== 'linux') {
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
