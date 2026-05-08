// Nature-based ambient sound engine using Web Audio API
// Uses pink/brown noise buffers instead of oscillators — sounds like rain, wind, or soft nature
// No external audio files or APIs required

export type EmotionId =
  | "saturado"
  | "triste"
  | "vacio"
  | "cansado"
  | "sensible"
  | "confundido"
  | "en calma"
  | "neutral";

export interface EmotionAmbientProfile {
  noiseType: "pink" | "brown";
  filterType: BiquadFilterType;
  filterFreq: number;   // Hz — shapes the nature texture
  filterQ: number;      // resonance
  gain: number;         // master volume
  lfoRate: number;      // very slow wave modulation (breath-like)
  lfoDepth: number;     // depth of the wave
  fadeIn: number;       // seconds to fade in
  breathCycle: { inhale: number; hold: number; exhale: number };
  label: string;
}

export const emotionProfiles: Record<EmotionId, EmotionAmbientProfile> = {
  // Home screen — soft rain texture (pink noise, bandpass around 2.5kHz)
  neutral: {
    noiseType: "pink",
    filterType: "bandpass",
    filterFreq: 2400,
    filterQ: 0.6,
    gain: 0.28,
    lfoRate: 0.06,
    lfoDepth: 0.06,
    fadeIn: 3,
    breathCycle: { inhale: 4, hold: 2, exhale: 6 },
    label: "Lluvia suave"
  },
  // Calm — bright open rain, airy
  "en calma": {
    noiseType: "pink",
    filterType: "bandpass",
    filterFreq: 3200,
    filterQ: 0.5,
    gain: 0.22,
    lfoRate: 0.05,
    lfoDepth: 0.05,
    fadeIn: 3,
    breathCycle: { inhale: 4, hold: 2, exhale: 6 },
    label: "Brisa suave"
  },
  // Tired — deep brown noise, low wind, very grounding
  cansado: {
    noiseType: "brown",
    filterType: "lowpass",
    filterFreq: 220,
    filterQ: 0.5,
    gain: 0.55,
    lfoRate: 0.03,
    lfoDepth: 0.08,
    fadeIn: 4,
    breathCycle: { inhale: 4, hold: 1, exhale: 8 },
    label: "Viento profundo"
  },
  // Sad — soft rain, medium low-pass, gentle
  triste: {
    noiseType: "pink",
    filterType: "lowpass",
    filterFreq: 900,
    filterQ: 0.5,
    gain: 0.32,
    lfoRate: 0.04,
    lfoDepth: 0.06,
    fadeIn: 3.5,
    breathCycle: { inhale: 4, hold: 2, exhale: 7 },
    label: "Lluvia tranquila"
  },
  // Empty — wide open airy noise, light high-pass texture
  vacio: {
    noiseType: "pink",
    filterType: "highpass",
    filterFreq: 1800,
    filterQ: 0.4,
    gain: 0.18,
    lfoRate: 0.025,
    lfoDepth: 0.07,
    fadeIn: 5,
    breathCycle: { inhale: 4, hold: 7, exhale: 8 },
    label: "Aire abierto"
  },
  // Saturated — very deep brown, grounding rumble (like distant ocean)
  saturado: {
    noiseType: "brown",
    filterType: "lowpass",
    filterFreq: 300,
    filterQ: 0.6,
    gain: 0.5,
    lfoRate: 0.035,
    lfoDepth: 0.07,
    fadeIn: 3,
    breathCycle: { inhale: 4, hold: 4, exhale: 4 },
    label: "Océano lejano"
  },
  // Sensitive — soft mid-range rain, present and warm
  sensible: {
    noiseType: "pink",
    filterType: "bandpass",
    filterFreq: 1600,
    filterQ: 0.7,
    gain: 0.26,
    lfoRate: 0.045,
    lfoDepth: 0.05,
    fadeIn: 3,
    breathCycle: { inhale: 4, hold: 2, exhale: 6 },
    label: "Lluvia cálida"
  },
  // Confused — gentle lowpass pink, soft and centering
  confundido: {
    noiseType: "pink",
    filterType: "lowpass",
    filterFreq: 700,
    filterQ: 0.5,
    gain: 0.3,
    lfoRate: 0.04,
    lfoDepth: 0.06,
    fadeIn: 3,
    breathCycle: { inhale: 4, hold: 2, exhale: 6 },
    label: "Bosque quieto"
  }
};

// Paul Kellet's pink noise algorithm — sounds like rain/nature
function createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 3; // 3-second loop
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  }
  return buffer;
}

// Brown noise — deeper rumble, like distant wind or ocean waves
function createBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * w) / 1.02;
      lastOut = data[i];
      data[i] *= 3.2;
    }
  }
  return buffer;
}

export interface AmbientHandle {
  stop: () => void;
}

export function startAmbient(ctx: AudioContext, profile: EmotionAmbientProfile): AmbientHandle {
  // Build the noise buffer source
  const noiseBuffer = profile.noiseType === "pink"
    ? createPinkNoiseBuffer(ctx)
    : createBrownNoiseBuffer(ctx);

  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  source.loop = true;

  // Shaping filter (determines the nature texture — rain vs wind vs ocean)
  const filter = ctx.createBiquadFilter();
  filter.type = profile.filterType;
  filter.frequency.value = profile.filterFreq;
  filter.Q.value = profile.filterQ;

  // Master gain with slow fade-in
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(profile.gain, ctx.currentTime + profile.fadeIn);

  // Very slow LFO for wave-like breathing modulation (like wind gusts or rain variation)
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = "sine";
  lfo.frequency.value = profile.lfoRate;
  lfoGain.gain.value = profile.gain * profile.lfoDepth;
  lfo.connect(lfoGain);
  lfoGain.connect(masterGain.gain);
  lfo.start();

  // Chain: source → filter → masterGain → destination
  source.connect(filter);
  filter.connect(masterGain);
  masterGain.connect(ctx.destination);
  source.start();

  let stopped = false;

  return {
    stop: () => {
      if (stopped) return;
      stopped = true;

      // Fade out quickly then close context — this guarantees silence
      const now = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.linearRampToValueAtTime(0, now + 1.2);

      setTimeout(() => {
        try { source.stop(); } catch {}
        try { lfo.stop(); } catch {}
        try { ctx.close(); } catch {}
      }, 1300);
    }
  };
}
