import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Pixel } from '../lib/marketing';

const S = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg)',
    color: 'var(--text)',
    padding: '60px 20px',
    textAlign: 'center',
    fontFamily: 'var(--font-body)',
  },
  hero: {
    maxWidth: 600,
    margin: '0 auto',
    zIndex: 2,
    position: 'relative',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: 20,
    background: 'var(--gold-dim)',
    color: 'var(--gold)',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    marginBottom: 20,
    fontFamily: 'var(--font-data)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 42,
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: 20,
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: 32,
    marginTop: 40,
    textAlign: 'left',
  },
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid var(--border)',
  },
  btn: {
    width: '100%',
    padding: 16,
    background: 'var(--gold)',
    color: '#000',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: 15,
    fontWeight: 700,
    marginTop: 32,
    cursor: 'pointer',
    fontFamily: 'var(--font-data)',
  }
};

const OWNER_EMAIL = 'olugbenga1000@gmail.com';
const BASE_URL = 'https://riskpilot-gold.vercel.app';

export default function Affiliate({ onBack }) {
  const [email, setEmail] = useState('');
  const [applied, setApplied] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase.from('profiles').select('is_affiliate').eq('id', user.id).single();
        if (data?.is_affiliate) setIsAffiliate(true);
      }
    };
    checkStatus();
  }, []);

  const handleApply = (e) => {
    e.preventDefault();
    if (!email) return;

    // Fire mailto to owner so every application lands in their inbox
    const subject = encodeURIComponent('RiskPilot Affiliate Application');
    const body = encodeURIComponent(
      `New affiliate application received!\n\nApplicant Email: ${email}\n\nPlease review and approve their affiliate access in the Supabase dashboard by setting is_affiliate = true on their profile.\n\n---\nSent from RiskPilot Affiliate Page`
    );
    window.location.href = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;

    setApplied(true);
    Pixel.track('CompleteRegistration', { content_name: 'Affiliate Application' });
  };

  const handleCopy = (link) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Use userId slug if available, fall back to owner's vanity slug
  const refSlug = userId ? userId.slice(0, 8) : 'olugbenga';
  const referralLink = `${BASE_URL}?ref=${refSlug}`;

  return (
    <div style={S.container}>
      <div style={S.hero}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:12, cursor:'pointer', marginBottom:40 }}>← BACK TO MAIN</button>
        <div style={S.badge}>◈ PARTNER PROGRAM</div>
        <h1 style={S.title}>Scale With Us. <br/> Earn 30% Lifetime.</h1>
        <p style={{ color: 'var(--text-sub)', lineHeight: 1.6 }}>
          Join the RiskPilot Affiliate Program. Help traders master their discipline and earn recurring commissions for every Gold upgrade you refer.
        </p>

        <div style={S.card}>
          <div style={S.stat}>
            <span style={{ color:'var(--text-muted)' }}>Commission Rate</span>
            <span style={{ color:'var(--gold)', fontWeight:700 }}>30% per sale</span>
          </div>
          <div style={S.stat}>
            <span style={{ color:'var(--text-muted)' }}>Cookie Duration</span>
            <span style={{ color:'var(--text)', fontWeight:700 }}>60 Days</span>
          </div>
          <div style={S.stat}>
            <span style={{ color:'var(--text-muted)' }}>Payout Frequency</span>
            <span style={{ color:'var(--text)', fontWeight:700 }}>Monthly</span>
          </div>

          {isAffiliate ? (
            <div style={{ marginTop: 24 }}>
              <p style={{ fontSize:12, color:'var(--text-sub)', marginBottom:8 }}>Your Unique Referral Link:</p>
              <div style={{ display:'flex', gap:8 }}>
                <input 
                  readOnly
                  value={referralLink}
                  style={{ flex:1, padding:14, background:'var(--bg-3)', border:'1px solid var(--gold)', borderRadius:'var(--radius)', color:'var(--gold)', fontSize:12, fontWeight:600 }}
                />
                <button 
                  onClick={() => handleCopy(referralLink)} 
                  style={{ padding:'0 16px', background: copied ? 'var(--green, #22c55e)' : 'var(--gold)', border:'none', borderRadius:'var(--radius)', fontWeight:700, cursor:'pointer', fontSize:12, transition:'background 0.2s', whiteSpace:'nowrap' }}
                >
                  {copied ? 'Copied ✓' : 'COPY'}
                </button>
              </div>
              <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:12 }}>Share this link to earn 30% on every Gold upgrade.</p>
            </div>
          ) : !applied ? (
            <form onSubmit={handleApply} style={{ marginTop: 24 }}>
              <p style={{ fontSize:12, color:'var(--text-sub)', marginBottom:8 }}>Enter your email to apply for the partner portal:</p>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ width:'100%', padding:14, background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:'var(--radius)', color:'#fff', outline:'none', boxSizing:'border-box' }}
              />
              <button type="submit" style={S.btn}>APPLY FOR PARTNER ACCESS</button>
              <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:8, textAlign:'center' }}>
                Your application will be sent to our team at {OWNER_EMAIL}
              </p>
            </form>
          ) : (
            <div style={{ marginTop:32, textAlign:'center', padding:20, background:'var(--green-dim)', borderRadius:'var(--radius)', border:'1px solid var(--green)' }}>
              <p style={{ color:'var(--green)', fontWeight:700 }}>APPLICATION RECEIVED</p>
              <p style={{ fontSize:12, color:'var(--text-sub)', marginTop:4 }}>We'll review your profile and contact you within 24 hours.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
