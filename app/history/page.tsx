'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';

export default function HistoryPage() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, father_name, member_cast, category, entry_date, created_at')
        .order('created_at', { ascending: false });

      if (!error) setMembers(data || []);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  // Group by date
  const groupedByDate: { [key: string]: any[] } = {};
  members.forEach((m) => {
    const date = new Date(m.created_at).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
    if (!groupedByDate[date]) groupedByDate[date] = [];
    groupedByDate[date].push(m);
  });

  const getCategoryBadge = (category: string) => {
    if (category === 'under18') return { label: '👦 Under 18', bg: '#e3f2fd', color: '#1565c0' };
    if (category === 'senior') return { label: '👴 Senior', bg: '#fff3e0', color: '#e65100' };
    return { label: '🧑 Adult', bg: '#e8f5ee', color: 'var(--green-dark)' };
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
          backgroundColor: 'var(--green-dark)', borderRadius: 'var(--radius)',
          padding: '1.5rem', marginBottom: '1.5rem', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ color: 'white', fontSize: '1.4rem' }}>📋 Member History</h2>
            <p style={{ color: 'var(--green-border)', fontSize: '0.85rem' }}>
              Complete record of all members added to the system
            </p>
          </div>
          <div style={{
            backgroundColor: 'var(--green-light)', color: 'white',
            padding: '0.5rem 1.5rem', borderRadius: 'var(--radius)',
            fontSize: '1.5rem', fontWeight: '700',
          }}>
            {members.length}
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-text)' }}>
            Loading history...
          </div>
        )}

        {!loading && members.length === 0 && (
          <div style={{
            backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
            padding: '3rem', textAlign: 'center', color: 'var(--gray-text)', boxShadow: 'var(--shadow)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3>No history yet</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Members will appear here as they are added</p>
          </div>
        )}

        {/* Grouped by Date */}
        {!loading && Object.entries(groupedByDate).map(([date, dayMembers]) => (
          <div key={date} style={{ marginBottom: '2rem' }}>

            {/* Date Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem',
            }}>
              <div style={{
                backgroundColor: 'var(--green-main)', color: 'white',
                padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600',
              }}>
                📅 {date}
              </div>
              <div style={{
                backgroundColor: 'var(--green-pale)', color: 'var(--green-dark)',
                padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600',
              }}>
                {dayMembers.length} member{dayMembers.length > 1 ? 's' : ''} added
              </div>
            </div>

            {/* Members */}
            <div style={{
              backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow)', overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--green-pale)' }}>
                    {['Member ID', 'Name', 'Father Name', 'Cast', 'Category', 'Added At'].map((h) => (
                      <th key={h} style={{
                        padding: '10px 16px', textAlign: 'left', fontSize: '0.82rem',
                        color: 'var(--green-dark)', fontWeight: '700', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dayMembers.map((member, index) => {
                    const badge = getCategoryBadge(member.category);
                    return (
                      <tr key={member.id} style={{
                        borderBottom: '1px solid var(--green-pale)',
                        backgroundColor: index % 2 === 0 ? 'var(--white)' : '#f9fdfb',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--green-pale)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--white)' : '#f9fdfb')}
                      >
                        <td style={{ padding: '10px 16px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--green-main)' }}>{member.id}</td>
                        <td style={{ padding: '10px 16px', fontSize: '0.9rem', fontWeight: '500' }}>{member.name}</td>
                        <td style={{ padding: '10px 16px', fontSize: '0.85rem' }}>{member.father_name}</td>
                        <td style={{ padding: '10px 16px', fontSize: '0.85rem' }}>{member.member_cast}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: '20px',
                            fontSize: '0.78rem', fontWeight: '600',
                            backgroundColor: badge.bg, color: badge.color,
                          }}>{badge.label}</span>
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '0.82rem', color: 'var(--gray-text)' }}>
                          {new Date(member.created_at).toLocaleTimeString('en-GB', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      </div>
    </main>
  );
}