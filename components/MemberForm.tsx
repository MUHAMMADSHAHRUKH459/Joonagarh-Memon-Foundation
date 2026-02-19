'use client';

import { useState } from 'react';

interface Child {
  name: string;
  age: string;
  gender: string;
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
  fontWeight: '600',
  color: 'var(--green-dark)',
  marginBottom: '4px',
  display: 'block',
};

const MemberForm = ({ onSubmit, onCancel }: MemberFormProps) => {
  const [form, setForm] = useState({
    name: '',
    fatherName: '',
    dateOfBirth: '',
    age: '',
    gender: 'Male',
    cnic: '',
    phone: '',
    email: '',
    address: '',
    area: '',
    bloodGroup: '',
    occupation: '',
    maritalStatus: 'Unmarried',
    wifeName: '',
    wifeCnic: '',
  });

  const [children, setChildren] = useState<Child[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addChild = () => {
    setChildren([...children, { name: '', age: '', gender: 'Male' }]);
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
    onSubmit({ ...form, age: parseInt(form.age), children });
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
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>➕ New Member Add Karein</h2>

        <form onSubmit={handleSubmit}>

          {/* Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Shahrukh Memon" />
            </div>
            <div>
              <label style={labelStyle}>Father's Name *</label>
              <input style={inputStyle} name="fatherName" value={form.fatherName} onChange={handleChange} required placeholder="Father ka naam" />
            </div>
            <div>
              <label style={labelStyle}>Age *</label>
              <input style={inputStyle} name="age" type="number" value={form.age} onChange={handleChange} required placeholder="e.g. 23" />
            </div>
            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input style={inputStyle} name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
            </div>
            <div>
              <label style={labelStyle}>Gender *</label>
              <select style={inputStyle} name="gender" value={form.gender} onChange={handleChange}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>CNIC *</label>
              <input style={inputStyle} name="cnic" value={form.cnic} onChange={handleChange} required placeholder="42101-1234567-1" />
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
              <label style={labelStyle}>Blood Group</label>
              <select style={inputStyle} name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                  <option key={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Occupation</label>
              <input style={inputStyle} name="occupation" value={form.occupation} onChange={handleChange} placeholder="e.g. Business, Job" />
            </div>
          </div>

          {/* Address */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Address</label>
              <input style={inputStyle} name="address" value={form.address} onChange={handleChange} placeholder="Ghar ka address" />
            </div>
            <div>
              <label style={labelStyle}>Area (Karachi)</label>
              <input style={inputStyle} name="area" value={form.area} onChange={handleChange} placeholder="e.g. Kharadar, Jodia Bazaar" />
            </div>
          </div>

          {/* Marital Status */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Marital Status *</label>
            <select style={{ ...inputStyle, width: 'auto', minWidth: '200px' }} name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
              <option>Unmarried</option>
              <option>Married</option>
            </select>
          </div>

          {/* Married Fields */}
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
                  <input style={inputStyle} name="wifeName" value={form.wifeName} onChange={handleChange} placeholder="Wife ka naam" />
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
                    gridTemplateColumns: '1fr 1fr 1fr auto',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    alignItems: 'center',
                  }}>
                    <input style={inputStyle} placeholder="Child ka naam" value={child.name} onChange={(e) => updateChild(index, 'name', e.target.value)} />
                    <input style={inputStyle} placeholder="Age" type="number" value={child.age} onChange={(e) => updateChild(index, 'age', e.target.value)} />
                    <select style={inputStyle} value={child.gender} onChange={(e) => updateChild(index, 'gender', e.target.value)}>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
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
            }}>✅ Member Add Karein</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default MemberForm;