import React from 'react';
import { X, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { format } from 'date-fns';
import { PLATE_SIZES } from './ItemsTable';

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
}

interface ChallanDetailsModalProps {
  challan: ChallanData | null;
  type: 'udhar' | 'jama';
  isOpen: boolean;
  onClose: () => void;
  onDownload: (challan: ChallanData) => void;
}

const ChallanDetailsModal: React.FC<ChallanDetailsModalProps> = ({
  challan,
  type,
  isOpen,
  onClose,
  onDownload,
}) => {
  const { t } = useLanguage();

  if (!isOpen || !challan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {type === 'udhar' ? t('udharChallan') : t('jamaChallan')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">{t('challanInfo')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600">{t('challanNumber')}</p>
                <p className="text-base font-medium text-gray-900">{challan.challanNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('date')}</p>
                <p className="text-base font-medium text-gray-900">
                  {format(new Date(challan.date), 'dd/MM/yyyy')}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-50">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">{t('clientInfo')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600">{t('clientNicName')}</p>
                <p className="text-base font-medium text-gray-900">{challan.clientNicName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('clientName')}</p>
                <p className="text-base font-medium text-gray-900">{challan.clientFullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('site')}</p>
                <p className="text-base font-medium text-gray-900">
                  {challan.site}
                  {challan.isAlternativeSite && (
                    <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-200 rounded">
                      {t('alternative')}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('phone')}</p>
                <p className="text-base font-medium text-gray-900">
                  {challan.phone}
                  {challan.isSecondaryPhone && (
                    <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-200 rounded">
                      {t('alternative')}
                    </span>
                  )}
                </p>
              </div>
              {challan.driverName && (
                <div>
                  <p className="text-sm text-gray-600">{t('driver')}</p>
                  <p className="text-base font-medium text-gray-900">{challan.driverName}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">{t('items')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                      {t('size')}
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                      {t('quantity')}
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                      {t('borrowedStock')}
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                      {t('note')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((size) => {
                    const qty = challan.items[`size_${size}_qty` as keyof ItemsData] || 0;
                    const borrowed = challan.items[`size_${size}_borrowed` as keyof ItemsData] || 0;
                    const note = challan.items[`size_${size}_note` as keyof ItemsData] || '';

                    if (qty === 0 && borrowed === 0 && !note) return null;

                    return (
                      <tr key={size} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {PLATE_SIZES[size - 1]}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                          {qty}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                          {borrowed}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {note || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {challan.items.main_note && (
              <div className="p-3 mt-4 border border-yellow-200 rounded bg-yellow-50">
                <p className="text-sm font-semibold text-gray-700">{t('mainNote')}:</p>
                <p className="mt-1 text-sm text-gray-900">{challan.items.main_note}</p>
              </div>
            )}

            <div className="mt-4 text-right">
              <p className="text-lg font-semibold text-gray-900">
                {t('totalItems')}: {challan.totalItems} {t('pieces')}
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => onDownload(challan)}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Download size={20} />
            {t('downloadJPEG')}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-800 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallanDetailsModal;
