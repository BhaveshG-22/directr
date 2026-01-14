"use client";

import { useState } from "react";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { Scene, PipelineState } from "../types";
import Step1SceneSelection from "./Step1SceneSelection";
import Step2CharacterDNA from "./Step2CharacterDNA";

interface PhotoshootPipelineProps {
  scenes: Scene[];
}

export default function PhotoshootPipeline({ scenes }: PhotoshootPipelineProps) {
  const { isSignedIn, isLoaded } = useUser();
  const [state, setState] = useState<PipelineState>({
    currentStep: 1,
    selectedScene: null,
    uploadedImages: [],
    characterId: null,
    characterName: null,
  });

  const updateState = (updates: Partial<PipelineState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <Step1SceneSelection
            scenes={scenes}
            selectedScene={state.selectedScene}
            uploadedImages={state.uploadedImages}
            onSceneSelect={(scene) => updateState({ selectedScene: scene })}
            onImagesUpload={(images) => updateState({ uploadedImages: images })}
            onNext={() => updateState({ currentStep: 2 })}
          />
        );
      case 2:
        return (
          <Step2CharacterDNA
            uploadedImages={state.uploadedImages}
            onCharacterCreated={(characterId, characterName) =>
              updateState({ characterId, characterName })
            }
            onBack={() => updateState({ currentStep: 1 })}
            onNext={() => updateState({ currentStep: 3 })}
          />
        );
      default:
        return <div>Step {state.currentStep} - Coming soon...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Header Section */}
      <div className="bg-charcoal text-cream py-12 px-4 sm:px-6 lg:px-8 border-b border-grey-dark">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3" style={{ letterSpacing: '-0.02em' }}>
                Virtual Photoshoot Generator
              </h1>
              <p className="text-base sm:text-lg opacity-70">
                Create stunning professional photos in 6 simple steps
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isLoaded && (
                <>
                  {isSignedIn ? (
                    <UserButton />
                  ) : (
                    <SignInButton mode="modal">
                      <button className="px-6 py-2 bg-gold text-charcoal font-semibold rounded-lg hover:bg-gold/90 transition-colors">
                        Sign In
                      </button>
                    </SignInButton>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isLoaded && !isSignedIn && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Authentication Gate */}
          <div className="w-full max-w-2xl mx-auto bg-white rounded-[12px] p-8 sm:p-12 border-2 border-grey-light text-center">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-3">Sign In Required</h2>
            <p className="text-grey mb-6 max-w-lg mx-auto">
              Please sign in to access the Virtual Photoshoot Generator and create stunning AI-generated photos.
            </p>
            <SignInButton mode="modal">
              <button className="px-8 py-3 bg-gold text-charcoal font-semibold rounded-lg hover:bg-gold/90 transition-colors inline-flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In to Continue
              </button>
            </SignInButton>
          </div>
        </div>
      )}

      {isLoaded && isSignedIn && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex justify-between items-start mb-6">
              {[1, 2, 3, 4, 5, 6].map((step, index) => (
                <div key={step} className="flex flex-col items-center flex-1 relative">
                  {index < 5 && (
                    <div className="absolute top-5 left-[50%] w-full h-0.5 bg-grey-light">
                      <div
                        className="h-full bg-gold transition-all duration-500"
                        style={{
                          width: step < state.currentStep ? '100%' : '0%'
                        }}
                      />
                    </div>
                  )}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      step === state.currentStep
                        ? "bg-gold text-charcoal shadow-lg"
                        : step < state.currentStep
                        ? "bg-sage text-white"
                        : "bg-grey-light text-grey"
                    }`}
                  >
                    {step < state.currentStep ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  <div className={`text-xs mt-3 font-medium ${
                    step === state.currentStep ? "text-gold" : "text-grey"
                  }`}>
                    Step {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Step Content */}
          <div className="bg-cream rounded-[12px] p-6 sm:p-8 lg:p-10" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            {renderStep()}
          </div>
        </div>
      )}
    </div>
  );
}
