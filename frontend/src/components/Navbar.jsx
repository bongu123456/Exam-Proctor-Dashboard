import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, LayoutDashboard, BarChart3 } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <>
      {/* Restore standard body padding to remove the sidebar offset */}
      <style>{`
        body {
          padding-left: 0 !important;
        }
        .nav-link-hover {
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14.5px;
          font-weight: 600;
          color: #9ca3af !important;
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid transparent;
        }
        .nav-link-hover:hover {
          color: #ffffff !important;
          background: rgba(0,0,0, 0.03);
          border-color: rgba(0,0,0, 0.05);
        }
      `}</style>

      <nav style={{
        background: 'rgba(10, 11, 16, 0.75)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        {/* Left Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={26} color="#a855f7" style={{ filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.6))' }} />
          <Link to="/" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Proctor<span className="gradient-text">Shield</span>
          </Link>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            background: 'rgba(168, 85, 247, 0.15)',
            padding: '2px 8px',
            borderRadius: '20px',
            color: '#a855f7',
            marginLeft: '8px'
          }}>
            PRO
          </span>
        </div>

        {/* Center & Right Navigation controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {isAdmin ? (
            <Link to="/admin" className="nav-link-hover">
              <BarChart3 size={16} /> Admin Console
            </Link>
          ) : (
            <Link to="/dashboard" className="nav-link-hover">
              <LayoutDashboard size={16} /> My Exams
            </Link>
          )}

          <div style={{
            height: '20px',
            width: '1px',
            background: 'rgba(0,0,0, 0.08)'
          }}></div>

          {/* User Profile Info Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: isAdmin ? 'linear-gradient(135deg, #ef4444, #ec4899)' : 'linear-gradient(135deg, #a855f7, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              fontWeight: 700,
              fontSize: '14px',
              boxShadow: isAdmin ? '0 0 12px rgba(239, 68, 68, 0.35)' : '0 0 12px rgba(168, 85, 247, 0.35)'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{user.name}</span>
              <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'capitalize', marginTop: '1px' }}>{user.role}</span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '10px'
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
