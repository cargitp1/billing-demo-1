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

  const handleChange = (field: keyof ItemsData, value: number | string) => {
    onChange({ ...items, [field]: value });
  };

  const sizes = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="space-y-6">
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('size')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('quantity')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('borrowed')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('notes')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sizes.map((size) => (
              <tr key={size}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {size}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    value={items[`size_${size}_qty` as keyof ItemsData] as number}
                    onChange={(e) => handleChange(`size_${size}_qty` as keyof ItemsData, parseInt(e.target.value) || 0)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    value={items[`size_${size}_borrowed` as keyof ItemsData] as number}
                    onChange={(e) => handleChange(`size_${size}_borrowed` as keyof ItemsData, parseInt(e.target.value) || 0)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-4 py-4">
                  <input
                    type="text"
                    value={items[`size_${size}_note` as keyof ItemsData] as string}
                    onChange={(e) => handleChange(`size_${size}_note` as keyof ItemsData, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {sizes.map((size) => (
          <div key={size} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              {t('size')} {size}
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('quantity')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={items[`size_${size}_qty` as keyof ItemsData] as number}
                  onChange={(e) => handleChange(`size_${size}_qty` as keyof ItemsData, parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('borrowed')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={items[`size_${size}_borrowed` as keyof ItemsData] as number}
                  onChange={(e) => handleChange(`size_${size}_borrowed` as keyof ItemsData, parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('notes')}
                </label>
                <input
                  type="text"
                  value={items[`size_${size}_note` as keyof ItemsData] as string}
                  onChange={(e) => handleChange(`size_${size}_note` as keyof ItemsData, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('mainNote')}
        </label>
        <textarea
          value={items.main_note}
          onChange={(e) => handleChange('main_note', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default ItemsTable;
