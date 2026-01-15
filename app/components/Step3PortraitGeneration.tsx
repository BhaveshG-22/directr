"use client";

import { useState } from "react";
import { UploadedImage } from "../types";

interface ValidationResult {
  score: number;
  reasoning: string;
  strengths?: string[];
  improvements?: string[];
}

interface Step3PortraitGenerationProps {
  characterId: string;
  characterName: string;
  uploadedImages: UploadedImage[];
  onPortraitGenerated: (portraitUrl: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step3PortraitGeneration({
  characterId,
  characterName,
  uploadedImages,
  onPortraitGenerated,
  onBack,
  onNext,
}: Step3PortraitGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Store improvement feedback for regeneration
  const [improvementFeedback, setImprovementFeedback] = useState<string[] | null>(null);

  // Image selection mode: "all" or "top4"
  const [imageMode, setImageMode] = useState<"all" | "top4">("all");
  const [isIdentifyingTopImages, setIsIdentifyingTopImages] = useState(false);
  const [topImageRankings, setTopImageRankings] = useState<Array<{ index: number; score: number; reason: string }> | null>(null);

  const identifyTopImages = async (): Promise<string[] | null> => {
    setIsIdentifyingTopImages(true);
    try {
      const response = await fetch("/api/identify-top-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrls: uploadedImages.map(img => img.url),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to identify top images");
      }

      const data = await response.json();
      setTopImageRankings(data.rankings || null);
      return data.top_image_urls;
    } catch (err) {
      console.error("Error identifying top images:", err);
      return null;
    } finally {
      setIsIdentifyingTopImages(false);
    }
  };

  const handleGeneratePortrait = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);
    setValidationResult(null);
    setValidationError(null);
    setTopImageRankings(null);

    try {
      // If top4 mode, first identify the best images
      let selectedImageUrls: string[] | undefined;
      if (imageMode === "top4") {
        setGenerationProgress(5);
        const topUrls = await identifyTopImages();
        if (topUrls) {
          selectedImageUrls = topUrls;
        }
        setGenerationProgress(15);
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => Math.min(prev + 3, 90));
      }, 500);

      // Call the portrait generation API with improvement feedback and selected images
      const response = await fetch("/api/portrait/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          characterId,
          improvementFeedback: improvementFeedback,
          selectedImageUrls: selectedImageUrls, // Pass top 4 images if in top4 mode
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate portrait composite");
      }

      const data = await response.json();
      setPortraitUrl(data.portraitUrl);

      // After generation, validate the portrait
      await validatePortrait(data.portraitUrl);

    } catch (err) {
      console.error("Portrait generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate portrait composite");
      setGenerationProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const validatePortrait = async (generatedPortraitUrl: string) => {
    setIsValidating(true);
    setValidationError(null);

    try {
      const referenceImageUrls = uploadedImages.map(img => img.url);

      const response = await fetch("/api/portrait/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          portraitUrl: generatedPortraitUrl,
          referenceImageUrls,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to validate portrait");
      }

      const result: ValidationResult = await response.json();
      setValidationResult(result);

      // Always set the portrait URL - user can decide to continue or redo
      onPortraitGenerated(generatedPortraitUrl);

    } catch (err) {
      console.error("Portrait validation error:", err);
      setValidationError(err instanceof Error ? err.message : "Failed to validate portrait");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRedo = () => {
    // Save the improvement feedback before resetting for use in regeneration
    if (validationResult?.improvements && validationResult.improvements.length > 0) {
      setImprovementFeedback(validationResult.improvements);
    }
    setPortraitUrl(null);
    setValidationResult(null);
    setValidationError(null);
    setError(null);
    setGenerationProgress(0);
  };

  // Portrait is valid once we have a validation result (user can choose to continue or redo)
  const isValid = validationResult !== null;
  const showRedoOption = validationResult !== null && validationResult.score <= 7;

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-sage";
    if (score >= 7) return "text-gold";
    if (score >= 5) return "text-orange-500";
    return "text-coral";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return "bg-sage/10 border-sage/20";
    if (score >= 7) return "bg-gold/10 border-gold/20";
    if (score >= 5) return "bg-orange-500/10 border-orange-500/20";
    return "bg-coral/10 border-coral/20";
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="border-b border-grey-light pb-4 sm:pb-6">
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
            <span className="text-xl sm:text-2xl font-bold text-charcoal">3</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal" style={{ letterSpacing: "-0.01em" }}>
            Generate Model Portrait Composite
          </h2>
        </div>
        <p className="text-grey text-sm sm:text-base ml-0 sm:ml-[60px]">
          Create a professional 2x2 portrait grid showing multiple angles of {characterName}
        </p>
      </div>

      {/* Character Info */}
      <div className="bg-white rounded-[12px] p-4 sm:p-6 border-2 border-grey-light">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-4 h-4 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-charcoal mb-2">Character: {characterName}</h3>
            <p className="text-sm text-grey mb-4">
              AI will generate a professional model composite featuring multiple angles
            </p>

            <div className="bg-cream rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-charcoal mb-2">Portrait Grid Layout:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-grey">
                <div className="bg-white p-3 rounded border border-grey-light">
                  <strong className="text-charcoal">Top Left:</strong> Headshot – direct eye-level view
                </div>
                <div className="bg-white p-3 rounded border border-grey-light">
                  <strong className="text-charcoal">Top Right:</strong> Profile – 90° side view
                </div>
                <div className="bg-white p-3 rounded border border-grey-light">
                  <strong className="text-charcoal">Bottom Left:</strong> Three-quarter left (45°)
                </div>
                <div className="bg-white p-3 rounded border border-grey-light">
                  <strong className="text-charcoal">Bottom Right:</strong> Three-quarter right (45°)
                </div>
              </div>
            </div>

            {/* Image Selection Mode - Test Feature */}
            {!portraitUrl && (
              <div className="bg-blue/5 rounded-lg p-4 mb-4 border border-blue/20">
                <h4 className="text-sm font-semibold text-charcoal mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Image Selection Mode (Test Feature)
                </h4>
                <p className="text-xs text-grey mb-3">
                  Choose which reference images to use for portrait generation
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all flex-1 ${
                    imageMode === "all"
                      ? "border-blue bg-blue/10"
                      : "border-grey-light hover:border-grey"
                  }`}>
                    <input
                      type="radio"
                      name="imageMode"
                      value="all"
                      checked={imageMode === "all"}
                      onChange={() => setImageMode("all")}
                      className="w-4 h-4 text-blue"
                    />
                    <div>
                      <span className="text-sm font-medium text-charcoal">All {uploadedImages.length} Images</span>
                      <p className="text-xs text-grey">Use all uploaded reference images</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all flex-1 ${
                    imageMode === "top4"
                      ? "border-blue bg-blue/10"
                      : "border-grey-light hover:border-grey"
                  }`}>
                    <input
                      type="radio"
                      name="imageMode"
                      value="top4"
                      checked={imageMode === "top4"}
                      onChange={() => setImageMode("top4")}
                      className="w-4 h-4 text-blue"
                    />
                    <div>
                      <span className="text-sm font-medium text-charcoal">Top 3 Best Images</span>
                      <p className="text-xs text-grey">AI selects the 3 best quality images</p>
                    </div>
                  </label>
                </div>
                {imageMode === "top4" && (
                  <p className="text-xs text-blue mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    AI will analyze and select the 3 images with best lighting, clarity, and facial visibility
                  </p>
                )}
              </div>
            )}

            {/* Show top image rankings if available */}
            {topImageRankings && topImageRankings.length > 0 && (
              <div className="bg-sage/10 rounded-lg p-4 mb-4 border border-sage/20">
                <h4 className="text-sm font-semibold text-sage mb-2">Top 3 Images Selected:</h4>
                <div className="space-y-2">
                  {topImageRankings.map((ranking, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="w-5 h-5 rounded-full bg-sage text-white flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-grey">
                        Image {ranking.index + 1} - Score: {ranking.score}/10 - {ranking.reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Identifying top images progress */}
            {isIdentifyingTopImages && (
              <div className="bg-purple-500/10 rounded-lg p-4 mb-4 border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-purple-600">Analyzing images...</p>
                    <p className="text-xs text-grey">AI is selecting the 3 best reference images</p>
                  </div>
                </div>
              </div>
            )}

            {!portraitUrl && (
              <button
                onClick={handleGeneratePortrait}
                disabled={isGenerating}
                className={`w-full px-6 py-4 rounded-[8px] font-semibold text-base transition-all flex items-center justify-center gap-2 ${
                  isGenerating
                    ? "bg-grey-light text-grey cursor-not-allowed"
                    : "bg-blue text-white hover:opacity-90 hover:scale-105 shadow-lg"
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating Portrait Composite...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Generate 2x2 Portrait Grid
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <div className="mt-4 p-4 bg-blue/10 rounded-[8px] border border-blue/20">
            <div className="flex items-center gap-3 mb-3">
              <svg className="w-5 h-5 text-blue animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div className="flex-1">
                <div className="text-sm font-medium text-blue mb-1">
                  AI is generating your model composite...
                </div>
                <div className="text-xs text-grey">
                  This may take 30-60 seconds
                </div>
              </div>
            </div>
            <div className="w-full bg-grey-light rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-blue transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Validation Progress */}
        {isValidating && (
          <div className="mt-4 p-4 bg-purple-500/10 rounded-[8px] border border-purple-500/20">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div className="flex-1">
                <div className="text-sm font-medium text-purple-600 mb-1">
                  AI is evaluating portrait accuracy...
                </div>
                <div className="text-xs text-grey">
                  Comparing with your reference images
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portrait Preview with Validation Score */}
        {portraitUrl && !isValidating && (
          <div className="mt-4 space-y-4">
            {/* Portrait Preview */}
            <div className="bg-charcoal rounded-lg p-4">
              <h4 className="text-sm font-semibold text-cream mb-3">Generated Portrait:</h4>
              <div className="aspect-square bg-grey-dark rounded-lg overflow-hidden border-2 border-grey">
                <img
                  src={portraitUrl}
                  alt="Model Portrait Composite"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Validation Score Display */}
            {validationResult && (
              <div className={`p-4 rounded-[8px] border ${getScoreBgColor(validationResult.score)}`}>
                <div className="flex items-start gap-4">
                  {/* Score Circle */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                    validationResult.score > 7 ? 'bg-sage' : validationResult.score >= 5 ? 'bg-orange-500' : 'bg-coral'
                  }`}>
                    <span className="text-2xl font-bold text-white">{validationResult.score}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`text-lg font-semibold ${getScoreColor(validationResult.score)}`}>
                        {validationResult.score > 7 ? 'Good Match!' : validationResult.score >= 5 ? 'Needs Improvement' : 'Poor Match'}
                      </h4>
                      <span className="text-sm text-grey">({validationResult.score}/10)</span>
                    </div>

                    <p className="text-sm text-grey mb-3">{validationResult.reasoning}</p>

                    {/* Strengths */}
                    {validationResult.strengths && validationResult.strengths.length > 0 && (
                      <div className="mb-2">
                        <h5 className="text-xs font-semibold text-sage mb-1">Strengths:</h5>
                        <ul className="text-xs text-grey space-y-1">
                          {validationResult.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-sage">+</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvements */}
                    {validationResult.improvements && validationResult.improvements.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-coral mb-1">Areas for Improvement:</h5>
                        <ul className="text-xs text-grey space-y-1">
                          {validationResult.improvements.map((imp, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-coral">-</span> {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Redo Option for low scores */}
                {showRedoOption && (
                  <div className="mt-4 pt-4 border-t border-grey-light">
                    <p className="text-sm text-grey mb-3">
                      The portrait score is {validationResult.score}/10. You can continue if you&apos;re satisfied, or regenerate for a potentially better result.
                    </p>
                    <button
                      onClick={handleRedo}
                      className="w-full px-6 py-3 rounded-[8px] font-semibold text-base transition-all flex items-center justify-center gap-2 bg-blue text-white hover:opacity-90"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Try Again (Regenerate)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Success Message for high scores */}
            {validationResult && validationResult.score > 7 && (
              <div className="p-4 bg-sage/10 rounded-[8px] border border-sage/20">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-sage mb-1">Portrait Approved!</p>
                    <p className="text-xs text-grey">
                      Your portrait composite passed validation. You can proceed to the next step.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Continue option message for lower scores */}
            {showRedoOption && (
              <div className="p-4 bg-gold/10 rounded-[8px] border border-gold/20">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-gold mb-1">Your Choice</p>
                    <p className="text-xs text-grey">
                      If you&apos;re happy with the portrait, click &quot;Continue to Step 4&quot;. Otherwise, use the regenerate button above.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Validation Error Message */}
        {validationError && (
          <div className="mt-4 p-4 bg-coral/10 rounded-[8px] border border-coral/20">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-coral flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-coral mb-1">Validation Error</p>
                <p className="text-xs text-grey">{validationError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-coral/10 rounded-[8px] border border-coral/20">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-coral flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-coral mb-1">Error</p>
                <p className="text-xs text-grey">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t-2 border-grey-light">
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-8 py-4 rounded-[8px] font-semibold text-base transition-all flex items-center justify-center gap-2 bg-grey-light text-charcoal hover:opacity-90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Back to Character DNA
        </button>

        <button
          onClick={onNext}
          disabled={!isValid}
          className={`w-full sm:w-auto px-8 py-4 rounded-[8px] font-semibold text-base transition-all flex items-center justify-center gap-2 ${
            isValid
              ? "bg-gold text-charcoal hover:opacity-90 hover:scale-105 shadow-lg"
              : "bg-grey-light text-grey cursor-not-allowed"
          }`}
        >
          Continue to Step 4
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
