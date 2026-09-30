// Global Audio Context Singleton for real-time Web Audio API visualization
class AudioEngine {
  private static instance: AudioEngine;
  public audioCtx: AudioContext | null = null;
  public analyserNode: AnalyserNode | null = null;
  public micStream: MediaStream | null = null;
  public micSourceNode: MediaStreamAudioSourceNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private mediaElementSourceNode: MediaElementAudioSourceNode | null = null;
  private sourceMap = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public init(): { audioCtx: AudioContext; analyser: AnalyserNode } {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 64;
      this.analyserNode.smoothingTimeConstant = 0.8;
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return { audioCtx: this.audioCtx, analyser: this.analyserNode! };
  }

  public async startMicStream(): Promise<MediaStream> {
    const { audioCtx, analyser } = this.init();
    if (this.micStream) {
      this.stopMicStream();
    }
    this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.micSourceNode = audioCtx.createMediaStreamSource(this.micStream);
    this.micSourceNode.connect(analyser);
    return this.micStream;
  }

  public stopMicStream(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.micSourceNode) {
      try {
        this.micSourceNode.disconnect();
      } catch (e) {
        // ignore
      }
      this.micSourceNode = null;
    }
  }

  public playAudio(
    audioUrl: string,
    onEnded?: () => void,
    onError?: (err: any) => void
  ): HTMLAudioElement {
    this.stopPlayback();
    const { audioCtx, analyser } = this.init();

    const audio = new Audio(audioUrl);
    this.currentAudioElement = audio;

    try {
      let source = this.sourceMap.get(audio);
      if (!source) {
        source = audioCtx.createMediaElementSource(audio);
        this.sourceMap.set(audio, source);
      }
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch (e) {
      console.warn('Could not pipe audio through analyser node, falling back to direct speaker', e);
    }

    audio.onended = () => {
      this.currentAudioElement = null;
      if (onEnded) onEnded();
    };

    audio.onerror = (err) => {
      this.currentAudioElement = null;
      if (onError) onError(err);
    };

    audio.play().catch((err) => {
      console.warn('Audio play request blocked or interrupted:', err);
      this.currentAudioElement = null;
      if (onError) onError(err);
    });

    return audio;
  }

  public stopPlayback(): void {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public isPlaying(): boolean {
    return Boolean(this.currentAudioElement && !this.currentAudioElement.paused);
  }
}

export const audioEngine = AudioEngine.getInstance();

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export function fallbackBrowserSpeech(
  text: string,
  lang: string = 'en-US',
  onEnd?: () => void
): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1.05;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}
