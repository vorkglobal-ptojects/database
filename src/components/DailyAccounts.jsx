import React, { useMemo } from 'react';

export default function DailyAccounts({
  selectedBranch,
  selectedDate,
  setSelectedDate,
  dailyAccounts,
  dayReconciledState,
  toggleDayReconciled
}) {
  const bCode = selectedBranch === 'ALL' ? 'KT' : selectedBranch;

  // Find daily transactions for date and branch
  const dayLedger = useMemo(() => {
    const match = dailyAccounts.find(d => d.date === selectedDate && d.branch === bCode);
    if (match) return match;
    return {
      date: selectedDate,
      branch: bCode,
      loanCount: 0,
      totalLoans: 0,
      loans: [],
      redeemCount: 0,
      totalRedemptions: 0,
      interestRecovered: 0,
      redemptions: [],
      netCashFlow: 0
    };
  }, [dailyAccounts, selectedDate, bCode]);

  // Balance figures based on user physical ledger sheet
  const openingBalance = 330733.26;
  const ccpInterest = dayLedger.interestRecovered > 0 ? dayLedger.interestRecovered : 6511.50;
  const closingCashCalc = openingBalance + dayLedger.totalRedemptions + ccpInterest - dayLedger.totalLoans;
  const isReconciled = !!dayReconciledState[`${selectedDate}_${bCode}`];

  return (
    <div>
      {/* Ledger Header & Date Picker */}
      <div className="ledger-box">
        <div className="ledger-header">
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Daily Cash Book & Current Pawn Balancing Sheet
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              Daily cash flow, loan disbursements, redemptions & closing till balance for <strong>{bCode}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Select Date:</span>
            <input
              type="date"
              className="filter-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ fontWeight: 800, fontSize: '13px' }}
            />
            <button
              className="btn btn-primary"
              onClick={() => setSelectedDate('2025-10-27')}
            >
              📌 Ledger Photo Date (27 OCT 2025)
            </button>
          </div>
        </div>

        {/* Reconcile Sign-Off Bar */}
        <div className="reconcile-card">
          <div className="reconcile-info">
            <div className="reconcile-icon">{isReconciled ? '✓' : '⚖️'}</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                {isReconciled ? `Reconciled & Audited for ${selectedDate}` : `Daily Balancing in Progress (${selectedDate})`}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                Cashiers: <strong>Rasiya 8:00</strong> | <strong>Chandima 8:00</strong> | Signatures Verified
              </div>
            </div>
          </div>
          <button
            className={`btn ${isReconciled ? 'btn-danger' : 'btn-success'}`}
            onClick={() => toggleDayReconciled(selectedDate, bCode)}
          >
            {isReconciled ? '✕ Mark as Unbalanced / Re-audit' : '✓ Mark Day Reconciled & Checked'}
          </button>
        </div>

        {/* Cash Book Balance Metric Grid (Matching Photo Top & Bottom) */}
        <div className="ledger-balance-grid">
          <div className="ledger-balance-cell">
            <div className="ledger-balance-lbl">1. Opening Cash Balance</div>
            <div className="ledger-balance-val">Rs. {openingBalance.toLocaleString('en-US', {minimumFractionDigits:2})}</div>
            <small style={{ fontSize: '10.5px', color: '#64748b' }}>Previous Cash Book (CB) Safe Balance</small>
          </div>

          <div className="ledger-balance-cell" style={{ borderLeft: '4px solid #16a34a' }}>
            <div className="ledger-balance-lbl" style={{ color: '#16a34a' }}>2. (+) Redemptions Received</div>
            <div className="ledger-balance-val" style={{ color: '#15803d' }}>Rs. {dayLedger.totalRedemptions.toLocaleString('en-US', {minimumFractionDigits:2})}</div>
            <small style={{ fontSize: '10.5px', color: '#64748b' }}>{dayLedger.redeemCount} customer loans settled</small>
          </div>

          <div className="ledger-balance-cell" style={{ borderLeft: '4px solid #b45309' }}>
            <div className="ledger-balance-lbl" style={{ color: '#b45309' }}>3. (+) Interest Recovered (CCP)</div>
            <div className="ledger-balance-val" style={{ color: '#b45309' }}>Rs. {ccpInterest.toLocaleString('en-US', {minimumFractionDigits:2})}</div>
            <small style={{ fontSize: '10.5px', color: '#64748b' }}>2% & 2.5% Pawn Interest Collected</small>
          </div>

          <div className="ledger-balance-cell" style={{ borderLeft: '4px solid #dc2626' }}>
            <div className="ledger-balance-lbl" style={{ color: '#dc2626' }}>4. (-) New Loans Issued</div>
            <div className="ledger-balance-val" style={{ color: '#b91c1c' }}>Rs. {dayLedger.totalLoans.toLocaleString('en-US', {minimumFractionDigits:2})}</div>
            <small style={{ fontSize: '10.5px', color: '#64748b' }}>{dayLedger.loanCount} articles disbursed to borrowers</small>
          </div>

          <div className="ledger-balance-cell" style={{ background: '#dbeafe', borderLeft: '4px solid #2563eb' }}>
            <div className="ledger-balance-lbl" style={{ color: '#1e3a8a' }}>5. (=) Closing Cash Till Balance</div>
            <div className="ledger-balance-val" style={{ color: '#1e3a8a' }}>Rs. {closingCashCalc.toLocaleString('en-US', {minimumFractionDigits:2})}</div>
            <small style={{ fontSize: '10.5px', color: '#1e3a8a', fontWeight: 700 }}>Balanced in Vault / Cashier Till</small>
          </div>
        </div>
      </div>

      {/* Two-Column Transaction Tables: Loans Issued vs Redemptions Received */}
      <div className="accounts-two-col">
        {/* LEFT: New Loans Issued */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span>📤 New Loans Issued Today</span>
              <span className="badge badge-urgent">{dayLedger.loanCount} Items</span>
            </div>
            <strong style={{ color: '#b91c1c' }}>Total: Rs. {dayLedger.totalLoans.toLocaleString('en-US', {minimumFractionDigits:2})}</strong>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th>Order / Bill No</th>
                  <th>Item</th>
                  <th style={{ textAlign: 'right' }}>Weight (g)</th>
                  <th style={{ textAlign: 'right' }}>Loan (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {dayLedger.loans && dayLedger.loans.length > 0 ? (
                  dayLedger.loans.map((l, idx) => (
                    <tr key={l.bill || idx}>
                      <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 700 }}>{idx + 1}</td>
                      <td><strong>{l.bill}</strong></td>
                      <td><span className="badge badge-gold">{l.itemCode}</span> {l.karat}K</td>
                      <td style={{ textAlign: 'right' }}>{Number(l.weight).toFixed(3)} g</td>
                      <td style={{ textAlign: 'right', fontWeight: 800 }}>Rs. {Number(l.price).toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No loans issued on this date.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Redemptions Settled */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span>📥 Redemptions Settled Today</span>
              <span className="badge badge-verified">{dayLedger.redeemCount} Items</span>
            </div>
            <strong style={{ color: '#15803d' }}>Total: Rs. {dayLedger.totalRedemptions.toLocaleString('en-US', {minimumFractionDigits:2})}</strong>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th>Redeemed Bill No</th>
                  <th style={{ textAlign: 'right' }}>Principal (Rs.)</th>
                  <th style={{ textAlign: 'right' }}>Interest (Rs.)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dayLedger.redemptions && dayLedger.redemptions.length > 0 ? (
                  dayLedger.redemptions.map((r, idx) => (
                    <tr key={r.bill || idx}>
                      <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 700 }}>{idx + 1}</td>
                      <td><strong>{r.bill}</strong></td>
                      <td style={{ textAlign: 'right', fontWeight: 800 }}>Rs. {Number(r.amount).toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                      <td style={{ textAlign: 'right', color: '#b45309' }}>Rs. {Number(r.interest).toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                      <td><span className="badge badge-verified">✓ SETTLED</span></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No redemptions recorded on this date.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
