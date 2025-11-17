
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { LanguageOption } from './types';
import { LANGUAGES } from './constants';
import { FileUpload } from './components/FileUpload';
import { LanguageSelector } from './components/LanguageSelector';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { OutputFormatSelector } from './components/OutputFormatSelector';
import { AdvancedOptions } from './components/AdvancedOptions';

// @ts-ignore - aistudio is a global
declare const window: { aistudio: any; } & Window;

const ApiKeySelector: React.FC<{ onKeySelect: () => void }> = ({ onKeySelect }) => {
  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Optimistically assume key is selected to avoid race condition.
      onKeySelect();
    } catch(e) {
      console.error("Could not open API key selector", e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700 text-center">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
          API Key Required
        </h2>
        <p className="text-gray-400 mb-6">
          Please select a Google AI API key to use this application. Your API key is used to authenticate your requests.
        </p>
        <button
          onClick={handleSelectKey}
          className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Select API Key
        </button>
        <p className="text-xs text-gray-500 mt-4">
          For more information on billing, please visit the{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:underline"
          >
            billing documentation
          </a>.
        </p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceContent, setSourceContent] = useState<string>('');
  const [sourceLang, setSourceLang] = useState<LanguageOption>(LANGUAGES[1]); // Default English
  const [targetLang, setTargetLang] = useState<LanguageOption>(LANGUAGES[3]); // Default Thai
  const [translatedContent, setTranslatedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<'vtt' | 'srt' | 'txt'>('vtt');

  // Advanced Options State
  const [liveliness, setLiveliness] = useState<'Subtle' | 'Natural' | 'Vivid'>('Natural');
  const [emotionality, setEmotionality] = useState<'Subtle' | 'Expressive' | 'Intense'>('Expressive');
  const [risqueLevel, setRisqueLevel] = useState<'Suggestive' | 'Explicit' | 'Very Explicit'>('Explicit');
  const [keywordsToEmphasize, setKeywordsToEmphasize] = useState<string>('');
  const [keywordsToAvoid, setKeywordsToAvoid] = useState<string>('');

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const keySelected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(keySelected);
      } catch (e) {
        console.error("Could not check for API key", e);
        setHasApiKey(false); // Default to false if check fails
      }
    };
    checkApiKey();
  }, []);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setSourceFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setSourceContent(text);
        setError(null);
        setTranslatedContent('');
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
      };
      reader.readAsText(file);
    } else {
      setSourceFile(null);
      setSourceContent('');
    }
  };

  const handleTranslate = useCallback(async () => {
    if (!sourceContent || !sourceLang || !targetLang) {
      setError('Please select a file and both source and target languages.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranslatedContent('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const advancedInstructions = `
**Translation Style Guide:**
- **Liveliness Level:** ${liveliness}. Adjust the energy and pacing of the dialogue accordingly.
- **Emotionality Level:** ${emotionality}. The translation should reflect this level of emotional intensity.
- **Risqué Level:** ${risqueLevel}. The language should match this level of suggestiveness or explicitness.${keywordsToEmphasize ? `
- **Keywords to Emphasize:** Prioritize using or capturing the essence of these words/phrases: "${keywordsToEmphasize}".` : ''}${keywordsToAvoid ? `
- **Keywords to Avoid:** Do not use the following words/phrases: "${keywordsToAvoid}".` : ''}
`;

      const prompt = `
        You are an expert translator specializing in erotic movie subtitles. Your task is to translate the following subtitle content from ${sourceLang.name} to ${targetLang.name}.

        **Translation Rules:**
        1.  **Style & Tone:** Translate the dialogue to be lively, emotional, and natural for an erotic film, following the specific style guide below.
        2.  **Vocabulary:** You MUST use slang, risqué language, and words related to sex where appropriate to capture the scene's mood. You are explicitly allowed to include sounds of pleasure (moans, gasps, etc., like "Ahh...", "Mmmh...") if they fit the context.
        3.  **Timestamp Accuracy:** Preserve the original timestamps perfectly. Do not alter their format or timing.
        4.  **Output Format:** The final output MUST be in valid WebVTT (.vtt) format.
        5.  **Line Breaks for Dialogue:** If a single subtitle cue contains dialogue from multiple speakers separated by a dash ('-'), you MUST place each speaker's dialogue on a new line. For example, convert "- Hello there. - Hi." into two lines:
            - Hello there.
            - Hi.
        6.  **IMPORTANT:** Start generating the VTT content immediately. Do not include any introductory text, explanations, or code fences (like \`\`\`vtt or \`\`\`). The response should start directly with "WEBVTT".

        ${advancedInstructions.trim()}

        **Original Subtitle Content (${sourceLang.name}):**
        ---
        ${sourceContent}
        ---

        Now, provide the translation in ${targetLang.name} following all the rules and the style guide above.
      `;

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      for await (const chunk of responseStream) {
        setTranslatedContent((prev) => prev + chunk.text);
      }
      
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        if (err.message.includes('API key not valid') || err.message.includes('API_KEY_INVALID')) {
            setError('The provided API Key is invalid. Please check your selection.');
            setHasApiKey(false);
        } else if (err.message.includes('Requested entity was not found')) {
            setError('API Key error. Please select a valid API key to continue.');
            setHasApiKey(false);
        } else {
            setError('An error occurred during translation. Please check the console for details.');
        }
      } else {
        setError('An unknown error occurred during translation.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [sourceContent, sourceLang, targetLang, liveliness, emotionality, risqueLevel, keywordsToEmphasize, keywordsToAvoid]);

  if (hasApiKey === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!hasApiKey) {
    return <ApiKeySelector onKeySelect={() => setHasApiKey(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            AI Erotic Subtitle Translator
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Translate subtitles with a touch of cinematic passion.
          </p>
        </header>

        <main className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <FileUpload onFileChange={handleFileChange} />
            <div className="flex flex-col sm:flex-row md:flex-col col-span-1 md:col-span-2 gap-4 items-center justify-center">
                <LanguageSelector
                    label="From"
                    selectedLanguage={sourceLang}
                    onLanguageChange={setSourceLang}
                />
                <ArrowIcon />
                <LanguageSelector
                    label="To"
                    selectedLanguage={targetLang}
                    onLanguageChange={setTargetLang}
                />
            </div>
          </div>

          <AdvancedOptions
            liveliness={liveliness}
            setLiveliness={setLiveliness}
            emotionality={emotionality}
            setEmotionality={setEmotionality}
            risqueLevel={risqueLevel}
            setRisqueLevel={setRisqueLevel}
            keywordsToEmphasize={keywordsToEmphasize}
            setKeywordsToEmphasize={setKeywordsToEmphasize}
            keywordsToAvoid={keywordsToAvoid}
            setKeywordsToAvoid={setKeywordsToAvoid}
          />
          
          <OutputFormatSelector selectedFormat={outputFormat} onFormatChange={setOutputFormat} />

          <div className="text-center">
            <button
              onClick={handleTranslate}
              disabled={!sourceFile || isLoading}
              className="w-full md:w-1/2 px-8 py-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 disabled:scale-100 flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner /> : 'Translate Subtitles'}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
              <p>{error}</p>
            </div>
          )}

          {(translatedContent || isLoading) && (
            <ResultDisplay 
              content={translatedContent} 
              filename={sourceFile?.name || 'translated'} 
              displayFormat={outputFormat}
            />
          )}
        </main>
      </div>
    </div>
  );
};

const ArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 md:rotate-0 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

export default App;
