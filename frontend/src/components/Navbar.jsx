import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, LogOut, LayoutDashboard, BarChart3, 
  Bell, Settings, User as UserIcon, HelpCircle, ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <>
      <style>{`
        body {
          padding-left: 0 !important;
        }
        .nav-link-hover {
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted) !important;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid transparent;
        }
        .nav-link-hover:hover {
          color: var(--text-main) !important;
          background: rgba(255,255,255, 0.05);
        }
        .icon-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .icon-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.08);
        }
        .profile-trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 10px 4px 4px;
          border-radius: 30px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
        }
        .profile-trigger:hover, .profile-trigger.active {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <nav style={{
        background: 'rgba(10, 15, 28, 0.75)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        {/* Left Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)'
          }}>
            <BookOpen size={18} color="#ffffff" />
          </div>
          <Link to="/" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
            My Exams
          </Link>
        </div>

        {/* Center Navigation controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAdmin ? (
            <Link to="/admin" className="nav-link-hover">
              <BarChart3 size={16} /> Admin Console
            </Link>
          ) : (
            <Link to="/dashboard" className="nav-link-hover">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          )}
        </div>

        {/* Right Section: Icons & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button className="icon-btn">
              <Bell size={18} />
            </button>
            <button className="icon-btn">
              <Settings size={18} />
            </button>
          </div>

          <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255, 0.1)', margin: '0 4px' }}></div>

          {/* Profile Dropdown Area */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
              className={`profile-trigger ${dropdownOpen ? 'active' : ''}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isAdmin ? 'linear-gradient(135deg, #ef4444, #ec4899)' : 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                boxShadow: isAdmin ? '0 0 12px rgba(239, 68, 68, 0.35)' : '0 0 12px rgba(99, 102, 241, 0.35)'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>{user.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</span>
              </div>
              
              <ChevronDown size={14} color="var(--text-muted)" style={{ marginLeft: '4px', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <UserIcon size={16} /> View Profile
                </button>
                <button className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <Settings size={16} /> Preferences
                </button>
                <button className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <HelpCircle size={16} /> Help & Support
                </button>
                
                <div className="dropdown-divider"></div>
                
                <button className="dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>

        </div>
      </nav>
    </>
  );
};

export default Navbar;
