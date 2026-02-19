'use client';

import { useRouter } from 'next/navigation';

// Temporary - baad mein Supabase se data aayega
const getMemberById = (id: string) => {
  return null;
};

export default function MemberProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--gray-light)',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

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
          ← Back to Members
        </button>

        {/* Profile Card */}
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            backgroundColor: 'var(--green-dark)',
            padding: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'var(--green-light)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
            }}>👤</div>
            <div>
              <h2 style={{ color: 'white', fontSize: '1.6rem' }}>Member Profile</h2>
              <p style={{ color: 'var(--green-border)', fontSize: '0.9rem' }}>ID: {params.id}</p>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '2rem' }}>
            <div style={{
              backgroundColor: 'var(--green-pale)',
              borderRadius: 'var(--radius)',
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--gray-text)',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
              <h3>Member data loading...</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Supabase integration ke baad yahan member ka poora data dikhega.
              </p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--green-main)', fontWeight: '600' }}>
                Member ID: {params.id}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}