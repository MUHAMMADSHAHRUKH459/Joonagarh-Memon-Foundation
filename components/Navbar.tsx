import React from 'react';

const Navbar = () => {
  return (
    <nav style={{
      backgroundColor: 'var(--green-dark)',
      padding: '0 2rem',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Left - Logo & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          backgroundColor: 'var(--green-light)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
        }}>
          🕌
        </div>
        <div>
          <h1 style={{ color: 'var(--white)', fontSize: '1.2rem', lineHeight: 1 }}>
            Memon Welfare
          </h1>
          <p style={{ color: 'var(--green-border)', fontSize: '0.75rem' }}>
            Community Database
          </p>
        </div>
      </div>

      {/* Right - Info */}
      <div style={{ color: 'var(--green-border)', fontSize: '0.85rem' }}>
        Karachi Chapter
      </div>
    </nav>
  );
};

export default Navbar;