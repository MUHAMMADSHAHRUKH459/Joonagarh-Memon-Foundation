'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { supabase } from '@/lib/supabaseClient';

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  // ✅ localStorage se initial value seedha lo — useEffect ki zaroorat nahi
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      return true;
    }
    return false;
  });

  // ✅ Dark mode toggle
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

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
    { label: 'Home',      icon: '🏠', path: '/' },
    { label: 'Voters',    icon: '🗳️', path: '/voters' },
    { label: 'History',   icon: '📋', path: '/history' },
    { label: 'Reports',   icon: '📊', path: '/reports' },
    { label: 'Accounts',  icon: '📒', path: '/accounts' },
    { label: 'Broadcast', icon: '📢', path: '/broadcast' },
    { label: 'Funeral',   icon: '🕊️', path: '/funeral' },
    { label: 'Alerts',    icon: '🔔', path: '/notifications' },
  ];

  const navigate = (path: string) => {
    router.push(path);
    setMenuOpen(false);
  };

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname?.startsWith(path);

  return (
    <>
      <style>{`
        .navbar {
          background-color: var(--green-dark);
          padding: 0 1.5rem;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          flex-shrink: 0;
          text-decoration: none;
        }
        .nav-logo-icon {
          width: 34px;
          height: 34px;
          background: rgba(255,255,255,0.12);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .nav-logo-text {
          color: white;
          font-size: 0.88rem;
          font-weight: 700;
          line-height: 1.2;
          max-width: 200px;
        }
        .nav-logo-sub {
          color: rgba(255,255,255,0.5);
          font-size: 0.65rem;
          font-weight: 400;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .nav-link {
          background: transparent;
          color: rgba(255,255,255,0.65);
          border: none;
          cursor: pointer;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 6px 10px;
          border-radius: 8px;
          white-space: nowrap;
          position: relative;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: background 0.15s, color 0.15s;
          letter-spacing: 0.01em;
        }
        .nav-link:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        .nav-link.active {
          background: rgba(255,255,255,0.15);
          color: white;
        }
        .nav-link .nav-icon { font-size: 13px; }
        .nav-badge {
          position: absolute;
          top: 3px;
          right: 3px;
          background: #ef5350;
          color: white;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          font-size: 0.52rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid var(--green-dark);
        }

        .nav-divider {
          width: 1px;
          height: 20px;
          background: rgba(255,255,255,0.12);
          margin: 0 4px;
        }

        .logout-btn {
          background: rgba(198, 40, 40, 0.2);
          color: #ef9a9a;
          border: 1px solid rgba(198,40,40,0.3);
          cursor: pointer;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
          white-space: nowrap;
          margin-left: 4px;
          transition: background 0.15s, color 0.15s;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .logout-btn:hover {
          background: #c62828;
          color: white;
          border-color: #c62828;
        }

        .hamburger {
          display: none;
          background: transparent;
          border: none;
          cursor: pointer;
          color: white;
          padding: 6px;
          border-radius: 8px;
          transition: background 0.15s;
        }
        .hamburger:hover { background: rgba(255,255,255,0.1); }
        .hamburger-icon {
          width: 20px;
          height: 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .hamburger-icon span {
          display: block;
          height: 2px;
          background: white;
          border-radius: 2px;
          transition: all 0.2s;
        }

        /* Mobile menu */
        .mobile-menu {
          display: none;
          background: var(--green-dark);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 0.75rem 1rem;
          position: sticky;
          top: 60px;
          z-index: 99;
        }
        .mobile-menu.open { display: flex; flex-direction: column; gap: 4px; }
        .mobile-link {
          background: transparent;
          color: rgba(255,255,255,0.75);
          border: none;
          cursor: pointer;
          font-size: 0.88rem;
          font-weight: 600;
          padding: 10px 14px;
          border-radius: 8px;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background 0.15s;
        }
        .mobile-link:hover { background: rgba(255,255,255,0.08); color: white; }
        .mobile-link.active { background: rgba(255,255,255,0.12); color: white; }
        .mobile-logout {
          background: rgba(198,40,40,0.15);
          color: #ef9a9a;
          border: none;
          cursor: pointer;
          font-size: 0.88rem;
          font-weight: 600;
          padding: 10px 14px;
          border-radius: 8px;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
          transition: background 0.15s;
        }
        .mobile-logout:hover { background: #c62828; color: white; }
        .mobile-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 4px 0; }

        /* ✅ Floating Dark Mode Button */
        .dark-mode-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 999;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
          transition: background 0.3s, transform 0.2s, box-shadow 0.2s;
          background: var(--green-dark);
          color: white;
        }
        .dark-mode-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0,0,0,0.35);
        }
        .dark-mode-fab:active {
          transform: scale(0.95);
        }

        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
          .nav-logo-text { max-width: 140px; font-size: 0.8rem; }
        }
        @media (min-width: 901px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>

      <nav className="navbar">
        {/* Logo */}
        <div className="nav-logo" onClick={() => navigate('/')}>
          <div className="nav-logo-icon">🕌</div>
          <div>
            <div className="nav-logo-text">Naliya Mandwi Junagadh Muslim Welfare Jamat</div>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="desktop-nav">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`nav-link${isActive(link.path) ? ' active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
              {link.path === '/notifications' && unreadCount > 0 && (
                <span className="nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
          ))}

          <div className="nav-divider" />

          <button className="logout-btn" onClick={() => signOut({ callbackUrl: '/login' })}>
            🔒 Logout
          </button>
        </div>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <div className="hamburger-icon">
            <span style={{ width: menuOpen ? '100%' : '100%' }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span />
          </div>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {navLinks.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`mobile-link${isActive(link.path) ? ' active' : ''}`}
          >
            <span style={{ fontSize: '16px' }}>{link.icon}</span>
            {link.label}
            {link.path === '/notifications' && unreadCount > 0 && (
              <span style={{
                marginLeft: 'auto', background: '#ef5350', color: 'white',
                borderRadius: '20px', padding: '1px 7px', fontSize: '0.65rem', fontWeight: '700',
              }}>{unreadCount}</span>
            )}
          </button>
        ))}
        <div className="mobile-divider" />
        <button className="mobile-logout" onClick={() => signOut({ callbackUrl: '/login' })}>
          🔒 Logout
        </button>
      </div>

      {/* ✅ Floating Dark Mode Toggle Button */}
      <button
        className="dark-mode-fab"
        onClick={toggleDarkMode}
        title={darkMode ? 'Light Mode' : 'Dark Mode'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </>
  );
};

export default Navbar;