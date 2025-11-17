
import React from 'react';
import { LanguageOption } from '../types';
import { LANGUAGES } from '../constants';

interface LanguageSelectorProps {
  label: string;
  selectedLanguage: LanguageOption;
  onLanguageChange: (language: LanguageOption) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ label, selectedLanguage, onLanguageChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = LANGUAGES.find(l => l.code === e.target.value);
    if (lang) {
      onLanguageChange(lang);
    }
  };

  return (
    <div className="w-full">
      <label htmlFor={label} className="block mb-2 text-sm font-medium text-gray-400">{label}</label>
      <select
        id={label}
        value={selectedLanguage.code}
        onChange={handleChange}
        className="w-full p-3 bg-gray-700 border border-gray-600 text-white text-md rounded-lg focus:ring-purple-500 focus:border-purple-500 block"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};
