import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, BookOpen, FileSpreadsheet, AlertTriangle, TrendingUp, Search, 
  Clock, ShieldAlert, Award, ChevronRight, Eye, RefreshCw, X 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';

const AdminDashboard = () => {
  const { apiFetch } = useAuth();
  
  // Data States
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Interactive UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailedData, setDetailedData] = useState(null);

  // Constants
  const COLORS = ['#8b5cf6', '#6366f1', '#f59e0b', '#ef4444']; // Violet, Indigo, Amber, Red

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Fetch dashboard aggregated stats
      const statsRes = await apiFetch('/api/submissions/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch all submissions list
      const subsRes = await apiFetch('/api/submissions');
      if (subsRes.ok) {
        const subsData = await subsRes.json();
        setSubmissions(subsData);
      }
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowClick = async (sub) => {
    setSelectedSubmission(sub);
    setLoadingDetails(true);
    setDetailedData(null);
    try {
      const res = await apiFetch(`/api/submissions/${sub._id || sub.id}`);
      if (res.ok) {
        const data = await res.json();
        setDetailedData(data);
      } else {
        throw new Error('Could not retrieve submission logs.');
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Filter and Search Submissions
  const filteredSubmissions = submissions.filter(sub => {
    const studentName = sub.student?.name?.toLowerCase() || '';
    const studentEmail = sub.student?.email?.toLowerCase() || '';
    const examTitle = sub.exam?.title?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    return studentName.includes(term) || studentEmail.includes(term) || examTitle.includes(term);
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-main)' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(0,0,0,0.05)',
          borderTopColor: '#7c3aed',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{ marginLeft: '12px', color: '#9ca3af' }}>Assembling analytics database...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Dashboard Title Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800 }} className="gradient-text">Integrity & Analytics Console</h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>Real-time student mock performance and proctoring metrics</p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      {error && (
        <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '30px' }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* ================= 1. OVERVIEW KPI CARDS ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        {/* KPI 1: Active Candidates */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', color: '#8b5cf6' }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>Registered Students</span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '2px' }}>{stats?.summary.totalStudents || 0}</h3>
          </div>
        </div>

        {/* KPI 2: Active Exams */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>Active Mock Exams</span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '2px' }}>{stats?.summary.totalExams || 0}</h3>
          </div>
        </div>

        {/* KPI 3: Submissions */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>Completed Submissions</span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '2px' }}>{stats?.summary.totalSubmissions || 0}</h3>
          </div>
        </div>

        {/* KPI 4: Class Average */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>Class Average Score</span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '2px' }}>{stats?.summary.averageScore || 0}%</h3>
          </div>
        </div>

        {/* KPI 5: Critical Infraction Ratio */}
        <div className="glass-card" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px', 
          borderColor: (stats?.summary.highSuspicionRate || 0) > 15 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0,0,0,0.06)',
          background: (stats?.summary.highSuspicionRate || 0) > 15 ? 'linear-gradient(135deg, rgba(239,68,68,0.05), transparent)' : 'rgba(0,0,0,0.03)'
        }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>High Suspicion Index</span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '2px', color: (stats?.summary.highSuspicionRate || 0) > 15 ? '#ef4444' : '#ffffff' }}>
              {stats?.summary.highSuspicionRate || 0}%
            </h3>
          </div>
        </div>

      </div>

      {/* ================= 2. ANALYTICS CHARTS SECTION ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '30px', marginBottom: '50px' }}>
        
        {/* Chart A: Score Distribution Area Chart */}
        <div className="glass-card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Class Performance Curve (Score Ranges)</h4>
          <div style={{ flex: 1, minHeight: 0 }}>
            {stats?.charts.scoreDistribution.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                No score records loaded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.charts.scoreDistribution} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="range" stroke="#6b7280" fontSize={12} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '10px' }}
                    labelStyle={{ color: 'var(--text-main)', fontWeight: 700 }}
                  />
                  <Area type="monotone" dataKey="count" name="Submissions" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart B: Violation Logs Analysis Pie Chart */}
        <div className="glass-card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Integrity Infraction Incidents (By Violation Type)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '6fr 4fr', alignItems: 'center', height: '100%', minHeight: 0 }}>
            
            <div style={{ height: '100%', minHeight: 0 }}>
              {stats?.charts.violationBreakdown.every(v => v.value === 0) ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                  No proctor infractions recorded. Perfect feed.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.charts.violationBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats?.charts.violationBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Custom Pie Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats?.charts.violationBreakdown.map((entry, index) => {
                const total = stats.charts.violationBreakdown.reduce((sum, item) => sum + item.value, 0);
                const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                return (
                  <div key={entry.name} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                      <span>{entry.name}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '18px' }}>
                      {entry.value} Incidents ({percent}%)
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      {/* ================= 3. SUBMISSIONS DATA LOG TABLE ================= */}
      <div className="glass-card" style={{ padding: '30px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Student Mock Submissions</h3>
          
          {/* Custom Search Bar */}
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            <input 
              type="text" 
              placeholder="Search by student, email or mock test..." 
              className="glass-input" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px', paddingRight: '12px', fontSize: '13.5px' }}
            />
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            No matching student records found in current logs.
          </div>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Mock Test</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Proctor Violations</th>
                  <th>Session Status</th>
                  <th>Submission Date</th>
                  <th style={{ textAlign: 'right' }}>Security Logs</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map(sub => {
                  const scorePercent = sub.totalQuestions > 0 ? Math.round((sub.score / sub.totalQuestions) * 100) : 0;
                  
                  // Setup Suspicion Levels
                  let suspicionBadge = (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      Clear (0)
                    </span>
                  );
                  if (sub.violationsCount >= 3) {
                    suspicionBadge = (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                        🛡️ Critical ({sub.violationsCount})
                      </span>
                    );
                  } else if (sub.violationsCount > 0) {
                    suspicionBadge = (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                        ⚠️ Caution ({sub.violationsCount})
                      </span>
                    );
                  }

                  // Setup session submission status
                  let statusBadge = (
                    <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 600 }}>Standard Complete</span>
                  );
                  if (sub.status === 'auto-submitted') {
                    statusBadge = (
                      <span style={{ color: '#ef4444', fontSize: '13px', fontWeight: 700 }}>🔒 Force Locked</span>
                    );
                  }

                  return (
                    <tr key={sub._id || sub.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{sub.student?.name || 'Unknown User'}</span>
                          <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{sub.student?.email || 'No email'}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{sub.exam?.title || 'Unknown Mock Test'}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{sub.score}</span> / {sub.totalQuestions}
                      </td>
                      <td style={{ fontWeight: 700, color: scorePercent >= 50 ? '#10b981' : '#ef4444' }}>
                        {scorePercent}%
                      </td>
                      <td>{suspicionBadge}</td>
                      <td>{statusBadge}</td>
                      <td style={{ fontSize: '13px', color: '#9ca3af' }}>
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => handleRowClick(sub)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} /> Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ================= 4. DETAILED PROCTOR LOGS MODAL ================= */}
      {selectedSubmission && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px', padding: '32px' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={22} color="#7c3aed" />
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Student Forensic Record</h3>
              </div>
              <button 
                onClick={() => setSelectedSubmission(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              >
                <X size={20} />
              </button>
            </div>

            {loadingDetails ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  border: '2.5px solid rgba(0,0,0,0.05)',
                  borderTopColor: '#7c3aed',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{ marginLeft: '10px', color: '#9ca3af', fontSize: '13px' }}>Unpacking log packet...</span>
              </div>
            ) : (
              detailedData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Student Overview Info */}
                  <div style={{ background: 'rgba(0,0,0,0.01)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>Session Summary</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                      <div><span style={{ color: '#9ca3af' }}>Student:</span> <strong style={{ color: 'var(--text-main)' }}>{detailedData.student?.name}</strong></div>
                      <div><span style={{ color: '#9ca3af' }}>Email:</span> <span style={{ color: 'var(--text-main)' }}>{detailedData.student?.email}</span></div>
                      <div><span style={{ color: '#9ca3af' }}>Exam Title:</span> <strong style={{ color: 'var(--text-main)' }}>{detailedData.exam?.title}</strong></div>
                      <div><span style={{ color: '#9ca3af' }}>Calculated Score:</span> <strong style={{ color: 'var(--text-main)' }}>{detailedData.score} / {detailedData.totalQuestions} ({Math.round(detailedData.score / detailedData.totalQuestions * 100)}%)</strong></div>
                      <div><span style={{ color: '#9ca3af' }}>Submission Mode:</span> <span style={{ fontWeight: 700, color: detailedData.status === 'auto-submitted' ? '#ef4444' : '#10b981' }}>{detailedData.status === 'auto-submitted' ? '🔒 Forced Lockdown' : '✅ Standard Finish'}</span></div>
                      <div><span style={{ color: '#9ca3af' }}>Total Infractions:</span> <strong style={{ color: detailedData.violationsCount >= 3 ? '#ef4444' : '#ffffff' }}>{detailedData.violationsCount}</strong></div>
                    </div>
                  </div>

                  {/* Proctor Event Log Timeline */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#9ca3af', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Webcam & Visibility Timeline Logs
                    </h4>
                    <div style={{
                      maxHeight: '220px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '12px',
                      padding: '14px',
                      background: 'rgba(0,0,0,0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      {(!detailedData.violationsLog || detailedData.violationsLog.length === 0) ? (
                        <div style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
                          No proctoring infractions logged for this session. Candidate maintained perfect focus.
                        </div>
                      ) : (
                        detailedData.violationsLog.map((log, idx) => {
                          const logTime = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                          let color = '#38bdf8'; // Info/Cyan default
                          if (log.type === 'Tab Switch' || log.type === 'Focus Loss' || log.type === 'Fullscreen Exit' || log.type === 'Webcam Off') {
                            color = '#f87171'; // Warning/Red
                          }
                          return (
                            <div key={idx} style={{
                              padding: '10px 12px',
                              background: 'rgba(0,0,0,0.01)',
                              borderLeft: `2.5px solid ${color}`,
                              borderRadius: '6px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                                <span>{log.type}</span>
                                <span style={{ color: '#6b7280', fontWeight: 500 }}>{logTime}</span>
                              </div>
                              <p style={{ fontSize: '11.5px', color: '#9ca3af', lineHeight: 1.3 }}>{log.description}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Student Question Keys Analysis */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#9ca3af', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Responses Review Map
                    </h4>
                    <div style={{
                      maxHeight: '160px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      background: 'rgba(0,0,0,0.1)',
                      fontSize: '12.5px'
                    }}>
                      {detailedData.exam?.questions.map((q, idx) => {
                        const studentAnsIdx = detailedData.answers[idx.toString()] !== undefined 
                          ? detailedData.answers[idx.toString()] 
                          : detailedData.answers[idx];
                        const isCorrect = studentAnsIdx !== undefined && Number(studentAnsIdx) === q.correctOption;

                        return (
                          <div key={idx} style={{
                            padding: '8px 0',
                            borderBottom: idx < (detailedData.exam.questions.length - 1) ? '1px solid rgba(0,0,0,0.04)' : 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{ maxWidth: '75%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#e5e7eb' }}>
                              Q{idx + 1}: {q.questionText}
                            </div>
                            <span style={{ 
                              fontWeight: 700, 
                              color: isCorrect ? '#10b981' : '#ef4444',
                              background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              {isCorrect ? 'Correct' : studentAnsIdx === undefined ? 'Skipped' : 'Incorrect'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
              <button onClick={() => setSelectedSubmission(null)} className="btn btn-secondary" style={{ padding: '8px 20px' }}>
                Close Record
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
