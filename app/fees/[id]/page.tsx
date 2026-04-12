'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';

const YEARS = Array.from({ length: 2050 - 2020 + 1 }, (_, i) => 2020 + i);

interface FeeRecord {
  id: string;
  member_id: string;
  year: number;
  month: string;
  amount: number;
  paid: boolean;
  paid_date: string | null;
  is_prior?: boolean;
}

interface Member {
  id: string;
  name: string;
  father_name: string;
  phone: string;
  entry_date: string;
}

interface InvoiceData {
  id: string;
  member_id: string;
  year: number;
  month: string;
  amount: number;
  paid: boolean;
  paid_date: string | null;
  memberName: string;
  fatherName: string;
  memberId: string;
  phone: string;
}

export default function FeesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [customDueAmount, setCustomDueAmount] = useState<string>('');

  // Prior dues state
  const [priorDuesAmount, setPriorDuesAmount] = useState<string>('');
  const [priorDuesEditing, setPriorDuesEditing] = useState(false);
  const [priorDuesSaving, setPriorDuesSaving] = useState(false);

  // ─── fetchData (reusable) ─────────────────────────────────────────────────
  const fetchData = async () => {
    const decodedId = decodeURIComponent(id);

    const { data: memberData } = await supabase
      .from('members')
      .select('*')
      .eq('id', decodedId)
      .single();

    setMember(memberData);

    const { data: feesData } = await supabase
      .from('fees')
      .select('*')
      .eq('member_id', decodedId);

    const allFees = (feesData as FeeRecord[]) || [];
    setFees(allFees);

    const priorFee = allFees.find((f) => f.month === 'Prior');
    if (priorFee) setPriorDuesAmount(String(priorFee.amount));
  };

  // ─── loadData (initial load with spinner) ────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ─── Prior Dues Save ───────────────────────────────────────────────────────
  const savePriorDues = async () => {
    setPriorDuesSaving(true);
    const decodedId = decodeURIComponent(id);
    const amount = Number(priorDuesAmount) || 0;

    const existing = fees.find((f) => f.month === 'Prior');

    if (existing) {
      await supabase.from('fees').update({ amount }).eq('id', existing.id);
    } else {
      await supabase.from('fees').insert([{
        member_id: decodedId,
        month: 'Prior',
        year: 0,
        amount,
        paid: amount === 0,
        paid_date: amount === 0 ? new Date().toLocaleDateString('en-GB') : null,
        is_prior: true,
      }]);
    }

    setPriorDuesSaving(false);
    setPriorDuesEditing(false);
    await fetchData();
  };

  // ─── Toggle Fee ────────────────────────────────────────────────────────────
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


  const currentYear = new Date().getFullYear();

  // Sirf actual paid/unpaid status — koi auto-paid nahi
  const getDuesYears = (): { year: number; paid: boolean; paidDate: string | null }[] => {
    const result = [];
    for (let y = 2020; y <= currentYear; y++) {
      const fee = getFeeForYear(y);
      result.push({
        year: y,
        paid: fee?.paid ?? false,
        paidDate: fee?.paid_date ?? null,
      });
    }
    return result;
  };

  const duesYears = getDuesYears();
  const unpaidDuesYears = duesYears.filter((d) => !d.paid);
  const totalDuesAmount = unpaidDuesYears.length * 1000;
  const allClear = unpaidDuesYears.length === 0 && Number(priorDuesAmount) === 0;

  const priorDuesFee = fees.find((f) => f.month === 'Prior');
  const hasPriorDues = Number(priorDuesAmount) > 0;

  const paidCount = fees.filter((f) => f.paid && f.month === 'Yearly').length;
  const totalPaid = paidCount * 1000;

  const printInvoice = () => {
    window.print();
  };

  const shareWhatsApp = (fee: InvoiceData) => {
    const phone = member?.phone?.replace(/[^0-9]/g, '');

    const priorLine = hasPriorDues ? `\n💼 Pre-2020 Dues: Rs. ${Number(priorDuesAmount).toLocaleString()}` : '';

    const duesSection = allClear
      ? `✅ Maintenance Status: ALL CLEAR — No dues pending`
      : `⚠️ Pending Dues: ${unpaidDuesYears.map((d) => d.year).join(', ')}\n💸 Total Dues: Rs. ${Number(customDueAmount).toLocaleString()}${priorLine}`;

    const msg =
      `🧾 *Fee Invoice*\n\n` +
      `👤 Name: ${member?.name}\n` +
      `👨 Father Name: ${member?.father_name}\n` +
      `🪪 Member ID: ${member?.id}\n` +
      `📱 Phone: ${member?.phone}\n` +
      `📅 Year: ${fee.year}\n` +
      `💰 Amount: Rs. 1,000\n` +
      `✅ Status: Paid\n` +
      `📆 Paid Date: ${fee.paid_date}\n\n` +
      `──────────────────\n` +
      `📊 *Maintenance History*\n` +
      `${duesSection}\n\n` +
      `_Naliya Mandwi Junagadh Muslim Welfare Jamat_`;

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

        .prior-dues-card {
          background: linear-gradient(135deg, #fff8e1, #fff3cd);
          border: 2px dashed #f59e0b;
          border-radius: var(--radius);
          padding: 1.2rem 1.5rem;
          margin-bottom: 1.5rem;
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

          .prior-dues-card {
            padding: 1rem;
          }
        }

        /* ===== 80mm Thermal Print Setup ===== */
        @media print {
          body * { visibility: hidden; }
          #invoice, #invoice * { visibility: visible; }
          #invoice {
            position: absolute;
            left: 0; top: 0;
            width: 80mm; max-width: 80mm;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 10px;
          }
          #invoice .no-print { display: none !important; visibility: hidden !important; }
          #invoice .print-only { display: inline !important; visibility: visible !important; }
          .no-print { display: none !important; }
          @page { size: 80mm auto; margin: 0; }
        }

        .print-only { display: none; }
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
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef5350' }}>{unpaidDuesYears.length}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-text)' }}>Years Unpaid</p>
          </div>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center', boxShadow: 'var(--shadow)', borderTop: '3px solid #1565c0' }}>
            <p style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1565c0' }}>Rs. {totalPaid.toLocaleString()}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-text)' }}>Total Collected</p>
          </div>
        </div>

        {/* ═══ PRIOR DUES BOX (2020 se pehle) ═══ */}
        <div className="prior-dues-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <p style={{ fontWeight: '700', fontSize: '1rem', color: '#92400e', marginBottom: '4px' }}>
                📋 Pre-2020 Pending Dues
              </p>
              <p style={{ fontSize: '0.78rem', color: '#a16207' }}>
                2020 se pehle ki jo bhi fees pending hai woh yahan likho (local register se dekh kar)
              </p>
            </div>
            {!priorDuesEditing && (
              <button
                onClick={() => setPriorDuesEditing(true)}
                style={{
                  backgroundColor: '#f59e0b', color: 'white', border: 'none',
                  padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '0.82rem', fontWeight: '600',
                }}
              >
                ✏️ Edit
              </button>
            )}
          </div>

          <div style={{ marginTop: '1rem' }}>
            {priorDuesEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#92400e' }}>Rs.</span>
                <input
                  type="number"
                  value={priorDuesAmount}
                  onChange={(e) => setPriorDuesAmount(e.target.value)}
                  placeholder="0"
                  style={{
                    border: '2px solid #f59e0b',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#92400e',
                    width: '160px',
                    outline: 'none',
                    backgroundColor: 'white',
                  }}
                />
                <button
                  onClick={savePriorDues}
                  disabled={priorDuesSaving}
                  style={{
                    backgroundColor: 'var(--green-main)', color: 'white', border: 'none',
                    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '0.88rem', fontWeight: '600',
                  }}
                >
                  {priorDuesSaving ? '⏳ Saving...' : '✅ Save'}
                </button>
                <button
                  onClick={() => setPriorDuesEditing(false)}
                  style={{
                    backgroundColor: '#ef5350', color: 'white', border: 'none',
                    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '0.88rem', fontWeight: '600',
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
            ) : (
              <div style={{
                display: 'inline-block',
                backgroundColor: hasPriorDues ? '#fef3c7' : '#d1fae5',
                border: `2px solid ${hasPriorDues ? '#f59e0b' : 'var(--green-main)'}`,
                borderRadius: '10px',
                padding: '0.6rem 1.2rem',
              }}>
                <span style={{
                  fontSize: '1.3rem', fontWeight: '800',
                  color: hasPriorDues ? '#92400e' : 'var(--green-dark)',
                }}>
                  {hasPriorDues ? `Rs. ${Number(priorDuesAmount).toLocaleString()}` : '✅ No Prior Dues'}
                </span>
              </div>
            )}
          </div>
        </div>
        {/* ════════════════════════════════════ */}

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
                          onClick={() => {
                            setSelectedInvoice({
                              ...fee,
                              year,
                              memberName: member?.name ?? '',
                              fatherName: member?.father_name ?? '',
                              memberId: member?.id ?? '',
                              phone: member?.phone ?? '',
                            });
                            setCustomDueAmount(String(totalDuesAmount));
                          }}
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
              backgroundColor: 'white', borderRadius: 'var(--radius)', padding: '1rem',
              width: '100%', maxWidth: '380px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              maxHeight: '90vh', overflowY: 'auto',
            }} id="invoice">

              {/* ── COMPACT HEADER ── */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid var(--green-main)', paddingBottom: '6px', marginBottom: '8px' }}>
                <p style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--green-dark)' }}>🕌 Naliya Mandwi Junagadh Muslim Welfare Jamat</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--gray-text)' }}>Fee Receipt</p>
              </div>

              {/* ── MEMBER INFO: 2-column grid ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px', marginBottom: '8px' }}>
                {([
                  ['Name', selectedInvoice.memberName],
                  ['Father', selectedInvoice.fatherName],
                  ['Member ID', selectedInvoice.memberId],
                  ['Phone', selectedInvoice.phone],
                  ['Year', String(selectedInvoice.year)],
                  ['Paid Date', selectedInvoice.paid_date ?? '—'],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} style={{ borderBottom: '1px solid #f0f0f0', padding: '3px 0' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--gray-text)', display: 'block' }}>{label}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-dark)' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* ── AMOUNT BADGE ── */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8f5e9', borderRadius: '6px', padding: '5px 10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--green-dark)' }}>Amount Paid</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--green-dark)' }}>Rs. 1,000 ✅</span>
              </div>

              {/* ── MAINTENANCE HISTORY ── */}
              <div style={{ borderTop: '1.5px dashed #ccc', paddingTop: '6px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-dark)' }}>📊 Maintenance History</span>
                  {allClear ? (
                    <span style={{ fontSize: '0.68rem', backgroundColor: '#e8f5e9', color: 'var(--green-dark)', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>✅ ALL CLEAR</span>
                  ) : (
                    <span style={{ fontSize: '0.68rem', backgroundColor: '#fff3e0', color: '#e65100', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
                      ⚠️ Due: Rs. {(totalDuesAmount + Number(priorDuesAmount || 0)).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Prior dues row */}
                {hasPriorDues && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid #f5f5f5' }}>
                    <span style={{ fontSize: '0.7rem', color: '#92400e', fontWeight: '600' }}>📋 Pre-2020</span>
                    <span style={{ fontSize: '0.7rem', color: '#92400e', fontWeight: '700' }}>Rs. {Number(priorDuesAmount).toLocaleString()} pending</span>
                  </div>
                )}

                {/* Year rows — compact 2 per line */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px 8px', marginTop: '3px' }}>
                  {duesYears.map((d) => (
                    <div key={d.year} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--gray-text)', fontWeight: '600' }}>{d.year}</span>
                      {d.paid ? (
                        <span style={{ fontSize: '0.68rem', color: 'var(--green-dark)', fontWeight: '700' }}>✅ {d.paidDate ?? ''}</span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', color: '#ef5350', fontWeight: '700' }}>❌ Unpaid</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Custom amount adjust - screen only */}
                {!allClear && (
                  <div className="no-print" style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#e65100', fontWeight: '600' }}>✏️ Adjust:</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#bf360c' }}>Rs.</span>
                    <input
                      type="number"
                      value={customDueAmount}
                      onChange={(e) => setCustomDueAmount(e.target.value)}
                      style={{ border: '1.5px solid #ff9800', borderRadius: '5px', padding: '2px 6px', fontSize: '0.78rem', fontWeight: '700', color: '#bf360c', width: '100px', outline: 'none' }}
                    />
                  </div>
                )}
              </div>

              {/* ── SIGNATURE ── */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1.5px solid var(--green-main)', paddingTop: '8px', marginBottom: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid #333', width: '110px', marginBottom: '3px' }} />
                  <p style={{ fontSize: '0.65rem', color: 'var(--gray-text)' }}>Authorized Signature</p>
                </div>
              </div>

              {/* ── BUTTONS ── */}
              <div className="no-print" style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={printInvoice} style={{ flex: 1, backgroundColor: 'var(--green-main)', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>🖨️ Print</button>
                <button onClick={() => shareWhatsApp(selectedInvoice)} style={{ flex: 1, backgroundColor: '#25d366', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>📱 WhatsApp</button>
                <button onClick={() => setSelectedInvoice(null)} style={{ flex: 1, backgroundColor: '#ef5350', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>✕ Close</button>
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}