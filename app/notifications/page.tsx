'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setNotifications(data || []);
    setLoading(false);
  };

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    if (type === 'adult') return '🧑';
    if (type === 'senior') return '👴';
    if (type === 'new_member') return '👤';
    return '🔔';
  };

  const getBg = (type: string, read: boolean) => {
    if (read) return 'var(--white)';
    if (type === 'adult') return '#e8f5ee';
    if (type === 'senior') return '#fff3e0';
    if (type === 'new_member') return '#e3f2fd';
    return '#f5f5f5';
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
                {unreadCount} unread notifications
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
              }}>✅ Mark All Read</button>
            )}
            {notifications.length > 0 && (
              <button onClick={deleteAll} style={{
                backgroundColor: '#ef5350', color: 'white', border: 'none',
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
              }}>🗑️ Clear All</button>
            )}
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-text)' }}>
            Loading notifications...
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div style={{
            backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
            padding: '3rem', textAlign: 'center', color: 'var(--gray-text)', boxShadow: 'var(--shadow)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
            <h3>No notifications yet</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Notifications will appear here when members change categories
            </p>
          </div>
        )}

        {!loading && notifications.map((n) => (
          <div key={n.id} style={{
            backgroundColor: getBg(n.type, n.read),
            borderRadius: 'var(--radius)',
            padding: '1rem 1.5rem',
            marginBottom: '0.75rem',
            boxShadow: 'var(--shadow)',
            border: n.read ? '1px solid #e0e0e0' : '1px solid var(--green-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <span style={{ fontSize: '1.8rem' }}>{getIcon(n.type)}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.95rem', fontWeight: n.read ? '400' : '600', color: 'var(--text-dark)' }}>
                {n.message}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--gray-text)', marginTop: '4px' }}>
                {new Date(n.created_at).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            {!n.read && (
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                backgroundColor: 'var(--green-main)', flexShrink: 0,
              }} />
            )}
          </div>
        ))}

      </div>
    </main>
  );
}