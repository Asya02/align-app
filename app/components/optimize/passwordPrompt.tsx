import React, { useState, useRef } from 'react';

interface PasswordPromptProps {
  onConfirm: (password: string) => Promise<boolean>;
  onCancel: () => void;
}

export const PasswordPrompt = ({ onConfirm, onCancel }: PasswordPromptProps) => {
  const [errorMessage, setErrorMessage] = useState('');
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleConfirm = async () => {
    const password = passwordRef.current?.value || '';
    const isSuccess = await onConfirm(password);
    if (!isSuccess) {
      setErrorMessage('Incorrect password!');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Enter Password to Clear Optimizations</h2>
        <p className="text-sm mb-4">
          Hint: It&apos;s the Twitter handle of the person who made this.
        </p>
        <input
          type="password"
          ref={passwordRef}
          onKeyDown={handleKeyDown}
          className="border border-gray-300 rounded px-3 py-2 mb-4 w-full"
          placeholder="Enter password"
        />
        {errorMessage && (
          <p className="font-bold text-red-500 mb-4 text-center">{errorMessage}</p>
        )}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};
