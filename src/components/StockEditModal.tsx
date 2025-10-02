import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { StockData } from '../utils/stockCalculations';

interface StockEditModalProps {
  stock: StockData | null;
  onClose: () => void;
  onSave: (size: number, totalStock: number, lostStock: number) => Promise<void>;
}

export default function StockEditModal({ stock, onClose, onSave }: StockEditModalProps) {
  const { t } = useLanguage();
  const [totalStock, setTotalStock] = useState(0);
  const [lostStock, setLostStock] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (stock) {
      setTotalStock(stock.total_stock);
      setLostStock(stock.lost_stock);
    }
  }, [stock]);

  if (!stock) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(stock.size, totalStock, lostStock);
      onClose();
    } catch (error) {
      console.error('Error saving stock:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {t('editStock')} - {t('size')} {stock.size}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('totalStock')}
              </label>
              <input
                type="number"
                min="0"
                value={totalStock}
                onChange={(e) => setTotalStock(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('lostStock')}
              </label>
              <input
                type="number"
                min="0"
                value={lostStock}
                onChange={(e) => setLostStock(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">{t('onRentStock')}:</span> {stock.on_rent_stock}</p>
                <p><span className="font-medium">{t('borrowedStock')}:</span> {stock.borrowed_stock}</p>
                <p className="pt-2 border-t border-gray-300">
                  <span className="font-medium">{t('availableStock')}:</span>{' '}
                  {totalStock - stock.on_rent_stock - stock.borrowed_stock - lostStock}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {saving ? '...' : t('updateStock')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
