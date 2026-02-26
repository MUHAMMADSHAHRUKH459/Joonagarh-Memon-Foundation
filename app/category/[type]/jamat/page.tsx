'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';

export default function JamatPage() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('marital_status', 'Married')
        .order('created_at', { ascending: false });

      if (!error) setMembers(data || []);
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const filtered = members.filter((m) =>
    searchQuery
      ? m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <main>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

        <button onClick={() => router.back()} style={{
          backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
          fontSize: '0.95rem', marginBottom: '1.5rem', fontWeight: '600',
        }}>← Back</button>

        {/* Header */}
        <div style={{
          backgroundColor: '#4a148c', borderRadius: 'var(--radius)',
          padding: '1.5rem', marginBottom: '1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ color: 'white', fontSize: '1.4rem' }}>👨‍👩‍👧‍👦 Jamat Members</h2>
            <p style={{ color: '#ce93d8', fontSize: '0.85rem' }}>Married members of Memon Welfare</p>
          </div>
          <div style={{
            backgroundColor: '#6a1b9a', color: 'white',
            padding: '0.5rem 1.5rem', borderRadius: 'var(--radius)',
            fontSize: '1.5rem', fontWeight: '700',
          }}>
            {members.length}
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 16px',
              border: '1.5px solid var(--green-border)',
              borderRadius: 'var(--radius)', fontSize: '0.95rem',
              outline: 'none', boxSizing: 'border-box' as const,
            }}
          />
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-text)' }}>
            Loading...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{
            backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
            padding: '3rem', textAlign: 'center', color: 'var(--gray-text)', boxShadow: 'var(--shadow)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍👩‍👧‍👦</div>
            <h3>No Jamat Members Found</h3>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{
            backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)', overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3e5f5' }}>
                    {['#', 'Member ID', 'Name', 'Father Name', 'Cast', 'Wife Name', 'Children', 'Phone', 'Action'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontSize: '0.82rem', color: '#4a148c', fontWeight: '700',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member, index) => (
                    <tr key={member.id}
                      style={{
                        borderBottom: '1px solid #f3e5f5',
                        backgroundColor: index % 2 === 0 ? 'var(--white)' : '#fdf6ff',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f3e5f5')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--white)' : '#fdf6ff')}
                    >
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--gray-text)' }}>{index + 1}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: '600', color: '#6a1b9a' }}>{member.id}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: '500' }}>{member.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{member.father_name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{member.member_cast}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{member.wife_name || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                        <span style={{
                          backgroundColor: '#f3e5f5', color: '#6a1b9a',
                          padding: '3px 10px', borderRadius: '20px',
                          fontSize: '0.78rem', fontWeight: '600',
                        }}>
                          {member.children?.length || 0} children
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{member.phone}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => router.push(`/members/${encodeURIComponent(member.id)}`)}
                          style={{
                            backgroundColor: '#6a1b9a', color: 'white', border: 'none',
                            padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                            fontSize: '0.82rem', fontWeight: '600',
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