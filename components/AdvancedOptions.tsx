import React, { useState } from 'react';

interface OptionProps<T> {
  label: string;
  options: T[];
  selectedValue: T;
  onValueChange: (value: T) => void;
}

const OptionSelector = <T extends string>({ label, options, selectedValue, onValueChange }: OptionProps<T>) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
    <div className="flex bg-gray-700/50 rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onValueChange(option)}
          className={`w-full px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none ${
            selectedValue === option
              ? 'bg-purple-600 text-white shadow'
              : 'text-gray-300 hover:bg-gray-600/50'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);


interface AdvancedOptionsProps {
  liveliness: 'Subtle' | 'Natural' | 'Vivid';
  setLiveliness: (value: 'Subtle' | 'Natural' | 'Vivid') => void;
  emotionality: 'Subtle' | 'Expressive' | 'Intense';
  setEmotionality: (value: 'Subtle' | 'Expressive' | 'Intense') => void;
  risqueLevel: 'Suggestive' | 'Explicit' | 'Very Explicit';
  setRisqueLevel: (value: 'Suggestive' | 'Explicit' | 'Very Explicit') => void;
  keywordsToEmphasize: string;
  setKeywordsToEmphasize: (value: string) => void;
  keywordsToAvoid: string;
  setKeywordsToAvoid: (value: string) => void;
}

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  liveliness,
  setLiveliness,
  emotionality,
  setEmotionality,
  risqueLevel,
  setRisqueLevel,
  keywordsToEmphasize,
  setKeywordsToEmphasize,
  keywordsToAvoid,
  setKeywordsToAvoid,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-200"
        aria-expanded={isOpen}
      >
        <span>Advanced Translation Options</span>
        <ChevronIcon isOpen={isOpen} />
      </button>
      {isOpen && (
        <div className="mt-6 space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <OptionSelector
                label="Liveliness"
                options={['Subtle', 'Natural', 'Vivid']}
                selectedValue={liveliness}
                onValueChange={setLiveliness}
            />
            <OptionSelector
                label="Emotionality"
                options={['Subtle', 'Expressive', 'Intense']}
                selectedValue={emotionality}
                onValueChange={setEmotionality}
            />
            <OptionSelector
                label="Risqué Level"
                options={['Suggestive', 'Explicit', 'Very Explicit']}
                selectedValue={risqueLevel}
                onValueChange={setRisqueLevel}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="emphasize" className="block text-sm font-medium text-gray-400 mb-2">Keywords to Emphasize</label>
              <input
                type="text"
                id="emphasize"
                value={keywordsToEmphasize}
                onChange={(e) => setKeywordsToEmphasize(e.target.value)}
                placeholder="e.g., passion, desire"
                className="w-full p-3 bg-gray-700 border border-gray-600 text-white text-md rounded-lg focus:ring-purple-500 focus:border-purple-500 block"
              />
            </div>
            <div>
              <label htmlFor="avoid" className="block text-sm font-medium text-gray-400 mb-2">Keywords to Avoid</label>
              <input
                type="text"
                id="avoid"
                value={keywordsToAvoid}
                onChange={(e) => setKeywordsToAvoid(e.target.value)}
                placeholder="e.g., formal words"
                className="w-full p-3 bg-gray-700 border border-gray-600 text-white text-md rounded-lg focus:ring-purple-500 focus:border-purple-500 block"
              />
            </div>
          </div>
        </div>
      )}
      <style>{`
        .animate-fade-in {
            animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const ChevronIcon: React.FC<{isOpen: boolean}> = ({ isOpen }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
)
