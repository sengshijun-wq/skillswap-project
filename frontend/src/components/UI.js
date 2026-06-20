// frontend/src/components/UI.js
// Professional design system — inspired by Linear, Notion, Vercel
import React from 'react';

// ─── Design Tokens ───────────────────────────────────────────
export const tokens = {
  green:       '#16a34a',
  greenLight:  '#dcfce7',
  greenDark:   '#14532d',
  greenMid:    '#bbf7d0',
  surface:     '#ffffff',
  bg:          '#f8fafc',
  bgAlt:       '#f1f5f9',
  border:      '#e2e8f0',
  borderDark:  '#cbd5e1',
  text:        '#0f172a',
  textMid:     '#334155',
  textSub:     '#64748b',
  textMuted:   '#94a3b8',
  purple:      '#7c3aed',
  purpleLight: '#ede9fe',
  amber:       '#d97706',
  amberLight:  '#fef3c7',
  red:         '#dc2626',
  redLight:    '#fee2e2',
  blue:        '#2563eb',
  blueLight:   '#dbeafe',
};

// ─── Avatar ──────────────────────────────────────────────────
const AVATAR_PALETTE = [
  { bg:'#dcfce7', color:'#14532d' },
  { bg:'#ede9fe', color:'#4c1d95' },
  { bg:'#fef3c7', color:'#78350f' },
  { bg:'#fee2e2', color:'#7f1d1d' },
  { bg:'#dbeafe', color:'#1e3a8a' },
];
export const Avatar = ({ initials = '??', size = 40, index = 0, src = null }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }
  const c = AVATAR_PALETTE[Math.abs(index) % AVATAR_PALETTE.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: c.bg, color: c.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 600, fontSize: size * 0.35, flexShrink: 0,
      letterSpacing: '0.02em',
    }}>
      {initials}
    </div>
  );
};

// ─── Badge ────────────────────────────────────────────────────
const BADGE_MAP = {
  green:  { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  teal:   { bg: '#ccfbf1', color: '#0f766e', border: '#99f6e4' },
  purple: { bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe' },
  amber:  { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  red:    { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
  blue:   { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  gray:   { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
};
export const Badge = ({ children, variant = 'green', style = {} }) => {
  const s = BADGE_MAP[variant] || BADGE_MAP.gray;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.55rem',
      borderRadius: 6, display: 'inline-block', letterSpacing: '0.01em',
      ...style,
    }}>
      {children}
    </span>
  );
};

// ─── Global animation keyframes (injected once) ───────────────
const SS_ANIM_ID = 'ss-global-anim';
if (typeof document !== 'undefined' && !document.getElementById(SS_ANIM_ID)) {
  const s = document.createElement('style');
  s.id = SS_ANIM_ID;
  s.textContent = `
    @keyframes ss-fadeUp   { from { opacity:0; transform:translateY(22px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes ss-fadeIn   { from { opacity:0; transform:translateY(10px); }             to { opacity:1; transform:translateY(0); } }
    @keyframes ss-pop      { 0%{opacity:0;transform:scale(0.93);} 60%{transform:scale(1.02);} 100%{opacity:1;transform:scale(1);} }
    @keyframes ss-slideR   { from { opacity:0; transform:translateX(-18px); }            to { opacity:1; transform:translateX(0); } }
    @keyframes ss-spin     { to { transform:rotate(360deg); } }
    .ss-card-hover { transition: box-shadow 0.25s cubic-bezier(.22,.68,0,1.2), transform 0.25s cubic-bezier(.22,.68,0,1.2), border-color 0.2s !important; }
    .ss-card-hover:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.09); transform: translateY(-3px) scale(1.008); border-color: #cbd5e1 !important; }
    .ss-best-match-hover:hover { box-shadow: 0 10px 36px rgba(22,163,74,0.18); transform: translateY(-3px) scale(1.008); }
  `;
  document.head.appendChild(s);
}

// ─── Card ─────────────────────────────────────────────────────
export const Card = ({ children, style = {}, hover = false }) => (
  <div
    className={hover ? 'ss-card-hover' : undefined}
    style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: '1.25rem 1.5rem',
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── AnimatedCard ─────────────────────────────────────────────
export const AnimatedCard = ({
  children,
  style = {},
  hover = true,
  animation = 'fadeUp',
  delay = 0,
  className = '',
}) => {
  const animMap = {
    fadeUp: 'ss-fadeUp',
    fadeIn: 'ss-fadeIn',
    pop:    'ss-pop',
    slideR: 'ss-slideR',
  };
  return (
    <div
      className={`${hover ? 'ss-card-hover' : ''} ${className}`}
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '1.25rem 1.5rem',
        animation: `${animMap[animation] || 'ss-fadeUp'} 0.45s cubic-bezier(.22,.68,0,1.1) ${delay}ms both`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ─── Button ───────────────────────────────────────────────────
export const Button = ({ children, variant = 'primary', onClick, disabled, style = {}, size = 'md', fullWidth = false }) => {
  const sizes = {
    sm: { padding: '0.3rem 0.75rem', fontSize: '0.8rem', borderRadius: 8 },
    md: { padding: '0.5rem 1.1rem',  fontSize: '0.875rem', borderRadius: 9 },
    lg: { padding: '0.7rem 1.5rem',  fontSize: '0.95rem', borderRadius: 10 },
  };
  const variants = {
    primary: { background: '#16a34a', color: '#fff', border: 'none', boxShadow: '0 1px 2px rgba(22,163,74,0.25)' },
    outline: { background: '#fff', color: '#334155', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    ghost:   { background: 'transparent', color: '#64748b', border: 'none', boxShadow: 'none' },
    danger:  { background: '#fff', color: '#dc2626', border: '1px solid #fecaca', boxShadow: 'none' },
    dark:    { background: '#0f172a', color: '#fff', border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', fontWeight: 500,
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
        width: fullWidth ? '100%' : undefined,
        ...sizes[size],
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
};

// ─── Input ────────────────────────────────────────────────────
export const Input = ({ label, id, error, helper, ...props }) => (
  <div style={{ marginBottom: '1.1rem' }}>
    {label && (
      <label htmlFor={id} style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#374151', marginBottom: '0.4rem' }}>
        {label}
      </label>
    )}
    <input
      id={id}
      style={{
        width: '100%', padding: '0.55rem 0.85rem',
        border: `1.5px solid ${error ? '#fca5a5' : '#e2e8f0'}`,
        borderRadius: 9, fontFamily: 'inherit', fontSize: '0.875rem',
        color: '#0f172a', background: '#fff', outline: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxSizing: 'border-box',
      }}
      onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.1)'; }}
      onBlur={e  => { e.target.style.borderColor = error ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
      {...props}
    />
    {error  && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.3rem' }}>{error}</p>}
    {helper && <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>{helper}</p>}
  </div>
);

// ─── Select ───────────────────────────────────────────────────
export const Select = ({ label, id, children, error, ...props }) => (
  <div style={{ marginBottom: '1.1rem' }}>
    {label && (
      <label htmlFor={id} style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#374151', marginBottom: '0.4rem' }}>
        {label}
      </label>
    )}
    <select
      id={id}
      style={{
        width: '100%', padding: '0.55rem 0.85rem',
        border: '1.5px solid #e2e8f0', borderRadius: 9,
        fontFamily: 'inherit', fontSize: '0.875rem',
        color: '#0f172a', background: '#fff', outline: 'none',
        cursor: 'pointer',
      }}
      {...props}
    >
      {children}
    </select>
    {error && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.3rem' }}>{error}</p>}
  </div>
);

// ─── ScoreCircle ─────────────────────────────────────────────
export const ScoreCircle = ({ score }) => {
  const isHigh = score >= 80;
  const isMid  = score >= 50;
  const color  = isHigh ? '#16a34a' : isMid ? '#d97706' : '#94a3b8';
  return (
    <div style={{
      width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      border: `2.5px solid ${color}`,
      background: isHigh ? '#f0fdf4' : isMid ? '#fffbeb' : '#f8fafc',
    }}>
      <span style={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1, color }}>{score}</span>
      <span style={{ fontSize: '0.58rem', color: '#94a3b8', marginTop: 1 }}>/ 100</span>
    </div>
  );
};

// ─── Alert ────────────────────────────────────────────────────
export const Alert = ({ type = 'error', children }) => {
  const styles = {
    error:   { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', icon: '⚠' },
    success: { bg: '#f0fdf4', color: '#14532d', border: '#bbf7d0', icon: '✓' },
    info:    { bg: '#eff6ff', color: '#1e3a8a', border: '#bfdbfe', icon: 'ℹ' },
    warning: { bg: '#fffbeb', color: '#78350f', border: '#fde68a', icon: '!' },
  };
  const s = styles[type];
  return (
    <div style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
      <span style={{ fontWeight: 700, flexShrink: 0 }}>{s.icon}</span>
      <span>{children}</span>
    </div>
  );
};

// ─── Spinner ─────────────────────────────────────────────────
export const Spinner = ({ text = 'Loading…' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '1rem', color: '#64748b' }}>
    <div style={{ width: 32, height: 32, border: '3px solid #dcfce7', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'ss-spin 0.7s linear infinite' }} />
    <p style={{ fontSize: '0.875rem' }}>{text}</p>
    <style>{`@keyframes ss-spin { to { transform: rotate(360deg) } }`}</style>
  </div>
);

// ─── EmptyState ───────────────────────────────────────────────
export const EmptyState = ({ icon = '🔍', title, message, action }) => (
  <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
    <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.6 }}>{icon}</div>
    {title   && <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.4rem', color: '#334155' }}>{title}</p>}
    {message && <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{message}</p>}
    {action  && <div style={{ marginTop: '1.25rem' }}>{action}</div>}
  </div>
);

// ─── PageTitle ────────────────────────────────────────────────
export const PageTitle = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
    <div>
      <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.85rem', fontWeight: 400, color: '#0f172a', marginBottom: '0.25rem' }}>{title}</h1>
      {subtitle && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────
export const StatCard = ({ icon, value, label, color = '#16a34a' }) => (
  <AnimatedCard animation="fadeUp" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>{label}</div>
    </div>
  </AnimatedCard>
);