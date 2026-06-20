// frontend/src/components/Navbar.js — Professional navbar
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './UI';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (to) => location.pathname === to;

  const links = [
    { to: '/',         label: 'Home',       always: true },
    { to: '/match',    label: 'Find Match', auth: true },
    { to: '/messages', label: 'Messages',   auth: true },
    { to: '/profile',  label: 'Profile',    auth: true },
    { to: '/history',  label: 'History',    auth: true },
    { to: '/admin',    label: 'Admin',      admin: true },
  ].filter(l => {
    if (l.admin) return user?.role === 'admin';
    if (l.auth)  return !!user;
    return true;
  });

  return (
    <>
      <style>{`
        .nav-link { transition: color 0.15s, background 0.15s; }
        .nav-link:hover { background: #f1f5f9 !important; color: #0f172a !important; }
        .nav-link.active { background: #f0fdf4 !important; color: #15803d !important; }
        .logout-btn:hover { background: #f1f5f9 !important; }
        .sign-in-link:hover { color: #0f172a !important; }
      `}</style>

      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: 60, gap: '0.5rem' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: '0.5rem', flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>SS</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', letterSpacing: '-0.01em' }}>SkillSwap</span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', gap: 2, flex: 1, overflow: 'hidden' }}>
            {links.map(l => (
              <Link key={l.to} to={l.to} className={`nav-link${isActive(l.to) ? ' active' : ''}`} style={{
                padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap',
                fontWeight: isActive(l.to) ? 500 : 400,
                color: isActive(l.to) ? '#15803d' : '#64748b',
                background: isActive(l.to) ? '#f0fdf4' : 'transparent',
              }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Auth area */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            {user ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.3rem 0.6rem', borderRadius: 9, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <Avatar initials={user.avatar_initials || '??'} size={26} index={user.id || 0} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#334155', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                </div>
                <button onClick={handleLogout} className="logout-btn" style={{ background: 'transparent', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.35rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer', color: '#64748b', transition: 'background 0.15s' }}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="sign-in-link" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', padding: '0.35rem 0.5rem', transition: 'color 0.15s' }}>Sign in</Link>
                <Link to="/register" style={{ background: '#16a34a', color: '#fff', textDecoration: 'none', padding: '0.4rem 1rem', borderRadius: 9, fontSize: '0.875rem', fontWeight: 500, boxShadow: '0 1px 2px rgba(22,163,74,0.25)' }}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
