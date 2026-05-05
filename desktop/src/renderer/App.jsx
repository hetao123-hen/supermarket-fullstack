import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import GoodsTable from './components/GoodsTable';
import SearchPanel from './components/SearchPanel';
import ProductFormModal from './components/ProductFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Inventory from './components/Inventory';
import Toast from './components/Toast';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'import_time', order: 'desc' });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateSegments, setDateSegments] = useState([]);
  const [modal, setModal] = useState({ type: 'none', data: null });
  const [toasts, setToasts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const fetchGoods = useCallback(async () => {
    setLoading(true);
    try {
      const result = await window.api.goods.list({
        keyword,
        startDate: dateRange.start,
        endDate: dateRange.end,
        sortBy: sortConfig.key,
        order: sortConfig.order,
      });
      setGoods(result);
    } catch (e) {
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  }, [keyword, dateRange, sortConfig, showToast]);

  useEffect(() => {
    fetchGoods();
    window.api.goods.dateSegments().then(segments => {
      if (segments) setDateSegments(segments);
    });
  }, [fetchGoods]);

  useEffect(() => {
    if (window.api.onMenuExport) {
      window.api.onMenuExport(() => {
        handleExport();
      });
    }
    if (window.api.onMenuImport) {
      window.api.onMenuImport(() => {
        handleImport();
      });
    }
  }, []);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      order: prev.key === key && prev.order === 'desc' ? 'asc' : 'desc',
    }));
    setCurrentPage(1);
  };

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    fetchGoods();
  }, [fetchGoods]);

  const handleReset = () => {
    setKeyword('');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  };

  const handleFormSubmit = async (formData) => {
    const isEdit = modal.type === 'edit';
    const action = isEdit
      ? window.api.goods.update(formData.id, formData)
      : window.api.goods.add(formData);

    const res = await action;
    if (res.success) {
      showToast(res.message, 'success');
      setModal({ type: 'none', data: null });
      fetchGoods();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!modal.data?.id) return;
    const res = await window.api.goods.delete(modal.data.id);
    if (res.success) {
      showToast('Goods permanently deleted', 'success');
      setModal({ type: 'none', data: null });
      fetchGoods();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleExport = async () => {
    const res = await window.api.goods.export();
    if (res.success) {
      showToast(res.message, 'success');
    } else if (res.message !== 'Export cancelled') {
      showToast(res.message, 'error');
    }
  };

  const handleImport = async () => {
    const res = await window.api.goods.import();
    if (res.success) {
      showToast(res.message, 'success');
      fetchGoods();
    } else if (res.message !== 'Import cancelled') {
      showToast(res.message, 'error');
    }
  };

  const totalPages = Math.max(1, Math.ceil(goods.length / pageSize));
  const paginatedGoods = goods.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const headerTitle = currentView === 'dashboard'
    ? 'Goods Management'
    : 'Inventory Analysis';

  return (
    <div className="app-container">
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onExport={handleExport}
        onImport={handleImport}
      />

      <main className="main-content">
        <header className="main-header">
          <h1 className="header-title">{headerTitle}</h1>
          <div className="header-actions">
            {currentView === 'dashboard' && (
              <button
                onClick={() => setModal({ type: 'add', data: null })}
                className="btn btn-primary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Goods
              </button>
            )}
          </div>
        </header>

        <div className="content-body">
          <div className="content-wrapper">
            {currentView === 'dashboard' ? (
              <>
                <SearchPanel
                  keyword={keyword}
                  onKeywordChange={setKeyword}
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  showAdvanced={showAdvanced}
                  onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
                  dateSegments={dateSegments}
                  onSearch={handleSearch}
                  onReset={handleReset}
                />
                <GoodsTable
                  goods={paginatedGoods}
                  loading={loading}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onEdit={(item) => setModal({ type: 'edit', data: item })}
                  onDelete={(item) => setModal({ type: 'delete', data: item })}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={goods.length}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <Inventory />
            )}
          </div>
        </div>
      </main>

      {(modal.type === 'add' || modal.type === 'edit') && (
        <ProductFormModal
          isOpen={true}
          type={modal.type}
          initialData={modal.data}
          onClose={() => setModal({ type: 'none', data: null })}
          onSubmit={handleFormSubmit}
        />
      )}

      {modal.type === 'delete' && (
        <DeleteConfirmModal
          isOpen={true}
          item={modal.data}
          onClose={() => setModal({ type: 'none', data: null })}
          onConfirm={handleDeleteConfirm}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
