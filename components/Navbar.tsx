'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const Navbar = () => {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);
      setUnreadCount(count || 0);
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const btnStyle = {
    backgroundColor: 'transparent',
    color: 'var(--green-border)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    padding: '6px 12px',
    borderRadius: '8px',
  };

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
      {/* Left - Logo */}
      <div
        onClick={() => router.push('/')}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
      >
        <div style={{
          width: '42px', height: '42px',
          backgroundColor: 'var(--green-light)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px',
        }}>🕌</div>
        <div>
          <h1 style={{ color: 'var(--white)', fontSize: '1.2rem', lineHeight: 1 }}>Memon Welfare</h1>
          <p style={{ color: 'var(--green-border)', fontSize: '0.75rem' }}>Community Database</p>
        </div>
      </div>

      {/* Right - Nav Links */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button style={btnStyle} onClick={() => router.push('/')}>🏠 Home</button>
        <button style={btnStyle} onClick={() => router.push('/voters')}>🗳️ Voters</button>
        <button style={btnStyle} onClick={() => router.push('/history')}>📋 History</button>
        <button
          onClick={() => router.push('/notifications')}
          style={{
            ...btnStyle,
            position: 'relative',
          }}
        >
          🔔 Alerts
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#ef5350',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '0.65rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>{unreadCount}</span>
          )}
        </button>
        <button
          onClick={() => router.push('/funeral')}
          style={{
            backgroundColor: '#1a1a1a',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            padding: '6px 16px',
            borderRadius: '8px',
          }}
        >
          🕊️ Funeral
        </button>
        <div style={{ color: 'var(--green-border)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
          Karachi Chapter
        </div>
      </div>
    </nav>
  );
};

export default Navbar;