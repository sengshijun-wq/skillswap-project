// frontend/src/pages/MessagesPage.js
// FR-06: In-platform messaging
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Avatar, Spinner, EmptyState, Alert, Button } from '../components/UI';
import api from '../utils/api';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv,    setActiveConv]    = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState('');
  const [loadingConvs,  setLoadingConvs]  = useState(true);
  const [loadingMsgs,   setLoadingMsgs]   = useState(false);
  const [sending,       setSending]       = useState(false);
  const [error,         setError]         = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    api.get('/messages/conversations')
      .then(r => setConversations(r.data.conversations || []))
      .catch(() => setError('Failed to load conversations.'))
      .finally(() => setLoadingConvs(false));
  }, [user]);

  useEffect(() => {
    if (!activeConv) return;
    setLoadingMsgs(true);
    api.get(`/messages/${activeConv.match_id}`)
      .then(r => setMessages(r.data.messages || []))
      .catch(() => setError('Failed to load messages.'))
      .finally(() => setLoadingMsgs(false));
  }, [activeConv]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !activeConv) return;
    setSending(true);
    try {
      const { data } = await api.post(`/messages/${activeConv.match_id}`, { content: input.trim() });
      setMessages(prev => [...prev, { id: data.message_id, sender_id: user.id, content: input.trim(), sent_at: new Date().toISOString() }]);
      setInput('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message.');
    } finally { setSending(false); }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!user) return <div style={{ maxWidth:1100, margin:'0 auto', padding:'2rem' }}><Alert type="info">Please <a href="/login" style={{ color:'#185fa5' }}>sign in</a> to view messages.</Alert></div>;

  return (
    <main style={{ maxWidth:1100, margin:'0 auto', padding:'2.5rem 2rem' }}>
      <h1 style={{ fontFamily:'Georgia,serif', fontSize:'1.9rem', fontWeight:400, marginBottom:'1.5rem' }}>Messages</h1>
      {error && <Alert type="error">{error}</Alert>}

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', border:'1px solid rgba(0,0,0,0.1)', borderRadius:14, overflow:'hidden', height:600, background:'#fff' }}>

        {/* Conversation list */}
        <div style={{ borderRight:'1px solid rgba(0,0,0,0.1)', overflowY:'auto' }}>
          <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid rgba(0,0,0,0.1)', fontWeight:600, fontSize:'0.9rem' }}>Conversations</div>
          {loadingConvs && <Spinner text="Loading…" />}
          {!loadingConvs && conversations.length === 0 && <EmptyState icon="💬" title="No conversations yet" message="Send a match request to start chatting." />}
          {conversations.map((c, i) => (
            <div key={c.match_id} onClick={() => setActiveConv(c)} style={{
              padding:'0.9rem 1.25rem', cursor:'pointer',
              background: activeConv?.match_id === c.match_id ? '#e1f5ee' : 'transparent',
              borderBottom:'1px solid rgba(0,0,0,0.05)', display:'flex', gap:'0.75rem', alignItems:'flex-start',
            }}>
              <Avatar initials={c.other_initials || '??'} size={38} index={i} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:500, fontSize:'0.875rem' }}>{c.other_name}</span>
                  {c.unread_count > 0 && <span style={{ background:'#1d9e75', color:'#fff', borderRadius:999, fontSize:'0.68rem', padding:'0.1rem 0.45rem', fontWeight:600 }}>{c.unread_count}</span>}
                </div>
                <p style={{ fontSize:'0.75rem', color:'#6b6860', margin:'0.1rem 0 0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.last_message || c.subject}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat area */}
        {!activeConv ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
            <EmptyState icon="💬" title="Select a conversation" message="Choose a match from the left to start messaging." />
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'0.9rem 1.5rem', borderBottom:'1px solid rgba(0,0,0,0.1)', display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <Avatar initials={activeConv.other_initials || '??'} size={36} index={conversations.indexOf(activeConv)} />
              <div>
                <p style={{ fontWeight:600, fontSize:'0.925rem', margin:0 }}>{activeConv.other_name}</p>
                <p style={{ fontSize:'0.75rem', color:'#6b6860', margin:0 }}>Subject: {activeConv.subject}</p>
              </div>
              <span style={{ marginLeft:'auto', fontSize:'0.75rem', padding:'0.2rem 0.6rem', borderRadius:999, background: activeConv.status === 'active' ? '#e1f5ee' : '#f0ede6', color: activeConv.status === 'active' ? '#0f6e56' : '#6b6860' }}>{activeConv.status}</span>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'1.25rem 1.5rem', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              {loadingMsgs && <Spinner text="Loading messages…" />}
              {!loadingMsgs && messages.length === 0 && <EmptyState icon="💬" title="No messages yet" message="Send the first message to get started!" />}
              {messages.map((msg) => {
                const isOwn = msg.sender_id === user.id;
                return (
                  <div key={msg.id} style={{ alignSelf: isOwn ? 'flex-end' : 'flex-start', maxWidth:'65%' }}>
                    <div style={{ padding:'0.65rem 1rem', borderRadius: isOwn ? '12px 4px 12px 12px' : '4px 12px 12px 12px', background: isOwn ? '#1d9e75' : '#f0ede6', color: isOwn ? '#fff' : '#1a1916', fontSize:'0.875rem', lineHeight:1.5 }}>
                      {msg.content}
                    </div>
                    <p style={{ fontSize:'0.7rem', color:'#b0ada5', margin:'0.15rem 0.25rem 0', textAlign: isOwn ? 'right' : 'left' }}>{formatTime(msg.sent_at)}</p>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid rgba(0,0,0,0.1)', display:'flex', gap:'0.75rem' }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Type a message… (Enter to send)" style={{ flex:1, padding:'0.6rem 1rem', border:'1px solid rgba(0,0,0,0.15)', borderRadius:20, fontFamily:'inherit', fontSize:'0.875rem', outline:'none' }} />
              <Button variant="primary" onClick={sendMessage} disabled={sending || !input.trim()}>{sending ? '…' : 'Send'}</Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
