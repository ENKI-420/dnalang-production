import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    // Read file as buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop() || 'bin'
    const filename = `upload-${timestamp}-${random}.${extension}`

    // In production, you would upload to cloud storage (S3, Vercel Blob, etc.)
    // For now, we'll return a mock response
    // const path = join('/tmp', filename)
    // await writeFile(path, buffer)

    // Generate preview for images
    let preview = undefined
    if (file.type.startsWith('image/')) {
      // Convert to base64 for preview
      const base64 = buffer.toString('base64')
      preview = `data:${file.type};base64,${base64}`
    }

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      preview,
      filename,
      size: file.size,
      type: file.type
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
