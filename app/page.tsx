'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import MemberTable from '@/components/MemberTable';
import SeniorCitizenTable from '@/components/SeniorCitizenTable';
import MemberForm from '@/components/MemberForm';

export default function Home() {
  const [members, setMembers] = useState<any[]>([]);
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const seniorCitizens = members.filter((m) => m.age >= 60);
  const regularMembers = members.filter((m) => m.age < 60);

  const handleAddMember = (member: any) => {
    const newMember = {
      ...member,
      id: `MEM-${Date.now()}`,
      votingEligible: member.age >= 18,
      seniorCitizen: member.age >= 60,
    };
    setMembers((prev) => [...prev, newMember]);
    setShowForm(false);
  };

  const handleSearch = (query: string) => {
    if (!query) {
      setIsSearching(false);
      setSearchResult([]);
      return;
    }
    setIsSearching(true);
    const result = members.filter((m) =>
      m.id.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResult(result);
  };

  return (
    <main>
      <Navbar />

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

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

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        {/* Member Form */}
        {showForm && (
          <MemberForm
            onSubmit={handleAddMember}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Members Table */}
        <MemberTable members={isSearching ? searchResult : regularMembers} />

        {/* Senior Citizens */}
        {seniorCitizens.length > 0 && (
          <SeniorCitizenTable members={seniorCitizens} />
        )}

      </div>
    </main>
  );
}