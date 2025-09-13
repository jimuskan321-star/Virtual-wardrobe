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

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<ImageData | null>(null);
  const [clothingImage, setClothingImage] = useState<ImageData | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (file: File, type: 'person' | 'clothing') => {
    setError(null); // Clear previous errors on new upload attempt

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError(`Unsupported file type. Please upload a JPEG, PNG, or WebP image.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Please upload an image smaller than ${MAX_FILE_SIZE_MB}MB.`);
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
      setError('Failed to process image locally. The file might be corrupted. Please try another file.');
      console.error(err);
    }
  };

  const handleTryOn = useCallback(async () => {
    if (!personImage || !clothingImage) {
      setError('Please upload both an image of a person and an item of clothing.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);

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
  
  const isTryOnDisabled = !personImage || !clothingImage || isLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Section */}
          <div className="space-y-8">
            <div className="bg-surface p-6 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-text-primary mb-4 text-center">Step 1: Choose Images</h2>
              <p className="text-center text-text-secondary mb-6">Upload a photo of a person and an item of clothing.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUploader
                  id="person-uploader"
                  title="Person"
                  onImageUpload={(file) => handleImageUpload(file, 'person')}
                  imagePreview={personImage?.preview}
                />
                <ImageUploader
                  id="clothing-uploader"
                  title="Clothing"
                  onImageUpload={(file) => handleImageUpload(file, 'clothing')}
                  imagePreview={clothingImage?.preview}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleTryOn}
                disabled={isTryOnDisabled}
                className="w-full md:w-auto px-12 py-4 bg-primary text-background font-bold text-lg rounded-xl hover:bg-primary-hover disabled:bg-slate-700 disabled:text-text-secondary disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? 'Generating...' : 'Virtual Try-On'}
              </button>
            </div>
          </div>
          
          {/* Output Section */}
          <div className="bg-surface p-6 rounded-2xl border border-slate-700 flex flex-col">
            <h2 className="text-2xl font-bold text-text-primary mb-4 text-center">Step 2: See the Result</h2>
            <div className="flex-grow">
               <ResultDisplay
                  resultImage={resultImage}
                  isLoading={isLoading}
                  error={error}
                  initialPersonImage={personImage?.preview}
                />
            </div>
          </div>

        </div>
      </main>
      <footer className="text-center p-4 text-text-secondary text-sm">
        <p>Powered by Gemini's Nano Banana model. Built by Harsh.</p>
      </footer>
    </div>
  );
};

export default App;