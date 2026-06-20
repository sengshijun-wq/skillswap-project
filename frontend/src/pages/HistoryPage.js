// frontend/src/pages/HistoryPage.js
// FR-09: Match history
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Avatar, Button, Spinner, Alert, PageTitle, AnimatedCard } from '../components/UI';
import api from '../utils/api';

const STATUS_BADGE = {
  pending:   { label:'Pending',   variant:'amber' },
  accepted:  { label:'Accepted',  variant:'blue'  },
  active:    { label:'Active',    variant:'teal'  },
  completed: { label:'Completed', variant:'gray'  },
  declined:  { label:'Declined',  variant:'red'   },
};

const initialsOf = (name='??') => name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();

export default function HistoryPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    if (!user) return;
    api.get('/match/history')
      .then(r => setMatches(r.data.matches || []))
      .catch(() => setError('Failed to load match history.'))
      .finally(() => setLoading(false));
  }, [user]);

  const updateStatus = async (matchId, status) => {
    try {
      await api.patch(`/match/${matchId}/status`, { status });
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: status === 'accepted' ? 'active' : status } : m));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.');
    }
  };

  const filtered = filter === 'all' ? matches : matches.filter(m => m.status === filter);

  if (!user) return <div style={{ maxWidth:1100, margin:'0 auto', padding:'2rem' }}><Alert type="info">Please sign in to view your history.</Alert></div>;

  return (
    <main style={{ maxWidth:1100, margin:'0 auto', padding:'2.5rem 2rem' }}>
      <PageTitle title="Match History" subtitle="All your tutoring and learning sessions (FR-09)" />
      {error && <Alert type="error">{error}</Alert>}

      <div style={{ display:'flex', gap:8, marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {['all','pending','active','completed','declined'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding:'0.35rem 0.9rem', borderRadius:8, border:'none', background: filter===f ? '#1d9e75' : '#f0ede6', color: filter===f ? '#fff' : '#6b6860', fontFamily:'inherit', fontSize:'0.82rem', fontWeight: filter===f ? 500 : 400, cursor:'pointer', textTransform:'capitalize' }}>
            {f === 'all' ? `All (${matches.length})` : f}
          </button>
        ))}
      </div>

      {loading && <Spinner text="Loading history…" />}

      {!loading && filtered.length === 0 && (
        <Card style={{ textAlign:'center', padding:'3rem' }}>
          <div style={{ fontSize:'2.5rem', opacity:0.3, marginBottom:'0.75rem' }}>📋</div>
          <p style={{ color:'#6b6860' }}>No {filter === 'all' ? '' : filter} matches found. <a href="/match" style={{ color:'#1d9e75' }}>Find a tutor →</a></p>
        </Card>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        {filtered.map((m, i) => {
          const isLearner = m.learner_id === user.id;
          const otherName     = isLearner ? m.tutor_name : m.learner_name;
          const otherInitials = isLearner ? (m.tutor_initials || initialsOf(m.tutor_name)) : (m.learner_initials || initialsOf(m.learner_name));
          const myRole = isLearner ? 'Learner' : 'Tutor';
          const st = STATUS_BADGE[m.status] || { label: m.status, variant:'gray' };

          return (
            <AnimatedCard key={m.id} animation="fadeUp" delay={i * 60}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap' }}>
                <Avatar initials={otherInitials} size={44} index={i} />
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontWeight:600 }}>{otherName}</span>
                    <Badge variant={st.variant}>{st.label}</Badge>
                    <Badge variant={myRole === 'Tutor' ? 'teal' : 'purple'}>You are: {myRole}</Badge>
                  </div>
                  <p style={{ fontSize:'0.82rem', color:'#6b6860', margin:'0.25rem 0' }}>Subject: <strong>{m.subject}</strong></p>
                  <p style={{ fontSize:'0.78rem', color:'#6b6860' }}>
                    Requested: {new Date(m.requested_at).toLocaleDateString()}
                    {m.accepted_at && ` · Accepted: ${new Date(m.accepted_at).toLocaleDateString()}`}
                    {m.completed_at && ` · Completed: ${new Date(m.completed_at).toLocaleDateString()}`}
                  </p>
                  <div style={{ display:'flex', gap:12, marginTop:'0.5rem', flexWrap:'wrap' }}>
                    <span style={{ fontSize:'0.72rem', fontWeight:600, color:'#1a1916' }}>Score: {m.score}/100</span>
                    {[['Subject', m.score_subject, '#1d9e75'], ['Proficiency', m.score_proficiency, '#534ab7'], ['Schedule', m.score_schedule, '#ba7517'], ['Interests', m.score_interest, '#d4537e']].map(([l, v, c]) => (
                      <span key={l} style={{ fontSize:'0.7rem', color: c }}>+{v} {l}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:6, alignSelf:'center' }}>
                  {m.status === 'pending' && myRole === 'Tutor' && (
                    <>
                      <Button variant="primary" size="sm" onClick={() => updateStatus(m.id, 'accepted')}>Accept</Button>
                      <Button variant="danger"  size="sm" onClick={() => updateStatus(m.id, 'declined')}>Decline</Button>
                    </>
                  )}
                  {m.status === 'active' && <Button variant="outline" size="sm" onClick={() => updateStatus(m.id, 'completed')}>Mark Complete</Button>}
                </div>
              </div>
            </AnimatedCard>
          );
        })}
      </div>
    </main>
  );
}