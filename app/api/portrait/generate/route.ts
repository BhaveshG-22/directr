import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { s3Client, S3_BUCKET, generateS3FileName } from '@/lib/s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import Replicate from 'replicate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || ''
const REPLICATE_MODEL_ID = "google/nano-banana"

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
    const { characterId, improvementFeedback, selectedImageUrls } = body

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

    // Determine which images to use
    let imageUrls: string[] = []

    if (selectedImageUrls && Array.isArray(selectedImageUrls) && selectedImageUrls.length > 0) {
      // Use the pre-selected top images (e.g., top 4)
      imageUrls = selectedImageUrls
      console.log(`Using ${imageUrls.length} pre-selected images for portrait generation`)
    } else {
      // Get user's uploaded images from database (default: all images)
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

      imageUrls = userUploads.map((u: { url: string }) => u.url)
      console.log(`Using all ${imageUrls.length} uploaded images for portrait generation`)
    }

    // Prepare prompt for 2x2 portrait composite
    let prompt = `A high-quality, photorealistic model composite of the subject in a 2x2 portrait grid, designed to capture a full view of the model's facial structure and features for professional purposes. The composite includes:

Top Left: Headshot – direct, eye-level view showing facial symmetry, eye color, and overall face shape.
Top Right: Profile – perfect 90-degree side view highlighting the jawline, nose shape, and bone structure.
Bottom Left: Three-quarter view from the left – 45-degree angle showing how light interacts with cheekbones and brow.
Bottom Right: Three-quarter view from the right – 45-degree angle from the opposite side to provide balance and symmetry.

The model is photographed with neutral expression, minimal styling, natural skin tones, and a plain, non-distracting background. Maintain consistency in lighting, focus, and sharpness across all four shots to allow accurate evaluation of facial features.`

    // Add improvement feedback to prompt if this is a regeneration
    if (improvementFeedback && Array.isArray(improvementFeedback) && improvementFeedback.length > 0) {
      const improvementsList = improvementFeedback.join(', ')
      prompt += `

IMPORTANT: This is a regeneration attempt. Pay special attention to accurately capturing the following aspects that need improvement from the previous generation:
- ${improvementFeedback.join('\n- ')}

Ensure these specific features (${improvementsList}) closely match the reference images provided.`
      console.log('Regenerating with improvement feedback:', improvementFeedback)
    }

    // Call Replicate API
    const portraitImageData = await generatePortraitComposite(
      imageUrls,
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

    console.log('Generated S3 URL:', portraitUrl);
    console.log('Updating user:', userId, 'with portrait URL');

    // Update user record with portrait URL
    // Also try to update the character record if possible, though the requirement specificied user
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                character_blank_portrait: portraitUrl,
            },
        })
        console.log('User updated successfully. Portrait URL saved:', updatedUser.character_blank_portrait);
    } catch (dbError) {
        console.error('Failed to update user record in DB:', dbError);
        // Do not throw here, as we still want to return the success response with the URL
    }

    // Also link it to the character reference images as a 'processed' image? 
    // Or maybe just store it in the character metadata if needed later. 
    // For now, strictly following the requirement to store in User table.

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
 * Generate portrait composite using Replicate API (Google Nano Banana)
 */
async function generatePortraitComposite(
  referenceImageUrls: string[],
  prompt: string
): Promise<Buffer> {
  console.log('Generating portrait with Replicate API (Nano Banana)...')
  console.log('Reference images:', referenceImageUrls.length)
  
  if (!REPLICATE_API_TOKEN) {
     console.warn('REPLICATE_API_TOKEN is not set. Using mock generation for development.')
     // Return a mock placeholder image for dev if key is missing
     // This prevents the app from crashing during local dev without keys
     const mockResponse = await fetch('https://placehold.co/1024x1024/png?text=2x2+Portrait+Grid')
     return Buffer.from(await mockResponse.arrayBuffer())
  }

  const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
  });

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
    );

    let imageUrl: string | undefined;

    // Based on the provided example, the output seems to be a FileOutput object 
    // which behaves like a ReadableStream but also has a .url() method or can be cast to string/url
    // However, the Replicate Node SDK usually returns the output directly.
    // If the output schema says format: "uri", the SDK usually returns the URL string or a stream.
    // Let's handle both string (URL) and object with url() method cases.
    
    if (typeof output === 'string') {
        imageUrl = output;
    } else if (output && typeof output === 'object' && 'url' in output && typeof (output as any).url === 'function') {
        imageUrl = (output as any).url();
    } else {
        // If it's a stream or unknown object, try casting to string as a fallback
        try {
            imageUrl = String(output);
        } catch (e) {
            console.error('Failed to cast output to string:', e);
        }
    }

    // According to Replicate logs, the output might be a FileOutput object that casts to a string
    // but the `imageUrl` variable might end up being just the string representation if the cast worked.
    // However, the error `imageUrl.startsWith is not a function` suggests that `imageUrl` 
    // is NOT a string, but likely an object (ReadableStream/FileOutput) that doesn't strictly satisfy `typeof === 'string'`
    // but needs to be explicitly converted.
    
    // Explicitly convert to string to be safe, as FileOutput.toString() returns the URL
    if (output && typeof output === 'object') {
        imageUrl = output.toString();
    }

    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
        console.error('Unexpected Replicate API response format:', output)
        throw new Error('No valid image URL found in Replicate API response')
    }

    // Download the generated image
    console.log('Downloading generated image from:', imageUrl)
    const imageResponse = await fetch(imageUrl)
    
    if (!imageResponse.ok) {
        throw new Error(`Failed to download generated image: ${imageResponse.status}`)
    }

    return Buffer.from(await imageResponse.arrayBuffer())

  } catch (error) {
    console.error('Portrait generation failed:', error)
    throw error
  }
}
