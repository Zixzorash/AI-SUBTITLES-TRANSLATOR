import React from 'react';

type Format = 'vtt' | 'srt' | 'txt';

interface OutputFormatSelectorProps {
  selectedFormat: Format;
  onFormatChange: (format: Format) => void;
}

export const OutputFormatSelector: React.FC<OutputFormatSelectorProps> = ({ selectedFormat, onFormatChange }) => {
  const formats: Format[] = ['vtt', 'srt', 'txt'];

  const getButtonClass = (format: Format) => {
    const baseClass = "px-6 py-2.5 font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800";
    if (format === selectedFormat) {
      return `${baseClass} bg-purple-600 text-white shadow-lg ring-purple-500`;
    }
    return `${baseClass} bg-gray-700 text-gray-300 hover:bg-gray-600`;
  };

  return (
    <div className="space-y-4 text-center">
        <label className="block mb-2 text-md font-medium text-gray-300">Select Display &amp; Preferred Download Format</label>
        <div className="inline-flex rounded-lg shadow-md bg-gray-800 p-1 space-x-1">
            {formats.map((format) => (
                <button
                    key={format}
                    onClick={() => onFormatChange(format)}
                    className={getButtonClass(format)}
                    aria-pressed={format === selectedFormat}
                >
                    .{format.toUpperCase()}
                </button>
            ))}
        </div>
    </div>
  );
};