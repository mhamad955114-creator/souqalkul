import { useCallback } from "react";

const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = 0.15;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Fail silently
  }
};

export const useSoundEffects = () => {
  const playSound = useCallback(async (_prompt: string, _duration?: number) => {
    playTone(800, 0.3, 'sine');
  }, []);

  const playBadgeSound = useCallback((badgeType: 'business' | 'professional' | 'featured') => {
    const tones: Record<string, [number, number, OscillatorType]> = {
      business: [1200, 0.4, 'sine'],
      professional: [900, 0.5, 'triangle'],
      featured: [1400, 0.3, 'sine'],
    };
    const [freq, dur, type] = tones[badgeType];
    playTone(freq, dur, type);
  }, []);

  return { playSound, playBadgeSound };
};
