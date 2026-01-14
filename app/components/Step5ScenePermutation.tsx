"use client";

import { useState } from "react";
import { Scene } from "../types";

interface ScenePermutation {
  id: number;
  variables: Record<string, string>;
  prompt: string;
  originalPrompt?: string;
}

interface Step5ScenePermutationProps {
  selectedScene: Scene;
  characterDNA: string;
  onPermutationsGenerated: (permutations: ScenePermutation[]) => void;
  onSelectedPermutationsChange: (ids: number[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step5ScenePermutation({
  selectedScene,
  characterDNA,
  onPermutationsGenerated,
  onSelectedPermutationsChange,
  onBack,
  onNext,
}: Step5ScenePermutationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [permutations, setPermutations] = useState<ScenePermutation[]>([]);
  const [selectedPermutations, setSelectedPermutations] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState<number | null>(null);

  const generatePermutations = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/scene-permutation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenePrompt: selectedScene.detailedPrompt,
          characterDNA: characterDNA,
          count: 5,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate permutations");
      }

      const data = await response.json();
      setPermutations(data.permutations);
      onPermutationsGenerated(data.permutations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePermutationSelection = (id: number) => {
    setSelectedPermutations((prev) => {
      const newSelection = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      onSelectedPermutationsChange(newSelection);
      return newSelection;
    });
  };

  const selectAll = () => {
    const allIds = permutations.map((p) => p.id);
    setSelectedPermutations(allIds);
    onSelectedPermutationsChange(allIds);
  };

  const deselectAll = () => {
    setSelectedPermutations([]);
    onSelectedPermutationsChange([]);
  };

  const getVariableLabel = (key: string): string => {
    const labels: Record<string, string> = {
      POSE_DESCRIPTION: "Pose",
      BODY_ORIENTATION: "Body",
      HAND_PLACEMENT: "Hands",
      WEIGHT_DISTRIBUTION: "Weight",
      FACIAL_EXPRESSION: "Expression",
      GAZE_DIRECTION: "Gaze",
      ANGLE_KEYWORD: "Angle",
      FRAMING_KEYWORD: "Framing",
      LENS_LANGUAGE: "Lens",
      SUBJECT_POSITION: "Position",
      CAMERA_DISTANCE: "Distance",
      SCENE_INTERACTION: "Action",
    };
    return labels[key] || key;
  };

  const getCategoryColor = (key: string): string => {
    const colors: Record<string, string> = {
      POSE_DESCRIPTION: "bg-blue-100 text-blue-800",
      BODY_ORIENTATION: "bg-blue-100 text-blue-800",
      HAND_PLACEMENT: "bg-blue-100 text-blue-800",
      WEIGHT_DISTRIBUTION: "bg-blue-100 text-blue-800",
      FACIAL_EXPRESSION: "bg-purple-100 text-purple-800",
      GAZE_DIRECTION: "bg-purple-100 text-purple-800",
      ANGLE_KEYWORD: "bg-green-100 text-green-800",
      FRAMING_KEYWORD: "bg-green-100 text-green-800",
      LENS_LANGUAGE: "bg-green-100 text-green-800",
      SUBJECT_POSITION: "bg-amber-100 text-amber-800",
      CAMERA_DISTANCE: "bg-amber-100 text-amber-800",
      SCENE_INTERACTION: "bg-rose-100 text-rose-800",
    };
    return colors[key] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mb-3">
          Scene Permutation Engine
        </h2>
        <p className="text-grey">
          Generate unique shot variations by combining your scene with randomized pose, expression, and camera settings.
        </p>
      </div>

      {/* Scene Info Card */}
      <div className="bg-charcoal/5 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gold/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-charcoal mb-1">Selected Scene</h3>
            <p className="text-lg text-charcoal/80">{selectedScene.title}</p>
            <p className="text-sm text-grey mt-2 line-clamp-2">
              {selectedScene.detailedPrompt.substring(0, 200)}...
            </p>
          </div>
        </div>
      </div>

      {/* Variable Categories Legend */}
      <div className="bg-white rounded-xl p-6 border border-grey-light">
        <h3 className="font-semibold text-charcoal mb-4">Variable Categories</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-sm text-grey">Body/Pose</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            <span className="text-sm text-grey">Expression</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-sm text-grey">Camera</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-sm text-grey">Composition</span>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      {permutations.length === 0 && (
        <div className="text-center">
          <button
            onClick={generatePermutations}
            disabled={isGenerating}
            className="px-8 py-4 bg-gold text-charcoal font-semibold rounded-xl hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-3"
          >
            {isGenerating ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating 5 Unique Variations...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generate 5 Scene Permutations
              </>
            )}
          </button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Permutation Results */}
      {permutations.length > 0 && (
        <div className="space-y-6">
          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={selectAll}
                className="text-sm text-gold hover:text-gold/80 font-medium"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="text-sm text-grey hover:text-charcoal font-medium"
              >
                Deselect All
              </button>
            </div>
            <div className="text-sm text-grey">
              {selectedPermutations.length} of {permutations.length} selected
            </div>
          </div>

          {/* Permutation Cards */}
          <div className="space-y-4">
            {permutations.map((perm) => (
              <div
                key={perm.id}
                className={`bg-white rounded-xl border-2 transition-all ${
                  selectedPermutations.includes(perm.id)
                    ? "border-gold shadow-lg"
                    : "border-grey-light hover:border-grey"
                }`}
              >
                {/* Card Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => togglePermutationSelection(perm.id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        selectedPermutations.includes(perm.id)
                          ? "bg-gold text-charcoal"
                          : "bg-grey-light text-grey"
                      }`}
                    >
                      {perm.id}
                    </div>
                    <span className="font-semibold text-charcoal">
                      Variation #{perm.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedPrompt(expandedPrompt === perm.id ? null : perm.id);
                      }}
                      className="p-2 hover:bg-grey-light rounded-lg transition-colors"
                    >
                      <svg
                        className={`w-5 h-5 text-grey transition-transform ${
                          expandedPrompt === perm.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedPermutations.includes(perm.id)
                          ? "bg-gold border-gold"
                          : "border-grey-light"
                      }`}
                    >
                      {selectedPermutations.includes(perm.id) && (
                        <svg className="w-4 h-4 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* Variable Tags */}
                <div className="px-4 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(perm.variables)
                      .filter(([_, value]) => value)
                      .slice(0, 6)
                      .map(([key, value]) => (
                        <span
                          key={key}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(key)}`}
                          title={value}
                        >
                          {getVariableLabel(key)}: {value.length > 20 ? value.substring(0, 20) + "..." : value}
                        </span>
                      ))}
                    {Object.entries(perm.variables).filter(([_, v]) => v).length > 6 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-grey-light text-grey">
                        +{Object.entries(perm.variables).filter(([_, v]) => v).length - 6} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Prompt */}
                {expandedPrompt === perm.id && (
                  <div className="border-t border-grey-light p-4 bg-charcoal/5">
                    <div className="space-y-4">
                      {/* All Variables */}
                      <div>
                        <h4 className="text-sm font-semibold text-charcoal mb-2">All Variables</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(perm.variables)
                            .filter(([_, value]) => value)
                            .map(([key, value]) => (
                              <div key={key} className="flex items-start gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(key)} whitespace-nowrap`}>
                                  {getVariableLabel(key)}
                                </span>
                                <span className="text-xs text-grey">{value}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Full Prompt */}
                      <div>
                        <h4 className="text-sm font-semibold text-charcoal mb-2">Full Baked Prompt</h4>
                        <div className="bg-white rounded-lg p-3 text-sm text-grey max-h-48 overflow-y-auto">
                          {perm.prompt}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Regenerate Button */}
          <div className="text-center">
            <button
              onClick={generatePermutations}
              disabled={isGenerating}
              className="px-6 py-2 text-gold hover:text-gold/80 font-medium inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate All Variations
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-grey-light">
        <button
          onClick={onBack}
          className="px-6 py-3 border-2 border-grey-light text-charcoal font-semibold rounded-xl hover:border-grey transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={onNext}
          disabled={selectedPermutations.length === 0}
          className="px-6 py-3 bg-gold text-charcoal font-semibold rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          Continue with {selectedPermutations.length} Variation{selectedPermutations.length !== 1 ? "s" : ""}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
