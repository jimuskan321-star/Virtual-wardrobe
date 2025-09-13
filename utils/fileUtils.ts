import type { ImagePart } from "../types";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // result is "data:mime/type;base64,the-actual-base64-string"
      // we only want the base64 part
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
}

export async function fileToGenerativePart(file: File): Promise<ImagePart> {
  const base64EncodedData = await fileToBase64(file);
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

// FIX: Added the missing 'urlToFile' function to convert image URLs into File objects.
export async function urlToFile(url: string, filename: string, mimeType: string): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: mimeType });
}
