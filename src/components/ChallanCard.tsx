import React from 'react';
import { Eye, CreditCard as Edit2, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import { format } from 'date-fns';
import { calculateTotalItems } from '../utils/challanOperations';

interface ChallanCardProps {
  challan: any;
  type: 'udhar' | 'jama';
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ChallanCard: React.FC<ChallanCardProps> = ({
  challan,
  type,
  onView,
  onEdit,
  onDelete,
}) => {
  const { language } = useLanguage();
  const t = translations[language];

  const challanNumber = type === 'udhar'
    ? challan.udhar_challan_number
    : challan.jama_challan_number;

  const date = type === 'udhar'
    ? challan.udhar_date
    : challan.jama_date;

  const items = challan.items?.[0] || {};
  const client = challan.client;
  const totalItems = calculateTotalItems(items);
  const site = challan.alternative_site || client?.site || '';

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 border border-gray-200 p-4 space-y-4 hover:border-gray-300">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-gray-900">#{challanNumber}</p>
          <p className="text-sm text-gray-500">{format(new Date(date), 'dd/MM/yyyy')}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          type === 'udhar'
            ? 'bg-orange-100 text-orange-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {type === 'udhar' ? t.udharChallan : t.jamaChallan}
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex flex-col">
              <span className="text-gray-500">{t.client}</span>
              <span className="font-medium text-gray-900">{client?.client_nic_name || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">{t.site}</span>
              <span className="font-medium text-gray-900">{site || '-'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex flex-col">
              <span className="text-gray-500">{t.totalItems}</span>
              <span className="font-medium text-gray-900">{totalItems} {t.pieces}</span>
            </div>
            {challan.driver_name && (
              <div className="flex flex-col">
                <span className="text-gray-500">{t.driver}</span>
                <span className="font-medium text-gray-900">{challan.driver_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Eye size={16} />
          {t.viewDetails}
        </button>
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors text-sm"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-2 bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors text-sm"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
