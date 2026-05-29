import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please enter both email and password.');
    }

    setError('');
    setSubmitting(true);

    try {
      const data = await login(email, password);
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to load quick-demo logins
  const loadDemo = (type) => {
    if (type === 'student') {
      setEmail('student@proctor.com');
      setPassword('student123');
    } else {
      setEmail('admin@proctor.com');
      setPassword('admin123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      <div className="glass-card" style={{ maxWidth: '420px', width: '100%', padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            color: '#7c3aed',
            marginBottom: '16px',
            boxShadow: '0 0 15px rgba(124, 58, 237, 0.1)'
          }}>
            <Shield size={32} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }} className="gradient-text">Proctor🛡️Shield</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Online Mock Exam Proctoring Portal</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '10px',
            padding: '12px',
            color: '#fca5a5',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="glass-label">School Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '16px' }} />
              <input 
                type="email" 
                placeholder="you@school.edu" 
                className="glass-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="glass-label">Secret Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '16px' }} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                className="glass-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px', paddingRight: '44px' }}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '14px', 
                  top: '14px', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: '#9ca3af' 
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '8px', padding: '14px' }}
            disabled={submitting}
          >
            {submitting ? 'Verifying Integrity...' : 'Enter Dashboard'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#9ca3af', marginTop: '24px' }}>
          New student? <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
        </p>

        {/* Demo Fast Logins Section */}
        <div style={{ 
          marginTop: '32px', 
          paddingTop: '20px', 
          borderTop: '1px solid rgba(0,0,0,0.05)',
          textAlign: 'center' 
        }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Demo Sandbox Credentials
          </span>
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', justifyContent: 'center' }}>
            <button 
              type="button" 
              onClick={() => loadDemo('student')}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600 }}
            >
              🔑 Student Demo
            </button>
            <button 
              type="button" 
              onClick={() => loadDemo('admin')}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600 }}
            >
              🔑 Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
