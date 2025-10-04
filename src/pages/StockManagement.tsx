import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, FileText, FileCheck, LogOut, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import { supabase } from '../utils/supabase';
import { format } from 'date-fns';

interface StockData {
  size: number;
  total_stock: number;
  lost_stock: number;
  on_rent: number;
  borrowed: number;
  available: number;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const { data: stockData, error: stockError } = await supabase
        .from('stock')
        .select('*')
        .order('size');

      if (stockError) throw stockError;

      const enrichedStocks = await Promise.all(
        (stockData || []).map(async (stock) => {
          const { data: onRent } = await supabase.rpc('calculate_on_rent', { p_size: stock.size });
          const { data: borrowed } = await supabase.rpc('calculate_borrowed', { p_size: stock.size });

          const on_rent = onRent || 0;
          const borrowed_qty = borrowed || 0;
          const available = stock.total_stock - on_rent - borrowed_qty - stock.lost_stock;

          return {
            ...stock,
            on_rent,
            borrowed: borrowed_qty,
            available: Math.max(0, available),
          };
        })
      );

      setStocks(enrichedStocks);
    } catch (error) {
      console.error('Error fetching stock:', error);
      alert('Error loading stock data');
    } finally {
      setLoading(false);
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

  const totalAvailable = stocks.reduce((sum, stock) => sum + stock.available, 0);
  const totalOnRent = stocks.reduce((sum, stock) => sum + stock.on_rent, 0);
  const totalLost = stocks.reduce((sum, stock) => sum + stock.lost_stock, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading stock data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">{t('appName')}</h1>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span>{t('dashboard')}</span>
            </button>
            <button
              onClick={() => navigate('/clients')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            >
              <UserPlus size={20} />
              <span>{t('addClient')}</span>
            </button>
            <button
              onClick={() => navigate('/udhar-challan')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <FileText size={20} />
              <span>{t('udharChallan')}</span>
            </button>
            <button
              onClick={() => navigate('/jama-challan')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
            >
              <FileCheck size={20} />
              <span>{t('jamaChallan')}</span>
            </button>
            <button
              onClick={() => navigate('/stock')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-900 border-l-4 border-gray-600 rounded-lg"
            >
              <Package size={20} />
              <span>{t('stockManagement')}</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t space-y-4">
          <div className="flex justify-center">
            <LanguageToggle />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={20} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('stockManagement')}</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('totalAvailable')}</p>
                  <p className="text-3xl font-bold text-green-600">{totalAvailable}</p>
                </div>
                <Package size={48} className="text-green-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('onRent')}</p>
                  <p className="text-3xl font-bold text-blue-600">{totalOnRent}</p>
                </div>
                <FileText size={48} className="text-blue-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('lost')}</p>
                  <p className="text-3xl font-bold text-red-600">{totalLost}</p>
                </div>
                <Package size={48} className="text-red-600 opacity-20" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('stockOverview')}</h3>
              {!editAllMode && !editingSize && (
                <button
                  onClick={handleEditAll}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  {t('editAll')}
                </button>
              )}
              {editAllMode && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveAll}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    {t('saveAll')}
                  </button>
                  <button
                    onClick={handleCancelAll}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    {t('cancelAll')}
                  </button>
                </div>
              )}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('size')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('totalStock')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('onRent')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('borrowed')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('lost')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('available')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stocks.map((stock) => (
                    <tr key={stock.size} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stock.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                        {stock.on_rent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-semibold">
                        {stock.borrowed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getAvailabilityColor(stock.available)}`}>
                        {stock.available}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {!editAllMode && editingSize === stock.size ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(stock.size)}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              {t('save')}
                            </button>
                            <button
                              onClick={handleCancel}
                              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                              {t('cancel')}
                            </button>
                          </div>
                        ) : !editAllMode && !editingSize ? (
                          <button
                            onClick={() => handleEdit(stock)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
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

            <div className="md:hidden space-y-4">
              {stocks.map((stock) => (
                <div key={stock.size} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {t('size')} {stock.size}
                    </h4>
                    <span className={`text-lg ${getAvailabilityColor(stock.available)}`}>
                      {t('available')}: {stock.available}
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
                      <span className="font-medium text-blue-600">{stock.on_rent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('borrowed')}:</span>
                      <span className="font-medium text-orange-600">{stock.borrowed}</span>
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
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        {t('save')}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  )}
                  {!editAllMode && !editingSize && (
                    <button
                      onClick={() => handleEdit(stock)}
                      className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {t('edit')}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {stocks.length > 0 && (
              <div className="mt-4 text-sm text-gray-500 text-right">
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
