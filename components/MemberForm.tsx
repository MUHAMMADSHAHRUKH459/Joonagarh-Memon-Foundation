'use client';

import { useState } from 'react';

interface Child {
  name: string;
  dob: string;
  gender: string;
  bForm: string;
}

interface Wife {
  name: string;
  cnic: string;
  dob: string;
}

interface MemberFormData {
  name: string;
  fatherName: string;
  cast: string;
  dateOfBirth: string;
  gender: string;
  cnic: string;
  bForm: string;
  phone: string;
  email: string;
  address: string;
  occupation: string;
  maritalStatus: string;
  // Male fields
  wives: Wife[];
  // Female fields
  husbandName: string;
  husbandCnic: string;
  husbandDob: string;
  children: Child[];
}

interface MemberFormProps {
  onSubmit: (member: MemberFormData) => void;
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
  boxSizing: 'border-box' as const,
};

const labelStyle = {
  fontSize: '0.85rem',
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
    husbandName: '',
    husbandCnic: '',
    husbandDob: '',
  });

  const [wives, setWives] = useState<Wife[]>([{ name: '', cnic: '', dob: '' }]);
  const [children, setChildren] = useState<Child[]>([]);

  const age = getAgeFromDob(form.dateOfBirth);
  const isUnder18 = age < 18 && age > 0;
  const isMale = form.gender === 'Male';
  const isFemale = form.gender === 'Female';
  const isMarried = form.maritalStatus === 'Married';
  const isWidow = form.maritalStatus === 'Widow';
  const showFamilySection = !isUnder18 && (isMarried || isWidow);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      // Gender change hone par marital status reset
      if (name === 'gender') updated.maritalStatus = 'Unmarried';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, wives, children });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <style>{`
        .member-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .spouse-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
        }
        .wife-card {
          background: var(--white);
          border: 1px solid var(--green-border);
          border-radius: var(--radius);
          padding: 0.85rem;
          margin-bottom: 0.75rem;
        }
        .child-row {
          background: var(--white);
          border: 1px solid var(--green-border);
          border-radius: var(--radius);
          padding: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .child-row-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr auto;
          gap: 0.5rem;
          align-items: end;
        }
        .child-age-badge { margin-top: 0.5rem; }
        @media (max-width: 768px) {
          .spouse-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .member-form-grid { grid-template-columns: 1fr; }
          .spouse-grid { grid-template-columns: 1fr; }
          .child-row-grid { grid-template-columns: 1fr 1fr; }
          .child-row-grid .child-name   { grid-column: 1 / 3; }
          .child-row-grid .child-dob    { grid-column: 1 / 3; }
          .child-row-grid .child-gender { grid-column: 1 / 2; }
          .child-row-grid .child-bform  { grid-column: 2 / 3; }
          .child-row-grid .child-remove { grid-column: 1 / 3; justify-self: end; }
        }
      `}</style>

      <div style={{
        backgroundColor: 'var(--white)', borderRadius: 'var(--radius)', padding: '2rem',
        width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>➕ Add New Member</h2>

        {/* Age Preview */}
        {form.dateOfBirth && (
          <div style={{
            backgroundColor: isUnder18 ? '#e3f2fd' : 'var(--green-pale)',
            border: `1px solid ${isUnder18 ? '#90caf9' : 'var(--green-border)'}`,
            borderRadius: '8px', padding: '10px 16px', marginBottom: '1rem',
            fontSize: '0.9rem', fontWeight: '600',
            color: isUnder18 ? '#1565c0' : 'var(--green-dark)',
          }}>
            {isUnder18 ? `👦 Age: ${age} — Under 18 Category (B-Form required)`
              : age >= 60 ? `👴 Age: ${age} — Senior Citizen Category`
              : `🧑 Age: ${age} — Adult Category`}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="member-form-grid">
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Shahrukh Memon" />
            </div>
            <div>
              <label style={labelStyle}>Father&apos;s Name *</label>
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

          {/* Marital Status */}
          {!isUnder18 && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Marital Status *</label>
                <select
                  style={{ ...inputStyle, width: 'auto', minWidth: '200px' }}
                  name="maritalStatus"
                  value={form.maritalStatus}
                  onChange={handleChange}
                >
                  <option>Unmarried</option>
                  <option>Married</option>
                  {isFemale && <option>Widow</option>}
                </select>
              </div>

              {/* ═══ FAMILY SECTION ═══ */}
              {showFamilySection && (
                <div style={{
                  backgroundColor: 'var(--green-pale)', padding: '1rem',
                  borderRadius: 'var(--radius)', marginBottom: '1rem',
                  border: '1px solid var(--green-border)',
                }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                    {isMale ? '👨‍👩‍👧 Family Details' : isWidow ? '🕊️ Late Husband Details' : '👫 Husband Details'}
                  </h3>

                  {/* ── MALE: Multiple Wives ── */}
                  {isMale && isMarried && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <label style={labelStyle}>
                          Wives ({wives.length})
                        </label>
                        <button
                          type="button"
                          onClick={addWife}
                          style={{
                            backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
                            padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                            fontSize: '0.85rem', fontWeight: '600',
                          }}
                        >+ Add Wife</button>
                      </div>

                      {wives.map((wife, index) => (
                        <div key={index} className="wife-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--green-dark)' }}>
                              👩 Wife {index + 1}
                            </span>
                            {wives.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeWife(index)}
                                style={{
                                  background: '#ff4444', color: 'white', border: 'none',
                                  borderRadius: '6px', padding: '3px 10px',
                                  cursor: 'pointer', fontSize: '0.78rem',
                                }}
                              >✕ Remove</button>
                            )}
                          </div>
                          <div className="spouse-grid">
                            <div>
                              <label style={{ ...labelStyle, fontSize: '0.78rem' }}>Name</label>
                              <input
                                style={inputStyle}
                                placeholder="Wife's name"
                                value={wife.name}
                                onChange={e => updateWife(index, 'name', e.target.value)}
                              />
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '0.78rem' }}>CNIC</label>
                              <input
                                style={inputStyle}
                                placeholder="42101-1234567-1"
                                value={wife.cnic}
                                onChange={e => updateWife(index, 'cnic', e.target.value)}
                              />
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: '0.78rem' }}>Date of Birth</label>
                              <input
                                style={inputStyle}
                                type="date"
                                value={wife.dob}
                                onChange={e => updateWife(index, 'dob', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── FEMALE: Husband Details (Married or Widow) ── */}
                  {isFemale && (isMarried || isWidow) && (
                    <div style={{ marginBottom: '1rem' }}>
                      {isWidow && (
                        <div style={{
                          backgroundColor: '#f3e5f5', border: '1px solid #ce93d8',
                          borderRadius: '8px', padding: '8px 12px', marginBottom: '0.75rem',
                          fontSize: '0.8rem', color: '#6a1b9a', fontWeight: '600',
                        }}>
                          🕊️ Widow — Please enter late husband&apos;s details
                        </div>
                      )}
                      <div className="spouse-grid">
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.78rem' }}>
                            {isWidow ? 'Late Husband\'s Name' : 'Husband\'s Name'}
                          </label>
                          <input
                            style={inputStyle}
                            name="husbandName"
                            value={form.husbandName}
                            onChange={handleChange}
                            placeholder="Husband's name"
                          />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.78rem' }}>
                            {isWidow ? 'Late Husband\'s CNIC' : 'Husband\'s CNIC'}
                          </label>
                          <input
                            style={inputStyle}
                            name="husbandCnic"
                            value={form.husbandCnic}
                            onChange={handleChange}
                            placeholder="42101-1234567-1"
                          />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.78rem' }}>
                            {isWidow ? 'Late Husband\'s DOB' : 'Husband\'s Date of Birth'}
                          </label>
                          <input
                            style={inputStyle}
                            name="husbandDob"
                            type="date"
                            value={form.husbandDob}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Children (Male married OR Female widow) ── */}
                  {((isMale && isMarried) || (isFemale && isWidow)) && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <label style={labelStyle}>Children ({children.length})</label>
                        <button
                          type="button"
                          onClick={addChild}
                          style={{
                            backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
                            padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                            fontSize: '0.85rem', fontWeight: '600',
                          }}
                        >+ Add Child</button>
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
                                <input style={inputStyle} placeholder="Optional" value={child.bForm}
                                  onChange={e => updateChild(index, 'bForm', e.target.value)} />
                              </div>
                              <div className="child-remove" style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <button type="button" onClick={() => removeChild(index)}
                                  style={{ background: '#ff4444', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 12px', cursor: 'pointer', fontSize: '0.9rem' }}>✕</button>
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
                                  fontSize: '0.78rem', fontWeight: '700',
                                }}>
                                  {childIsUnder18 ? `👦 Age: ${childAge} — Under 18 (Child Category)` : `🧑 Age: ${childAge} — Adult`}
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
            </>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={onCancel} style={{
              padding: '10px 24px', border: '1.5px solid var(--green-border)',
              borderRadius: 'var(--radius)', backgroundColor: 'transparent',
              cursor: 'pointer', fontSize: '0.95rem',
            }}>Cancel</button>
            <button type="submit" style={{
              padding: '10px 24px', backgroundColor: 'var(--green-main)',
              color: 'white', border: 'none', borderRadius: 'var(--radius)',
              cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600',
            }}>✅ Add Member</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;