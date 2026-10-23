// Web Speech Synthesis and Web Audio Alarm Engine for MediFinder
export class VoiceAssistant {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  private static voiceGender: 'female' | 'male' = (typeof localStorage !== 'undefined' && (localStorage.getItem('medifinder_voice_gender') as 'female' | 'male')) || 'female';

  public static getVoiceGender(): 'female' | 'male' {
    return this.voiceGender;
  }

  public static setVoiceGender(gender: 'female' | 'male'): void {
    this.voiceGender = gender;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('medifinder_voice_gender', gender);
    }
  }

  private static getFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    if (!voices || voices.length === 0) return null;
    
    // Search for explicit female voice names across browser implementations
    const femaleKeywords = [
      'female', 'samantha', 'zira', 'victoria', 'karen', 'fiona', 
      'moira', 'veena', 'google uk english female', 'google us english', 
      'microsoft zira', 'microsoft eva', 'microsoft hazel', 'serena', 'tessa'
    ];

    for (const keyword of femaleKeywords) {
      const match = voices.find(v => v.name.toLowerCase().includes(keyword));
      if (match) return match;
    }

    // Secondary search for English female voices
    const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (enVoice) return enVoice;

    return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
  }

  private static getMaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    if (!voices || voices.length === 0) return null;
    const maleKeywords = ['male', 'david', 'alex', 'george', 'daniel', 'richard', 'microsoft david', 'google us english male'];
    for (const keyword of maleKeywords) {
      const match = voices.find(v => v.name.toLowerCase().includes(keyword));
      if (match) return match;
    }
    return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
  }

  public static speak(text: string, onEnd?: () => void): void {
    if (!this.synth) return;
    try {
      this.synth.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = this.synth.getVoices();
      if (this.voiceGender === 'female') {
        const femaleVoice = this.getFemaleVoice(voices);
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
        utterance.pitch = 1.25; // Higher frequency pitch tuning for clear female voice
        utterance.rate = 0.95;
      } else {
        const maleVoice = this.getMaleVoice(voices);
        if (maleVoice) {
          utterance.voice = maleVoice;
        }
        utterance.pitch = 0.9;
        utterance.rate = 0.95;
      }
      
      utterance.volume = 1.0;
      if (onEnd) {
        utterance.onend = onEnd;
      }
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  public static speakDoseReminder(
    medicineName: string,
    dosage: string,
    foodInstruction?: string,
    userName: string = 'User'
  ): void {
    const foodClause = foodInstruction ? ` Take ${foodInstruction}.` : '';
    const phrase = `Hello ${userName}. It is time to take your medicine: ${medicineName}, ${dosage}.${foodClause}`;
    this.speak(phrase);
  }

  public static speakMissedDoseFollowup(medicineName: string, userName: string): void {
    const phrase = `Notice for ${userName}. You missed your scheduled dose for ${medicineName}. Please check your medicine log.`;
    this.speak(phrase);
  }

  public static testFemaleVoice(): void {
    this.setVoiceGender('female');
    this.speak("Hello! This is your female voice assistant for medicine reminders. I will notify you when it is time to take your doses.");
  }

  public static stop(): void {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        console.warn('SpeechSynthesis cancel error:', e);
      }
    }
  }
}

// Repeating Alarm Synthesizer Chime Engine using Web Audio API
export type AlarmToneType = 'digital' | 'bell' | 'siren' | 'melody';

// High-Volume Multi-Tone Alarm Synthesizer Engine using Web Audio API
export class AlarmChimeEngine {
  private static audioCtx: AudioContext | null = null;
  private static audioElem: HTMLAudioElement | null = null;
  private static intervalId: any = null;
  private static isPlaying: boolean = false;
  private static currentTone: AlarmToneType = 
    (typeof localStorage !== 'undefined' && (localStorage.getItem('medifinder_alarm_tone') as AlarmToneType)) || 'digital';
  private static volume: number = 0.95;

  public static getAlarmTone(): AlarmToneType {
    return this.currentTone;
  }

  public static setAlarmTone(tone: AlarmToneType): void {
    this.currentTone = tone;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('medifinder_alarm_tone', tone);
    }
  }

  public static getVolume(): number {
    return this.volume;
  }

  public static setVolume(vol: number): void {
    this.volume = Math.max(0.1, Math.min(1.0, vol));
  }

  private static getContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // 1. Classic Digital Alarm Clock: 4 fast sharp piercing beeps (Beep-Beep-Beep-Beep)
  private static playDigitalAlarm(ctx: AudioContext, now: number): void {
    const beepTimes = [0, 0.12, 0.24, 0.36];
    const beepDuration = 0.08;
    const freq = 980; // High piercing attention frequency

    beepTimes.forEach((offset, idx) => {
      const startTime = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sharp square wave for authentic digital clock alarm sound
      osc.type = idx === 3 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(idx === 3 ? freq * 1.08 : freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume, startTime + 0.005);
      gain.gain.setValueAtTime(this.volume, startTime + beepDuration - 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + beepDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + beepDuration);
    });
  }

  // 2. Twin-Bell Mechanical Alarm Clock: rapid metallic clanging bells
  private static playBellAlarm(ctx: AudioContext, now: number): void {
    const clangs = [
      { t: 0.0, f: 880 },
      { t: 0.09, f: 1100 },
      { t: 0.18, f: 880 },
      { t: 0.27, f: 1100 },
      { t: 0.36, f: 880 },
      { t: 0.45, f: 1100 },
    ];

    clangs.forEach(({ t, f }) => {
      const startTime = now + t;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.95, startTime + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.08);
    });
  }

  // 3. Urgent Emergency Siren: rapid frequency oscillation
  private static playSirenAlarm(ctx: AudioContext, now: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(1350, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.5);

    gain.gain.setValueAtTime(this.volume * 0.8, now);
    gain.gain.setValueAtTime(this.volume * 0.8, now + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);
  }

  // 4. Melodic Chime: pleasant rising chord
  private static playMelodyAlarm(ctx: AudioContext, now: number): void {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const startTime = now + i * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.85, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  public static playCurrentPattern(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      switch (this.currentTone) {
        case 'digital':
          this.playDigitalAlarm(ctx, now);
          break;
        case 'bell':
          this.playBellAlarm(ctx, now);
          break;
        case 'siren':
          this.playSirenAlarm(ctx, now);
          break;
        case 'melody':
          this.playMelodyAlarm(ctx, now);
          break;
        default:
          this.playDigitalAlarm(ctx, now);
      }
    } catch (e) {
      console.warn('AlarmChimeEngine error:', e);
    }
  }

  public static start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.playCurrentPattern();

    const intervalTime = 
      this.currentTone === 'digital' ? 850 :
      this.currentTone === 'bell' ? 750 :
      this.currentTone === 'siren' ? 600 : 1000;

    this.intervalId = setInterval(() => {
      if (this.isPlaying) {
        this.playCurrentPattern();
      }
    }, intervalTime);

    // Also trigger HTML5 audio element for maximum loudness and browser device compatibility
    try {
      if (typeof window !== 'undefined' && 'Audio' in window) {
        if (!this.audioElem) {
          this.audioElem = new Audio('/alarm-digital.wav');
          this.audioElem.loop = true;
        }
        this.audioElem.volume = this.volume;
        this.audioElem.currentTime = 0;
        this.audioElem.play().catch(() => {});
      }
    } catch {}
  }

  public static stop(): void {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioElem) {
      try {
        this.audioElem.pause();
        this.audioElem.currentTime = 0;
      } catch {}
    }
  }

  public static preview(tone?: AlarmToneType): void {
    const original = this.currentTone;
    if (tone) this.currentTone = tone;
    this.stop();
    this.start();
    setTimeout(() => {
      this.stop();
      this.currentTone = original;
    }, 2800);
  }
}
