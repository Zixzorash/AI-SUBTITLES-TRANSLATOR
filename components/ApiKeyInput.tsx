
import React, { useState } from 'react';

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, onApiKeyChange }) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <div>
      <label htmlFor="api-key" className="block mb-2 text-sm font-medium text-gray-400">
        Gemini API Key
      </label>
      <div className="relative">
        <input
          id="api-key"
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="Enter your API key"
          className="w-full p-3 pr-10 bg-gray-700 border border-gray-600 text-white text-md rounded-lg focus:ring-purple-500 focus:border-purple-500 block"
        />
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-200"
          aria-label={showKey ? 'Hide API key' : 'Show API key'}
        >
          {showKey ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Your API key is stored locally in your browser. Get your key from{' '}
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
          Google AI Studio
        </a>.
      </p>
    </div>
  );
};

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .946-3.118 3.55-5.604 6.81-6.62M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
    </svg>
);
