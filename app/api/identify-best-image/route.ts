
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const schema: Schema = {
  description: "Identify the selected image index and reasoning",
  type: SchemaType.OBJECT,
  properties: {
    selected_index: {
      type: SchemaType.NUMBER,
      description: "The 0-based index of the image described",
    },
    reasoning: {
      type: SchemaType.STRING,
      description: "Short explanation of why this image was chosen",
    },
  },
  required: ["selected_index"],
};

export async function POST(request: NextRequest) {
  try {
    const { imageUrls } = await request.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // Updated to a valid model version
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
            // Return a placeholder or skip? Gemini might need index consistency.
            // Let's return a small transparent 1x1 png as placeholder to keep index alignment
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
      "I am providing a list of images. identify the selected image index and reasoning which one contains the best lighting, clarity, and facial visibility for generating a professional photoshoot.",
      ...imageParts.flatMap((part, index) => [`Image Index ${index}:`, part]),
    ];

    const result = await model.generateContent(promptParts);
    const responseText = result.response.text();
    const response = JSON.parse(responseText);

    // Save selected image URL to DB if user is authenticated
    try {
        const { userId } = await auth();
        if (userId && response.selected_index >= 0 && response.selected_index < imageUrls.length) {
            const selectedUrl = imageUrls[response.selected_index];
            
            // Using standard Prisma update
            await prisma.user.update({
                where: { id: userId },
                data: {
                    best_selected_image_url: selectedUrl
                }
            });
            console.log(`Updated user ${userId} with best selected image: ${selectedUrl}`);

        }
    } catch (dbError) {
        console.error("Failed to update best selected image in DB:", dbError);
        // Continue without failing the request
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Best image identification error:", error);
    return NextResponse.json(
      { error: "Failed to identify best image" },
      { status: 500 }
    );
  }
}
