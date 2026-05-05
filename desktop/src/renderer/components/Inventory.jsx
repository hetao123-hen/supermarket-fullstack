import React, { useState, useEffect } from 'react';

const LOW_STOCK_THRESHOLD = 10;

function SummaryCard({ label, value, sub, icon, accent }) {
  return (
    <div className="inventory-card">
      <div className="inv-card-header">
        <span className={`inv-card-icon ${accent}`}>{icon}</span>
        <span className="inv-card-label">{label}</span>
      </div>
      <div className="inv-card-value">{value}</div>
      {sub && <div className="inv-card-sub">{sub}</div>}
    </div>
  );
}

export default function Inventory() {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await window.api.goods.list({});
        setGoods(data);
      } catch (e) {
        console.error('Failed to load goods:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="inventory-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  const totalSku = goods.length;
  const totalStock = goods.reduce((sum, g) => sum + g.quantity, 0);
  const totalValue = goods.reduce((sum, g) => sum + g.purchase_price * g.quantity, 0);
  const totalProfit = goods.reduce((sum, g) => sum + g.profit, 0);
  const avgProfitPerUnit = totalStock > 0 ? totalProfit / totalStock : 0;

  const lowStock = goods
    .filter(g => g.quantity <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.quantity - b.quantity);

  const inventoryRows = goods
    .map(g => ({
      ...g,
      totalCost: g.purchase_price * g.quantity,
    }))
    .sort((a, b) => a.quantity - b.quantity);

  return (
    <div className="inventory-page">
      {/* Summary Cards */}
      <div className="inv-cards-row">
        <SummaryCard
          label="Total SKUs"
          value={totalSku}
          sub="Registered products"
          accent="indigo"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" />
            </svg>
          }
        />
        <SummaryCard
          label="Total Stock"
          value={totalStock.toLocaleString()}
          sub="Items in warehouse"
          accent="blue"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          }
        />
        <SummaryCard
          label="Inventory Value"
          value={`$${totalValue.toFixed(2)}`}
          sub="Cost basis (buy price x qty)"
          accent="emerald"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <SummaryCard
          label="Potential Profit"
          value={`$${totalProfit.toFixed(2)}`}
          sub={`Avg $${avgProfitPerUnit.toFixed(2)} per unit`}
          accent="rose"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
            </svg>
          }
        />
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="inv-section">
          <div className="inv-section-header">
            <h2 className="inv-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#e11d48' }}>
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Low Stock Alerts
              <span className="inv-badge-warn">{lowStock.length}</span>
            </h2>
            <span className="inv-section-sub">Items with quantity &le; {LOW_STOCK_THRESHOLD}</span>
          </div>
          <div className="inv-table-wrap">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th className="right">Quantity</th>
                  <th className="right">Buy Price</th>
                  <th className="right">Sell Price</th>
                  <th className="right">Potential Profit</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map(item => (
                  <tr key={item.id}>
                    <td className="cell-id">{item.id}</td>
                    <td className="cell-name">{item.name}</td>
                    <td className="right">
                      <span className="stock-badge-danger">{item.quantity}</span>
                    </td>
                    <td className="right mono">${item.purchase_price.toFixed(2)}</td>
                    <td className="right mono">${item.discounted_sell_price.toFixed(2)}</td>
                    <td className="right mono">${item.profit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Inventory Table */}
      <div className="inv-section">
        <div className="inv-section-header">
          <h2 className="inv-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6366f1' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            Inventory Breakdown
          </h2>
          <span className="inv-section-sub">Sorted by quantity (lowest first)</span>
        </div>
        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th className="right">Quantity</th>
                <th className="right">Unit Cost</th>
                <th className="right">Total Cost</th>
                <th className="right">Sell Price</th>
                <th className="right">Potential Profit</th>
                <th className="right">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {inventoryRows.map(item => {
                const margin = item.totalCost > 0
                  ? ((item.profit / item.totalCost) * 100)
                  : 0;
                return (
                  <tr key={item.id}>
                    <td className="cell-id">{item.id}</td>
                    <td className="cell-name">{item.name}</td>
                    <td className="right">
                      {item.quantity <= LOW_STOCK_THRESHOLD ? (
                        <span className="stock-badge-warn">{item.quantity}</span>
                      ) : (
                        <span className="mono">{item.quantity}</span>
                      )}
                    </td>
                    <td className="right mono">${item.purchase_price.toFixed(2)}</td>
                    <td className="right mono">${(item.purchase_price * item.quantity).toFixed(2)}</td>
                    <td className="right mono">${item.discounted_sell_price.toFixed(2)}</td>
                    <td className={`right mono ${item.profit > 0 ? 'profit-pos' : 'profit-zero'}`}>
                      ${item.profit.toFixed(2)}
                    </td>
                    <td className={`right mono ${margin > 0 ? 'profit-pos' : 'profit-zero'}`}>
                      {margin.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
