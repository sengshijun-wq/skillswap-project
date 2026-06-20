// frontend/src/pages/MatchPage.js — FR-04, FR-05
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Button, ScoreCircle, Badge, Avatar, Spinner, Alert, PageTitle } from '../components/UI';
import api from '../utils/api';

const SUBJECTS = ['Object-Oriented Programming','Data Structures & Algorithms','Web Development (React.js)','Database Management (MySQL)','Calculus & Mathematics','Computer Networks','Artificial Intelligence','Machine Learning','Python Programming','JavaScript','Java','C++','Network Security','Statistics','Discrete Mathematics','HTML & CSS'];
const PROFICIENCY = ['Beginner','Intermediate','Advanced'];

const selectStyle = { width:'100%', padding:'0.55rem 0.9rem', border:'1.5px solid #e2e8f0', borderRadius:9, fontFamily:'inherit', fontSize:'0.875rem', background:'#fff', color:'#0f172a', outline:'none', cursor:'pointer' };
const labelStyle  = { display:'block', fontSize:'0.82rem', fontWeight:500, color:'#374151', marginBottom:'0.4rem' };

export default function MatchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ subject:'', proficiency:'Beginner' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [sent,    setSent]    = useState({});

  if (!user) return <div style={{ maxWidth:1160, margin:'0 auto', padding:'2rem' }}><Alert type="info">Please <a href="/login" style={{ color:'#2563eb' }}>sign in</a> to find matches.</Alert></div>;

  const runMatch = async (e) => {
    e.preventDefault();
    if (!form.subject) { setError('Please select a subject to find matches.'); return; }
    setError(''); setLoading(true); setResults(null);
    try {
      const { data } = await api.get('/match', { params:{ subject: form.subject, learner_proficiency: form.proficiency } });
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Matching failed. Make sure backend is running.');
    } finally { setLoading(false); }
  };

  const sendRequest = async (match) => {
    try {
      await api.post('/match', { tutor_id:match.tutor_id, subject:form.subject, score:match.score, score_subject:match.score_subject, score_proficiency:match.score_proficiency, score_schedule:match.score_schedule, score_interest:match.score_interest });
      setSent(p => ({ ...p, [match.tutor_id]: true }));
    } catch (err) { alert(err.response?.data?.error || 'Failed to send request.'); }
  };

  return (
    <main style={{ maxWidth:1160, margin:'0 auto', padding:'2.5rem 1.5rem', background:'#f8fafc', minHeight:'100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');`}</style>
      <PageTitle title="Find Your Tutor" subtitle="The algorithm evaluates every registered tutor and returns your top 5 matches scored out of 100." />

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:'1.5rem', alignItems:'start' }}>

        {/* Form sidebar */}
        <div style={{ position:'sticky', top:80 }}>
          <Card>
            <h2 style={{ fontFamily:"'Instrument Serif', Georgia, serif", fontSize:'1.2rem', fontWeight:400, marginBottom:'1.5rem', color:'#0f172a' }}>Match Request</h2>
            <form onSubmit={runMatch}>
              <div style={{ marginBottom:'1rem' }}>
                <label style={labelStyle}>Subject I need help with</label>
                <select value={form.subject} onChange={e => setForm(p=>({...p,subject:e.target.value}))} style={selectStyle}>
                  <option value="">Select a subject…</option>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:'1.25rem' }}>
                <label style={labelStyle}>My current level</label>
                <select value={form.proficiency} onChange={e => setForm(p=>({...p,proficiency:e.target.value}))} style={selectStyle}>
                  {PROFICIENCY.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              {error && <Alert type="error">{error}</Alert>}
              <button type="submit" style={{ width:'100%', padding:'0.65rem', background:'#16a34a', color:'#fff', border:'none', borderRadius:9, fontSize:'0.9rem', fontWeight:600, cursor:'pointer', boxShadow:'0 2px 8px rgba(22,163,74,0.3)' }}>
                Find Matches →
              </button>
            </form>

            <div style={{ marginTop:'1.5rem', padding:'1rem', background:'#f8fafc', borderRadius:10, border:'1px solid #e2e8f0' }}>
              <p style={{ fontSize:'0.7rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.75rem' }}>Score Criteria (FR-04)</p>
              {[['Subject match','50 pts','#16a34a'],['Proficiency gap','20 pts','#7c3aed'],['Schedule overlap','20 pts','#d97706'],['Shared interests','10 pts','#0284c7']].map(([l,p,c]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'0.8rem', marginBottom:'0.5rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:c, flexShrink:0 }} />
                    <span style={{ color:'#64748b' }}>{l}</span>
                  </div>
                  <span style={{ fontWeight:600, color:'#334155' }}>{p}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Results */}
        <div>
          {loading && <Card><Spinner text="Running matching algorithm…" /></Card>}

          {results && (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexWrap:'wrap', gap:8 }}>
                <h2 style={{ fontFamily:"'Instrument Serif', Georgia, serif", fontSize:'1.35rem', fontWeight:400, color:'#0f172a' }}>
                  {results.matches.length > 0 ? `Top ${results.matches.length} matches for "${form.subject}"` : 'No matches found'}
                </h2>
                <span style={{ fontSize:'0.78rem', color:'#94a3b8', background:'#f1f5f9', padding:'0.25rem 0.7rem', borderRadius:999 }}>{results.total_candidates} candidates evaluated</span>
              </div>

              {results.matches.length === 0 && (
                <Card><div style={{ textAlign:'center', padding:'2rem', color:'#64748b' }}>
                  <div style={{ fontSize:'2rem', opacity:0.4, marginBottom:'0.75rem' }}>🔍</div>
                  <p>No tutors found for this subject yet. Try another subject or check back later.</p>
                </div></Card>
              )}

              <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
                {results.matches.map((m, i) => (
                  <div key={m.tutor_id} className={i===0 ? 'ss-best-match-hover' : 'ss-card-hover'} style={{ background:'#fff', border:`1.5px solid ${i===0 ? '#16a34a' : '#e2e8f0'}`, borderRadius:14, padding:'1.25rem 1.5rem', display:'flex', alignItems:'flex-start', gap:'1rem', boxShadow: i===0 ? '0 4px 20px rgba(22,163,74,0.1)' : '0 1px 3px rgba(0,0,0,0.04)', flexWrap:'wrap', animation:`ss-fadeUp 0.42s cubic-bezier(.22,.68,0,1.1) ${i*70}ms both` }}>
                    {i === 0 && <div style={{ position:'absolute' }} />}
                    <Avatar initials={m.avatar_initials||'??'} size={48} index={i} />
                    <div style={{ flex:1, minWidth:180 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:'0.25rem' }}>
                        <span style={{ fontWeight:600, fontSize:'1rem', color:'#0f172a' }}>{m.name}</span>
                        {i===0 && <Badge variant="green">⭐ Best match</Badge>}
                        <Badge variant="gray">{m.year_of_study}</Badge>
                      </div>
                      <p style={{ fontSize:'0.82rem', color:'#64748b', marginBottom:'0.5rem' }}>{m.field_of_study}</p>
                      {m.bio && <p style={{ fontSize:'0.82rem', color:'#64748b', marginBottom:'0.6rem', lineHeight:1.5 }}>{m.bio}</p>}

                      <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:'0.6rem' }}>
                        {m.teach_skills?.slice(0,3).map(s => <Badge key={s.subject} variant={s.proficiency==='Advanced'?'green':s.proficiency==='Intermediate'?'purple':'amber'}>{s.subject} · {s.proficiency}</Badge>)}
                      </div>

                      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                        {[['Subject',m.score_subject,50,'#16a34a'],['Proficiency',m.score_proficiency,20,'#7c3aed'],['Schedule',m.score_schedule,20,'#d97706'],['Interests',m.score_interest,10,'#0284c7']].map(([l,v,max,c]) => (
                          <div key={l} style={{ display:'flex', alignItems:'center', gap:4 }}>
                            <div style={{ width:6, height:6, borderRadius:'50%', background: v>0 ? c : '#e2e8f0' }} />
                            <span style={{ fontSize:'0.7rem', color: v>0 ? c : '#94a3b8', fontWeight:500 }}>{l} {v}/{max}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, flexShrink:0 }}>
                      <ScoreCircle score={m.score} />
                      {sent[m.tutor_id]
                        ? <Badge variant="green">Sent ✓</Badge>
                        : <Button variant="primary" size="sm" onClick={() => sendRequest(m)}>Request</Button>
                      }
                      <Button variant="ghost" size="sm" onClick={() => navigate('/messages')}>Message</Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && !results && (
            <Card style={{ textAlign:'center', padding:'4rem 2rem' }}>
              <div style={{ fontSize:'3rem', opacity:0.25, marginBottom:'1rem' }}>🎯</div>
              <p style={{ fontWeight:600, color:'#334155', marginBottom:'0.4rem' }}>Ready to find your tutor</p>
              <p style={{ color:'#64748b', fontSize:'0.875rem' }}>Select a subject and your current level, then click <strong>Find Matches</strong>.</p>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}