// Character DNA Type Definitions
// Complete type-safe structure for character facial features and attributes

export interface CharacterDNA {
  id: string
  name: string
  face_features: FaceFeatures
  body: Body
  style: Style
  personality: Personality
  metadata: Metadata
}

export interface FaceFeatures {
  general: {
    face_shape: FaceShape
    jawline_shape: JawlineShape
    chin_shape: ChinShape
  }
  eyes: {
    shape: EyeShape
    size: Size
    spacing: Spacing
    color: string // Hex color
    eyelashes: string // Description
    eyelid_type: EyelidType
  }
  eyebrows: {
    shape: EyebrowShape
    thickness: Thickness
    color: string // Hex color
  }
  nose: {
    shape: NoseShape
    width: Size
    nostril_shape: NostrilShape
    bridge_height: Height
  }
  mouth: {
    shape: MouthShape
    fullness: Fullness
    color: string // Hex color
    smile_type: SmileType
  }
  cheeks: {
    cheekbone_height: Height
    cheek_fullness: Fullness
    dimples: boolean
    freckles: string[] // Descriptions
    moles: string[] // Descriptions with positions
  }
  ears: {
    size: Size
    shape: EarShape
    position: Position
  }
  hair: {
    style: string // Free text description
    color: string // Hex color
    texture: HairTexture
    hairline_shape: HairlineShape
    facial_hair: string // Description or "none"
  }
  skin: {
    tone: string // Hex color
    undertone: Undertone
    texture: string // Description
    blemishes: string[] // Descriptions
  }
  default_expression: Expression
  expression_habits: string[] // Descriptions
}

export interface Body {
  type: BodyType
  height_cm: number
  weight_kg: number
  posture: Posture
}

export interface Style {
  clothing_preferences: string[] // Style categories
  accessories: string[] // List of accessories
  color_palette: string[] // Hex colors
}

export interface Personality {
  temperament: Temperament
  gesture_habits: string[] // Descriptions
  speech_style: string // Description
}

export interface Metadata {
  created_at: string // ISO 8601 timestamp
  updated_at: string // ISO 8601 timestamp
  version: number
  source_model: string // AI model identifier
}

// ============================================
// ENUMS AND LITERAL TYPES
// ============================================

export type FaceShape =
  | 'oval'
  | 'round'
  | 'square'
  | 'heart'
  | 'diamond'
  | 'oblong'
  | 'triangle'

export type JawlineShape =
  | 'soft'
  | 'defined'
  | 'angular'
  | 'rounded'

export type ChinShape =
  | 'pointed'
  | 'rounded'
  | 'square'
  | 'cleft'

export type EyeShape =
  | 'almond'
  | 'round'
  | 'hooded'
  | 'upturned'
  | 'downturned'
  | 'monolid'

export type Size =
  | 'small'
  | 'medium'
  | 'large'

export type Spacing =
  | 'close-set'
  | 'normal'
  | 'wide-set'

export type EyelidType =
  | 'monolid'
  | 'single fold'
  | 'double fold'

export type EyebrowShape =
  | 'arched'
  | 'straight'
  | 'rounded'
  | 's-shaped'
  | 'angled'

export type Thickness =
  | 'thin'
  | 'medium'
  | 'thick'

export type NoseShape =
  | 'straight'
  | 'aquiline'
  | 'button'
  | 'snub'
  | 'roman'
  | 'hawk'

export type NostrilShape =
  | 'oval'
  | 'round'
  | 'narrow'

export type Height =
  | 'low'
  | 'medium'
  | 'high'

export type MouthShape =
  | 'bow'
  | 'wide'
  | 'round'
  | 'thin'

export type Fullness =
  | 'thin'
  | 'medium'
  | 'full'

export type SmileType =
  | 'neutral'
  | 'closed'
  | 'open'
  | 'wide'
  | 'smirk'

export type EarShape =
  | 'rounded'
  | 'pointed'
  | 'square'

export type Position =
  | 'low'
  | 'medium'
  | 'high'

export type HairTexture =
  | 'straight'
  | 'wavy'
  | 'curly'
  | 'coily'
  | 'medium'

export type HairlineShape =
  | 'rounded'
  | 'straight'
  | 'widow\'s peak'
  | 'receding'

export type Undertone =
  | 'cool'
  | 'warm'
  | 'neutral'

export type Expression =
  | 'neutral'
  | 'happy'
  | 'serious'
  | 'contemplative'
  | 'confident'

export type BodyType =
  | 'slim'
  | 'athletic'
  | 'average'
  | 'muscular'
  | 'curvy'
  | 'heavy'

export type Posture =
  | 'upright'
  | 'relaxed'
  | 'slouched'
  | 'confident'

export type Temperament =
  | 'confident'
  | 'shy'
  | 'friendly'
  | 'serious'
  | 'playful'
  | 'calm'

// ============================================
// HELPER TYPES FOR PRISMA
// ============================================

// Type for creating a new character DNA
export type CreateCharacterDNAInput = Omit<CharacterDNA, 'id' | 'metadata'> & {
  userId: string
  description?: string
  thumbnailUrl?: string
  isPublic?: boolean
}

// Type for updating character DNA
export type UpdateCharacterDNAInput = Partial<Omit<CharacterDNA, 'id' | 'metadata'>>

// Type for the denormalized quick access fields in Prisma
export interface CharacterDNAQuickAccess {
  faceShape?: string
  eyeColor?: string
  hairColor?: string
  hairStyle?: string
  skinTone?: string
  bodyType?: string
  heightCm?: number
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}

export function extractQuickAccessFields(dna: CharacterDNA): CharacterDNAQuickAccess {
  return {
    faceShape: dna.face_features.general.face_shape,
    eyeColor: dna.face_features.eyes.color,
    hairColor: dna.face_features.hair.color,
    hairStyle: dna.face_features.hair.style,
    skinTone: dna.face_features.skin.tone,
    bodyType: dna.body.type,
    heightCm: dna.body.height_cm,
  }
}

// ============================================
// DEFAULT/TEMPLATE VALUES
// ============================================

export const DEFAULT_CHARACTER_DNA: Omit<CharacterDNA, 'id' | 'name'> = {
  face_features: {
    general: {
      face_shape: 'oval',
      jawline_shape: 'soft',
      chin_shape: 'rounded',
    },
    eyes: {
      shape: 'almond',
      size: 'medium',
      spacing: 'normal',
      color: '#6B4423',
      eyelashes: 'medium length, natural',
      eyelid_type: 'double fold',
    },
    eyebrows: {
      shape: 'arched',
      thickness: 'medium',
      color: '#321f1b',
    },
    nose: {
      shape: 'straight',
      width: 'medium',
      nostril_shape: 'oval',
      bridge_height: 'medium',
    },
    mouth: {
      shape: 'bow',
      fullness: 'medium',
      color: '#D67F6A',
      smile_type: 'neutral',
    },
    cheeks: {
      cheekbone_height: 'medium',
      cheek_fullness: 'medium',
      dimples: false,
      freckles: [],
      moles: [],
    },
    ears: {
      size: 'medium',
      shape: 'rounded',
      position: 'medium',
    },
    hair: {
      style: 'medium length, natural',
      color: '#321f1b',
      texture: 'medium',
      hairline_shape: 'rounded',
      facial_hair: 'none',
    },
    skin: {
      tone: '#F3D2B2',
      undertone: 'neutral',
      texture: 'smooth',
      blemishes: [],
    },
    default_expression: 'neutral',
    expression_habits: [],
  },
  body: {
    type: 'average',
    height_cm: 170,
    weight_kg: 70,
    posture: 'upright',
  },
  style: {
    clothing_preferences: ['casual'],
    accessories: [],
    color_palette: ['#000000', '#FFFFFF', '#808080'],
  },
  personality: {
    temperament: 'friendly',
    gesture_habits: [],
    speech_style: 'casual',
  },
  metadata: {
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
    source_model: 'manual',
  },
}
