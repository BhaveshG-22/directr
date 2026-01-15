"use client";

import { useState, useEffect } from "react";
import { ScenePermutation, UploadedImage } from "../types";

interface GeneratedScene {
  index: number;
  permutationId: number;
  url: string;
  prompt: string;
  status: "pending" | "generating" | "completed" | "failed";
  error?: string;
}

interface FaceSwapState {
  status: "idle" | "swapping" | "completed" | "failed";
  swappedUrl?: string;
  error?: string;
}

interface SceneScore {
  scene_index: number;
  similarity_score: number;
  face_match_score: number;
  overall_quality: number;
  strengths?: string[];
  weaknesses?: string[];
  brief_analysis: string;
}

interface ValidationResult {
  scene_scores: SceneScore[];
  ranking: number[];
  overall_assessment: string;
}

interface Step6FinalGenerationProps {
  permutations: ScenePermutation[];
  selectedPermutationIds: number[];
  characterPortraitUrl: string;
  characterDNA: string;
  uploadedImages: UploadedImage[];
  selectedImageIndex: number;
  onScenesGenerated: (scenes: GeneratedScene[]) => void;
  onBack: () => void;
}

export default function Step6FinalGeneration({
  permutations,
  selectedPermutationIds,
  characterPortraitUrl,
  characterDNA,
  uploadedImages,
  selectedImageIndex,
  onScenesGenerated,
  onBack,
}: Step6FinalGenerationProps) {
  const [generatedScenes, setGeneratedScenes] = useState<GeneratedScene[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  // Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Face swap state - keyed by scene index
  const [faceSwapStates, setFaceSwapStates] = useState<Record<number, FaceSwapState>>({});

  // Portrait mode selection
  // "grid_and_best" = Character Portrait (2x2 Grid) + Best User Portrait
  // "top_3_portraits" = Top 3 Best User Portraits only
  // "all_combined" = Grid + Best Photo + Top 3 Portraits (all references)
  // "single_best" = Just the single best user portrait
  const [portraitMode, setPortraitMode] = useState<"grid_and_best" | "top_3_portraits" | "all_combined" | "single_best">("grid_and_best");

  // Model selection for scene generation
  const [generationModel, setGenerationModel] = useState<"nano-banana" | "ideogram-character">("nano-banana");

  // Get the selected permutations
  const selectedPermutations = permutations.filter((p) =>
    selectedPermutationIds.includes(p.id)
  );

  // Get the best user portrait URL
  const userBestPortraitUrl = uploadedImages[selectedImageIndex]?.url || uploadedImages[0]?.url;

  // Get top 3 user portrait URLs
  const top3PortraitUrls = uploadedImages.slice(0, 3).map((img) => img.url);

  // Initialize generated scenes state
  useEffect(() => {
    const initialScenes: GeneratedScene[] = selectedPermutations.map((perm, index) => ({
      index,
      permutationId: perm.id,
      url: "",
      prompt: perm.prompt,
      status: "pending",
    }));
    setGeneratedScenes(initialScenes);
  }, [selectedPermutations.length]);

  const generateScene = async (scene: GeneratedScene, index: number): Promise<GeneratedScene> => {
    try {
      // Determine which reference images to use based on portrait mode
      let referenceData: {
        characterPortraitUrl: string | null;
        userBestPortraitUrl: string | null;
        referenceImageUrls: string[] | null;
      };

      switch (portraitMode) {
        case "grid_and_best":
          referenceData = {
            characterPortraitUrl,
            userBestPortraitUrl,
            referenceImageUrls: null,
          };
          break;
        case "top_3_portraits":
          referenceData = {
            characterPortraitUrl: null,
            userBestPortraitUrl: null,
            referenceImageUrls: top3PortraitUrls,
          };
          break;
        case "all_combined":
          referenceData = {
            characterPortraitUrl,
            userBestPortraitUrl,
            referenceImageUrls: top3PortraitUrls,
          };
          break;
        case "single_best":
          referenceData = {
            characterPortraitUrl: null,
            userBestPortraitUrl,
            referenceImageUrls: null,
          };
          break;
      }

      const response = await fetch("/api/scene/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: scene.prompt,
          ...referenceData,
          characterDNA,
          sceneIndex: index,
          model: generationModel,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate scene");
      }

      const data = await response.json();

      return {
        ...scene,
        url: data.sceneUrl,
        status: "completed",
      };
    } catch (error) {
      return {
        ...scene,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const startGeneration = async () => {
    setIsGenerating(true);
    setCurrentIndex(0);
    setOverallProgress(0);

    const totalScenes = selectedPermutations.length;
    const updatedScenes: GeneratedScene[] = [...generatedScenes];

    for (let i = 0; i < totalScenes; i++) {
      setCurrentIndex(i);

      // Update status to generating
      updatedScenes[i] = { ...updatedScenes[i], status: "generating" };
      setGeneratedScenes([...updatedScenes]);

      // Generate the scene
      const result = await generateScene(updatedScenes[i], i);
      updatedScenes[i] = result;
      setGeneratedScenes([...updatedScenes]);

      // Update progress
      setOverallProgress(Math.round(((i + 1) / totalScenes) * 100));

      // Small delay between generations to avoid rate limiting
      if (i < totalScenes - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    setIsGenerating(false);
    onScenesGenerated(updatedScenes);
  };

  const retryFailed = async () => {
    setIsGenerating(true);

    const failedIndices = generatedScenes
      .map((s, i) => (s.status === "failed" ? i : -1))
      .filter((i) => i !== -1);

    const updatedScenes = [...generatedScenes];

    for (const i of failedIndices) {
      setCurrentIndex(i);
      updatedScenes[i] = { ...updatedScenes[i], status: "generating", error: undefined };
      setGeneratedScenes([...updatedScenes]);

      const result = await generateScene(updatedScenes[i], i);
      updatedScenes[i] = result;
      setGeneratedScenes([...updatedScenes]);

      if (failedIndices.indexOf(i) < failedIndices.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    setIsGenerating(false);
    onScenesGenerated(updatedScenes);
  };

  // Validate generated scenes by comparing to reference images
  const validateScenes = async () => {
    setIsValidating(true);
    setValidationError(null);

    try {
      // Get URLs of completed scenes
      const completedSceneUrls = generatedScenes
        .filter((s) => s.status === "completed" && s.url)
        .map((s) => s.url);

      if (completedSceneUrls.length === 0) {
        throw new Error("No completed scenes to validate");
      }

      // Get top 3 reference images
      const referenceUrls = uploadedImages.slice(0, 3).map((img) => img.url);

      const response = await fetch("/api/scene/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generatedSceneUrls: completedSceneUrls,
          referenceImageUrls: referenceUrls,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to validate scenes");
      }

      const result: ValidationResult = await response.json();
      setValidationResult(result);
    } catch (error) {
      console.error("Scene validation error:", error);
      setValidationError(error instanceof Error ? error.message : "Failed to validate scenes");
    } finally {
      setIsValidating(false);
    }
  };

  // Perform face swap on a scene with low similarity score
  const performFaceSwap = async (sceneIndex: number) => {
    const scene = generatedScenes[sceneIndex];
    if (!scene || scene.status !== "completed" || !scene.url) return;

    // Update state to show swapping in progress
    setFaceSwapStates((prev) => ({
      ...prev,
      [sceneIndex]: { status: "swapping" },
    }));

    try {
      // Use the best user portrait as the character reference
      const characterImageUrl = userBestPortraitUrl;

      const response = await fetch("/api/scene/face-swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetImageUrl: scene.url,
          characterImageUrl,
          sceneIndex,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Face swap failed");
      }

      const result = await response.json();

      // Update the scene URL with the swapped image
      const updatedScenes = [...generatedScenes];
      updatedScenes[sceneIndex] = {
        ...updatedScenes[sceneIndex],
        url: result.swappedImageUrl,
      };
      setGeneratedScenes(updatedScenes);

      setFaceSwapStates((prev) => ({
        ...prev,
        [sceneIndex]: {
          status: "completed",
          swappedUrl: result.swappedImageUrl,
        },
      }));

      // Clear validation result so user can re-validate after face swap
      setValidationResult(null);
    } catch (error) {
      console.error("Face swap error:", error);
      setFaceSwapStates((prev) => ({
        ...prev,
        [sceneIndex]: {
          status: "failed",
          error: error instanceof Error ? error.message : "Face swap failed",
        },
      }));
    }
  };

  // Check if a scene needs face swap (similarity < 7)
  const needsFaceSwap = (sceneIndex: number): boolean => {
    const score = getSceneScore(sceneIndex);
    return score !== undefined && score.similarity_score < 7;
  };

  // Get scenes that need face swap
  const scenesNeedingFaceSwap = validationResult
    ? validationResult.scene_scores.filter((s) => s.similarity_score < 7)
    : [];

  // Helper to get score for a specific scene
  const getSceneScore = (sceneIndex: number): SceneScore | undefined => {
    return validationResult?.scene_scores.find((s) => s.scene_index === sceneIndex);
  };

  // Helper to get rank position for a scene
  const getSceneRank = (sceneIndex: number): number | undefined => {
    const rankIndex = validationResult?.ranking.indexOf(sceneIndex);
    return rankIndex !== undefined && rankIndex >= 0 ? rankIndex + 1 : undefined;
  };

  // Helper to get score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-sage";
    if (score >= 6) return "text-gold";
    if (score >= 4) return "text-orange-500";
    return "text-coral";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return "bg-sage";
    if (score >= 6) return "bg-gold";
    if (score >= 4) return "bg-orange-500";
    return "bg-coral";
  };

  const completedCount = generatedScenes.filter((s) => s.status === "completed").length;
  const failedCount = generatedScenes.filter((s) => s.status === "failed").length;
  const allCompleted = completedCount === selectedPermutations.length;

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="border-b border-grey-light pb-4 sm:pb-6">
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold flex items-center justify-center shrink-0">
            <span className="text-xl sm:text-2xl font-bold text-charcoal">6</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal" style={{ letterSpacing: "-0.01em" }}>
            Final Scene Generation
          </h2>
        </div>
        <p className="text-grey text-sm sm:text-base ml-0 sm:ml-[60px]">
          Generating {selectedPermutations.length} unique scene{selectedPermutations.length !== 1 ? "s" : ""} with your character
        </p>
      </div>

      {/* Reference Images Card */}
      <div className="bg-charcoal/5 rounded-xl p-6">
        <h3 className="font-semibold text-charcoal mb-4">Reference Images</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Character Portrait (2x2 Grid) */}
          <div className="space-y-2">
            <p className="text-sm text-grey">Character Portrait (2x2 Grid)</p>
            {characterPortraitUrl ? (
              <div className="aspect-square rounded-lg overflow-hidden bg-grey-light">
                <img
                  src={characterPortraitUrl}
                  alt="Character Portrait"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-grey-light flex items-center justify-center">
                <span className="text-grey text-sm">Not available</span>
              </div>
            )}
          </div>

          {/* Best User Portrait */}
          <div className="space-y-2">
            <p className="text-sm text-grey">Best User Portrait</p>
            {userBestPortraitUrl ? (
              <div className="aspect-square rounded-lg overflow-hidden bg-grey-light">
                <img
                  src={userBestPortraitUrl}
                  alt="Best Portrait"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-grey-light flex items-center justify-center">
                <span className="text-grey text-sm">Not available</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model Selection */}
      {!isGenerating && generatedScenes.every((s) => s.status === "pending") && (
        <div className="bg-white rounded-xl p-6 border border-grey-light">
          <h3 className="font-semibold text-charcoal mb-3">Generation Model</h3>
          <p className="text-sm text-grey mb-4">
            Choose which AI model to use for generating scenes:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nano Banana */}
            <label className="flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-gold/50"
              style={{ borderColor: generationModel === "nano-banana" ? "#D4AF37" : "#E5E5E5" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name="generationModel"
                  value="nano-banana"
                  checked={generationModel === "nano-banana"}
                  onChange={() => setGenerationModel("nano-banana")}
                  className="accent-gold"
                />
                <span className="font-medium text-charcoal">Google Nano Banana</span>
              </div>
              <p className="text-xs text-grey">
                Supports multiple reference images. Good for consistent character generation with various references.
              </p>
            </label>

            {/* Ideogram Character */}
            <label className="flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-gold/50"
              style={{ borderColor: generationModel === "ideogram-character" ? "#D4AF37" : "#E5E5E5" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name="generationModel"
                  value="ideogram-character"
                  checked={generationModel === "ideogram-character"}
                  onChange={() => setGenerationModel("ideogram-character")}
                  className="accent-gold"
                />
                <span className="font-medium text-charcoal">Ideogram Character</span>
              </div>
              <p className="text-xs text-grey">
                Single reference image. Excellent character consistency with automatic facial feature detection.
              </p>
            </label>
          </div>
          {generationModel === "ideogram-character" && (
            <p className="text-xs text-gold mt-3 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Note: Ideogram uses only the first reference image (best portrait or 2x2 grid)
            </p>
          )}
        </div>
      )}

      {/* Portrait Mode Selection */}
      {!isGenerating && generatedScenes.every((s) => s.status === "pending") && (
        <div className="bg-white rounded-xl p-6 border border-grey-light">
          <h3 className="font-semibold text-charcoal mb-3">Reference Image Mode</h3>
          <p className="text-sm text-grey mb-4">
            Choose which reference images to use for generating scenes:
          </p>
          <div className="space-y-3">
            {/* Option 1: Grid + Best Portrait */}
            <label className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-gold/50"
              style={{ borderColor: portraitMode === "grid_and_best" ? "#D4AF37" : "#E5E5E5" }}
            >
              <input
                type="radio"
                name="portraitMode"
                value="grid_and_best"
                checked={portraitMode === "grid_and_best"}
                onChange={() => setPortraitMode("grid_and_best")}
                className="mt-1 accent-gold"
              />
              <div className="flex-1">
                <span className="font-medium text-charcoal">Character Portrait Grid + Best Photo (Recommended)</span>
                <p className="text-xs text-grey mt-1">
                  Uses the AI-generated 2x2 portrait composite along with your best uploaded photo for consistent facial features.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {characterPortraitUrl && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-grey-light border border-grey-light">
                    <img src={characterPortraitUrl} alt="2x2 Grid" className="w-full h-full object-cover" />
                  </div>
                )}
                {userBestPortraitUrl && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-grey-light border border-grey-light">
                    <img src={userBestPortraitUrl} alt="Best Photo" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </label>

            {/* Option 2: Single Best Portrait */}
            <label className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-gold/50"
              style={{ borderColor: portraitMode === "single_best" ? "#D4AF37" : "#E5E5E5" }}
            >
              <input
                type="radio"
                name="portraitMode"
                value="single_best"
                checked={portraitMode === "single_best"}
                onChange={() => setPortraitMode("single_best")}
                className="mt-1 accent-gold"
              />
              <div className="flex-1">
                <span className="font-medium text-charcoal">Single Best Portrait</span>
                <p className="text-xs text-grey mt-1">
                  Uses only your single best uploaded photo. Ideal for Ideogram Character model which works best with one reference.
                </p>
              </div>
              {userBestPortraitUrl && (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-grey-light border border-grey-light shrink-0">
                  <img src={userBestPortraitUrl} alt="Best Photo" className="w-full h-full object-cover" />
                </div>
              )}
            </label>

            {/* Option 3: Top 3 Portraits */}
            <label className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-gold/50"
              style={{ borderColor: portraitMode === "top_3_portraits" ? "#D4AF37" : "#E5E5E5" }}
            >
              <input
                type="radio"
                name="portraitMode"
                value="top_3_portraits"
                checked={portraitMode === "top_3_portraits"}
                onChange={() => setPortraitMode("top_3_portraits")}
                className="mt-1 accent-gold"
              />
              <div className="flex-1">
                <span className="font-medium text-charcoal">Top 3 Best User Portraits</span>
                <p className="text-xs text-grey mt-1">
                  Uses your top 3 uploaded photos directly without the AI-generated portrait grid. More natural but may have slight variations.
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                {top3PortraitUrls.map((url, i) => (
                  <div key={i} className="w-10 h-10 rounded-lg overflow-hidden bg-grey-light border border-grey-light">
                    <img src={url} alt={`Top ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </label>

            {/* Option 4: All Combined */}
            <label className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-gold/50"
              style={{ borderColor: portraitMode === "all_combined" ? "#D4AF37" : "#E5E5E5" }}
            >
              <input
                type="radio"
                name="portraitMode"
                value="all_combined"
                checked={portraitMode === "all_combined"}
                onChange={() => setPortraitMode("all_combined")}
                className="mt-1 accent-gold"
              />
              <div className="flex-1">
                <span className="font-medium text-charcoal">All References Combined</span>
                <p className="text-xs text-grey mt-1">
                  Uses everything: the 2x2 portrait grid, your best photo, and top 3 uploads. Maximum reference data for best facial consistency.
                </p>
              </div>
              <div className="flex gap-1 shrink-0 flex-wrap justify-end" style={{ maxWidth: "140px" }}>
                {characterPortraitUrl && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-grey-light border-2 border-gold">
                    <img src={characterPortraitUrl} alt="2x2 Grid" className="w-full h-full object-cover" />
                  </div>
                )}
                {userBestPortraitUrl && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-grey-light border-2 border-blue">
                    <img src={userBestPortraitUrl} alt="Best" className="w-full h-full object-cover" />
                  </div>
                )}
                {top3PortraitUrls.slice(0, 2).map((url, i) => (
                  <div key={i} className="w-10 h-10 rounded-lg overflow-hidden bg-grey-light border border-grey-light">
                    <img src={url} alt={`Top ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {top3PortraitUrls.length > 2 && (
                  <div className="w-10 h-10 rounded-lg bg-grey-light border border-grey-light flex items-center justify-center">
                    <span className="text-xs text-grey">+{top3PortraitUrls.length - 2}</span>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Progress Section */}
      {isGenerating && (
        <div className="bg-white rounded-xl p-6 border border-grey-light">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-charcoal">
              Generating Scene {currentIndex + 1} of {selectedPermutations.length}
            </span>
            <span className="text-gold font-bold">{overallProgress}%</span>
          </div>
          <div className="w-full bg-grey-light rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gold transition-all duration-500 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-sm text-grey mt-3 text-center">
            Please wait while your scenes are being generated...
          </p>
        </div>
      )}

      {/* Start Generation Button */}
      {!isGenerating && generatedScenes.every((s) => s.status === "pending") && (
        <div className="text-center">
          <button
            onClick={startGeneration}
            className="px-8 py-4 bg-gold text-charcoal font-semibold rounded-xl hover:bg-gold/90 transition-all inline-flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Generating {selectedPermutations.length} Scene{selectedPermutations.length !== 1 ? "s" : ""}
          </button>
        </div>
      )}

      {/* Generated Scenes Grid */}
      {generatedScenes.some((s) => s.status !== "pending") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-charcoal">Generated Scenes</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-sage">
                {completedCount} completed
              </span>
              {failedCount > 0 && (
                <span className="text-red-500">
                  {failedCount} failed
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedScenes.map((scene, index) => (
              <div
                key={index}
                className={`rounded-xl overflow-hidden border-2 transition-all ${
                  scene.status === "completed"
                    ? "border-sage"
                    : scene.status === "failed"
                    ? "border-red-300"
                    : scene.status === "generating"
                    ? "border-gold"
                    : "border-grey-light"
                }`}
              >
                {/* Image Container */}
                <div className="aspect-square bg-grey-light relative">
                  {scene.status === "completed" && scene.url ? (
                    <img
                      src={scene.url}
                      alt={`Scene ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : scene.status === "generating" ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gold animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-grey mt-2">Generating...</span>
                    </div>
                  ) : scene.status === "failed" ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-500 text-sm mt-2 text-center">{scene.error || "Failed"}</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-grey">Pending</span>
                    </div>
                  )}
                </div>

                {/* Scene Info */}
                <div className="p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-charcoal">Scene {index + 1}</span>
                    <div className="flex items-center gap-2">
                      {/* Face Swap Badge */}
                      {faceSwapStates[index]?.status === "completed" && (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-600 font-medium">
                          Swapped
                        </span>
                      )}
                      {/* Rank Badge */}
                      {getSceneRank(index) && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue/20 text-blue font-bold">
                          #{getSceneRank(index)}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          scene.status === "completed"
                            ? "bg-sage/20 text-sage"
                            : scene.status === "failed"
                            ? "bg-red-100 text-red-600"
                            : scene.status === "generating"
                            ? "bg-gold/20 text-gold"
                            : "bg-grey-light text-grey"
                        }`}
                      >
                        {scene.status}
                      </span>
                    </div>
                  </div>

                  {/* Score Display */}
                  {getSceneScore(index) && (
                    <div className="space-y-2 pt-2 border-t border-grey-light">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-grey">Similarity</span>
                            <span className={`font-bold ${getScoreColor(getSceneScore(index)!.similarity_score)}`}>
                              {getSceneScore(index)!.similarity_score}/10
                            </span>
                          </div>
                          <div className="w-full bg-grey-light rounded-full h-1.5">
                            <div
                              className={`h-full rounded-full ${getScoreBgColor(getSceneScore(index)!.similarity_score)}`}
                              style={{ width: `${getSceneScore(index)!.similarity_score * 10}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="text-grey">Face: <span className={`font-medium ${getScoreColor(getSceneScore(index)!.face_match_score)}`}>{getSceneScore(index)!.face_match_score}</span></span>
                        <span className="text-grey">Quality: <span className={`font-medium ${getScoreColor(getSceneScore(index)!.overall_quality)}`}>{getSceneScore(index)!.overall_quality}</span></span>
                      </div>

                      {/* Face Swap Button for low similarity scores */}
                      {needsFaceSwap(index) && faceSwapStates[index]?.status !== "completed" && (
                        <div className="pt-2">
                          {faceSwapStates[index]?.status === "swapping" ? (
                            <div className="flex items-center gap-2 text-xs text-purple-600">
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>Swapping face...</span>
                            </div>
                          ) : faceSwapStates[index]?.status === "failed" ? (
                            <div className="space-y-1">
                              <p className="text-xs text-red-500">{faceSwapStates[index].error}</p>
                              <button
                                onClick={() => performFaceSwap(index)}
                                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                              >
                                Try Again
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => performFaceSwap(index)}
                              className="w-full py-1.5 text-xs bg-purple-100 text-purple-700 font-medium rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Face Swap
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Retry Failed Button */}
          {failedCount > 0 && !isGenerating && (
            <div className="text-center">
              <button
                onClick={retryFailed}
                className="px-6 py-2 text-gold hover:text-gold/80 font-medium inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry {failedCount} Failed Scene{failedCount !== 1 ? "s" : ""}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Completion Message */}
      {allCompleted && !isGenerating && (
        <div className="bg-sage/10 rounded-xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-sage/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-charcoal mb-2">All Scenes Generated!</h3>
          <p className="text-grey mb-4">
            Your {completedCount} unique scene{completedCount !== 1 ? "s" : ""} {completedCount !== 1 ? "are" : "is"} ready for download
          </p>

          {/* Score Scenes Button */}
          {!validationResult && !isValidating && (
            <button
              onClick={validateScenes}
              className="px-6 py-3 bg-blue text-white font-semibold rounded-xl hover:bg-blue/90 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Score & Rank Scenes
            </button>
          )}

          {/* Validating Progress */}
          {isValidating && (
            <div className="flex items-center justify-center gap-3 text-blue">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-medium">AI is analyzing and scoring scenes...</span>
            </div>
          )}
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div className="bg-coral/10 rounded-xl p-4 border border-coral/20">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-coral shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-coral mb-1">Validation Error</p>
              <p className="text-xs text-grey">{validationError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Results */}
      {validationResult && (
        <div className="bg-blue/5 rounded-xl p-6 border border-blue/20">
          <h3 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Scene Similarity Rankings
          </h3>

          {/* Ranking Display */}
          <div className="mb-4">
            <p className="text-sm text-grey mb-3">Ranked by similarity to your reference photos:</p>
            <div className="flex flex-wrap gap-2">
              {validationResult.ranking.map((sceneIndex, rank) => {
                const score = validationResult.scene_scores.find(s => s.scene_index === sceneIndex);
                return (
                  <div
                    key={sceneIndex}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${
                      rank === 0 ? 'border-gold bg-gold/10' : 'border-grey-light bg-white'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      rank === 0 ? 'bg-gold' : rank === 1 ? 'bg-grey' : 'bg-grey-light text-grey'
                    }`}>
                      {rank + 1}
                    </span>
                    <span className="text-sm font-medium text-charcoal">Scene {sceneIndex + 1}</span>
                    {score && (
                      <span className={`text-xs font-bold ${getScoreColor(score.similarity_score)}`}>
                        {score.similarity_score}/10
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overall Assessment */}
          <div className="bg-white rounded-lg p-4 border border-grey-light">
            <h4 className="text-sm font-semibold text-charcoal mb-2">AI Assessment</h4>
            <p className="text-sm text-grey">{validationResult.overall_assessment}</p>
          </div>

          {/* Detailed Scores (Expandable) */}
          <details className="mt-4">
            <summary className="text-sm font-medium text-blue cursor-pointer hover:text-blue/80">
              View detailed analysis for each scene
            </summary>
            <div className="mt-3 space-y-3">
              {validationResult.scene_scores.map((score) => (
                <div key={score.scene_index} className="bg-white rounded-lg p-4 border border-grey-light">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-charcoal">Scene {score.scene_index + 1}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`font-bold ${getScoreColor(score.similarity_score)}`}>
                        Similarity: {score.similarity_score}/10
                      </span>
                      <span className={`font-bold ${getScoreColor(score.face_match_score)}`}>
                        Face: {score.face_match_score}/10
                      </span>
                      <span className={`font-bold ${getScoreColor(score.overall_quality)}`}>
                        Quality: {score.overall_quality}/10
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-grey mb-2">{score.brief_analysis}</p>
                  <div className="flex gap-4 text-xs">
                    {score.strengths && score.strengths.length > 0 && (
                      <div className="flex-1">
                        <span className="text-sage font-medium">Strengths: </span>
                        <span className="text-grey">{score.strengths.join(", ")}</span>
                      </div>
                    )}
                    {score.weaknesses && score.weaknesses.length > 0 && (
                      <div className="flex-1">
                        <span className="text-coral font-medium">Weaknesses: </span>
                        <span className="text-grey">{score.weaknesses.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </details>

          {/* Face Swap Recommendation */}
          {scenesNeedingFaceSwap.length > 0 && (
            <div className="mt-4 bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900 mb-1">Face Swap Available</h4>
                  <p className="text-sm text-purple-700 mb-3">
                    {scenesNeedingFaceSwap.length} scene{scenesNeedingFaceSwap.length !== 1 ? "s have" : " has"} similarity scores below 7.
                    Use AI face swap to improve facial resemblance.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {scenesNeedingFaceSwap.map((score) => (
                      <span
                        key={score.scene_index}
                        className={`text-xs px-2 py-1 rounded-full ${
                          faceSwapStates[score.scene_index]?.status === "completed"
                            ? "bg-sage/20 text-sage"
                            : faceSwapStates[score.scene_index]?.status === "swapping"
                            ? "bg-purple-200 text-purple-700"
                            : "bg-coral/20 text-coral"
                        }`}
                      >
                        Scene {score.scene_index + 1}: {score.similarity_score}/10
                        {faceSwapStates[score.scene_index]?.status === "completed" && " ✓"}
                        {faceSwapStates[score.scene_index]?.status === "swapping" && " ..."}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-purple-600 mb-3">
                    Click the &quot;Face Swap&quot; button on individual scene cards above to improve them.
                  </p>
                  {Object.values(faceSwapStates).some(s => s.status === "completed") && (
                    <button
                      onClick={validateScenes}
                      disabled={isValidating}
                      className="text-sm text-purple-700 hover:text-purple-900 font-medium inline-flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Re-score scenes after face swap
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-grey-light">
        <button
          onClick={onBack}
          disabled={isGenerating}
          className="px-6 py-3 border-2 border-grey-light text-charcoal font-semibold rounded-xl hover:border-grey transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {allCompleted && (
          <button
            className="px-6 py-3 bg-sage text-white font-semibold rounded-xl hover:bg-sage/90 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download All Scenes
          </button>
        )}
      </div>
    </div>
  );
}
