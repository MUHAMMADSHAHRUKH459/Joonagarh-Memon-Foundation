'use client';

import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '1.5rem',
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--white)',
        border: '1.5px solid var(--green-border)',
        borderRadius: 'var(--radius)',
        padding: '10px 16px',
        gap: '10px',
        boxShadow: 'var(--shadow)',
      }}>
        <span style={{ fontSize: '1.2rem' }}>🔍</span>
        <input
          type="text"
          placeholder="Search by Name or Member ID... (e.g. Ahmed / MEM-001)"
          value={query}
          onChange={handleChange}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '0.95rem',
            color: 'var(--text-dark)',
            backgroundColor: 'transparent',
          }}
        />
        {query && (
          <button
            onClick={handleClear}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              color: 'var(--gray-text)',
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;