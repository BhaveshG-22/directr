// Character DNA Utility Functions
// Helper functions for creating, validating, and managing character DNA

import { CharacterDNA, CreateCharacterDNAInput, extractQuickAccessFields, DEFAULT_CHARACTER_DNA } from '@/app/types/character-dna'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client' // Import the Prisma namespace
/**
 * Create a new character DNA record in the database
 */
export async function createCharacterDNA(
  input: CreateCharacterDNAInput
): Promise<string> {
  const { userId, name, face_features, body, style, personality, description, thumbnailUrl, isPublic } = input

  const quickAccess = extractQuickAccessFields({
    id: '',
    name,
    face_features,
    body,
    style,
    personality,
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
      source_model: 'manual',
    },
  })

  const character = await prisma.characterDNA.create({
    data: {
      userId,
      name,
      description,
      faceFeatures: face_features as unknown as Prisma.InputJsonValue,
      body: body as unknown as Prisma.InputJsonValue,
      style: style as unknown as Prisma.InputJsonValue,
      personality: personality as unknown as Prisma.InputJsonValue,
      thumbnailUrl,
      isPublic: isPublic || false,
      // Denormalized fields for quick filtering
      faceShape: quickAccess.faceShape,
      eyeColor: quickAccess.eyeColor,
      hairColor: quickAccess.hairColor,
      hairStyle: quickAccess.hairStyle,
      skinTone: quickAccess.skinTone,
      bodyType: quickAccess.bodyType,
      heightCm: quickAccess.heightCm,
    },
  })

  return character.id
}

/**
 * Get character DNA by ID
 */
export async function getCharacterDNA(id: string): Promise<CharacterDNA | null> {
  const character = await prisma.characterDNA.findUnique({
    where: { id },
  })

  if (!character) return null

  return {
    id: character.id,
    name: character.name,
    face_features: character.faceFeatures as any,
    body: character.body as any,
    style: character.style as any,
    personality: character.personality as any,
    metadata: {
      created_at: character.createdAt.toISOString(),
      updated_at: character.updatedAt.toISOString(),
      version: character.version,
      source_model: character.sourceModel || 'manual',
    },
  }
}

/**
 * Get all character DNAs for a user
 */
export async function getUserCharacterDNAs(userId: string): Promise<CharacterDNA[]> {
  const characters = await prisma.characterDNA.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return characters.map((character) => ({
    id: character.id,
    name: character.name,
    face_features: character.faceFeatures as any,
    body: character.body as any,
    style: character.style as any,
    personality: character.personality as any,
    metadata: {
      created_at: character.createdAt.toISOString(),
      updated_at: character.updatedAt.toISOString(),
      version: character.version,
      source_model: character.sourceModel || 'manual',
    },
  }))
}

/**
 * Update character DNA
 */
export async function updateCharacterDNA(
  id: string,
  updates: Partial<CreateCharacterDNAInput>
): Promise<void> {
  const updateData: any = {}

  if (updates.name) updateData.name = updates.name
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.thumbnailUrl !== undefined) updateData.thumbnailUrl = updates.thumbnailUrl
  if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic

  if (updates.face_features) {
    updateData.faceFeatures = updates.face_features
    // Update denormalized fields
    updateData.faceShape = updates.face_features.general.face_shape
    updateData.eyeColor = updates.face_features.eyes.color
    updateData.hairColor = updates.face_features.hair.color
    updateData.hairStyle = updates.face_features.hair.style
    updateData.skinTone = updates.face_features.skin.tone
  }

  if (updates.body) {
    updateData.body = updates.body
    updateData.bodyType = updates.body.type
    updateData.heightCm = updates.body.height_cm
  }

  if (updates.style) updateData.style = updates.style
  if (updates.personality) updateData.personality = updates.personality

  await prisma.characterDNA.update({
    where: { id },
    data: updateData,
  })
}

/**
 * Delete character DNA (soft delete)
 */
export async function deleteCharacterDNA(id: string): Promise<void> {
  await prisma.characterDNA.update({
    where: { id },
    data: { isActive: false },
  })
}

/**
 * Link reference images to character DNA
 */
export async function addReferenceImages(
  characterId: string,
  images: Array<{
    url: string
    thumbnailUrl?: string
    type: string
    description?: string
    width?: number
    height?: number
    fileSize?: number
    format?: string
  }>
): Promise<void> {
  await prisma.characterReferenceImage.createMany({
    data: images.map((img) => ({
      characterId,
      url: img.url,
      thumbnailUrl: img.thumbnailUrl,
      type: img.type as any,
      description: img.description,
      width: img.width,
      height: img.height,
      fileSize: img.fileSize,
      format: img.format,
    })),
  })
}

/**
 * Get reference images for a character
 */
export async function getCharacterReferenceImages(characterId: string) {
  return await prisma.characterReferenceImage.findMany({
    where: { characterId },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Validate character DNA structure
 */
export function validateCharacterDNA(dna: Partial<CharacterDNA>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!dna.name || dna.name.trim().length === 0) {
    errors.push('Character name is required')
  }

  if (!dna.face_features) {
    errors.push('Face features are required')
  } else {
    // Validate hex colors
    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
    if (dna.face_features.eyes?.color && !hexRegex.test(dna.face_features.eyes.color)) {
      errors.push(`Invalid eye color format: ${dna.face_features.eyes.color} (must be hex color #RRGGBB)`)
    }
    if (dna.face_features.eyebrows?.color && !hexRegex.test(dna.face_features.eyebrows.color)) {
      errors.push(`Invalid eyebrow color format: ${dna.face_features.eyebrows.color} (must be hex color #RRGGBB)`)
    }
    if (dna.face_features.mouth?.color && !hexRegex.test(dna.face_features.mouth.color)) {
      errors.push(`Invalid mouth color format: ${dna.face_features.mouth.color} (must be hex color #RRGGBB)`)
    }
    if (dna.face_features.hair?.color && !hexRegex.test(dna.face_features.hair.color)) {
      errors.push(`Invalid hair color format: ${dna.face_features.hair.color} (must be hex color #RRGGBB)`)
    }
    if (dna.face_features.skin?.tone && !hexRegex.test(dna.face_features.skin.tone)) {
      errors.push(`Invalid skin tone format: ${dna.face_features.skin.tone} (must be hex color #RRGGBB)`)
    }
  }

  if (!dna.body) {
    errors.push('Body characteristics are required')
  } else {
    if (dna.body.height_cm && (dna.body.height_cm < 50 || dna.body.height_cm > 250)) {
      errors.push('Height must be between 50 and 250 cm')
    }
    if (dna.body.weight_kg && (dna.body.weight_kg < 20 || dna.body.weight_kg > 300)) {
      errors.push('Weight must be between 20 and 300 kg')
    }
  }

  if (!dna.style) {
    errors.push('Style preferences are required')
  }

  if (!dna.personality) {
    errors.push('Personality traits are required')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Generate a character DNA template with default values
 */
export function generateDefaultCharacterDNA(name: string): Omit<CharacterDNA, 'id'> {
  return {
    name,
    ...DEFAULT_CHARACTER_DNA,
  }
}
