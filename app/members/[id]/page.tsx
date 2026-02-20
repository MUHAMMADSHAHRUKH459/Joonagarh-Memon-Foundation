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
      console.error('Upload error:', uploadError);
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

  const infoRow = (label: string, value: any) => (
    <div style={{
      display: 'flex',
      padding: '12px 0',
      borderBottom: '1px solid var(--green-pale)',
    }}>
      <span style={{
        width: '180px',
        fontSize: '0.85rem',
        fontWeight: '600',
        color: 'var(--gray-text)',
        flexShrink: 0,
      }}>{label}</span>
      <span style={{ fontSize: '0.95rem', color: 'var(--text-dark)', fontWeight: '500' }}>{value || '-'}</span>
    </div>
  );

  return (
    <main>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button onClick={() => router.back()} style={{
            backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
            padding: '10px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
            fontSize: '0.95rem', fontWeight: '600',
          }}>← Back</button>
          <button onClick={() => router.push(`/fees/${encodeURIComponent(id)}`)} style={{
            backgroundColor: '#1565c0', color: 'white', border: 'none',
            padding: '10px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
            fontSize: '0.95rem', fontWeight: '600',
          }}>💰 Manage Fees</button>
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
            <div style={{
              backgroundColor: 'var(--green-dark)', padding: '2rem',
              display: 'flex', alignItems: 'center', gap: '1.5rem',
            }}>
              {/* Photo */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '90px', height: '90px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid var(--green-light)',
                  backgroundColor: 'var(--green-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '2.5rem' }}>
                      {member.category === 'under18' ? '👦' : member.category === 'senior' ? '👴' : '🧑'}
                    </span>
                  )}
                </div>
                {/* Upload Button */}
                <label style={{
                  position: 'absolute', bottom: 0, right: 0,
                  backgroundColor: 'var(--green-main)',
                  borderRadius: '50%', width: '26px', height: '26px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '0.75rem',
                  border: '2px solid white',
                }}>
                  {uploading ? '⏳' : '📷'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div>
                <h2 style={{ color: 'white', fontSize: '1.6rem' }}>{member.name}</h2>
                <p style={{ color: 'var(--green-border)', fontSize: '0.9rem' }}>ID: {member.id}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    backgroundColor: member.voting_eligible ? 'var(--green-light)' : '#ef5350',
                    color: 'white', padding: '3px 10px', borderRadius: '12px',
                    fontSize: '0.78rem', fontWeight: '600',
                  }}>
                    {member.voting_eligible ? '✅ Eligible to Vote' : '❌ Not Eligible to Vote'}
                  </span>
                  <span style={{
                    backgroundColor: member.category === 'under18' ? '#1565c0' : member.category === 'senior' ? '#e65100' : 'var(--green-main)',
                    color: 'white', padding: '3px 10px', borderRadius: '12px',
                    fontSize: '0.78rem', fontWeight: '600',
                  }}>
                    {member.category === 'under18' ? '👦 Under 18' : member.category === 'senior' ? '👴 Senior Citizen' : '🧑 Adult'}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div style={{ padding: '1.5rem 2rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--green-dark)' }}>👤 Personal Information</h3>
              {infoRow('Member ID', member.id)}
              {infoRow('Full Name', member.name)}
              {infoRow('Father\'s Name', member.father_name)}
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
              <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--green-pale)' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--green-dark)' }}>💍 Marital Information</h3>
                {infoRow('Marital Status', member.marital_status)}
                {member.marital_status === 'Married' && (
                  <>
                    {infoRow('Wife\'s Name', member.wife_name)}
                    {infoRow('Wife\'s CNIC', member.wife_cnic)}
                  </>
                )}
              </div>
            )}

            {/* Children */}
            {member.marital_status === 'Married' && member.children && member.children.length > 0 && (
              <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--green-pale)' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--green-dark)' }}>👨‍👩‍👧 Children ({member.children.length})</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {member.children.map((child: any, index: number) => (
                    <div key={index} style={{
                      backgroundColor: 'var(--green-pale)', borderRadius: 'var(--radius)',
                      padding: '1rem', border: '1px solid var(--green-border)',
                    }}>
                      <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{child.name}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>Age: {child.age}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>Gender: {child.gender}</p>
                      {child.bForm && <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>B-Form: {child.bForm}</p>}
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