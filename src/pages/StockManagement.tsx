import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import { format } from 'date-fns';
import { 
  Package, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Search,
  Download,
  Upload,
  TrendingDown,
  ArrowUpDown
} from 'lucide-react';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';

interface StockData {
  size: number;
  total_stock: number;
  on_rent_stock: number;
  borrowed_stock: number;
  lost_stock: number;
  available_stock: number;
  updated_at: string;
}

type SortField = 'size' | 'total_stock' | 'available_stock' | 'on_rent_stock' | 'lost_stock';
type SortOrder = 'asc' | 'desc';

const StockManagement: React.FC = () => {
  const { t } = useLanguage();
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingSize, setEditingSize] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ total_stock: number; lost_stock: number }>({
    total_stock: 0,
    lost_stock: 0,
  });
  const [editAllMode, setEditAllMode] = useState(false);
  const [allEditValues, setAllEditValues] = useState<{ [key: number]: { total_stock: number; lost_stock: number } }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'out'>('all');
  const [sortField, setSortField] = useState<SortField>('size');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async (showRefreshToast = false) => {
    if (showRefreshToast) setRefreshing(true);
    else setLoading(true);

    const { data, error } = await supabase
      .from('stock')
      .select('*')
      .order('size');

    console.log('fetchStock response:', { data, error });

    if (error) {
      console.error('Error fetching stock:', error);
      toast.error('Failed to fetch stock data');
    } else {
      const computed = (data || []).map((s: any) => ({
        ...s,
        available_stock: Math.max(0, (s.total_stock || 0) - (s.on_rent_stock || 0) - (s.lost_stock || 0))
      }));

      setStocks(computed);
      if (showRefreshToast) {
        toast.success('Stock data refreshed');
      }
    }

    setLoading(false);
    setRefreshing(false);
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
      toast.error('Stock values cannot be negative');
      return;
    }

    const stock = stocks.find(s => s.size === size);
    if (stock && editValues.total_stock < (stock.on_rent_stock + stock.borrowed_stock + editValues.lost_stock)) {
      toast.error('Total stock cannot be less than items on rent + borrowed + lost');
      return;
    }

    const loadingToast = toast.loading('Updating stock...');

    const { error } = await supabase
      .from('stock')
      .update({
        total_stock: editValues.total_stock,
        lost_stock: editValues.lost_stock,
      })
      .eq('size', size);

    toast.dismiss(loadingToast);

    if (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    } else {
      toast.success(`Stock updated for size ${size}`);
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
        toast.error('Stock values cannot be negative');
        return;
      }
    }

    const loadingToast = toast.loading('Updating all stock...');

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

      toast.dismiss(loadingToast);
      toast.success('All stock updated successfully');
      setEditAllMode(false);
      fetchStock();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const handleCancelAll = () => {
    setEditAllMode(false);
    setAllEditValues({});
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getAvailabilityColor = (available: number) => {
    if (available === 0) return 'text-red-600 font-bold';
    if (available < 10) return 'text-yellow-600 font-semibold';
    return 'text-green-600 font-semibold';
  };

  const getAvailabilityBadge = (available: number) => {
    if (available === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle size={14} />
          Out of Stock
        </span>
      );
    }
    if (available < 10) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <TrendingDown size={14} />
          Low Stock ({available})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle size={14} />
        In Stock ({available})
      </span>
    );
  };

  const filteredAndSortedStocks = useMemo(() => {
    let filtered = stocks.filter(stock => {
      const matchesSearch = stock.size.toString().includes(searchTerm);
      
      if (filterMode === 'out') return matchesSearch && stock.available_stock === 0;
      if (filterMode === 'low') return matchesSearch && stock.available_stock > 0 && stock.available_stock < 10;
      return matchesSearch;
    });

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [stocks, searchTerm, filterMode, sortField, sortOrder]);

  const totalAvailable = useMemo(() => stocks.reduce((sum, stock) => sum + stock.available_stock, 0), [stocks]);
  const totalOnRent = useMemo(() => stocks.reduce((sum, stock) => sum + stock.on_rent_stock, 0), [stocks]);
  const totalLost = useMemo(() => stocks.reduce((sum, stock) => sum + stock.lost_stock, 0), [stocks]);

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="w-12 h-4 bg-gray-200 rounded"></div></td>
      <td className="px-6 py-4"><div className="w-16 h-4 bg-gray-200 rounded"></div></td>
      <td className="px-6 py-4"><div className="w-24 h-6 bg-gray-200 rounded-full"></div></td>
      <td className="px-6 py-4"><div className="w-20 h-4 bg-gray-200 rounded"></div></td>
      <td className="px-6 py-4"><div className="w-12 h-4 bg-gray-200 rounded"></div></td>
      <td className="px-6 py-4"><div className="w-16 h-8 bg-gray-200 rounded"></div></td>
    </tr>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Navbar />
      <main className="flex-1 ml-64 overflow-auto">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{t('stockManagement')}</h2>
            <button
              onClick={() => fetchStock(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-6 mb-8 md:grid-cols-3">
            <div className="relative overflow-hidden transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-50 bg-green-50"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('totalAvailable')}</p>
                    <p className="mt-2 text-3xl font-bold text-green-600">{totalAvailable}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Package size={32} className="text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-50 bg-blue-50"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('onRent')}</p>
                    <p className="mt-2 text-3xl font-bold text-blue-600">{totalOnRent}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText size={32} className="text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-50 bg-red-50"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('lost')}</p>
                    <p className="mt-2 text-3xl font-bold text-red-600">{totalLost}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Package size={32} className="text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
            {/* Table Header with Controls */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h3 className="text-xl font-semibold text-gray-900">{t('stockOverview')}</h3>
                
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={18} />
                    <input
                      type="text"
                      placeholder="Search size..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterMode('all')}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        filterMode === 'all' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterMode('low')}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        filterMode === 'low' 
                          ? 'bg-yellow-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Low Stock
                    </button>
                    <button
                      onClick={() => setFilterMode('out')}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        filterMode === 'out' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Out of Stock
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                {!editAllMode && !editingSize && (
                  <button
                    onClick={handleEditAll}
                    className="px-4 py-2 text-sm font-medium text-white transition-colors bg-gray-700 rounded-lg hover:bg-gray-800"
                  >
                    {t('editAll')}
                  </button>
                )}
                {editAllMode && (
                  <>
                    <button
                      onClick={handleSaveAll}
                      className="px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      {t('saveAll')}
                    </button>
                    <button
                      onClick={handleCancelAll}
                      className="px-4 py-2 text-sm font-medium text-white transition-colors bg-gray-500 rounded-lg hover:bg-gray-600"
                    >
                      {t('cancelAll')}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      onClick={() => handleSort('size')}
                      className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase transition-colors cursor-pointer hover:bg-gray-100 group"
                    >
                      <div className="flex items-center gap-2">
                        {t('size')}
                        <ArrowUpDown size={14} className="transition-opacity opacity-0 group-hover:opacity-100" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('total_stock')}
                      className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase transition-colors cursor-pointer hover:bg-gray-100 group"
                    >
                      <div className="flex items-center gap-2">
                        {t('totalStock')}
                        <ArrowUpDown size={14} className="transition-opacity opacity-0 group-hover:opacity-100" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('available_stock')}
                      className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase transition-colors cursor-pointer hover:bg-gray-100 group"
                    >
                      <div className="flex items-center gap-2">
                        {t('available')}
                        <ArrowUpDown size={14} className="transition-opacity opacity-0 group-hover:opacity-100" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('on_rent_stock')}
                      className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase transition-colors cursor-pointer hover:bg-gray-100 group"
                    >
                      <div className="flex items-center justify-center gap-2">
                        {t('totalOnRent')}
                        <ArrowUpDown size={14} className="transition-opacity opacity-0 group-hover:opacity-100" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('lost_stock')}
                      className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase transition-colors cursor-pointer hover:bg-gray-100 group"
                    >
                      <div className="flex items-center gap-2">
                        {t('lost')}
                        <ArrowUpDown size={14} className="transition-opacity opacity-0 group-hover:opacity-100" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <>
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                    </>
                  ) : filteredAndSortedStocks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Package size={48} className="text-gray-300" />
                          <p className="font-medium text-gray-500">No stock data found</p>
                          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedStocks.map((stock, index) => (
                      <tr 
                        key={stock.size} 
                        className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">Size {stock.size}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                          {editingSize === stock.size ? (
                            <input
                              type="number"
                              min="0"
                              value={editValues.total_stock}
                              onChange={(e) => setEditValues({ ...editValues, total_stock: parseInt(e.target.value) || 0 })}
                              className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                              className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <span className="font-medium">{stock.total_stock}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getAvailabilityBadge(stock.available_stock)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-sm font-semibold text-gray-900">
                            {stock.on_rent_stock + stock.borrowed_stock}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            ({stock.on_rent_stock} + {stock.borrowed_stock})
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                          {editingSize === stock.size ? (
                            <input
                              type="number"
                              min="0"
                              value={editValues.lost_stock}
                              onChange={(e) => setEditValues({ ...editValues, lost_stock: parseInt(e.target.value) || 0 })}
                              className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                              className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <span className="font-medium">{stock.lost_stock}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          {!editAllMode && editingSize === stock.size ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSave(stock.size)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle size={14} />
                                {t('save')}
                              </button>
                              <button
                                onClick={handleCancel}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors"
                              >
                                {t('cancel')}
                              </button>
                            </div>
                          ) : !editAllMode && !editingSize ? (
                            <button
                              onClick={() => handleEdit(stock)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              {t('edit')}
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="p-4 space-y-4 md:hidden">
              {loading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-white border border-gray-200 rounded-xl animate-pulse">
                      <div className="w-24 h-6 mb-3 bg-gray-200 rounded"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </>
              ) : filteredAndSortedStocks.length === 0 ? (
                <div className="py-12 text-center">
                  <Package size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-gray-500">No stock data found</p>
                </div>
              ) : (
                filteredAndSortedStocks.map((stock) => (
                  <div key={stock.size} className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Size {stock.size}
                      </h4>
                      {getAvailabilityBadge(stock.available_stock)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-gray-100">
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
                            className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg"
                          />
                        ) : (
                          <span className="font-semibold">{stock.total_stock}</span>
                        )}
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">{t('totalOnRent')}:</span>
                        <div className="flex flex-col items-end">
                          <div className="font-semibold">{stock.on_rent_stock + stock.borrowed_stock}</div>
                          <div className="text-xs text-gray-500">
                            ({stock.on_rent_stock} + {stock.borrowed_stock})
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between py-2">
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
                            className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg"
                          />
                        ) : (
                          <span className="font-semibold">{stock.lost_stock}</span>
                        )}
                      </div>
                    </div>
                    
                    {!editAllMode && editingSize === stock.size && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleSave(stock.size)}
                          className="flex-1 px-3 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          {t('save')}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex-1 px-3 py-2 text-sm font-medium text-white transition-colors bg-gray-500 rounded-lg hover:bg-gray-600"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    )}
                    {!editAllMode && !editingSize && (
                      <button
                        onClick={() => handleEdit(stock)}
                        className="w-full px-3 py-2 mt-4 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        {t('edit')}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {stocks.length > 0 && !loading && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Showing {filteredAndSortedStocks.length} of {stocks.length} items</span>
                  <span>
                    {t('lastUpdated')}: {format(new Date(stocks[0].updated_at), 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StockManagement;
