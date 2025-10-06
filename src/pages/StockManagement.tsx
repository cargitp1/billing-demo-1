import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, FileText, FileCheck, LogOut, Package, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import { supabase } from '../utils/supabase';
import { format } from 'date-fns';

interface StockData {
  size: number;
  total_stock: number;
  on_rent_stock: number;
  borrowed_stock: number;
  lost_stock: number;
  available_stock: number;
  updated_at: string;
}

const StockManagement: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [stocks, setStocks] = useState<StockData[]>([]);
  const [editingSize, setEditingSize] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ total_stock: number; lost_stock: number }>({
    total_stock: 0,
    lost_stock: 0,
  });
  const [editAllMode, setEditAllMode] = useState(false);
  const [allEditValues, setAllEditValues] = useState<{ [key: number]: { total_stock: number; lost_stock: number } }>({});

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    const { data, error } = await supabase
      .from('stock')
      .select('*')
      .order('size');

    // Debug: log raw response so developer can inspect why there are no rows
    // Open browser devtools console to see this output when visiting /stock
    console.log('fetchStock response:', { data, error });

    if (error) {
      console.error('Error fetching stock:', error);
    } else {
      // Recompute available_stock using formula: total_stock - on_rent_stock - lost_stock
      const computed = (data || []).map((s: any) => ({
        ...s,
        available_stock: Math.max(0, (s.total_stock || 0) - (s.on_rent_stock || 0) - (s.lost_stock || 0))
      }));

      setStocks(computed);
    }
  };

  const handleEdit = (stock: StockData) => {
    setEditingSize(stock.size);
    setEditValues({
      total_stock: stock.total_stock,
      lost_stock: stock.lost_stock,
    });
  };

  const handleSave = async (size: number) => {
    if (editValues.total_stock < 0 || editValues.lost_stock < 0) {
      alert(t('invalidStock'));
      return;
    }

    const { error } = await supabase
      .from('stock')
      .update({
        total_stock: editValues.total_stock,
        lost_stock: editValues.lost_stock,
      })
      .eq('size', size);

    if (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock');
    } else {
      alert(t('stockUpdated'));
      setEditingSize(null);
      fetchStock();
    }
  };

  const handleCancel = () => {
    setEditingSize(null);
  };

  const handleEditAll = () => {
    setEditAllMode(true);
    const values: { [key: number]: { total_stock: number; lost_stock: number } } = {};
    stocks.forEach(stock => {
      values[stock.size] = {
        total_stock: stock.total_stock,
        lost_stock: stock.lost_stock,
      };
    });
    setAllEditValues(values);
  };

  const handleSaveAll = async () => {
    for (const size in allEditValues) {
      const values = allEditValues[parseInt(size)];
      if (values.total_stock < 0 || values.lost_stock < 0) {
        alert(t('invalidStock'));
        return;
      }
    }

    try {
      for (const size in allEditValues) {
        const values = allEditValues[parseInt(size)];
        const { error } = await supabase
          .from('stock')
          .update({
            total_stock: values.total_stock,
            lost_stock: values.lost_stock,
          })
          .eq('size', parseInt(size));

        if (error) throw error;
      }

      alert(t('stockUpdated'));
      setEditAllMode(false);
      fetchStock();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock');
    }
  };

  const handleCancelAll = () => {
    setEditAllMode(false);
    setAllEditValues({});
  };

  const getAvailabilityColor = (available: number) => {
    if (available === 0) return 'text-red-600 font-bold';
    if (available < 10) return 'text-yellow-600 font-semibold';
    return 'text-green-600 font-semibold';
  };

  const totalAvailable = stocks.reduce((sum, stock) => sum + stock.available_stock, 0);
  const totalOnRent = stocks.reduce((sum, stock) => sum + stock.on_rent_stock, 0);
  const totalLost = stocks.reduce((sum, stock) => sum + stock.lost_stock, 0);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="flex flex-col w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">{t('appName')}</h1>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
            >
              <span>{t('dashboard')}</span>
            </button>
            <button
              onClick={() => navigate('/clients')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-blue-50 hover:text-blue-600"
            >
              <UserPlus size={20} />
              <span>{t('addClient')}</span>
            </button>
            <button
              onClick={() => navigate('/udhar-challan')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-red-50 hover:text-red-600"
            >
              <FileText size={20} />
              <span>{t('udharChallan')}</span>
            </button>
            <button
              onClick={() => navigate('/jama-challan')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-green-50 hover:text-green-600"
            >
              <FileCheck size={20} />
              <span>{t('jamaChallan')}</span>
            </button>
            <button
              onClick={() => navigate('/challan-book')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
            >
              <BookOpen size={20} />
              <span>{t('challanBook')}</span>
            </button>
            <button
              onClick={() => navigate('/stock')}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-900 bg-gray-100 border-l-4 border-gray-600 rounded-lg"
            >
              <Package size={20} />
              <span>{t('stockManagement')}</span>
            </button>
          </div>
        </nav>

        <div className="p-4 space-y-4 border-t">
          <div className="flex justify-center">
            <LanguageToggle />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
          >
            <LogOut size={20} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">{t('stockManagement')}</h2>

          <div className="grid gap-6 mb-8 md:grid-cols-3">
            <div className="p-6 bg-white border-l-4 border-green-600 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('totalAvailable')}</p>
                  <p className="text-3xl font-bold text-green-600">{totalAvailable}</p>
                </div>
                <Package size={48} className="text-green-600 opacity-20" />
              </div>
            </div>

            <div className="p-6 bg-white border-l-4 border-blue-600 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('onRent')}</p>
                  <p className="text-3xl font-bold text-blue-600">{totalOnRent}</p>
                </div>
                <FileText size={48} className="text-blue-600 opacity-20" />
              </div>
            </div>

            <div className="p-6 bg-white border-l-4 border-red-600 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('lost')}</p>
                  <p className="text-3xl font-bold text-red-600">{totalLost}</p>
                </div>
                <Package size={48} className="text-red-600 opacity-20" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('stockOverview')}</h3>
              {!editAllMode && !editingSize && (
                <button
                  onClick={handleEditAll}
                  className="px-6 py-2 font-medium text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
                >
                  {t('editAll')}
                </button>
              )}
              {editAllMode && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveAll}
                    className="px-6 py-2 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    {t('saveAll')}
                  </button>
                  <button
                    onClick={handleCancelAll}
                    className="px-6 py-2 font-medium text-white transition-colors bg-gray-500 rounded-lg hover:bg-gray-600"
                  >
                    {t('cancelAll')}
                  </button>
                </div>
              )}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      {t('size')}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      {t('totalStock')}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      {t('onRent')}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      {t('borrowed')}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      {t('lost')}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      {t('available')}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stocks.map((stock) => (
                    <tr key={stock.size} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {stock.size}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {editingSize === stock.size ? (
                          <input
                            type="number"
                            min="0"
                            value={editValues.total_stock}
                            onChange={(e) => setEditValues({ ...editValues, total_stock: parseInt(e.target.value) || 0 })}
                            className="w-24 px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : editAllMode ? (
                          <input
                            type="number"
                            min="0"
                            value={allEditValues[stock.size]?.total_stock || 0}
                            onChange={(e) => setAllEditValues({
                              ...allEditValues,
                              [stock.size]: { ...allEditValues[stock.size], total_stock: parseInt(e.target.value) || 0 }
                            })}
                            className="w-24 px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          stock.total_stock
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {stock.on_rent_stock}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {stock.borrowed_stock}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {editingSize === stock.size ? (
                          <input
                            type="number"
                            min="0"
                            value={editValues.lost_stock}
                            onChange={(e) => setEditValues({ ...editValues, lost_stock: parseInt(e.target.value) || 0 })}
                            className="w-24 px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : editAllMode ? (
                          <input
                            type="number"
                            min="0"
                            value={allEditValues[stock.size]?.lost_stock || 0}
                            onChange={(e) => setAllEditValues({
                              ...allEditValues,
                              [stock.size]: { ...allEditValues[stock.size], lost_stock: parseInt(e.target.value) || 0 }
                            })}
                            className="w-24 px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          stock.lost_stock
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getAvailabilityColor(stock.available_stock)}`}>
                        {stock.available_stock}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {!editAllMode && editingSize === stock.size ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(stock.size)}
                              className="px-3 py-1 text-white bg-green-600 rounded hover:bg-green-700"
                            >
                              {t('save')}
                            </button>
                            <button
                              onClick={handleCancel}
                              className="px-3 py-1 text-white bg-gray-500 rounded hover:bg-gray-600"
                            >
                              {t('cancel')}
                            </button>
                          </div>
                        ) : !editAllMode && !editingSize ? (
                          <button
                            onClick={() => handleEdit(stock)}
                            className="px-3 py-1 text-white bg-blue-600 rounded hover:bg-blue-700"
                          >
                            {t('edit')}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 md:hidden">
              {stocks.map((stock) => (
                <div key={stock.size} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {t('size')} {stock.size}
                    </h4>
                    <span className={`text-lg ${getAvailabilityColor(stock.available_stock)}`}>
                      {t('available')}: {stock.available_stock}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('totalStock')}:</span>
                      {editingSize === stock.size || editAllMode ? (
                        <input
                          type="number"
                          min="0"
                          value={editingSize === stock.size ? editValues.total_stock : allEditValues[stock.size]?.total_stock || 0}
                          onChange={(e) => {
                            if (editingSize === stock.size) {
                              setEditValues({ ...editValues, total_stock: parseInt(e.target.value) || 0 });
                            } else {
                              setAllEditValues({
                                ...allEditValues,
                                [stock.size]: { ...allEditValues[stock.size], total_stock: parseInt(e.target.value) || 0 }
                              });
                            }
                          }}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="font-medium">{stock.total_stock}</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('onRent')}:</span>
                      <span className="font-medium">{stock.on_rent_stock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('borrowed')}:</span>
                      <span className="font-medium">{stock.borrowed_stock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('lost')}:</span>
                      {editingSize === stock.size || editAllMode ? (
                        <input
                          type="number"
                          min="0"
                          value={editingSize === stock.size ? editValues.lost_stock : allEditValues[stock.size]?.lost_stock || 0}
                          onChange={(e) => {
                            if (editingSize === stock.size) {
                              setEditValues({ ...editValues, lost_stock: parseInt(e.target.value) || 0 });
                            } else {
                              setAllEditValues({
                                ...allEditValues,
                                [stock.size]: { ...allEditValues[stock.size], lost_stock: parseInt(e.target.value) || 0 }
                              });
                            }
                          }}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="font-medium">{stock.lost_stock}</span>
                      )}
                    </div>
                  </div>
                  {!editAllMode && editingSize === stock.size && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleSave(stock.size)}
                        className="flex-1 px-3 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                      >
                        {t('save')}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 px-3 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  )}
                  {!editAllMode && !editingSize && (
                    <button
                      onClick={() => handleEdit(stock)}
                      className="w-full px-3 py-2 mt-3 text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      {t('edit')}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {stocks.length > 0 && (
              <div className="mt-4 text-sm text-right text-gray-500">
                {t('lastUpdated')}: {format(new Date(stocks[0].updated_at), 'dd/MM/yyyy HH:mm')}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StockManagement;
