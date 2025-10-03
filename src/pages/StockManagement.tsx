import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, FileText, FileCheck, LogOut, Package, CreditCard as Edit2, Save, X, RefreshCw, Home } from 'lucide-react';
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
  const { logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState<{ [key: number]: { total_stock: number; lost_stock: number } }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchStock();
  }, [isAuthenticated, navigate]);

  const fetchStock = async () => {
    console.log('Fetching stock data...');
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('stock')
        .select('*')
        .order('size', { ascending: true });

      console.log('Stock data response:', { data, error: fetchError });

      if (fetchError) {
        console.error('Error fetching stock:', fetchError);
        setError(`Error loading stock: ${fetchError.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.warn('No stock data found');
        setError('No stock data available');
        return;
      }

      setStocks(data);

      const values: { [key: number]: { total_stock: number; lost_stock: number } } = {};
      data.forEach(stock => {
        values[stock.size] = {
          total_stock: stock.total_stock || 0,
          lost_stock: stock.lost_stock || 0,
        };
      });
      setEditValues(values);
      console.log('Stock data loaded successfully:', data);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Unexpected error loading stock data');
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
        total_stock: stock.total_stock || 0,
        lost_stock: stock.lost_stock || 0,
      };
    });
    setEditValues(values);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    const values: { [key: number]: { total_stock: number; lost_stock: number } } = {};
    stocks.forEach(stock => {
      values[stock.size] = {
        total_stock: stock.total_stock || 0,
        lost_stock: stock.lost_stock || 0,
      };
    });
    setEditValues(values);
  };

  const handleSaveAll = async () => {
    console.log('Saving all stock values...');

    for (const size in editValues) {
      const values = editValues[parseInt(size)];
      if (values.total_stock < 0 || values.lost_stock < 0) {
        alert('Stock values cannot be negative');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const updates = [];

      for (const size in editValues) {
        const values = editValues[parseInt(size)];
        console.log(`Updating size ${size}:`, values);

        const { error: updateError } = await supabase
          .from('stock')
          .update({
            total_stock: values.total_stock,
            lost_stock: values.lost_stock,
          })
          .eq('size', parseInt(size));

        if (updateError) {
          console.error(`Error updating size ${size}:`, updateError);
          throw updateError;
        }

        updates.push(parseInt(size));
      }

      console.log('All updates successful:', updates);
      alert('Stock updated successfully!');
      setEditMode(false);
      await fetchStock();
    } catch (err: any) {
      console.error('Error updating stock:', err);
      setError(`Error updating stock: ${err.message || 'Unknown error'}`);
      alert('Error updating stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateEditValue = (size: number, field: 'total_stock' | 'lost_stock', value: number) => {
    setEditValues(prev => ({
      ...prev,
      [size]: {
        ...prev[size],
        [field]: Math.max(0, value),
      }
    }));
  };

  const getAvailabilityColor = (available: number) => {
    if (available <= 0) return 'text-red-600';
    if (available < 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const totalTotal = stocks.reduce((sum, stock) => sum + (stock.total_stock || 0), 0);
  const totalAvailable = stocks.reduce((sum, stock) => sum + (stock.available_stock || 0), 0);
  const totalOnRent = stocks.reduce((sum, stock) => sum + (stock.on_rent_stock || 0), 0);
  const totalBorrowed = stocks.reduce((sum, stock) => sum + (stock.borrowed_stock || 0), 0);
  const totalLost = stocks.reduce((sum, stock) => sum + (stock.lost_stock || 0), 0);

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
              <Home size={20} />
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

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

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

            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-600">
              <p className="text-xs text-gray-600 mb-1">{t('borrowed')}</p>
              <p className="text-2xl font-bold text-orange-600">{totalBorrowed}</p>
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
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
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
              <div className="flex flex-col justify-center items-center py-12">
                <RefreshCw size={32} className="animate-spin text-gray-400 mb-2" />
                <p className="text-gray-500">Loading stock data...</p>
              </div>
            ) : stocks.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-12">
                <Package size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No stock data available</p>
                <button
                  onClick={fetchStock}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
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
                                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                            {stock.borrowed_stock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {editMode ? (
                              <input
                                type="number"
                                min="0"
                                value={editValues[stock.size]?.lost_stock ?? 0}
                                onChange={(e) => updateEditValue(stock.size, 'lost_stock', parseInt(e.target.value) || 0)}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <div key={stock.size} className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                        <h4 className="text-lg font-bold text-gray-900">Size {stock.size}</h4>
                        <span className={`text-xl font-bold ${getAvailabilityColor(stock.available_stock)}`}>
                          {stock.available_stock}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600 font-medium">{t('totalStock')}:</span>
                          {editMode ? (
                            <input
                              type="number"
                              min="0"
                              value={editValues[stock.size]?.total_stock ?? 0}
                              onChange={(e) => updateEditValue(stock.size, 'total_stock', parseInt(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            <span className="font-bold text-gray-900">{stock.total_stock}</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600 font-medium">{t('onRent')}:</span>
                          <span className="font-bold text-blue-600">{stock.on_rent_stock}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600 font-medium">{t('borrowed')}:</span>
                          <span className="font-bold text-orange-600">{stock.borrowed_stock}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600 font-medium">{t('lost')}:</span>
                          {editMode ? (
                            <input
                              type="number"
                              min="0"
                              value={editValues[stock.size]?.lost_stock ?? 0}
                              onChange={(e) => updateEditValue(stock.size, 'lost_stock', parseInt(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            <span className="font-bold text-red-600">{stock.lost_stock}</span>
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
                  {t('lastUpdated')}: {stocks[0]?.updated_at ? format(new Date(stocks[0].updated_at), 'dd/MM/yyyy HH:mm') : 'N/A'}
                </p>
                <p className="text-xs text-gray-400 text-right mt-1">
                  Formula: Available = Total - On Rent - Lost (Borrowed tracked separately)
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
