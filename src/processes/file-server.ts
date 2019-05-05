import { statSync } from 'fs'
import http from 'http'
import querystring from 'querystring'
import { resolve } from 'path'
import ffmpeg from 'fluent-ffmpeg'

export const fileServer = http.createServer(async (req, res) => {
  // eslint-disable-next-line
  console.log(querystring.parse(req.url!))

  const fileQuery = querystring.parse(req.url!).file
  const filePath = resolve(Array.isArray(fileQuery) ? fileQuery[0] : fileQuery)
  let stats

  try {
    stats = statSync(filePath)
  } catch (err) {
    if (err.code === 'ENOENT') {
      // 404 Error if file not found
      return (res.statusCode = 404)
    }

    return res.end(err)
  }

  const range = req.headers.range
  if (!range) {
    // 416 Wrong range
    return (res.statusCode = 416)
  }
  const positions = range.replace(/bytes=/, '').split('-')
  const start = parseInt(positions[0], 10)
  const total = stats.size
  const end = positions[1] ? parseInt(positions[1], 10) : total - 1
  const chunksize = end - start + 1

  res.writeHead(206, {
    'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunksize,
    'Content-Type': 'video/mp4',
  })

  ffmpeg(filePath)
    .on('error', err => res.end(err))
    .format('mpeg4')
    .output(res)
})
