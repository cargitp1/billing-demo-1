import { Package, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { StockSummary } from '../utils/stockCalculations';

interface StockSummaryCardsProps {
  summary: StockSummary;
}

export default function StockSummaryCards({ summary }: StockSummaryCardsProps) {
  const { t } = useLanguage();

  const cards = [
    {
      title: t('totalInventory'),
      value: summary.totalInventory,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: t('onRent'),
      value: summary.onRent,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
    {
      title: t('borrowed'),
      value: summary.borrowed,
      icon: TrendingDown,
      color: 'bg-yellow-500',
    },
    {
      title: t('available'),
      value: summary.available,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
