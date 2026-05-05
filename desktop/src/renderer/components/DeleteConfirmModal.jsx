import React from 'react';

export default function DeleteConfirmModal({ item, onClose, onConfirm }) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content delete-dialog">
        <div className="delete-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h3 className="delete-title">Confirm Deletion</h3>
        <p className="delete-description">
          You are about to permanently delete{' '}
          <span className="delete-highlight">[{item?.id}] {item?.name}</span>.
          This action cannot be undone.
        </p>

        <div className="delete-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
