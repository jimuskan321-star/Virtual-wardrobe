import React from 'react';
import { SAMPLE_PEOPLE, SAMPLE_CLOTHING } from '../constants';
import { urlToFile } from '../utils/fileUtils';

interface SampleImagesProps {
  onImageSelect: (file: File, type: 'person' | 'clothing') => void;
}

const SampleImage: React.FC<{ src: string, alt: string, onClick: () => void }> = ({ src, alt, onClick }) => (
    <div className="aspect-square cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-primary hover:scale-105 transition-all duration-300" onClick={onClick}>
        <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
    </div>
);


export const SampleImages: React.FC<SampleImagesProps> = ({ onImageSelect }) => {
  const handleSelect = async (url: string, type: 'person' | 'clothing') => {
    try {
      const file = await urlToFile(url, `sample-${type}-${Date.now()}.jpg`, 'image/jpeg');
      onImageSelect(file, type);
    } catch (error) {
      console.error('Failed to load sample image:', error);
      alert('Could not load the sample image. Please try another one.');
    }
  };

  return (
    <div className="bg-surface p-6 rounded-2xl border border-slate-200">
      <h3 className="text-xl font-bold text-text-primary mb-4 text-center">Or Use Samples</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-text-secondary mb-2">People</h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {SAMPLE_PEOPLE.map((url, index) => (
              <SampleImage key={`person-${index}`} src={url} alt={`Sample person ${index + 1}`} onClick={() => handleSelect(url, 'person')} />
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-text-secondary mb-2">Clothing</h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {SAMPLE_CLOTHING.map((url, index) => (
              <SampleImage key={`clothing-${index}`} src={url} alt={`Sample clothing ${index + 1}`} onClick={() => handleSelect(url, 'clothing')} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};