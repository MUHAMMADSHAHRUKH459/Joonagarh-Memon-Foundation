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

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching members:', error);
    } else {
      const newNotifications: string[] = [];
      const updated = await Promise.all((data || []).map(async (member) => {
        const age = calculateAge(member.date_of_birth);
        const newCategory = getCategory(age);
        const dob = new Date(member.date_of_birth);
        const today = new Date();
        const isBirthdayToday =
          dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();

        if (newCategory !== member.category) {
          await supabase.from('members').update({
            category: newCategory,
            voting_eligible: isVotingEligible(age),
            age,
          }).eq('id', member.id);

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

        // Birthday notification
        if (isBirthdayToday) {
          const todayStr = today.toISOString().split('T')[0];
          const { data: existingNotif } = await supabase
            .from('notifications')
            .select('id')
            .eq('type', 'birthday')
            .like('message', `%${member.id}%`)
            .gte('created_at', todayStr)
            .single();

          if (!existingNotif) {
            await supabase.from('notifications').insert([{
              message: `🎂 Happy Birthday! ${member.name} (${member.id}) is turning ${age} today!`,
              type: 'birthday',
            }]);
            newNotifications.push(`🎂 ${member.name} is turning ${age} today!`);
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

    // Get last member ID from database
    const { data: allMembers } = await supabase
      .from('members')
      .select('id');

    const lastNum = allMembers && allMembers.length > 0
      ? Math.max(...allMembers.map((m: any) => parseInt(m.id.replace('MEM-', '')) || 0))
      : 0;

    const newId = `MEM-${String(lastNum + 1).padStart(3, '0')}`;

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
      return;
    }

    await supabase.from('notifications').insert([{
      message: `👤 New member added: ${newMember.name} (${newMember.id}) - Category: ${category}`,
      type: 'new_member',
    }]);

    // Auto add children as Under 18 members
    if (member.maritalStatus === 'Married' && member.children && member.children.length > 0) {
      const childrenUnder18 = member.children.filter((c: any) => {
  const childAge = parseInt(c.age);
  return !isNaN(childAge) && childAge < 18;
});

// console.log('Children under 18:', childrenUnder18);
      for (let i = 0; i < childrenUnder18.length; i++) {
        const child = childrenUnder18[i];
        const childNum = lastNum + 2 + i;
        const childId = `MEM-${String(childNum).padStart(3, '0')}`;

        const dobYear = new Date().getFullYear() - parseInt(child.age);
        const childDob = `${dobYear}-06-15`;

        const childMember = {
            id: childId,
            name: child.name,
            father_name: member.name,
            member_cast: member.cast,
            date_of_birth: childDob,
            age: parseInt(child.age),
            gender: child.gender,
            cnic: null,
            b_form: child.bForm || null,
            phone: null,
            email: null,
            address: member.address || null,
            occupation: null,
            marital_status: 'Unmarried',
            wife_name: null,
            wife_cnic: null,
            children: [],
            category: 'under18',
            voting_eligible: false,
            entry_date: formatDate(new Date()),
            fees_paid: {},
            is_child: true,
          };

        const { error: childError } = await supabase.from('members').insert([childMember]);
        if (!childError) {
          await supabase.from('notifications').insert([{
            message: `👦 Child auto-added: ${child.name} (${childId}) - Father: ${member.name}`,
            type: 'new_member',
          }]);
        } else {
          console.error('Child insert error:', childError);
        }
      }
    }

    await fetchMembers();
    setShowForm(false);
  };

  const under18 = members.filter((m) => m.category === 'under18');
  const adults = members.filter((m) => m.category === 'adult');
  const seniors = members.filter((m) => m.category === 'senior');
  const voters = members.filter((m) => m.voting_eligible);
  const jamatMembers = members.filter((m) => m.marital_status === 'Married');

  return (
    <main>
      <Navbar />

      <style>{`
        .category-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        @media (max-width: 768px) {
          .category-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem;
          }
          .page-padding {
            padding: 1rem !important;
          }
          .top-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .add-btn {
            width: 100%;
          }
          .voter-box, .jamat-box {
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
        }
      `}</style>

      <div className="page-padding" style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto' }}>

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
        <div className="top-bar" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <h2 style={{ fontSize: '1.5rem' }}>Members Directory</h2>
          <button
            className="add-btn"
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
        <div className="category-grid">
          {[
            { emoji: '👦', label: 'Under 18', count: under18.length, color: '#2196f3', textColor: '#1565c0', path: '/category/under18', sub: 'Not eligible to vote' },
            { emoji: '🧑', label: 'Adults (18+)', count: adults.length, color: 'var(--green-main)', textColor: 'var(--green-dark)', path: '/category/adult', sub: 'Eligible to vote' },
            { emoji: '👴', label: 'Senior Citizens', count: seniors.length, color: '#ff9800', textColor: '#e65100', path: '/category/senior', sub: '60+ years' },
          ].map((cat) => (
            <div
              key={cat.path}
              onClick={() => router.push(cat.path)}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              style={{
                backgroundColor: 'var(--white)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow)',
                padding: '1.5rem',
                borderTop: `4px solid ${cat.color}`,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
            >
              <div style={{ fontSize: '2rem' }}>{cat.emoji}</div>
              <h3 style={{ color: cat.textColor, margin: '0.5rem 0' }}>{cat.label}</h3>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: cat.textColor }}>{cat.count}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>{cat.sub}</p>
              <p style={{ fontSize: '0.78rem', color: cat.textColor, marginTop: '0.5rem' }}>Click to view →</p>
            </div>
          ))}
        </div>

        {/* Jamat Members Box */}
        <div
          className="jamat-box"
          onClick={() => router.push('/category/jamat')}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          style={{
            backgroundColor: 'var(--white)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            borderLeft: '4px solid #6a1b9a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1rem', color: '#6a1b9a' }}>👨‍👩‍👧‍👦 Jamat Members</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>Married members — Click to view all</p>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#6a1b9a' }}>{jamatMembers.length}</p>
        </div>

        {/* Voter List Box */}
        <div
          className="voter-box"
          onClick={() => router.push('/voters')}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
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