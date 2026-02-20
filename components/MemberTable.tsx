'use client';

import { useRouter } from 'next/navigation';

interface Member {
  id: string;
  name: string;
  age: number;
  cnic: string;
  b_form: string;
  phone: string;
  member_cast: string;
  father_name: string;
  marital_status: string;
  voting_eligible: boolean;
  occupation: string;
  category: string;
  entry_date: string;
}

interface MemberTableProps {
  members: Member[];
}

const MemberTable = ({ members }: MemberTableProps) => {
  const router = useRouter();

  if (members.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius)',
        padding: '3rem',
        textAlign: 'center',
        color: 'var(--gray-text)',
        boxShadow: 'var(--shadow)',
        marginBottom: '2rem',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
        <h3>No Members Found</h3>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Click "Add Member" button above to add a new member</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--white)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow)',
      marginBottom: '2rem',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--green-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{ fontSize: '1.1rem' }}>👥 All Members ({members.length})</h3>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--green-pale)' }}>
              {['Member ID', 'Name', 'Father Name', 'Cast', 'Age', 'CNIC/B-Form', 'Phone', 'Category', 'Voting', 'Entry Date', 'Action'].map((h) => (
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
              <tr key={member.id}
                style={{
                  borderBottom: '1px solid var(--green-pale)',
                  backgroundColor: index % 2 === 0 ? 'var(--white)' : '#f9fdfb',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--green-pale)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--white)' : '#f9fdfb')}
              >
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--green-main)' }}>{member.id}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: '500' }}>{member.name}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{member.father_name}</td>                <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{member.member_cast}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{member.age}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--gray-text)' }}>{member.cnic || member.bForm}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{member.phone}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    backgroundColor: member.category === 'under18' ? '#e3f2fd' : member.category === 'senior' ? '#fff3e0' : '#e8f5ee',
                    color: member.category === 'under18' ? '#1565c0' : member.category === 'senior' ? '#e65100' : 'var(--green-dark)',
                  }}>
                    {member.category === 'under18' ? '👦 Under 18' : member.category === 'senior' ? '👴 Senior' : '🧑 Adult'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    backgroundColor: member.votingEligible ? '#e8f5ee' : '#fce4e4',
                    color: member.votingEligible ? 'var(--green-dark)' : '#c62828',
                  }}>
                    {member.votingEligible ? '✅ Eligible' : '❌ Not Eligible'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--gray-text)' }}>{member.entryDate}</td>
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

export default MemberTable;