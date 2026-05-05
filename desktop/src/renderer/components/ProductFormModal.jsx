import React, { useState } from 'react';

function FormField({ label, value, onChange, error, disabled, placeholder, type, step, fullWidth }) {
  return (
    <div className={`form-group ${fullWidth ? 'full' : ''}`}>
      <label className="form-label">{label}</label>
      <input
        type={type || 'text'}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`form-input ${error ? 'error' : ''}`}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export default function ProductFormModal({ type, initialData, onClose, onSubmit }) {
  const isEdit = type === 'edit';
  const [formData, setFormData] = useState(initialData || {
    id: '',
    name: '',
    purchase_price: '',
    original_sell_price: '',
    discount: '1.0',
    quantity: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};

    if (!formData.id || String(formData.id).trim() === '') {
      errs.id = 'ID is required';
    }
    if (!formData.name || String(formData.name).trim() === '') {
      errs.name = 'Name is required';
    }

    const pp = Number(formData.purchase_price);
    if (isNaN(pp) || pp < 0) {
      errs.purchase_price = 'Must be a non-negative number';
    }

    const sp = Number(formData.original_sell_price);
    if (isNaN(sp) || sp < 0) {
      errs.original_sell_price = 'Must be a non-negative number';
    }

    const disc = Number(formData.discount);
    if (isNaN(disc) || disc < 0 || disc > 1) {
      errs.discount = 'Must be between 0 and 1';
    }

    const qty = Number(formData.quantity);
    if (isNaN(qty) || !Number.isInteger(qty) || qty < 0) {
      errs.quantity = 'Must be a non-negative integer';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        id: formData.id,
        name: formData.name,
        purchase_price: Number(formData.purchase_price),
        original_sell_price: Number(formData.original_sell_price),
        discount: Number(formData.discount),
        quantity: Number(formData.quantity),
      });
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const discount = Number(formData.discount) || 0;
  const originalPrice = Number(formData.original_sell_price) || 0;
  const purchasePrice = Number(formData.purchase_price) || 0;
  const discountedPrice = originalPrice * discount;
  const unitProfit = discountedPrice - purchasePrice;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? 'Edit Goods' : 'Add New Goods'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <FormField
              label="Goods ID"
              value={formData.id}
              onChange={(v) => handleFieldChange('id', v)}
              error={errors.id}
              disabled={isEdit}
              placeholder="Unique ID e.g. 1001"
            />
            <FormField
              label="Goods Name"
              value={formData.name}
              onChange={(v) => handleFieldChange('name', v)}
              error={errors.name}
              placeholder="Enter name"
            />
            <FormField
              label="Purchase Price ($)"
              type="number"
              step="0.01"
              value={formData.purchase_price}
              onChange={(v) => handleFieldChange('purchase_price', v)}
              error={errors.purchase_price}
            />
            <FormField
              label="Sell Price ($)"
              type="number"
              step="0.01"
              value={formData.original_sell_price}
              onChange={(v) => handleFieldChange('original_sell_price', v)}
              error={errors.original_sell_price}
            />
            <FormField
              label="Discount (0~1)"
              type="number"
              step="0.05"
              value={formData.discount}
              onChange={(v) => handleFieldChange('discount', v)}
              error={errors.discount}
              placeholder="e.g. 0.8 = 20% off"
            />
            <FormField
              label="Quantity"
              type="number"
              step="1"
              value={formData.quantity}
              onChange={(v) => handleFieldChange('quantity', v)}
              error={errors.quantity}
            />
          </div>

          <div className="preview-panel">
            <div className="preview-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
              Auto-Calculated Preview
            </div>
            <div className="preview-grid">
              <div className="preview-item">
                <span className="preview-item-label">Discounted Unit Price</span>
                <span className="preview-item-value">${discountedPrice.toFixed(2)}</span>
              </div>
              <div className="preview-item">
                <span className="preview-item-label">Unit Profit</span>
                <span className={`preview-item-value ${unitProfit >= 0 ? 'green' : ''}`}>
                  ${unitProfit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {isEdit ? 'Update Goods' : 'Save Goods'}
          </button>
        </div>
      </div>
    </div>
  );
}
