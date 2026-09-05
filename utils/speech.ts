// Web Speech API interfaces for browser compatibility

// Declare global types for SpeechRecognition across vendors
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class SpeechManager {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening: boolean = false;
  private preferredVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Initialize SpeechRecognition
      const SpeechRecognitionClass =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }

      // Initialize SpeechSynthesis
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
        this.loadVoices();
        if (this.synthesis.onvoiceschanged !== undefined) {
          this.synthesis.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);
  }

  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  private loadVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    const voices = this.synthesis.getVoices();
    // Prioritize natural English medical/assistant voices
    this.preferredVoice =
      voices.find((v) => v.name.includes('Google US English') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen') || (v.lang.startsWith('en') && v.default)) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0] ||
      null;
    return voices;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  public setVoiceByName(name: string): void {
    if (!this.synthesis) return;
    const voices = this.synthesis.getVoices();
    const found = voices.find((v) => v.name === name);
    if (found) {
      this.preferredVoice = found;
    }
  }

  /**
   * Start listening to microphone for Speech-to-Text
   */
  public startListening(
    onResult: (finalTranscript: string, interimTranscript: string) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.');
      return false;
    }

    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }

    let finalTranscriptAccumulator = '';

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscriptAccumulator += item[0].transcript + ' ';
        } else {
          interim += item[0].transcript;
        }
      }
      onResult(finalTranscriptAccumulator.trim(), interim.trim());
    };

    this.recognition.onerror = (event: any) => {
      let msg = 'Speech recognition error';
      if (event.error === 'not-allowed') {
        msg = 'Microphone access was denied. Please allow microphone access in browser settings.';
      } else if (event.error === 'no-speech') {
        msg = 'No speech detected. Please speak into your microphone.';
      } else if (event.error === 'network') {
        msg = 'Network connection issue with speech service.';
      }
      this.isListening = false;
      onError(msg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
      return true;
    } catch (err: any) {
      onError(err?.message || 'Could not start speech recognition.');
      return false;
    }
  }

  /**
   * Stop speech-to-text listening
   */
  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore
      }
      this.isListening = false;
    }
  }

  /**
   * Text-to-Speech: Speak text aloud
   */
  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): boolean {
    if (!this.synthesis) {
      if (onError) onError('Speech synthesis not supported.');
      return false;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    // Clean markdown characters like asterisks, hashes, backticks for smooth natural speech
    const cleanText = text
      .replace(/[*#_`~[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      if (onError) onError(e);
    };

    this.synthesis.speak(utterance);
    return true;
  }

  /**
   * Cancel ongoing speech
   */
  public stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Check if speech synthesis is currently active
   */
  public isSpeakingNow(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }
}

// Singleton helper instance
let speechManagerInstance: SpeechManager | null = null;

export function getSpeechManager(): SpeechManager {
  if (!speechManagerInstance) {
    speechManagerInstance = new SpeechManager();
  }
  return speechManagerInstance;
}

