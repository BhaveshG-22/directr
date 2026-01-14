import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserCharacterDNAs } from '@/lib/character-dna'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/character-dna
 * Get all character DNAs for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const characters = await getUserCharacterDNAs(userId)

    return NextResponse.json({
      characters,
      count: characters.length,
    })
  } catch (error) {
    console.error('Character DNA fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch character DNAs' },
      { status: 500 }
    )
  }
}
