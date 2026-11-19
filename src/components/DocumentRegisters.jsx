import React from 'react';

export default function DocumentRegisters({ sanjayaList, nameMissList }) {
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">📑 MR.SANJAYA.xlsx Register (122 Loans with Full KYC)</div>
          <span>122 Loans</span>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Bill No</th>
                <th>Customer Name</th>
                <th>NIC</th>
                <th>Article</th>
                <th style={{ textAlign: 'right' }}>Loan (Rs.)</th>
                <th>Pawn Date</th>
                <th>Redeem Date</th>
              </tr>
            </thead>
            <tbody>
              {sanjayaList.slice(0, 100).map((s, idx) => (
                <tr key={s.bill || idx}>
                  <td>{idx + 1}</td>
                  <td><strong>{s.bill}</strong></td>
                  <td>{s.name}</td>
                  <td>{s.nic}</td>
                  <td>{s.itemDesc}</td>
                  <td style={{ textAlign: 'right', fontWeight: 800 }}>Rs. {Number(s.loan).toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                  <td>{s.pawnDate}</td>
                  <td>{s.redeemDate || 'Open'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <div className="card-title">📑 Name Miss List Register (67 Manual Loans up to Rs. 2,000,000)</div>
          <span>67 Loans</span>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Customer Name</th>
                <th style={{ textAlign: 'right' }}>Amount (Rs.)</th>
                <th>Status / Settlement Note</th>
              </tr>
            </thead>
            <tbody>
              {nameMissList.map((m, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{m.date}</td>
                  <td><strong>{m.name}</strong></td>
                  <td style={{ textAlign: 'right', fontWeight: 800 }}>Rs. {Number(m.amount).toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                  <td><span className="badge badge-gold">{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
