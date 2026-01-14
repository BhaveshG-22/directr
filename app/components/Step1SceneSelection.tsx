"use client";

import { useState, ChangeEvent } from "react";
import { Scene, UploadedImage } from "../types";

interface Step1SceneSelectionProps {
  scenes: Scene[];
  selectedScene: Scene | null;
  uploadedImages: UploadedImage[];
  onSceneSelect: (scene: Scene) => void;
  onImagesUpload: (images: UploadedImage[]) => void;
  onNext: () => void;
}

export default function Step1SceneSelection({
  scenes,
  selectedScene,
  uploadedImages,
  onSceneSelect,
  onImagesUpload,
  onNext,
}: Step1SceneSelectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');

  const handleSceneChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const scene = scenes.find((s) => s.uuid === e.target.value);
    if (scene) {
      onSceneSelect(scene);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== files.length) {
      alert("Please upload only image files (JPEG, PNG, WebP)");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setTotalFiles(validFiles.length);
    setCurrentUploadIndex(0);

    try {
      // Upload files directly to S3 using presigned URLs
      const newUploadedFiles: UploadedImage[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setCurrentUploadIndex(i + 1);
        setCurrentFileName(file.name);
        setUploadProgress(Math.round(((i) / validFiles.length) * 100));

        // 1. Get presigned URL from our API
        const presignedResponse = await fetch('/api/upload/presigned-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        });

        if (!presignedResponse.ok) {
          const error = await presignedResponse.json();
          throw new Error(error.error || 'Failed to get upload URL');
        }

        const { presignedUrl, publicUrl } = await presignedResponse.json();

        // 2. Upload file directly to S3 using presigned URL
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        // 3. Add file metadata to array
        newUploadedFiles.push({
          url: publicUrl,
          filename: file.name,
          size: file.size,
          type: file.type,
        });
      }

      // Combine with existing images
      const allImages = [...uploadedImages, ...newUploadedFiles];
      onImagesUpload(allImages);

      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    onImagesUpload(newImages);
  };

  const isValid = selectedScene !== null && uploadedImages.length >= 10;
  const imageCount = uploadedImages.length;

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="border-b border-grey-light pb-4 sm:pb-6">
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
            <span className="text-xl sm:text-2xl font-bold text-charcoal">1</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal" style={{ letterSpacing: '-0.01em' }}>
            Setup Your Photoshoot
          </h2>
        </div>
        <p className="text-grey text-sm sm:text-base ml-0 sm:ml-[60px]">
          Select your desired scene and upload at least 10 high-quality images to get started
        </p>
      </div>

      {/* Scene Selection */}
      <div className="bg-white rounded-[12px] p-4 sm:p-6 border-2 border-grey-light">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-4 h-4 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <label
              htmlFor="scene-select"
              className="block text-base font-semibold text-charcoal mb-2"
            >
              Select Photoshoot Scene
            </label>
            <select
              id="scene-select"
              value={selectedScene?.uuid || ""}
              onChange={handleSceneChange}
              className="w-full px-4 py-3 border-2 border-grey-light rounded-[8px] focus:ring-2 focus:ring-gold focus:border-gold transition-all text-charcoal bg-white text-base"
            >
              <option value="">Choose a scene...</option>
              {scenes.map((scene) => (
                <option key={scene.uuid} value={scene.uuid}>
                  {scene.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        {selectedScene && (
          <div className="mt-4 p-5 bg-cream rounded-[8px] border-l-4 border-gold">
            <div className="flex items-start gap-2 mb-2">
              <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider" style={{ letterSpacing: '0.05em' }}>
                  Scene Details
                </p>
                <p className="text-sm text-grey leading-relaxed">{selectedScene.detailedPrompt}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Upload */}
      <div className="bg-white rounded-[12px] p-4 sm:p-6 border-2 border-grey-light">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-4 h-4 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-base font-semibold text-charcoal">
                Upload Your Images
              </label>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                imageCount >= 10 ? "bg-sage text-white" : "bg-grey-light text-grey"
              }`}>
                {imageCount}/10 minimum
              </span>
            </div>

            <div className={`border-2 border-dashed border-grey-light rounded-[8px] p-6 sm:p-8 lg:p-10 text-center hover:border-gold hover:bg-cream transition-all bg-white ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center ${isUploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gold"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-base text-charcoal font-semibold mb-1">
                  {isUploading ? 'Uploading to S3...' : 'Click to upload or drag and drop'}
                </span>
                <span className="text-sm text-grey">
                  {isUploading ? 'Please wait while we upload your images' : 'High-quality images for best facial feature reflection'}
                </span>
              </label>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4 p-4 bg-blue/10 rounded-[8px] border border-blue/20">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-blue animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-blue mb-1">
                      Uploading {currentUploadIndex} of {totalFiles} images...
                    </div>
                    <div className="text-xs text-grey truncate">
                      {currentFileName}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-grey-light rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Image Count Status */}
            {imageCount > 0 && (
              <div className="mt-4 p-4 bg-cream rounded-[8px]">
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    {imageCount >= 10 ? (
                      <svg className="w-5 h-5 text-sage" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className={imageCount >= 10 ? "text-sage font-semibold" : "text-charcoal font-semibold"}>
                      {imageCount >= 10
                        ? `${imageCount} images uploaded - Ready to proceed!`
                        : `${10 - imageCount} more image${10 - imageCount !== 1 ? 's' : ''} needed`}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-grey-light rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      imageCount >= 10 ? "bg-sage" : "bg-gold"
                    }`}
                    style={{ width: `${Math.min((imageCount / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Image Preview Grid */}
            {uploadedImages.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                    <span className="text-xs font-bold text-charcoal">{imageCount}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider" style={{ letterSpacing: '0.05em' }}>
                    Uploaded Images
                  </h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {uploadedImages.map((image, index) => (
                    <div
                      key={image.url}
                      className="relative aspect-square group rounded-[8px] overflow-hidden border-2 border-grey-light hover:border-gold transition-all"
                      style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: '#f5f5f5' }}
                    >
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        onLoad={(e) => {
                          console.log('Image loaded:', image.url);
                          e.currentTarget.style.opacity = '1';
                        }}
                        onError={(e) => {
                          console.error('Image failed to load:', image.url, e);
                          e.currentTarget.style.display = 'none';
                        }}
                        style={{ opacity: 0, transition: 'opacity 0.3s' }}
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-coral text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                        aria-label="Remove image"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t-2 border-grey-light">
        <div className="flex-1">
          {!isValid && (selectedScene || imageCount > 0) && (
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-coral flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-coral">
                  {!selectedScene && "Please select a scene"}
                  {selectedScene && imageCount < 10 && "Upload at least 10 images to continue"}
                  {!selectedScene && imageCount < 10 && ""}
                </p>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`w-full sm:w-auto px-8 py-4 rounded-[8px] font-semibold text-base transition-all flex items-center justify-center gap-2 ${
            isValid
              ? "bg-gold text-charcoal hover:opacity-90 hover:scale-105 shadow-lg"
              : "bg-grey-light text-grey cursor-not-allowed"
          }`}
        >
          Continue to Step 2
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
