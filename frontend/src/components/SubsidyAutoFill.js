import React, { useState, useEffect, useRef } from 'react';
import { applySubsidy, updateSubsidyApplication } from '../utils/api';

const STEPS = [
  {
    id: 'farmer_name',
    question: 'What is your full name?',
    voicePrompt: 'Welcome! Let\'s fill your application. What is your full name? You can speak now.',
    icon: '👤',
    type: 'text',
    placeholder: 'e.g. Rajesh Kumar'
  },
  {
    id: 'mobile',
    question: 'What is your mobile number?',
    voicePrompt: 'Great. Please tell me your 10-digit mobile number.',
    icon: '📱',
    type: 'tel',
    placeholder: '10 digit number'
  },
  {
    id: 'state',
    question: 'Which state are you from?',
    voicePrompt: 'Which state do you live in? For example, Karnataka or Maharashtra.',
    icon: '📍',
    type: 'select',
    options: ['Karnataka', 'Maharashtra', 'Punjab', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Uttar Pradesh']
  },
  {
    id: 'land_acres',
    question: 'What is your total land size in acres?',
    voicePrompt: 'How many acres of land do you have?',
    icon: '🌾',
    type: 'number',
    placeholder: 'e.g. 5'
  },
  {
    id: 'crop',
    question: 'Which crop are you growing currently?',
    voicePrompt: 'Which crop are you currently growing?',
    icon: '🌽',
    type: 'text',
    placeholder: 'e.g. Wheat, Rice, Sugarcane'
  },
  {
    id: 'farmer_category',
    question: 'What type of farmer are you?',
    voicePrompt: 'Are you a small, marginal, or large farmer?',
    icon: '👨‍🌾',
    type: 'select',
    options: ['small', 'marginal', 'large']
  }
];

export default function SubsidyAutoFill({ subsidy, onClose, onComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [applicationId, setApplicationId] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const currentStep = STEPS[currentStepIndex];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setInterimTranscript(transcript);
        if (event.results[0].isFinal) {
          handleAnswer(transcript);
        }
      };

      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }

    speak(STEPS[0].voicePrompt);

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      startListening();
    };
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setInterimTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) { console.error(e); }
    }
  };

  const handleAnswer = async (val) => {
    const fieldId = STEPS[currentStepIndex].id;
    const newAnswers = { ...answers, [fieldId]: val };
    setAnswers(newAnswers);
    setInterimTranscript('');

    // Progressive Sync to Backend
    try {
      if (!applicationId) {
        // First step: Initialize
        const res = await applySubsidy({
          subsidy_id: subsidy.id,
          [fieldId]: val,
          status: 'draft'
        });
        setApplicationId(res.data.id);
      } else {
        // Subsequent steps: Patch
        await updateSubsidyApplication(applicationId, { [fieldId]: val });
      }
    } catch (e) {
      console.warn('Background sync failed, will retry later:', e);
    }

    if (currentStepIndex < STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setTimeout(() => {
        speak(STEPS[nextIndex].voicePrompt);
      }, 500);
    } else {
      setIsReviewing(true);
      speak('I have collected all details for the ' + subsidy.name + '. Would you like to submit or edit?');
    }
  };

  const handleManualInput = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      const input = document.getElementById(`input-${currentStep.id}`);
      if (input && input.value) {
        handleAnswer(input.value);
      }
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Finalize the application
      const result = await updateSubsidyApplication(applicationId, { status: 'submitted' });
      onComplete(result);
    } catch (e) {
      setError('Failed to submit. Please try again.');
      setSubmitting(false);
    }
  };

  if (isReviewing) {
    return (
      <div className="voice-flow-container" style={{ padding: '30px 20px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Review Application</h2>
        <p style={{ color: '#6b7280', marginBottom: 25 }}>{subsidy.name}</p>
        
        <div className="review-list" style={{ background: 'white', borderRadius: 20, padding: 20, textAlign: 'left', marginBottom: 30, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          {STEPS.map(step => (
            <div key={step.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>{step.icon} {step.question}</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{answers[step.id] || '---'}</span>
            </div>
          ))}
        </div>

        {error && <div style={{ color: '#dc2626', marginBottom: 15, fontSize: 14 }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn-primary" style={{ width: '100%', height: 55, fontSize: 17 }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Confirm & Submit ✅'}
          </button>
          <button className="btn-secondary" style={{ width: '100%', height: 50 }} onClick={() => {
            setIsReviewing(false);
            setCurrentStepIndex(0);
            speak('Okay, let\'s start over. ' + STEPS[0].voicePrompt);
          }}>
            Edit Answers ✏️
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-flow-container">
      <div style={{ height: 6, background: '#eee', borderRadius: 3, marginBottom: 40, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#2d6a2d', width: `${((currentStepIndex + 1) / STEPS.length) * 100}%`, transition: 'width 0.4s ease' }}></div>
      </div>

      <div style={{ background: 'white', padding: '40px 30px', borderRadius: 30, boxShadow: '0 15px 40px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>{currentStep.icon}</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 30, lineHeight: 1.3 }}>{currentStep.question}</h2>
        
        <div style={{ minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {isListening ? (
            <div className="listening-ui">
              <div className="mic-pulse"></div>
              <p style={{ color: '#2d6a2d', fontWeight: 700, marginTop: 15 }}>Listening...</p>
              <p style={{ color: '#6b7280', fontSize: 15, marginTop: 10, fontStyle: 'italic' }}>"{interimTranscript || 'Speak now...'}"</p>
            </div>
          ) : isSpeaking ? (
            <div className="speaking-ui">
              <div className="sound-bars">
                <span></span><span></span><span></span><span></span>
              </div>
              <p style={{ color: '#6b7280', marginTop: 15 }}>Asking question...</p>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              {currentStep.type === 'select' ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                  {currentStep.options.map(opt => (
                    <button key={opt} className="option-pill" onClick={() => handleAnswer(opt)}>{opt}</button>
                  ))}
                </div>
              ) : (
                <div style={{ position: 'relative', width: '100%' }}>
                  <input 
                    id={`input-${currentStep.id}`}
                    type={currentStep.type} 
                    placeholder={currentStep.placeholder}
                    className="smart-input"
                    onKeyDown={handleManualInput}
                    autoFocus
                  />
                  <button className="smart-submit" onClick={handleManualInput}>→</button>
                </div>
              )}
              <button 
                style={{ marginTop: 25, background: 'none', border: 'none', color: '#2d6a2d', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, margin: '25px auto 0' }}
                onClick={startListening}
              >
                🎙️ Tap to speak instead
              </button>
            </div>
          )}
        </div>

        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: 20 }}>
          <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>Step {currentStepIndex + 1} of {STEPS.length}</span>
          <button style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 13, fontWeight: 700, cursor: 'pointer' }} onClick={onClose}>Exit</button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .mic-pulse {
          width: 70px; height: 70px; background: rgba(45, 106, 45, 0.1); border-radius: 50%;
          border: 4px solid #2d6a2d; animation: pulse-mic 1.5s infinite;
        }
        @keyframes pulse-mic {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(45, 106, 45, 0.4); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(45, 106, 45, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(45, 106, 45, 0); }
        }
        .smart-input {
          width: 100%; padding: 18px 60px 18px 20px; border: 2px solid #e5e7eb; border-radius: 15px;
          font-size: 18px; outline: none; transition: border-color 0.2s;
        }
        .smart-input:focus { border-color: #2d6a2d; }
        .smart-submit {
          position: absolute; right: 10px; top: 10px; bottom: 10px; width: 45px;
          background: #2d6a2d; color: white; border: none; border-radius: 10px;
          font-size: 20px; cursor: pointer;
        }
        .option-pill {
          padding: 14px 24px; background: #f3f4f6; border: 2px solid transparent;
          border-radius: 30px; cursor: pointer; font-weight: 700; transition: all 0.2s;
        }
        .option-pill:hover { background: #e8f5e9; border-color: #2d6a2d; color: #2d6a2d; }
        .sound-bars { display: flex; align-items: flex-end; gap: 4px; height: 30px; }
        .sound-bars span { width: 4px; background: #2d6a2d; border-radius: 2px; animation: bar-anim 1s infinite alternate; }
        .sound-bars span:nth-child(2) { animation-delay: 0.2s; }
        .sound-bars span:nth-child(3) { animation-delay: 0.4s; }
        .sound-bars span:nth-child(4) { animation-delay: 0.1s; }
        @keyframes bar-anim { from { height: 5px; } to { height: 30px; } }
      `}} />
    </div>
  );
}
