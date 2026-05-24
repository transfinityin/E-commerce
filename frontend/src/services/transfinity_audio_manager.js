// ===== TRANSFINITY AUDIO MANAGER (Howler Version) =====
import { Howl, Howler } from 'howler';

class TransfinityAudioManager {
  constructor() {
    this.isMuted = localStorage.getItem('map_muted') === 'true';
    this.isInitialized = false;
    this.currentAmbient = null;
    this.sounds = {};
    this.ambientSounds = {};
    this.masterVolume = parseFloat(localStorage.getItem('map_volume') || '0.7');
    this.audioCtx = null;
    this.gainNode = null;
  }

  async init() {
    if (this.isInitialized) return;
    try {
      Howler.volume(this.isMuted ? 0 : this.masterVolume);
      await this.loadAmbientSounds();
      this.loadEffectSounds();
      this.isInitialized = true;
      console.log('[AudioManager] Initialized successfully');
    } catch (e) {
      console.warn('[AudioManager] Howler init failed, using Web Audio fallback:', e);
      this.initWebAudioFallback();
    }
  }

  initWebAudioFallback() {
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = this.isMuted ? 0 : this.masterVolume;
      this.gainNode.connect(this.audioCtx.destination);
      this.isInitialized = true;
    } catch (e) {
      console.error('[AudioManager] Web Audio API not supported');
    }
  }

  async loadAmbientSounds() {
    const ambientConfigs = [
      { name: 'ocean', src: ['/audio/ambient/ocean-loop.mp3'], loop: true, volume: 0.15, fadeIn: 2000 },
      { name: 'wind', src: ['/audio/ambient/wind-loop.mp3'], loop: true, volume: 0.08, fadeIn: 3000 },
      { name: 'fire', src: ['/audio/ambient/fire-crackle.mp3'], loop: true, volume: 0.06, fadeIn: 1500 },
      { name: 'cosmic', src: ['/audio/ambient/cosmic-drone.mp3'], loop: true, volume: 0.1, fadeIn: 4000 },
      { name: 'storm', src: ['/audio/ambient/storm-rumble.mp3'], loop: true, volume: 0.12, fadeIn: 2000 },
    ];

    for (const config of ambientConfigs) {
      try {
        this.ambientSounds[config.name] = new Howl({
          src: config.src,
          loop: config.loop,
          volume: 0,
          html5: true,
          preload: false,
          onloaderror: () => {
            console.warn(`[AudioManager] Failed to load ambient: ${config.name}`);
          },
        });
        this.ambientSounds[config.name]._tfConfig = config;
      } catch (e) {
        console.warn(`[AudioManager] Could not create Howl for ${config.name}`);
      }
    }
  }

  loadEffectSounds() {
    const effectConfigs = [
      { name: 'hover', src: ['/audio/effects/hover.wav'], volume: 0.3 },
      { name: 'click', src: ['/audio/effects/click.mp3'], volume: 0.4 },
      { name: 'unlock', src: ['/audio/effects/unlock-chime.mp3'], volume: 0.5 },
      { name: 'treasure', src: ['/audio/effects/treasure-found.mp3'], volume: 0.6 },
      { name: 'sail', src: ['/audio/effects/sail-creak.mp3'], volume: 0.3 },
      { name: 'complete', src: ['/audio/effects/arc-complete.mp3'], volume: 0.5 },
      { name: 'error', src: ['/audio/effects/error-buzz.mp3'], volume: 0.3 },
      { name: 'levelup', src: ['/audio/effects/level-up.mp3'], volume: 0.6 },
    ];

    for (const config of effectConfigs) {
      try {
        this.sounds[config.name] = new Howl({
          src: config.src,
          volume: config.volume,
          html5: false,
          preload: true,
          onloaderror: () => {
            console.warn(`[AudioManager] Failed to load effect: ${config.name}`);
          },
        });
      } catch (e) {
        console.warn(`[AudioManager] Could not create Howl for ${config.name}`);
      }
    }
  }

  // Synthesized fallback (same as before)
  playTone(freq, duration, type = 'sine', vol = 0.06) {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = vol * this.masterVolume;
      osc.connect(gain);
      gain.connect(this.gainNode || ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.stop(ctx.currentTime + duration);
    } catch(e) {}
  }

  playEffect(name) {
    if (this.isMuted) return;

    // Try Howler first
    if (this.sounds[name] && this.sounds[name].state() === 'loaded') {
      this.sounds[name].play();
      return;
    }

    // Fallback to synthesized
    const synthesizedEffects = {
      hover: () => this.playTone(520, 0.06, 'sine', 0.04),
      click: () => this.playTone(800, 0.1, 'triangle', 0.05),
      unlock: () => {
        this.playTone(523, 0.2, 'sine', 0.05);
        setTimeout(() => this.playTone(659, 0.2, 'sine', 0.05), 100);
        setTimeout(() => this.playTone(784, 0.3, 'sine', 0.05), 200);
      },
      treasure: () => {
        this.playTone(880, 0.15, 'sine', 0.06);
        setTimeout(() => this.playTone(1100, 0.2, 'sine', 0.06), 100);
        setTimeout(() => this.playTone(1320, 0.3, 'sine', 0.06), 200);
      },
      sail: () => this.playTone(160, 0.5, 'sawtooth', 0.03),
      complete: () => {
        this.playTone(523, 0.2, 'sine', 0.05);
        setTimeout(() => this.playTone(659, 0.2, 'sine', 0.05), 100);
        setTimeout(() => this.playTone(784, 0.3, 'sine', 0.05), 200);
        setTimeout(() => this.playTone(1047, 0.4, 'sine', 0.05), 300);
      },
      error: () => this.playTone(150, 0.3, 'sawtooth', 0.05),
      levelup: () => {
        [523, 659, 784, 1047, 1319].forEach((f, i) => 
          setTimeout(() => this.playTone(f, 0.15, 'sine', 0.05), i * 80)
        );
      },
    };

    if (synthesizedEffects[name]) synthesizedEffects[name]();
  }

  playAmbient(type) {
    if (this.isMuted) return;
    this.stopAmbient();

    const ambient = this.ambientSounds[type];
    if (ambient && ambient.state() === 'unloaded') ambient.load();
    if (ambient && ambient.state() === 'loaded') {
      const config = ambient._tfConfig;
      ambient.volume(0);
      ambient.play();
      ambient.fade(0, config.volume * this.masterVolume, config.fadeIn);
      this.currentAmbient = type;
      return;
    }

    // Fallback to procedural ocean
    if (type === 'ocean') this.startProceduralOcean();
  }

  stopAmbient() {
    if (this.currentAmbient && this.ambientSounds[this.currentAmbient]) {
      const ambient = this.ambientSounds[this.currentAmbient];
      ambient.fade(ambient.volume(), 0, 1000);
      setTimeout(() => ambient.stop(), 1000);
    }
    this.stopProceduralOcean();
    this.currentAmbient = null;
  }

  startProceduralOcean() {
    if (this.isMuted || !this.audioCtx) return;
    // ... (same procedural ocean code from your original)
    const ctx = this.audioCtx;
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.5;
    
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    
    const gain = ctx.createGain();
    gain.gain.value = 0.08 * this.masterVolume;
    
    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode || ctx.destination);
    
    whiteNoise.start();
    lfo.start();
    this._proceduralOcean = { whiteNoise, lfo, gain };
  }

  stopProceduralOcean() {
    if (this._proceduralOcean) {
      try {
        this._proceduralOcean.whiteNoise.stop();
        this._proceduralOcean.lfo.stop();
      } catch(e) {}
      this._proceduralOcean = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('map_muted', this.isMuted);
    Howler.mute(this.isMuted);
    if (this.gainNode) this.gainNode.gain.value = this.isMuted ? 0 : this.masterVolume;
    if (this.isMuted) this.stopAmbient();
    else if (this.currentAmbient) this.playAmbient(this.currentAmbient);
    return this.isMuted;
  }

  setVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('map_volume', this.masterVolume);
    Howler.volume(this.isMuted ? 0 : this.masterVolume);
    if (this.gainNode) this.gainNode.gain.value = this.isMuted ? 0 : this.masterVolume;
  }

  destroy() {
    this.stopAmbient();
    Howler.unload();
    if (this.audioCtx) this.audioCtx.close();
  }
}

const audioManager = new TransfinityAudioManager();
export default audioManager;