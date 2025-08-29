import React from 'react';

interface ResultDisplayProps {
  resultImage: string | null;
  isLoading: boolean;
  error: string | null;
  initialPersonImage?: string | null;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
    <p className="text-lg font-semibold text-text-primary">AI is working its magic...</p>
    <p className="text-sm text-text-secondary mt-2">This may take a moment. Please wait.</p>
  </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-4 text-lg font-semibold text-red-300">Oops! Something went wrong.</p>
        <p className="text-red-400 mt-1 text-center">{message}</p>
    </div>
);

const Placeholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center bg-background border-2 border-dashed border-slate-700 rounded-lg p-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
        </svg>
        <p className="mt-4 text-lg font-semibold text-text-secondary">Your generated image will appear here.</p>
        <p className="text-sm text-slate-500 mt-1">Upload images and click "Virtual Try-On".</p>
    </div>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ resultImage, isLoading, error, initialPersonImage }) => {
  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'virtual-wardrobe-result.jpeg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!resultImage) return;
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const file = new File([blob], 'virtual-wardrobe-result.jpeg', { type: 'image/jpeg' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Virtual Wardrobe Creation',
          text: 'Check out this outfit I tried on virtually!',
          files: [file],
        });
      } else {
        alert('Sharing is not supported on your browser, but you can download the image!');
      }
    } catch (err) {
      console.error('Sharing failed:', err);
      alert('Could not share the image.');
    }
  };
  
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const renderContent = () => {
    if (isLoading) {
      return (
         <div className="relative w-full aspect-square rounded-lg overflow-hidden">
            {initialPersonImage && <img src={initialPersonImage} alt="Person" className="w-full h-full object-cover filter blur-md opacity-50" />}
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
              <LoadingSpinner />
            </div>
         </div>
      );
    }
    if (error) {
      return <ErrorDisplay message={error} />;
    }
    if (resultImage) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <div className="flex-grow w-full flex items-center justify-center overflow-hidden">
            <img src={resultImage} alt="Virtual try-on result" className="max-h-full max-w-full object-contain rounded-lg border border-slate-700" />
          </div>
          <div className="flex-shrink-0 flex items-center gap-4">
            <button
              onClick={handleDownload}
              className="px-8 py-3 bg-primary text-background font-bold rounded-lg hover:bg-primary-hover transition-all duration-300 transform hover:scale-105"
            >
              Download JPEG
            </button>
            {canShare && (
              <button
                onClick={handleShare}
                className="px-8 py-3 bg-slate-600 text-text-primary font-bold rounded-lg hover:bg-slate-500 transition-all duration-300 transform hover:scale-105"
              >
                Share
              </button>
            )}
          </div>
        </div>
      );
    }
    return <Placeholder />;
  };

  return (
    <div className="w-full h-full min-h-[300px] md:min-h-[400px] lg:aspect-square flex justify-center items-center">
      {renderContent()}
    </div>
  );
};