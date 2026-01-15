import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { auth } from '@clerk/nextjs/server'

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const schema: Schema = {
  description: "Identify the top 3 images ranked by quality for portrait generation",
  type: SchemaType.OBJECT,
  properties: {
    top_indices: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.NUMBER },
      description: "Array of 3 image indices (0-based) ranked from best to 3rd best",
    },
    rankings: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          index: { type: SchemaType.NUMBER, description: "0-based image index" },
          score: { type: SchemaType.NUMBER, description: "Quality score 1-10" },
          reason: { type: SchemaType.STRING, description: "Brief reason for ranking" },
        },
        required: ["index", "score", "reason"],
      },
      description: "Detailed rankings for top 3 images",
    },
  },
  required: ["top_indices", "rankings"],
};

/**
 * POST /api/identify-top-images
 * Analyze user images and return the top 3 best images for portrait generation
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

    const { imageUrls } = await request.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    // If 3 or fewer images, just return all of them
    if (imageUrls.length <= 3) {
      const indices = imageUrls.map((_: string, i: number) => i);
      return NextResponse.json({
        top_indices: indices,
        rankings: indices.map((i: number) => ({
          index: i,
          score: 8,
          reason: "Included by default (3 or fewer images uploaded)",
        })),
        top_image_urls: imageUrls,
      });
    }

    // Check for Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not set. Returning first 3 images for development.')
      return NextResponse.json({
        top_indices: [0, 1, 2],
        rankings: [0, 1, 2].map(i => ({
          index: i,
          score: 7,
          reason: "Development mode - Gemini API key not configured",
        })),
        top_image_urls: imageUrls.slice(0, 3),
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    // Fetch images and convert to base64
    const imageParts = await Promise.all(
      imageUrls.map(async (url: string, index: number) => {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          return {
            inlineData: {
              data: buffer.toString("base64"),
              mimeType: response.headers.get("content-type") || "image/jpeg",
            },
          };
        } catch (e) {
          console.error(`Failed to fetch image at index ${index}:`, e);
          return {
            inlineData: {
              data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
              mimeType: "image/png"
            }
          };
        }
      })
    );

    const promptParts = [
      `I am providing ${imageUrls.length} images of a person. Analyze each image and identify the TOP 3 BEST images for generating a professional 2x2 portrait composite.

Evaluation criteria:
1. **Lighting quality** - Well-lit face, no harsh shadows or overexposure
2. **Facial clarity** - Sharp focus on facial features, not blurry
3. **Facial visibility** - Full or mostly visible face, good angle
4. **Expression** - Neutral or pleasant expression
5. **Image quality** - High resolution, no artifacts or compression issues

Return the indices of the 3 best images ranked from best (1st) to 3rd best.
For each image in the top 3, provide a quality score (1-10) and brief reason.

Important: Return exactly 3 indices even if some images are mediocre. We need the 3 best from what's available.`,
      ...imageParts.flatMap((part, index) => [`\n\nImage Index ${index}:`, part]),
    ];

    const result = await model.generateContent(promptParts);
    const responseText = result.response.text();
    const response = JSON.parse(responseText);

    // Ensure we have exactly 3 indices
    let topIndices = response.top_indices || [];
    if (topIndices.length < 3) {
      // Fill with remaining indices if needed
      for (let i = 0; i < imageUrls.length && topIndices.length < 3; i++) {
        if (!topIndices.includes(i)) {
          topIndices.push(i);
        }
      }
    }
    topIndices = topIndices.slice(0, 3);

    // Get the actual URLs for the top images
    const topImageUrls = topIndices.map((i: number) => imageUrls[i]);

    console.log(`User ${userId} - Top 3 images identified: indices ${topIndices.join(', ')}`);

    return NextResponse.json({
      ...response,
      top_indices: topIndices,
      top_image_urls: topImageUrls,
    });
  } catch (error) {
    console.error("Top images identification error:", error);
    return NextResponse.json(
      { error: "Failed to identify top images" },
      { status: 500 }
    );
  }
}
