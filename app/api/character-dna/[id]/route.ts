import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCharacterDNA, updateCharacterDNA, deleteCharacterDNA, getCharacterReferenceImages } from '@/lib/character-dna'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/character-dna/[id]
 * Get a specific character DNA by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const characterId = id
    const character = await getCharacterDNA(characterId)

    if (!character) {
      return NextResponse.json(
        { error: 'Character DNA not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    const dbCharacter = await prisma.characterDNA.findUnique({
      where: { id: characterId },
      select: { userId: true },
    })

    if (dbCharacter?.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get reference images
    const referenceImages = await getCharacterReferenceImages(characterId)

    return NextResponse.json({
      character,
      referenceImages,
    })
  } catch (error) {
    console.error('Character DNA fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch character DNA' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/character-dna/[id]
 * Update a character DNA
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const characterId = id

    // Verify ownership
    const dbCharacter = await prisma.characterDNA.findUnique({
      where: { id: characterId },
      select: { userId: true },
    })

    if (!dbCharacter) {
      return NextResponse.json(
        { error: 'Character DNA not found' },
        { status: 404 }
      )
    }

    if (dbCharacter.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const updates = await request.json()
    await updateCharacterDNA(characterId, updates)

    return NextResponse.json({
      success: true,
      message: 'Character DNA updated successfully',
    })
  } catch (error) {
    console.error('Character DNA update error:', error)
    return NextResponse.json(
      { error: 'Failed to update character DNA' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/character-dna/[id]
 * Delete a character DNA (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const characterId = id

    // Verify ownership
    const dbCharacter = await prisma.characterDNA.findUnique({
      where: { id: characterId },
      select: { userId: true },
    })

    if (!dbCharacter) {
      return NextResponse.json(
        { error: 'Character DNA not found' },
        { status: 404 }
      )
    }

    if (dbCharacter.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    await deleteCharacterDNA(characterId)

    return NextResponse.json({
      success: true,
      message: 'Character DNA deleted successfully',
    })
  } catch (error) {
    console.error('Character DNA delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete character DNA' },
      { status: 500 }
    )
  }
}
