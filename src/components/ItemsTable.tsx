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
  outstandingBalances?: { [key: number]: number };
  borrowedOutstanding?: { [key: number]: number };
  hideColumns?: boolean;
}


const ItemsTable: React.FC<ItemsTableProps> = ({ items, onChange, outstandingBalances, borrowedOutstanding, hideColumns = false }) => {
  const { t } = useLanguage();


  const handleChange = (field: keyof ItemsData, value: number | string) => {
    onChange({ ...items, [field]: value });
  };


  const sizes = [1, 2, 3, 4, 5, 6, 7, 8, 9];


  return (
    <div className="space-y-6">
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                {t('size')}
              </th>
              {outstandingBalances && (
                <>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    {t('Outstanding')}
                  </th>
                </>
              )}
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                {t('quantity')}
              </th>
              {outstandingBalances && !hideColumns && (
                <>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Borrowed Outstanding
                  </th>
                </>
              )}
              {!hideColumns && (
                <>
                  {/* Borrowed column */}
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    {t('borrowed')}
                  </th>
                  {/* Notes column */}
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    {t('notes')}
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sizes.map((size) => (
              <tr key={size}>
                <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {size}
                </td>
                {outstandingBalances && (
                  <>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`px-3 py-2 text-sm font-semibold rounded-lg inline-block ${
                        outstandingBalances[size] > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {outstandingBalances[size] || 0}
                      </div>
                    </td>
                  </>
                )}
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    value={items[`size_${size}_qty` as keyof ItemsData] as number}
                    onChange={(e) => handleChange(`size_${size}_qty` as keyof ItemsData, parseInt(e.target.value) || 0)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                {outstandingBalances && !hideColumns && (
                  <>
                    {/* SWAPPED: Borrowed Outstanding moved AFTER Quantity */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`px-3 py-2 text-sm font-semibold rounded-lg inline-block ${
                        (borrowedOutstanding && borrowedOutstanding[size] > 0) ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {borrowedOutstanding ? (borrowedOutstanding[size] || 0) : 0}
                      </div>
                    </td>
                  </>
                )}
                {!hideColumns && (
                  <>
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
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Mobile Cards */}
      <div className="space-y-4 md:hidden">
        {sizes.map((size) => (
          <div key={size} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="mb-3 text-lg font-semibold text-gray-900">
              {t('size')} {size}
            </h4>
            <div className="space-y-3">
              {outstandingBalances && (
                <>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Outstanding
                    </label>
                    <div className={`px-3 py-2 text-sm font-semibold rounded-lg inline-block ${
                      outstandingBalances[size] > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {outstandingBalances[size] || 0}
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
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
              {/* SWAPPED: Quantity before Borrowed Outstanding */}
              {outstandingBalances && !hideColumns && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Borrowed Outstanding
                  </label>
                  <div className={`px-3 py-2 text-sm font-semibold rounded-lg inline-block ${
                    (borrowedOutstanding && borrowedOutstanding[size] > 0) ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {borrowedOutstanding ? (borrowedOutstanding[size] || 0) : 0}
                  </div>
                </div>
              )}
              {!hideColumns && (
                <>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
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
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      {t('notes')}
                    </label>
                    <input
                      type="text"
                      value={items[`size_${size}_note` as keyof ItemsData] as string}
                      onChange={(e) => handleChange(`size_${size}_note` as keyof ItemsData, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>


      {/* Main Note */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
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
