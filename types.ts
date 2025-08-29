

// FIX: Replaced non-existent 'GenerativePart' with a local 'ImagePart' type definition.
// This defines the structure for an image part of a prompt.
export type ImagePart = {
    inlineData: {
        mimeType: string;
        data: string;
    };
};

export interface ImageData {
  file: File;
  preview: string;
  generativePart: ImagePart;
}
