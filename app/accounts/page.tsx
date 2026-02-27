'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const EXPENSE_CATEGORIES = ['Office', 'Events', 'Utilities', 'Welfare', 'Maintenance', 'Transport', 'Food', 'Other'];
const INCOME_CATEGORIES = ['Monthly Fees', 'Donation', 'Grant', 'Other'];

export default function AccountsPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const currentMonth = MONTHS[new Date().getMonth()];
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [form, setForm] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchRecords();
  }, [selectedMonth, selectedYear]);

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('month', selectedMonth)
      .eq('year', selectedYear)
      .order('date', { ascending: false });

    if (!error) setRecords(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('accounts').insert([{
      type: formType,
      category: form.category || (formType === 'expense' ? 'Other' : 'Other'),
      description: form.description,
      amount: parseInt(form.amount),
      date: form.date,
      month: selectedMonth,
      year: selectedYear,
    }]);

    if (!error) {
      setForm({ category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
      setShowForm(false);
      fetchRecords();
    } else {
      alert('Error saving record. Please try again.');
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    await supabase.from('accounts').delete().eq('id', id);
    fetchRecords();
  };

  const income = records.filter(r => r.type === 'income');
  const expenses = records.filter(r => r.type === 'expense');
  const totalIncome = income.reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = expenses.reduce((sum, r) => sum + r.amount, 0);
  const balance = totalIncome - totalExpense;

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(26, 92, 56);
    doc.text('Naliya Mandwi Junagadh Muslim Welfare Jamat', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Monthly Accounts - ${selectedMonth} ${selectedYear}`, 105, 23, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 105, 30, { align: 'center' });

    // Summary
    doc.setFontSize(13);
    doc.setTextColor(26, 92, 56);
    doc.text('Summary', 14, 42);
    autoTable(doc, {
      startY: 46,
      head: [['Description', 'Amount']],
      body: [
        ['Total Income', `Rs. ${totalIncome.toLocaleString()}`],
        ['Total Expense', `Rs. ${totalExpense.toLocaleString()}`],
        ['Balance', `Rs. ${balance.toLocaleString()}`],
      ],
      headStyles: { fillColor: [46, 125, 82] },
      theme: 'striped',
    });

    // Income
    const afterSummaryY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.setTextColor(46, 125, 82);
    doc.text('Income Records', 14, afterSummaryY);
    autoTable(doc, {
      startY: afterSummaryY + 4,
      head: [['Date', 'Category', 'Description', 'Amount']],
      body: income.map(r => [r.date, r.category, r.description, `Rs. ${r.amount.toLocaleString()}`]),
      headStyles: { fillColor: [46, 125, 82] },
      theme: 'striped',
    });

    // Expense
    const afterIncomeY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.setTextColor(198, 40, 40);
    doc.text('Expense Records', 14, afterIncomeY);
    autoTable(doc, {
      startY: afterIncomeY + 4,
      head: [['Date', 'Category', 'Description', 'Amount']],
      body: expenses.map(r => [r.date, r.category, r.description, `Rs. ${r.amount.toLocaleString()}`]),
      headStyles: { fillColor: [198, 40, 40] },
      theme: 'striped',
    });

    doc.save(`Accounts-${selectedMonth}-${selectedYear}.pdf`);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid var(--green-border)',
    borderRadius: 'var(--radius)', fontSize: '0.95rem',
    outline: 'none', boxSizing: 'border-box' as const,
  };

  return (
    <main>
      <Navbar />

      <style>{`
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .records-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .records-grid { grid-template-columns: 1fr !important; }
          .period-selector { flex-direction: column !important; }
        }
      `}</style>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

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
            <h2 style={{ fontSize: '1.5rem' }}>📒 Jamat Accounts</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>Monthly income & expense management</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => { setFormType('income'); setShowForm(true); }} style={{
              backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
              padding: '10px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: '600',
            }}>+ Add Income</button>
            <button onClick={() => { setFormType('expense'); setShowForm(true); }} style={{
              backgroundColor: '#c62828', color: 'white', border: 'none',
              padding: '10px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: '600',
            }}>- Add Expense</button>
            <button onClick={exportPDF} style={{
              backgroundColor: '#1565c0', color: 'white', border: 'none',
              padding: '10px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: '600',
            }}>📄 Export PDF</button>
          </div>
        </div>

        {/* Month/Year Selector */}
        <div className="period-selector" style={{
          backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
          padding: '1rem 1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)',
          display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap',
        }}>
          <label style={{ fontWeight: '600', color: 'var(--green-dark)' }}>Period:</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1.5px solid var(--green-border)', fontSize: '0.95rem' }}>
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1.5px solid var(--green-border)', fontSize: '0.95rem' }}>
            {Array.from({ length: 2050 - 2024 + 1 }, (_, i) => 2024 + i).map(y => <option key={y}>{y}</option>)}
          </select>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div style={{
            backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
            padding: '1.5rem', boxShadow: 'var(--shadow)', borderTop: '4px solid var(--green-main)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)', marginBottom: '0.5rem' }}>💰 Total Income</p>
            <p style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--green-main)' }}>Rs. {totalIncome.toLocaleString()}</p>
          </div>
          <div style={{
            backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
            padding: '1.5rem', boxShadow: 'var(--shadow)', borderTop: '4px solid #c62828',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)', marginBottom: '0.5rem' }}>💸 Total Expense</p>
            <p style={{ fontSize: '1.8rem', fontWeight: '700', color: '#c62828' }}>Rs. {totalExpense.toLocaleString()}</p>
          </div>
          <div style={{
            backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
            padding: '1.5rem', boxShadow: 'var(--shadow)', borderTop: `4px solid ${balance >= 0 ? '#1565c0' : '#e65100'}`,
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)', marginBottom: '0.5rem' }}>📊 Balance</p>
            <p style={{ fontSize: '1.8rem', fontWeight: '700', color: balance >= 0 ? '#1565c0' : '#e65100' }}>
              Rs. {balance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Records */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-text)' }}>Loading...</div>
        ) : (
          <div className="records-grid">
            {/* Income */}
            <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', backgroundColor: '#e8f5e9', borderBottom: '1px solid #c8e6c9' }}>
                <h3 style={{ color: 'var(--green-dark)', fontSize: '1rem' }}>💰 Income ({income.length})</h3>
              </div>
              {income.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  No income records
                </div>
              ) : (
                income.map((r) => (
                  <div key={r.id} style={{
                    padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9fdf9')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
                  >
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{r.description}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--gray-text)' }}>{r.category} • {r.date}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <p style={{ fontWeight: '700', color: 'var(--green-main)', fontSize: '0.95rem' }}>+Rs. {r.amount.toLocaleString()}</p>
                      <button onClick={() => deleteRecord(r.id)} style={{
                        backgroundColor: '#ef5350', color: 'white', border: 'none',
                        width: '26px', height: '26px', borderRadius: '50%',
                        cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700',
                      }}>✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Expense */}
            <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', backgroundColor: '#fce4e4', borderBottom: '1px solid #ef9a9a' }}>
                <h3 style={{ color: '#c62828', fontSize: '1rem' }}>💸 Expenses ({expenses.length})</h3>
              </div>
              {expenses.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  No expense records
                </div>
              ) : (
                expenses.map((r) => (
                  <div key={r.id} style={{
                    padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fff5f5')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
                  >
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{r.description}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--gray-text)' }}>{r.category} • {r.date}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <p style={{ fontWeight: '700', color: '#c62828', fontSize: '0.95rem' }}>-Rs. {r.amount.toLocaleString()}</p>
                      <button onClick={() => deleteRecord(r.id)} style={{
                        backgroundColor: '#ef5350', color: 'white', border: 'none',
                        width: '26px', height: '26px', borderRadius: '50%',
                        cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700',
                      }}>✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Add Form Modal */}
        {showForm && (
          <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}>
            <div style={{
              backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
              padding: '2rem', width: '100%', maxWidth: '480px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}>
              <h3 style={{
                marginBottom: '1.5rem', fontSize: '1.2rem',
                color: formType === 'income' ? 'var(--green-dark)' : '#c62828',
              }}>
                {formType === 'income' ? '💰 Add Income' : '💸 Add Expense'}
              </h3>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--green-dark)', marginBottom: '4px', display: 'block' }}>
                    Category
                  </label>
                  <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select category</option>
                    {(formType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--green-dark)', marginBottom: '4px', display: 'block' }}>
                    Description *
                  </label>
                  <input
                    style={inputStyle}
                    placeholder={formType === 'expense' ? 'e.g. Office fan repair' : 'e.g. Monthly fees collection'}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--green-dark)', marginBottom: '4px', display: 'block' }}>
                    Amount (Rs.) *
                  </label>
                  <input
                    style={inputStyle}
                    type="number"
                    placeholder="e.g. 5000"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                    min="1"
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--green-dark)', marginBottom: '4px', display: 'block' }}>
                    Date *
                  </label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setShowForm(false)} style={{
                    flex: 1, padding: '10px', border: '1.5px solid var(--green-border)',
                    borderRadius: 'var(--radius)', backgroundColor: 'transparent',
                    cursor: 'pointer', fontSize: '0.95rem',
                  }}>Cancel</button>
                  <button type="submit" style={{
                    flex: 1, padding: '10px',
                    backgroundColor: formType === 'income' ? 'var(--green-main)' : '#c62828',
                    color: 'white', border: 'none', borderRadius: 'var(--radius)',
                    cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600',
                  }}>
                    {formType === 'income' ? '✅ Save Income' : '✅ Save Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}