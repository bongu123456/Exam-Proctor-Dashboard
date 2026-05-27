import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Calendar, HelpCircle, Trophy, EyeOff, AlertCircle, Play, ShieldAlert, Award } from 'lucide-react';

const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Guideline modal state
  const [selectedExam, setSelectedExam] = useState(null);
  
  const { apiFetch, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch available exams
        const examsRes = await apiFetch('/api/exams');
        if (examsRes.ok) {
          const examsData = await examsRes.json();
          setExams(examsData);
        }

        // Fetch past submissions
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: '#ffffff' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255,255,255,0.05)',
          borderTopColor: '#7c3aed',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{ marginLeft: '12px', color: '#9ca3af' }}>Retrieving student workspace...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Welcome Hero Banner */}
      <div className="glass-card" style={{ 
        marginBottom: '40px', 
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.08) 50%, rgba(6, 182, 212, 0.05))',
        borderLeft: '4px solid #a855f7',
        boxShadow: '0 0 30px rgba(168, 85, 247, 0.1), var(--shadow-premium)',
        padding: '32px'
      }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }} className="gradient-text">
          Welcome back, {user?.name}! 👋
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '15px', maxWidth: '700px', lineHeight: 1.6 }}>
          Ready to take your online mock exams? Ensure that your webcam is connected, and your testing area is quiet. 
          The integrity engines are active to safeguard mock testing fairness.
        </p>
      </div>

      {error && (
        <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '30px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
        
        {/* Available Exams Section */}
        <div id="assigned-exams">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <BookOpen size={22} color="#a855f7" />
            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Assigned Mock Exams</h3>
          </div>
          
          {exams.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#9ca3af' }}>No mock exams are currently assigned to your account.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {exams.map(exam => (
                <div key={exam._id || exam.id} className="glass-card glass-card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>{exam.title}</h4>
                    <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5, minHeight: '42px' }}>
                      {exam.description || 'No description provided.'}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '13px', color: '#9ca3af' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        <span>{exam.duration} Minutes</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <HelpCircle size={14} />
                        <span>{exam.totalQuestions} Questions</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleStartClick(exam)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px' }}
                  >
                    <Play size={14} fill="#ffffff" /> Start Mock Test
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Attempts Section */}
        <div id="past-attempts">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Award size={22} color="#10b981" />
            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Past Attempts & Integrity Reports</h3>
          </div>

          {submissions.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#9ca3af' }}>You have not completed any mock exams yet. Your scores will appear here.</p>
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
                      <th>Proctor Integrity Status</th>
                      <th>Submission Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map(sub => {
                      const scorePercent = sub.totalQuestions > 0 ? Math.round((sub.score / sub.totalQuestions) * 100) : 0;
                      let statusBadge = (
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          ✅ Fully Clear (0)
                        </span>
                      );

                      if (sub.status === 'auto-submitted') {
                        statusBadge = (
                          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            🚨 Auto-Terminated ({sub.violationsCount})
                          </span>
                        );
                      } else if (sub.violationsCount > 0) {
                        statusBadge = (
                          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                            ⚠️ Suspect ({sub.violationsCount})
                          </span>
                        );
                      }

                      return (
                        <tr key={sub._id || sub.id}>
                          <td style={{ fontWeight: 600 }}>{sub.exam?.title || 'Unknown Exam'}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Trophy size={14} color="#f59e0b" />
                              <span style={{ fontWeight: 700 }}>{sub.score}</span> / {sub.totalQuestions}
                            </div>
                          </td>
                          <td style={{ fontWeight: 600, color: scorePercent >= 50 ? '#10b981' : '#ef4444' }}>
                            {scorePercent}%
                          </td>
                          <td>{statusBadge}</td>
                          <td style={{ fontSize: '13px', color: '#9ca3af' }}>
                            {new Date(sub.submittedAt).toLocaleDateString()} at {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
          <div className="modal-content" style={{ padding: '32px', maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <ShieldAlert size={26} color="#7c3aed" />
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Proctoring Guidelines</h3>
            </div>

            <p style={{ color: '#ffffff', fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>
              You are about to start: {selectedExam.title} ({selectedExam.duration} Mins)
            </p>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <p style={{ fontSize: '13.5px', color: '#e5e7eb', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                📷 <span style={{ lineHeight: 1.4 }}><strong>Webcam Access</strong> is mandatory. Your video feed is monitored locally to confirm your presence.</span>
              </p>
              <p style={{ fontSize: '13.5px', color: '#e5e7eb', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                🚫 <span style={{ lineHeight: 1.4 }}><strong>Tab switching</strong> or minimizing the window will trigger security violations immediately.</span>
              </p>
              <p style={{ fontSize: '13.5px', color: '#e5e7eb', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                🔲 <span style={{ lineHeight: 1.4 }}><strong>Fullscreen Mode</strong> is required. Exiting fullscreen will count as a proctoring infraction.</span>
              </p>
              <p style={{ fontSize: '13.5px', color: '#ef4444', display: 'flex', gap: '8px', alignItems: 'flex-start', fontWeight: 600 }}>
                ⚠️ <span style={{ lineHeight: 1.4 }}><strong>3 Violations</strong> will result in immediate automatic exam submission. Your progress will be sealed.</span>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedExam(null)}
                className="btn btn-secondary"
                style={{ padding: '10px 20px' }}
              >
                Abort
              </button>
              <button 
                onClick={proceedToExam}
                className="btn btn-primary"
                style={{ padding: '10px 24px' }}
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
