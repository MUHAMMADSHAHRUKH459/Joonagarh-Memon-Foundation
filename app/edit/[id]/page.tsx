'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';
import { calculateAge, getCategory, isVotingEligible } from '@/utils/helpers';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid var(--green-border)',
  borderRadius: 'var(--radius)',
  fontSize: '0.95rem',
  outline: 'none',
  backgroundColor: 'var(--white)',
  color: 'var(--text-dark)',
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: '600' as const,
  color: 'var(--green-dark)',
  marginBottom: '4px',
  display: 'block',
};

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
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
    wife_name: '',
    wife_cnic: '',
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
        wife_name: data.wife_name || '',
        wife_cnic: data.wife_cnic || '',
      });
      setChildren(data.children || []);
      setLoading(false);
    };

    fetchMember();
  }, [id]);

  const age = form.date_of_birth ? calculateAge(form.date_of_birth) : 0;
  const isUnder18 = age < 18 && age > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addChild = () => {
    setChildren([...children, { name: '', age: '', gender: 'Male', bForm: '' }]);
  };

  const updateChild = (index: number, field: string, value: string) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  };

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const age = calculateAge(form.date_of_birth);
    const category = getCategory(age);

    const updated = {
      ...form,
      age,
      category,
      voting_eligible: isVotingEligible(age),
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
      router.push(`/members/${encodeURIComponent(id)}`);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <main>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-text)' }}>
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '750px', margin: '0 auto' }}>

        <button onClick={() => router.back()} style={{
          backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
          fontSize: '0.95rem', marginBottom: '1.5rem', fontWeight: '600',
        }}>← Back</button>

        {/* Header */}
        <div style={{
          backgroundColor: 'var(--green-dark)', borderRadius: 'var(--radius)',
          padding: '1.5rem', marginBottom: '1.5rem',
        }}>
          <h2 style={{ color: 'white', fontSize: '1.4rem' }}>✏️ Edit Member</h2>
          <p style={{ color: 'var(--green-border)', fontSize: '0.85rem' }}>ID: {decodeURIComponent(id)}</p>
        </div>

        {/* Age Preview */}
        {form.date_of_birth && (
          <div style={{
            backgroundColor: isUnder18 ? '#e3f2fd' : 'var(--green-pale)',
            border: `1px solid ${isUnder18 ? '#90caf9' : 'var(--green-border)'}`,
            borderRadius: '8px', padding: '10px 16px', marginBottom: '1rem',
            fontSize: '0.9rem', fontWeight: '600',
            color: isUnder18 ? '#1565c0' : age >= 60 ? '#e65100' : 'var(--green-dark)',
          }}>
            {isUnder18 ? `👦 Age: ${age} - Under 18` : age >= 60 ? `👴 Age: ${age} - Senior Citizen` : `🧑 Age: ${age} - Adult`}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{
            backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
            padding: '1.5rem', boxShadow: 'var(--shadow)', marginBottom: '1rem',
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--green-dark)' }}>👤 Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <label style={labelStyle}>Father's Name *</label>
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

          {/* Marital Status */}
          {!isUnder18 && (
            <div style={{
              backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
              padding: '1.5rem', boxShadow: 'var(--shadow)', marginBottom: '1rem',
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--green-dark)' }}>💍 Marital Information</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Marital Status</label>
                <select style={{ ...inputStyle, width: 'auto', minWidth: '200px' }} name="marital_status" value={form.marital_status} onChange={handleChange}>
                  <option>Unmarried</option>
                  <option>Married</option>
                </select>
              </div>

              {form.marital_status === 'Married' && (
                <div style={{ backgroundColor: 'var(--green-pale)', borderRadius: 'var(--radius)', padding: '1rem', border: '1px solid var(--green-border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Wife's Name</label>
                      <input style={inputStyle} name="wife_name" value={form.wife_name} onChange={handleChange} />
                    </div>
                    <div>
                      <label style={labelStyle}>Wife's CNIC</label>
                      <input style={inputStyle} name="wife_cnic" value={form.wife_cnic} onChange={handleChange} />
                    </div>
                  </div>

                  {/* Children */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={labelStyle}>Children ({children.length})</label>
                      <button type="button" onClick={addChild} style={{
                        backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
                        padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem',
                      }}>+ Add Child</button>
                    </div>
                    {children.map((child, index) => (
                      <div key={index} style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                        gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center',
                      }}>
                        <input style={inputStyle} placeholder="Child's name" value={child.name} onChange={(e) => updateChild(index, 'name', e.target.value)} />
                        <input style={inputStyle} placeholder="Age" type="number" value={child.age} onChange={(e) => updateChild(index, 'age', e.target.value)} />
                        <select style={inputStyle} value={child.gender} onChange={(e) => updateChild(index, 'gender', e.target.value)}>
                          <option>Male</option>
                          <option>Female</option>
                        </select>
                        <input style={inputStyle} placeholder="B-Form (optional)" value={child.bForm || ''} onChange={(e) => updateChild(index, 'bForm', e.target.value)} />
                        <button type="button" onClick={() => removeChild(index)} style={{
                          background: '#ff4444', color: 'white', border: 'none',
                          borderRadius: '8px', padding: '8px 12px', cursor: 'pointer',
                        }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => router.back()} style={{
              padding: '10px 24px', border: '1.5px solid var(--green-border)',
              borderRadius: 'var(--radius)', backgroundColor: 'transparent',
              cursor: 'pointer', fontSize: '0.95rem',
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              padding: '10px 24px', backgroundColor: 'var(--green-main)',
              color: 'white', border: 'none', borderRadius: 'var(--radius)',
              cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600',
            }}>
              {saving ? '⏳ Saving...' : '✅ Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}