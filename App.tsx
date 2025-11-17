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

const App: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceContent, setSourceContent] = useState<string>('');
  const [sourceLang, setSourceLang] = useState<LanguageOption>(LANGUAGES[1]); // Default English
  const [targetLang, setTargetLang] = useState<LanguageOption>(LANGUAGES[3]); // Default Thai
  const [translatedContent, setTranslatedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<'vtt' | 'srt' | 'txt'>('vtt');

  // API Key State
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isKeySaved, setIsKeySaved] = useState(false);


  // Advanced Options State
  const [liveliness, setLiveliness] = useState<'Subtle' | 'Natural' | 'Vivid'>('Natural');
  const [emotionality, setEmotionality] = useState<'Subtle' | 'Expressive' | 'Intense'>('Expressive');
  const [risqueLevel, setRisqueLevel] = useState<'Suggestive' | 'Explicit' | 'Very Explicit'>('Explicit');
  const [keywordsToEmphasize, setKeywordsToEmphasize] = useState<string>('');
  const [keywordsToAvoid, setKeywordsToAvoid] = useState<string>('');

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setApiKeyInput(storedKey);
      setIsKeySaved(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKeyInput.trim()) {
        setError("API Key cannot be empty.");
        return;
    }
    setError(null);
    setApiKey(apiKeyInput);
    localStorage.setItem('gemini_api_key', apiKeyInput);
    setIsKeySaved(true);
  };

  const handleClearKey = () => {
    setApiKey('');
    setApiKeyInput('');
    localStorage.removeItem('gemini_api_key');
    setIsKeySaved(false);
  };

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
    
    if (!apiKey) {
      setError('API Key is missing. Please enter and save your API key above.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranslatedContent('');

    try {
      const ai = new GoogleGenAI({ apiKey });
      
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
        model: 'gemini-2.5-pro',
        contents: prompt,
      });

      for await (const chunk of responseStream) {
        setTranslatedContent((prev) => prev + chunk.text);
      }
      
    } catch (err) {
      console.error(err);
      if (err instanceof Error && (err.message.includes('API key not valid') || err.message.includes('API_KEY_INVALID'))) {
        setError('Invalid API Key. Please check your key and save it again.');
        setIsKeySaved(false);
      } else {
        setError('An error occurred during translation. Please check the console for details.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [sourceContent, sourceLang, targetLang, liveliness, emotionality, risqueLevel, keywordsToEmphasize, keywordsToAvoid, apiKey]);

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

        <section className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700 space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-center text-gray-200">API Key Management</h2>
          <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg text-sm">
            <strong>Security Warning:</strong> Saving your API key in the browser's local storage is convenient for development but is not secure. Do not use this method in a production environment. Anyone with access to your browser could potentially view your key.
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter your Gemini API Key"
                className="w-full p-3 pr-12 bg-gray-700 border border-gray-600 text-white text-md rounded-lg focus:ring-purple-500 focus:border-purple-500 block"
              />
              <button onClick={() => setShowApiKey(!showApiKey)} className="absolute inset-y-0 right-0 px-4 text-gray-400 hover:text-white">
                {showApiKey ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={handleSaveKey} className="flex-1 sm:flex-none px-5 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-colors">
                Save
                </button>
                <button onClick={handleClearKey} className="flex-1 sm:flex-none px-5 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-400 transition-colors">
                Clear
                </button>
            </div>
          </div>
            {isKeySaved && <p className="text-green-400 text-center text-sm">API Key is saved and ready to use.</p>}
        </section>

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

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .525-1.666 1.489-3.168 2.683-4.333M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.583 17.584A9.953 9.953 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .525-1.666 1.489-3.168 2.683-4.333m1.417-1.417A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.953 9.953 0 01-1.417 3.417m-3.417-3.417a3 3 0 01-4.242 0M21 21L3 3" />
    </svg>
);

export default App;