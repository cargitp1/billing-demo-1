import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export interface ItemsData {
  size_1_qty: number;
  size_2_qty: number;
  size_3_qty: number;
  size_4_qty: number;
  size_5_qty: number;
  size_6_qty: number;
  size_7_qty: number;
  size_8_qty: number;
  size_9_qty: number;
  size_1_borrowed: number;
  size_2_borrowed: number;
  size_3_borrowed: number;
  size_4_borrowed: number;
  size_5_borrowed: number;
  size_6_borrowed: number;
  size_7_borrowed: number;
  size_8_borrowed: number;
  size_9_borrowed: number;
  size_1_note: string;
  size_2_note: string;
  size_3_note: string;
  size_4_note: string;
  size_5_note: string;
  size_6_note: string;
  size_7_note: string;
  size_8_note: string;
  size_9_note: string;
  main_note: string;
}

interface ItemsTableProps {
  items: ItemsData;
  onChange: (items: ItemsData) => void;
}

const ItemsTable: React.FC<ItemsTableProps> = ({ items, onChange }) => {
  const { t } = useLanguage();

  const updateItem = (size: number, field: string, value: string | number) => {
    onChange({
      ...items,
      [`size_${size}_${field}`]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('size')}</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('quantity')}</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('borrowedStock')}</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('note')}</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((size) => (
              <tr key={size} className="border-t border-gray-200">
                <td className="px-4 py-3 font-medium">{size}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    max="9999"
                    value={items[`size_${size}_qty` as keyof ItemsData]}
                    onChange={(e) => updateItem(size, 'qty', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    max="9999"
                    value={items[`size_${size}_borrowed` as keyof ItemsData]}
                    onChange={(e) => updateItem(size, 'borrowed', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    maxLength={200}
                    value={items[`size_${size}_note` as keyof ItemsData]}
                    onChange={(e) => updateItem(size, 'note', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('mainNote')}
        </label>
        <textarea
          value={items.main_note}
          onChange={(e) => onChange({ ...items, main_note: e.target.value })}
          maxLength={500}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default ItemsTable;
