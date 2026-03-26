import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.mp4':
      return 'video/mp4'
    case '.webm':
      return 'video/webm'
    case '.ogg':
      return 'video/ogg'
    case '.pdf':
      return 'application/pdf'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    default:
      return 'application/octet-stream'
  }
}

function safeJoin(baseDir: string, requestPath: string): string | null {
  const base = path.resolve(baseDir)
  const full = path.resolve(baseDir, requestPath)
  if (!full.startsWith(base + path.sep) && full !== base) return null
  return full
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const uploadDirRaw = process.env.UPLOAD_DIR
  const uploadDir = uploadDirRaw ? path.resolve(uploadDirRaw.trim()) : ''
  if (!uploadDir) {
    return new Response('UPLOAD_DIR is not configured', { status: 500 })
  }

  const { path: parts } = await ctx.params
  const relativePath = parts.join('/')
  const filePath = safeJoin(uploadDir, relativePath)

  if (!filePath) {
    return new Response('Invalid path', { status: 400 })
  }

  let stat: fs.Stats
  try {
    stat = fs.statSync(filePath)
    if (!stat.isFile()) {
      const isDev = process.env.NODE_ENV !== 'production'
      return new Response(
        isDev ? `Not found\nuploadDir=${uploadDir}\nfilePath=${filePath}` : 'Not found',
        { status: 404 }
      )
    }
  } catch {
    const isDev = process.env.NODE_ENV !== 'production'
    return new Response(
      isDev ? `Not found\nuploadDir=${uploadDir}\nfilePath=${filePath}` : 'Not found',
      { status: 404 }
    )
  }

  const range = req.headers.get('range')
  const contentType = getContentType(filePath)

  if (range) {
    const match = /^bytes=(\d+)-(\d*)$/.exec(range)
    if (!match) {
      return new Response('Invalid Range', { status: 416 })
    }

    const start = Number(match[1])
    const end = match[2] ? Number(match[2]) : stat.size - 1

    if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= stat.size) {
      return new Response('Range Not Satisfiable', {
        status: 416,
        headers: {
          'Content-Range': `bytes */${stat.size}`,
        },
      })
    }

    const chunkSize = end - start + 1
    const stream = fs.createReadStream(filePath, { start, end })

    return new Response(stream as any, {
      status: 206,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(chunkSize),
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-store',
      },
    })
  }

  const stream = fs.createReadStream(filePath)
  return new Response(stream as any, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(stat.size),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store',
    },
  })
}
