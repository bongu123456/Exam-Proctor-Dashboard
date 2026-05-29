import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, Timer, AlertOctagon, HelpCircle, ChevronLeft, ChevronRight, 
  Video, Eye, RefreshCw, CheckCircle, Maximize2, AlertTriangle 
} from 'lucide-react';

const ExamSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiFetch, user } = useAuth();

  // State Management
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation & Answers
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionIndex: selectedOptionIndex }
  const [examStarted, setExamStarted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Proctoring States
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds (default, overwritten by exam duration)
  const [violationsCount, setViolationsCount] = useState(0);
  const [violationsLog, setViolationsLog] = useState([]);
  const [webcamActive, setWebcamActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [examTerminated, setExamTerminated] = useState(false);
  const [webcamBlockedInfo, setWebcamBlockedInfo] = useState(false);

  // References
  const videoRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const timerRef = useRef(null);

  // Violation Threshold Constant
  const VIOLATION_LIMIT = 3;

  // 1. Fetch Exam Data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await apiFetch(`/api/exams/${id}`);
        if (!response.ok) {
          throw new Error('Could not fetch exam session details.');
        }
        const data = await response.json();
        setExam(data);

        // Determine if there is a saved state in localStorage for this exam
        const cacheKey = `proctor_cache_${user.id}_${id}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          try {
            const cachedData = JSON.parse(cached);
            setAnswers(cachedData.answers || {});
            setCurrentIdx(cachedData.currentIdx || 0);
            setTimeLeft(cachedData.timeLeft);
            setViolationsCount(cachedData.violationsCount || 0);
            setViolationsLog(cachedData.violationsLog || []);
            setExamStarted(true);
            addProctorLog('System Resume', 'Exam state recovered from auto-save.');
          } catch (e) {
            // Broken cache, use default
            setTimeLeft(data.duration * 60);
          }
        } else {
          setTimeLeft(data.duration * 60);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  // 2. Handle Webcam Access
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false });
      webcamStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setWebcamActive(true);
      setWebcamBlockedInfo(false);
      addProctorLog('Webcam On', 'Student video feed successfully initialized.');
    } catch (err) {
      console.error('Camera access error:', err);
      setWebcamActive(false);
      setWebcamBlockedInfo(true);
      addProctorLog('Webcam Blocked', 'Camera access was denied or unavailable. Flagged infraction.');
      handleInfraction('Webcam Off', 'Camera feed was blocked or unavailable.');
    }
  };

  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setWebcamActive(false);
  };

  // Clean up webcam on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  // 3. Proctoring Infraction Handlers
  const addProctorLog = (type, description) => {
    const timestamp = new Date();
    setViolationsLog(prev => [
      ...prev,
      { type, timestamp: timestamp.toISOString(), description }
    ]);
  };

  const handleInfraction = (type, description) => {
    setViolationsCount(prev => {
      const newCount = prev + 1;
      
      // Auto-submit exam if infractions reach standard limit
      if (newCount >= VIOLATION_LIMIT) {
        setExamTerminated(true);
        triggerAutoSubmit(newCount, [
          ...violationsLog,
          { type, timestamp: new Date().toISOString(), description: `${description} [LIMIT EXCEEDED]` }
        ]);
        return newCount;
      }

      // Display warning modal/text
      setWarningMessage(`🚨 PROCTOR WARNING: ${type}! ${description} (Warning ${newCount}/${VIOLATION_LIMIT})`);
      setTimeout(() => {
        setWarningMessage('');
      }, 5000);

      addProctorLog(type, description);
      return newCount;
    });
  };

  // 4. Tab Visibility & Minimize & Focus Listeners
  useEffect(() => {
    if (!examStarted || examTerminated) return;

    // A. Detect Tab switches using Page Visibility API
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleInfraction('Tab Switch', 'Switched away from the testing browser tab.');
      }
    };

    // B. Detect Window Blur (clicking on other apps/inspector tools)
    const handleWindowBlur = () => {
      handleInfraction('Focus Loss', 'Clicked outside the exam window boundaries.');
    };

    // C. Detect Fullscreen Exit
    const handleFullscreenChange = () => {
      const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
      setIsFullscreen(isFull);
      if (!isFull) {
        handleInfraction('Fullscreen Exit', 'Exited the mandatory fullscreen environment.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [examStarted, examTerminated, violationsLog]);

  // 5. Timer Loop & Cache auto-saver
  useEffect(() => {
    if (!examStarted || examTerminated) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          triggerAutoSubmit(violationsCount, violationsLog, 'Timer Expired', 'Exam auto-submitted due to timer expiration.');
          return 0;
        }
        
        // Cache progress every 5 seconds
        const newTime = prev - 1;
        if (newTime % 5 === 0) {
          saveCache(newTime);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [examStarted, examTerminated, answers, currentIdx, violationsCount, violationsLog]);

  // Auto-save helper
  const saveCache = async (time) => {
    setSavingProgress(true);
    const cacheKey = `proctor_cache_${user.id}_${id}`;
    localStorage.setItem(cacheKey, JSON.stringify({
      answers,
      currentIdx,
      timeLeft: time,
      violationsCount,
      violationsLog
    }));
    setTimeout(() => setSavingProgress(false), 500);
  };

  // Clear auto-save cache helper
  const clearCache = () => {
    const cacheKey = `proctor_cache_${user.id}_${id}`;
    localStorage.removeItem(cacheKey);
  };

  // 6. Action Functions
  const enterFullscreen = async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) await docEl.requestFullscreen();
      else if (docEl.webkitRequestFullscreen) await docEl.webkitRequestFullscreen();
      else if (docEl.msRequestFullscreen) await docEl.msRequestFullscreen();
      setIsFullscreen(true);
    } catch (e) {
      console.warn('Fullscreen request failed:', e);
    }
  };

  const handleBeginExam = async () => {
    await enterFullscreen();
    await startWebcam();
    setExamStarted(true);
    addProctorLog('Exam Started', 'Exam proctoring environment successfully locked.');
  };

  const handleAnswerSelect = (optionIdx) => {
    setAnswers(prev => {
      const updated = { ...prev, [currentIdx]: optionIdx };
      // Save state immediately
      const cacheKey = `proctor_cache_${user.id}_${id}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        answers: updated,
        currentIdx,
        timeLeft,
        violationsCount,
        violationsLog
      }));
      return updated;
    });
  };

  const triggerAutoSubmit = async (vCount, vLog, reasonType = 'Proctor Lock', reasonDesc = 'Infraction limit exceeded. Submitting answers.') => {
    clearInterval(timerRef.current);
    stopWebcam();
    
    // Attempt to exit fullscreen on force submit
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (e) {}

    addProctorLog(reasonType, reasonDesc);

    const submissionData = {
      answers,
      violationsCount: vCount,
      violationsLog: [
        ...vLog,
        { type: reasonType, timestamp: new Date().toISOString(), description: reasonDesc }
      ],
      status: 'auto-submitted'
    };

    try {
      const res = await apiFetch(`/api/exams/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify(submissionData)
      });
      if (res.ok) {
        clearCache();
        const data = await res.json();
        navigate(`/submission/${data._id || data.id}`);
      } else {
        throw new Error('Auto-submit failed at server level.');
      }
    } catch (e) {
      setError('Critical Error: Failed to secure exam submission. Saving to offline storage.');
      // Keep offline fallback in localStorage in case of extreme drop
      localStorage.setItem(`proctor_offline_submission_${id}`, JSON.stringify(submissionData));
    }
  };

  const handleManualSubmit = async () => {
    if (window.confirm('Are you absolutely sure you want to finish and submit your mock exam? You cannot modify answers after submission.')) {
      clearInterval(timerRef.current);
      stopWebcam();
      
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch (e) {}

      addProctorLog('User Submit', 'Student completed and submitted the mock test.');

      try {
        const res = await apiFetch(`/api/exams/${id}/submit`, {
          method: 'POST',
          body: JSON.stringify({
            answers,
            violationsCount,
            violationsLog: [
              ...violationsLog,
              { type: 'User Submit', timestamp: new Date().toISOString(), description: 'Student submitted the exam.' }
            ],
            status: 'completed'
          })
        });

        if (res.ok) {
          clearCache();
          const data = await res.json();
          navigate(`/submission/${data._id || data.id}`);
        } else {
          throw new Error('Submission failed.');
        }
      } catch (err) {
        setError('Error submitting exam. Please try again.');
      }
    }
  };

  // Helper formatting for clock display
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh', color: 'var(--text-main)' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255, 255, 255,0.05)',
          borderTopColor: '#7c3aed',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{ marginLeft: '12px', color: '#9ca3af' }}>Locking security gates...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error && !examStarted) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <AlertOctagon size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>Initialization Error</h2>
          <p style={{ color: '#9ca3af', marginBottom: '24px' }}>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  // Guidelines overlay screen BEFORE clicking Begin Exam
  if (!examStarted) {
    return (
      <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Shield size={32} color="#7c3aed" style={{ filter: 'drop-shadow(0 0 10px rgba(124,58,237,0.4))' }} />
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Integrity Checkpoint</h2>
              <p style={{ color: '#9ca3af', fontSize: '13px' }}>ProctorShield Secure Verification</p>
            </div>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>{exam?.title}</h3>
          <p style={{ color: '#9ca3af', fontSize: '14.5px', marginBottom: '24px', lineHeight: 1.6 }}>
            By continuing, you authorize ProctorShield to request access to your webcam stream for local focus monitoring, 
            and to lock your browser into fullscreen mode. You must not navigate away, minimize this window, or exit 
            fullscreen during the {exam?.duration}-minute duration.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '10px', fontSize: '13.5px', color: '#e5e7eb' }}>
              <span>🖥️</span> <strong>Fullscreen Locking:</strong> The browser must remain locked at maximum boundaries.
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '13.5px', color: '#e5e7eb' }}>
              <span>📷</span> <strong>Camera Streaming:</strong> WebRTC camera check will trigger on startup.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '12px 24px' }}>
              Abort Test
            </button>
            <button onClick={handleBeginExam} className="btn btn-primary" style={{ padding: '12px 30px' }}>
              Launch Secure Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeQuestion = exam?.questions[currentIdx];

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', minHeight: '90vh' }}>
      
      {/* 7. Critical warning popups (Page visibility warnings) */}
      {warningMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(239, 68, 68, 0.95)',
          color: 'var(--text-main)',
          padding: '16px 28px',
          borderRadius: '12px',
          zIndex: 1100,
          fontWeight: 700,
          fontSize: '15px',
          boxShadow: '0 10px 30px rgba(239,68,68,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255,0.2)'
        }}>
          <AlertTriangle size={20} />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* 8. Fullscreen Lock Restorer Button if they escape */}
      {!isFullscreen && !examTerminated && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#f59e0b',
          borderRadius: '10px',
          padding: '12px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '14px',
          fontWeight: 600
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} />
            Mandatory Fullscreen Interrupted! You must return to Fullscreen to complete the exam.
          </span>
          <button onClick={enterFullscreen} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', borderColor: '#f59e0b', color: '#f59e0b' }}>
            <Maximize2 size={12} /> Lock Fullscreen
          </button>
        </div>
      )}

      {/* Main Split Interface Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7.2fr) minmax(0, 2.8fr)', gap: '24px' }}>
        
        {/* ================= LEFT CONTENT AREA (QUESTIONS) ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Bar */}
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{exam?.title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>Question {currentIdx + 1} of {exam?.totalQuestions}</span>
                {savingProgress && (
                  <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RefreshCw size={10} style={{ animation: 'spin 1s linear infinite' }} /> Auto-saving answers...
                  </span>
                )}
              </div>
            </div>

            {/* Glowing Timer */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              padding: '8px 18px',
              borderRadius: '20px',
              background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255,0.03)',
              border: `1px solid ${timeLeft < 60 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255,0.06)'}`,
              color: timeLeft < 60 ? '#ef4444' : '#ffffff',
              fontWeight: 700,
              fontSize: '16px',
              transition: 'all 0.3s'
            }}>
              <Timer size={18} style={{ animation: timeLeft < 60 ? 'pulse 1s infinite' : 'none' }} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Active Question Box */}
          <div className="glass-card" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Question Text */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'flex-start' }}>
                <HelpCircle size={22} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, lineHeight: 1.5 }}>
                  {activeQuestion?.questionText}
                </h3>
              </div>

              {/* Multiple Choice Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeQuestion?.options.map((opt, optIdx) => {
                  const isSelected = answers[currentIdx] === optIdx;
                  return (
                    <label 
                      key={optIdx} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(124, 58, 237, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${isSelected ? '#7c3aed' : 'rgba(255, 255, 255, 0.06)'}`,
                        color: isSelected ? '#ffffff' : '#e5e7eb',
                        fontWeight: isSelected ? 600 : 500,
                        transition: 'all 0.2s'
                      }}
                      className="option-hover"
                    >
                      <input 
                        type="radio" 
                        name={`question_${currentIdx}`} 
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(optIdx)}
                        style={{
                          accentColor: '#7c3aed',
                          width: '18px',
                          height: '18px'
                        }}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Navigation Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255,0.05)' }}>
              <button 
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                className="btn btn-secondary"
                disabled={currentIdx === 0}
                style={{ padding: '10px 18px', opacity: currentIdx === 0 ? 0.4 : 1 }}
              >
                <ChevronLeft size={16} /> Back
              </button>

              {currentIdx < (exam?.totalQuestions - 1) ? (
                <button 
                  onClick={() => setCurrentIdx(prev => Math.min(exam.totalQuestions - 1, prev + 1))}
                  className="btn btn-secondary"
                  style={{ padding: '10px 18px' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={handleManualSubmit}
                  className="btn btn-success"
                  style={{ padding: '10px 24px', fontWeight: 700 }}
                >
                  <CheckCircle size={16} /> Complete Exam
                </button>
              )}
            </div>
          </div>

          {/* Quick Jumper Navigation Grid */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#9ca3af', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Questions Overview
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {exam?.questions.map((_, qIndex) => {
                const isAnswered = answers[qIndex] !== undefined;
                const isCurrent = qIndex === currentIdx;

                let btnBg = 'rgba(255, 255, 255,0.03)';
                let btnBorder = 'rgba(255, 255, 255,0.06)';
                let btnColor = '#9ca3af';

                if (isAnswered) {
                  btnBg = 'rgba(16, 185, 129, 0.15)';
                  btnBorder = 'rgba(16, 185, 129, 0.3)';
                  btnColor = '#10b981';
                }
                if (isCurrent) {
                  btnBg = 'rgba(124, 58, 237, 0.2)';
                  btnBorder = '#7c3aed';
                  btnColor = '#ffffff';
                }

                return (
                  <button
                    key={qIndex}
                    onClick={() => setCurrentIdx(qIndex)}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: btnBg,
                      border: `1px solid ${btnBorder}`,
                      color: btnColor,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {qIndex + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL (PROCTOR MONITORING) ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Webcam Feed Box */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Video size={18} color="#7c3aed" />
                <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Proctor Camera Feed</h4>
              </div>
              <div className={`webcam-overlay ${webcamActive ? 'overlay-active' : 'overlay-inactive'}`}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: webcamActive ? '#10b981' : '#ef4444'
                }}></div>
                <span>{webcamActive ? 'Active' : 'Blocked'}</span>
              </div>
            </div>

            <div className="webcam-container">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="webcam-feed"
              />
              {webcamBlockedInfo && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  background: 'rgba(15,10,10,0.85)',
                  textAlign: 'center'
                }}>
                  <AlertTriangle size={24} color="#ef4444" style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#fca5a5' }}>Camera Disabled</p>
                  <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>Infraction flagged. Enable webcam access to clear.</p>
                  <button onClick={startWebcam} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '9px', marginTop: '8px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                    Try Re-connecting
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Infraction Meter */}
          <div className={`glass-card ${violationsCount >= VIOLATION_LIMIT - 1 ? 'critical-violation' : ''}`} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertOctagon size={16} color="#ef4444" />
                <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Proctor Suspicion Index</h4>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#ef4444' }}>
                {violationsCount} / {VIOLATION_LIMIT}
              </span>
            </div>

            {/* Visual infraction progress bar */}
            <div style={{
              height: '8px',
              background: 'rgba(255, 255, 255,0.05)',
              borderRadius: '10px',
              overflow: 'hidden',
              marginBottom: '10px'
            }}>
              <div style={{
                height: '100%',
                background: violationsCount === 0 
                  ? '#10b981' 
                  : violationsCount === 1 
                  ? '#f59e0b' 
                  : '#ef4444',
                width: `${(violationsCount / VIOLATION_LIMIT) * 100}%`,
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}></div>
            </div>
            
            <p style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.4 }}>
              Exceeding {VIOLATION_LIMIT} proctor infractions triggers immediate automated termination and auto-submits answers.
            </p>
          </div>

          {/* Real-time Event timeline */}
          <div className="glass-card" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#9ca3af', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Security Event Timeline
            </h4>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              maxHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '12px',
              paddingRight: '6px'
            }}>
              {violationsLog.length === 0 ? (
                <div style={{ color: '#6b7280', fontStyle: 'italic', padding: '10px 0' }}>
                  No security incidents logged. Clean feed active.
                </div>
              ) : (
                violationsLog.slice().reverse().map((log, idx) => {
                  const logTime = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  let color = '#38bdf8'; // Cyan default
                  if (log.type === 'Tab Switch' || log.type === 'Focus Loss' || log.type === 'Fullscreen Exit' || log.type === 'Webcam Off') {
                    color = '#f87171'; // Red danger
                  }
                  
                  return (
                    <div key={idx} style={{
                      padding: '8px 10px',
                      background: 'rgba(255, 255, 255,0.01)',
                      borderLeft: `2px solid ${color}`,
                      borderRadius: '4px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--text-main)', marginBottom: '2px' }}>
                        <span>{log.type}</span>
                        <span style={{ color: '#6b7280', fontSize: '10px' }}>{logTime}</span>
                      </div>
                      <p style={{ color: '#9ca3af', fontSize: '11px', lineHeight: 1.3 }}>{log.description}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= LOCKDOWN FULL-SCREEN TERMINATION OVERLAY ================= */}
      {examTerminated && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#090505',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div className="glass-card" style={{ maxWidth: '500px', padding: '40px 32px', borderColor: 'rgba(239, 68, 68, 0.4)', boxShadow: '0 0 50px rgba(239,68,68,0.2)' }}>
            <AlertOctagon size={56} color="#ef4444" style={{ marginBottom: '20px', animation: 'bounce 1s infinite' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444', marginBottom: '12px' }}>Session Terminated</h2>
            <p style={{ color: 'var(--text-main)', fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
              Standard integrity limit breached.
            </p>
            <p style={{ color: '#9ca3af', fontSize: '13.5px', lineHeight: 1.6, marginBottom: '24px' }}>
              Your exam has been automatically closed and submitted due to multiple infractions flagged by our local proctor engines. 
              The statistics have been logged to the coordinator panel.
            </p>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255, 255, 255,0.05)',
              borderTopColor: '#ef4444',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Securing database entry...</p>
          </div>
          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
          `}</style>
        </div>
      )}
      
      <style>{`
        .option-hover {
          transition: all 0.2s;
        }
        .option-hover:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255,0.12) !important;
        }
      `}</style>
    </div>
  );
};

export default ExamSession;
