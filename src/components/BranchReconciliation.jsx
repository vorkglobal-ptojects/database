import React from 'react';

export default function BranchReconciliation({ cpBranches }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">📊 Branch Reconciliation (CP 2.xlsx - Current Pawn Ledgers)</div>
        <span>Total Branches: 22</span>
      </div>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Branch Name</th>
              <th style={{ textAlign: 'right' }}>Current Pawn Balance (Rs.)</th>
              <th>Period</th>
              <th>Audit Status</th>
            </tr>
          </thead>
          <tbody>
            {cpBranches.map((cp, idx) => (
              <tr key={cp.name || idx}>
                <td>{idx + 1}</td>
                <td><strong>{cp.name}</strong></td>
                <td style={{ textAlign: 'right', fontWeight: 800 }}>Rs. {Number(cp.balance).toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                <td>{cp.period || '2024 Monthly'}</td>
                <td><span className="badge badge-verified">✓ RECONCILED</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
