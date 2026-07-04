import { useState } from 'react';

// We extend any to bypass strict typing for vendor prefixes
const WebSpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export type VoiceState = 'IDLE' | 'WAITING_REGNO' | 'WAITING_MARK' | 'CONFIRMING';

export const useVoiceEntry = () => {
  const [isListening, setIsListening] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [tempRegNo, setTempRegNo] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const speak = (text: string) => {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = resolve;
      synth.speak(utterance);
    });
  };

  const listenForInput = async (): Promise<string> => {
    if (!WebSpeechRecognition) return '';
    return new Promise((resolve, reject) => {
      setInterimText('');
      setIsListening(true);

      let recognition: any;
      try {
        recognition = new WebSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
      } catch (err) {
        console.error("Failed to construct SpeechRecognition:", err);
        setIsListening(false);
        reject(err);
        return;
      }
      
      const onResult = (event: any) => {
        const results = event.results;
        const transcript = Array.from(results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join(' ');
        
        setInterimText(transcript);

        if (results[results.length - 1].isFinal) {
          cleanup();
          resolve(transcript.trim());
        }
      };
      
      const onEnd = () => {
        cleanup();
        resolve('');
      };

      const onError = (event: any) => {
        console.error("Speech recognition error:", event.error, event.message);
        cleanup();
        if (event.error === 'no-speech' || event.error === 'aborted') {
          resolve('');
        } else {
          reject(new Error(event.error));
        }
      };

      const cleanup = () => {
        try {
          recognition.removeEventListener('result', onResult);
          recognition.removeEventListener('end', onEnd);
          recognition.removeEventListener('error', onError);
          recognition.stop();
        } catch (e) {
          // Ignore
        }
        setIsListening(false);
      };

      recognition.addEventListener('result', onResult);
      recognition.addEventListener('end', onEnd);
      recognition.addEventListener('error', onError);

      try {
        recognition.start();
      } catch (err) {
        console.warn("SpeechRecognition start error:", err);
        cleanup();
        reject(err);
      }
    });
  };

  return { isListening, voiceState, setVoiceState, tempRegNo, setTempRegNo, speak, listenForInput, interimText, WebSpeechRecognition };
};
