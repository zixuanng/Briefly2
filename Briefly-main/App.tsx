import React, { useState } from 'react';
import { Newspaper, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { VoiceName, AudioGenerationState } from './types';
import VoiceSelector from './components/VoiceSelector';
import AudioPlayer from './components/AudioPlayer';
import { summarizeArticles, generateSpeech } from './services/geminiService';
import { decodeBase64ToAudioBuffer, audioBufferToWav } from './utils/audioUtils';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Kore);
  const [state, setState] = useState<AudioGenerationState>({
    isGeneratingScript: false,
    isSynthesizingAudio: false,
    error: null,
    script: null,
    audioUrl: null,
  });

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    // Reset previous audio if any
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    setState(prev => ({ 
      ...prev, 
      isGeneratingScript: true, 
      error: null,
      script: null,
      audioUrl: null 
    }));

    try {
      // Step 1: Summarize
      const script = await summarizeArticles(inputText);
      setState(prev => ({ 
        ...prev, 
        script, 
        isGeneratingScript: false, 
        isSynthesizingAudio: true 
      }));

      // Step 2: TTS
      const base64Audio = await generateSpeech(script, selectedVoice);
      
      // Step 3: Decode & Convert to Wav for playback
      const audioBuffer = await decodeBase64ToAudioBuffer(base64Audio);
      const wavBlob = audioBufferToWav(audioBuffer);
      const audioUrl = URL.createObjectURL(wavBlob);

      setState(prev => ({ 
        ...prev, 
        audioUrl, 
        isSynthesizingAudio: false 
      }));

    } catch (err: any) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        isGeneratingScript: false, 
        isSynthesizingAudio: false,
        error: err.message || "Something went wrong. Please check your API key and try again." 
      }));
    }
  };

  const isLoading = state.isGeneratingScript || state.isSynthesizingAudio;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-brand-500 selection:text-white pb-20">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-brand-500 to-purple-600 p-2 rounded-lg">
              <Newspaper className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif text-white tracking-tight">Briefly</h1>
              <p className="text-xs text-slate-400 font-medium">News to Audio</p>
            </div>
          </div>
          <div className="hidden sm:block">
             <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-500">
               Powered by Gemini 2.5
             </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-12">
        
        {/* Intro */}
        <section className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-serif text-white font-medium leading-tight">
            Listen to your news <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
              on the go.
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Paste your articles below. We'll summarize them into a short, cohesive podcast episode tailored for your commute.
          </p>
        </section>

        {/* Input Section */}
        <section className="space-y-6">
          <div className="space-y-4">
             <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
               <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste news articles or text here..."
                disabled={isLoading}
                className="relative w-full h-64 bg-slate-900/80 border border-slate-800 text-slate-200 p-6 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none placeholder:text-slate-600 font-serif leading-relaxed transition-all"
              />
            </div>
            
            <VoiceSelector 
              selectedVoice={selectedVoice} 
              onVoiceChange={setSelectedVoice} 
              disabled={isLoading} 
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={!inputText.trim() || isLoading}
              className={`
                group relative flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300
                ${!inputText.trim() || isLoading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-white text-slate-950 hover:bg-brand-50 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]'
                }
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span>
                    {state.isGeneratingScript ? "Writing Script..." : "Recording Audio..."}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className={`w-5 h-5 ${inputText.trim() ? 'text-brand-600' : 'text-slate-500'}`} />
                  <span>Generate Audio Brief</span>
                </>
              )}
            </button>
          </div>

          {state.error && (
            <div className="flex items-center gap-3 p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-200 animate-fade-in">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm">{state.error}</p>
            </div>
          )}
        </section>

        {/* Output Section */}
        {state.audioUrl && (
          <section className="animate-fade-in-up">
             <div className="flex items-center gap-4 mb-6">
               <div className="h-px bg-slate-800 flex-1"></div>
               <span className="text-xs uppercase tracking-widest text-slate-500 font-medium">Your Episode</span>
               <div className="h-px bg-slate-800 flex-1"></div>
             </div>
             <AudioPlayer audioUrl={state.audioUrl} script={state.script} />
          </section>
        )}

      </main>
    </div>
  );
};

export default App;
