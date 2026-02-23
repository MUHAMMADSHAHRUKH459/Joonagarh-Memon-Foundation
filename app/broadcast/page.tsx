'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';

export default function BroadcastPage() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase.from('members').select('id, name, phone, category');
      setMembers(data || []);
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(m => {
    if (filter === 'all') return true;
    return m.category === filter;
  }).filter(m => m.phone);

  const sendToAll = async () => {
    if (!message.trim()) {
      alert('Please write a message first!');
      return;
    }
    if (filteredMembers.length === 0) {
      alert('No members found!');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send this message to ${filteredMembers.length} members?`
    );
    if (!confirmed) return;

    setSending(true);
    setSentCount(0);

    for (let i = 0; i < filteredMembers.length; i++) {
      const member = filteredMembers[i];
      const phone = member.phone?.replace(/[^0-9]/g, '');
      const personalMsg = `Assalam o Alaikum ${member.name}!\n\n${message}\n\n_Naliya Mandwi Junagadh Muslim Welfare Jamat - Karachi Chapter_`;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(personalMsg)}`;
      window.open(url, '_blank');
      setSentCount(i + 1);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setSending(false);
    alert(`Message sent to ${filteredMembers.length} members!`);
  };

  const previewMessage = (member: any) => {
    return `Assalam o Alaikum ${member.name}!\n\n${message}\n\n_Naliya Mandwi Junagadh Muslim Welfare Jamat - Karachi Chapter_`;
  };

  return (
    <main>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>

        <button onClick={() => router.back()} style={{
          backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
          fontSize: '0.95rem', marginBottom: '1.5rem', fontWeight: '600',
        }}>← Back</button>

        {/* Header */}
        <div style={{
          backgroundColor: '#075e54', borderRadius: 'var(--radius)',
          padding: '1.5rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '1rem',
        }}>
          <span style={{ fontSize: '2.5rem' }}>📢</span>
          <div>
            <h2 style={{ color: 'white', fontSize: '1.4rem' }}>Bulk WhatsApp Broadcast</h2>
            <p style={{ color: '#a8d5b5', fontSize: '0.85rem' }}>
              Send a message to all or selected members
            </p>
          </div>
        </div>

        {/* Filter */}
        <div style={{
          backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
          padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)',
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--green-dark)' }}>
            Step 1: Select Recipients
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { value: 'all', label: '👥 All Members', count: members.filter(m => m.phone).length },
              { value: 'adult', label: '🧑 Adults Only', count: members.filter(m => m.category === 'adult' && m.phone).length },
              { value: 'senior', label: '👴 Seniors Only', count: members.filter(m => m.category === 'senior' && m.phone).length },
              { value: 'under18', label: '👦 Under 18 Only', count: members.filter(m => m.category === 'under18' && m.phone).length },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
                  fontSize: '0.88rem', fontWeight: '600', border: '2px solid',
                  borderColor: filter === f.value ? 'var(--green-main)' : 'var(--green-border)',
                  backgroundColor: filter === f.value ? 'var(--green-main)' : 'var(--white)',
                  color: filter === f.value ? 'white' : 'var(--text-dark)',
                }}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)', marginTop: '0.75rem' }}>
            ✅ <strong>{filteredMembers.length}</strong> members selected with phone numbers
          </p>
        </div>

        {/* Message */}
        <div style={{
          backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
          padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)',
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--green-dark)' }}>
            Step 2: Write Message
          </h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your announcement here..."
            rows={5}
            style={{
              width: '100%', padding: '12px 14px',
              border: '1.5px solid var(--green-border)',
              borderRadius: 'var(--radius)', fontSize: '0.95rem',
              outline: 'none', resize: 'vertical',
              fontFamily: 'Tajawal, sans-serif',
              boxSizing: 'border-box' as const,
            }}
          />
          <p style={{ fontSize: '0.82rem', color: 'var(--gray-text)', marginTop: '0.5rem' }}>
            Note: Member name will be added automatically at the start of each message.
          </p>

          {/* Quick Templates */}
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--green-dark)', marginBottom: '0.5rem' }}>
              Quick Templates:
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { label: '📅 Meeting', text: 'Naliya Mandwi Junagadh Muslim Welfare Jamat ki ek ahem meeting aaj shaam 6 baje hogi. Meherbani farma kar zaroor tashreef layein.' },
                { label: '🎉 Event', text: 'Naliya Mandwi Junagadh Muslim Welfare Jamat Karachi Chapter ki taraf se aap sab ko khushabdee di jaati hai. Hamare aaane wale event mein zaroor shamil hon.' },
                { label: '💰 Fees Reminder', text: 'Guzarish hai ke apni maahana fees ada farmayein. Aapka taawun hamare liye qeemti hai.' },
              ].map((t) => (
                <button
                  key={t.label}
                  onClick={() => setMessage(t.text)}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                    fontSize: '0.82rem', fontWeight: '600',
                    border: '1.5px solid var(--green-border)',
                    backgroundColor: 'var(--green-pale)',
                    color: 'var(--green-dark)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        {message && filteredMembers.length > 0 && (
          <div style={{
            backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
            padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)',
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--green-dark)' }}>
              Step 3: Preview Message
            </h3>
            <div style={{
              backgroundColor: '#e8f5e9', borderRadius: '12px',
              padding: '1rem 1.5rem', fontFamily: 'monospace',
              fontSize: '0.88rem', whiteSpace: 'pre-wrap',
              color: '#1a1a1a', border: '1px solid #c8e6c9', lineHeight: 1.8,
            }}>
              {previewMessage(filteredMembers[0])}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-text)', marginTop: '0.5rem' }}>
              Preview for first member: {filteredMembers[0]?.name}
            </p>
          </div>
        )}

        {/* Send Progress */}
        {sending && (
          <div style={{
            backgroundColor: '#e8f5e9', borderRadius: 'var(--radius)',
            padding: '1rem 1.5rem', marginBottom: '1.5rem',
            border: '1px solid var(--green-border)',
          }}>
            <p style={{ fontWeight: '600', color: 'var(--green-dark)' }}>
              Sending... {sentCount}/{filteredMembers.length} messages sent
            </p>
            <div style={{ backgroundColor: '#e0e0e0', borderRadius: '10px', height: '10px', marginTop: '0.5rem', overflow: 'hidden' }}>
              <div style={{
                width: `${(sentCount / filteredMembers.length) * 100}%`,
                height: '100%', backgroundColor: 'var(--green-main)',
                borderRadius: '10px', transition: 'width 0.3s',
              }} />
            </div>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={sendToAll}
          disabled={sending || !message.trim() || filteredMembers.length === 0}
          style={{
            width: '100%', backgroundColor: sending ? '#ccc' : '#25d366',
            color: 'white', border: 'none', padding: '14px',
            borderRadius: 'var(--radius)', cursor: sending ? 'not-allowed' : 'pointer',
            fontSize: '1.1rem', fontWeight: '700',
          }}
        >
          {sending
            ? `⏳ Sending ${sentCount}/${filteredMembers.length}...`
            : `📱 Send to ${filteredMembers.length} Members`}
        </button>

      </div>
    </main>
  );
}