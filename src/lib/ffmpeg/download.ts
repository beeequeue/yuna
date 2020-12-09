import { BrowserWindow } from "electron"
import { download } from "electron-dl"
import extractZip from "extract-zip"
import fetch from "node-fetch"
import os from "os"
import { join } from "path"
import { existsSync, promises as fs } from "fs"
import { captureException } from "@sentry/node"

import { FFMPEG_SAVE_FOLDER } from "@/utils/ffmpeg"
import { FFMPEG_DOWNLOADED, FFMPEG_FAILED } from "@/messages"

const PLATFORM = os.platform() as "win32" | "linux" | "darwin"
const ARCH = os.arch() as "x64" | "ia32"
const EXT = PLATFORM === "win32" ? ".exe" : ""

type FfmpegVersion = {
  ffmpeg: string
  ffprobe: string
  ffplay?: string
}

type FfmpegTargets =
  | "windows-64"
  | "windows-32"
  | "osx-64"
  | "linux-32"
  | "linux-64"
  | "linux-armhf"
  | "linux-armel"
  | "linux-arm64"

type DownloadUrls = {
  bin: Record<FfmpegTargets, FfmpegVersion>
  permalink: string
  version: string
}

const fetchDownloadUrls = async (): Promise<DownloadUrls> => {
  const response = await fetch("https://ffbinaries.com/api/v1/version/latest")

  if (!response.ok) {
    throw new Error(
      `Failed to fetch FFMPEG versions: ${response.status} ${response.statusText}`,
    )
  }

  return response.json()
}

const match = <I extends string, O extends string>(
  input: I,
  matches: Array<[matchString: I | string, output: O]>,
): O | null =>
  matches.find((matchArray) => matchArray.includes(input))?.[1] ?? null

const getDownloadUrlForPlatform = (urls: DownloadUrls) => {
  const platform = match(PLATFORM, [
    ["win32", "windows"],
    ["darwin", "osx"],
    ["linux", "linux"],
  ])!
  const arch = match(ARCH, [
    ["ia32", "32"],
    ["x64", "64"],
  ])!
  const versionToDownload = `${platform}-${arch}` as FfmpegTargets

  return urls.bin[versionToDownload]
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

const extractZipBinaries = async (filename: string) => {
  const zipFile = join(FFMPEG_SAVE_FOLDER, filename)

  await extractZip(zipFile, {
    dir: FFMPEG_SAVE_FOLDER,
    onEntry: (entry) => {
      const match = goodFileRegex.exec(entry.fileName)
      if (!match || !match[1]) {
        return
      }

      entry.fileName = match[1]
    },
  })

  await fs.unlink(zipFile)
}

export const downloadBinariesIfNecessary = async (
  window: BrowserWindow,
  force?: boolean,
) => {
  if (
    !force &&
    existsSync(join(FFMPEG_SAVE_FOLDER, "ffmpeg" + EXT)) &&
    existsSync(join(FFMPEG_SAVE_FOLDER, "ffprobe" + EXT))
  ) {
    return
  }

  if (existsSync(FFMPEG_SAVE_FOLDER)) {
    await deleteFolderRecursive(FFMPEG_SAVE_FOLDER)
  }
  await fs.mkdir(FFMPEG_SAVE_FOLDER)

  const downloadUrls = await fetchDownloadUrls()
  const downloadUrl = getDownloadUrlForPlatform(downloadUrls)

  try {
    await download(window, downloadUrl.ffmpeg, {
      directory: FFMPEG_SAVE_FOLDER,
      filename: "ffmpeg.zip",
      showBadge: false,
    })
    await download(window, downloadUrl.ffprobe, {
      directory: FFMPEG_SAVE_FOLDER,
      filename: "ffprobe.zip",
      showBadge: false,
    })

    await extractZipBinaries("ffmpeg.zip")
    await extractZipBinaries("ffprobe.zip")

    window.webContents.send(FFMPEG_DOWNLOADED)
  } catch (err) {
    window.webContents.send(FFMPEG_FAILED)

    if (process.env.NODE_ENV !== "production") {
      throw err
    } else {
      captureException(err)
    }
  }
}
