import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import { format } from 'date-fns';

interface ChallanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  challan: any;
  type: 'udhar' | 'jama';
}

export const ChallanDetailsModal: React.FC<ChallanDetailsModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  challan,
  type,
}) => {
  const { language } = useLanguage();
  const t = translations[language];

  if (!isOpen || !challan) return null;

  const items = challan.items?.[0] || {};
  const client = challan.client;

  const challanNumber = type === 'udhar'
    ? challan.udhar_challan_number
    : challan.jama_challan_number;

  const date = type === 'udhar'
    ? challan.udhar_date
    : challan.jama_date;

  const site = challan.alternative_site || client?.site || '';
  const phone = challan.secondary_phone_number || client?.primary_phone_number || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {type === 'udhar' ? t.udharChallan : t.jamaChallan} - {challanNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">{t.challanNumber}</p>
              <p className="font-semibold">{challanNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.date}</p>
              <p className="font-semibold">{format(new Date(date), 'dd/MM/yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.client}</p>
              <p className="font-semibold">
                {client?.client_nic_name} ({client?.client_name})
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.site}</p>
              <p className="font-semibold">{site}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.phone}</p>
              <p className="font-semibold">{phone}</p>
            </div>
            {challan.driver_name && (
              <div>
                <p className="text-sm text-gray-600">{t.driver}</p>
                <p className="font-semibold">{challan.driver_name}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">{t.items}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">
                      {t.size}
                    </th>
                    <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">
                      {t.quantity}
                    </th>
                    <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">
                      {t.borrowedStock}
                    </th>
                    <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">
                      {t.note}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 9 }, (_, i) => {
                    const size = i + 1;
                    const qty = items[`size_${size}_qty`] || 0;
                    const borrowed = items[`size_${size}_borrowed`] || 0;
                    const note = items[`size_${size}_note`] || '-';

                    return (
                      <tr key={size} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b text-sm">{size}</td>
                        <td className="px-4 py-2 border-b text-sm">{qty}</td>
                        <td className="px-4 py-2 border-b text-sm">{borrowed}</td>
                        <td className="px-4 py-2 border-b text-sm">{note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {items.main_note && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm font-semibold text-gray-700 mb-1">{t.mainNote}</p>
              <p className="text-sm text-gray-700">{items.main_note}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              onClick={onEdit}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t.edit}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
