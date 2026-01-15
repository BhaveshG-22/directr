import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { auth } from '@clerk/nextjs/server'

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const schema: Schema = {
  description: "Score and rank generated scenes based on similarity to reference images",
  type: SchemaType.OBJECT,
  properties: {
    scene_scores: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          scene_index: { type: SchemaType.NUMBER, description: "Index of the generated scene (0-based)" },
          similarity_score: { type: SchemaType.NUMBER, description: "Similarity score 1-10 comparing to reference images" },
          face_match_score: { type: SchemaType.NUMBER, description: "How well facial features match (1-10)" },
          overall_quality: { type: SchemaType.NUMBER, description: "Overall image quality score (1-10)" },
          strengths: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "What the generated image does well"
          },
          weaknesses: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Areas where the image could be improved"
          },
          brief_analysis: { type: SchemaType.STRING, description: "Brief analysis of the image" },
        },
        required: ["scene_index", "similarity_score", "face_match_score", "overall_quality", "brief_analysis"],
      },
      description: "Scores for each generated scene",
    },
    ranking: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.NUMBER },
      description: "Scene indices ranked from best to worst similarity",
    },
    overall_assessment: {
      type: SchemaType.STRING,
      description: "Overall assessment of the generated scenes",
    },
  },
  required: ["scene_scores", "ranking", "overall_assessment"],
};

/**
 * POST /api/scene/validate
 * Score and rank generated scenes by comparing them to reference images
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

    const { generatedSceneUrls, referenceImageUrls } = await request.json();

    if (!generatedSceneUrls || !Array.isArray(generatedSceneUrls) || generatedSceneUrls.length === 0) {
      return NextResponse.json(
        { error: "No generated scenes provided" },
        { status: 400 }
      );
    }

    if (!referenceImageUrls || !Array.isArray(referenceImageUrls) || referenceImageUrls.length === 0) {
      return NextResponse.json(
        { error: "No reference images provided" },
        { status: 400 }
      );
    }

    // Check for Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not set. Returning mock validation for development.')
      return NextResponse.json({
        scene_scores: generatedSceneUrls.map((_: string, i: number) => ({
          scene_index: i,
          similarity_score: 7 + Math.random() * 2,
          face_match_score: 7 + Math.random() * 2,
          overall_quality: 7 + Math.random() * 2,
          strengths: ["Development mode"],
          weaknesses: ["Configure GEMINI_API_KEY for real validation"],
          brief_analysis: "Mock validation - Gemini API key not configured",
        })),
        ranking: generatedSceneUrls.map((_: string, i: number) => i),
        overall_assessment: "Development mode - Configure GEMINI_API_KEY for real validation",
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    // Fetch reference images and convert to base64
    const referenceParts = await Promise.all(
      referenceImageUrls.slice(0, 3).map(async (url: string, index: number) => {
        return await fetchImageAsBase64(url, `reference-${index}`);
      })
    );

    // Fetch generated scene images and convert to base64
    const sceneParts = await Promise.all(
      generatedSceneUrls.map(async (url: string, index: number) => {
        return await fetchImageAsBase64(url, `scene-${index}`);
      })
    );

    const promptParts = [
      `You are an expert at evaluating AI-generated photoshoot images for similarity and quality.

I am providing you with:
1. REFERENCE IMAGES (${referenceImageUrls.length} images) - These are the original photos of the actual person/model
2. GENERATED SCENE IMAGES (${generatedSceneUrls.length} images) - These are AI-generated photoshoot scenes featuring the same person

Your task is to score and rank each generated scene based on:

**Similarity Score (1-10):** How similar does the person in the generated image look to the person in the reference images?
- Consider: facial structure, face shape, eyes, nose, mouth, hair color/style, skin tone
- 1-3: Very different person, doesn't look like the same individual
- 4-6: Some resemblance but noticeable differences
- 7-8: Good match, recognizably the same person
- 9-10: Excellent match, highly accurate representation

**Face Match Score (1-10):** Specifically how well do the facial features match?
- Focus on: eye shape/color, nose shape, lip shape, face proportions, jawline

**Overall Quality (1-10):** General quality of the generated image
- Consider: image clarity, lighting, composition, artifacts, naturalness

For each scene, provide:
- The three scores
- 2-3 strengths (what looks good)
- 2-3 weaknesses (what could be better)
- A brief analysis (1-2 sentences)

Finally, rank all scenes from best to worst based on overall similarity to the reference person.

REFERENCE IMAGES OF THE ACTUAL PERSON:`,
      ...referenceParts.flatMap((part, index) => [`\nReference Image ${index + 1}:`, part]),
      `\n\nGENERATED SCENE IMAGES TO EVALUATE:`,
      ...sceneParts.flatMap((part, index) => [`\nGenerated Scene ${index + 1}:`, part]),
    ];

    const result = await model.generateContent(promptParts);
    const responseText = result.response.text();
    const response = JSON.parse(responseText);

    // Round scores to 1 decimal place
    if (response.scene_scores) {
      response.scene_scores = response.scene_scores.map((score: any) => ({
        ...score,
        similarity_score: Math.round(score.similarity_score * 10) / 10,
        face_match_score: Math.round(score.face_match_score * 10) / 10,
        overall_quality: Math.round(score.overall_quality * 10) / 10,
      }));
    }

    console.log(`User ${userId} - Scene validation complete. Rankings: ${response.ranking?.join(', ')}`);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Scene validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate scenes" },
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
    return {
      inlineData: {
        data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        mimeType: "image/png"
      }
    };
  }
}
