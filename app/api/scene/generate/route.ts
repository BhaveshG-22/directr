import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { s3Client, S3_BUCKET, generateS3FileName } from '@/lib/s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import Replicate from 'replicate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || ''

// Available models for scene generation
const MODELS = {
  "nano-banana": "google/nano-banana",
  "ideogram-character": "ideogram-ai/ideogram-character",
} as const

type ModelKey = keyof typeof MODELS

/**
 * POST /api/scene/generate
 * Generate a scene image using the scene prompt and reference portraits
 *
 * Body: {
 *   prompt: string - The baked scene prompt with all variations
 *   characterPortraitUrl: string | null - The 2x2 portrait grid URL (Mode 1)
 *   userBestPortraitUrl: string | null - The best user upload URL (Mode 1)
 *   referenceImageUrls: string[] | null - Array of top 3 user portrait URLs (Mode 2)
 *   sceneIndex: number - Index of this scene in the batch (for naming)
 *   model: "nano-banana" | "ideogram-character" - Which model to use
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
    const { prompt, characterPortraitUrl, userBestPortraitUrl, referenceImageUrls, characterDNA, sceneIndex = 0, model = "nano-banana" } = body

    // Validate model selection
    const selectedModel: ModelKey = (model in MODELS) ? model : "nano-banana"

    if (!prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      )
    }

    // Validate that at least one reference source is provided
    const hasGridAndBest = characterPortraitUrl || userBestPortraitUrl
    const hasTopPortraits = referenceImageUrls && Array.isArray(referenceImageUrls) && referenceImageUrls.length > 0

    if (!hasGridAndBest && !hasTopPortraits) {
      return NextResponse.json(
        { error: 'At least one reference image source is required' },
        { status: 400 }
      )
    }

    // Collect reference images for the model
    const referenceImages: string[] = []

    // Mode 3: All Combined - both grid+best AND top portraits
    if (hasGridAndBest && hasTopPortraits) {
      if (characterPortraitUrl) {
        referenceImages.push(characterPortraitUrl)
      }
      if (userBestPortraitUrl) {
        referenceImages.push(userBestPortraitUrl)
      }
      referenceImages.push(...referenceImageUrls)
      console.log(`Using All Combined mode with ${referenceImages.length} images (grid+best+top3)`)
    } else if (hasTopPortraits) {
      // Mode 2: Use top 3 user portraits directly
      referenceImages.push(...referenceImageUrls)
      console.log(`Using Top 3 Portraits mode with ${referenceImageUrls.length} images`)
    } else {
      // Mode 1: Use character portrait grid + best photo
      if (characterPortraitUrl) {
        referenceImages.push(characterPortraitUrl)
      }
      if (userBestPortraitUrl) {
        referenceImages.push(userBestPortraitUrl)
      }
      console.log(`Using Grid + Best Photo mode with ${referenceImages.length} images`)
    }

    console.log(`Generating scene ${sceneIndex + 1} with ${referenceImages.length} reference images using ${selectedModel}`)
    console.log(`Character DNA: ${characterDNA ? characterDNA.substring(0, 100) + '...' : 'Not provided'}`)

    // Generate the scene image
    const sceneImageData = await generateSceneImage(referenceImages, prompt, selectedModel)

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
 * Generate scene image using Replicate API
 */
async function generateSceneImage(
  referenceImageUrls: string[],
  prompt: string,
  model: ModelKey
): Promise<Buffer> {
  console.log(`Generating scene with Replicate API (${model})...`)
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
    let output: unknown

    if (model === "ideogram-character") {
      // Ideogram Character model - only supports a single reference image
      // Use the first (best) image from the provided references
      const characterReferenceImage = referenceImageUrls[0]
      console.log(`Using Ideogram Character with reference image: ${characterReferenceImage}`)
      console.log(`(${referenceImageUrls.length} images provided, using first/best one - Ideogram only supports 1 reference)`)

      output = await replicate.run(
        MODELS["ideogram-character"],
        {
          input: {
            prompt: prompt,
            character_reference_image: characterReferenceImage,
            style_type: "Realistic",
            aspect_ratio: "1:1",
            rendering_speed: "Default",
            magic_prompt_option: "Auto",
          }
        }
      )
    } else {
      // Nano Banana model - supports multiple reference images
      output = await replicate.run(
        MODELS["nano-banana"],
        {
          input: {
            prompt: prompt,
            image_input: referenceImageUrls,
            output_format: "jpg"
          }
        }
      )
    }

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
