import { LanguageCode } from '../types';

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public speak(
    text: string,
    lang: LanguageCode,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported on this device/browser');
      onStart?.();
      setTimeout(() => onEnd?.(), 1500);
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select appropriate language locale
    switch (lang) {
      case 'hi':
        utterance.lang = 'hi-IN';
        break;
      case 'ur':
        utterance.lang = 'ur-PK';
        break;
      case 'sw':
        utterance.lang = 'sw-TZ';
        break;
      case 'es':
        utterance.lang = 'es-ES';
        break;
      default:
        utterance.lang = 'en-US';
        break;
    }

    utterance.rate = 0.95; // Slightly slower for clear outdoor field audio
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.currentUtterance = null;
      onEnd?.();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return !!this.synth && this.synth.speaking;
  }
}

export const speechService = new SpeechService();
