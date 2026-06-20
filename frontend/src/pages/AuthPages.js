// frontend/src/pages/AuthPages.js — Professional auth pages
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const inputStyle = {
  width: '100%', padding: '0.6rem 0.9rem',
  border: '1.5px solid #e2e8f0', borderRadius: 9,
  fontFamily: 'inherit', fontSize: '0.9rem',
  color: '#0f172a', background: '#fff', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
};
const labelStyle = {
  display: 'block', fontSize: '0.82rem', fontWeight: 500,
  color: '#374151', marginBottom: '0.4rem',
};

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      {label && <label style={labelStyle}>{label}</label>}
      {children}
      {error && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.3rem' }}>{error}</p>}
    </div>
  );
}

function FocusInput({ ...props }) {
  return (
    <input
      style={inputStyle}
      onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'; }}
      onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
      {...props}
    />
  );
}
function FocusSelect({ children, ...props }) {
  return (
    <select
      style={{ ...inputStyle, cursor: 'pointer', background: '#fff' }}
      onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'; }}
      onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
      {...props}
    >
      {children}
    </select>
  );
}

// ─── Login ────────────────────────────────────────────────────
export function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin' : '/match');
    } catch (err) {
      setError(err.response?.data?.error || `Connection failed — is the backend running on port 5000? (${err.message})`);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');`}</style>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: '1.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>SS</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>SkillSwap</span>
          </Link>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.85rem', fontWeight: 400, color: '#0f172a', marginBottom: '0.35rem' }}>Welcome back</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: 9, fontSize: '0.875rem', marginBottom: '1.25rem', display: 'flex', gap: 8 }}>
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Field label="Email address">
              <FocusInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="student@apu.edu.my" required autoFocus />
            </Field>
            <Field label="Password">
              <FocusInput type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
            </Field>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.65rem', background: loading ? '#86efac' : '#16a34a', color: '#fff', border: 'none', borderRadius: 9, fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(22,163,74,0.3)', transition: 'all 0.2s', marginTop: '0.25rem' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
            No account?{' '}
            <Link to="/register" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>Create one free →</Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div style={{ marginTop: '1.25rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem 1.25rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Demo accounts</p>
          {[['Learner', 'ahmad@apu.edu.my', 'password123'], ['Tutor', 'sarah@apu.edu.my', 'password123'], ['Admin', 'admin@apu.edu.my', 'admin123']].map(([role, email, pass]) => (
            <div key={role} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.3rem 0', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
              <span style={{ fontWeight: 500, color: '#334155' }}>{role}</span>
              <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{email}</span>
              <button onClick={() => { setEmail(email); setPassword(pass); }} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 5, cursor: 'pointer' }}>Fill</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Register ─────────────────────────────────────────────────
export function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', year_of_study:'Year 1', field_of_study:'Computer Science / IT / Software Engineering' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();
  const set = k => e => setForm(p => ({...p, [k]: e.target.value}));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      navigate('/profile');
    } catch (err) {
      const st = err.response?.status;
      if (st === 500) setError('Server error — check that MySQL is running and database.sql has been imported.');
      else setError(err.response?.data?.error || `Connection failed. Is the backend running? (${err.message})`);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');`}</style>
      <div style={{ width: '100%', maxWidth: 460 }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: '1.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>SS</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>SkillSwap</span>
          </Link>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.85rem', fontWeight: 400, color: '#0f172a', marginBottom: '0.35rem' }}>Create your account</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Free peer learning — APU students only</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: 9, fontSize: '0.875rem', marginBottom: '1.25rem', display: 'flex', gap: 8 }}>
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Field label="Full name">
              <FocusInput value={form.name} onChange={set('name')} placeholder="e.g. Seng Shi Jun" required />
            </Field>
            <Field label="Email address">
              <FocusInput type="email" value={form.email} onChange={set('email')} placeholder="student@apu.edu.my" required />
            </Field>
            <Field label="Password">
              <FocusInput type="password" value={form.password} onChange={set('password')} placeholder="At least 6 characters" required />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="Year of study">
                <FocusSelect value={form.year_of_study} onChange={set('year_of_study')}>
                  {['Year 1','Year 2','Year 3','Year 4 or above'].map(y => <option key={y}>{y}</option>)}
                </FocusSelect>
              </Field>
              <Field label="Field of study">
                <FocusSelect value={form.field_of_study} onChange={set('field_of_study')}>
                  {['Computer Science / IT / Software Engineering','Business / Management','Design / Creative Arts','Engineering (Non-IT)','Science / Mathematics','Other'].map(f => <option key={f}>{f}</option>)}
                </FocusSelect>
              </Field>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.65rem', background: loading ? '#86efac' : '#16a34a', color: '#fff', border: 'none', borderRadius: 9, fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(22,163,74,0.3)', transition: 'all 0.2s', marginTop: '0.5rem' }}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
