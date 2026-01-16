import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Hardcoded fallback options for permutation (used when DB poseTemplates are insufficient)
const FALLBACK_POSE_TEMPLATES = [
  "standing confidently with relaxed shoulders",
  "sitting upright with relaxed posture",
  "leaning slightly forward from the hips",
  "leaning back subtly with casual ease",
  "sitting tall with poised posture",
  "relaxed seated pose with softened shoulders",
  "seated with a gentle curve through the spine",
  "standing with weight on one leg",
  "walking naturally mid-stride",
  "seated with crossed legs"
]

const VARIABLE_OPTIONS = {
  BODY_ORIENTATION: [
    "torso facing directly toward the camera",
    "torso subtly angled left",
    "torso subtly angled right",
    "one shoulder slightly forward",
    "shoulders relaxed and slightly asymmetrical",
    "torso angled away with head subtly returning toward camera"
  ],
  HAND_PLACEMENT: [
    "both hands resting lightly on thighs",
    "wrists gently crossed on the lap",
    "elbows resting loosely on thighs",
    "one hand loosely supporting body weight",
    "hands relaxed at sides",
    "one hand near face or hair"
  ],
  WEIGHT_DISTRIBUTION: [
    "weight evenly balanced through the hips",
    "weight subtly shifted onto one hip",
    "weight supported more through the arms",
    "relaxed, off-balance seated posture"
  ],
  FACIAL_EXPRESSION: [
    "soft and calm",
    "serene and composed",
    "gentle and relaxed",
    "warm with a subtle hint of a smile",
    "neutral, editorial-style expression",
    "contemplative and understated",
    "naturally relaxed between expressions"
  ],
  GAZE_DIRECTION: [
    "looking directly into the camera",
    "eyes softly focused on the camera",
    "gaze slightly downward, not fully engaging camera",
    "gaze slightly off-center toward camera-left",
    "gaze slightly off-center toward camera-right",
    "eyes momentarily drifting away from camera",
    "gaze just past the camera, unfocused"
  ],
  ANGLE_KEYWORD: [
    "low-angle shot",
    "high-angle shot",
    "three-quarter angle",
    "side profile",
    "over-the-shoulder",
    "rear three-quarter view",
    "eye-level but slightly offset"
  ],
  FRAMING_KEYWORD: [
    "tight crop",
    "medium shot",
    "wide environmental portrait",
    "waist-up framing",
    "full-body framing",
    "off-center composition",
    "asymmetrical framing with negative space",
    "subject positioned on one-third of frame"
  ],
  LENS_LANGUAGE: [
    "35mm wide lens",
    "50mm natural perspective",
    "85mm portrait lens",
    "compressed depth with shallow background blur"
  ],
  SUBJECT_POSITION: [
    "positioned slightly left in the frame",
    "positioned slightly right in the frame",
    "positioned slightly forward toward the camera",
    "positioned slightly back from the camera",
    "centered but leaning subtly toward camera-left",
    "centered but leaning subtly toward camera-right",
    "slightly angled diagonally in the frame"
  ],
  CAMERA_DISTANCE: [
    "close-up, emphasizing subject details",
    "medium distance, showing torso and limbs",
    "wide, showing full subject within environment",
    "extreme wide, showing subject and background context"
  ],
  SCENE_INTERACTION: [
    "resting one hand lightly on a surface",
    "adjusting hair or clothing",
    "leaning slightly forward or back",
    "shifting weight subtly from one side to the other",
    "looking over shoulder or turning torso",
    ""
  ]
}

// Style context fields from PhotoshootStyle
interface StyleContext {
  environment?: string
  lighting?: string
  mood?: string
  negativePrompt?: string | null
  poseTemplates?: string[]
}

function getRandomOption<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)]
}

/**
 * Get pose templates to use - prefers DB templates if sufficient, otherwise uses fallback
 * @param dbPoseTemplates - Pose templates from PhotoshootStyle in database
 * @param requiredCount - Minimum number of unique poses needed
 * @returns Array of pose templates to use
 */
function getPoseTemplates(dbPoseTemplates: string[] | undefined, requiredCount: number): string[] {
  // Filter out empty strings and validate
  const validDbTemplates = (dbPoseTemplates || []).filter(t => t && t.trim().length > 0)

  if (validDbTemplates.length >= requiredCount) {
    console.log(`Using ${validDbTemplates.length} pose templates from database`)
    return validDbTemplates
  }

  // Not enough DB templates - merge with fallback
  if (validDbTemplates.length > 0) {
    console.log(`DB has ${validDbTemplates.length} templates, supplementing with fallback (need ${requiredCount})`)
    const combined = [...validDbTemplates]
    for (const fallback of FALLBACK_POSE_TEMPLATES) {
      if (!combined.includes(fallback) && combined.length < Math.max(requiredCount, 10)) {
        combined.push(fallback)
      }
    }
    return combined
  }

  console.log('No DB pose templates found, using fallback templates')
  return FALLBACK_POSE_TEMPLATES
}

function generatePermutation(poseTemplates: string[]): Record<string, string> {
  return {
    POSE_DESCRIPTION: getRandomOption(poseTemplates),
    BODY_ORIENTATION: getRandomOption(VARIABLE_OPTIONS.BODY_ORIENTATION),
    HAND_PLACEMENT: getRandomOption(VARIABLE_OPTIONS.HAND_PLACEMENT),
    WEIGHT_DISTRIBUTION: getRandomOption(VARIABLE_OPTIONS.WEIGHT_DISTRIBUTION),
    FACIAL_EXPRESSION: getRandomOption(VARIABLE_OPTIONS.FACIAL_EXPRESSION),
    GAZE_DIRECTION: getRandomOption(VARIABLE_OPTIONS.GAZE_DIRECTION),
    ANGLE_KEYWORD: getRandomOption(VARIABLE_OPTIONS.ANGLE_KEYWORD),
    FRAMING_KEYWORD: getRandomOption(VARIABLE_OPTIONS.FRAMING_KEYWORD),
    LENS_LANGUAGE: getRandomOption(VARIABLE_OPTIONS.LENS_LANGUAGE),
    SUBJECT_POSITION: getRandomOption(VARIABLE_OPTIONS.SUBJECT_POSITION),
    CAMERA_DISTANCE: getRandomOption(VARIABLE_OPTIONS.CAMERA_DISTANCE),
    SCENE_INTERACTION: getRandomOption(VARIABLE_OPTIONS.SCENE_INTERACTION),
  }
}

function assemblePrompt(
  actualPrompt: string,
  characterDNA: string,
  variables: Record<string, string>,
  styleContext: StyleContext
): string {
  const sceneInteraction = variables.SCENE_INTERACTION
    ? `, optionally ${variables.SCENE_INTERACTION}`
    : ''

  // Build style context section if any fields are provided
  const styleLines: string[] = []
  if (styleContext.environment) {
    styleLines.push(`ENVIRONMENT: ${styleContext.environment}`)
  }
  if (styleContext.lighting) {
    styleLines.push(`LIGHTING: ${styleContext.lighting}`)
  }
  if (styleContext.mood) {
    styleLines.push(`MOOD: ${styleContext.mood}`)
  }
  const styleSection = styleLines.length > 0 ? `\n${styleLines.join('\n')}\n` : ''

  return `${actualPrompt}
${styleSection}
CHARACTER_DNA: ${characterDNA}

The subject is ${variables.POSE_DESCRIPTION}, with ${variables.BODY_ORIENTATION}, ${variables.HAND_PLACEMENT}, ${variables.WEIGHT_DISTRIBUTION}, positioned ${variables.SUBJECT_POSITION}. The facial expression is ${variables.FACIAL_EXPRESSION}, with eyes ${variables.GAZE_DIRECTION}. Captured at ${variables.CAMERA_DISTANCE}, using ${variables.ANGLE_KEYWORD}, ${variables.FRAMING_KEYWORD}, and ${variables.LENS_LANGUAGE}${sceneInteraction}.`
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      scenePrompt,
      characterDNA,
      count = 5,
      // Additional style context fields from PhotoshootStyle
      environment,
      lighting,
      mood,
      negativePrompt,
      poseTemplates: dbPoseTemplates
    } = body

    if (!scenePrompt || !characterDNA) {
      return NextResponse.json(
        { error: 'Missing required fields: scenePrompt and characterDNA' },
        { status: 400 }
      )
    }

    // Build style context for prompt assembly
    const styleContext: StyleContext = {
      environment,
      lighting,
      mood,
      negativePrompt
    }

    // Get pose templates - use DB if sufficient, otherwise fallback
    const poseTemplates = getPoseTemplates(dbPoseTemplates, count)

    // Generate unique permutations
    const permutations: Array<{
      id: number
      variables: Record<string, string>
      prompt: string
      negativePrompt?: string | null
    }> = []

    const usedCombinations = new Set<string>()

    for (let i = 0; i < count; i++) {
      let variables: Record<string, string>
      let combinationKey: string

      // Ensure unique combinations
      do {
        variables = generatePermutation(poseTemplates)
        combinationKey = JSON.stringify(variables)
      } while (usedCombinations.has(combinationKey) && usedCombinations.size < 100)

      usedCombinations.add(combinationKey)

      const prompt = assemblePrompt(scenePrompt, characterDNA, variables, styleContext)

      permutations.push({
        id: i + 1,
        variables,
        prompt,
        negativePrompt: negativePrompt || null,
      })
    }

    // Optionally use LLM to refine/bake the prompts
    if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const refinedPermutations = await Promise.all(
        permutations.map(async (perm) => {
          try {
            const refinementPrompt = `You are a professional photography prompt engineer. Take the following scene generation prompt and refine it into a cohesive, natural-sounding prompt that maintains all the technical details but reads smoothly. Do not add new information, just restructure for clarity and flow. Return ONLY the refined prompt, nothing else.

Original prompt:
${perm.prompt}`

            const result = await model.generateContent(refinementPrompt)
            const refinedPrompt = result.response.text().trim()

            return {
              ...perm,
              prompt: refinedPrompt,
              originalPrompt: perm.prompt,
            }
          } catch (error) {
            console.error(`Error refining permutation ${perm.id}:`, error)
            return perm
          }
        })
      )

      return NextResponse.json({
        success: true,
        permutations: refinedPermutations,
      })
    }

    return NextResponse.json({
      success: true,
      permutations,
    })
  } catch (error) {
    console.error('Error generating scene permutations:', error)
    return NextResponse.json(
      { error: 'Failed to generate scene permutations' },
      { status: 500 }
    )
  }
}
