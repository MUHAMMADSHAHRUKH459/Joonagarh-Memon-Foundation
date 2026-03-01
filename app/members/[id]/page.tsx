'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', decodeURIComponent(id))
        .single();

      if (error) {
        console.error('Error fetching member:', error);
      } else {
        setMember(data);
        if (data.photo_url) setPhotoUrl(data.photo_url);
      }
      setLoading(false);
    };

    fetchMember();
  }, [id]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${decodeURIComponent(id)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('member-photos')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      alert('Photo upload failed. Please try again.');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('member-photos')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    await supabase.from('members').update({ photo_url: publicUrl }).eq('id', decodeURIComponent(id));
    setPhotoUrl(publicUrl);
    setUploading(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${member?.name}? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);

    await supabase.from('fees').delete().eq('member_id', decodeURIComponent(id));

    if (member?.photo_url) {
      const fileName = member.photo_url.split('/').pop();
      await supabase.storage.from('member-photos').remove([fileName]);
    }

    const { error } = await supabase.from('members').delete().eq('id', decodeURIComponent(id));

    if (error) {
      alert('Error deleting member. Please try again.');
      setDeleting(false);
    } else {
      await supabase.from('notifications').insert([{
        message: `🗑️ Member deleted: ${member?.name} (${member?.id})`,
        type: 'deleted',
      }]);
      router.push('/');
    }
  };

  const infoRow = (label: string, value: any) => (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      padding: '10px 0',
      borderBottom: '1px solid var(--green-pale)',
      gap: '4px',
    }}>
      <span style={{
        width: '160px',
        minWidth: '130px',
        fontSize: '0.83rem',
        fontWeight: '600',
        color: 'var(--gray-text)',
        flexShrink: 0,
      }}>{label}</span>
      <span style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '500', flex: 1 }}>{value || '-'}</span>
    </div>
  );

  return (
    <main>
      <Navbar />

      <style>{`
        .profile-buttons {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .profile-btn {
          padding: 9px 16px;
          border: none;
          border-radius: var(--radius);
          cursor: pointer;
          font-size: 0.88rem;
          font-weight: 600;
        }
        .profile-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          background-color: var(--green-dark);
        }
        .profile-info-section {
          padding: 1.2rem 1.5rem;
        }
        .children-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }
        @media (max-width: 600px) {
          .profile-buttons {
            flex-direction: column;
          }
          .profile-btn {
            width: 100%;
            text-align: center;
          }
          .profile-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 1.2rem 1rem;
          }
          .profile-header-badges {
            justify-content: center !important;
          }
          .profile-info-section {
            padding: 1rem;
          }
          .children-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>

        {/* Buttons */}
        <div className="profile-buttons">
          <button className="profile-btn" onClick={() => router.back()} style={{
            backgroundColor: 'var(--green-main)', color: 'white',
          }}>← Back</button>

          {!member?.is_child && (
            <button className="profile-btn" onClick={() => router.push(`/fees/${encodeURIComponent(id)}`)} style={{
              backgroundColor: '#1565c0', color: 'white',
            }}>💰 Manage Fees</button>
          )}

          <button className="profile-btn" onClick={() => router.push(`/edit/${encodeURIComponent(id)}`)} style={{
            backgroundColor: '#e65100', color: 'white',
          }}>✏️ Edit Member</button>

          <button
            className="profile-btn"
            onClick={handleDelete}
            disabled={deleting}
            style={{ backgroundColor: '#c62828', color: 'white' }}>
            {deleting ? '⏳ Deleting...' : '🗑️ Delete Member'}
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-text)' }}>
            Loading profile...
          </div>
        )}

        {!loading && !member && (
          <div style={{
            backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
            padding: '3rem', textAlign: 'center', color: 'var(--gray-text)', boxShadow: 'var(--shadow)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h3>Member not found</h3>
          </div>
        )}

        {!loading && member && (
          <div style={{
            backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)', overflow: 'hidden',
          }}>

            {/* Header */}
            <div className="profile-header">
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '85px', height: '85px', borderRadius: '50%',
                  overflow: 'hidden', border: '3px solid var(--green-light)',
                  backgroundColor: 'var(--green-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '2.2rem' }}>
                      {member.category === 'under18' ? '👦' : member.category === 'senior' ? '👴' : '🧑'}
                    </span>
                  )}
                </div>
                <label style={{
                  position: 'absolute', bottom: 0, right: 0,
                  backgroundColor: 'var(--green-main)', borderRadius: '50%',
                  width: '26px', height: '26px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '0.75rem', border: '2px solid white',
                }}>
                  {uploading ? '⏳' : '📷'}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
              </div>

              <div style={{ flex: 1 }}>
                <h2 style={{ color: 'white', fontSize: '1.4rem', marginBottom: '4px' }}>{member.name}</h2>
                <p style={{ color: 'var(--green-border)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>ID: {member.id}</p>
                <div className="profile-header-badges" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    backgroundColor: member.voting_eligible ? 'var(--green-light)' : '#ef5350',
                    color: 'white', padding: '3px 10px', borderRadius: '12px',
                    fontSize: '0.75rem', fontWeight: '600',
                  }}>
                    {member.voting_eligible ? '✅ Eligible to Vote' : '❌ Not Eligible to Vote'}
                  </span>
                  <span style={{
                    backgroundColor: member.category === 'under18' ? '#1565c0' : member.category === 'senior' ? '#e65100' : 'var(--green-main)',
                    color: 'white', padding: '3px 10px', borderRadius: '12px',
                    fontSize: '0.75rem', fontWeight: '600',
                  }}>
                    {member.category === 'under18' ? '👦 Under 18' : member.category === 'senior' ? '👴 Senior Citizen' : '🧑 Adult'}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="profile-info-section">
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--green-dark)' }}>👤 Personal Information</h3>
              {infoRow('Member ID', member.id)}
              {infoRow('Full Name', member.name)}
              {infoRow("Father's Name", member.father_name)}
              {infoRow('Cast', member.member_cast)}
              {infoRow('Date of Birth', member.date_of_birth)}
              {infoRow('Age', member.age)}
              {infoRow('Gender', member.gender)}
              {member.category === 'under18' ? infoRow('B-Form', member.b_form) : infoRow('CNIC', member.cnic)}
              {infoRow('Phone', member.phone)}
              {infoRow('Email', member.email)}
              {infoRow('Address', member.address)}
              {infoRow('Occupation', member.occupation)}
              {infoRow('Entry Date', member.entry_date)}
            </div>

            {/* Marital Info */}
            {member.category !== 'under18' && (
              <div className="profile-info-section" style={{ borderTop: '1px solid var(--green-pale)' }}>
                <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--green-dark)' }}>💍 Marital Information</h3>
                {infoRow('Marital Status', member.marital_status)}
                {member.marital_status === 'Married' && (
                  <>
                    {infoRow("Wife's Name", member.wife_name)}
                    {infoRow("Wife's CNIC", member.wife_cnic)}
                  </>
                )}
              </div>
            )}

            {/* Children */}
            {member.marital_status === 'Married' && member.children && member.children.length > 0 && (
              <div className="profile-info-section" style={{ borderTop: '1px solid var(--green-pale)' }}>
                <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--green-dark)' }}>👨‍👩‍👧 Children ({member.children.length})</h3>
                <div className="children-grid">
                  {member.children.map((child: any, index: number) => (
                    <div key={index} style={{
                      backgroundColor: 'var(--green-pale)', borderRadius: 'var(--radius)',
                      padding: '0.75rem', border: '1px solid var(--green-border)',
                    }}>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{child.name}</p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--gray-text)' }}>Age: {child.age}</p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--gray-text)' }}>Gender: {child.gender}</p>
                      {child.bForm && <p style={{ fontSize: '0.82rem', color: 'var(--gray-text)' }}>B-Form: {child.bForm}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </main>
  );
}