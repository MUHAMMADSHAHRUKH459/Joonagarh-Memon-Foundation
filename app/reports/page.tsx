'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ReportsPage() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const currentMonth = MONTHS[new Date().getMonth()];
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    const { data: membersData } = await supabase.from('members').select('*').eq('is_child', false);

    const { data: feesData } = await supabase.from('fees').select('*, members(name, father_name)').eq('year', selectedYear).eq('month', selectedMonth);
    setMembers(membersData || []);
    setFees(feesData || []);
    setLoading(false);
  };

  const totalMembers = members.length;
  const under18 = members.filter(m => m.category === 'under18').length;
  const adults = members.filter(m => m.category === 'adult').length;
  const seniors = members.filter(m => m.category === 'senior').length;
  const voters = members.filter(m => m.voting_eligible).length;

  const paidFees = fees.filter(f => f.paid);
  const totalCollected = paidFees.length * 1000;
  const totalExpected = totalMembers * 1000;
  const totalPending = totalExpected - totalCollected;
  const collectionRate = totalMembers > 0 ? Math.round((paidFees.length / totalMembers) * 100) : 0;

  const paidMemberIds = paidFees.map(f => f.member_id);
  const defaulters = members.filter(m => !paidMemberIds.includes(m.id));

  const sendWhatsAppReminder = (member: any) => {
    const phone = member.phone?.replace(/[^0-9]/g, '');
    const msg = `Assalam o Alaikum! ${member.name} bhai,\n\nNaliya Mandwi Junagadh Muslim Welfare Jamat Karachi Chapter ki *${selectedMonth} ${selectedYear}* ki monthly fee *Rs. 1,000* abhi tak pending hai.\n\nMeherbani farma kar jald ada karein.\n\nShukriya! 🕌\n_Naliya Mandwi Junagadh Muslim Welfare Jamat - Karachi Chapter_`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const sendBulkReminder = () => {
    if (defaulters.length === 0) return;
    defaulters.forEach((m, index) => {
      setTimeout(() => {
        sendWhatsAppReminder(m);
      }, index * 1500);
    });
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(26, 92, 56);
    doc.text('Naliya Mandwi Junagadh Muslim Welfare Jamat - Karachi Chapter', 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Monthly Report - ${selectedMonth} ${selectedYear}`, 105, 23, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 105, 30, { align: 'center' });

    doc.setFontSize(13);
    doc.setTextColor(26, 92, 56);
    doc.text('Members Summary', 14, 42);

    autoTable(doc, {
      startY: 46,
      head: [['Category', 'Count']],
      body: [
        ['Total Members', totalMembers],
        ['Under 18', under18],
        ['Adults (18+)', adults],
        ['Senior Citizens (60+)', seniors],
        ['Eligible Voters', voters],
      ],
      headStyles: { fillColor: [46, 125, 82] },
      theme: 'striped',
    });

    const afterMembersY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.setTextColor(26, 92, 56);
    doc.text(`Fees Summary - ${selectedMonth} ${selectedYear}`, 14, afterMembersY);

    autoTable(doc, {
      startY: afterMembersY + 4,
      head: [['Description', 'Amount']],
      body: [
        ['Total Expected', `Rs. ${totalExpected.toLocaleString()}`],
        ['Total Collected', `Rs. ${totalCollected.toLocaleString()}`],
        ['Total Pending', `Rs. ${totalPending.toLocaleString()}`],
        ['Collection Rate', `${collectionRate}%`],
        ['Members Paid', paidFees.length],
        ['Members Unpaid', defaulters.length],
      ],
      headStyles: { fillColor: [46, 125, 82] },
      theme: 'striped',
    });

    const afterFeesY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.setTextColor(26, 92, 56);
    doc.text('Paid Members', 14, afterFeesY);

    autoTable(doc, {
      startY: afterFeesY + 4,
      head: [['Member ID', 'Name', 'Paid Date']],
      body: paidFees.map(f => [f.member_id, f.members?.name || '-', f.paid_date || '-']),
      headStyles: { fillColor: [46, 125, 82] },
      theme: 'striped',
    });

    const afterPaidY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.setTextColor(200, 40, 40);
    doc.text('Defaulters (Fee Not Paid)', 14, afterPaidY);

    autoTable(doc, {
      startY: afterPaidY + 4,
      head: [['Member ID', 'Name', 'Father Name', 'Phone']],
      body: defaulters.map(m => [m.id, m.name, m.father_name || '-', m.phone || '-']),
      headStyles: { fillColor: [200, 40, 40] },
      theme: 'striped',
    });

    doc.save(`Memon-Welfare-Report-${selectedMonth}-${selectedYear}.pdf`);
  };

  const statCard = (title: string, value: any, color: string) => (
    <div style={{
      backgroundColor: 'var(--white)',
      borderRadius: 'var(--radius)',
      padding: '1.2rem',
      boxShadow: 'var(--shadow)',
      borderTop: `4px solid ${color}`,
      textAlign: 'center' as const,
    }}>
      <p style={{ fontSize: '1.8rem', fontWeight: '700', color }}>{value}</p>
      <p style={{ fontSize: '0.82rem', color: 'var(--gray-text)', marginTop: '4px' }}>{title}</p>
    </div>
  );

  return (
    <main>
      <Navbar />

      <style>{`
        .stats-grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .stats-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
        @media (max-width: 768px) {
          .stats-grid-5 { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
          .report-header { flex-direction: column !important; align-items: flex-start !important; }
          .period-selector { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

        <button onClick={() => router.back()} style={{
          backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
          fontSize: '0.95rem', marginBottom: '1.5rem', fontWeight: '600',
        }}>← Back</button>

        {/* Header */}
        <div className="report-header" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>📊 Reports & Analytics</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>Naliya Mandwi Junagadh Muslim Welfare Jamat - Karachi Chapter</p>
          </div>
          <button onClick={exportPDF} style={{
            backgroundColor: '#c62828', color: 'white', border: 'none',
            padding: '10px 24px', borderRadius: 'var(--radius)', cursor: 'pointer',
            fontSize: '0.95rem', fontWeight: '600',
          }}>
            📄 Export PDF
          </button>
        </div>

        {/* Month/Year Selector */}
        <div className="period-selector" style={{
          backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
          padding: '1rem 1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)',
          display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap',
        }}>
          <label style={{ fontWeight: '600', color: 'var(--green-dark)' }}>Select Period:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1.5px solid var(--green-border)', fontSize: '0.95rem' }}
          >
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1.5px solid var(--green-border)', fontSize: '0.95rem' }}
          >
            {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-text)' }}>Loading...</div>
        ) : (
          <>
            {/* Members Stats */}
            <h3 style={{ marginBottom: '1rem', color: 'var(--green-dark)' }}>👥 Members Overview</h3>
            <div className="stats-grid-5">
              {statCard('Total Members', totalMembers, 'var(--green-main)')}
              {statCard('Under 18', under18, '#1565c0')}
              {statCard('Adults', adults, 'var(--green-dark)')}
              {statCard('Senior Citizens', seniors, '#e65100')}
              {statCard('Eligible Voters', voters, '#6a1b9a')}
            </div>

            {/* Fees Stats */}
            <h3 style={{ marginBottom: '1rem', color: 'var(--green-dark)' }}>💰 Fees - {selectedMonth} {selectedYear}</h3>
            <div className="stats-grid-4">
              {statCard('Total Expected', `Rs. ${totalExpected.toLocaleString()}`, '#1565c0')}
              {statCard('Total Collected', `Rs. ${totalCollected.toLocaleString()}`, 'var(--green-main)')}
              {statCard('Total Pending', `Rs. ${totalPending.toLocaleString()}`, '#c62828')}
              {statCard('Collection Rate', `${collectionRate}%`, '#e65100')}
            </div>

            {/* Progress Bar */}
            <div style={{
              backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
              padding: '1.5rem', marginBottom: '2rem', boxShadow: 'var(--shadow)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Collection Progress</span>
                <span style={{ fontWeight: '700', color: 'var(--green-main)' }}>{paidFees.length}/{totalMembers} members</span>
              </div>
              <div style={{ backgroundColor: '#e0e0e0', borderRadius: '10px', height: '14px', overflow: 'hidden' }}>
                <div style={{
                  width: `${collectionRate}%`, height: '100%',
                  backgroundColor: collectionRate >= 75 ? 'var(--green-main)' : collectionRate >= 50 ? '#ff9800' : '#ef5350',
                  borderRadius: '10px', transition: 'width 0.5s',
                }} />
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--gray-text)', marginTop: '0.5rem' }}>{collectionRate}% collected</p>
            </div>

            {/* Defaulters List */}
            {defaulters.length > 0 && (
              <div style={{
                backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow)', overflow: 'hidden', marginBottom: '2rem',
              }}>
                <div style={{
                  padding: '1rem 1.5rem', backgroundColor: '#fce4e4',
                  borderBottom: '1px solid #ef9a9a',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: '0.5rem',
                }}>
                  <h3 style={{ color: '#c62828', fontSize: '1rem' }}>⚠️ Defaulters - Fee Not Paid ({defaulters.length})</h3>
                  <button
                    onClick={sendBulkReminder}
                    style={{
                      backgroundColor: '#25d366', color: 'white', border: 'none',
                      padding: '7px 16px', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '0.85rem', fontWeight: '600',
                    }}
                  >
                    📱 Send All Reminders
                  </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#fff5f5' }}>
                        {['#', 'Member ID', 'Name', 'Father Name', 'Phone', 'Category', 'Remind'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.82rem', color: '#c62828', fontWeight: '700' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {defaulters.map((m, i) => (
                        <tr key={m.id} style={{ borderBottom: '1px solid #fce4e4' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fff5f5')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
                        >
                          <td style={{ padding: '10px 16px', fontSize: '0.85rem', color: 'var(--gray-text)' }}>{i + 1}</td>
                          <td style={{ padding: '10px 16px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--green-main)' }}>{m.id}</td>
                          <td style={{ padding: '10px 16px', fontSize: '0.9rem' }}>{m.name}</td>
                          <td style={{ padding: '10px 16px', fontSize: '0.85rem' }}>{m.father_name}</td>
                          <td style={{ padding: '10px 16px', fontSize: '0.85rem' }}>{m.phone}</td>
                          <td style={{ padding: '10px 16px' }}>
                            <span style={{
                              padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600',
                              backgroundColor: m.category === 'under18' ? '#e3f2fd' : m.category === 'senior' ? '#fff3e0' : '#e8f5ee',
                              color: m.category === 'under18' ? '#1565c0' : m.category === 'senior' ? '#e65100' : 'var(--green-dark)',
                            }}>
                              {m.category === 'under18' ? '👦 Under 18' : m.category === 'senior' ? '👴 Senior' : '🧑 Adult'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <button
                              onClick={() => sendWhatsAppReminder(m)}
                              style={{
                                backgroundColor: '#25d366', color: 'white', border: 'none',
                                padding: '5px 12px', borderRadius: '6px', cursor: 'pointer',
                                fontSize: '0.78rem', fontWeight: '600',
                              }}
                            >
                              📱 Remind
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Paid Members */}
            {paidFees.length > 0 && (
              <div style={{
                backgroundColor: 'var(--white)', borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow)', overflow: 'hidden',
              }}>
                <div style={{
                  padding: '1rem 1.5rem', backgroundColor: 'var(--green-pale)',
                  borderBottom: '1px solid var(--green-border)',
                }}>
                  <h3 style={{ color: 'var(--green-dark)', fontSize: '1rem' }}>✅ Paid Members ({paidFees.length})</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--green-pale)' }}>
                        {['#', 'Member ID', 'Name', 'Amount', 'Paid Date'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.82rem', color: 'var(--green-dark)', fontWeight: '700' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paidFees.map((f, i) => (
                        <tr key={f.id} style={{ borderBottom: '1px solid var(--green-pale)' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--green-pale)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
                        >
                          <td style={{ padding: '10px 16px', fontSize: '0.85rem', color: 'var(--gray-text)' }}>{i + 1}</td>
                          <td style={{ padding: '10px 16px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--green-main)' }}>{f.member_id}</td>
                          <td style={{ padding: '10px 16px', fontSize: '0.9rem' }}>{f.members?.name || '-'}</td>
                          <td style={{ padding: '10px 16px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--green-main)' }}>Rs. 1,000</td>
                          <td style={{ padding: '10px 16px', fontSize: '0.85rem', color: 'var(--gray-text)' }}>{f.paid_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}