'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';

interface Child {
  name: string;
  dob: string;
  gender: string;
  bForm?: string;
}

interface Wife {
  name: string;
  cnic: string;
  dob: string;
}

interface Member {
  id: string;
  name: string;
  father_name: string;
  member_cast: string;
  date_of_birth: string;
  age: string | number;
  gender: string;
  cnic: string;
  b_form: string;
  phone: string;
  email: string;
  address: string;
  occupation: string;
  entry_date: string;
  category: 'under18' | 'senior' | 'adult' | 'widow';
  voting_eligible: boolean;
  marital_status: string;
  wives?: Wife[];
  wife_name?: string;
  wife_cnic?: string;
  wife_dob?: string;
  husband_name?: string;
  husband_cnic?: string;
  husband_dob?: string;
  husband_death_date?: string;
  children?: Child[];
  photo_url?: string;
  is_child?: boolean;
}

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
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
        setMember(data as Member);
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
      if (fileName) {
        await supabase.storage.from('member-photos').remove([fileName]);
      }
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

  const infoRow = (label: string, value: string | number | boolean | null | undefined) => (
    <div style={{
      display: 'flex', flexWrap: 'wrap', padding: '10px 0',
      borderBottom: '1px solid var(--green-pale)', gap: '4px',
    }}>
      <span style={{
        width: '160px', minWidth: '130px', fontSize: '0.83rem',
        fontWeight: '600', color: 'var(--gray-text)', flexShrink: 0,
      }}>{label}</span>
      <span style={{
        fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '500',
        flex: 1, wordBreak: 'break-word',
      }}>
        {value !== null && value !== undefined && value !== '' ? String(value) : '-'}
      </span>
    </div>
  );

  const getMaritalBadge = (status: string) => {
    if (status === 'Married') return { emoji: '💍', label: 'Married',   bg: 'var(--green-main)' };
    if (status === 'Widow')   return { emoji: '🕊️', label: 'Widow',     bg: '#7b1fa2' };
    return                           { emoji: '🧑', label: 'Unmarried', bg: 'var(--gray-text)' };
  };

  const getCategoryBadge = (category: string) => {
    if (category === 'under18') return { emoji: '👦', label: 'Under 18',       bg: '#1565c0' };
    if (category === 'senior')  return { emoji: '👴', label: 'Senior Citizen',  bg: '#e65100' };
    if (category === 'widow')   return { emoji: '🕊️', label: 'Widow',          bg: '#7b1fa2' };
    return                             { emoji: '🧑', label: 'Adult',           bg: 'var(--green-main)' };
  };

  return (
    <main>
      <Navbar />

      <style>{`
        .profile-buttons { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .profile-btn { padding: 9px 16px; border: none; border-radius: var(--radius); cursor: pointer; font-size: 0.88rem; font-weight: 600; transition: opacity 0.2s; white-space: nowrap; }
        .profile-btn:hover { opacity: 0.88; }
        .profile-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .profile-header { display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; background-color: var(--green-dark); }
        .profile-header-text h2 { color: white; font-size: 1.4rem; margin-bottom: 4px; }
        .profile-header-text p { color: var(--green-border); font-size: 0.85rem; margin-bottom: 0.5rem; }
        .profile-header-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }

        .profile-info-section { padding: 1.2rem 1.5rem; }
        .section-title { margin-bottom: 0.75rem; font-size: 1rem; color: var(--green-dark); }

        .married-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
        .widow-grid   { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 0.75rem; }

        .married-card { background-color: var(--green-pale); border: 1px solid var(--green-border); border-radius: var(--radius); padding: 0.9rem 1rem; }
        .widow-card   { background-color: #f3e5f5; border: 1px solid #ce93d8; border-radius: var(--radius); padding: 0.9rem 1rem; }

        .married-card-label { font-size: 0.75rem; font-weight: 600; color: var(--gray-text); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.03em; }
        .widow-card-label   { font-size: 0.75rem; font-weight: 600; color: #7b1fa2; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.03em; }
        .married-card-value { font-size: 0.92rem; font-weight: 600; color: var(--text-dark); word-break: break-word; }
        .widow-death-card   { background-color: #fce4e4; border: 1px solid #ef9a9a; border-radius: var(--radius); padding: 0.9rem 1rem; }
        .widow-death-label  { font-size: 0.75rem; font-weight: 600; color: #c62828; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.03em; }

        .children-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 1rem; }
        .child-card { background-color: var(--green-pale); border-radius: var(--radius); padding: 0.75rem; border: 1px solid var(--green-border); }
        .child-card p { margin: 0; }
        .child-name { font-weight: 600; font-size: 0.9rem; margin-bottom: 4px !important; }
        .child-detail { font-size: 0.82rem; color: var(--gray-text); margin-top: 2px !important; }

        .photo-wrapper { position: relative; flex-shrink: 0; }
        .photo-circle { width: 85px; height: 85px; border-radius: 50%; overflow: hidden; border: 3px solid var(--green-light); background-color: var(--green-light); display: flex; align-items: center; justify-content: center; }
        .photo-upload-btn { position: absolute; bottom: 0; right: 0; background-color: var(--green-main); border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem; border: 2px solid white; }

        @media (max-width: 768px) {
          .profile-info-section { padding: 1rem; }
          .married-grid { grid-template-columns: 1fr 1fr; }
          .widow-grid   { grid-template-columns: 1fr 1fr; }
          .children-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .married-grid { grid-template-columns: 1fr; }
          .widow-grid   { grid-template-columns: 1fr; }
          .profile-buttons { flex-direction: column; }
          .profile-btn { width: 100%; text-align: center; }
          .profile-header { flex-direction: column; align-items: center; text-align: center; padding: 1.2rem 1rem; gap: 1rem; }
          .profile-header-badges { justify-content: center; }
          .profile-header-text h2 { font-size: 1.2rem; }
          .children-grid { grid-template-columns: 1fr 1fr; }
          .photo-circle { width: 75px; height: 75px; }
        }
        @media (max-width: 360px) {
          .children-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>

        {/* Buttons */}
        <div className="profile-buttons">
          <button className="profile-btn" onClick={() => router.back()} style={{ backgroundColor: 'var(--green-main)', color: 'white' }}>← Back</button>
          {!member?.is_child && (
            <button className="profile-btn" onClick={() => router.push(`/fees/${encodeURIComponent(id)}`)} style={{ backgroundColor: '#1565c0', color: 'white' }}>💰 Manage Fees</button>
          )}
          <button className="profile-btn" onClick={() => router.push(`/edit/${encodeURIComponent(id)}`)} style={{ backgroundColor: '#e65100', color: 'white' }}>✏️ Edit Member</button>
          <button className="profile-btn" onClick={handleDelete} disabled={deleting} style={{ backgroundColor: '#c62828', color: 'white' }}>
            {deleting ? '⏳ Deleting...' : '🗑️ Delete Member'}
          </button>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-text)' }}>Loading profile...</div>}

        {!loading && !member && (
          <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius)', padding: '3rem', textAlign: 'center', color: 'var(--gray-text)', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h3>Member not found</h3>
          </div>
        )}

        {!loading && member && (() => {
          const maritalBadge = getMaritalBadge(member.marital_status);
          const categoryBadge = getCategoryBadge(member.category);
          const isMarried = member.marital_status === 'Married';
          const isWidow = member.marital_status === 'Widow';
          const isMale = member.gender === 'Male';
          const isFemale = member.gender === 'Female';
          const hasChildren = member.children && member.children.length > 0;

          return (
            <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>

              {/* Header */}
              <div className="profile-header">
                <div className="photo-wrapper">
                  <div className="photo-circle">
                    {photoUrl ? (
                      <Image src={photoUrl} alt="Profile" width={85} height={85} style={{ objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <span style={{ fontSize: '2.2rem' }}>
                        {member.category === 'under18' ? '👦' : member.category === 'senior' ? '👴' : member.category === 'widow' ? '🕊️' : '🧑'}
                      </span>
                    )}
                  </div>
                  <label className="photo-upload-btn">
                    {uploading ? '⏳' : '📷'}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                <div className="profile-header-text" style={{ flex: 1 }}>
                  <h2>{member.name}</h2>
                  <p>ID: {member.id}</p>
                  <div className="profile-header-badges">
                    <span style={{ backgroundColor: member.voting_eligible ? 'var(--green-light)' : '#ef5350', color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                      {member.voting_eligible ? '✅ Eligible to Vote' : '❌ Not Eligible to Vote'}
                    </span>
                    <span style={{ backgroundColor: categoryBadge.bg, color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                      {categoryBadge.emoji} {categoryBadge.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="profile-info-section">
                <h3 className="section-title">👤 Personal Information</h3>
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
                  <h3 className="section-title">💍 Marital Information</h3>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ display: 'inline-block', backgroundColor: maritalBadge.bg, color: 'white', padding: '4px 14px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                      {maritalBadge.emoji} {maritalBadge.label}
                    </span>
                  </div>

                  {/* Male + Married: Wives */}
                  {isMale && isMarried && member.wives && member.wives.length > 0 && (
                    <div>
                      {member.wives.map((wife: Wife, i: number) => (
                        <div key={i} style={{ marginBottom: '0.75rem' }}>
                          {member.wives && member.wives.length > 1 && (
                            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--green-dark)', marginBottom: '0.5rem' }}>👩 Wife {i + 1}</p>
                          )}
                          <div className="married-grid">
                            <div className="married-card">
                              <div className="married-card-label">👩 Wife&apos;s Name</div>
                              <div className="married-card-value">{wife.name || '-'}</div>
                            </div>
                            <div className="married-card">
                              <div className="married-card-label">🪪 Wife&apos;s CNIC</div>
                              <div className="married-card-value">{wife.cnic || '-'}</div>
                            </div>
                            <div className="married-card">
                              <div className="married-card-label">🎂 Wife&apos;s DOB</div>
                              <div className="married-card-value">{wife.dob || '-'}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Female + Married: Husband */}
                  {isFemale && isMarried && (
                    <div className="married-grid">
                      <div className="married-card">
                        <div className="married-card-label">👨 Husband&apos;s Name</div>
                        <div className="married-card-value">{member.husband_name || '-'}</div>
                      </div>
                      <div className="married-card">
                        <div className="married-card-label">🪪 Husband&apos;s CNIC</div>
                        <div className="married-card-value">{member.husband_cnic || '-'}</div>
                      </div>
                      <div className="married-card">
                        <div className="married-card-label">🎂 Husband&apos;s DOB</div>
                        <div className="married-card-value">{member.husband_dob || '-'}</div>
                      </div>
                    </div>
                  )}

                  {/* ✅ Widow: Late Husband — DOB + Date of Death */}
                  {isWidow && (
                    <div>
                      <p style={{ fontSize: '0.8rem', color: '#7b1fa2', fontWeight: '700', marginBottom: '0.6rem' }}>
                        🕊️ Late Husband Details
                      </p>
                      <div className="widow-grid">
                        <div className="widow-card">
                          <div className="widow-card-label">👨 Name</div>
                          <div className="married-card-value">{member.husband_name || '-'}</div>
                        </div>
                        <div className="widow-card">
                          <div className="widow-card-label">🪪 CNIC</div>
                          <div className="married-card-value">{member.husband_cnic || '-'}</div>
                        </div>
                        <div className="widow-card">
                          <div className="widow-card-label">🎂 Date of Birth</div>
                          <div className="married-card-value">{member.husband_dob || '-'}</div>
                        </div>
                        {/* ✅ Date of Death — red card */}
                        <div className="widow-death-card">
                          <div className="widow-death-label">☠️ Date of Death</div>
                          <div className="married-card-value" style={{ color: '#c62828' }}>
                            {member.husband_death_date || '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Children */}
              {(isMarried || isWidow) && hasChildren && (
                <div className="profile-info-section" style={{ borderTop: '1px solid var(--green-pale)' }}>
                  <h3 className="section-title">👨‍👩‍👧 Children ({member.children!.length})</h3>
                  <div className="children-grid">
                    {member.children!.map((child: Child, index: number) => {
                      const childAge = child.dob ? (() => {
                        const today = new Date();
                        const birth = new Date(child.dob);
                        let a = today.getFullYear() - birth.getFullYear();
                        const m = today.getMonth() - birth.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
                        return a;
                      })() : null;
                      const childIsUnder18 = childAge !== null && childAge < 18;

                      return (
                        <div key={index} className="child-card">
                          <p className="child-name">{child.gender === 'Female' ? '👧' : '👦'} {child.name}</p>
                          {child.dob && (
                            <span style={{
                              display: 'inline-block',
                              backgroundColor: childIsUnder18 ? '#e3f2fd' : '#e8f5e9',
                              color: childIsUnder18 ? '#1565c0' : 'var(--green-dark)',
                              border: `1px solid ${childIsUnder18 ? '#90caf9' : 'var(--green-border)'}`,
                              borderRadius: '20px', padding: '2px 8px',
                              fontSize: '0.72rem', fontWeight: '700', marginBottom: '4px',
                            }}>
                              {childIsUnder18 ? `👦 Under 18 (Age: ${childAge})` : `🧑 Adult (Age: ${childAge})`}
                            </span>
                          )}
                          <p className="child-detail">DOB: {child.dob || '-'}</p>
                          <p className="child-detail">Gender: {child.gender}</p>
                          {child.bForm && <p className="child-detail">B-Form: {child.bForm}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          );
        })()}
      </div>
    </main>
  );
}