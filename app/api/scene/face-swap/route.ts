import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { s3Client, S3_BUCKET, generateS3FileName } from '@/lib/s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import Replicate from 'replicate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || ''
const FACE_SWAP_MODEL_ID = "fofr/face-swap-with-ideogram"

/**
 * POST /api/scene/face-swap
 * Perform face swap on a generated scene using user's reference image
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
    const { targetImageUrl, characterImageUrl, sceneIndex } = body

    if (!targetImageUrl) {
      return NextResponse.json(
        { error: 'targetImageUrl is required (the generated scene to fix)' },
        { status: 400 }
      )
    }

    if (!characterImageUrl) {
      return NextResponse.json(
        { error: 'characterImageUrl is required (reference image of the person)' },
        { status: 400 }
      )
    }

    // Check for Replicate API key
    if (!REPLICATE_API_TOKEN) {
      console.warn('REPLICATE_API_TOKEN is not set. Using mock face swap for development.')
      // Return a mock response for development
      return NextResponse.json({
        success: true,
        swappedImageUrl: targetImageUrl, // Just return the original in dev mode
        message: 'Development mode - REPLICATE_API_TOKEN not configured',
      })
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    })

    console.log(`User ${userId} - Starting face swap for scene ${sceneIndex}`)
    console.log(`Character image: ${characterImageUrl}`)
    console.log(`Target image: ${targetImageUrl}`)

    // Call the face swap model
    const output = await replicate.run(
      FACE_SWAP_MODEL_ID,
      {
        input: {
          character_image: characterImageUrl,
          target_image: targetImageUrl,
          cleanup: false, // Enable cleanup to fix any missing elements
        }
      }
    )

    // Handle the output - can be string URL or FileOutput object
    let swappedImageUrl: string | undefined

    if (typeof output === 'string') {
      swappedImageUrl = output
    } else if (output && typeof output === 'object') {
      swappedImageUrl = output.toString()
    }

    if (!swappedImageUrl || typeof swappedImageUrl !== 'string' || !swappedImageUrl.startsWith('http')) {
      console.error('Unexpected face swap API response:', output)
      throw new Error('No valid image URL found in face swap response')
    }

    console.log(`Face swap complete. Result URL: ${swappedImageUrl}`)

    // Download the swapped image and upload to S3 for persistence
    const imageResponse = await fetch(swappedImageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to download swapped image: ${imageResponse.status}`)
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
    const s3Key = generateS3FileName(userId, `face-swap-scene-${sceneIndex}-${Date.now()}.png`)

    const uploadCommand = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: imageBuffer,
      ContentType: 'image/png',
    })

    await s3Client.send(uploadCommand)

    const persistedUrl = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`

    console.log(`User ${userId} - Face swap saved to S3: ${persistedUrl}`)

    return NextResponse.json({
      success: true,
      swappedImageUrl: persistedUrl,
      originalUrl: targetImageUrl,
      message: 'Face swap completed successfully',
    })
  } catch (error) {
    console.error('Face swap error:', error)
    return NextResponse.json(
      { error: 'Failed to perform face swap' },
      { status: 500 }
    )
  }
}
