import React from 'react';

export default function SearchPanel({
  keyword,
  onKeywordChange,
  dateRange,
  onDateRangeChange,
  showAdvanced,
  onToggleAdvanced,
  dateSegments,
  onSearch,
  onReset,
}) {
  return (
    <div className="search-panel">
      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by goods name or ID..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
          />
        </div>
        <div className="search-divider" />
        <button
          className={`search-advanced-toggle ${showAdvanced ? 'active' : ''}`}
          onClick={onToggleAdvanced}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          Advanced Filter
        </button>
      </div>

      {showAdvanced && (
        <div className="search-advanced">
          <div className="search-filters">
            <div className="filter-group">
              <label className="filter-label">Import Date (Start)</label>
              <input
                type="text"
                className="filter-input"
                placeholder="YYYY/M/D"
                value={dateRange.start}
                onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Import Date (End)</label>
              <input
                type="text"
                className="filter-input"
                placeholder="YYYY/M/D"
                value={dateRange.end}
                onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <div className="search-actions">
              <button className="btn btn-secondary btn-sm" onClick={onSearch}>
                Apply Filter
              </button>
              <button className="btn btn-ghost btn-sm" onClick={onReset}>
                Reset
              </button>
            </div>
          </div>

          {dateSegments.length > 0 && (
            <div className="date-segments">
              <div className="segments-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
                Smart Reference: Available Date Segments with Data
              </div>
              <div className="segments-list">
                {dateSegments.map((seg, i) => (
                  <button
                    key={i}
                    className="segment-chip"
                    onClick={() => onDateRangeChange({ start: seg.start_date, end: seg.end_date })}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {seg.start_date} to {seg.end_date}
                    <span className="segment-days">{seg.days} days</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
