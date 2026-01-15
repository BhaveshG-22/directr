import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { auth } from '@clerk/nextjs/server'

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const schema: Schema = {
  description: "Evaluate how well the generated portrait represents the model based on reference images",
  type: SchemaType.OBJECT,
  properties: {
    score: {
      type: SchemaType.NUMBER,
      description: "Rating from 1-10 on how well the portrait represents the model",
    },
    reasoning: {
      type: SchemaType.STRING,
      description: "Detailed explanation of the rating, highlighting what matches well and what could be improved",
    },
    strengths: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "List of aspects where the portrait accurately represents the model",
    },
    improvements: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "List of aspects that could be improved for better representation",
    },
  },
  required: ["score", "reasoning"],
};

/**
 * POST /api/portrait/validate
 * Validate how well the generated 2x2 portrait represents the model
 * based on the original reference images
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

    const { portraitUrl, referenceImageUrls } = await request.json();

    if (!portraitUrl) {
      return NextResponse.json(
        { error: "Portrait URL is required" },
        { status: 400 }
      );
    }

    if (!referenceImageUrls || !Array.isArray(referenceImageUrls) || referenceImageUrls.length === 0) {
      return NextResponse.json(
        { error: "Reference images are required" },
        { status: 400 }
      );
    }

    // Check for Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not set. Returning mock validation for development.')
      return NextResponse.json({
        score: 8,
        reasoning: "Mock validation - Gemini API key not configured",
        strengths: ["Development mode"],
        improvements: ["Configure GEMINI_API_KEY for real validation"],
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    // Fetch portrait image and convert to base64
    const portraitPart = await fetchImageAsBase64(portraitUrl, "portrait");

    // Fetch reference images and convert to base64
    const referenceParts = await Promise.all(
      referenceImageUrls.slice(0, 10).map(async (url: string, index: number) => {
        return await fetchImageAsBase64(url, `reference-${index}`);
      })
    );

    const promptParts = [
      `You are an expert at evaluating AI-generated portrait composites for accuracy and likeness.

I am providing you with:
1. A GENERATED 2x2 PORTRAIT COMPOSITE - This is an AI-generated image showing a model from 4 angles (headshot, profile, three-quarter left, three-quarter right)
2. REFERENCE IMAGES - These are the original photos of the actual model that were used as input for the generation

Your task is to evaluate how accurately the generated portrait represents the model in the reference images.

Consider the following aspects:
- Facial structure (face shape, jawline, chin)
- Eyes (shape, color, spacing, size)
- Nose (shape, width, bridge)
- Mouth and lips (shape, fullness)
- Hair (color, style, texture)
- Skin tone and complexion
- Overall likeness and recognizability
- Consistency across the 4 angles in the composite

Rate the portrait on a scale of 1-10:
- 1-3: Poor representation, major features are incorrect
- 4-6: Moderate representation, some features match but noticeable differences
- 7-8: Good representation, captures most key features accurately
- 9-10: Excellent representation, highly accurate likeness

Be strict but fair in your evaluation. The portrait should look like the same person as in the reference images.

GENERATED PORTRAIT COMPOSITE:`,
      portraitPart,
      `\n\nREFERENCE IMAGES OF THE ACTUAL MODEL:`,
      ...referenceParts.flatMap((part, index) => [`\nReference Image ${index + 1}:`, part]),
    ];

    const result = await model.generateContent(promptParts);
    const responseText = result.response.text();
    const response = JSON.parse(responseText);

    // Ensure score is within bounds
    response.score = Math.max(1, Math.min(10, Math.round(response.score)));

    console.log(`Portrait validation for user ${userId}: Score ${response.score}/10`);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Portrait validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate portrait" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to fetch an image and convert to base64
 */
async function fetchImageAsBase64(url: string, label: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${label}: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: response.headers.get("content-type") || "image/jpeg",
      },
    };
  } catch (e) {
    console.error(`Failed to fetch image (${label}):`, e);
    // Return a placeholder to maintain structure
    return {
      inlineData: {
        data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        mimeType: "image/png"
      }
    };
  }
}
