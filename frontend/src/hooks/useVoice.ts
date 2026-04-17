import React, { useState, useEffect, useRef } from 'react';

// TypeScript definitions for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: 'no-speech' | 'audio-capture' | 'not-allowed' | 'network' | 'aborted' | 'language-not-supported' | 'service-not-allowed' | 'bad-grammar';
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

// We extend any to bypass strict typing for vendor prefixes
const WebSpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export type VoiceState = 'IDLE' | 'WAITING_REGNO' | 'WAITING_MARK' | 'CONFIRMING';

export const useVoiceEntry = () => {
  const [isListening, setIsListening] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [tempRegNo, setTempRegNo] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!WebSpeechRecognition) return;

    const recognition = new WebSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, []);

  const speak = (text: string) => {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = resolve;
      synth.speak(utterance);
    });
  };

  const listenForInput = async (): Promise<string> => {
    if (!recognitionRef.current) return '';
    return new Promise((resolve) => {
      setInterimText('');
      setIsListening(true);
      recognitionRef.current.start();
      
      const onResult = (event: any) => {
        const results = event.results;
        const transcript = Array.from(results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setInterimText(transcript);

        if (results[results.length - 1].isFinal) {
          recognitionRef.current.removeEventListener('result', onResult);
          recognitionRef.current.removeEventListener('end', onEnd);
          setIsListening(false);
          resolve(transcript.trim());
        }
      };
      
      const onEnd = () => {
        recognitionRef.current.removeEventListener('result', onResult);
        recognitionRef.current.removeEventListener('end', onEnd);
        setIsListening(false);
        resolve('');
      };

      recognitionRef.current.addEventListener('result', onResult);
      recognitionRef.current.addEventListener('end', onEnd);
    });
  };

  return { isListening, voiceState, setVoiceState, tempRegNo, setTempRegNo, speak, listenForInput, interimText, WebSpeechRecognition };
};
