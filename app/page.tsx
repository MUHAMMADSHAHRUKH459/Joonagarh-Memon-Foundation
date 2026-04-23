'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import MemberForm from '@/components/MemberForm';
import { supabase } from '@/lib/supabaseClient';
import { calculateAge, getCategory, isVotingEligible, formatDate } from '@/utils/helpers';

interface ChildData {
  name: string;
  dob: string;
  gender: string;
  bForm?: string;
}

interface WifeData {
  name: string;
  cnic: string;
  dob: string;
}

interface MemberFormData {
  name: string;
  fatherName: string;
  cast: string;
  dateOfBirth: string;
  gender: string;
  cnic?: string;
  bForm?: string;
  phone: string;
  email?: string;
  address?: string;
  occupation?: string;
  maritalStatus: string;
  wives: WifeData[];
  husbandName?: string;
  husbandCnic?: string;
  husbandDob?: string;
  children: ChildData[];
}

interface MemberRow {
  id: string;
  name: string;
  father_name: string;
  member_cast: string;
  date_of_birth: string;
  age: number;
  gender: string;
  cnic: string | null;
  b_form: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  occupation: string | null;
  marital_status: string;
  wives: WifeData[];
  husband_name: string | null;
  husband_cnic: string | null;
  husband_dob: string | null;
  children: ChildData[];
  category: string;
  voting_eligible: boolean;
  entry_date: string;
  fees_paid: Record<string, unknown>;
  is_child: boolean;
  created_at: string;
}

const getAgeFromDob = (dob: string): number => {
  if (!dob) return 0;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

// ✅ Child ki age ke hisaab se category decide karo
const getChildCategory = (age: number): string => {
  if (age < 18) return 'under18';
  if (age >= 60) return 'senior';
  return 'adult';
};

// ✅ Widow category decide karo — age bhi consider karo
const getFinalCategory = (age: number, gender: string, maritalStatus: string): string => {
  if (maritalStatus === 'Widow' && gender === 'Female') return 'widow';
  return getCategory(age);
};

export default function Home() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching members:', error);
    } else {
      const newNotifications: string[] = [];
      const updated = await Promise.all((data || []).map(async (member: MemberRow) => {
        const age = calculateAge(member.date_of_birth);
        const dob = new Date(member.date_of_birth);
        const today = new Date();
        const isBirthdayToday = dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();

        // Widow category preserve karo — auto update na karo
        const isWidow = member.marital_status === 'Widow' && member.gender === 'Female';
        const newCategory = isWidow ? 'widow' : getCategory(age);

        if (newCategory !== member.category) {
          await supabase.from('members').update({
            category: newCategory,
            voting_eligible: isVotingEligible(age),
            age,
          }).eq('id', member.id);

          if (isBirthdayToday && age === 18) {
            await supabase.from('notifications').insert([{
              message: `🎉 ${member.name} (${member.id}) is now 18 - moved to Adult category!`,
              type: 'adult',
            }]);
            newNotifications.push(`🎉 ${member.name} is now 18 - moved to Adult category!`);
          }
          if (isBirthdayToday && age === 60) {
            await supabase.from('notifications').insert([{
              message: `🏅 ${member.name} (${member.id}) is now 60 - moved to Senior Citizen!`,
              type: 'senior',
            }]);
            newNotifications.push(`🏅 ${member.name} is now 60 - moved to Senior Citizen!`);
          }
        }

        if (isBirthdayToday) {
          const todayStr = today.toISOString().split('T')[0];
          const { data: existingNotif } = await supabase
            .from('notifications').select('id').eq('type', 'birthday')
            .like('message', `%${member.id}%`).gte('created_at', todayStr).single();
          if (!existingNotif) {
            await supabase.from('notifications').insert([{
              message: `🎂 Happy Birthday! ${member.name} (${member.id}) is turning ${age} today!`,
              type: 'birthday',
            }]);
            newNotifications.push(`🎂 ${member.name} is turning ${age} today!`);
          }
        }

        return { ...member, age, category: newCategory, voting_eligible: isVotingEligible(age) };
      }));
      setMembers(updated);
      if (newNotifications.length > 0) setNotifications(newNotifications);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => { if (isMounted) await fetchMembers(); };
    load();
    return () => { isMounted = false; };
  }, [fetchMembers]);

  const handleAddMember = async (member: MemberFormData) => {
    const age = calculateAge(member.dateOfBirth);
    // ✅ Widow category correctly set karo
    const finalCategory = getFinalCategory(age, member.gender, member.maritalStatus);

    const { data: allMembers } = await supabase.from('members').select('id');
    const lastNum = allMembers && allMembers.length > 0
      ? Math.max(...allMembers.map((m: { id: string }) => parseInt(m.id.replace('MEM-', '')) || 0))
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
      wives: member.wives || [],
      husband_name: member.husbandName || null,
      husband_cnic: member.husbandCnic || null,
      husband_dob: member.husbandDob || null,
      children: member.children || [],
      category: finalCategory,
      voting_eligible: isVotingEligible(age),
      entry_date: formatDate(new Date()),
      fees_paid: {},
    };

    const { error } = await supabase.from('members').insert([newMember]);
    if (error) { alert('Error adding member. Please try again.'); return; }

    await supabase.from('notifications').insert([{
      message: `👤 New member added: ${newMember.name} (${newMember.id}) - Category: ${finalCategory}`,
      type: 'new_member',
    }]);

    // ✅ FIX: Married ya Widow dono ke children save karo — sirf under18 nahi, SARE valid children
    const hasChildren = (member.maritalStatus === 'Married' || member.maritalStatus === 'Widow')
      && member.children && member.children.length > 0;

    if (hasChildren) {
      // ✅ FIX: Sirf under18 filter nahi — dob wale SARE children lo
      const validChildren = member.children.filter((c: ChildData) => c.dob !== '' && c.name !== '');

      for (let i = 0; i < validChildren.length; i++) {
        const child = validChildren[i];
        const childId = `MEM-${String(lastNum + 2 + i).padStart(3, '0')}`;
        const childAge = getAgeFromDob(child.dob);

        // ✅ FIX: Child ki age ke hisaab se sahi category aur voting eligibility set karo
        const childCategory = getChildCategory(childAge);
        const childVotingEligible = childAge >= 18;

        // ✅ FIX: Widow ka child ho to father_name = husband ka naam, warna member ka naam
        const childFatherName = member.gender === 'Female'
          ? (member.husbandName || member.name)
          : member.name;

        const childMember = {
          id: childId,
          name: child.name,
          father_name: childFatherName,
          member_cast: member.cast,
          date_of_birth: child.dob,
          age: childAge,
          gender: child.gender,
          cnic: null,
          b_form: child.bForm || null,
          phone: null,
          email: null,
          address: member.address || null,
          occupation: null,
          marital_status: 'Unmarried',
          wives: [],
          husband_name: null,
          husband_cnic: null,
          husband_dob: null,
          children: [],
          category: childCategory,           // ✅ under18 / adult / senior — age ke hisaab se
          voting_eligible: childVotingEligible, // ✅ 18+ ho to eligible
          entry_date: formatDate(new Date()),
          fees_paid: {},
          is_child: true,
        };

        const { error: childError } = await supabase.from('members').insert([childMember]);
        if (!childError) {
          await supabase.from('notifications').insert([{
            message: `👦 Child auto-added: ${child.name} (${childId}) - Parent: ${member.name} - Category: ${childCategory}`,
            type: 'new_member',
          }]);
        }
      }
    }

    await fetchMembers();
    setShowForm(false);
  };

  // ✅ Stats — widow alag count, 60+ widow senior mein bhi count
  const visibleMembers = members.filter(m => !m.is_child);
  const under18Direct = members.filter(m => m.category === 'under18');
  const familyChildrenUnder18 = members
    .filter(m => !m.is_child && m.children && m.children.length > 0)
    .flatMap(m => m.children)
    .filter((c: ChildData) => c.dob !== '' && getAgeFromDob(c.dob) < 18);
  const existingChildNames = new Set(members.filter(m => m.is_child).map(m => m.name.toLowerCase()));
  const unregisteredChildren = familyChildrenUnder18.filter(c => !existingChildNames.has(c.name.toLowerCase()));
  const under18Count = under18Direct.length + unregisteredChildren.length;

  const adults = members.filter(m => m.category === 'adult');
  // ✅ Senior: age 60+ wale — chahe widow ho ya na ho
  const seniors = members.filter(m => m.age >= 60);
  // ✅ Widow: sirf widow category
  const widows = members.filter(m => m.category === 'widow');
  const voters = members.filter(m => m.voting_eligible);
  const jamatMembers = members.filter(m => m.marital_status === 'Married' && !m.is_child);
  const totalVisible = visibleMembers.length;

  const filteredMembers = visibleMembers.filter(m =>
    searchQuery
      ? m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.cnic?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      : true
  );

  return (
    <main>
      <Navbar />

      <style>{`
        .dash-wrap { padding: 2rem; max-width: 1300px; margin: 0 auto; }

        .stats-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 1.5rem; }
        .stat-card { background: var(--green-pale); border-radius: var(--radius); padding: 1rem; }
        .stat-label { font-size: 0.75rem; color: var(--gray-text); margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .stat-value { font-size: 1.8rem; font-weight: 700; color: var(--text-dark); line-height: 1; }
        .stat-badge { display: inline-block; font-size: 0.7rem; padding: 2px 8px; border-radius: 20px; margin-top: 6px; font-weight: 600; }

        .cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 1.2rem; }
        .cat-card { background: var(--white); border: 1px solid var(--green-border); border-radius: var(--radius); padding: 1.1rem 1.25rem; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
        .cat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
        .cat-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .cat-icon { width: 36px; height: 36px; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
        .cat-count { font-size: 2rem; font-weight: 700; color: var(--text-dark); }
        .cat-label { font-size: 0.88rem; font-weight: 600; color: var(--text-dark); }
        .cat-sub { font-size: 0.75rem; color: var(--gray-text); margin-top: 2px; }
        .cat-bar { height: 3px; border-radius: 2px; margin-top: 12px; background: var(--green-border); }
        .cat-bar-fill { height: 100%; border-radius: 2px; }
        .cat-link { font-size: 0.72rem; color: var(--green-main); margin-top: 8px; font-weight: 600; }

        .quick-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 1.5rem; }
        .quick-card { background: var(--white); border: 1px solid var(--green-border); border-radius: var(--radius); padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: transform 0.15s; }
        .quick-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
        .quick-left { display: flex; align-items: center; gap: 12px; }
        .quick-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .quick-title { font-size: 0.9rem; font-weight: 600; color: var(--text-dark); }
        .quick-sub { font-size: 0.75rem; color: var(--gray-text); margin-top: 2px; }
        .quick-num { font-size: 1.6rem; font-weight: 700; }

        .table-card { background: var(--white); border: 1px solid var(--green-border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); }
        .table-head { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid var(--green-border); }
        .table-title { font-size: 0.95rem; font-weight: 700; color: var(--text-dark); }
        .tbl-count { font-size: 0.78rem; color: var(--gray-text); margin-left: 6px; }
        table { width: 100%; border-collapse: collapse; }
        thead tr { background: var(--green-pale); }
        th { padding: 10px 14px; text-align: left; font-size: 0.72rem; font-weight: 700; color: var(--green-dark); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
        td { padding: 11px 14px; font-size: 0.85rem; color: var(--text-dark); border-bottom: 1px solid var(--green-pale); }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: var(--green-pale); }
        .member-name { font-weight: 600; font-size: 0.9rem; }
        .member-id { font-size: 0.72rem; color: var(--gray-text); margin-top: 1px; }
        .pill { display: inline-flex; align-items: center; gap: 3px; font-size: 0.72rem; font-weight: 600; padding: 3px 9px; border-radius: 20px; }
        .pill-blue { background: #e3f2fd; color: #1565c0; }
        .pill-green { background: var(--green-pale); color: var(--green-dark); }
        .pill-amber { background: #fff3e0; color: #e65100; }
        .pill-purple { background: #f3e5f5; color: #6a1b9a; }
        .pill-ok { background: #e8f5e9; color: #2e7d32; }
        .pill-no { background: #fce4e4; color: #c62828; }
        .view-btn { font-size: 0.78rem; color: var(--green-dark); background: var(--green-pale); border: 1px solid var(--green-border); border-radius: 8px; padding: 5px 12px; cursor: pointer; font-weight: 600; white-space: nowrap; }
        .view-btn:hover { background: var(--green-border); }

        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .page-title { font-size: 1.4rem; font-weight: 700; color: var(--text-dark); }
        .page-sub { font-size: 0.78rem; color: var(--gray-text); margin-top: 2px; }
        .add-btn { background: var(--green-main); color: white; border: none; padding: 10px 20px; border-radius: var(--radius); font-size: 0.9rem; cursor: pointer; font-weight: 600; }
        .add-btn:hover { opacity: 0.9; }

        .notif-bar { background: #fff3e0; border: 1px solid #ffb74d; border-radius: var(--radius); padding: 0.85rem 1.25rem; margin-bottom: 1.5rem; }

        .skeleton { background: linear-gradient(90deg, var(--green-pale) 25%, var(--green-border) 50%, var(--green-pale) 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: var(--radius); height: 20px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .empty-state { text-align: center; padding: 3rem; color: var(--gray-text); }

        @media (max-width: 1200px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr); }
          .cat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .dash-wrap { padding: 1rem; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .cat-grid { grid-template-columns: 1fr 1fr; }
          .quick-row { grid-template-columns: 1fr; }
          .top-bar { flex-direction: column; align-items: flex-start; }
          .add-btn { width: 100%; text-align: center; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .cat-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dash-wrap">

        {notifications.length > 0 && (
          <div className="notif-bar">
            <p style={{ fontSize: '0.82rem', fontWeight: '700', color: '#e65100', marginBottom: '4px' }}>🔔 Today&apos;s Updates</p>
            {notifications.map((n, i) => (
              <p key={i} style={{ fontSize: '0.82rem', color: '#e65100' }}>{n}</p>
            ))}
          </div>
        )}

        <div className="top-bar">
          <div>
            <div className="page-title">Members Directory</div>
            <div className="page-sub">Naliya Mandwi Junagadh Muslim Welfare Jamat</div>
          </div>
          <button className="add-btn" onClick={() => setShowForm(true)}>+ Add Member</button>
        </div>

        <SearchBar onSearch={(q) => setSearchQuery(q)} />

        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: 'Total Members', value: totalVisible, badge: 'Active', badgeBg: '#e8f5e9', badgeColor: '#2e7d32' },
            { label: 'Eligible Voters', value: voters.length, badge: `${totalVisible > 0 ? Math.round((voters.length / totalVisible) * 100) : 0}%`, badgeBg: '#e3f2fd', badgeColor: '#1565c0' },
            { label: 'Jamat Members', value: jamatMembers.length, badge: 'Married', badgeBg: '#ede7f6', badgeColor: '#4527a0' },
            { label: 'Senior Citizens', value: seniors.length, badge: '60+ yrs', badgeBg: '#fff3e0', badgeColor: '#e65100' },
            { label: 'Under 18', value: under18Count, badge: 'Minors', badgeBg: '#fce4e4', badgeColor: '#c62828' },
            { label: 'Widows', value: widows.length, badge: 'Female', badgeBg: '#f3e5f5', badgeColor: '#6a1b9a' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <span className="stat-badge" style={{ background: s.badgeBg, color: s.badgeColor }}>{s.badge}</span>
            </div>
          ))}
        </div>

        {/* Category Cards */}
        <div className="cat-grid">
          {[
            { label: 'Under 18', sub: 'Not eligible to vote', count: under18Count, total: totalVisible, color: '#2196f3', bgIcon: '#e3f2fd', icon: '👦', path: '/category/under18', barColor: '#2196f3' },
            { label: 'Adults (18+)', sub: 'Eligible to vote', count: adults.length, total: totalVisible, color: 'var(--green-main)', bgIcon: 'var(--green-pale)', icon: '🧑', path: '/category/adult', barColor: '#1D9E75' },
            { label: 'Senior Citizens', sub: '60+ years (incl. widows)', count: seniors.length, total: totalVisible, color: '#ff9800', bgIcon: '#fff3e0', icon: '👴', path: '/category/senior', barColor: '#ff9800' },
            { label: 'Widows', sub: 'Female members', count: widows.length, total: totalVisible, color: '#6a1b9a', bgIcon: '#f3e5f5', icon: '🕊️', path: '/category/widow', barColor: '#9c27b0' },
          ].map((cat) => (
            <div key={cat.path} className="cat-card" onClick={() => router.push(cat.path)}>
              <div className="cat-top">
                <div>
                  <div className="cat-label">{cat.label}</div>
                  <div className="cat-sub">{cat.sub}</div>
                </div>
                <div className="cat-icon" style={{ background: cat.bgIcon }}>{cat.icon}</div>
              </div>
              <div className="cat-count" style={{ color: cat.color }}>{cat.count}</div>
              <div className="cat-bar">
                <div className="cat-bar-fill" style={{ width: `${cat.total > 0 ? Math.round((cat.count / cat.total) * 100) : 0}%`, background: cat.barColor }} />
              </div>
              <div className="cat-link">Click to view →</div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="quick-row">
          <div className="quick-card" onClick={() => router.push('/category/jamat')}>
            <div className="quick-left">
              <div className="quick-dot" style={{ background: '#6a1b9a' }} />
              <div>
                <div className="quick-title">👨‍👩‍👧‍👦 Jamat Members</div>
                <div className="quick-sub">Married members — Click to view all</div>
              </div>
            </div>
            <div className="quick-num" style={{ color: '#6a1b9a' }}>{jamatMembers.length}</div>
          </div>
          <div className="quick-card" onClick={() => router.push('/voters')}>
            <div className="quick-left">
              <div className="quick-dot" style={{ background: 'var(--green-main)' }} />
              <div>
                <div className="quick-title">🗳️ Voter List</div>
                <div className="quick-sub">Total eligible voters — Click to view all</div>
              </div>
            </div>
            <div className="quick-num" style={{ color: 'var(--green-main)' }}>{voters.length}</div>
          </div>
        </div>

        {showForm && (
          <MemberForm onSubmit={handleAddMember} onCancel={() => setShowForm(false)} />
        )}

        {/* Table */}
        <div className="table-card">
          <div className="table-head">
            <div>
              <span className="table-title">All Members</span>
              <span className="tbl-count">({filteredMembers.length})</span>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" />)}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
              <p style={{ fontWeight: '600' }}>No members found</p>
              <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>Click &quot;+ Add Member&quot; to get started</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Father / Cast</th>
                    <th>Age</th>
                    <th>CNIC / B-Form</th>
                    <th>Phone</th>
                    <th>Category</th>
                    <th>Voting</th>
                    <th>Entry Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div className="member-name">{member.name}</div>
                        <div className="member-id">{member.id}</div>
                      </td>
                      <td style={{ color: 'var(--gray-text)' }}>{member.father_name} · {member.member_cast}</td>
                      <td>{member.age}</td>
                      <td style={{ color: 'var(--gray-text)', fontSize: '0.8rem' }}>{member.cnic || member.b_form || '-'}</td>
                      <td>{member.phone || '-'}</td>
                      <td>
                        <span className={`pill ${
                          member.category === 'under18' ? 'pill-blue' :
                          member.category === 'senior' ? 'pill-amber' :
                          member.category === 'widow' ? 'pill-purple' :
                          'pill-green'
                        }`}>
                          {member.category === 'under18' ? '👦 Under 18' :
                           member.category === 'senior' ? '👴 Senior' :
                           member.category === 'widow' ? '🕊️ Widow' :
                           '🧑 Adult'}
                        </span>
                      </td>
                      <td>
                        <span className={`pill ${member.voting_eligible ? 'pill-ok' : 'pill-no'}`}>
                          {member.voting_eligible ? '✓ Eligible' : '✗ Not Eligible'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--gray-text)' }}>{member.entry_date}</td>
                      <td>
                        <button className="view-btn" onClick={() => router.push(`/members/${encodeURIComponent(member.id)}`)}>
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}