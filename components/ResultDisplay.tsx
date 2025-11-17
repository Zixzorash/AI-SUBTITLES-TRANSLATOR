import React, { useState, useMemo } from 'react';
import { vttToSrt, vttToTxt, srtToVtt } from '../utils/subtitleConverter';

interface ResultDisplayProps {
  content: string; // This is always the VTT content from the AI
  filename: string;
  displayFormat: 'vtt' | 'srt' | 'txt';
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ content, filename, displayFormat }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  
  // Sanitize the AI's output VTT content. The AI might mistakenly include 
  // SRT-style cue numbers. The srtToVtt function is robust enough to clean this up
  // while correctly handling already-valid VTT.
  const sanitizedVttContent = useMemo(() => {
    if (!content) return '';
    return srtToVtt(content);
  }, [content]);

  const getDisplayedContent = () => {
    if (!content) return "Translating in real-time...";
    switch (displayFormat) {
      case 'srt':
        return vttToSrt(sanitizedVttContent);
      case 'txt':
        return vttToTxt(sanitizedVttContent);
      case 'vtt':
      default:
        return sanitizedVttContent;
    }
  };
  
  const displayedContent = getDisplayedContent();

  const handleDownload = (format: 'vtt' | 'srt' | 'txt') => {
    let fileContent = '';
    let mimeType = 'text/plain';
    const baseFilename = filename.split('.').slice(0, -1).join('.') || 'translated';
    
    switch (format) {
      case 'vtt':
        fileContent = sanitizedVttContent; // Always use sanitized content
        mimeType = 'text/vtt';
        break;
      case 'srt':
        fileContent = vttToSrt(sanitizedVttContent); // Always use sanitized content
        mimeType = 'application/x-subrip';
        break;
      case 'txt':
        fileContent = vttToTxt(sanitizedVttContent); // Always use sanitized content
        break;
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseFilename}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (navigator.clipboard && displayedContent) {
      navigator.clipboard.writeText(displayedContent).then(() => {
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy'), 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        setCopyButtonText('Error!');
        setTimeout(() => setCopyButtonText('Copy'), 2000);
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center text-gray-300">Translation Result ({displayFormat.toUpperCase()})</h2>
      <textarea
        readOnly
        value={displayedContent}
        className="w-full h-80 p-4 font-mono text-sm bg-gray-900 border border-gray-700 rounded-lg focus:ring-purple-500 focus:border-purple-500 resize-y"
        placeholder="Translating in real-time..."
      />
      {content && (
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-2.5 text-white font-medium rounded-lg transition-colors duration-200 bg-gray-700 hover:bg-gray-600 border border-gray-600"
          >
            <CopyIcon />
            {copyButtonText}
          </button>
          <DownloadButton format="VTT" onClick={() => handleDownload('vtt')} isPreferred={displayFormat === 'vtt'} />
          <DownloadButton format="SRT" onClick={() => handleDownload('srt')} isPreferred={displayFormat === 'srt'} />
          <DownloadButton format="TXT" onClick={() => handleDownload('txt')} isPreferred={displayFormat === 'txt'} />
        </div>
      )}
    </div>
  );
};

interface DownloadButtonProps {
    format: string;
    onClick: () => void;
    isPreferred: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ format, onClick, isPreferred }) => {
    const baseClasses = "flex items-center gap-2 px-5 py-2.5 text-white font-medium rounded-lg transition-colors duration-200";
    const preferredClasses = "bg-purple-600 hover:bg-purple-700 border border-purple-500";
    const defaultClasses = "bg-gray-700 hover:bg-gray-600 border border-gray-600";
    
    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${isPreferred ? preferredClasses : defaultClasses}`}
        >
            <DownloadIcon />
            Download .{format.toLowerCase()}
        </button>
    );
};

const CopyIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const DownloadIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);