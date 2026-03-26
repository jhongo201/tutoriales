import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { verifyToken, getRequestToken } from '@/lib/auth'
import { buildRateLimitHeaders, checkRateLimit, getClientIp } from '@/lib/rateLimit'

const ALLOWED_VIDEO = ['video/mp4', 'video/webm', 'video/ogg']
const ALLOWED_PDF = ['application/pdf']
const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE || '104857600') // 100MB

export async function POST(req: NextRequest) {
  // Verificar autenticación
  const token = getRequestToken(req)
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const ip = getClientIp(req)
  const uploadLimit = Math.max(1, parseInt(process.env.RATE_LIMIT_UPLOAD_LIMIT || '20'))
  const uploadWindowMs = Math.max(1, parseInt(process.env.RATE_LIMIT_UPLOAD_WINDOW_MS || String(10 * 60 * 1000)))
  const rate = checkRateLimit({
    key: `upload:${ip}`,
    limit: uploadLimit,
    windowMs: uploadWindowMs,
  })
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'Demasiadas subidas. Intente más tarde.' },
      { status: 429, headers: buildRateLimitHeaders(rate) }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('type') as string // video, pdf, thumbnail, infografia

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `El archivo excede el tamaño máximo de ${MAX_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    let subFolder: string
    let allowedTypes: string[]

    switch (fileType) {
      case 'video':
        subFolder = 'videos'
        allowedTypes = ALLOWED_VIDEO
        break
      case 'pdf':
        subFolder = 'pdfs'
        allowedTypes = ALLOWED_PDF
        break
      case 'thumbnail':
      case 'infografia':
        subFolder = fileType === 'infografia' ? 'infografias' : 'thumbnails'
        allowedTypes = ALLOWED_IMAGE
        break
      default:
        return NextResponse.json({ error: 'Tipo de archivo no válido' }, { status: 400 })
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipo MIME no permitido: ${file.type}` },
        { status: 400 }
      )
    }

    // Crear carpeta si no existe
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')
    const targetDir = path.join(uploadDir, subFolder)

    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true })
    }

    // Generar nombre único
    const ext = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${ext}`
    const filePath = path.join(targetDir, fileName)

    // Guardar archivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // URL pública del archivo
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/tutorials'
    let baseUrl = process.env.UPLOAD_BASE_URL || `${basePath}/uploads`

    // If the base URL is absolute but ignores basePath (common in local dev),
    // rewrite it so the generated URL matches the actual Next.js route.
    try {
      const parsed = new URL(baseUrl)
      if (
        (parsed.pathname === '/tutorials-files' || parsed.pathname.startsWith('/tutorials-files/')) &&
        !parsed.pathname.startsWith(`${basePath}/tutorials-files`)
      ) {
        parsed.pathname = `${basePath}${parsed.pathname}`
        baseUrl = parsed.toString().replace(/\/$/, '')
      }
      if (
        (parsed.pathname === '/uploads' || parsed.pathname.startsWith('/uploads/')) &&
        !parsed.pathname.startsWith(`${basePath}/uploads`)
      ) {
        parsed.pathname = `${basePath}${parsed.pathname}`
        baseUrl = parsed.toString().replace(/\/$/, '')
      }
    } catch {
      // baseUrl might be relative; normalize below
    }

    if (!/^https?:\/\//i.test(baseUrl)) {
      if (baseUrl.startsWith('/tutorials-files') && !baseUrl.startsWith(`${basePath}/tutorials-files`)) {
        baseUrl = `${basePath}${baseUrl}`
      } else if (baseUrl.startsWith('/uploads') && !baseUrl.startsWith(`${basePath}/uploads`)) {
        baseUrl = `${basePath}${baseUrl}`
      }
    }

    const publicUrl = `${baseUrl.replace(/\/$/, '')}/${subFolder}/${fileName}`

    return NextResponse.json({
      url: publicUrl,
      fileName,
      size: file.size,
      type: file.type,
    }, { headers: buildRateLimitHeaders(rate) })
  } catch (error) {
    console.error('Error en upload:', error)
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 })
  }
}