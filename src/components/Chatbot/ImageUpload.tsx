import React, { useRef } from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="glass-button p-2 rounded-lg flex items-center space-x-2"
        title="Upload image"
      >
        <Upload className="w-5 h-5" />
      </button>
    </div>
  );
};