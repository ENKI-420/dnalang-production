import { NextRequest, NextResponse } from 'next/server'

// Web page screenshot endpoint
// In production, this would use a headless browser service like Puppeteer or Playwright

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, imageData } = body

    if (!imageData) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      )
    }

    // The imageData is already a base64 data URL from the client-side canvas capture
    // In production, you might want to:
    // 1. Strip the data URL prefix if needed
    // 2. Upload to cloud storage (S3, Vercel Blob, etc.)
    // 3. Generate a permanent URL

    // For now, we'll just acknowledge receipt and return the data
    const timestamp = Date.now()
    const filename = `web-screenshot-${timestamp}.png`

    return NextResponse.json({
      success: true,
      url: imageData, // Return the data URL for immediate use
      filename,
      timestamp,
      sourceUrl: url
    })

  } catch (error: any) {
    console.error('Screenshot error:', error)
    return NextResponse.json(
      { error: error.message || 'Screenshot capture failed' },
      { status: 500 }
    )
  }
}
