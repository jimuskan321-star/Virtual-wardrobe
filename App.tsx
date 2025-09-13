import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { virtualTryOn } from './services/geminiService';
import type { ImageData } from './types';
import { fileToGenerativePart } from './utils/fileUtils';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type View = 'upload' | 'result';

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<ImageData | null>(null);
  const [clothingImage, setClothingImage] = useState<ImageData | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('upload');
  
  const [uploadError, setUploadError] = useState<string | null>(null);


  const handleImageUpload = async (file: File, type: 'person' | 'clothing') => {
    setUploadError(null); 

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setUploadError(`Unsupported file type. Please upload a JPEG, PNG, or WebP image.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(`File is too large. Please upload an image smaller than ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    try {
      const generativePart = await fileToGenerativePart(file);
      const imageData = {
        file,
        preview: URL.createObjectURL(file),
        generativePart,
      };
      if (type === 'person') {
        setPersonImage(imageData);
      } else {
        setClothingImage(imageData);
      }
    } catch (err) {
      setUploadError('Failed to process image locally. The file might be corrupted. Please try another file.');
      console.error(err);
    }
  };

  const handleTryOn = useCallback(async () => {
    if (!personImage || !clothingImage) {
      setUploadError('Please upload both an image of a person and an item of clothing.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);
    setView('result');

    try {
      const generatedImage = await virtualTryOn(personImage.generativePart, clothingImage.generativePart);
      if (generatedImage) {
        setResultImage(`data:image/jpeg;base64,${generatedImage}`);
      } else {
        setError('The AI could not generate an image. Please try again with different images.');
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during AI generation. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [personImage, clothingImage]);
  
  const handleGoBack = () => {
    setView('upload');
    setError(null);
    setResultImage(null);
    setPersonImage(null);
    setClothingImage(null);
  };

  const isTryOnDisabled = !personImage || !clothingImage || isLoading;
  
  const renderContent = () => {
    switch (view) {
      case 'upload':
        return (
          <div className="w-full max-w-2xl space-y-8">
            <div className="bg-surface p-6 rounded-2xl border border-slate-200 space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2 text-center">Step 1: Upload Your Photo</h2>
                    <p className="text-center text-text-secondary mb-6">Provide a clear, front-facing photo of the person.</p>
                    <ImageUploader
                        id="person-uploader"
                        title="Person"
                        onImageUpload={(file) => handleImageUpload(file, 'person')}
                        imagePreview={personImage?.preview}
                    />
                </div>
                <hr className="border-slate-200" />
                <div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2 text-center">Step 2: Choose Clothes</h2>
                    <p className="text-center text-text-secondary mb-6">Provide a photo of the clothing item.</p>
                    <ImageUploader
                        id="clothing-uploader"
                        title="Clothing"
                        onImageUpload={(file) => handleImageUpload(file, 'clothing')}
                        imagePreview={clothingImage?.preview}
                    />
                </div>
            </div>
            
            {uploadError && (
              <div className="text-center text-red-600 bg-red-100 p-3 rounded-lg border border-red-200">{uploadError}</div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleTryOn}
                disabled={isTryOnDisabled}
                className="w-full md:w-auto px-12 py-4 bg-primary text-on-primary font-bold text-lg rounded-xl hover:bg-primary-hover disabled:bg-slate-200 disabled:text-text-secondary disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  'Try This'
                )}
              </button>
            </div>
          </div>
        );
      case 'result':
        return (
            <div className="w-full max-w-2xl flex flex-col items-center space-y-6">
                <h2 className="text-3xl font-bold text-text-primary">Your Result</h2>
                <ResultDisplay
                    resultImage={resultImage}
                    isLoading={isLoading}
                    error={error}
                    initialPersonImage={personImage?.preview}
                />
                <button
                    onClick={handleGoBack}
                    className="px-8 py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-700 transition-all"
                >
                    Try Another
                </button>
            </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-text-secondary">
          <p>Powered by Nano Banana</p>
          <p>Built by Harsh</p>
      </footer>
    </div>
  );
};

export default App;