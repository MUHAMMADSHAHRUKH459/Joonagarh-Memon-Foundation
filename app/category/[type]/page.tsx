'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';

export default function CategoryPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryInfo = {
    under18: { title: 'Under 18 Members', emoji: '👦', color: '#1565c0', bg: '#e3f2fd' },
    adult: { title: 'Adult Members (18+)', emoji: '🧑', color: 'var(--green-dark)', bg: 'var(--green-pale)' },
    senior: { title: 'Senior Citizens (60+)', emoji: '👴', color: '#e65100', bg: '#fff3e0' },
    jamat: { title: 'Jamat Members', emoji: '👨‍👩‍👧‍👦', color: '#6a1b9a', bg: '#f3e5f5' },
  };

  const info = categoryInfo[type as keyof typeof categoryInfo];

  useEffect(() => {
    const fetchMembers = async () => {
      const query = type === 'jamat'
        ? supabase.from('members').select('*').eq('marital_status', 'Married').order('created_at', { ascending: false })
        : supabase.from('members').select('*').eq('category', type).order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching members:', error);
      } else {
        setMembers(data || []);
      }
      setLoading(false);
    };

    fetchMembers();
  }, [type]);

  return (
    <main>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto' }}>

        <button
          onClick={() => router.back()}
          style={{
            backgroundColor: 'var(--green-main)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontSize: '0.95rem',
            marginBottom: '1.5rem',
            fontWeight: '600',
          }}
        >
          ← Back
        </button>

        <div style={{
          backgroundColor: info?.bg,
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>{info?.emoji}</span>
            <div>
              <h2 style={{ color: info?.color, fontSize: '1.5rem' }}>{info?.title}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>
                {type === 'under18' ? 'Not eligible to vote' : 'Eligible to vote'}
              </p>
            </div>
          </div>
          <div style={{
            backgroundColor: info?.color,
            color: 'white',
            padding: '0.5rem 1.5rem',
            borderRadius: 'var(--radius)',
            fontSize: '1.5rem',
            fontWeight: '700',
          }}>
            {members.length}
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-text)' }}>
            Loading members...
          </div>
        )}

        {!loading && members.length === 0 && (
          <div style={{
            backgroundColor: 'var(--white)',
            borderRadius: 'var(--radius)',
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--gray-text)',
            boxShadow: 'var(--shadow)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{info?.emoji}</div>
            <h3>No members found in this category</h3>
          </div>
        )}

        {!loading && members.length > 0 && (
          <div style={{
            backgroundColor: 'var(--white)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)',
            overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: info?.bg }}>
                    {['#', 'Member ID', 'Name', 'Father Name', 'Age', 'CNIC/B-Form', 'Phone', 'Marital Status', 'Entry Date', 'Action'].map((h) => (
                      <th key={h} style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '0.85rem',
                        color: info?.color,
                        fontWeight: '700',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, index) => (
                    <tr key={member.id}
                      style={{
                        borderBottom: '1px solid var(--green-pale)',
                        backgroundColor: index % 2 === 0 ? 'var(--white)' : '#f9fdfb',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--green-pale)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--white)' : '#f9fdfb')}
                    >
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--gray-text)' }}>{index + 1}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--green-main)' }}>{member.id}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: '500' }}>{member.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{member.father_name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{member.age}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--gray-text)' }}>{member.cnic || member.b_form || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{member.phone}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {type !== 'under18' && (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            backgroundColor: member.marital_status === 'Married' ? '#e8f5ee' : '#fff3e0',
                            color: member.marital_status === 'Married' ? 'var(--green-dark)' : '#e65100',
                          }}>
                            {member.marital_status}
                          </span>
                        )}
                        {type === 'under18' && <span style={{ color: 'var(--gray-text)', fontSize: '0.85rem' }}>-</span>}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--gray-text)' }}>{member.entry_date}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => router.push(`/members/${encodeURIComponent(member.id)}`)}
                          style={{
                            backgroundColor: 'var(--green-main)',
                            color: 'white',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: '600',
                          }}
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}