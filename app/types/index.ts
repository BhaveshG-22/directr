export interface Scene {
  uuid: string;
  title: string;
  slug: string;
  detailedPrompt: string;
}

export interface UploadedImage {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export interface PipelineState {
  currentStep: number;
  selectedScene: Scene | null;
  uploadedImages: UploadedImage[];
  characterId: string | null;
  characterName: string | null;
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
