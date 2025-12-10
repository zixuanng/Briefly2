import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Download, Volume2, RotateCcw } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string | null;
  script: string | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, script }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  if (!audioUrl) return null;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Controls Section */}
        <div className="w-full md:w-1/2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif text-white flex items-center gap-2">
              <Volume2 className="text-brand-400" />
              Now Playing
            </h3>
            <a 
              href={audioUrl} 
              download="briefly-summary.wav"
              className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              title="Download Audio"
            >
              <Download size={20} />
            </a>
          </div>

          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            className="hidden"
          />

          {/* Progress Bar */}
          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-400"
            />
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex justify-center items-center gap-6">
            <button 
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                }
              }}
              className="text-slate-400 hover:text-white transition-colors p-2"
            >
              <RotateCcw size={24} />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-brand-500 hover:bg-brand-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-900/50 transition-all transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>

             <button 
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
                }
              }}
              className="text-slate-400 hover:text-white transition-colors p-2 transform scale-x-[-1]"
            >
              <RotateCcw size={24} />
            </button>
          </div>
        </div>

        {/* Script Visualization Section */}
        <div className="w-full md:w-1/2 bg-slate-950 rounded-xl p-4 border border-slate-800 max-h-[300px] overflow-y-auto custom-scrollbar">
           <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 sticky top-0 bg-slate-950 py-2">Generated Script</h4>
           <p className="text-slate-300 font-serif leading-relaxed text-sm whitespace-pre-wrap">
             {script}
           </p>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
