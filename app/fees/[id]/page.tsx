'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function FeesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [member, setMember] = useState<any>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    fetchData();
  }, [id, selectedYear]);

  const fetchData = async () => {
    setLoading(true);

    const { data: memberData } = await supabase
      .from('members')
      .select('*')
      .eq('id', decodeURIComponent(id))
      .single();

    setMember(memberData);

    const { data: feesData } = await supabase
      .from('fees')
      .select('*')
      .eq('member_id', decodeURIComponent(id))
      .eq('year', selectedYear);

    setFees(feesData || []);
    setLoading(false);
  };

  const toggleFee = async (month: string) => {
    const existing = fees.find((f) => f.month === month && f.year === selectedYear);

    if (existing) {
      if (existing.paid) {
        // Unpay
        await supabase.from('fees').update({ paid: false, paid_date: null }).eq('id', existing.id);
      } else {
        // Pay
        await supabase.from('fees').update({
          paid: true,
          paid_date: new Date().toLocaleDateString('en-GB'),
        }).eq('id', existing.id);
      }
    } else {
      // Create new
      await supabase.from('fees').insert([{
        member_id: decodeURIComponent(id),
        month,
        year: selectedYear,
        amount: 1000,
        paid: true,
        paid_date: new Date().toLocaleDateString('en-GB'),
      }]);
    }

    await fetchData();
  };

  const getFeeForMonth = (month: string) => {
    return fees.find((f) => f.month === month && f.year === selectedYear);
  };

  const paidCount = fees.filter((f) => f.paid).length;
  const unpaidCount = MONTHS.length - paidCount;
  const totalPaid = paidCount * 1000;

  const printInvoice = () => {
    window.print();
  };

  const shareWhatsApp = (fee: any) => {
    const msg = `🧾 *Fee Invoice*\n\n👤 Name: ${member?.name}\n🪪 Member ID: ${member?.id}\n📅 Month: ${fee.month} ${fee.year}\n💰 Amount: Rs. 1000\n✅ Status: Paid\n📆 Paid Date: ${fee.paid_date}\n\n_Memon Welfare - Karachi Chapter_`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <main>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>

        <button onClick={() => router.back()} style={{
          backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
          fontSize: '0.95rem', marginBottom: '1.5rem', fontWeight: '600',
        }}>← Back</button>

        {/* Member Info */}
        {member && (
          <div style={{
            backgroundColor: 'var(--green-dark)', borderRadius: 'var(--radius)',
            padding: '1.5rem', marginBottom: '1.5rem', color: 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <h2 style={{ color: 'white', fontSize: '1.3rem' }}>{member.name}</h2>
              <p style={{ color: 'var(--green-border)', fontSize: '0.85rem' }}>ID: {member.id} | {member.phone}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'var(--green-border)', fontSize: '0.85rem' }}>Monthly Fee</p>
              <p style={{ color: 'white', fontWeight: '700', fontSize: '1.2rem' }}>Rs. 1,000</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center', boxShadow: 'var(--shadow)', borderTop: '3px solid var(--green-main)' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--green-main)' }}>{paidCount}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>Months Paid</p>
          </div>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center', boxShadow: 'var(--shadow)', borderTop: '3px solid #ef5350' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef5350' }}>{unpaidCount}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>Months Unpaid</p>
          </div>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center', boxShadow: 'var(--shadow)', borderTop: '3px solid #1565c0' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1565c0' }}>Rs. {totalPaid.toLocaleString()}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>Total Collected</p>
          </div>
        </div>

        {/* Year Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <label style={{ fontWeight: '600', color: 'var(--green-dark)' }}>Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1.5px solid var(--green-border)', fontSize: '0.95rem' }}
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Months Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {MONTHS.map((month) => {
            const fee = getFeeForMonth(month);
            const isPaid = fee?.paid;
            return (
              <div key={month} style={{
                backgroundColor: 'var(--white)',
                borderRadius: 'var(--radius)',
                padding: '1rem',
                boxShadow: 'var(--shadow)',
                border: `2px solid ${isPaid ? 'var(--green-main)' : '#e0e0e0'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{month}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-text)' }}>
                    {isPaid ? `Paid: ${fee.paid_date}` : 'Not Paid'}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                  <button
                    onClick={() => toggleFee(month)}
                    style={{
                      backgroundColor: isPaid ? '#ef5350' : 'var(--green-main)',
                      color: 'white', border: 'none', padding: '6px 12px',
                      borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600',
                    }}
                  >
                    {isPaid ? '✕ Unpay' : '✓ Mark Paid'}
                  </button>
                  {isPaid && (
                    <button
                      onClick={() => setSelectedInvoice({ ...fee, month, memberName: member?.name, memberId: member?.id, phone: member?.phone })}
                      style={{
                        backgroundColor: '#1565c0', color: 'white', border: 'none',
                        padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                        fontSize: '0.78rem', fontWeight: '600',
                      }}
                    >
                      🧾 Invoice
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Invoice Modal */}
        {selectedInvoice && (
          <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}>
            <div style={{
              backgroundColor: 'white', borderRadius: 'var(--radius)', padding: '2rem',
              width: '100%', maxWidth: '450px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }} id="invoice">

              {/* Invoice Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid var(--green-main)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--green-dark)', fontSize: '1.4rem' }}>🕌 Memon Welfare</h2>
                <p style={{ color: 'var(--gray-text)', fontSize: '0.85rem' }}>Karachi Chapter</p>
                <p style={{ color: 'var(--gray-text)', fontSize: '0.85rem', marginTop: '4px' }}>Fee Receipt</p>
              </div>

              {/* Invoice Details */}
              <div style={{ marginBottom: '1.5rem' }}>
                {[
                  ['Member Name', selectedInvoice.memberName],
                  ['Member ID', selectedInvoice.memberId],
                  ['Month', `${selectedInvoice.month} ${selectedInvoice.year}`],
                  ['Amount', 'Rs. 1,000'],
                  ['Status', '✅ Paid'],
                  ['Paid Date', selectedInvoice.paid_date],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>{label}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-dark)' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={printInvoice} style={{
                  flex: 1, backgroundColor: 'var(--green-main)', color: 'white',
                  border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                }}>🖨️ Print</button>
                <button onClick={() => shareWhatsApp(selectedInvoice)} style={{
                  flex: 1, backgroundColor: '#25d366', color: 'white',
                  border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                }}>📱 WhatsApp</button>
                <button onClick={() => setSelectedInvoice(null)} style={{
                  flex: 1, backgroundColor: '#ef5350', color: 'white',
                  border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                }}>✕ Close</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}