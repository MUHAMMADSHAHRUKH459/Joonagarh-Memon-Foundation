'use client';

import { useRouter } from 'next/navigation';

interface Member {
  id: string;
  name: string;
  age: number;
  cnic: string;
  phone: string;
  area: string;
  occupation: string;
  bloodGroup: string;
}

interface SeniorCitizenTableProps {
  members: Member[];
}

const SeniorCitizenTable = ({ members }: SeniorCitizenTableProps) => {
  const router = useRouter();

  return (
    <div style={{
      backgroundColor: 'var(--white)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow)',
      marginBottom: '2rem',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--green-border)',
        backgroundColor: '#1a5c38',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{ fontSize: '1.1rem', color: 'white' }}>🏅 Senior Citizens (Age 60+) — {members.length} Members</h3>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#e8f5ee' }}>
              {['Member ID', 'Name', 'Age', 'CNIC', 'Phone', 'Area', 'Blood Group', 'Occupation', 'Action'].map((h) => (
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
            {members.map((member, index) => (
              <tr key={member.id} style={{
                borderBottom: '1px solid var(--green-pale)',
                backgroundColor: index % 2 === 0 ? 'var(--white)' : '#f9fdfb',
              }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--green-pale)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--white)' : '#f9fdfb')}
              >
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--green-main)' }}>{member.id}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: '500' }}>{member.name}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>
                  <span style={{
                    backgroundColor: '#fff3e0',
                    color: '#e65100',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                  }}>{member.age} yrs</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--gray-text)' }}>{member.cnic}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{member.phone}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{member.area || '-'}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                  <span style={{
                    backgroundColor: '#fce4e4',
                    color: '#c62828',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                  }}>{member.bloodGroup || '-'}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{member.occupation || '-'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    onClick={() => router.push(`/members/${member.id}`)}
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
  );
};

export default SeniorCitizenTable;