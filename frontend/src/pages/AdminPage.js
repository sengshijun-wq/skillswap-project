// frontend/src/pages/AdminPage.js
// FR-10: Administrator dashboard
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Avatar, Button, Spinner, Alert, PageTitle, AnimatedCard } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';

export default function AdminPage() {
  const { user } = useAuth();
  const [data,    setData]    = useState(null);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('overview');
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    Promise.all([api.get('/admin/dashboard'), api.get('/admin/users')])
      .then(([d, u]) => { setData(d.data); setUsers(u.data.users || []); })
      .catch(() => setError('Failed to load admin data.'))
      .finally(() => setLoading(false));
  }, [user]);

  const removeUser = async (id, name) => {
    if (!window.confirm(`Remove ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove user.');
    }
  };

  if (!user || user.role !== 'admin') return <div style={{ maxWidth:1100, margin:'0 auto', padding:'2rem' }}><Alert type="error">Admin access required.</Alert></div>;
  if (loading) return <div style={{ maxWidth:1100, margin:'0 auto', padding:'2rem' }}><Spinner text="Loading dashboard…" /></div>;

  return (
    <main style={{ maxWidth:1100, margin:'0 auto', padding:'2.5rem 2rem' }}>
      <PageTitle title="Admin Dashboard" subtitle="Platform-wide usage statistics and user management (FR-10)" />
      {error && <Alert type="error">{error}</Alert>}

      <div style={{ display:'flex', gap:8, marginBottom:'2rem' }}>
        {['overview','matches','users'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:'0.4rem 1.1rem', borderRadius:8, border:'none', cursor:'pointer', background: tab===t ? '#1d9e75' : '#f0ede6', color: tab===t ? '#fff' : '#6b6860', fontFamily:'inherit', fontSize:'0.85rem', fontWeight: tab===t ? 500 : 400, textTransform:'capitalize' }}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && data && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
            {[
              { label:'Total Users',    value: data.users.total_users,       color:'#1d9e75', icon:'👥' },
              { label:'Active Matches', value: data.matches.active,          color:'#534ab7', icon:'🤝' },
              { label:'Total Matches',  value: data.matches.total_matches,   color:'#ba7517', icon:'📋' },
              { label:'Messages Sent',  value: data.messages.total_messages, color:'#185fa5', icon:'💬' },
            ].map((kpi, idx) => (
              <AnimatedCard key={kpi.label} animation="pop" delay={idx * 80} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.8rem', marginBottom:'0.4rem' }}>{kpi.icon}</div>
                <div style={{ fontFamily:'Georgia,serif', fontSize:'2rem', color: kpi.color, lineHeight:1 }}>{kpi.value}</div>
                <div style={{ fontSize:'0.78rem', color:'#6b6860', marginTop:'0.3rem' }}>{kpi.label}</div>
              </AnimatedCard>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
            <AnimatedCard animation="fadeUp" delay={0}>
              <h3 style={{ fontWeight:600, marginBottom:'1.25rem' }}>User Roles</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {[['Tutors / Both', data.users.total_tutors, '#1d9e75'], ['Learners / Both', data.users.total_learners, '#534ab7']].map(([label, count, color]) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                    <span style={{ fontSize:'0.82rem', width:130 }}>{label}</span>
                    <div style={{ flex:1, height:20, background:'#f0ede6', borderRadius:5, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${Math.round((count / (data.users.total_users || 1)) * 100)}%`, background: color, borderRadius:5 }} />
                    </div>
                    <span style={{ fontSize:'0.78rem', fontWeight:600, width:30, textAlign:'right' }}>{count}</span>
                  </div>
                ))}
              </div>
            </AnimatedCard>

            <AnimatedCard animation="fadeUp" delay={80}>
              <h3 style={{ fontWeight:600, marginBottom:'1.25rem' }}>Match Status Breakdown</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {[['Pending', data.matches.pending, '#ba7517'], ['Active', data.matches.active, '#1d9e75'], ['Completed', data.matches.completed, '#534ab7'], ['Declined', data.matches.declined, '#a32d2d']].map(([label, count, color]) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'0.82rem' }}>{label}</span>
                    <span style={{ fontSize:'0.85rem', fontWeight:600, color }}>{count}</span>
                  </div>
                ))}
                <div style={{ borderTop:'1px solid rgba(0,0,0,0.08)', paddingTop:'0.5rem', display:'flex', justifyContent:'space-between', fontSize:'0.82rem' }}>
                  <span>Average Score</span>
                  <span style={{ fontWeight:600 }}>{data.matches.avg_score || '—'} / 100</span>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {data.top_subjects?.length > 0 && (
            <AnimatedCard animation="fadeUp" delay={0}>
              <h3 style={{ fontWeight:600, marginBottom:'1.25rem' }}>Most Requested Subjects</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.top_subjects} margin={{ top:5, right:10, left:-20, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                  <XAxis dataKey="subject" tick={{ fontSize:11 }} />
                  <YAxis tick={{ fontSize:11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="request_count" fill="#1d9e75" radius={[4,4,0,0]} name="Requests" />
                </BarChart>
              </ResponsiveContainer>
            </AnimatedCard>
          )}
        </div>
      )}

      {tab === 'matches' && data && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
          {data.scores_by_subject?.length > 0 && (
            <AnimatedCard animation="fadeUp" delay={0}>
              <h3 style={{ fontWeight:600, marginBottom:'1.25rem' }}>Average Match Score by Subject</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.scores_by_subject} margin={{ top:5, right:10, left:-10, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                  <XAxis dataKey="subject" tick={{ fontSize:10 }} />
                  <YAxis domain={[0,100]} tick={{ fontSize:11 }} />
                  <Tooltip formatter={(v) => [`${v}/100`]} />
                  <Bar dataKey="avg_score" fill="#534ab7" radius={[4,4,0,0]} name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </AnimatedCard>
          )}
          <AnimatedCard animation="fadeUp" delay={100}>
            <h3 style={{ fontWeight:600, marginBottom:'1rem' }}>Summary</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
              {[['Total Matches', data.matches.total_matches], ['Avg Score', `${data.matches.avg_score || 0}/100`], ['Completion Rate', data.matches.total_matches > 0 ? `${Math.round((data.matches.completed / data.matches.total_matches) * 100)}%` : '0%']].map(([l, v]) => (
                <div key={l} style={{ background:'#f7f5f0', borderRadius:10, padding:'1rem', textAlign:'center' }}>
                  <div style={{ fontSize:'1.5rem', fontWeight:700 }}>{v}</div>
                  <div style={{ fontSize:'0.75rem', color:'#6b6860', marginTop:'0.25rem' }}>{l}</div>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </div>
      )}

      {tab === 'users' && (
        <AnimatedCard animation="fadeUp" delay={0}>
          <h3 style={{ fontWeight:600, marginBottom:'1.25rem' }}>Registered Users ({users.length})</h3>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'2px solid rgba(0,0,0,0.08)' }}>
                  {['User','Email','Role','Year','Field','Skills','Matches','Joined','Action'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'0.6rem 0.75rem', fontSize:'0.75rem', fontWeight:600, color:'#6b6860', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom:'1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding:'0.65rem 0.75rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <Avatar initials={u.avatar_initials || '??'} size={30} index={i} />
                        <span style={{ fontSize:'0.85rem', fontWeight:500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'0.65rem 0.75rem', fontSize:'0.8rem', color:'#6b6860' }}>{u.email}</td>
                    <td style={{ padding:'0.65rem 0.75rem' }}><Badge variant={u.role === 'tutor' ? 'teal' : u.role === 'learner' ? 'purple' : 'amber'}>{u.role}</Badge></td>
                    <td style={{ padding:'0.65rem 0.75rem', fontSize:'0.8rem', color:'#6b6860' }}>{u.year_of_study || '—'}</td>
                    <td style={{ padding:'0.65rem 0.75rem', fontSize:'0.78rem', color:'#6b6860', maxWidth:160 }}>{u.field_of_study || '—'}</td>
                    <td style={{ padding:'0.65rem 0.75rem', fontSize:'0.82rem', textAlign:'center' }}>{u.skill_count}</td>
                    <td style={{ padding:'0.65rem 0.75rem', fontSize:'0.82rem', textAlign:'center' }}>{u.match_count}</td>
                    <td style={{ padding:'0.65rem 0.75rem', fontSize:'0.78rem', color:'#6b6860' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={{ padding:'0.65rem 0.75rem' }}><Button variant="danger" size="sm" onClick={() => removeUser(u.id, u.name)}>Remove</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedCard>
      )}
    </main>
  );
}