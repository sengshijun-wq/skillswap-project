// frontend/src/pages/HomePage.js — Professional landing page
import React from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon:'🎯', title:'Smart Peer Matching', desc:'Our weighted algorithm scores every registered tutor across 4 criteria and returns your top 5 best fits — subject, level, schedule, and shared interests.' },
  { icon:'💬', title:'In-Platform Messaging', desc:'Chat directly with your matched tutor or learner. All academic conversations are structured, documented, and private within the platform.' },
  { icon:'📋', title:'Skill Profiles', desc:'Build a profile listing subjects you can teach and want to learn, each rated Beginner, Intermediate, or Advanced.' },
  { icon:'📅', title:'Schedule Matching', desc:'Availability overlap detection ensures matched students can actually meet — no more great matches that never connect.' },
  { icon:'🔄', title:'Two-Way Exchange', desc:'Be a learner in one subject and a tutor in another simultaneously. Real peer exchange, not one-directional tutoring.' },
  { icon:'🆓', title:'Completely Free', desc:'No fees, no subscriptions. Removes the RM 400–1,200/month private tutoring cost barrier. Equal access for every APU student.' },
];

const STEPS = [
  { num:'01', title:'Create your profile', desc:'Register and list the subjects you can teach and want to learn, with your proficiency level and weekly availability.' },
  { num:'02', title:'Run the algorithm', desc:'Select a subject you need help with. The matching engine scores every compatible tutor and returns your top 5.' },
  { num:'03', title:'Connect & learn', desc:'Send a match request, chat in-platform, and schedule your session. Mark complete when done.' },
];

export default function HomePage() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        .hero-cta-primary { background:#16a34a; color:#fff; text-decoration:none; padding:0.75rem 1.75rem; border-radius:10px; font-weight:600; font-size:0.95rem; display:inline-flex; align-items:center; gap:6px; box-shadow:0 4px 14px rgba(22,163,74,0.35); transition:all 0.2s; }
        .hero-cta-primary:hover { background:#15803d; box-shadow:0 6px 20px rgba(22,163,74,0.4); transform:translateY(-1px); }
        .hero-cta-secondary { background:#fff; color:#334155; text-decoration:none; padding:0.75rem 1.5rem; border-radius:10px; font-weight:500; font-size:0.95rem; border:1px solid #e2e8f0; display:inline-flex; align-items:center; gap:6px; box-shadow:0 1px 3px rgba(0,0,0,0.07); transition:all 0.2s; }
        .hero-cta-secondary:hover { border-color:#cbd5e1; box-shadow:0 4px 12px rgba(0,0,0,0.1); transform:translateY(-1px); }
        .feature-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; transition:box-shadow 0.2s, transform 0.2s; }
        .feature-card:hover { box-shadow:0 8px 30px rgba(0,0,0,0.08); transform:translateY(-2px); }
        .step-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:1.75rem; position:relative; overflow:hidden; }
        .step-card::before { content:''; position:absolute; top:0; left:0; width:3px; height:100%; background:linear-gradient(180deg,#16a34a,#15803d); }
      `}</style>

      {/* Hero */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: '5rem 1.5rem 4rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '0.78rem', fontWeight: 600, padding: '0.35rem 0.85rem', borderRadius: 999, marginBottom: '2rem', letterSpacing: '0.02em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
            APU Peer Learning Platform · SDG 4: Quality Education
          </div>

          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 400, lineHeight: 1.1, color: '#0f172a', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Learn from peers who<br />
            <em style={{ color: '#16a34a', fontStyle: 'italic' }}>actually get it</em>
          </h1>

          <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2.25rem', maxWidth: 520, margin: '0 auto 2.25rem' }}>
            SkillSwap intelligently connects APU students with the right peer tutor — by subject, proficiency, schedule, and shared interests. Completely free.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="hero-cta-primary">Get started free →</Link>
            <Link to="/login"    className="hero-cta-secondary">Sign in</Link>
          </div>

          {/* Social proof strip */}
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
            {[['9+','Registered tutors'],['4','Matching criteria'],['RM 0','Cost to students'],['SDG 4','Quality education']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Algorithm visual */}
      <section style={{ background: '#fff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Matching Algorithm · FR-04</p>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '2.25rem', fontWeight: 400, color: '#0f172a', lineHeight: 1.2, marginBottom: '1rem' }}>
              Score out of 100,<br />ranked in seconds
            </h2>
            <p style={{ color: '#64748b', lineHeight: 1.75, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              The algorithm computes a compatibility score for every registered tutor using four weighted criteria rooted in peer learning research. The top 5 are returned, ranked highest first.
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.7 }}>
              Based on Vygotsky's Zone of Proximal Development (1978) — tutors must be at least one proficiency level above the learner for an effective session.
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: '2rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.5rem' }}>Score breakdown</p>
            {[
              { label: 'Subject Compatibility', pts: 50, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Proficiency Gap (ZPD)', pts: 20, color: '#7c3aed', bg: '#f5f3ff' },
              { label: 'Schedule Overlap',       pts: 20, color: '#d97706', bg: '#fffbeb' },
              { label: 'Shared Interests',       pts: 10, color: '#0284c7', bg: '#f0f9ff' },
            ].map(r => (
              <div key={r.label} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>{r.label}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: r.color }}>{r.pts} pts</span>
                </div>
                <div style={{ height: 7, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${r.pts}%`, background: r.color, borderRadius: 999 }} />
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Maximum score</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>100 pts</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>How it works</p>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '2rem', fontWeight: 400, color: '#0f172a' }}>Up and running in 3 steps</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }}>
          {STEPS.map(s => (
            <div key={s.num} className="step-card">
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#16a34a', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>{s.num}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section style={{ background: '#fff', borderTop: '1px solid #e2e8f0', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Platform features</p>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '2rem', fontWeight: 400, color: '#0f172a' }}>Everything you need to learn better</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <div style={{ fontSize: '1.5rem', marginBottom: '0.85rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>User Roles</p>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '2rem', fontWeight: 400, color: '#0f172a' }}>One platform, three roles</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
          {[
            { icon:'📚', role:'Learner', color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0', items:['Browse matched tutors', 'Send match requests', 'Chat with tutors', 'View match history'] },
            { icon:'🎓', role:'Tutor',   color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe', items:['List teachable skills', 'Accept/decline requests', 'Message learners', 'Mark sessions complete'] },
            { icon:'⚙️', role:'Admin',   color:'#0284c7', bg:'#f0f9ff', border:'#bae6fd', items:['Platform statistics', 'Manage all users', 'Match analytics', 'Subject demand data'] },
          ].map(r => (
            <div key={r.role} style={{ background: r.bg, border: `1px solid ${r.border}`, borderRadius: 14, padding: '1.75rem' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{r.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: r.color, marginBottom: '1rem' }}>{r.role}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {r.items.map(item => (
                  <li key={item} style={{ fontSize: '0.875rem', color: '#334155', padding: '0.3rem 0', borderBottom: `1px solid ${r.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: r.color, fontWeight: 700, fontSize: '0.7rem' }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '0 1.5rem 5rem' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: 20, padding: '3.5rem 3rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(22,163,74,0.15)' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(22,163,74,0.1)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '2.25rem', fontWeight: 400, color: '#fff', marginBottom: '0.75rem' }}>
                Ready to start learning?
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '2rem' }}>
                Create your free profile, add your skills, and find your first match today.
              </p>
              <Link to="/register" style={{ background: '#16a34a', color: '#fff', textDecoration: 'none', padding: '0.8rem 2rem', borderRadius: 10, fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 14px rgba(22,163,74,0.4)' }}>
                Create free account →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
