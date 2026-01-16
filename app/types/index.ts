export interface Scene {
  uuid: string;
  title: string;
  slug: string;
  detailedPrompt: string;
  // Additional PhotoshootStyle fields for enhanced prompt generation
  environment?: string;
  lighting?: string;
  mood?: string;
  negativePrompt?: string | null;
  poseTemplates?: string[]; // Array of style-specific pose descriptions
}

export interface UploadedImage {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export interface ScenePermutation {
  id: number;
  variables: Record<string, string>;
  prompt: string;
  originalPrompt?: string;
  negativePrompt?: string | null;
}

export interface GeneratedScene {
  index: number;
  permutationId: number;
  url: string;
  prompt: string;
  status: "pending" | "generating" | "completed" | "failed";
  error?: string;
}

export interface PipelineState {
  currentStep: number;
  selectedScene: Scene | null;
  uploadedImages: UploadedImage[];
  characterId: string | null;
  characterName: string | null;
  characterDNAString: string | null;
  portraitUrl: string | null;
  selectedImageIndex: number | null;
  generatedPermutations: ScenePermutation[];
  selectedPermutationIds: number[];
  generatedScenes: GeneratedScene[];
}

// Re-export character DNA types for convenience
export type {
  CharacterDNA,
  FaceFeatures,
  Body,
  Style,
  Personality,
  Metadata,
  CreateCharacterDNAInput,
  UpdateCharacterDNAInput,
  CharacterDNAQuickAccess,
} from './character-dna'
