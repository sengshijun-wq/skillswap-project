// frontend/src/pages/ProfilePage.js — FR-03, FR-07, FR-08
import React, { useState, useEffect, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Avatar, Button, Spinner, Alert, PageTitle, AnimatedCard } from '../components/UI';
import api from '../utils/api';

const DAYS  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const SLOTS = ['Morning','Afternoon','Evening'];
const PROFICIENCY = ['Beginner','Intermediate','Advanced'];
const INTERESTS = ['Software Engineering','AI & Machine Learning','Web Development','Data Science','Networking & Security','Database Systems','UI/UX Design','Mobile Development','Competitive Programming','Mathematics'];
const SUBJECTS  = ['Python Programming','Java','C++','JavaScript','Object-Oriented Programming','Data Structures & Algorithms','Web Development (React.js)','Database Management (MySQL)','Calculus & Mathematics','Computer Networks','Artificial Intelligence','Machine Learning','Statistics','Discrete Mathematics','Network Security','HTML & CSS'];
const PROF_BADGE = { Beginner:'amber', Intermediate:'purple', Advanced:'green' };
const sel = { padding:'0.4rem 0.6rem', border:'1px solid #e2e8f0', borderRadius:7, fontFamily:'inherit', fontSize:'0.8rem', background:'#fff', flex:1 };

// Helper: Build full avatar URL from various possible field formats
const buildAvatarUrl = (profile) => {
  // Try multiple possible field names from backend
  const avatarPath = profile?.avatar_url || profile?.avatarUrl || profile?.avatar || null;
  
  if (!avatarPath) return null;
  
  // If it's already a full URL (http/https), return as-is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  
  // Otherwise, prepend the backend base URL
  return `http://localhost:5000${avatarPath}`;
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [form, setForm] = useState({ name:'', bio:'', year_of_study:'', field_of_study:'', skills:[], availability:[], interests:[] });

  // State for image cropper
  const [imageSrc, setImageSrc] = useState('');
  const [crop, setCrop] = useState();
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImageBlob, setCroppedImageBlob] = useState(null);
  const imgRef = useRef(null);

  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (!user) return;
    api.get(`/profile/${user.id}`)
      .then(r => {
        // 🔍 DEBUG: Log full profile data to see what the backend returns
        console.log('📊 Full profile response:', r.data);
        console.log('🖼️  avatar_url field:', r.data.avatar_url);
        console.log('🖼️  avatarUrl field:', r.data.avatarUrl);
        console.log('🖼️  avatar field:', r.data.avatar);
        
        setProfile(r.data);
        setForm({
          name: r.data.name,
          bio: r.data.bio || '',
          year_of_study: r.data.year_of_study || '',
          field_of_study: r.data.field_of_study || '',
          skills: r.data.skills || [],
          availability: r.data.availability || [],
          interests: r.data.interests || []
        });
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
      // Reset file input to allow re-selection of the same file
      e.target.value = null;
    }
  };

  const handleImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width,
      height
    );
    setCrop(crop);
  };

  const handleConfirmCrop = async () => {
    if (!imgRef.current || !crop || !crop.width || !crop.height) {
      console.error("Crop or image ref is not ready");
      return;
    }
  
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');
  
    ctx.drawImage(
      imgRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
  
    canvas.toBlob((blob) => {
      if (blob) {
        setCroppedImageBlob(blob);
        // Update profile picture preview with a local URL
        const previewUrl = URL.createObjectURL(blob);
        const updatedProfile = { ...profile, avatar_url: previewUrl };
        setProfile(updatedProfile);
        // We no longer need the original avatarFile state
        setAvatarFile(null); 
      }
      setShowCropper(false);
      setImageSrc('');
    }, 'image/png');
  };

  const toggleAvail = (day, slot) => setForm(p => { const exists = p.availability.some(a => a.day===day && a.slot===slot); return {...p, availability: exists ? p.availability.filter(a => !(a.day===day && a.slot===slot)) : [...p.availability, {day,slot}]}; });
  const toggleInt   = (i) => setForm(p => ({ ...p, interests: p.interests.includes(i) ? p.interests.filter(x=>x!==i) : [...p.interests, i] }));
  const addSkill    = (t) => setForm(p => ({...p, skills:[...p.skills, {subject:'',skill_type:t,proficiency:'Beginner',subject_code:''}]}));
  const updSkill    = (i,f,v) => setForm(p => { const s=[...p.skills]; s[i]={...s[i],[f]:v}; return {...p,skills:s}; });
  const remSkill    = (i) => setForm(p => ({...p, skills:p.skills.filter((_,x)=>x!==i)}));

  const uploadAvatar = async () => {
    if (!croppedImageBlob) return null;

    const formData = new FormData();
    // Use the cropped blob instead of the original file
    formData.append('avatar', croppedImageBlob, 'avatar.png');

    try {
      const res = await api.post('/avatar/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('📤 Avatar upload response:', res.data);
      // Clear the blob after upload
      setCroppedImageBlob(null); 
      return res.data.avatarUrl || res.data.avatar_url || res.data.url;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to upload avatar.');
    }
  };

  const save = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const newAvatarUrl = await uploadAvatar();

      await api.put('/profile', form);
      
      const finalProfile = {
        ...profile,
        ...form,
        avatar_url: newAvatarUrl || profile?.avatar_url,
      };

      setProfile(finalProfile);

      updateUser({ 
        name: finalProfile.name,
        avatar_url: finalProfile.avatar_url 
      });

      setSuccess('Profile saved successfully!');
      setEditing(false);

    } catch (err) { 
      console.error('An error occurred during save:', err);
      setError(err.message || 'Failed to save profile.'); 
    }
    finally { setSaving(false); }
  };

  if (!user)    return <div style={{maxWidth:1160,margin:'0 auto',padding:'2rem'}}><Alert type="info">Please <a href="/login">sign in</a>.</Alert></div>;
  if (loading)  return <div style={{maxWidth:1160,margin:'0 auto',padding:'2rem'}}><Spinner text="Loading profile…" /></div>;

  const teach = (profile?.skills||[]).filter(s=>s.skill_type==='teach');
  const learn = (profile?.skills||[]).filter(s=>s.skill_type==='learn');
  
  // Build the final avatar URL using our helper function
  const avatarSrc = buildAvatarUrl(profile);
  console.log('🖼️  Final avatar URL being used:', avatarSrc);

  return (
    <main style={{maxWidth:1160,margin:'0 auto',padding:'2.5rem 1.5rem',background:'#f8fafc',minHeight:'100vh'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');`}</style>
      <PageTitle
        title="My Profile"
        subtitle="Manage your skills, schedule, and academic interests (FR-03, FR-07, FR-08)"
        action={!editing
          ? <Button variant="outline" onClick={()=>setEditing(true)}>✏️ Edit Profile</Button>
          : <div style={{display:'flex',gap:8}}><Button variant="outline" onClick={()=>setEditing(false)}>Cancel</Button><Button variant="primary" onClick={save} disabled={saving}>{saving?'Saving…':'Save changes'}</Button></div>
        }
      />

      {error   && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:'1.5rem'}}>

        {/* Sidebar */}
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <AnimatedCard animation="slideR" style={{textAlign:'center'}}>
            <Avatar 
              src={avatarSrc}
              initials={profile?.avatar_initials || profile?.name?.charAt(0) || '??'} 
              size={72} 
              index={user.id||0} 
            />
            {editing && (
              <div style={{marginTop:'1rem'}}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                  accept="image/png, image/jpeg, image/gif"
                />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current.click()}>
                  Change Avatar
                </Button>
                {croppedImageBlob && <p style={{fontSize:'0.75rem', color:'#64748b', marginTop:'0.5rem'}}>New avatar selected.</p>}
              </div>
            )}
            <div style={{marginTop:'1rem'}}>
              <p style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:'1.25rem',fontWeight:400,color:'#0f172a'}}>{profile?.name}</p>
              <p style={{fontSize:'0.8rem',color:'#64748b',marginTop:'0.2rem'}}>{profile?.year_of_study}</p>
              <p style={{fontSize:'0.78rem',color:'#94a3b8'}}>{profile?.field_of_study}</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:'1.25rem'}}>
              {[['Active',profile?.stats?.active_matches||0,'Matches'],['Done',profile?.stats?.completed_matches||0,'Sessions'],['Teaching',teach.length,'Skills'],['Learning',learn.length,'Goals']].map(([label,num,unit])=>(
                <div key={label} style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:9,padding:'0.65rem'}}>
                  <div style={{fontSize:'1.3rem',fontWeight:700,color:'#0f172a'}}>{num}</div>
                  <div style={{fontSize:'0.68rem',color:'#64748b',marginTop:'0.1rem'}}>{unit}</div>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </div>

        {/* Content */}
        <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>

          {/* Edit info */}
          {editing && (
            <AnimatedCard animation="fadeIn" delay={0}>
              <h3 style={{fontWeight:600,fontSize:'0.95rem',marginBottom:'1rem',color:'#0f172a'}}>About Me</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'0.75rem'}}>
                <div>
                  <label style={{fontSize:'0.8rem',fontWeight:500,color:'#374151',display:'block',marginBottom:'0.35rem'}}>Year of Study</label>
                  <select value={form.year_of_study} onChange={e=>setForm(p=>({...p,year_of_study:e.target.value}))} style={{...sel,padding:'0.5rem 0.75rem',width:'100%'}}>
                    {['Year 1','Year 2','Year 3','Year 4 or above'].map(y=><option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:'0.8rem',fontWeight:500,color:'#374151',display:'block',marginBottom:'0.35rem'}}>Field of Study</label>
                  <select value={form.field_of_study} onChange={e=>setForm(p=>({...p,field_of_study:e.target.value}))} style={{...sel,padding:'0.5rem 0.75rem',width:'100%'}}>
                    {['Computer Science / IT / Software Engineering','Business / Management','Design / Creative Arts','Engineering (Non-IT)','Science / Mathematics','Other'].map(f=><option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <label style={{fontSize:'0.8rem',fontWeight:500,color:'#374151',display:'block',marginBottom:'0.35rem'}}>Bio</label>
              <textarea value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))} rows={3} style={{width:'100%',padding:'0.5rem 0.85rem',border:'1.5px solid #e2e8f0',borderRadius:9,fontFamily:'inherit',fontSize:'0.875rem',resize:'vertical'}} placeholder="Tell others about yourself…" />
            </AnimatedCard>
          )}

          {/* Skills Teach */}
          <AnimatedCard animation="fadeUp" delay={0}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
              <div>
                <h3 style={{fontWeight:600,fontSize:'0.95rem',color:'#0f172a'}}>Skills I can Teach</h3>
                <p style={{fontSize:'0.78rem',color:'#94a3b8',marginTop:'0.1rem'}}>FR-03 — subjects you offer to tutor</p>
              </div>
              {editing && <Button variant="outline" size="sm" onClick={()=>addSkill('teach')}>+ Add skill</Button>}
            </div>
            {editing ? (
              form.skills.filter(s=>s.skill_type==='teach').length===0
                ? <p style={{color:'#94a3b8',fontSize:'0.85rem'}}>No teaching skills yet. Click + Add skill.</p>
                : form.skills.map((s,i)=>s.skill_type!=='teach'?null:(
                  <div key={i} style={{display:'flex',gap:8,marginBottom:8,alignItems:'center'}}>
                    <select value={s.subject} onChange={e=>updSkill(i,'subject',e.target.value)} style={sel}>
                      <option value="">Select subject…</option>{SUBJECTS.map(sub=><option key={sub}>{sub}</option>)}
                    </select>
                    <select value={s.proficiency} onChange={e=>updSkill(i,'proficiency',e.target.value)} style={{...sel,flex:'0 0 130px'}}>
                      {PROFICIENCY.map(p=><option key={p}>{p}</option>)}
                    </select>
                    <Button variant="danger" size="sm" onClick={()=>remSkill(i)}>✕</Button>
                  </div>
                ))
            ) : (
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {teach.length===0?<p style={{color:'#94a3b8',fontSize:'0.85rem'}}>No teaching skills listed yet.</p>:teach.map(s=><Badge key={s.id} variant={PROF_BADGE[s.proficiency]||'gray'}>{s.subject} · {s.proficiency}</Badge>)}
              </div>
            )}
          </AnimatedCard>

          {/* Skills Learn */}
          <AnimatedCard animation="fadeUp" delay={80}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
              <div>
                <h3 style={{fontWeight:600,fontSize:'0.95rem',color:'#0f172a'}}>Skills I want to Learn</h3>
                <p style={{fontSize:'0.78rem',color:'#94a3b8',marginTop:'0.1rem'}}>FR-03 — subjects you're looking for help with</p>
              </div>
              {editing && <Button variant="outline" size="sm" onClick={()=>addSkill('learn')}>+ Add goal</Button>}
            </div>
            {editing ? (
              form.skills.filter(s=>s.skill_type==='learn').length===0
                ? <p style={{color:'#94a3b8',fontSize:'0.85rem'}}>No learning goals yet. Click + Add goal.</p>
                : form.skills.map((s,i)=>s.skill_type!=='learn'?null:(
                  <div key={i} style={{display:'flex',gap:8,marginBottom:8,alignItems:'center'}}>
                    <select value={s.subject} onChange={e=>updSkill(i,'subject',e.target.value)} style={sel}>
                      <option value="">Select subject…</option>{SUBJECTS.map(sub=><option key={sub}>{sub}</option>)}
                    </select>
                    <select value={s.proficiency} onChange={e=>updSkill(i,'proficiency',e.target.value)} style={{...sel,flex:'0 0 130px'}}>
                      {PROFICIENCY.map(p=><option key={p}>{p}</option>)}
                    </select>
                    <Button variant="danger" size="sm" onClick={()=>remSkill(i)}>✕</Button>
                  </div>
                ))
            ) : (
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {learn.length===0?<p style={{color:'#94a3b8',fontSize:'0.85rem'}}>No learning goals listed yet.</p>:learn.map(s=><Badge key={s.id} variant="purple">{s.subject} · {s.proficiency}</Badge>)}
              </div>
            )}
          </AnimatedCard>

          {/* Availability */}
          <AnimatedCard animation="fadeUp" delay={160}>
            <h3 style={{fontWeight:600,fontSize:'0.95rem',color:'#0f172a',marginBottom:'0.3rem'}}>Weekly Availability</h3>
            <p style={{fontSize:'0.78rem',color:'#94a3b8',marginBottom:'1.25rem'}}>FR-07 — when you're free for sessions</p>
            <div style={{overflowX:'auto'}}>
              <table style={{borderCollapse:'collapse',width:'100%',minWidth:500}}>
                <thead>
                  <tr>
                    <th style={{fontSize:'0.72rem',color:'#94a3b8',fontWeight:600,padding:'0 0.5rem 0.6rem',textAlign:'left'}}>Slot</th>
                    {DAYS.map(d=><th key={d} style={{fontSize:'0.72rem',color:'#94a3b8',fontWeight:600,padding:'0 0.25rem 0.6rem',textAlign:'center',width:70}}>{d.slice(0,3)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {SLOTS.map(slot=>(
                    <tr key={slot}>
                      <td style={{fontSize:'0.8rem',color:'#64748b',padding:'0.3rem 0.5rem',fontWeight:500}}>{slot}</td>
                      {DAYS.map(day=>{
                        const active = editing ? form.availability.some(a=>a.day===day&&a.slot===slot) : (profile?.availability||[]).some(a=>a.day===day&&a.slot===slot);
                        return (
                          <td key={day} style={{textAlign:'center',padding:'0.25rem'}}>
                            <div onClick={()=>editing&&toggleAvail(day,slot)} style={{width:30,height:30,borderRadius:8,margin:'0 auto',background:active?'#16a34a':'#f1f5f9',border:`1.5px solid ${active?'#15803d':'#e2e8f0'}`,cursor:editing?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',color:active?'#fff':'#94a3b8',transition:'all 0.15s',fontWeight:700}}>
                              {active?'✓':''}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimatedCard>

          {/* Interests */}
          <AnimatedCard animation="fadeUp" delay={240}>
            <h3 style={{fontWeight:600,fontSize:'0.95rem',color:'#0f172a',marginBottom:'0.3rem'}}>Academic Interests</h3>
            <p style={{fontSize:'0.78rem',color:'#94a3b8',marginBottom:'1rem'}}>Used by the matching algorithm for the shared interest criterion (10 pts)</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {INTERESTS.map(interest=>{
                const active = editing ? form.interests.includes(interest) : (profile?.interests||[]).includes(interest);
                return (
                  <span key={interest} onClick={()=>editing&&toggleInt(interest)} style={{padding:'0.35rem 0.85rem',borderRadius:999,fontSize:'0.82rem',fontWeight:500,cursor:editing?'pointer':'default',background:active?'#f0fdf4':'#f8fafc',color:active?'#15803d':'#64748b',border:`1.5px solid ${active?'#86efac':'#e2e8f0'}`,transition:'all 0.15s'}}>
                    {active && '✓ '}{interest}
                  </span>
                );
              })}
            </div>
          </AnimatedCard>
        </div>
      </div>

      {showCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Your New Avatar</h3>
            {imageSrc && (
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                aspect={1}
                circularCrop
                keepSelection
              >
                <img ref={imgRef} src={imageSrc} onLoad={handleImageLoad} alt="Crop preview" style={{ maxHeight: '70vh', display: 'block' }}/>
              </ReactCrop>
            )}
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowCropper(false); setImageSrc(''); }}>Cancel</Button>
              <Button onClick={handleConfirmCrop}>Confirm & Save</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}