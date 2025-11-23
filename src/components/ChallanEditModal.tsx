import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { format } from 'date-fns';
import { PLATE_SIZES } from './ItemsTable';
import { supabase } from '../utils/supabase';

interface ItemsData {
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
  size_1_note: string | null;
  size_2_note: string | null;
  size_3_note: string | null;
  size_4_note: string | null;
  size_5_note: string | null;
  size_6_note: string | null;
  size_7_note: string | null;
  size_8_note: string | null;
  size_9_note: string | null;
  main_note: string | null;
}

// Form state allows nulls so inputs can show empty instead of 0 by default
interface FormItems {
  size_1_qty: number | null;
  size_2_qty: number | null;
  size_3_qty: number | null;
  size_4_qty: number | null;
  size_5_qty: number | null;
  size_6_qty: number | null;
  size_7_qty: number | null;
  size_8_qty: number | null;
  size_9_qty: number | null;
  size_1_borrowed: number | null;
  size_2_borrowed: number | null;
  size_3_borrowed: number | null;
  size_4_borrowed: number | null;
  size_5_borrowed: number | null;
  size_6_borrowed: number | null;
  size_7_borrowed: number | null;
  size_8_borrowed: number | null;
  size_9_borrowed: number | null;
  size_1_note: string | null;
  size_2_note: string | null;
  size_3_note: string | null;
  size_4_note: string | null;
  size_5_note: string | null;
  size_6_note: string | null;
  size_7_note: string | null;
  size_8_note: string | null;
  size_9_note: string | null;
  main_note: string | null;
}

interface ChallanData {
  challanNumber: string;
  date: string;
  clientNicName: string;
  clientFullName: string;
  site: string;
  phone: string;
  driverName: string | null;
  isAlternativeSite: boolean;
  isSecondaryPhone: boolean;
  items: ItemsData;
  totalItems: number;
  clientId?: string;
}

interface ChallanEditModalProps {
  challan: ChallanData | null;
  type: 'udhar' | 'jama';
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ChallanEditModal: React.FC<ChallanEditModalProps> = ({
  challan,
  type,
  isOpen,
  onClose,
  onSave,
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [alternativeSite, setAlternativeSite] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [items, setItems] = useState<FormItems>({
    size_1_qty: null, size_2_qty: null, size_3_qty: null, size_4_qty: null, size_5_qty: null,
    size_6_qty: null, size_7_qty: null, size_8_qty: null, size_9_qty: null,
    size_1_borrowed: null, size_2_borrowed: null, size_3_borrowed: null, size_4_borrowed: null, size_5_borrowed: null,
    size_6_borrowed: null, size_7_borrowed: null, size_8_borrowed: null, size_9_borrowed: null,
    size_1_note: null, size_2_note: null, size_3_note: null, size_4_note: null, size_5_note: null,
    size_6_note: null, size_7_note: null, size_8_note: null, size_9_note: null,
    main_note: null,
  });
  const [originalItems, setOriginalItems] = useState<ItemsData>({
    size_1_qty: 0, size_2_qty: 0, size_3_qty: 0, size_4_qty: 0, size_5_qty: 0,
    size_6_qty: 0, size_7_qty: 0, size_8_qty: 0, size_9_qty: 0,
    size_1_borrowed: 0, size_2_borrowed: 0, size_3_borrowed: 0, size_4_borrowed: 0, size_5_borrowed: 0,
    size_6_borrowed: 0, size_7_borrowed: 0, size_8_borrowed: 0, size_9_borrowed: 0,
    size_1_note: null, size_2_note: null, size_3_note: null, size_4_note: null, size_5_note: null,
    size_6_note: null, size_7_note: null, size_8_note: null, size_9_note: null,
    main_note: null,
  });

  useEffect(() => {
    if (challan && isOpen) {
      setDate(challan.date || '');
      setDriverName(challan.driverName || '');
      setAlternativeSite(challan.isAlternativeSite ? challan.site : '');
      setSecondaryPhone(challan.isSecondaryPhone ? challan.phone : '');
      // originalItems should keep numeric values for stock calculations
      setOriginalItems(challan.items);

      // For the form, show empty inputs instead of 0: map 0 -> null
      const mapped: FormItems = {
        size_1_qty: challan.items.size_1_qty === 0 ? null : challan.items.size_1_qty,
        size_2_qty: challan.items.size_2_qty === 0 ? null : challan.items.size_2_qty,
        size_3_qty: challan.items.size_3_qty === 0 ? null : challan.items.size_3_qty,
        size_4_qty: challan.items.size_4_qty === 0 ? null : challan.items.size_4_qty,
        size_5_qty: challan.items.size_5_qty === 0 ? null : challan.items.size_5_qty,
        size_6_qty: challan.items.size_6_qty === 0 ? null : challan.items.size_6_qty,
        size_7_qty: challan.items.size_7_qty === 0 ? null : challan.items.size_7_qty,
        size_8_qty: challan.items.size_8_qty === 0 ? null : challan.items.size_8_qty,
        size_9_qty: challan.items.size_9_qty === 0 ? null : challan.items.size_9_qty,
        size_1_borrowed: challan.items.size_1_borrowed === 0 ? null : challan.items.size_1_borrowed,
        size_2_borrowed: challan.items.size_2_borrowed === 0 ? null : challan.items.size_2_borrowed,
        size_3_borrowed: challan.items.size_3_borrowed === 0 ? null : challan.items.size_3_borrowed,
        size_4_borrowed: challan.items.size_4_borrowed === 0 ? null : challan.items.size_4_borrowed,
        size_5_borrowed: challan.items.size_5_borrowed === 0 ? null : challan.items.size_5_borrowed,
        size_6_borrowed: challan.items.size_6_borrowed === 0 ? null : challan.items.size_6_borrowed,
        size_7_borrowed: challan.items.size_7_borrowed === 0 ? null : challan.items.size_7_borrowed,
        size_8_borrowed: challan.items.size_8_borrowed === 0 ? null : challan.items.size_8_borrowed,
        size_9_borrowed: challan.items.size_9_borrowed === 0 ? null : challan.items.size_9_borrowed,
        size_1_note: challan.items.size_1_note || null,
        size_2_note: challan.items.size_2_note || null,
        size_3_note: challan.items.size_3_note || null,
        size_4_note: challan.items.size_4_note || null,
        size_5_note: challan.items.size_5_note || null,
        size_6_note: challan.items.size_6_note || null,
        size_7_note: challan.items.size_7_note || null,
        size_8_note: challan.items.size_8_note || null,
        size_9_note: challan.items.size_9_note || null,
        main_note: challan.items.main_note || null,
      };

      setItems(mapped);
    }
  }, [challan, isOpen]);

  if (!isOpen || !challan) return null;

  const handleItemChange = (size: number, field: 'qty' | 'borrowed' | 'note', value: string | number) => {
    setItems(prev => ({
      ...prev,
      // notes stay string|null, qty/borrowed become number|null
      [`size_${size}_${field}`]: field === 'note' ? (value === '' ? null : value) : (value === '' ? null : Number(value)),
    } as unknown as FormItems));
  };

  const handleSave = async () => {
    if (!challan?.clientId) {
      alert('Client ID not found');
      return;
    }

    setLoading(true);
    try {
      const rpcFunction = type === 'udhar' ? 'update_udhar_challan_with_stock' : 'update_jama_challan_with_stock';
      const dateField = type === 'udhar' ? 'p_udhar_date' : 'p_jama_date';

      const { data, error } = await supabase.rpc(rpcFunction, {
        p_challan_number: challan.challanNumber,
        p_client_id: challan.clientId,
        p_alternative_site: alternativeSite || null,
        p_secondary_phone_number: secondaryPhone || null,
        [dateField]: date,
        p_driver_name: driverName || null,
        p_old_size_1_qty: originalItems.size_1_qty,
        p_old_size_2_qty: originalItems.size_2_qty,
        p_old_size_3_qty: originalItems.size_3_qty,
        p_old_size_4_qty: originalItems.size_4_qty,
        p_old_size_5_qty: originalItems.size_5_qty,
        p_old_size_6_qty: originalItems.size_6_qty,
        p_old_size_7_qty: originalItems.size_7_qty,
        p_old_size_8_qty: originalItems.size_8_qty,
        p_old_size_9_qty: originalItems.size_9_qty,
        p_old_size_1_borrowed: originalItems.size_1_borrowed,
        p_old_size_2_borrowed: originalItems.size_2_borrowed,
        p_old_size_3_borrowed: originalItems.size_3_borrowed,
        p_old_size_4_borrowed: originalItems.size_4_borrowed,
        p_old_size_5_borrowed: originalItems.size_5_borrowed,
        p_old_size_6_borrowed: originalItems.size_6_borrowed,
        p_old_size_7_borrowed: originalItems.size_7_borrowed,
        p_old_size_8_borrowed: originalItems.size_8_borrowed,
        p_old_size_9_borrowed: originalItems.size_9_borrowed,
        p_new_size_1_qty: (items as FormItems).size_1_qty ?? 0,
        p_new_size_2_qty: (items as FormItems).size_2_qty ?? 0,
        p_new_size_3_qty: (items as FormItems).size_3_qty ?? 0,
        p_new_size_4_qty: (items as FormItems).size_4_qty ?? 0,
        p_new_size_5_qty: (items as FormItems).size_5_qty ?? 0,
        p_new_size_6_qty: (items as FormItems).size_6_qty ?? 0,
        p_new_size_7_qty: (items as FormItems).size_7_qty ?? 0,
        p_new_size_8_qty: (items as FormItems).size_8_qty ?? 0,
        p_new_size_9_qty: (items as FormItems).size_9_qty ?? 0,
        p_new_size_1_borrowed: (items as FormItems).size_1_borrowed ?? 0,
        p_new_size_2_borrowed: (items as FormItems).size_2_borrowed ?? 0,
        p_new_size_3_borrowed: (items as FormItems).size_3_borrowed ?? 0,
        p_new_size_4_borrowed: (items as FormItems).size_4_borrowed ?? 0,
        p_new_size_5_borrowed: (items as FormItems).size_5_borrowed ?? 0,
        p_new_size_6_borrowed: (items as FormItems).size_6_borrowed ?? 0,
        p_new_size_7_borrowed: (items as FormItems).size_7_borrowed ?? 0,
        p_new_size_8_borrowed: (items as FormItems).size_8_borrowed ?? 0,
        p_new_size_9_borrowed: (items as FormItems).size_9_borrowed ?? 0,
        p_new_size_1_note: items.size_1_note,
        p_new_size_2_note: items.size_2_note,
        p_new_size_3_note: items.size_3_note,
        p_new_size_4_note: items.size_4_note,
        p_new_size_5_note: items.size_5_note,
        p_new_size_6_note: items.size_6_note,
        p_new_size_7_note: items.size_7_note,
        p_new_size_8_note: items.size_8_note,
        p_new_size_9_note: items.size_9_note,
        p_new_main_note: items.main_note,
      });

      if (error) throw error;

      if (data && typeof data === 'object' && 'success' in data) {
        if (data.success) {
          alert(t('challanUpdated'));
          onSave();
          onClose();
        } else {
          alert(`Error: ${data.message}`);
        }
      } else {
        alert(t('challanUpdated'));
        onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error updating challan:', error);
      alert('Error updating challan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-2">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex-1">
            {t('edit')} {type === 'udhar' ? t('udharChallan') : t('jamaChallan')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">{t('challanDetails')}</h3>
            <div className="space-y-3 sm:space-y-4">
              {/* Date and Driver Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {t('date')}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {t('driverName')}
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Phone Number and Site Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {t('secondaryPhone')}
                  </label>
                  <input
                    type="text"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {t('alternativeSite')}
                  </label>
                  <input
                    type="text"
                    value={alternativeSite}
                    onChange={(e) => setAlternativeSite(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('itemsDetails')}</h3>
            
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('size')}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('quantity')}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('borrowedStock')}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('note')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((size) => (
                    <tr key={size} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {PLATE_SIZES[size - 1]}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={(items as FormItems)[`size_${size}_qty` as keyof FormItems] ?? ''}
                          onChange={(e) => handleItemChange(size, 'qty', e.target.value)}
                          className="w-24 px-3 py-2.5 text-sm text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={(items as FormItems)[`size_${size}_borrowed` as keyof FormItems] ?? ''}
                          onChange={(e) => handleItemChange(size, 'borrowed', e.target.value)}
                          className="w-24 px-3 py-2.5 text-sm text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={(items as FormItems)[`size_${size}_note` as keyof FormItems] || ''}
                          onChange={(e) => handleItemChange(size, 'note', e.target.value)}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Layout - Horizontal Scroll Table */}
            <div className="md:hidden -mx-4">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                          <th className="sticky left-0 z-5 px-1 py-1.5 text-[10px] font-bold text-center text-gray-700 bg-gray-100 border-r-2 border-gray-300 w-12 sm:px-2 sm:text-xs">
                            {t('size')}
                          </th>
                          <th className="px-1 py-1.5 text-[8px] sm:text-[10px] font-semibold text-center text-gray-700 border-r border-gray-200 min-w-[60px] sm:min-w-[70px]">
                            {t('quantity')}
                          </th>
                          <th className="px-1 py-1.5 text-[8px] sm:text-[10px] font-semibold text-center text-gray-700 border-r border-gray-200 min-w-[60px] sm:min-w-[70px]">
                            {t('borrowedStock')}
                          </th>
                          <th className="px-1 py-1.5 text-[8px] sm:text-[10px] font-semibold text-center text-gray-700 min-w-[100px] sm:min-w-[120px]">
                            {t('note')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((size, index) => (
                          <tr 
                            key={size}
                            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                          >
                            <td className="sticky left-0 z-5 px-1 py-1.5 text-[10px] font-bold text-center text-gray-900 border-r-2 border-gray-300 sm:px-2 sm:text-sm bg-inherit">
                              {PLATE_SIZES[size - 1]}
                            </td>
                            <td className="px-1 py-1.5 border-r border-gray-200">
                              <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={(items as FormItems)[`size_${size}_qty` as keyof FormItems] ?? ''}
                                onChange={(e) => handleItemChange(size, 'qty', e.target.value)}
                                className="w-full px-2 py-2 text-[13px] sm:text-sm text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[40px] sm:min-h-[44px] touch-manipulation active:scale-[0.97]"
                              />
                            </td>
                            <td className="px-1 py-1.5 border-r border-gray-200">
                              <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={(items as FormItems)[`size_${size}_borrowed` as keyof FormItems] ?? ''}
                                onChange={(e) => handleItemChange(size, 'borrowed', e.target.value)}
                                className="w-full px-2 py-2 text-[13px] sm:text-sm text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[40px] sm:min-h-[44px] touch-manipulation active:scale-[0.97]"
                              />
                            </td>
                            <td className="px-1 py-1.5">
                              <input
                                type="text"
                                value={(items as FormItems)[`size_${size}_note` as keyof FormItems] || ''}
                                onChange={(e) => handleItemChange(size, 'note', e.target.value)}
                                className="w-full px-2 py-2 text-[13px] sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[40px] sm:min-h-[44px] touch-manipulation active:scale-[0.97]"
                                placeholder={t('optionalNote')}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>


            <div className="mt-3 sm:mt-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t('mainNote')}
              </label>
              <textarea
                value={(items as FormItems).main_note || ''}
                onChange={(e) => setItems(prev => ({ ...prev, main_note: e.target.value || null } as FormItems))}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-20 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallanEditModal;
