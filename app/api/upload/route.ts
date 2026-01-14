import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { uploadToS3, generateS3FileName } from '@/lib/s3'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 seconds for large file uploads

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (error) {
      console.error('FormData parsing error:', error)
      return NextResponse.json(
        { error: 'Failed to parse form data. File may be too large.' },
        { status: 400 }
      )
    }

    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Only JPEG, PNG, and WebP are allowed.` },
          { status: 400 }
        )
      }
    }

    // Upload files to S3
    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileName = generateS3FileName(userId, file.name)
      const url = await uploadToS3(buffer, fileName, file.type)

      return {
        url,
        filename: file.name,
        size: file.size,
        type: file.type,
      }
    })

    const uploadedFiles = await Promise.all(uploadPromises)

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}
