interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

class KoreanTTS {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private koreanVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadKoreanVoice();

    // 音声リストが変更されたときに再読み込み
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => this.loadKoreanVoice();
    }
  }

  private loadKoreanVoice() {
    const voices = this.synthesis.getVoices();
    // 韓国語音声を検索（優先順位: ko-KR > ko）
    this.koreanVoice = voices.find(voice => voice.lang === 'ko-KR') ||
                       voices.find(voice => voice.lang.startsWith('ko')) ||
                       null;
  }

  public speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      // 現在の発話を停止
      this.stop();

      // 韓国語音声が見つからない場合
      if (!this.koreanVoice && this.synthesis.getVoices().length > 0) {
        this.loadKoreanVoice();
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // 韓国語音声を設定
      if (this.koreanVoice) {
        utterance.voice = this.koreanVoice;
      }
      utterance.lang = 'ko-KR';

      // オプション設定
      utterance.rate = options.rate || 0.9; // デフォルトは少しゆっくり
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // イベントハンドラー
      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (error) => {
        this.currentUtterance = null;
        reject(error);
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    });
  }

  public async speakSyllables(syllables: string[], delayMs: number = 500): Promise<void> {
    for (let i = 0; i < syllables.length; i++) {
      await this.speak(syllables[i]);
      if (i < syllables.length - 1) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }

  public stop() {
    this.synthesis.cancel();
    this.currentUtterance = null;
  }

  public pause() {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    } else {
      this.synthesis.pause();
    }
  }

  public get isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  public get isPaused(): boolean {
    return this.synthesis.paused;
  }

  public get isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  public get hasKoreanVoice(): boolean {
    return this.koreanVoice !== null;
  }
}

// シングルトンインスタンス
const koreanTTS = new KoreanTTS();

export default koreanTTS;
export type { TTSOptions };