
"use client";

import { useState } from "react";
import { UploadedImage } from "../types";

interface Step4BestSelectionProps {
  uploadedImages: UploadedImage[];
  onBestImageSelected: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step4BestSelection({
  uploadedImages,
  onBestImageSelected,
  onBack,
  onNext,
}: Step4BestSelectionProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectionReason, setSelectionReason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIdentifyBestImage = async () => {
    setIsSelecting(true);
    setError(null);
    setSelectedIndex(null);
    setSelectionReason(null);

    try {
      const response = await fetch("/api/identify-best-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrls: uploadedImages.map((img) => img.url),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to identify the best image");
      }

      const data = await response.json();
      setSelectedIndex(data.selected_index);
      setSelectionReason(data.reasoning);
      onBestImageSelected(data.selected_index);
      
      // Store the best selection in a separate field in User table, similar to step 3?
      // Or simply pass it along. The prompt asks "where is that img stored".
      // Currently it's just returned to frontend. 
      // Let's add functionality to the API to store it in the user's record if we have the user context.
      
    } catch (err) {
      console.error("Image selection error:", err);
      setError(err instanceof Error ? err.message : "Failed to identify the best image");
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="border-b border-grey-light pb-4 sm:pb-6">
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
            <span className="text-xl sm:text-2xl font-bold text-charcoal">4</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal" style={{ letterSpacing: "-0.01em" }}>
            AI Selection
          </h2>
        </div>
        <p className="text-grey text-sm sm:text-base ml-0 sm:ml-[60px]">
          Let AI identify the best image from your uploads to use as the primary reference.
        </p>
      </div>

      <div className="bg-white rounded-[12px] p-4 sm:p-6 border-2 border-grey-light">
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0 mt-1">
                 <svg className="w-4 h-4 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                 </svg>
            </div>
             <div className="flex-1">
                 <h3 className="text-base font-semibold text-charcoal mb-2">Smart Selection</h3>
                 <p className="text-sm text-grey mb-4">
                   We analyze your uploaded photos to find the one with the best lighting, clarity, and facial visibility for generating your photoshoot.
                 </p>

                 {selectedIndex === null && (
                   <button
                     onClick={handleIdentifyBestImage}
                     disabled={isSelecting}
                     className={`w-full px-6 py-4 rounded-[8px] font-semibold text-base transition-all flex items-center justify-center gap-2 ${
                       isSelecting
                         ? "bg-grey-light text-grey cursor-not-allowed"
                         : "bg-blue text-white hover:opacity-90 hover:scale-105 shadow-lg"
                     }`}
                   >
                     {isSelecting ? (
                        <>
                         <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                         </svg>
                         Analyzing Photos...
                        </>
                     ) : (
                        <>
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                         </svg>
                         Identify Best Photo
                        </>
                     )}
                   </button>
                 )}
             </div>
        </div>

        {selectedIndex !== null && (
          <div className="mt-6">
             <h4 className="text-sm font-semibold text-charcoal mb-3">Selected Image:</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="aspect-square bg-grey-dark rounded-lg overflow-hidden border-2 border-gold relative">
                    <img
                      src={uploadedImages[selectedIndex].url}
                      alt="Best selection"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-gold text-charcoal text-xs font-bold px-2 py-1 rounded">
                       Best Match
                    </div>
                 </div>
                 <div className="bg-sage/10 p-4 rounded-lg border border-sage/20">
                    <h5 className="font-semibold text-sage mb-2">Why this one?</h5>
                    <p className="text-sm text-charcoal">{selectionReason}</p>
                 </div>
             </div>
          </div>
        )}

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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t-2 border-grey-light">
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-8 py-4 rounded-[8px] font-semibold text-base transition-all flex items-center justify-center gap-2 bg-grey-light text-charcoal hover:opacity-90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Back to Portrait
        </button>

        <button
          onClick={onNext}
          disabled={selectedIndex === null}
          className={`w-full sm:w-auto px-8 py-4 rounded-[8px] font-semibold text-base transition-all flex items-center justify-center gap-2 ${
            selectedIndex !== null
              ? "bg-gold text-charcoal hover:opacity-90 hover:scale-105 shadow-lg"
              : "bg-grey-light text-grey cursor-not-allowed"
          }`}
        >
          Continue to Step 5
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
