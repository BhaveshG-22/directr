import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createCharacterDNA, addReferenceImages, validateCharacterDNA } from '@/lib/character-dna'
import { CharacterDNA } from '@/app/types/character-dna'
import { SchemaType, GoogleGenerativeAI, Schema } from "@google/generative-ai";


export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

/**
 * POST /api/character-dna/generate
 * Generate character DNA from uploaded images
 *
 * Body: {
 *   name: string
 *   imageUrls: string[] // URLs of uploaded images in S3
 *   description?: string
 * }
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
    const { name, imageUrls, description } = body

    if (!name || !imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'name and imageUrls are required' },
        { status: 400 }
      )
    }

    // TODO: Integrate with AI service to analyze images and extract facial features
    // For now, we'll return a placeholder that needs to be filled
    // In production, this would call an AI model like:
    // - Claude with vision capabilities
    // - OpenAI GPT-4 Vision
    // - Custom face analysis model

    const analyzedFeatures = await analyzeImagesForDNA(imageUrls)

    // Validate the generated DNA
    const validation = validateCharacterDNA({ ...analyzedFeatures, name })
    if (!validation.valid) {
      console.error('Validation failed:', JSON.stringify(validation.errors, null, 2))
      console.error('Analyzed features:', JSON.stringify(analyzedFeatures, null, 2))
      return NextResponse.json(
        { error: 'Invalid character DNA generated', details: validation.errors },
        { status: 400 }
      )
    }

    // Create character DNA in database
    const characterId = await createCharacterDNA({
      userId,
      name,
      description,
      face_features: analyzedFeatures.face_features!,
      body: analyzedFeatures.body!,
      style: analyzedFeatures.style!,
      personality: analyzedFeatures.personality!,
    })

    // Link reference images
    await addReferenceImages(
      characterId,
      imageUrls.map((url: string, index: number) => ({
        url,
        type: index === 0 ? 'FACE_FRONT' : 'OTHER',
        description: `Reference image ${index + 1}`,
      }))
    )

    return NextResponse.json({
      success: true,
      characterId,
      message: 'Character DNA generated successfully',
    })
  } catch (error) {
    console.error('Character DNA generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate character DNA' },
      { status: 500 }
    )
  }
}

/**
 * Analyze images and extract facial features using Gemini AI
 */
async function analyzeImagesForDNA(imageUrls: string[]): Promise<Partial<CharacterDNA>> {
  console.log('Analyzing images for DNA extraction:', imageUrls);

  const schema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      face_features: {
        type: SchemaType.OBJECT,
        properties: {
          general: {
            type: SchemaType.OBJECT,
            properties: {
              face_shape: { type: SchemaType.STRING },
              jawline_shape: { type: SchemaType.STRING },
              chin_shape: { type: SchemaType.STRING }
            },
            required: ["face_shape", "jawline_shape", "chin_shape"]
          },
          eyes: {
            type: SchemaType.OBJECT,
            properties: {
              shape: { type: SchemaType.STRING },
              size: { type: SchemaType.STRING },
              spacing: { type: SchemaType.STRING },
              color: { type: SchemaType.STRING },
              eyelashes: { type: SchemaType.STRING },
              eyelid_type: { type: SchemaType.STRING }
            },
            required: ["shape", "size", "spacing", "color", "eyelashes", "eyelid_type"]
          },
          eyebrows: {
            type: SchemaType.OBJECT,
            properties: {
              shape: { type: SchemaType.STRING },
              thickness: { type: SchemaType.STRING },
              color: { type: SchemaType.STRING }
            },
            required: ["shape", "thickness", "color"]
          },
          nose: {
            type: SchemaType.OBJECT,
            properties: {
              shape: { type: SchemaType.STRING },
              width: { type: SchemaType.STRING },
              bridge_height: { type: SchemaType.STRING },
              nostril_shape: { type: SchemaType.STRING }
            },
            required: ["shape", "width", "bridge_height"]
          },
          mouth: {
            type: SchemaType.OBJECT,
            properties: {
              shape: { type: SchemaType.STRING },
              fullness: { type: SchemaType.STRING },
              color: { type: SchemaType.STRING },
              smile_type: { type: SchemaType.STRING }
            },
            required: ["shape", "fullness", "color", "smile_type"]
          },
          cheeks: {
            type: SchemaType.OBJECT,
            properties: {
              cheekbone_height: { type: SchemaType.STRING },
              cheek_fullness: { type: SchemaType.STRING },
              dimples: { type: SchemaType.BOOLEAN },
              freckles: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              moles: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
            },
            required: ["cheekbone_height", "cheek_fullness", "dimples"]
          },
          hair: {
            type: SchemaType.OBJECT,
            properties: {
              style: { type: SchemaType.STRING },
              color: { type: SchemaType.STRING },
              texture: { type: SchemaType.STRING },
              hairline_shape: { type: SchemaType.STRING },
              facial_hair: { type: SchemaType.STRING }
            },
            required: ["style", "color", "texture", "hairline_shape"]
          },
          skin: {
            type: SchemaType.OBJECT,
            properties: {
              tone: { type: SchemaType.STRING },
              undertone: { type: SchemaType.STRING },
              texture: { type: SchemaType.STRING }
            },
            required: ["tone", "undertone", "texture"]
          },
          default_expression: { type: SchemaType.STRING },
          expression_habits: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ["general", "eyes", "eyebrows", "nose", "mouth", "cheeks", "hair", "skin", "default_expression"]
      },
      body: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING },
          height_cm: { type: SchemaType.NUMBER },
          weight_kg: { type: SchemaType.NUMBER },
          posture: { type: SchemaType.STRING }
        },
        required: ["type", "height_cm", "weight_kg", "posture"]
      },
      style: {
        type: SchemaType.OBJECT,
        properties: {
          clothing_preferences: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          accessories: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          color_palette: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ["clothing_preferences", "accessories", "color_palette"]
      },
      personality: {
        type: SchemaType.OBJECT,
        properties: {
          temperament: { type: SchemaType.STRING },
          gesture_habits: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          speech_style: { type: SchemaType.STRING }
        },
        required: ["temperament", "gesture_habits", "speech_style"]
      }
    },
    required: ["face_features", "body", "style", "personality"]
  };

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const imageParts = await Promise.all(
      imageUrls.map(async (url) => {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return {
          inlineData: {
            data: Buffer.from(buffer).toString('base64'),
            mimeType: response.headers.get('content-type') || 'image/jpeg',
          },
        };
      })
    );

    const prompt = `Analyze the images. Extract the physical DNA. 
    CRITICAL INSTRUCTIONS: 
    1. All string values must be lowercase (e.g., "oval" not "Oval").
    2. FOR ALL COLOR FIELDS (especially skin.tone): YOU MUST RETURN A HEX CODE (e.g. #000000, #964b00, #f1c27d). DO NOT RETURN COLOR NAMES like "brown", "black", "blue", "fair", or "medium".
    3. Height and weight must be numbers (e.g., 180, not "180cm").
    4. Ensure every field in the schema is populated.`;

    const result = await model.generateContent([prompt, ...imageParts]);
    const parsedResult = JSON.parse(result.response.text());

    // Sanitize colors to ensure they are hex codes
    const sanitizeColor = (color: string | undefined, fallback: string) => {
      if (!color) return fallback;
      if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)) return color;
      // Simple mapping for common words if the AI fails
      const map: Record<string, string> = {
        'fair': '#ffe0bd',
        'light': '#f1c27d',
        'medium': '#e0ac69',
        'tan': '#b08b55',
        'dark': '#5c3e2e',
        'black': '#000000',
        'brown': '#4b3621',
        'blonde': '#faf0be',
        'red': '#b33b3b',
        'white': '#ffffff',
        'blue': '#4b8bf5',
        'green': '#4bf54b',
        'hazel': '#8e7618'
      };
      // Try to find a partial match or default
      for (const [key, val] of Object.entries(map)) {
        if (color.toLowerCase().includes(key)) return val;
      }
      return fallback;
    };

    if (parsedResult.face_features) {
      if (parsedResult.face_features.eyes) {
        parsedResult.face_features.eyes.color = sanitizeColor(parsedResult.face_features.eyes.color, '#000000');
      }
      if (parsedResult.face_features.eyebrows) {
        parsedResult.face_features.eyebrows.color = sanitizeColor(parsedResult.face_features.eyebrows.color, '#000000');
      }
      if (parsedResult.face_features.mouth) {
        parsedResult.face_features.mouth.color = sanitizeColor(parsedResult.face_features.mouth.color, '#e9967a');
      }
      if (parsedResult.face_features.hair) {
        parsedResult.face_features.hair.color = sanitizeColor(parsedResult.face_features.hair.color, '#000000');
      }
      if (parsedResult.face_features.skin) {
        parsedResult.face_features.skin.tone = sanitizeColor(parsedResult.face_features.skin.tone, '#f1c27d');
      }
    }

    return parsedResult;

  } catch (error) {
    console.error('Error during Gemini DNA analysis:', error);
    throw error;
  }
}