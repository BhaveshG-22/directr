import { PrismaClient, Prisma } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

const prisma = new PrismaClient()

interface StyleData {
  id: string
  name: string
  displayName: string
  description: string
  category: 'URBAN' | 'NATURE' | 'STUDIO' | 'FASHION' | 'LIFESTYLE' | 'PROFESSIONAL' | 'CREATIVE' | 'SEASONAL' | 'TRAVEL' | 'FITNESS' | 'PORTRAIT' | 'EDITORIAL'
  environment: string
  lighting: string
  mood: string
  tags: string[]
  thumbnail: string
  coverImage?: string
  isPremium: boolean
  isActive: boolean
  isExperimental: boolean
  sortOrder: number
  popularityScore: number
  basePrompt: string
  negativePrompt?: string
  promptSettings: Record<string, unknown>
  poseTemplates: string[]
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function waitForEnter(message: string): Promise<void> {
  return new Promise((resolve) => {
    rl.question(message, () => resolve())
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  console.log('\n========================================')
  console.log('  PhotoshootStyle Seed Script')
  console.log('========================================\n')

  // Read the processed data
  const dataPath = path.join(__dirname, '..', 'processed_data.json')
  const rawData = fs.readFileSync(dataPath, 'utf-8')
  const styles: StyleData[] = JSON.parse(rawData)

  console.log(`Found ${styles.length} styles to insert\n`)

  // Ask for mode
  const mode = await new Promise<string>((resolve) => {
    rl.question('Choose mode:\n  [1] Auto (insert all with 500ms delay)\n  [2] Manual (press Enter for each)\n  [3] Fast (no delay)\n\nEnter choice (1/2/3): ', resolve)
  })

  console.log('\n----------------------------------------\n')

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (let i = 0; i < styles.length; i++) {
    const style = styles[i]
    const progress = `[${i + 1}/${styles.length}]`

    try {
      // Check if style already exists
      const existing = await prisma.photoshootStyle.findUnique({
        where: { name: style.name }
      })

      if (existing) {
        console.log(`${progress} SKIP: "${style.displayName}" (already exists)`)
        skipCount++
        continue
      }

      // Insert the style
      await prisma.photoshootStyle.create({
        data: {
          id: style.id,
          name: style.name,
          displayName: style.displayName,
          description: style.description,
          category: style.category,
          environment: style.environment,
          lighting: style.lighting,
          mood: style.mood,
          tags: style.tags,
          thumbnail: style.thumbnail,
          coverImage: style.coverImage || null,
          isPremium: style.isPremium ?? false,
          isActive: style.isActive ?? true,
          isExperimental: style.isExperimental ?? false,
          sortOrder: style.sortOrder ?? 0,
          popularityScore: style.popularityScore ?? 0,
          basePrompt: style.basePrompt,
          negativePrompt: style.negativePrompt || null,
          promptSettings: (style.promptSettings || {}) as Prisma.JsonObject,
          poseTemplates: (style.poseTemplates || []) as Prisma.JsonArray,
        }
      })

      console.log(`${progress} ✓ ADDED: "${style.displayName}"`)
      console.log(`         Category: ${style.category} | Premium: ${style.isPremium} | Experimental: ${style.isExperimental}`)
      successCount++

      // Wait based on mode
      if (mode === '2') {
        await waitForEnter('         Press Enter for next...')
      } else if (mode === '1') {
        await sleep(500)
      }

    } catch (error) {
      console.log(`${progress} ✗ ERROR: "${style.displayName}"`)
      console.log(`         ${error instanceof Error ? error.message : error}`)
      errorCount++
    }
  }

  console.log('\n========================================')
  console.log('  SEED COMPLETE')
  console.log('========================================')
  console.log(`  ✓ Success: ${successCount}`)
  console.log(`  ○ Skipped: ${skipCount}`)
  console.log(`  ✗ Errors:  ${errorCount}`)
  console.log('========================================\n')

  rl.close()
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    rl.close()
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
