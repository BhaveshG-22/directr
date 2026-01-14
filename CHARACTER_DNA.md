# Character DNA System

This document explains the Character DNA system - a comprehensive solution for extracting, storing, and managing detailed facial and body characteristics for AI-generated photoshoots.

## Overview

The Character DNA system uses Google's Gemini AI to analyze uploaded images and extract detailed facial features, creating a "DNA profile" that ensures consistent character representation across multiple generated images.

## Features

- 📸 **AI-Powered Analysis**: Gemini AI automatically extracts facial features from images
- 💾 **Database Storage**: Character DNA stored in Supabase with full relational support
- 🔍 **Type-Safe**: Full TypeScript types for all DNA attributes
- 🎨 **Detailed Features**: Captures face shape, eyes, nose, mouth, hair, skin tone, and more
- 🖼️ **Reference Images**: Link multiple reference images to each character
- 🔒 **User Ownership**: Characters are private by default, with optional public sharing

## Architecture

### 1. Type System (`app/types/character-dna.ts`)

Complete TypeScript definitions for Character DNA structure:

```typescript
interface CharacterDNA {
  id: string
  name: string
  face_features: FaceFeatures
  body: Body
  style: Style
  personality: Personality
  metadata: Metadata
}
```

### 2. Utility Functions (`lib/character-dna.ts`)

Helper functions for CRUD operations:
- `createCharacterDNA()` - Create new character
- `getCharacterDNA()` - Fetch by ID
- `getUserCharacterDNAs()` - List user's characters
- `updateCharacterDNA()` - Update character
- `deleteCharacterDNA()` - Soft delete
- `addReferenceImages()` - Link reference images
- `validateCharacterDNA()` - Validate structure

### 3. API Endpoints

#### Generate Character DNA from Images
**POST** `/api/character-dna/generate`

Analyzes uploaded images using Gemini AI and creates a character DNA profile.

**Request Body:**
```json
{
  "name": "Alex",
  "imageUrls": [
    "https://bucket.s3.amazonaws.com/image1.jpg",
    "https://bucket.s3.amazonaws.com/image2.jpg"
  ],
  "description": "Optional description"
}
```

**Response:**
```json
{
  "success": true,
  "characterId": "cm123...",
  "message": "Character DNA generated successfully"
}
```

#### List User's Characters
**GET** `/api/character-dna`

Returns all character DNAs for the authenticated user.

**Response:**
```json
{
  "characters": [...],
  "count": 5
}
```

#### Get Character by ID
**GET** `/api/character-dna/[id]`

Fetches a specific character DNA with reference images.

**Response:**
```json
{
  "character": { ... },
  "referenceImages": [ ... ]
}
```

#### Update Character
**PATCH** `/api/character-dna/[id]`

Updates character DNA fields.

**Request Body:**
```json
{
  "name": "New Name",
  "description": "Updated description",
  "face_features": { ... }
}
```

#### Delete Character
**DELETE** `/api/character-dna/[id]`

Soft deletes a character (sets `isActive: false`).

## DNA Schema Structure

### Face Features
```json
{
  "general": {
    "face_shape": "oval" | "round" | "square" | "heart" | "diamond" | "oblong",
    "jawline_shape": "soft" | "defined" | "angular",
    "chin_shape": "pointed" | "rounded" | "square"
  },
  "eyes": {
    "shape": "almond" | "round" | "hooded" | "upturned" | "downturned",
    "size": "small" | "medium" | "large",
    "spacing": "close-set" | "normal" | "wide-set",
    "color": "#6B4423",  // Hex color
    "eyelashes": "medium length, curled",
    "eyelid_type": "monolid" | "single fold" | "double fold"
  },
  "eyebrows": {
    "shape": "arched" | "straight" | "rounded" | "s-shaped" | "angled",
    "thickness": "thin" | "medium" | "thick",
    "color": "#321f1b"  // Hex color
  },
  "nose": {
    "shape": "straight" | "aquiline" | "button" | "snub" | "roman",
    "width": "small" | "medium" | "large",
    "nostril_shape": "oval" | "round" | "narrow",
    "bridge_height": "low" | "medium" | "high"
  },
  "mouth": {
    "shape": "bow" | "wide" | "round" | "thin",
    "fullness": "thin" | "medium" | "full",
    "color": "#D67F6A",  // Hex color
    "smile_type": "neutral" | "closed" | "open" | "wide" | "smirk"
  },
  "cheeks": {
    "cheekbone_height": "low" | "medium" | "high",
    "cheek_fullness": "thin" | "medium" | "full",
    "dimples": true | false,
    "freckles": ["light on nose and cheeks"],
    "moles": []
  },
  "ears": {
    "size": "small" | "medium" | "large",
    "shape": "rounded" | "pointed" | "square",
    "position": "low" | "medium" | "high"
  },
  "hair": {
    "style": "short wavy",
    "color": "#321f1b",  // Hex color
    "texture": "straight" | "wavy" | "curly" | "coily",
    "hairline_shape": "rounded" | "straight" | "widow's peak" | "receding",
    "facial_hair": "none" | "description"
  },
  "skin": {
    "tone": "#F3D2B2",  // Hex color
    "undertone": "cool" | "warm" | "neutral",
    "texture": "smooth",
    "blemishes": []
  },
  "default_expression": "neutral" | "happy" | "serious" | "contemplative" | "confident",
  "expression_habits": ["slight eyebrow raise when thinking"]
}
```

### Body Characteristics
```json
{
  "type": "slim" | "athletic" | "average" | "muscular" | "curvy" | "heavy",
  "height_cm": 175,
  "weight_kg": 70,
  "posture": "upright" | "relaxed" | "slouched" | "confident"
}
```

### Style Preferences
```json
{
  "clothing_preferences": ["streetwear", "casual"],
  "accessories": ["watch", "earrings"],
  "color_palette": ["#FF5733", "#33FF57", "#3357FF"]
}
```

### Personality Traits
```json
{
  "temperament": "confident" | "shy" | "friendly" | "serious" | "playful" | "calm",
  "gesture_habits": ["crosses arms when standing"],
  "speech_style": "casual" | "formal"
}
```

## Database Schema

The Character DNA is stored in Prisma with these models:

### CharacterDNA Model
- Stores full DNA as JSON in `faceFeatures`, `body`, `style`, `personality` fields
- Denormalized quick-access fields for filtering: `faceShape`, `eyeColor`, `hairColor`, etc.
- Soft delete support with `isActive` flag
- Version tracking
- Public/private sharing control

### CharacterReferenceImage Model
- Links reference images to characters
- Supports different image types (FACE_FRONT, FACE_SIDE, FULL_BODY, etc.)
- Stores image metadata

### UserUpload Model
- Tracks all user uploads to S3
- Links to user via Clerk ID
- Stores S3 key for file management

## Setup Instructions

### 1. Environment Variables

Add to your `.env` file:
```bash
# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 2. Install Dependencies

```bash
npm install @google/generative-ai
```

### 3. Database Migration

The schema is already set up in `prisma/schema.prisma`. Run:
```bash
npx prisma db push
npx prisma generate
```

## Usage Example

### Step 1: Upload Images

First, upload images using the presigned URL endpoint:

```typescript
// Upload images to S3
const uploadedUrls = await uploadImagesToS3(files)
```

### Step 2: Generate Character DNA

```typescript
const response = await fetch('/api/character-dna/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Character',
    imageUrls: uploadedUrls,
    description: 'Character for photoshoot'
  })
})

const { characterId } = await response.json()
```

### Step 3: Use in Photoshoots

Link the character DNA ID to your photoshoot:

```typescript
const photoshoot = await createPhotoshoot({
  userId,
  styleId,
  characterId,  // Reference to character DNA
  // ... other fields
})
```

## Gemini AI Integration

The system uses Gemini 1.5 Flash for image analysis with a detailed prompt that extracts:

1. **Facial Features**: Shape, proportions, colors
2. **Hair**: Style, color, texture
3. **Skin**: Tone, undertone, texture
4. **Body**: Type, posture
5. **Style**: Clothing preferences, accessories
6. **Personality**: Visual cues for temperament

The AI returns structured JSON that matches the Character DNA schema.

## Best Practices

1. **Multiple Images**: Upload 3-5 reference images from different angles for best results
2. **High Quality**: Use clear, well-lit photos
3. **Consistent Lighting**: Similar lighting conditions across images help
4. **Face Visibility**: Ensure face is clearly visible in at least one image
5. **Validation**: Always validate the generated DNA before using in production

## Error Handling

The API includes fallback defaults if Gemini analysis fails:
- Returns a standard DNA structure with default values
- Logs error details for debugging
- Returns 500 status with error message

## Security

- ✅ Authentication required via Clerk
- ✅ User ownership verification on all operations
- ✅ Soft deletes (data never truly deleted)
- ✅ API key stored securely in environment variables
- ✅ CORS configured for S3 image access

## Performance

- Gemini API typically responds in 2-5 seconds
- Results cached in database for instant retrieval
- Denormalized fields for fast filtering
- Indexes on userId, isActive, and quick-access fields

## Future Enhancements

- [ ] Real-time preview of extracted DNA
- [ ] Manual editing interface for DNA fields
- [ ] Comparison tool for multiple characters
- [ ] DNA similarity search
- [ ] Batch DNA generation
- [ ] Integration with image generation models
