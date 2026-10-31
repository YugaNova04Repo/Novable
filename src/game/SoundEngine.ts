export function triggerHaptic(pattern: number | number[]) {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore
    }
  }
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private musicInterval: number | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startAmbient(temp: number) {
    if (this.muted || this.ambientOsc) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      this.ambientOsc = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();
      this.ambientFilter = this.ctx.createBiquadFilter();

      this.ambientOsc.type = temp > 15000 ? 'sawtooth' : 'sine';
      this.ambientOsc.frequency.setValueAtTime(temp > 15000 ? 120 : 60, now);

      this.ambientFilter.type = 'lowpass';
      const cutoff = Math.min(8000, Math.max(200, temp * 0.5));
      this.ambientFilter.frequency.setValueAtTime(cutoff, now);

      this.ambientGain.gain.setValueAtTime(0.03, now);

      this.ambientOsc.connect(this.ambientFilter);
      this.ambientFilter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc.start();
    } catch {
      // Ignore
    }
  }

  updateAmbient(temp: number) {
    if (!this.ctx || !this.ambientFilter || !this.ambientOsc || this.muted) return;
    try {
      const now = this.ctx.currentTime;
      const cutoff = Math.min(8000, Math.max(200, temp * 0.4));
      this.ambientFilter.frequency.setTargetAtTime(cutoff, now, 0.5);
      this.ambientOsc.type = temp > 15000 ? 'sawtooth' : 'sine';
    } catch {
      // Ignore
    }
  }

  stopAmbient() {
    try {
      if (this.ambientOsc) {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
        this.ambientOsc = null;
      }
      if (this.musicInterval) {
        window.clearInterval(this.musicInterval);
        this.musicInterval = null;
      }
    } catch {
      // Ignore
    }
  }

  startGenerativeMusic(epochId: number = 1) {
    if (this.muted || this.musicInterval) return;
    this.init();
    if (!this.ctx) return;

    const scales = [
      [130.81, 196.00, 261.63, 329.63], // Epoch I: C minor ambient
      [146.83, 220.00, 293.66, 369.99], // Epoch II: D Dorian
      [164.81, 246.94, 329.63, 440.00], // Epoch III: E Major cosmic
      [174.61, 261.63, 349.23, 440.00], // Epoch IV: F Lydian
      [196.00, 293.66, 392.00, 523.25]  // Epoch V: G ethereal
    ];
    const scale = scales[Math.min(scales.length - 1, epochId - 1)];

    const playLoop = () => {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const freq = scale[Math.floor(Math.random() * scale.length)];
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = epochId >= 3 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq * (Math.random() > 0.5 ? 1 : 2), now);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 1.5, now);
        filter.Q.setValueAtTime(3, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.03 * (epochId * 0.25), now + 1.0);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.0);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 5.0);
      } catch {
        // Ignore
      }
    };

    playLoop();
    this.musicInterval = window.setInterval(playLoop, Math.max(1500, 3500 - epochId * 400));
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    triggerHaptic(10);

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Ignore
    }
  }

  playCollision(velocity: number = 1, mass: number = 1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      
      const baseFreq = Math.min(800, Math.max(60, 200 * (velocity / (mass * 0.05 + 1))));
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.08);

      const volume = Math.min(0.3, Math.max(0.05, velocity * 0.03));
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Ignore
    }
  }

  playDiscovery() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    triggerHaptic([20, 40, 20]);

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.2, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.4);
      });
    } catch {
      // Ignore
    }
  }

  playBigBang() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    triggerHaptic([50, 30, 100]);

    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 1.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, now);
      filter.frequency.exponentialRampToValueAtTime(1000, now + 0.5);
      filter.frequency.exponentialRampToValueAtTime(200, now + 1.5);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 1.5);

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 1.5);

      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.5);
    } catch {
      // Ignore
    }
  }
}

export const soundEngine = new SoundEngine();
