'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { supabase } from '@/lib/supabaseClient';

const Navbar = () => {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const navLinks = [
    { label: '🏠 Home', path: '/' },
    { label: '🗳️ Voters', path: '/voters' },
    { label: '📋 History', path: '/history' },
    { label: '📊 Reports', path: '/reports' },
    { label: '🕊️ Funeral', path: '/funeral' },
    { label: '🔔 Alerts', path: '/notifications' },
  ];

  const navigate = (path: string) => {
    router.push(path);
    setMenuOpen(false);
  };

  return (
    <>
      <nav style={{
        backgroundColor: 'var(--green-dark)',
        padding: '0 1.5rem',
        height: '65px',
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
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '38px', height: '38px',
            backgroundColor: 'var(--green-light)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0,
          }}>🕌</div>
          <div>
            <h1 style={{ color: 'var(--white)', fontSize: '1rem', lineHeight: 1 }}>Memon Welfare</h1>
            <p style={{ color: 'var(--green-border)', fontSize: '0.68rem' }}>Karachi Chapter</p>
          </div>
        </div>

        {/* Desktop Links */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.25rem',
        }} className="desktop-nav">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--green-border)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: '600',
                padding: '6px 10px',
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                position: 'relative',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {link.label}
              {link.path === '/notifications' && unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '2px', right: '4px',
                  backgroundColor: '#ef5350', color: 'white',
                  borderRadius: '50%', width: '14px', height: '14px',
                  fontSize: '0.55rem', fontWeight: '700',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{unreadCount}</span>
              )}
            </button>
          ))}

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{
              backgroundColor: '#c62828', color: 'white', border: 'none',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600',
              padding: '6px 14px', borderRadius: '8px', whiteSpace: 'nowrap',
              marginLeft: '0.5rem',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b71c1c')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#c62828')}
          >
            🔒 Logout
          </button>
        </div>

        {/* Hamburger - Mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="hamburger"
          style={{
            backgroundColor: 'transparent',
            border: 'none', cursor: 'pointer',
            color: 'white', fontSize: '1.5rem',
            padding: '4px 8px',
            display: 'none',
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          backgroundColor: 'var(--green-dark)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          position: 'sticky',
          top: '65px',
          zIndex: 99,
        }} className="mobile-menu">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: 'white', border: 'none',
                cursor: 'pointer', fontSize: '0.95rem',
                fontWeight: '600', padding: '12px 16px',
                borderRadius: '8px', textAlign: 'left',
              }}
            >
              {link.label}
              {link.path === '/notifications' && unreadCount > 0 && ` (${unreadCount})`}
            </button>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{
              backgroundColor: '#c62828', color: 'white', border: 'none',
              cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600',
              padding: '12px 16px', borderRadius: '8px', textAlign: 'left',
            }}
          >
            🔒 Logout
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;