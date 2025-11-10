import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const PLATE_SIZES = [
  '2 X 3',
  '21 X 3',
  '18 X 3',
  '15 X 3',
  '12 X 3',
  '9 X 3',
  'પતરા',
  '2 X 2',
  '2 ફુટ'
] as const;

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

interface StockData {
  size: number;
  total_stock: number;
  on_rent_stock: number;
  borrowed_stock: number;
  lost_stock: number;
  available_stock: number;
  updated_at: string;
}

interface ItemsTableProps {
  items: ItemsData;
  onChange: (items: ItemsData) => void;
  outstandingBalances?: { [key: number]: number };
  borrowedOutstanding?: { [key: number]: number };
  hideColumns?: boolean;
  stockData?: StockData[];
  showAvailable?: boolean;
}

const ItemsTable: React.FC<ItemsTableProps> = ({ 
  items, 
  onChange, 
  outstandingBalances, 
  borrowedOutstanding, 
  hideColumns = false,
  stockData = [],
  showAvailable = false
}) => {
  const { t } = useLanguage();

  const handleChange = (field: keyof ItemsData, value: number | string) => {
    // If the field is a note field, allow empty string
    if (field.includes('note')) {
      onChange({ ...items, [field]: value });
    } else {
      // For quantity and borrowed fields, convert empty to 0
      if (typeof value === 'string' && value === '') {
        onChange({ ...items, [field]: 0 });
      } else {
        onChange({ ...items, [field]: value });
      }
    }
  };

  const sizeIndices = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                {t('size')}
              </th>
              {outstandingBalances && (
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  {t('outstanding')}
                </th>
              )}
              {showAvailable && (
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  {t('available')}
                </th>
              )}
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                {t('quantity')}
              </th>
              {outstandingBalances && !hideColumns && (
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  {t('borrowedOutstanding')}
                </th>
              )}
              {!hideColumns && (
                <>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                    {t('borrowed')}
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                    {t('notes')}
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sizeIndices.map((sizeIndex) => (
              <tr key={sizeIndex}>
                <td className="px-4 py-4 text-sm font-bold text-center text-gray-900 whitespace-nowrap">
                  {PLATE_SIZES[sizeIndex - 1]}
                </td>
                {outstandingBalances && (
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <div className={`px-3 py-2 text-sm font-semibold rounded-lg inline-block ${
                      outstandingBalances[sizeIndex] > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {outstandingBalances[sizeIndex] || 0}
                    </div>
                  </td>
                )}
                {showAvailable && (
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <div className={`px-3 py-2 text-sm font-semibold rounded-lg inline-block ${
                      stockData.find(s => s.size === sizeIndex)?.available_stock === 0 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {stockData.find(s => s.size === sizeIndex)?.available_stock || 0}
                    </div>
                  </td>
                )}
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    value={items[`size_${sizeIndex}_qty` as keyof ItemsData] || ''}
                    onChange={(e) => handleChange(`size_${sizeIndex}_qty` as keyof ItemsData, e.target.value === '' ? 0 : parseInt(e.target.value))}
                    className="w-24 px-3 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                {outstandingBalances && !hideColumns && (
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <div className={`px-3 py-2 text-sm font-semibold rounded-lg inline-block ${
                      (borrowedOutstanding && borrowedOutstanding[sizeIndex] > 0) ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {borrowedOutstanding ? (borrowedOutstanding[sizeIndex] || 0) : 0}
                    </div>
                  </td>
                )}
                {!hideColumns && (
                  <>
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={items[`size_${sizeIndex}_borrowed` as keyof ItemsData] || ''}
                        onChange={(e) => handleChange(`size_${sizeIndex}_borrowed` as keyof ItemsData, e.target.value === '' ? 0 : parseInt(e.target.value))}
                        className="w-24 px-3 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={items[`size_${sizeIndex}_note` as keyof ItemsData] as string}
                        onChange={(e) => handleChange(`size_${sizeIndex}_note` as keyof ItemsData, e.target.value)}
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

      {/* Mobile Table-Like Form - Horizontal Scroll with Fixed Size Column */}
      <div className="lg:hidden">
        <div className="-mx-3 overflow-x-auto sm:-mx-4">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="sticky left-0 z-10 px-1 py-1.5 text-[10px] font-bold text-center text-gray-700 bg-gray-100 border-r-2 border-gray-300 w-12 sm:px-2 sm:text-xs">
                      {t('size')}
                    </th>
                    {outstandingBalances && (
                      <th className="px-1 py-1.5 text-[8px] sm:text-[10px] font-semibold text-center text-gray-700 border-r border-gray-200 min-w-[60px] sm:min-w-[70px]">
                        {t('outstanding')}
                      </th>
                    )}
                    {showAvailable && (
                      <th className="px-1 py-1.5 text-[8px] sm:text-[10px] font-semibold text-center text-gray-700 border-r border-gray-200 min-w-[60px] sm:min-w-[70px]">
                        {t('available')}
                      </th>
                    )}
                    <th className="px-1 py-1.5 text-[8px] sm:text-[10px] font-semibold text-center text-gray-700 border-r border-gray-200 min-w-[60px] sm:min-w-[70px]">
                      {t('quantity')}
                    </th>
                    {outstandingBalances && !hideColumns && (
                      <th className="px-1 py-1.5 text-[8px] sm:text-[10px] font-semibold text-center text-gray-700 border-r border-gray-200 min-w-[60px] sm:min-w-[70px]">
                        {t('borrowedOutstanding')}
                      </th>
                    )}
                    {!hideColumns && (
                      <>
                        <th className="px-1 py-1.5 text-[8px] sm:text-[10px] font-semibold text-center text-gray-700 border-r border-gray-200 min-w-[60px] sm:min-w-[70px]">
                          {t('borrowed')}
                        </th>
                        <th className="px-1 py-1.5 text-[8px] sm:text-[10px] font-semibold text-center text-gray-700 min-w-[100px] sm:min-w-[120px]">
                          {t('notes')}
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sizeIndices.map((sizeIndex, index) => (
                    <tr 
                      key={sizeIndex}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="sticky left-0 z-10 px-1 py-1.5 text-[10px] font-bold text-center text-gray-900 border-r-2 border-gray-300 sm:px-2 sm:text-sm bg-inherit">
                        {PLATE_SIZES[sizeIndex - 1]}
                      </td>
                      {outstandingBalances && (
                        <td className="px-1 py-1.5 text-center border-r border-gray-200">
                          <div className={`px-1 py-0.5 text-[8px] sm:text-[10px] font-semibold rounded whitespace-nowrap ${
                            outstandingBalances[sizeIndex] > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {outstandingBalances[sizeIndex] || 0}
                          </div>
                        </td>
                      )}
                      {showAvailable && (
                        <td className="px-1 py-1.5 text-center border-r border-gray-200">
                          <div className={`px-1 py-0.5 text-[8px] sm:text-[10px] font-semibold rounded whitespace-nowrap ${
                            stockData.find(s => s.size === sizeIndex)?.available_stock === 0 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {stockData.find(s => s.size === sizeIndex)?.available_stock || 0}
                          </div>
                        </td>
                      )}
                      <td className="px-1 py-1.5 border-r border-gray-200">
                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={items[`size_${sizeIndex}_qty` as keyof ItemsData] || ''}
                          onChange={(e) => handleChange(`size_${sizeIndex}_qty` as keyof ItemsData, e.target.value === '' ? 0 : parseInt(e.target.value))}
                          className="w-full px-2 py-2 text-[13px] sm:text-sm text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[40px] sm:min-h-[44px] touch-manipulation active:scale-[0.97]"
                        />
                      </td>
                      {outstandingBalances && !hideColumns && (
                        <td className="px-1 py-1.5 text-center border-r border-gray-200">
                          <div className={`px-1 py-0.5 text-[8px] sm:text-[10px] font-semibold rounded whitespace-nowrap ${
                            (borrowedOutstanding && borrowedOutstanding[sizeIndex] > 0) ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {borrowedOutstanding ? (borrowedOutstanding[sizeIndex] || 0) : 0}
                          </div>
                        </td>
                      )}
                      {!hideColumns && (
                        <>
                          <td className="px-1 py-1.5 border-r border-gray-200">
                            <input
                              type="number"
                              min="0"
                              inputMode="numeric"
                              value={items[`size_${sizeIndex}_borrowed` as keyof ItemsData] || ''}
                              onChange={(e) => handleChange(`size_${sizeIndex}_borrowed` as keyof ItemsData, e.target.value === '' ? 0 : parseInt(e.target.value))}
                              className="w-full px-2 py-2 text-[13px] sm:text-sm text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[40px] sm:min-h-[44px] touch-manipulation active:scale-[0.97]"
                            />
                          </td>
                          <td className="px-1 py-1.5">
                            <input
                          type="text"
                          value={items[`size_${sizeIndex}_note` as keyof ItemsData] as string}
                          onChange={(e) => handleChange(`size_${sizeIndex}_note` as keyof ItemsData, e.target.value)}
                              className="w-full px-2 py-2 text-[13px] sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[40px] sm:min-h-[44px] touch-manipulation active:scale-[0.97]"
                              placeholder={t('optionalNote')}
                            />
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {/* Totals Summary Row */}
                  <tr className="bg-gray-100 border-t-2 border-gray-300">
                    <td className="sticky left-0 z-10 px-1 py-3 text-[10px] sm:text-sm font-bold text-center text-gray-900 border-r-2 border-gray-300 bg-inherit">
                      કુલ
                    </td>
                    {outstandingBalances && (
                      <td className="px-1 py-3 text-center border-r border-gray-200">
                        -
                      </td>
                    )}
                    {showAvailable && (
                      <td className="px-1 py-3 text-center border-r border-gray-200">
                        -
                      </td>
                    )}
                    <td className="px-1 py-3 text-[10px] sm:text-sm font-bold text-center border-r border-gray-200">
                      <div className="px-2 py-1 rounded-lg bg-blue-50">
                        {sizeIndices.reduce((total, sizeIndex) => total + (items[`size_${sizeIndex}_qty` as keyof ItemsData] as number || 0), 0)} સંખ્યા
                      </div>
                    </td>
                    {outstandingBalances && !hideColumns && (
                      <td className="px-1 py-3 text-center border-r border-gray-200">
                        -
                      </td>
                    )}
                    {!hideColumns && (
                      <>
                        <td className="px-1 py-3 text-[10px] sm:text-sm font-bold text-center border-r border-gray-200">
                          <div className="px-2 py-1 rounded-lg bg-orange-50">
                            {sizeIndices.reduce((total, sizeIndex) => total + (items[`size_${sizeIndex}_borrowed` as keyof ItemsData] as number || 0), 0)} ઉધાર
                          </div>
                        </td>
                        <td className="px-1 py-3 text-[10px] sm:text-sm font-extrabold text-center">
                          <div className="px-3 py-1.5 bg-blue-100 rounded-lg text-blue-800">
                            {sizeIndices.reduce((total, sizeIndex) => 
                              total + (items[`size_${sizeIndex}_qty` as keyof ItemsData] as number || 0) + 
                              (items[`size_${sizeIndex}_borrowed` as keyof ItemsData] as number || 0), 0)} કુલ
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Main Note - Mobile Optimized */}
      <div>
        <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-semibold text-gray-700">
          {t('mainNote')}
        </label>
        <textarea
          value={items.main_note}
          onChange={(e) => handleChange('main_note', e.target.value)}
          rows={3}
          placeholder={t('optionalGeneralNotes')}
          className="w-full px-2.5 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default ItemsTable;
