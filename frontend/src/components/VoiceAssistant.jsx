import React, { useState, useEffect } from 'react';
import { Mic, MicOff, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (!recognition) return;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      setTranscript(command);
      handleCommand(command);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
    };
  }, []);

  const handleCommand = (command) => {
    if (command.includes('show attendance') || command.includes('dashboard')) {
      setFeedback("Navigating to Dashboard...");
      navigate('/');
    } else if (command.includes('students') || command.includes('show students')) {
      setFeedback("Opening Students list...");
      navigate('/students');
    } else if (command.includes('take attendance') || command.includes('photo')) {
      setFeedback("Opening Photo Attendance...");
      navigate('/photo-attendance');
    } else if (command.includes('timetable') || command.includes('schedule')) {
      setFeedback("Opening Timetable...");
      navigate('/timetable');
    } else if (command.includes('settings')) {
      setFeedback("Opening Settings...");
      navigate('/settings');
    } else {
      setFeedback(`Sorry, I don't know the command: "${command}"`);
    }

    setTimeout(() => setFeedback(''), 3000);
  };

  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      setFeedback('Listening...');
      recognition.start();
      setIsListening(true);
    }
  };

  if (!recognition) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '1rem',
      zIndex: 1000
    }}>
      {feedback && (
        <div style={{
          background: 'rgba(23, 23, 23, 0.9)',
          backdropFilter: 'blur(10px)',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          color: 'white',
          fontSize: '0.9rem',
          border: '1px solid var(--border-glass)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          maxWidth: '250px',
          animation: 'fadeInUp 0.3s'
        }}>
          {feedback}
        </div>
      )}
      
      <button
        onClick={toggleListening}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: isListening ? 'var(--accent-primary)' : 'white',
          color: isListening ? 'white' : 'var(--accent-primary)',
          border: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isListening ? 'scale(1.1)' : 'scale(1)',
          animation: isListening ? 'pulse 2s infinite' : 'none'
        }}
      >
        {isListening ? <Mic size={28} /> : <MicOff size={28} />}
      </button>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(236, 72, 153, 0); }
          100% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;
