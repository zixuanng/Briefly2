export interface Article {
  id: string;
  title: string;
  content: string;
}

export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export interface AudioGenerationState {
  isGeneratingScript: boolean;
  isSynthesizingAudio: boolean;
  error: string | null;
  script: string | null;
  audioUrl: string | null;
}
