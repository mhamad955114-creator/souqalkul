import { useCallback } from "react";

interface SoundCache {
  [key: string]: string;
}

const soundCache: SoundCache = {};

export const useSoundEffects = () => {
  const playSound = useCallback(async (prompt: string, duration?: number) => {
    try {
      // Check cache first
      const cacheKey = `${prompt}-${duration || 1}`;
      let audioUrl = soundCache[cacheKey];

      if (!audioUrl) {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-sfx`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ prompt, duration: duration || 1 }),
          }
        );

        if (!response.ok) {
          console.warn(`Sound generation failed: ${response.status}`);
          return;
        }

        const audioBlob = await response.blob();
        audioUrl = URL.createObjectURL(audioBlob);
        soundCache[cacheKey] = audioUrl;
      }

      const audio = new Audio(audioUrl);
      audio.volume = 0.3; // Keep volume moderate
      await audio.play().catch(e => {
        // Ignore autoplay restrictions
        console.debug("Sound autoplay blocked:", e);
      });
    } catch (error) {
      console.debug("Sound effect error:", error);
      // Fail silently to not disrupt user experience
    }
  }, []);

  const playBadgeSound = useCallback((badgeType: 'business' | 'professional' | 'featured') => {
    const soundPrompts = {
      business: "luxurious diamond chime, premium crystal ding, elegant metallic sparkle",
      professional: "royal crown fanfare, majestic trumpet note, regal brass accent", 
      featured: "bright star twinkle, magical sparkle, shimmering celestial chime"
    };

    playSound(soundPrompts[badgeType], 0.8);
  }, [playSound]);

  return { playSound, playBadgeSound };
};