"use client";

import { useState, ChangeEvent } from "react";
import { UploadedImage } from "../types";

interface Step2CharacterDNAProps {
  uploadedImages: UploadedImage[];
  onCharacterCreated: (characterId: string, characterName: string, characterDNAString: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step2CharacterDNA({
  uploadedImages,
  onCharacterCreated,
  onBack,
  onNext,
}: Step2CharacterDNAProps) {
  const [characterName, setCharacterName] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateDNA = async () => {
    if (!characterName.trim()) {
      setError("Please enter a character name");
      return;
    }

    if (uploadedImages.length === 0) {
      setError("No images uploaded. Please go back and upload images.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => Math.min(prev + 5, 90));
      }, 200);

      // Extract image URLs
      const imageUrls = uploadedImages.map((img) => img.url);

      // Call the DNA generation API
      const response = await fetch("/api/character-dna/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: characterName,
          imageUrls,
          description: description || undefined,
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate Character DNA");
      }

      const data = await response.json();
      setCharacterId(data.characterId);
      onCharacterCreated(data.characterId, characterName, data.characterDNASummary || "");
    } catch (err) {
      console.error("DNA generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate Character DNA");
      setGenerationProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const isValid = characterId !== null;

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="border-b border-grey-light pb-4 sm:pb-6">
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
            <span className="text-xl sm:text-2xl font-bold text-charcoal">2</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal" style={{ letterSpacing: "-0.01em" }}>
            Generate Character DNA
          </h2>
        </div>
        <p className="text-grey text-sm sm:text-base ml-0 sm:ml-[60px]">
          AI will analyze your uploaded images to create a detailed character profile for consistent results
        </p>
      </div>

      {/* Uploaded Images Preview */}
      <div className="bg-white rounded-[12px] p-4 sm:p-6 border-2 border-grey-light">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-4 h-4 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-charcoal mb-2">Reference Images</h3>
            <p className="text-sm text-grey mb-4">
              {uploadedImages.length} image{uploadedImages.length !== 1 ? "s" : ""} ready for analysis
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {uploadedImages.slice(0, 12).map((image, index) => (
                <div
                  key={image.url}
                  className="aspect-square rounded-lg overflow-hidden border-2 border-grey-light"
                >
                  <img
                    src={image.url}
                    alt={`Reference ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {uploadedImages.length > 12 && (
                <div className="aspect-square rounded-lg bg-grey-light flex items-center justify-center border-2 border-grey-light">
                  <span className="text-xs font-semibold text-grey">+{uploadedImages.length - 12}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Character Details Form */}
      <div className="bg-white rounded-[12px] p-4 sm:p-6 border-2 border-grey-light">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-4 h-4 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <label htmlFor="character-name" className="block text-base font-semibold text-charcoal mb-2">
              Character Name
            </label>
            <input
              id="character-name"
              type="text"
              value={characterName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCharacterName(e.target.value)}
              placeholder="e.g., Alex, Sarah, John..."
              disabled={isGenerating || characterId !== null}
              className="w-full px-4 py-3 border-2 border-grey-light rounded-[8px] focus:ring-2 focus:ring-gold focus:border-gold transition-all text-charcoal bg-white text-base disabled:bg-grey-light disabled:cursor-not-allowed"
            />

            <label htmlFor="character-description" className="block text-base font-semibold text-charcoal mb-2 mt-4">
              Description (Optional)
            </label>
            <textarea
              id="character-description"
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Brief description of the character..."
              disabled={isGenerating || characterId !== null}
              rows={3}
              className="w-full px-4 py-3 border-2 border-grey-light rounded-[8px] focus:ring-2 focus:ring-gold focus:border-gold transition-all text-charcoal bg-white text-base disabled:bg-grey-light disabled:cursor-not-allowed"
            />

            {!characterId && (
              <button
                onClick={handleGenerateDNA}
                disabled={isGenerating || !characterName.trim()}
                className={`mt-4 w-full px-6 py-4 rounded-[8px] font-semibold text-base transition-all flex items-center justify-center gap-2 ${
                  isGenerating || !characterName.trim()
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
                    Analyzing Images with AI...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Character DNA
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
                  AI is analyzing facial features...
                </div>
                <div className="text-xs text-grey">
                  This may take 5-10 seconds
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

        {/* Success Message */}
        {characterId && (
          <div className="mt-4 p-4 bg-sage/10 rounded-[8px] border border-sage/20">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-sage mb-1">Character DNA Generated Successfully!</p>
                <p className="text-xs text-grey">
                  Your character profile "{characterName}" has been created and saved. AI has analyzed facial features, hair, skin tone, and other unique characteristics.
                </p>
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
          Back to Images
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
          Continue to Step 3
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
