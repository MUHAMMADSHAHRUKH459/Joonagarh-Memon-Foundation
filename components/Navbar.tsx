'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { supabase } from '@/lib/supabaseClient';

// Jamat ka logo (isi file mai embed hai)
const NAV_LOGO = 'data:image/webp;base64,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';

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
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
    { label: 'Home',          icon: '🏠', path: '/' },
    { label: 'Voters',        icon: '🗳️', path: '/voters' },
    { label: 'History',       icon: '📋', path: '/history' },
    { label: 'Reports',       icon: '📊', path: '/reports' },
    { label: 'Accounts',      icon: '📒', path: '/accounts' },
    { label: 'Broadcast',     icon: '📢', path: '/broadcast' },
    { label: 'Funeral',       icon: '🕊️', path: '/funeral' },
    { label: 'Alerts',        icon: '🔔', path: '/notifications' },
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
          width: 46px;
          height: 46px;
          object-fit: contain;
          flex-shrink: 0;
          display: block;
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
        .nav-link .nav-icon {
          font-size: 13px;
        }
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="nav-logo-icon" src={NAV_LOGO} alt="Jamat Logo" />
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
    </>
  );
};

export default Navbar;