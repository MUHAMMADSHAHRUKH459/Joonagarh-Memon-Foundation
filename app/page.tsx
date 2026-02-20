'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import MemberForm from '@/components/MemberForm';
import MemberTable from '@/components/MemberTable';
import { supabase } from '@/lib/supabaseClient';
import { calculateAge, getCategory, isVotingEligible, formatDate } from '@/utils/helpers';

export default function Home() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch members from Supabase
  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching members:', error);
    } else {
      // Check for birthday notifications
      const newNotifications: string[] = [];
      const updated = await Promise.all((data || []).map(async (member) => {
        const age = calculateAge(member.date_of_birth);
        const newCategory = getCategory(age);
        const dob = new Date(member.date_of_birth);
        const today = new Date();
        const isBirthdayToday =
          dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();

        // Auto category transfer
        if (newCategory !== member.category) {
          await supabase.from('members').update({
            category: newCategory,
            voting_eligible: isVotingEligible(age),
            age,
          }).eq('id', member.id);

          // Save notification to Supabase
          if (isBirthdayToday && age === 18) {
            await supabase.from('notifications').insert([{
              message: `🎉 ${member.name} (${member.id}) is now 18 years old - moved to Adult category!`,
              type: 'adult',
            }]);
            newNotifications.push(`🎉 ${member.name} is now 18 - moved to Adult category!`);
          }
          if (isBirthdayToday && age === 60) {
            await supabase.from('notifications').insert([{
              message: `🏅 ${member.name} (${member.id}) is now 60 years old - moved to Senior Citizen category!`,
              type: 'senior',
            }]);
            newNotifications.push(`🏅 ${member.name} is now 60 - moved to Senior Citizen category!`);
          }
        }

        return { ...member, age, category: newCategory, votingEligible: isVotingEligible(age) };
      }));
      setMembers(updated);
      if (newNotifications.length > 0) setNotifications(newNotifications);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async (member: any) => {
    const age = calculateAge(member.dateOfBirth);
    const category = getCategory(age);
    const newId = `MEM-${String(members.length + 1).padStart(3, '0')}`;

    const newMember = {
      id: newId,
      name: member.name,
      father_name: member.fatherName,
      member_cast: member.cast,
      date_of_birth: member.dateOfBirth,
      age,
      gender: member.gender,
      cnic: member.cnic || null,
      b_form: member.bForm || null,
      phone: member.phone,
      email: member.email || null,
      address: member.address || null,
      occupation: member.occupation || null,
      marital_status: member.maritalStatus,
      wife_name: member.wifeName || null,
      wife_cnic: member.wifeCnic || null,
      children: member.children || [],
      category,
      voting_eligible: isVotingEligible(age),
      entry_date: formatDate(new Date()),
      fees_paid: {},
    };

    const { error } = await supabase.from('members').insert([newMember]);
    if (error) {
      console.error('Error adding member:', error);
      alert('Error adding member. Please try again.');
    } else {
      // New member notification
      await supabase.from('notifications').insert([{
        message: `👤 New member added: ${newMember.name} (${newMember.id}) - Category: ${category}`,
        type: 'new_member',
      }]);
      await fetchMembers();
      setShowForm(false);
    }
  };

  const under18 = members.filter((m) => m.category === 'under18');
  const adults = members.filter((m) => m.category === 'adult');
  const seniors = members.filter((m) => m.category === 'senior');
  const voters = members.filter((m) => m.voting_eligible);

  const cardStyle = (color: string) => ({
    backgroundColor: 'var(--white)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
    padding: '1.5rem',
    borderTop: `4px solid ${color}`,
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'transform 0.2s',
  });

  return (
    <main>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto' }}>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div style={{
            backgroundColor: '#fff3e0',
            border: '1px solid #ffb74d',
            borderRadius: 'var(--radius)',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
          }}>
            <h4 style={{ color: '#e65100', marginBottom: '0.5rem' }}>🔔 Today's Updates</h4>
            {notifications.map((n, i) => (
              <p key={i} style={{ fontSize: '0.9rem', color: '#e65100' }}>{n}</p>
            ))}
          </div>
        )}

        {/* Top Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <h2 style={{ fontSize: '1.5rem' }}>Members Directory</h2>
          <button
            onClick={() => setShowForm(true)}
            style={{
              backgroundColor: 'var(--green-main)',
              color: 'var(--white)',
              border: 'none',
              padding: '10px 24px',
              borderRadius: 'var(--radius)',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            + Add Member
          </button>
        </div>

        {/* Search */}
        <SearchBar onSearch={(q) => setSearchQuery(q)} />

        {/* 3 Category Boxes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div
            style={cardStyle('#2196f3')}
            onClick={() => router.push('/category/under18')}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ fontSize: '2rem' }}>👦</div>
            <h3 style={{ color: '#1565c0', margin: '0.5rem 0' }}>Under 18</h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1565c0' }}>{under18.length}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>Not eligible to vote</p>
            <p style={{ fontSize: '0.78rem', color: '#1565c0', marginTop: '0.5rem' }}>Click to view →</p>
          </div>

          <div
            style={cardStyle('var(--green-main)')}
            onClick={() => router.push('/category/adult')}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ fontSize: '2rem' }}>🧑</div>
            <h3 style={{ color: 'var(--green-dark)', margin: '0.5rem 0' }}>Adults (18+)</h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-dark)' }}>{adults.length}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>Eligible to vote</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--green-main)', marginTop: '0.5rem' }}>Click to view →</p>
          </div>

          <div
            style={cardStyle('#ff9800')}
            onClick={() => router.push('/category/senior')}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ fontSize: '2rem' }}>👴</div>
            <h3 style={{ color: '#e65100', margin: '0.5rem 0' }}>Senior Citizens</h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#e65100' }}>{seniors.length}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>60+ years</p>
            <p style={{ fontSize: '0.78rem', color: '#e65100', marginTop: '0.5rem' }}>Click to view →</p>
          </div>
        </div>

        {/* Voter List Box */}
        <div
          onClick={() => router.push('/voters')}
          style={{
            backgroundColor: 'var(--white)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            borderLeft: '4px solid var(--green-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div>
            <h3 style={{ fontSize: '1rem' }}>🗳️ Voter List</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>Total eligible voters — Click to view all</p>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-main)' }}>{voters.length}</p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-text)' }}>
            Loading members...
          </div>
        )}

        {/* Member Form */}
        {showForm && (
          <MemberForm
            onSubmit={handleAddMember}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* All Members Table */}
        {!loading && (
  <MemberTable
    members={members.filter((m) =>
      searchQuery
        ? m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.cnic?.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )}
  />
)}

      </div>
    </main>
  );
}