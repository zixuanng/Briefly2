import React from 'react';
import { VoiceName } from '../types';
import { Mic2 } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onVoiceChange: (voice: VoiceName) => void;
  disabled?: boolean;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onVoiceChange, disabled }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
        <Mic2 size={16} />
        Narrator Voice
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {Object.values(VoiceName).map((voice) => (
          <button
            key={voice}
            onClick={() => onVoiceChange(voice)}
            disabled={disabled}
            className={`
              px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border
              ${selectedVoice === voice 
                ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-900/50' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:border-slate-700'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {voice}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VoiceSelector;