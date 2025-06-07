
import { useEffect, useState, useRef } from 'react';

interface SpeechToTextProps {
  isActive: boolean;
  onTranscriptChange: (text: string) => void;
}

export const SpeechToText: React.FC<SpeechToTextProps> = ({ isActive, onTranscriptChange }) => {
  const recognition = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore - TypeScript doesn't recognize the SpeechRecognition API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en-US';
      
      recognition.current.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            onTranscriptChange(transcript);
          } else {
            interimTranscript += transcript;
            onTranscriptChange(interimTranscript);
          }
        }
      };
      
      recognition.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        
        // Attempt to restart if there was an error
        if (isActive) {
          stopListening();
          setTimeout(startListening, 1000);
        }
      };
      
      recognition.current.onend = () => {
        // Restart if it should be active but ended
        if (isActive && isListening) {
          startListening();
        }
      };
    } else {
      console.error('Speech recognition is not supported in this browser');
      onTranscriptChange('Captions not available (browser not supported)');
    }
    
    return () => {
      stopListening();
    };
  }, [onTranscriptChange]);

  useEffect(() => {
    if (isActive && !isListening && recognition.current) {
      startListening();
    } else if (!isActive && isListening) {
      stopListening();
    }
  }, [isActive, isListening]);

  const startListening = () => {
    try {
      recognition.current?.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  };

  const stopListening = () => {
    try {
      recognition.current?.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  };

  return null; // This component doesn't render anything visible
};

export default SpeechToText;
