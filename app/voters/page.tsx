'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';
import { calculateAge, getCategory, isVotingEligible } from '@/utils/helpers';

export default function VotersPage() {
  const router = useRouter();
  const [voters, setVoters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoters = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('voting_eligible', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching voters:', error);
      } else {
        setVoters(data || []);
      }
      setLoading(false);
    };

    fetchVoters();
  }, []);

  return (
    <main>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto' }}>

        {/* Back Button */}
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

        {/* Header */}
        <div style={{
          backgroundColor: 'var(--green-pale)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>🗳️</span>
            <div>
              <h2 style={{ color: 'var(--green-dark)', fontSize: '1.5rem' }}>Voter List</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>All members eligible to vote (18+)</p>
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--green-main)',
            color: 'white',
            padding: '0.5rem 1.5rem',
            borderRadius: 'var(--radius)',
            fontSize: '1.5rem',
            fontWeight: '700',
          }}>
            {voters.length}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-text)' }}>
            Loading voters...
          </div>
        )}

        {/* Voters Table */}
        {!loading && voters.length === 0 && (
          <div style={{
            backgroundColor: 'var(--white)',
            borderRadius: 'var(--radius)',
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--gray-text)',
            boxShadow: 'var(--shadow)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗳️</div>
            <h3>No eligible voters found</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Members aged 18+ will appear here</p>
          </div>
        )}

        {!loading && voters.length > 0 && (
          <div style={{
            backgroundColor: 'var(--white)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)',
            overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--green-pale)' }}>
                    {['#', 'Member ID', 'Name', 'Father Name', 'Age', 'CNIC', 'Phone', 'Category', 'Action'].map((h) => (
                      <th key={h} style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '0.85rem',
                        color: 'var(--green-dark)',
                        fontWeight: '700',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {voters.map((voter, index) => (
                    <tr key={voter.id}
                      style={{
                        borderBottom: '1px solid var(--green-pale)',
                        backgroundColor: index % 2 === 0 ? 'var(--white)' : '#f9fdfb',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--green-pale)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--white)' : '#f9fdfb')}
                    >
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--gray-text)' }}>{index + 1}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--green-main)' }}>{voter.id}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: '500' }}>{voter.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{voter.father_name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{voter.age}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--gray-text)' }}>{voter.cnic || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{voter.phone}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          backgroundColor: voter.category === 'senior' ? '#fff3e0' : '#e8f5ee',
                          color: voter.category === 'senior' ? '#e65100' : 'var(--green-dark)',
                        }}>
                          {voter.category === 'senior' ? '👴 Senior' : '🧑 Adult'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => router.push(`/members/${voter.id}`)}
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