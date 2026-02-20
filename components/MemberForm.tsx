'use client';

import { useState } from 'react';

interface Child {
  name: string;
  age: string;
  gender: string;
  bForm: string;
}

interface MemberFormProps {
  onSubmit: (member: any) => void;
  onCancel: () => void;
}

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

const MemberForm = ({ onSubmit, onCancel }: MemberFormProps) => {
  const [form, setForm] = useState({
    name: '',
    fatherName: '',
    cast: '',
    dateOfBirth: '',
    gender: 'Male',
    cnic: '',
    bForm: '',
    phone: '',
    email: '',
    address: '',
    occupation: '',
    maritalStatus: 'Unmarried',
    wifeName: '',
    wifeCnic: '',
  });

  const [children, setChildren] = useState<Child[]>([]);

  // Calculate age from date of birth
  const getAge = (dob: string) => {
    if (!dob) return 0;
    const today = new Date();
    const birth = new Date(dob);
    return today.getFullYear() - birth.getFullYear();
  };

  const age = getAge(form.dateOfBirth);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, children });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius)',
        padding: '2rem',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>➕ Add New Member</h2>

        {/* Age Preview */}
        {form.dateOfBirth && (
          <div style={{
            backgroundColor: isUnder18 ? '#e3f2fd' : 'var(--green-pale)',
            border: `1px solid ${isUnder18 ? '#90caf9' : 'var(--green-border)'}`,
            borderRadius: '8px',
            padding: '10px 16px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: isUnder18 ? '#1565c0' : 'var(--green-dark)',
          }}>
            {isUnder18
              ? `👦 Age: ${age} - Under 18 Category (B-Form required)`
              : age >= 60
              ? `👴 Age: ${age} - Senior Citizen Category`
              : `🧑 Age: ${age} - Adult Category`}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Shahrukh Memon" />
            </div>
            <div>
              <label style={labelStyle}>Father's Name *</label>
              <input style={inputStyle} name="fatherName" value={form.fatherName} onChange={handleChange} required placeholder="Father's name" />
            </div>
            <div>
              <label style={labelStyle}>Cast *</label>
              <input style={inputStyle} name="cast" value={form.cast} onChange={handleChange} required placeholder="e.g. Memon" />
            </div>
            <div>
              <label style={labelStyle}>Date of Birth *</label>
              <input style={inputStyle} name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required />
            </div>
            <div>
              <label style={labelStyle}>Gender *</label>
              <select style={inputStyle} name="gender" value={form.gender} onChange={handleChange}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            {/* CNIC or B-Form based on age */}
            <div>
              <label style={labelStyle}>{isUnder18 ? 'B-Form Number *' : 'CNIC Number *'}</label>
              <input
                style={inputStyle}
                name={isUnder18 ? 'bForm' : 'cnic'}
                value={isUnder18 ? form.bForm : form.cnic}
                onChange={handleChange}
                required
                placeholder={isUnder18 ? 'B-Form number' : '42101-1234567-1'}
              />
            </div>

            <div>
              <label style={labelStyle}>Phone *</label>
              <input style={inputStyle} name="phone" value={form.phone} onChange={handleChange} required placeholder="03XX-XXXXXXX" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
            </div>
            <div>
              <label style={labelStyle}>Occupation</label>
              <input style={inputStyle} name="occupation" value={form.occupation} onChange={handleChange} placeholder="e.g. Business, Job" />
            </div>
            <div>
              <label style={labelStyle}>Address</label>
              <input style={inputStyle} name="address" value={form.address} onChange={handleChange} placeholder="Home address" />
            </div>
          </div>

          {/* Marital Status - only for 18+ */}
          {!isUnder18 && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Marital Status *</label>
                <select style={{ ...inputStyle, width: 'auto', minWidth: '200px' }} name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
                  <option>Unmarried</option>
                  <option>Married</option>
                </select>
              </div>

              {form.maritalStatus === 'Married' && (
                <div style={{
                  backgroundColor: 'var(--green-pale)',
                  padding: '1rem',
                  borderRadius: 'var(--radius)',
                  marginBottom: '1rem',
                  border: '1px solid var(--green-border)',
                }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>👨‍👩‍👧 Family Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Wife's Name</label>
                      <input style={inputStyle} name="wifeName" value={form.wifeName} onChange={handleChange} placeholder="Wife's name" />
                    </div>
                    <div>
                      <label style={labelStyle}>Wife's CNIC</label>
                      <input style={inputStyle} name="wifeCnic" value={form.wifeCnic} onChange={handleChange} placeholder="42101-1234567-1" />
                    </div>
                  </div>

                  {/* Children */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={labelStyle}>Children ({children.length})</label>
                      <button type="button" onClick={addChild} style={{
                        backgroundColor: 'var(--green-main)',
                        color: 'white',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}>+ Add Child</button>
                    </div>
                    {children.map((child, index) => (
                      <div key={index} style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        alignItems: 'center',
                      }}>
                        <input style={inputStyle} placeholder="Child's name" value={child.name} onChange={(e) => updateChild(index, 'name', e.target.value)} />
                        <input style={inputStyle} placeholder="Age" type="number" value={child.age} onChange={(e) => updateChild(index, 'age', e.target.value)} />
                        <select style={inputStyle} value={child.gender} onChange={(e) => updateChild(index, 'gender', e.target.value)}>
                          <option>Male</option>
                          <option>Female</option>
                        </select>
                        <input style={inputStyle} placeholder="B-Form (optional)" value={child.bForm} onChange={(e) => updateChild(index, 'bForm', e.target.value)} />
                        <button type="button" onClick={() => removeChild(index)} style={{
                          background: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                        }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" onClick={onCancel} style={{
              padding: '10px 24px',
              border: '1.5px solid var(--green-border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}>Cancel</button>
            <button type="submit" style={{
              padding: '10px 24px',
              backgroundColor: 'var(--green-main)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
            }}>✅ Add Member</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;