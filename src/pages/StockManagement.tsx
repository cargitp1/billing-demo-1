import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import StockSummaryCards from '../components/StockSummaryCards';
import StockTable from '../components/StockTable';
import StockEditModal from '../components/StockEditModal';
import { calculateStockSummary, type StockData } from '../utils/stockCalculations';

export default function StockManagement() {
  const { t } = useLanguage();
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<StockData | null>(null);

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .order('size');

      if (error) throw error;
      setStockData(data || []);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStock = async (size: number, totalStock: number, lostStock: number) => {
    try {
      const { error } = await supabase
        .from('stock')
        .update({
          total_stock: totalStock,
          lost_stock: lostStock,
          updated_at: new Date().toISOString(),
        })
        .eq('size', size);

      if (error) throw error;

      await fetchStockData();
      alert(t('stockUpdated'));
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock');
    }
  };

  const summary = calculateStockSummary(stockData);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            {t('backToDashboard')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('stockManagement')}</h1>
          <p className="text-gray-600 mt-2">{t('stockOverview')}</p>
        </div>

        <StockSummaryCards summary={summary} />

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('stockOverview')}</h2>
        </div>

        <StockTable stockData={stockData} onEdit={setEditingStock} />

        <StockEditModal
          stock={editingStock}
          onClose={() => setEditingStock(null)}
          onSave={handleSaveStock}
        />
      </div>
    </div>
  );
}
