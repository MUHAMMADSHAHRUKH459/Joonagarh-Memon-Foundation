'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';

const YEARS = Array.from({ length: 2050 - 2024 + 1 }, (_, i) => 2024 + i);

export default function FeesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [member, setMember] = useState<any>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

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
      .eq('member_id', decodeURIComponent(id));

    setFees(feesData || []);
    setLoading(false);
  };

  const toggleFee = async (year: number) => {
    const existing = fees.find((f) => f.year === year && f.month === 'Yearly');

    if (existing) {
      if (existing.paid) {
        await supabase.from('fees').update({ paid: false, paid_date: null }).eq('id', existing.id);
      } else {
        await supabase.from('fees').update({
          paid: true,
          paid_date: new Date().toLocaleDateString('en-GB'),
        }).eq('id', existing.id);
      }
    } else {
      await supabase.from('fees').insert([{
        member_id: decodeURIComponent(id),
        month: 'Yearly',
        year,
        amount: 1000,
        paid: true,
        paid_date: new Date().toLocaleDateString('en-GB'),
      }]);
    }

    await fetchData();
  };

  const getFeeForYear = (year: number) => {
    return fees.find((f) => f.year === year && f.month === 'Yearly');
  };

  const paidCount = fees.filter((f) => f.paid && f.month === 'Yearly').length;
  const unpaidCount = YEARS.length - paidCount;
  const totalPaid = paidCount * 1000;

  const printInvoice = () => {
    window.print();
  };

  const shareWhatsApp = (fee: any) => {
    const phone = member?.phone?.replace(/[^0-9]/g, '');
    const msg = `🧾 *Fee Invoice*\n\n👤 Name: ${member?.name}\n👨 Father Name: ${member?.father_name}\n🪪 Member ID: ${member?.id}\n📱 Phone: ${member?.phone}\n📅 Year: ${fee.year}\n💰 Amount: Rs. 1,000\n✅ Status: Paid\n📆 Paid Date: ${fee.paid_date}\n\n_Naliya Mandwi Junagadh Muslim Welfare Jamat - Karachi Chapter_`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <main>
      <Navbar />

      <style>{`
        .fees-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .years-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .year-card {
          background-color: var(--white);
          border-radius: var(--radius);
          padding: 1rem;
          box-shadow: var(--shadow);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .member-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        @media (max-width: 600px) {
          .fees-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 0.75rem;
          }
          .years-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 0.75rem;
          }
          .year-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          .year-btns {
            display: flex !important;
            flex-direction: row !important;
            width: 100%;
          }
          .year-btns button {
            flex: 1;
          }
          .member-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .page-pad {
            padding: 1rem !important;
          }
        }
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="page-pad" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>

        <button onClick={() => router.back()} style={{
          backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
          fontSize: '0.95rem', marginBottom: '1.5rem', fontWeight: '600',
        }}>← Back</button>

        {/* Member Info */}
        {member && (
          <div style={{
            backgroundColor: 'var(--green-dark)', borderRadius: 'var(--radius)',
            padding: '1.2rem 1.5rem', marginBottom: '1.5rem', color: 'white',
          }}>
            <div className="member-header">
              <div>
                <h2 style={{ color: 'white', fontSize: '1.2rem' }}>{member.name}</h2>
                <p style={{ color: 'var(--green-border)', fontSize: '0.82rem', marginTop: '2px' }}>
                  ID: {member.id} | {member.phone}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'var(--green-border)', fontSize: '0.82rem' }}>Yearly Fee</p>
                <p style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>Rs. 1,000</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="fees-stats-grid">
          <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center', boxShadow: 'var(--shadow)', borderTop: '3px solid var(--green-main)' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--green-main)' }}>{paidCount}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-text)' }}>Years Paid</p>
          </div>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center', boxShadow: 'var(--shadow)', borderTop: '3px solid #ef5350' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef5350' }}>{unpaidCount}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-text)' }}>Years Unpaid</p>
          </div>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center', boxShadow: 'var(--shadow)', borderTop: '3px solid #1565c0' }}>
            <p style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1565c0' }}>Rs. {totalPaid.toLocaleString()}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-text)' }}>Total Collected</p>
          </div>
        </div>

        {/* Years Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-text)' }}>Loading...</div>
        ) : (
          <div className="years-grid">
            {YEARS.map((year) => {
              const fee = getFeeForYear(year);
              const isPaid = fee?.paid;
              return (
                <div key={year} className="year-card" style={{
                  border: `2px solid ${isPaid ? 'var(--green-main)' : '#e0e0e0'}`,
                }}>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '1rem', color: isPaid ? 'var(--green-dark)' : 'var(--text-dark)' }}>{year}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-text)', marginTop: '2px' }}>
                      {isPaid ? `Paid: ${fee.paid_date}` : 'Not Paid'}
                    </p>
                  </div>
                  <div className="year-btns" style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                    <button
                      onClick={() => toggleFee(year)}
                      style={{
                        backgroundColor: isPaid ? '#ef5350' : 'var(--green-main)',
                        color: 'white', border: 'none', padding: '5px 10px',
                        borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isPaid ? '✕ Unpay' : '✓ Mark Paid'}
                    </button>
                    {isPaid && (
                      <button
                        onClick={() => setSelectedInvoice({
                          ...fee,
                          year,
                          memberName: member?.name,
                          fatherName: member?.father_name,
                          memberId: member?.id,
                          phone: member?.phone,
                        })}
                        style={{
                          backgroundColor: '#1565c0', color: 'white', border: 'none',
                          padding: '5px 10px', borderRadius: '8px', cursor: 'pointer',
                          fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap',
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
        )}

        {/* Invoice Modal */}
        {selectedInvoice && (
          <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}>
            <div style={{
              backgroundColor: 'white', borderRadius: 'var(--radius)', padding: '1.5rem',
              width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              maxHeight: '90vh', overflowY: 'auto',
            }} id="invoice">

              {/* Invoice Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid var(--green-main)', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
                <h2 style={{ color: 'var(--green-dark)', fontSize: '1.1rem' }}>🕌 Naliya Mandwi Junagadh Muslim Welfare Jamat</h2>
                <p style={{ color: 'var(--gray-text)', fontSize: '0.82rem' }}>Karachi Chapter</p>
                <p style={{ color: 'var(--gray-text)', fontSize: '0.82rem', marginTop: '4px' }}>Fee Receipt</p>
              </div>

              {/* Invoice Details */}
              <div style={{ marginBottom: '1.2rem' }}>
                {[
                  ['Member Name', selectedInvoice.memberName],
                  ['Father Name', selectedInvoice.fatherName],
                  ['Member ID', selectedInvoice.memberId],
                  ['Phone', selectedInvoice.phone],
                  ['Year', selectedInvoice.year],
                  ['Paid Date', selectedInvoice.paid_date],
                  ['Amount', 'Rs. 1,000'],
                  ['Status', '✅ Paid'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0f0f0', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--gray-text)', flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-dark)', textAlign: 'right' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Green Line + Signature */}
              <div style={{ borderTop: '2px solid var(--green-main)', marginBottom: '1.2rem', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1.5px solid #333', width: '140px', marginBottom: '6px' }} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-text)' }}>Authorized Signature</p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="no-print" style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={printInvoice} style={{
                  flex: 1, backgroundColor: 'var(--green-main)', color: 'white',
                  border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer',
                  fontWeight: '600', fontSize: '0.88rem',
                }}>🖨️ Print</button>
                <button onClick={() => shareWhatsApp(selectedInvoice)} style={{
                  flex: 1, backgroundColor: '#25d366', color: 'white',
                  border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer',
                  fontWeight: '600', fontSize: '0.88rem',
                }}>📱 WhatsApp</button>
                <button onClick={() => setSelectedInvoice(null)} style={{
                  flex: 1, backgroundColor: '#ef5350', color: 'white',
                  border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer',
                  fontWeight: '600', fontSize: '0.88rem',
                }}>✕ Close</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}