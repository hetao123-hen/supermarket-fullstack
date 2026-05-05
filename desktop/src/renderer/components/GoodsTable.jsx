import React from 'react';

function SortIcon({ active, order }) {
  if (!active) {
    return (
      <span className="sort-icon">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" />
        </svg>
      </span>
    );
  }
  return (
    <span className="sort-icon active">
      {order === 'asc' ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m18 15-6-6-6 6" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      )}
    </span>
  );
}

export default function GoodsTable({
  goods,
  loading,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
}) {
  const renderSortableHeader = (label, key, align = 'left') => (
    <th className={`sortable ${align}`} onClick={() => onSort(key)}>
      <span className="sort-header">
        {label}
        <SortIcon active={sortConfig.key === key} order={sortConfig.order} />
      </span>
    </th>
  );

  return (
    <div className="table-container">
      <div className="table-scroll">
        <table className="goods-table">
          <thead>
            <tr>
              {renderSortableHeader('ID', 'id')}
              <th>Name</th>
              <th className="right">Buy Price</th>
              <th className="right">Sell Price</th>
              <th className="center">Discount</th>
              {renderSortableHeader('Profit', 'profit', 'right')}
              <th className="right">Stock</th>
              {renderSortableHeader('Import Time', 'import_time')}
              <th className="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9">
                  <div className="table-state">
                    <div className="loading-spinner" />
                  </div>
                </td>
              </tr>
            ) : goods.length === 0 ? (
              <tr>
                <td colSpan="9">
                  <div className="table-state empty-state">
                    <div className="empty-state-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    </div>
                    No goods data available
                  </div>
                </td>
              </tr>
            ) : (
              goods.map((item) => (
                <tr key={item.id + item.import_time}>
                  <td className="cell-id">{item.id}</td>
                  <td className="cell-name">{item.name}</td>
                  <td className="cell-number">${item.purchase_price.toFixed(2)}</td>
                  <td>
                    <div className="price-stack">
                      <div className="price-discounted">${item.discounted_sell_price.toFixed(2)}</div>
                      {item.discount < 1 && (
                        <div className="price-original">${item.original_sell_price.toFixed(2)}</div>
                      )}
                    </div>
                  </td>
                  <td className="center">
                    {item.discount < 1 ? (
                      <span className="discount-badge active">
                        {Math.round(item.discount * 10)}% Off
                      </span>
                    ) : (
                      <span className="discount-badge none">-</span>
                    )}
                  </td>
                  <td className={`cell-profit ${item.profit > 0 ? 'positive' : 'zero'}`}>
                    {item.profit > 0 ? '+' : ''}${item.profit.toFixed(2)}
                  </td>
                  <td className="cell-number">{item.quantity}</td>
                  <td className="time-cell">
                    <div className="time-date">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {item.import_time_text?.split(' ')[0] || '-'}
                    </div>
                    <div className="time-time">
                      {item.import_time_text?.split(' ')[1] || ''}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn"
                        onClick={() => onEdit(item)}
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </button>
                      <button
                        className="action-btn danger"
                        onClick={() => onDelete(item)}
                        title="Delete"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Total {totalCount} records found</span>
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
            .map((p, idx, arr) => (
              <React.Fragment key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span style={{ padding: '4px 4px', color: 'var(--slate-300)' }}>...</span>
                )}
                <button
                  className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </button>
              </React.Fragment>
            ))}
          <button
            className="pagination-btn"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
