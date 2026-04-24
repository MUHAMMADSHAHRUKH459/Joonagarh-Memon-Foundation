'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';
import { calculateAge, getCategory, isVotingEligible } from '@/utils/helpers';

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

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1.5px solid var(--green-border)',
  borderRadius: 'var(--radius)',
  fontSize: '0.9rem',
  outline: 'none',
  backgroundColor: 'var(--white)',
  color: 'var(--text-dark)',
  boxSizing: 'border-box' as const,
};

const labelStyle = {
  fontSize: '0.82rem',
  fontWeight: '600' as const,
  color: 'var(--green-dark)',
  marginBottom: '4px',
  display: 'block',
};

const getAgeFromDob = (dob: string): number => {
  if (!dob) return 0;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [wives, setWives] = useState<Wife[]>([]);

  const [form, setForm] = useState({
    name: '',
    father_name: '',
    member_cast: '',
    date_of_birth: '',
    gender: 'Male',
    cnic: '',
    b_form: '',
    phone: '',
    email: '',
    address: '',
    occupation: '',
    marital_status: 'Unmarried',
    // Female fields
    husband_name: '',
    husband_cnic: '',
    husband_dob: '',
    husband_death_date: '',
  });

  useEffect(() => {
    const fetchMember = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', decodeURIComponent(id))
        .single();

      if (error || !data) {
        alert('Member not found!');
        router.back();
        return;
      }

      setForm({
        name: data.name || '',
        father_name: data.father_name || '',
        member_cast: data.member_cast || '',
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || 'Male',
        cnic: data.cnic || '',
        b_form: data.b_form || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        occupation: data.occupation || '',
        marital_status: data.marital_status || 'Unmarried',
        husband_name: data.husband_name || '',
        husband_cnic: data.husband_cnic || '',
        husband_dob: data.husband_dob || '',
        husband_death_date: data.husband_death_date || '',
      });

      // Wives — new array format
      if (data.wives && data.wives.length > 0) {
        setWives(data.wives);
      } else if (data.wife_name) {
        // Backward compat: purana single wife format
        setWives([{ name: data.wife_name, cnic: data.wife_cnic || '', dob: data.wife_dob || '' }]);
      } else {
        setWives([]);
      }

      // Children — dob field
      const loadedChildren = (data.children || []).map((c: Child & { age?: string | number }) => ({
        name: c.name || '',
        dob: c.dob || '',
        gender: c.gender || 'Male',
        bForm: c.bForm || '',
      }));
      setChildren(loadedChildren);
      setLoading(false);
    };

    fetchMember();
  }, [id, router]);

  const age = form.date_of_birth ? calculateAge(form.date_of_birth) : 0;
  const isUnder18 = age < 18 && age > 0;
  const isMale = form.gender === 'Male';
  const isFemale = form.gender === 'Female';
  const isMarried = form.marital_status === 'Married';
  const isWidow = form.marital_status === 'Widow';
  const showFamilySection = !isUnder18 && (isMarried || isWidow);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'gender') updated.marital_status = 'Unmarried';
      return updated;
    });
  };

  // Wife handlers
  const addWife = () => setWives([...wives, { name: '', cnic: '', dob: '' }]);
  const updateWife = (index: number, field: keyof Wife, value: string) => {
    const updated = [...wives];
    updated[index] = { ...updated[index], [field]: value };
    setWives(updated);
  };
  const removeWife = (index: number) => {
    if (wives.length === 1) return;
    setWives(wives.filter((_, i) => i !== index));
  };

  // Child handlers
  const addChild = () => setChildren([...children, { name: '', dob: '', gender: 'Male', bForm: '' }]);
  const updateChild = (index: number, field: keyof Child, value: string) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  };
  const removeChild = (index: number) => setChildren(children.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const isWidowFemale = form.marital_status === 'Widow' && form.gender === 'Female';
    const finalCategory = isWidowFemale ? 'widow' : getCategory(age);

    const updated = {
      ...form,
      age,
      category: finalCategory,
      voting_eligible: isVotingEligible(age),
      wives: isMale && isMarried ? wives : [],
      husband_name: isFemale ? form.husband_name : null,
      husband_cnic: isFemale ? form.husband_cnic : null,
      husband_dob: isFemale ? form.husband_dob : null,
      husband_death_date: isWidow ? form.husband_death_date : null,
      children,
    };

    const { error } = await supabase
      .from('members')
      .update(updated)
      .eq('id', decodeURIComponent(id));

    if (error) {
      alert('Error updating member. Please try again.');
      console.error(error);
    } else {
      await supabase.from('notifications').insert([{
        message: `✏️ Member updated: ${form.name} (${decodeURIComponent(id)})`,
        type: 'updated',
      }]);
      router.push(`/members/${encodeURIComponent(id)}`);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <main>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-text)' }}>Loading...</div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />

      <style>{`
        .edit-wrap { padding: 1.5rem; max-width: 750px; margin: 0 auto; }
        .edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
        .spouse-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 0.85rem; }
        .wife-card { background: var(--white); border: 1px solid var(--green-border); border-radius: var(--radius); padding: 0.85rem; margin-bottom: 0.75rem; }
        .child-row { background: var(--white); border: 1px solid var(--green-border); border-radius: var(--radius); padding: 0.75rem; margin-bottom: 0.75rem; }
        .child-row-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr auto; gap: 0.5rem; align-items: end; }
        .child-age-badge { margin-top: 0.5rem; }
        .section-card { background: var(--white); border-radius: var(--radius); padding: 1.25rem; box-shadow: var(--shadow); margin-bottom: 1rem; }
        .section-title { font-size: 0.95rem; color: var(--green-dark); font-weight: 700; margin-bottom: 1rem; }

        @media (max-width: 768px) {
          .spouse-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .edit-wrap { padding: 1rem; }
          .edit-grid { grid-template-columns: 1fr; gap: 0.65rem; }
          .spouse-grid { grid-template-columns: 1fr 1fr; }
          .child-row-grid { grid-template-columns: 1fr 1fr; }
          .child-row-grid .child-name   { grid-column: 1 / 3; }
          .child-row-grid .child-dob    { grid-column: 1 / 3; }
          .child-row-grid .child-gender { grid-column: 1 / 2; }
          .child-row-grid .child-bform  { grid-column: 2 / 3; }
          .child-row-grid .child-remove { grid-column: 1 / 3; justify-self: end; }
          .section-card { padding: 1rem; }
        }
        @media (max-width: 420px) {
          .spouse-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="edit-wrap">

        <button onClick={() => router.back()} style={{
          backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
          padding: '9px 18px', borderRadius: 'var(--radius)', cursor: 'pointer',
          fontSize: '0.9rem', marginBottom: '1.25rem', fontWeight: '600',
        }}>← Back</button>

        {/* Header */}
        <div style={{
          backgroundColor: 'var(--green-dark)', borderRadius: 'var(--radius)',
          padding: '1.25rem 1.5rem', marginBottom: '1.25rem',
        }}>
          <h2 style={{ color: 'white', fontSize: '1.3rem' }}>✏️ Edit Member</h2>
          <p style={{ color: 'var(--green-border)', fontSize: '0.82rem', marginTop: '2px' }}>ID: {decodeURIComponent(id)}</p>
        </div>

        {/* Age Preview */}
        {form.date_of_birth && (
          <div style={{
            backgroundColor: isUnder18 ? '#e3f2fd' : 'var(--green-pale)',
            border: `1px solid ${isUnder18 ? '#90caf9' : 'var(--green-border)'}`,
            borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem',
            fontSize: '0.88rem', fontWeight: '600',
            color: isUnder18 ? '#1565c0' : age >= 60 ? '#e65100' : 'var(--green-dark)',
          }}>
            {isUnder18 ? `👦 Age: ${age} — Under 18` : age >= 60 ? `👴 Age: ${age} — Senior Citizen` : `🧑 Age: ${age} — Adult`}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Personal Info */}
          <div className="section-card">
            <h3 className="section-title">👤 Personal Information</h3>
            <div className="edit-grid">
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <label style={labelStyle}>Father&apos;s Name *</label>
                <input style={inputStyle} name="father_name" value={form.father_name} onChange={handleChange} required />
              </div>
              <div>
                <label style={labelStyle}>Cast *</label>
                <input style={inputStyle} name="member_cast" value={form.member_cast} onChange={handleChange} required />
              </div>
              <div>
                <label style={labelStyle}>Date of Birth *</label>
                <input style={inputStyle} name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} required />
              </div>
              <div>
                <label style={labelStyle}>Gender *</label>
                <select style={inputStyle} name="gender" value={form.gender} onChange={handleChange}>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{isUnder18 ? 'B-Form Number' : 'CNIC Number'}</label>
                <input
                  style={inputStyle}
                  name={isUnder18 ? 'b_form' : 'cnic'}
                  value={isUnder18 ? form.b_form : form.cnic}
                  onChange={handleChange}
                  placeholder={isUnder18 ? 'B-Form number' : '42101-1234567-1'}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone *</label>
                <input style={inputStyle} name="phone" value={form.phone} onChange={handleChange} required />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
              <div>
                <label style={labelStyle}>Occupation</label>
                <input style={inputStyle} name="occupation" value={form.occupation} onChange={handleChange} />
              </div>
              <div>
                <label style={labelStyle}>Address</label>
                <input style={inputStyle} name="address" value={form.address} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Marital Info */}
          {!isUnder18 && (
            <div className="section-card">
              <h3 className="section-title">💍 Marital Information</h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Marital Status</label>
                <select
                  style={{ ...inputStyle, width: 'auto', minWidth: '200px' }}
                  name="marital_status"
                  value={form.marital_status}
                  onChange={handleChange}
                >
                  <option>Unmarried</option>
                  <option>Married</option>
                  {isFemale && <option>Widow</option>}
                </select>
              </div>

              {showFamilySection && (
                <div style={{
                  backgroundColor: 'var(--green-pale)', padding: '1rem',
                  borderRadius: 'var(--radius)', border: '1px solid var(--green-border)',
                }}>
                  <h4 style={{ marginBottom: '0.85rem', fontSize: '0.92rem', color: 'var(--green-dark)' }}>
                    {isMale ? '👨‍👩‍👧 Family Details' : isWidow ? '🕊️  Husband Details' : '👫 Husband Details'}
                  </h4>

                  {/* Male + Married: Multiple Wives */}
                  {isMale && isMarried && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <label style={labelStyle}>Wives ({wives.length})</label>
                        <button type="button" onClick={addWife} style={{
                          backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
                          padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                          fontSize: '0.82rem', fontWeight: '600',
                        }}>+ Add Wife</button>
                      </div>

                      {wives.map((wife, index) => (
                        <div key={index} className="wife-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--green-dark)' }}>👩 Wife {index + 1}</span>
                            {wives.length > 1 && (
                              <button type="button" onClick={() => removeWife(index)} style={{
                                background: '#ff4444', color: 'white', border: 'none',
                                borderRadius: '6px', padding: '3px 10px', cursor: 'pointer', fontSize: '0.78rem',
                              }}>✕ Remove</button>
                            )}
                          </div>
                          <div className="spouse-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '0.78rem' }}>Name</label>
                              <input style={inputStyle} placeholder="Wife's name" value={wife.name}
                                onChange={e => updateWife(index, 'name', e.target.value)} />
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '0.78rem' }}>CNIC</label>
                              <input style={inputStyle} placeholder="42101-1234567-1" value={wife.cnic}
                                onChange={e => updateWife(index, 'cnic', e.target.value)} />
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '0.78rem' }}>Date of Birth</label>
                              <input style={inputStyle} type="date" value={wife.dob}
                                onChange={e => updateWife(index, 'dob', e.target.value)} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Female Married: Husband */}
                  {isFemale && isMarried && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div className="spouse-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.78rem' }}>Husband&apos;s Name</label>
                          <input style={inputStyle} name="husband_name" value={form.husband_name} onChange={handleChange} placeholder="Husband's name" />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.78rem' }}>Husband&apos;s CNIC</label>
                          <input style={inputStyle} name="husband_cnic" value={form.husband_cnic} onChange={handleChange} placeholder="42101-1234567-1" />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.78rem' }}>Husband&apos;s Date of Birth</label>
                          <input style={inputStyle} name="husband_dob" type="date" value={form.husband_dob} onChange={handleChange} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Widow: Late Husband + Death Date */}
                  {isFemale && isWidow && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{
                        backgroundColor: '#f3e5f5', border: '1px solid #ce93d8',
                        borderRadius: '8px', padding: '8px 12px', marginBottom: '0.75rem',
                        fontSize: '0.8rem', color: '#6a1b9a', fontWeight: '600',
                      }}>
                        🕊️ Widow —  husband ki details darj karein
                      </div>
                      <div className="spouse-grid">
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.78rem' }}>Late Husband&apos;s Name</label>
                          <input style={inputStyle} name="husband_name" value={form.husband_name} onChange={handleChange} placeholder="Husband's name" />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.78rem' }}>Late Husband&apos;s CNIC</label>
                          <input style={inputStyle} name="husband_cnic" value={form.husband_cnic} onChange={handleChange} placeholder="42101-1234567-1" />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.78rem' }}>Late Husband&apos;s Date of Birth</label>
                          <input style={inputStyle} name="husband_dob" type="date" value={form.husband_dob} onChange={handleChange} />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.78rem', color: '#c62828' }}>☠️ Date of Death</label>
                          <input style={{ ...inputStyle, border: '1.5px solid #ef9a9a' }} name="husband_death_date" type="date" value={form.husband_death_date} onChange={handleChange} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Children — Male Married OR Female Widow */}
                  {((isMale && isMarried) || (isFemale && isWidow)) && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <label style={labelStyle}>Children ({children.length})</label>
                        <button type="button" onClick={addChild} style={{
                          backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
                          padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                          fontSize: '0.82rem', fontWeight: '600',
                        }}>+ Add Child</button>
                      </div>

                      {children.map((child, index) => {
                        const childAge = getAgeFromDob(child.dob);
                        const childIsUnder18 = child.dob !== '' && childAge < 18;
                        return (
                          <div key={index} className="child-row">
                            <div className="child-row-grid">
                              <div className="child-name">
                                <label style={{ ...labelStyle, fontSize: '0.78rem' }}>Name</label>
                                <input style={inputStyle} placeholder="Child's name" value={child.name}
                                  onChange={e => updateChild(index, 'name', e.target.value)} />
                              </div>
                              <div className="child-dob">
                                <label style={{ ...labelStyle, fontSize: '0.78rem' }}>Date of Birth</label>
                                <input style={inputStyle} type="date" value={child.dob}
                                  onChange={e => updateChild(index, 'dob', e.target.value)} />
                              </div>
                              <div className="child-gender">
                                <label style={{ ...labelStyle, fontSize: '0.78rem' }}>Gender</label>
                                <select style={inputStyle} value={child.gender}
                                  onChange={e => updateChild(index, 'gender', e.target.value)}>
                                  <option>Male</option>
                                  <option>Female</option>
                                </select>
                              </div>
                              <div className="child-bform">
                                <label style={{ ...labelStyle, fontSize: '0.78rem' }}>B-Form</label>
                                <input style={inputStyle} placeholder="Optional" value={child.bForm || ''}
                                  onChange={e => updateChild(index, 'bForm', e.target.value)} />
                              </div>
                              <div className="child-remove" style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <button type="button" onClick={() => removeChild(index)} style={{
                                  background: '#ff4444', color: 'white', border: 'none',
                                  borderRadius: '8px', padding: '10px 12px', cursor: 'pointer', fontSize: '0.9rem',
                                }}>✕</button>
                              </div>
                            </div>
                            {child.dob && (
                              <div className="child-age-badge">
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  backgroundColor: childIsUnder18 ? '#e3f2fd' : '#e8f5e9',
                                  color: childIsUnder18 ? '#1565c0' : 'var(--green-dark)',
                                  border: `1px solid ${childIsUnder18 ? '#90caf9' : 'var(--green-border)'}`,
                                  borderRadius: '20px', padding: '3px 10px',
                                  fontSize: '0.75rem', fontWeight: '700',
                                }}>
                                  {childIsUnder18 ? `👦 Age: ${childAge} — Under 18` : `🧑 Age: ${childAge} — Adult`}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => router.back()} style={{
              padding: '10px 24px', border: '1.5px solid var(--green-border)',
              borderRadius: 'var(--radius)', backgroundColor: 'transparent',
              cursor: 'pointer', fontSize: '0.9rem',
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              padding: '10px 24px', backgroundColor: 'var(--green-main)',
              color: 'white', border: 'none', borderRadius: 'var(--radius)',
              cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600',
            }}>
              {saving ? '⏳ Saving...' : '✅ Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}