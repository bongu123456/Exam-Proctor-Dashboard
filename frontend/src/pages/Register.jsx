import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User, AlertTriangle, UserPlus } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'admin' for testing
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return setError('Please fill in all required fields.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setError('');
    setSubmitting(true);

    try {
      const data = await register(name, email, password, role);
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '40px 32px' }}>
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
            <UserPlus size={30} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }} className="gradient-text">Join ProctorShield</h1>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>Create an account to join exams securely</p>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="glass-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '16px' }} />
              <input 
                type="text" 
                placeholder="Alex Mercer" 
                className="glass-input" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="glass-label">School Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '16px' }} />
              <input 
                type="email" 
                placeholder="alex@school.edu" 
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
                type="password" 
                placeholder="At least 6 characters" 
                className="glass-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="glass-label">Platform Role</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                background: role === 'student' ? 'rgba(124, 58, 237, 0.15)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${role === 'student' ? '#7c3aed' : 'rgba(0,0,0,0.08)'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                color: role === 'student' ? '#ffffff' : '#9ca3af',
                transition: 'all 0.2s'
              }}>
                <input 
                  type="radio" 
                  name="role" 
                  value="student" 
                  checked={role === 'student'} 
                  onChange={() => setRole('student')}
                  style={{ display: 'none' }}
                />
                🧑‍🎓 Student
              </label>

              <label style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                background: role === 'admin' ? 'rgba(124, 58, 237, 0.15)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${role === 'admin' ? '#7c3aed' : 'rgba(0,0,0,0.08)'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                color: role === 'admin' ? '#ffffff' : '#9ca3af',
                transition: 'all 0.2s'
              }}>
                <input 
                  type="radio" 
                  name="role" 
                  value="admin" 
                  checked={role === 'admin'} 
                  onChange={() => setRole('admin')}
                  style={{ display: 'none' }}
                />
                🧑‍🏫 Administrator
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '8px', padding: '14px' }}
            disabled={submitting}
          >
            {submitting ? 'Creating Shield account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#9ca3af', marginTop: '24px' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
