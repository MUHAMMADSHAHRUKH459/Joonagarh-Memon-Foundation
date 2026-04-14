'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';

interface Notification {
  id: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

// Birthday message se name extract karo
const extractBirthdayInfo = (message: string): { name: string; phone: string | null } => {
  // Message format: "🎂 Happy Birthday! Ahmed Khan (MEM-001) is turning 25 today!"
  const nameMatch = message.match(/Happy Birthday!\s+(.+?)\s+\(/);
  const name = nameMatch ? nameMatch[1] : '';
  return { name, phone: null };
};

// WP birthday wish message generate karo
const generateWpMessage = (name: string): string => {
  const msg =
    `🎂 *Birthday Mubarak!*\n\n` +
    `Assalamu Alaikum ${name} bhai,\n\n` +
    `Aaj aapka birthday hai — Naliya Mandwi Junagadh Muslim Welfare Jamat ki taraf se aapko dil ki gehraiyion se mubarak ho! 🎉\n\n` +
    `Allah Taala aapko sehat, khushi aur kamyabi ata farmaye. Ameen.\n\n` +
    `_— Naliya Mandwi Junagadh Muslim Welfare Jamat_`;
  return msg;
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ useCallback se pehle declare karo
  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setNotifications(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => { if (isMounted) await fetchNotifications(); };
    load();
    return () => { isMounted = false; };
  }, [fetchNotifications]);

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('read', false);
    fetchNotifications();
  };

  const deleteAll = async () => {
    if (confirm('Are you sure you want to delete all notifications?')) {
      await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      fetchNotifications();
    }
  };

  const sendBirthdayWish = (message: string, phone: string | null) => {
    const { name } = extractBirthdayInfo(message);
    const wpMsg = generateWpMessage(name);
    const phoneNum = phone ? phone.replace(/[^0-9]/g, '') : '';
    const url = phoneNum
      ? `https://wa.me/92${phoneNum.replace(/^0/, '')}?text=${encodeURIComponent(wpMsg)}`
      : `https://wa.me/?text=${encodeURIComponent(wpMsg)}`;
    window.open(url, '_blank');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    if (type === 'adult') return '🧑';
    if (type === 'senior') return '👴';
    if (type === 'new_member') return '👤';
    if (type === 'birthday') return '🎂';
    if (type === 'deleted') return '🗑️';
    return '🔔';
  };

  const getBg = (type: string, read: boolean) => {
    if (read) return 'var(--white)';
    if (type === 'adult') return '#e8f5ee';
    if (type === 'senior') return '#fff3e0';
    if (type === 'new_member') return '#e3f2fd';
    if (type === 'birthday') return '#fce4ec';
    return '#f5f5f5';
  };

  const getBorderColor = (type: string, read: boolean) => {
    if (read) return '#e0e0e0';
    if (type === 'birthday') return '#f48fb1';
    return 'var(--green-border)';
  };

  return (
    <main>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>

        <button onClick={() => router.back()} style={{
          backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
          fontSize: '0.95rem', marginBottom: '1.5rem', fontWeight: '600',
        }}>← Back</button>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>🔔 Notifications</h2>
            {unreadCount > 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--green-main)', fontWeight: '600' }}>
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: '600',
              }}>✅ Mark All Read</button>
            )}
            {notifications.length > 0 && (
              <button onClick={deleteAll} style={{
                backgroundColor: '#ef5350', color: 'white', border: 'none',
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: '600',
              }}>🗑️ Clear All</button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-text)' }}>
            Loading notifications...
          </div>
        )}

        {/* Empty */}
        {!loading && notifications.length === 0 && (
          <div style={{
            backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
            padding: '3rem', textAlign: 'center', color: 'var(--gray-text)', boxShadow: 'var(--shadow)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
            <h3>No notifications yet</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Notifications will appear here when members change categories or have birthdays
            </p>
          </div>
        )}

        {/* Notification List */}
        {!loading && notifications.map((n) => {
          const isBirthday = n.type === 'birthday';
          const { name } = isBirthday ? extractBirthdayInfo(n.message) : { name: '' };

          return (
            <div key={n.id} style={{
              backgroundColor: getBg(n.type, n.read),
              borderRadius: 'var(--radius)',
              padding: '1rem 1.25rem',
              marginBottom: '0.75rem',
              boxShadow: 'var(--shadow)',
              border: `1px solid ${getBorderColor(n.type, n.read)}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{getIcon(n.type)}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.92rem',
                    fontWeight: n.read ? '400' : '600',
                    color: 'var(--text-dark)',
                    marginBottom: '4px',
                  }}>
                    {n.message}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-text)' }}>
                    {new Date(n.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>

                  {/* ✅ Birthday WP button */}
                  {isBirthday && (
                    <button
                      onClick={() => sendBirthdayWish(n.message, null)}
                      style={{
                        marginTop: '10px',
                        backgroundColor: '#25d366',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      📱 WhatsApp Birthday Wish — {name}
                    </button>
                  )}
                </div>

                {!n.read && (
                  <div style={{
                    width: '9px', height: '9px', borderRadius: '50%',
                    backgroundColor: 'var(--green-main)', flexShrink: 0, marginTop: '4px',
                  }} />
                )}
              </div>
            </div>
          );
        })}

      </div>
    </main>
  );
}