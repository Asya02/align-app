import React, { useRef } from 'react';

interface FileUploadButtonProps {
  fileName: string | null;
  onFileSelect: (file: File | null) => void;
}

export const FileUploadButton = ({ fileName, onFileSelect }: FileUploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <input 
        ref={fileInputRef}
        type="file" 
        accept=".csv" 
        onChange={handleChange} 
        style={{display: 'none'}}
      />
      <button 
        onClick={handleClick}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
      >
        {fileName || 'Choose CSV file'}
      </button>
    </>
  );
};

interface ButtonProps {
  onClick: () => void;
}

export const DownloadButton = ({ onClick }: ButtonProps) => (
  <button
    onClick={onClick}
    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
  >
    Download Data
  </button>
);

export const DeleteButton = ({ onClick }: ButtonProps) => (
  <button
    onClick={onClick}
    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
  >
    Delete Data
  </button>
);
