import React from 'react';

interface ImageUploaderProps {
  id: string;
  title: string;
  onImageUpload: (file: File) => void;
  imagePreview: string | null;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, onImageUpload, imagePreview }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageUpload(event.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <h3 className="text-lg font-semibold text-text-secondary">{title}</h3>
      <label htmlFor={id} className="cursor-pointer w-full aspect-square border-2 border-dashed border-slate-600 rounded-lg flex flex-col justify-center items-center text-center p-4 hover:border-primary hover:bg-slate-700/50 transition-colors">
        {imagePreview ? (
          <img src={imagePreview} alt={`${title} preview`} className="max-h-full max-w-full object-contain rounded-md" />
        ) : (
          <div className="flex flex-col items-center">
            <UploadIcon/>
            <span className="mt-2 text-sm text-text-secondary">Click to upload</span>
          </div>
        )}
      </label>
      <input
        id={id}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};