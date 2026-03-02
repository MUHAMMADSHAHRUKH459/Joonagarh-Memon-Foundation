'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';

export default function FuneralPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [funeralDetails, setFuneralDetails] = useState({
    janazaTime: '',
    janazaPlace: '',
    burialPlace: '',
    somDate: '',
    somPlace: '',
    extraNote: '',
    includeSom: false,
  });

  const searchMember = async () => {
    if (!searchQuery) return;
    setLoading(true);
    setSearchResults([]);
    setMember(null);

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .or(`id.eq.${searchQuery.toUpperCase()},name.ilike.%${searchQuery}%`);

    if (error || !data || data.length === 0) {
      alert('Koi member nahi mila. Dobara check karein.');
    } else if (data.length === 1) {
      setMember(data[0]);
    } else {
      setSearchResults(data);
    }
    setLoading(false);
  };

  const generateMessage = () => {
    const msg =
`🕊️ *Inna Lillahi Wa Inna Ilayhi Raji'un* 🕊️

*Naliya Mandwi Junagadh Muslim Welfare Jamat*

━━━━━━━━━━━━━━━━━━━━

Bahut afsos ke saath yeh itlaa di jati hai ke hamare aziz:

👤 *Naam:* ${member?.name || '___________'}
👨 *Walid ka Naam:* ${member?.father_name || '___________'}
🏷️ *Cast:* ${member?.member_cast || '___________'}

ka inteqal ho gaya hai. Inna Lillahi Wa Inna Ilayhi Raji'un.

🕌 *Namaz-e-Janaza:*
📍 Jagah: ${funeralDetails.janazaPlace || '___________'}
⏰ Waqt: ${funeralDetails.janazaTime || '___________'}

⚰️ *Dafan:* ${funeralDetails.burialPlace || '___________'}

${funeralDetails.includeSom ? `\n📿 *Soyem (3rd Day):*\n📍 Jagah: ${funeralDetails.somPlace || '___________'}\n📅 Tarikh: ${funeralDetails.somDate || '___________'}\nTamam ahbaab se guzarish hai ke soyem mein zaroor tashreef layein.\n` : ''}
${funeralDetails.extraNote ? `📝 *Note:* ${funeralDetails.extraNote}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
🤲 Allah Taala marhoom ko Jannat ul Firdaus mein jagah ata farmaye. Ameen.

Tamam ahbaab se guzarish hai ke apni duaon mein yaad rakhein.

_Naliya Mandwi Junagadh Muslim Welfare Jamat_
`;
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
    boxSizing: 'border-box' as const,
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
          <h2 style={{ color: 'white', fontSize: '1.4rem' }}>🕊️ Intiqal / Janaza Notification</h2>
          <p style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '4px' }}>
            Janaza ka ilan WhatsApp ke zariye share karein
          </p>
        </div>

        {/* Search Member */}
        <div style={{
          backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
          padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)',
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--green-dark)' }}>
            Step 1: Member Talash Karein
          </h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Naam ya Member ID likhein (e.g. Ahmed / MEM-001)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchMember()}
            />
            <button onClick={searchMember} style={{
              backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
              padding: '10px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
              fontWeight: '600', whiteSpace: 'nowrap',
            }}>
              {loading ? 'Talash...' : 'Talash Karein'}
            </button>
          </div>

          {/* Multiple Results */}
          {searchResults.length > 1 && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--green-dark)', marginBottom: '0.5rem' }}>
                {searchResults.length} member mile - kisi ek ko select karein:
              </p>
              {searchResults.map((m) => (
                <div
                  key={m.id}
                  onClick={() => { setMember(m); setSearchResults([]); }}
                  style={{
                    padding: '0.75rem 1rem', marginBottom: '0.5rem',
                    backgroundColor: 'var(--green-pale)', borderRadius: '8px',
                    border: '1px solid var(--green-border)', cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#c8e6c9')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--green-pale)')}
                >
                  <strong>{m.name}</strong> | Walid: {m.father_name} | ID: {m.id} | Cast: {m.member_cast}
                </div>
              ))}
            </div>
          )}

          {/* Member Found */}
          {member && (
            <div style={{
              marginTop: '1rem', backgroundColor: 'var(--green-pale)',
              borderRadius: '8px', padding: '1rem',
              border: '1px solid var(--green-border)',
            }}>
              <p style={{ fontWeight: '600', color: 'var(--green-dark)' }}>✅ Member Mil Gaya:</p>
              <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                <strong>{member.name}</strong> | Walid: {member.father_name} | Cast: {member.member_cast} | ID: {member.id}
              </p>
              <button
                onClick={() => { setMember(null); setSearchQuery(''); }}
                style={{
                  marginTop: '0.5rem', backgroundColor: 'transparent',
                  border: '1px solid #c62828', color: '#c62828',
                  padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
                }}
              >
                ✕ Change Member
              </button>
            </div>
          )}
        </div>

        {/* Funeral Details */}
        <div style={{
          backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
          padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)',
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--green-dark)' }}>
            Step 2: Janaza ki Tafsilat
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Namaz-e-Janaza ka Waqt</label>
              <input
                style={inputStyle}
                placeholder="e.g. Asr ke baad 5:00 PM"
                value={funeralDetails.janazaTime}
                onChange={(e) => setFuneralDetails({ ...funeralDetails, janazaTime: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Namaz-e-Janaza ki Jagah</label>
              <input
                style={inputStyle}
                placeholder="e.g. Masjid Al-Noor, Kharadar"
                value={funeralDetails.janazaPlace}
                onChange={(e) => setFuneralDetails({ ...funeralDetails, janazaPlace: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Dafan ki Jagah</label>
              <input
                style={inputStyle}
                placeholder="e.g. Mewa Shah Qabrastan"
                value={funeralDetails.burialPlace}
                onChange={(e) => setFuneralDetails({ ...funeralDetails, burialPlace: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Koi Aur Baat (Optional)</label>
              <input
                style={inputStyle}
                placeholder="Koi zaruri maloomat"
                value={funeralDetails.extraNote}
                onChange={(e) => setFuneralDetails({ ...funeralDetails, extraNote: e.target.value })}
              />
            </div>
          </div>

          {/* Som Option */}
          <div style={{
            marginTop: '1.5rem', padding: '1rem',
            backgroundColor: '#f3e5f5', borderRadius: '8px',
            border: '1px solid #ce93d8',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={funeralDetails.includeSom}
                onChange={(e) => setFuneralDetails({ ...funeralDetails, includeSom: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: '600', color: '#6a1b9a', fontSize: '0.95rem' }}>
                Add Soyem Details
              </span>
            </label>

            {funeralDetails.includeSom && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ ...labelStyle, color: '#6a1b9a' }}>Soyem ki Tarikh</label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={funeralDetails.somDate}
                    onChange={(e) => setFuneralDetails({ ...funeralDetails, somDate: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, color: '#6a1b9a' }}>Soyem ki Jagah</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. Marhoom ka ghar"
                    value={funeralDetails.somPlace}
                    onChange={(e) => setFuneralDetails({ ...funeralDetails, somPlace: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message Preview */}
        <div style={{
          backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
          padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)',
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--green-dark)' }}>
            Step 3: Message Preview
          </h3>
          <div style={{
            backgroundColor: '#e8f5e9', borderRadius: '12px',
            padding: '1.5rem', fontFamily: 'monospace',
            fontSize: '0.85rem', whiteSpace: 'pre-wrap',
            color: '#1a1a1a', border: '1px solid #c8e6c9', lineHeight: 1.8,
          }}>
            {generateMessage()}
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={shareWhatsApp}
          style={{
            width: '100%', backgroundColor: '#25d366',
            color: 'white', border: 'none', padding: '14px',
            borderRadius: 'var(--radius)', cursor: 'pointer',
            fontSize: '1.1rem', fontWeight: '700',
          }}
        >
          📱 WhatsApp Par Share Karein
        </button>

      </div>
    </main>
  );
}