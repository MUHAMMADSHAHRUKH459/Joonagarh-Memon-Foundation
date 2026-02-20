'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';

export default function FuneralPage() {
  const router = useRouter();
  const [searchId, setSearchId] = useState('');
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [funeralDetails, setFuneralDetails] = useState({
    janazaTime: '',
    janazaPlace: '',
    burialPlace: '',
    extraNote: '',
  });

  const searchMember = async () => {
    if (!searchId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', searchId.toUpperCase())
      .single();

    if (error || !data) {
      alert('Member not found. Please check the Member ID.');
    } else {
      setMember(data);
    }
    setLoading(false);
  };

  const generateMessage = () => {
    const msg =
`🕊️ *Inna Lillahi Wa Inna Ilayhi Raji'un* 🕊️

*Memon Welfare - Karachi Chapter*
━━━━━━━━━━━━━━━━━━━━

It is with deep sorrow that we announce the passing of:

👤 *Name:* ${member?.name || '___________'}
👨 *Father's Name:* ${member?.father_name || '___________'}
🏷️ *Cast:* ${member?.member_cast || '___________'}

🕌 *Namaz-e-Janaza:*
📍 Place: ${funeralDetails.janazaPlace || '___________'}
⏰ Time: ${funeralDetails.janazaTime || '___________'}

⚰️ *Burial:* ${funeralDetails.burialPlace || '___________'}

${funeralDetails.extraNote ? `📝 *Note:* ${funeralDetails.extraNote}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
🤲 May Allah grant them Jannatul Firdaus. Ameen.

_Memon Welfare - Karachi Chapter_`;
    return msg;
  };

  const shareWhatsApp = () => {
    const msg = generateMessage();
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid var(--green-border)',
    borderRadius: 'var(--radius)',
    fontSize: '0.95rem',
    outline: 'none',
    backgroundColor: 'var(--white)',
    color: 'var(--text-dark)',
  };

  const labelStyle = {
    fontSize: '0.85rem',
    fontWeight: '600' as const,
    color: 'var(--green-dark)',
    marginBottom: '4px',
    display: 'block',
  };

  return (
    <main>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>

        <button onClick={() => router.back()} style={{
          backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
          fontSize: '0.95rem', marginBottom: '1.5rem', fontWeight: '600',
        }}>← Back</button>

        {/* Header */}
        <div style={{
          backgroundColor: '#1a1a1a', borderRadius: 'var(--radius)',
          padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center',
        }}>
          <h2 style={{ color: 'white', fontSize: '1.4rem' }}>🕊️ Death / Funeral Notification</h2>
          <p style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '4px' }}>
            Generate and share funeral announcement via WhatsApp
          </p>
        </div>

        {/* Search Member */}
        <div style={{
          backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
          padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)',
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--green-dark)' }}>Step 1: Search Member</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Enter Member ID (e.g. MEM-001)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchMember()}
            />
            <button onClick={searchMember} style={{
              backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
              padding: '10px 20px', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: '600',
            }}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Member Found */}
          {member && (
            <div style={{
              marginTop: '1rem', backgroundColor: 'var(--green-pale)',
              borderRadius: '8px', padding: '1rem',
              border: '1px solid var(--green-border)',
            }}>
              <p style={{ fontWeight: '600', color: 'var(--green-dark)' }}>✅ Member Found:</p>
              <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                <strong>{member.name}</strong> | Father: {member.father_name} | Cast: {member.member_cast} | ID: {member.id}
              </p>
            </div>
          )}
        </div>

        {/* Funeral Details */}
        <div style={{
          backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
          padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)',
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--green-dark)' }}>Step 2: Funeral Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Namaz-e-Janaza Time</label>
              <input
                style={inputStyle}
                placeholder="e.g. 2:00 PM"
                value={funeralDetails.janazaTime}
                onChange={(e) => setFuneralDetails({ ...funeralDetails, janazaTime: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Namaz-e-Janaza Place</label>
              <input
                style={inputStyle}
                placeholder="e.g. Masjid Al-Noor, Kharadar"
                value={funeralDetails.janazaPlace}
                onChange={(e) => setFuneralDetails({ ...funeralDetails, janazaPlace: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Burial Place</label>
              <input
                style={inputStyle}
                placeholder="e.g. Mewa Shah Qabrastan"
                value={funeralDetails.burialPlace}
                onChange={(e) => setFuneralDetails({ ...funeralDetails, burialPlace: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Additional Note (Optional)</label>
              <input
                style={inputStyle}
                placeholder="Any additional info"
                value={funeralDetails.extraNote}
                onChange={(e) => setFuneralDetails({ ...funeralDetails, extraNote: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Message Preview */}
        <div style={{
          backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
          padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)',
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--green-dark)' }}>Step 3: Message Preview</h3>
          <div style={{
            backgroundColor: '#e8f5e9',
            borderRadius: '12px',
            padding: '1.5rem',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            whiteSpace: 'pre-wrap',
            color: '#1a1a1a',
            border: '1px solid #c8e6c9',
            lineHeight: 1.8,
          }}>
            {generateMessage()}
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={shareWhatsApp}
          style={{
            width: '100%',
            backgroundColor: '#25d366',
            color: 'white',
            border: 'none',
            padding: '14px',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: '700',
          }}
        >
          📱 Share on WhatsApp
        </button>

      </div>
    </main>
  );
}