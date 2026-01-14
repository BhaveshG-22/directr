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

  // Get the selected permutations
  const selectedPermutations = permutations.filter((p) =>
    selectedPermutationIds.includes(p.id)
  );

  // Get the best user portrait URL
  const userBestPortraitUrl = uploadedImages[selectedImageIndex]?.url || uploadedImages[0]?.url;

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
      const response = await fetch("/api/scene/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: scene.prompt,
          characterPortraitUrl,
          userBestPortraitUrl,
          characterDNA,
          sceneIndex: index,
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

  const completedCount = generatedScenes.filter((s) => s.status === "completed").length;
  const failedCount = generatedScenes.filter((s) => s.status === "failed").length;
  const allCompleted = completedCount === selectedPermutations.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mb-3">
          Final Scene Generation
        </h2>
        <p className="text-grey">
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
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-charcoal">Scene {index + 1}</span>
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
          <p className="text-grey">
            Your {completedCount} unique scene{completedCount !== 1 ? "s" : ""} {completedCount !== 1 ? "are" : "is"} ready for download
          </p>
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
