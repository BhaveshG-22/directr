import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { s3Client, S3_BUCKET, generateS3FileName } from '@/lib/s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NANOBANANA_API_URL = process.env.NANOBANANA_API_URL || 'https://api.nanobanana.ai/generate'
const NANOBANANA_API_KEY = process.env.NANOBANANA_API_KEY || ''

/**
 * POST /api/portrait/generate
 * Generate 2x2 portrait composite using user's uploaded images
 */
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

    const body = await request.json()
    const { characterId } = body

    if (!characterId) {
      return NextResponse.json(
        { error: 'characterId is required' },
        { status: 400 }
      )
    }

    // Verify character belongs to user
    const character = await prisma.characterDNA.findUnique({
      where: { id: characterId },
      select: { userId: true },
    })

    if (!character || character.userId !== userId) {
      return NextResponse.json(
        { error: 'Character not found or access denied' },
        { status: 403 }
      )
    }

    // Get user's uploaded images
    const userUploads = await prisma.userUpload.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
      take: 10, // Use up to 10 reference images
    })

    if (userUploads.length === 0) {
      return NextResponse.json(
        { error: 'No uploaded images found for user' },
        { status: 400 }
      )
    }

    // Prepare prompt for 2x2 portrait composite
    const prompt = `A high-quality, photorealistic model composite of the subject in a 2x2 portrait grid, designed to capture a full view of the model's facial structure and features for professional purposes. The composite includes:

Top Left: Headshot – direct, eye-level view showing facial symmetry, eye color, and overall face shape.
Top Right: Profile – perfect 90-degree side view highlighting the jawline, nose shape, and bone structure.
Bottom Left: Three-quarter view from the left – 45-degree angle showing how light interacts with cheekbones and brow.
Bottom Right: Three-quarter view from the right – 45-degree angle from the opposite side to provide balance and symmetry.

The model is photographed with neutral expression, minimal styling, natural skin tones, and a plain, non-distracting background. Maintain consistency in lighting, focus, and sharpness across all four shots to allow accurate evaluation of facial features.`

    // Call NanoBanana API (placeholder - replace with actual API integration)
    const portraitImageData = await generatePortraitComposite(
      userUploads.map(u => u.url),
      prompt
    )

    // Upload generated portrait to S3
    const s3Key = generateS3FileName(userId, `portrait-${Date.now()}.jpg`)

    const uploadCommand = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: portraitImageData,
      ContentType: 'image/jpeg',
    })

    await s3Client.send(uploadCommand)

    const portraitUrl = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`

    // Update user record with portrait URL
    await prisma.user.update({
      where: { id: userId },
      data: {
        character_blank_portrait: portraitUrl,
      },
    })

    return NextResponse.json({
      success: true,
      portraitUrl,
      message: '2x2 portrait composite generated successfully',
    })
  } catch (error) {
    console.error('Portrait generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate portrait composite' },
      { status: 500 }
    )
  }
}

/**
 * Generate portrait composite using NanoBanana API
 * TODO: Replace with actual NanoBanana API integration
 */
async function generatePortraitComposite(
  referenceImageUrls: string[],
  prompt: string
): Promise<Buffer> {
  // Placeholder implementation
  // In production, this would:
  // 1. Call NanoBanana API with reference images and prompt
  // 2. Wait for generation to complete
  // 3. Download the generated image
  // 4. Return as Buffer

  console.log('Generating portrait with NanoBanana API...')
  console.log('Reference images:', referenceImageUrls.length)
  console.log('Prompt:', prompt.substring(0, 100) + '...')

  // For now, return a placeholder error
  // You need to integrate with NanoBanana API here
  throw new Error('NanoBanana API integration not yet implemented. Please add your API integration here.')

  /* Example integration structure:

  const response = await fetch(NANOBANANA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NANOBANANA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      reference_images: referenceImageUrls,
      // Add other NanoBanana-specific parameters
    }),
  })

  if (!response.ok) {
    throw new Error('NanoBanana API request failed')
  }

  const imageData = await response.arrayBuffer()
  return Buffer.from(imageData)
  */
}
