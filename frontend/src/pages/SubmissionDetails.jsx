import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, Trophy, ChevronLeft, AlertOctagon, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const SubmissionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiFetch } = useAuth();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await apiFetch(`/api/submissions/${id}`);
        if (!res.ok) {
          throw new Error('Could not find mock submission details.');
        }
        const data = await res.json();
        setSubmission(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-main)' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255, 255, 255,0.05)',
          borderTopColor: '#7c3aed',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{ marginLeft: '12px', color: '#9ca3af' }}>Re-evaluating integrity logs...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <AlertOctagon size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>Record Unavailable</h2>
          <p style={{ color: '#9ca3af', marginBottom: '24px' }}>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const scorePercent = submission ? Math.round((submission.score / submission.totalQuestions) * 100) : 0;
  const isAutoSubmitted = submission?.status === 'auto-submitted';

  return (
    <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* 1. Header Banner */}
      <button 
        onClick={() => navigate('/dashboard')}
        className="btn btn-secondary"
        style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <ChevronLeft size={14} /> Back to Dashboard
      </button>

      {/* 2. Integrity Lock Alert if Cheating Detected */}
      {isAutoSubmitted && (
        <div className="glass-card" style={{ 
          borderColor: 'rgba(239, 68, 68, 0.3)', 
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), transparent)',
          marginBottom: '32px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ef4444', marginBottom: '4px' }}>
              Forced Proctor Submission Engaged
            </h3>
            <p style={{ color: '#fca5a5', fontSize: '13.5px', lineHeight: 1.5 }}>
              This session was terminated and auto-submitted because the proctor engines logged multiple browser tab-switches, 
              focus losses, or camera failures. Your answered questions have been saved and scored.
            </p>
          </div>
        </div>
      )}

      {/* 3. Main Grade Score Circle Card */}
      <div className="glass-card" style={{ 
        textAlign: 'center', 
        padding: '48px 32px', 
        background: 'linear-gradient(135deg, rgba(255, 255, 255,0.02), rgba(255, 255, 255,0.01))',
        marginBottom: '40px' 
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '128px',
          height: '128px',
          borderRadius: '50%',
          background: scorePercent >= 50 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `4px solid ${scorePercent >= 50 ? '#10b981' : '#ef4444'}`,
          color: scorePercent >= 50 ? '#10b981' : '#ef4444',
          marginBottom: '24px',
          boxShadow: scorePercent >= 50 ? '0 0 20px rgba(16, 185, 129, 0.2)' : '0 0 20px rgba(239, 68, 68, 0.2)',
          fontSize: '36px',
          fontWeight: 800
        }}>
          {scorePercent}%
        </div>

        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }} className="gradient-text">
          {submission?.exam?.title}
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
          Completed on {new Date(submission?.submittedAt).toLocaleDateString()} at {new Date(submission?.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '40px', 
          borderTop: '1px solid rgba(255, 255, 255,0.05)', 
          paddingTop: '24px',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <div>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Questions Correct</span>
            <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Trophy size={16} color="#f59e0b" />
              <span>{submission?.score} / {submission?.totalQuestions}</span>
            </div>
          </div>

          <div style={{ width: '1px', background: 'rgba(255, 255, 255,0.05)' }}></div>

          <div>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Proctor Violations</span>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: 800, 
              marginTop: '4px', 
              color: submission?.violationsCount > 0 ? '#ef4444' : '#10b981', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px' 
            }}>
              {submission?.violationsCount > 0 ? (
                <>
                  <AlertTriangle size={16} />
                  <span>{submission.violationsCount} infractions</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>0 Cleared</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Question Response Analysis List */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Question-by-Question Review</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {submission?.exam?.questions.map((q, idx) => {
            const studentAnswerIdx = submission.answers[idx.toString()] !== undefined 
              ? submission.answers[idx.toString()] 
              : submission.answers[idx];
            const isCorrect = studentAnswerIdx !== undefined && Number(studentAnswerIdx) === q.correctOption;

            return (
              <div 
                key={idx} 
                className="glass-card" 
                style={{ 
                  borderLeft: `4px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                  padding: '24px'
                }}
              >
                {/* Question Details */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '16px' }}>
                  {isCorrect ? (
                    <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '3px' }} />
                  ) : (
                    <XCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '3px' }} />
                  )}
                  <h4 style={{ fontSize: '15.5px', fontWeight: 600, lineHeight: 1.4 }}>
                    Q{idx + 1}: {q.questionText}
                  </h4>
                </div>

                {/* Option Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', paddingLeft: '28px' }}>
                  {q.options.map((opt, optIdx) => {
                    const isPicked = Number(studentAnswerIdx) === optIdx;
                    const isCorrectOpt = q.correctOption === optIdx;

                    let optColor = '#9ca3af';
                    let optBg = 'transparent';
                    let labelTag = '';

                    if (isPicked) {
                      optColor = '#ef4444';
                      optBg = 'rgba(239, 68, 68, 0.04)';
                      labelTag = ' (Your Answer)';
                    }
                    if (isCorrectOpt) {
                      optColor = '#10b981';
                      optBg = 'rgba(16, 185, 129, 0.04)';
                      labelTag = isPicked ? ' (Correct & Your Answer)' : ' (Correct Answer)';
                    }

                    return (
                      <div 
                        key={optIdx} 
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: optBg,
                          color: optColor,
                          border: `1px solid ${optBg !== 'transparent' ? 'rgba(255, 255, 255,0.02)' : 'transparent'}`,
                          fontWeight: isPicked || isCorrectOpt ? 600 : 400
                        }}
                      >
                        {optIdx + 1}. {opt} <span style={{ fontSize: '12px', fontWeight: 700 }}>{labelTag}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default SubmissionDetails;
