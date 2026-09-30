import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Language } from "@/lib/translations";

interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<{ 0: { transcript: string } }>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const messages = {
  ar: {
    unsupported: "الإملاء الصوتي غير متوفر في هذا المتصفح",
    denied: "يرجى السماح باستخدام الميكروفون للبحث الصوتي",
    failed: "تعذّر سماع الكلمات، حاول مرة أخرى",
  },
  en: {
    unsupported: "Voice search is not available in this browser",
    denied: "Allow microphone access to use voice search",
    failed: "Could not hear the words. Please try again",
  },
  tr: {
    unsupported: "Sesli arama bu tarayıcıda kullanılamıyor",
    denied: "Sesli arama için mikrofon erişimine izin verin",
    failed: "Sözcükler duyulamadı. Tekrar deneyin",
  },
} as const;

const languageCodes: Record<Language, string> = {
  ar: "ar-SA",
  en: "en-US",
  tr: "tr-TR",
};

export const useSpeechSearch = (language: Language, onTranscript: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptHandlerRef = useRef(onTranscript);
  transcriptHandlerRef.current = onTranscript;

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const speechWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      toast.error(messages[language].unsupported);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = languageCodes[language];
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) transcriptHandlerRef.current(transcript);
    };
    recognition.onerror = (event) => {
      const denied = event.error === "not-allowed" || event.error === "service-not-allowed";
      toast.error(denied ? messages[language].denied : messages[language].failed);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  return { isListening, toggleListening };
};