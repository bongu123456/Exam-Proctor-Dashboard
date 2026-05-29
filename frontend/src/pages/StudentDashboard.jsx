import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Calendar, HelpCircle, Trophy, Play, 
  ShieldAlert, Award, Clock, Activity, ArrowRight, CheckCircle 
} from 'lucide-react';

const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedExam, setSelectedExam] = useState(null);
  
  const { apiFetch, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const examsRes = await apiFetch('/api/exams');
        if (examsRes.ok) {
          const examsData = await examsRes.json();
          setExams(examsData);
        }

        const submissionsRes = await apiFetch('/api/submissions');
        if (submissionsRes.ok) {
          const submissionsData = await submissionsRes.json();
          setSubmissions(submissionsData);
        }
      } catch (err) {
        setError('Failed to fetch dashboard data. Please check connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStartClick = (exam) => {
    setSelectedExam(exam);
  };

  const proceedToExam = () => {
    if (selectedExam) {
      navigate(`/exam/${selectedExam._id || selectedExam.id}`);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-main)' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border-glass)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{ marginLeft: '12px', color: 'var(--text-muted)' }}>Loading your dashboard...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Calculate some basic stats
  const completedExamsCount = submissions.length;
  let averageScore = 0;
  if (completedExamsCount > 0) {
    let totalScorePercent = 0;
    submissions.forEach(sub => {
      totalScorePercent += sub.totalQuestions > 0 ? (sub.score / sub.totalQuestions) * 100 : 0;
    });
    averageScore = Math.round(totalScorePercent / completedExamsCount);
  }
  const pendingExamsCount = exams.length;

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* 1. HERO WELCOME SECTION */}
      <div className="glass-card" style={{ 
        marginBottom: '40px', 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08) 50%, rgba(59, 130, 246, 0.05))',
        borderLeft: '4px solid var(--color-primary)',
        boxShadow: '0 0 40px rgba(99, 102, 241, 0.1), var(--shadow-premium)',
        padding: '36px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decorative circles */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--color-primary)', filter: 'blur(100px)', opacity: 0.2, borderRadius: '50%', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-50px', right: '100px', width: '150px', height: '150px', background: 'var(--color-accent)', filter: 'blur(80px)', opacity: 0.15, borderRadius: '50%', pointerEvents: 'none' }}></div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: '1 1 500px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '10px' }}>
              Welcome Back, <span className="gradient-text">{user?.name} 👋</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '600px', lineHeight: 1.6, marginBottom: '24px' }}>
              Ready to continue your exams and track your progress? Your learning journey is right on schedule. Keep up the great work!
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => document.getElementById('upcoming-exams').scrollIntoView({ behavior: 'smooth' })} className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '30px' }}>
                View Upcoming Exams <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Quick Stats Grid inside Hero */}
          <div style={{ display: 'flex', gap: '16px', flex: '0 1 auto' }}>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '20px 24px', minWidth: '140px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                <Clock size={16} color="var(--color-accent)" /> Pending
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>{pendingExamsCount}</div>
            </div>
            
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '20px 24px', minWidth: '140px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                <Activity size={16} color="var(--color-primary)" /> Avg Score
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>{averageScore}%</div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '20px 24px', minWidth: '140px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                <CheckCircle size={16} color="var(--color-success)" /> Completed
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>{completedExamsCount}</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '30px' }}>
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }}>
        
        {/* 2. UPCOMING EXAMS SECTION */}
        <div id="upcoming-exams">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '10px' }}>
              <BookOpen size={20} color="var(--color-primary)" />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>Upcoming Exams</h3>
          </div>
          
          {exams.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(17, 24, 39, 0.4)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Awesome! You have no pending mock exams assigned to your account.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {exams.map(exam => (
                <div key={exam._id || exam.id} className="glass-card glass-card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '28px' }}>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.4 }}>{exam.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6, minHeight: '44px' }}>
                      {exam.description || 'No description provided.'}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', fontSize: '13px', color: 'var(--text-dark)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                        <Clock size={14} color="var(--color-primary)" />
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{exam.duration} Mins</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                        <HelpCircle size={14} color="var(--color-secondary)" />
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{exam.totalQuestions} Qs</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleStartClick(exam)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px', borderRadius: '12px' }}
                  >
                    <Play size={15} fill="#ffffff" /> Start Exam
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. PAST ATTEMPTS SECTION */}
        <div id="past-attempts">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '10px' }}>
              <Award size={20} color="var(--color-success)" />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>Performance Overview</h3>
          </div>

          {submissions.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(17, 24, 39, 0.4)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>You have not completed any exams yet. Your scores and integrity reports will appear here.</p>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Exam Name</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Integrity Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map(sub => {
                      const scorePercent = sub.totalQuestions > 0 ? Math.round((sub.score / sub.totalQuestions) * 100) : 0;
                      let statusBadge = (
                        <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          ✅ Fully Clear (0)
                        </span>
                      );

                      if (sub.status === 'auto-submitted') {
                        statusBadge = (
                          <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            🚨 Auto-Terminated ({sub.violationsCount})
                          </span>
                        );
                      } else if (sub.violationsCount > 0) {
                        statusBadge = (
                          <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                            ⚠️ Suspect ({sub.violationsCount})
                          </span>
                        );
                      }

                      return (
                        <tr key={sub._id || sub.id}>
                          <td style={{ fontWeight: 600 }}>{sub.exam?.title || 'Unknown Exam'}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Trophy size={16} color="#f59e0b" />
                              <span style={{ fontWeight: 700, fontSize: '15px' }}>{sub.score}</span> / {sub.totalQuestions}
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, color: scorePercent >= 50 ? '#10b981' : '#ef4444' }}>
                            {scorePercent}%
                          </td>
                          <td>{statusBadge}</td>
                          <td style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500 }}>
                            {new Date(sub.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guidelines Modal Before Starting Exam */}
      {selectedExam && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '36px', maxWidth: '540px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '10px', borderRadius: '12px' }}>
                <ShieldAlert size={28} color="var(--color-primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Integrity Checkpoint</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Proctor guidelines for {selectedExam.title}</p>
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-main)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span>📷</span> <span style={{ lineHeight: 1.5 }}><strong>Webcam Access</strong> is mandatory. Your video feed is monitored locally to confirm your presence.</span>
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-main)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span>🚫</span> <span style={{ lineHeight: 1.5 }}><strong>Tab switching</strong> or minimizing the window will trigger security violations immediately.</span>
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-main)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span>🔲</span> <span style={{ lineHeight: 1.5 }}><strong>Fullscreen Mode</strong> is required. Exiting fullscreen will count as a proctoring infraction.</span>
              </p>
              <div style={{ height: '1px', background: 'var(--border-glass)', margin: '4px 0' }}></div>
              <p style={{ fontSize: '14px', color: 'var(--color-danger)', display: 'flex', gap: '12px', alignItems: 'flex-start', fontWeight: 600 }}>
                <span>⚠️</span> <span style={{ lineHeight: 1.5 }}><strong>3 Violations</strong> will result in immediate automatic exam submission. Your progress will be sealed.</span>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedExam(null)}
                className="btn btn-secondary"
                style={{ padding: '12px 24px', borderRadius: '12px' }}
              >
                Abort
              </button>
              <button 
                onClick={proceedToExam}
                className="btn btn-primary"
                style={{ padding: '12px 28px', borderRadius: '12px' }}
              >
                Accept & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
