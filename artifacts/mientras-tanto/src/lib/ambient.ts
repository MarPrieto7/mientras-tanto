// Generative ambient sound engine using Web Audio API
// Creates layered, emotional soundscapes with synthetic reverb

export type EmotionId = "saturado" | "triste" | "vacio" | "cansado" | "sensible" | "confundido" | "en calma" | "neutral";

export interface EmotionAmbientProfile {
  notes: number[];       // Base frequencies in Hz
  filterFreq: number;    // Low-pass filter cutoff
  lfoRate: number;       // Amplitude modulation rate (very slow)
  reverbSeconds: number; // Reverb tail length
  reverbDecay: number;   // Reverb decay steepness
  breathCycle: { inhale: number; hold: number; exhale: number }; // seconds
  label: string;
}

export const emotionProfiles: Record<EmotionId, EmotionAmbientProfile> = {
  neutral: {
    notes: [174.61, 261.63, 349.23, 523.25], // F3, C4, F4, C5 — open & calm
    filterFreq: 900,
    lfoRate: 0.04,
    reverbSeconds: 4,
    reverbDecay: 3,
    breathCycle: { inhale: 4, hold: 2, exhale: 6 },
    label: "Calma"
  },
  "en calma": {
    notes: [261.63, 329.63, 392.00, 523.25], // C4, E4, G4, C5 — C major, bright
    filterFreq: 1200,
    lfoRate: 0.05,
    reverbSeconds: 3,
    reverbDecay: 2.5,
    breathCycle: { inhale: 4, hold: 2, exhale: 6 },
    label: "Calma"
  },
  cansado: {
    notes: [130.81, 196.00, 261.63, 392.00], // C3, G3, C4, G4 — low, open, restful
    filterFreq: 450,
    lfoRate: 0.025,
    reverbSeconds: 6,
    reverbDecay: 3.5,
    breathCycle: { inhale: 4, hold: 1, exhale: 8 },
    label: "Descanso"
  },
  triste: {
    notes: [146.83, 220.00, 293.66, 440.00], // D3, A3, D4, A4 — open D, soft
    filterFreq: 600,
    lfoRate: 0.035,
    reverbSeconds: 5,
    reverbDecay: 3,
    breathCycle: { inhale: 4, hold: 2, exhale: 7 },
    label: "Suavidad"
  },
  vacio: {
    notes: [220.00, 329.63, 440.00, 659.25], // A3, E4, A4, E5 — open 5ths, ethereal
    filterFreq: 750,
    lfoRate: 0.02,
    reverbSeconds: 8,
    reverbDecay: 4,
    breathCycle: { inhale: 4, hold: 7, exhale: 8 },
    label: "Espacio"
  },
  saturado: {
    notes: [174.61, 261.63, 349.23, 392.00], // F3, C4, F4, G4 — grounded, stable
    filterFreq: 700,
    lfoRate: 0.03,
    reverbSeconds: 4,
    reverbDecay: 2.5,
    breathCycle: { inhale: 4, hold: 4, exhale: 4 },
    label: "Anclaje"
  },
  sensible: {
    notes: [164.81, 246.94, 329.63, 493.88], // E3, B3, E4, B4 — E open, warm
    filterFreq: 900,
    lfoRate: 0.04,
    reverbSeconds: 4,
    reverbDecay: 2.8,
    breathCycle: { inhale: 4, hold: 2, exhale: 6 },
    label: "Ternura"
  },
  confundido: {
    notes: [196.00, 293.66, 392.00, 523.25], // G3, D4, G4, C5 — open 5ths+4th
    filterFreq: 800,
    lfoRate: 0.04,
    reverbSeconds: 5,
    reverbDecay: 3,
    breathCycle: { inhale: 4, hold: 2, exhale: 6 },
    label: "Claridad"
  }
};

// Creates a synthetic reverb impulse response (no external files needed)
function createReverb(ctx: AudioContext, seconds: number, decay: number): ConvolverNode {
  const convolver = ctx.createConvolver();
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * seconds);
  const impulse = ctx.createBuffer(2, length, rate);

  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }

  convolver.buffer = impulse;
  return convolver;
}

export interface AmbientHandle {
  stop: () => void;
}

// Builds and starts the full ambient soundscape for a given profile
export function startAmbient(ctx: AudioContext, profile: EmotionAmbientProfile): AmbientHandle {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 4);

  const reverb = createReverb(ctx, profile.reverbSeconds, profile.reverbDecay);
  const dryGain = ctx.createGain();
  const wetGain = ctx.createGain();
  dryGain.gain.value = 0.35;
  wetGain.gain.value = 0.65;

  // Low-pass filter for warmth
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = profile.filterFreq;
  filter.Q.value = 0.7;

  // Very slow amplitude LFO for breathing feel
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = "sine";
  lfo.frequency.value = profile.lfoRate;
  lfoGain.gain.value = profile.lfoRate * 0.8;
  lfo.connect(lfoGain);
  lfo.start();

  // Chain: oscillators → filter → [dryGain + reverb→wetGain] → masterGain → destination
  filter.connect(dryGain);
  filter.connect(reverb);
  reverb.connect(wetGain);
  dryGain.connect(masterGain);
  wetGain.connect(masterGain);
  masterGain.connect(ctx.destination);
  lfoGain.connect(masterGain.gain);

  // Create one oscillator per note, slightly detuned for natural chorus effect
  const oscillators: OscillatorNode[] = profile.notes.map((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    // Slight detuning on each oscillator for richness (±5 cents)
    const detune = (i % 2 === 0 ? 1 : -1) * (i + 1) * 2.5;
    osc.frequency.value = freq;
    osc.detune.value = detune;

    const oscGain = ctx.createGain();
    // Higher notes are quieter
    oscGain.gain.value = 0.25 - i * 0.04;

    osc.connect(oscGain);
    oscGain.connect(filter);
    osc.start();
    return osc;
  });

  return {
    stop: () => {
      masterGain.gain.setTargetAtTime(0, ctx.currentTime, 1.5);
      setTimeout(() => {
        oscillators.forEach(osc => { try { osc.stop(); osc.disconnect(); } catch {} });
        lfo.stop();
        masterGain.disconnect();
        reverb.disconnect();
        filter.disconnect();
      }, 6000);
    }
  };
}
