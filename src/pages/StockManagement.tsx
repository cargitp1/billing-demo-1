import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, FileText, FileCheck, LogOut, Package, CreditCard as Edit2, Save, X, RefreshCw } from 'lucide-react';
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

  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState<{ [key: number]: { total_stock: number; lost_stock: number } }>({});

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .order('size');

      if (error) {
        console.error('Error fetching stock:', error);
        alert('Error loading stock data');
      } else {
        setStocks(data || []);
        const values: { [key: number]: { total_stock: number; lost_stock: number } } = {};
        data?.forEach(stock => {
          values[stock.size] = {
            total_stock: stock.total_stock,
            lost_stock: stock.lost_stock,
          };
        });
        setEditValues(values);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error loading stock data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditMode = () => {
    const values: { [key: number]: { total_stock: number; lost_stock: number } } = {};
    stocks.forEach(stock => {
      values[stock.size] = {
        total_stock: stock.total_stock,
        lost_stock: stock.lost_stock,
      };
    });
    setEditValues(values);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleSaveAll = async () => {
    try {
      for (const size in editValues) {
        const values = editValues[parseInt(size)];
        if (values.total_stock < 0 || values.lost_stock < 0) {
          alert('Stock values cannot be negative');
          return;
        }
      }

      setLoading(true);

      for (const size in editValues) {
        const values = editValues[parseInt(size)];
        const { error } = await supabase
          .from('stock')
          .update({
            total_stock: values.total_stock,
            lost_stock: values.lost_stock,
          })
          .eq('size', parseInt(size));

        if (error) throw error;
      }

      alert('Stock updated successfully');
      setEditMode(false);
      await fetchStock();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock');
    } finally {
      setLoading(false);
    }
  };

  const updateEditValue = (size: number, field: 'total_stock' | 'lost_stock', value: number) => {
    setEditValues(prev => ({
      ...prev,
      [size]: {
        ...prev[size],
        [field]: value,
      }
    }));
  };

  const getAvailabilityColor = (available: number) => {
    if (available === 0) return 'text-red-600';
    if (available < 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const totalTotal = stocks.reduce((sum, stock) => sum + stock.total_stock, 0);
  const totalAvailable = stocks.reduce((sum, stock) => sum + stock.available_stock, 0);
  const totalOnRent = stocks.reduce((sum, stock) => sum + stock.on_rent_stock, 0);
  const totalBorrowed = stocks.reduce((sum, stock) => sum + stock.borrowed_stock, 0);
  const totalLost = stocks.reduce((sum, stock) => sum + stock.lost_stock, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <aside className="w-64 bg-white shadow-xl flex flex-col">
        <div className="p-6 border-b bg-gradient-to-r from-gray-700 to-gray-800">
          <h1 className="text-xl font-bold text-white">{t('appName')}</h1>
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
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-900 border-l-4 border-gray-600 rounded-lg font-medium"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{t('stockManagement')}</h2>
            <button
              onClick={fetchStock}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-600">
              <p className="text-xs text-gray-600 mb-1">{t('totalStock')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalTotal}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-600">
              <p className="text-xs text-gray-600 mb-1">{t('available')}</p>
              <p className="text-2xl font-bold text-green-600">{totalAvailable}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-600">
              <p className="text-xs text-gray-600 mb-1">{t('onRent')}</p>
              <p className="text-2xl font-bold text-blue-600">{totalOnRent}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-600">
              <p className="text-xs text-gray-600 mb-1">{t('borrowed')}</p>
              <p className="text-2xl font-bold text-purple-600">{totalBorrowed}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-600">
              <p className="text-xs text-gray-600 mb-1">{t('lost')}</p>
              <p className="text-2xl font-bold text-red-600">{totalLost}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('stockOverview')}</h3>
              {!editMode ? (
                <button
                  onClick={handleEditMode}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Edit2 size={18} />
                  <span>{t('edit')}</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveAll}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                  >
                    <Save size={18} />
                    <span>{t('save')}</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
                  >
                    <X size={18} />
                    <span>{t('cancel')}</span>
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw size={32} className="animate-spin text-gray-400" />
              </div>
            ) : (
              <>
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
                          {t('available')}
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stocks.map((stock) => (
                        <tr key={stock.size} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Size {stock.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {editMode ? (
                              <input
                                type="number"
                                min="0"
                                value={editValues[stock.size]?.total_stock ?? 0}
                                onChange={(e) => updateEditValue(stock.size, 'total_stock', parseInt(e.target.value) || 0)}
                                className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            ) : (
                              <span className="font-semibold">{stock.total_stock}</span>
                            )}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${getAvailabilityColor(stock.available_stock)}`}>
                            {stock.available_stock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                            {stock.on_rent_stock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">
                            {stock.borrowed_stock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {editMode ? (
                              <input
                                type="number"
                                min="0"
                                value={editValues[stock.size]?.lost_stock ?? 0}
                                onChange={(e) => updateEditValue(stock.size, 'lost_stock', parseInt(e.target.value) || 0)}
                                className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            ) : (
                              <span className="font-semibold text-red-600">{stock.lost_stock}</span>
                            )}
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
                        <h4 className="text-lg font-semibold text-gray-900">Size {stock.size}</h4>
                        <span className={`text-lg font-bold ${getAvailabilityColor(stock.available_stock)}`}>
                          {stock.available_stock} {t('available')}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{t('totalStock')}:</span>
                          {editMode ? (
                            <input
                              type="number"
                              min="0"
                              value={editValues[stock.size]?.total_stock ?? 0}
                              onChange={(e) => updateEditValue(stock.size, 'total_stock', parseInt(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            <span className="font-semibold text-gray-900">{stock.total_stock}</span>
                          )}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('onRent')}:</span>
                          <span className="font-semibold text-blue-600">{stock.on_rent_stock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('borrowed')}:</span>
                          <span className="font-semibold text-purple-600">{stock.borrowed_stock}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{t('lost')}:</span>
                          {editMode ? (
                            <input
                              type="number"
                              min="0"
                              value={editValues[stock.size]?.lost_stock ?? 0}
                              onChange={(e) => updateEditValue(stock.size, 'lost_stock', parseInt(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            <span className="font-semibold text-red-600">{stock.lost_stock}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {stocks.length > 0 && !loading && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-right">
                  {t('lastUpdated')}: {format(new Date(stocks[0].updated_at), 'dd/MM/yyyy HH:mm')}
                </p>
                <p className="text-xs text-gray-400 text-right mt-1">
                  Note: Available = Total - On Rent - Lost (Borrowed stock is tracked separately)
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StockManagement;
