import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { s3Client, S3_BUCKET, generateS3FileName } from '@/lib/s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import Replicate from 'replicate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || ''
const REPLICATE_MODEL_ID = "google/nano-banana"

/**
 * POST /api/scene/generate
 * Generate a scene image using the scene prompt and reference portraits
 *
 * Body: {
 *   prompt: string - The baked scene prompt with all variations
 *   characterPortraitUrl: string - The 2x2 portrait grid URL
 *   userBestPortraitUrl: string - The best user upload URL
 *   sceneIndex: number - Index of this scene in the batch (for naming)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { prompt, characterPortraitUrl, userBestPortraitUrl, characterDNA, sceneIndex = 0 } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      )
    }

    if (!characterPortraitUrl && !userBestPortraitUrl) {
      return NextResponse.json(
        { error: 'At least one reference image is required' },
        { status: 400 }
      )
    }

    // Collect reference images for the model
    const referenceImages: string[] = []

    if (characterPortraitUrl) {
      referenceImages.push(characterPortraitUrl)
    }

    if (userBestPortraitUrl) {
      referenceImages.push(userBestPortraitUrl)
    }

    console.log(`Generating scene ${sceneIndex + 1} with ${referenceImages.length} reference images`)
    console.log(`Character DNA: ${characterDNA ? characterDNA.substring(0, 100) + '...' : 'Not provided'}`)

    // Generate the scene image
    const sceneImageData = await generateSceneImage(referenceImages, prompt)

    // Upload to S3
    const s3Key = generateS3FileName(userId, `scene-${sceneIndex + 1}-${Date.now()}.jpg`)

    const uploadCommand = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: sceneImageData,
      ContentType: 'image/jpeg',
    })

    await s3Client.send(uploadCommand)

    const sceneUrl = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`

    console.log(`Scene ${sceneIndex + 1} generated:`, sceneUrl)

    return NextResponse.json({
      success: true,
      sceneUrl,
      sceneIndex,
      characterDNA: characterDNA || null,
      message: `Scene ${sceneIndex + 1} generated successfully`,
    })
  } catch (error) {
    console.error('Scene generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate scene image' },
      { status: 500 }
    )
  }
}

/**
 * Generate scene image using Replicate API (Google Nano Banana)
 */
async function generateSceneImage(
  referenceImageUrls: string[],
  prompt: string
): Promise<Buffer> {
  console.log('Generating scene with Replicate API (Nano Banana)...')
  console.log('Reference images:', referenceImageUrls.length)
  console.log('Prompt length:', prompt.length)

  if (!REPLICATE_API_TOKEN) {
    console.warn('REPLICATE_API_TOKEN is not set. Using mock generation for development.')
    const mockResponse = await fetch('https://placehold.co/1024x1024/png?text=Generated+Scene')
    return Buffer.from(await mockResponse.arrayBuffer())
  }

  const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
  })

  try {
    const output = await replicate.run(
      REPLICATE_MODEL_ID,
      {
        input: {
          prompt: prompt,
          image_input: referenceImageUrls,
          output_format: "jpg"
        }
      }
    )

    let imageUrl: string | undefined

    if (typeof output === 'string') {
      imageUrl = output
    } else if (output && typeof output === 'object') {
      imageUrl = output.toString()
    }

    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      console.error('Unexpected Replicate API response format:', output)
      throw new Error('No valid image URL found in Replicate API response')
    }

    console.log('Downloading generated scene from:', imageUrl)
    const imageResponse = await fetch(imageUrl)

    if (!imageResponse.ok) {
      throw new Error(`Failed to download generated image: ${imageResponse.status}`)
    }

    return Buffer.from(await imageResponse.arrayBuffer())

  } catch (error) {
    console.error('Scene generation failed:', error)
    throw error
  }
}
