import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  FileText, 
  FileCheck, 
  Package, 
  BookOpen, 
  BookMarked,
  Activity,
  Calendar,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import '../styles/wave.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(t('greeting'));
  }, [t]);

  const quickActions = [
    {
      title: t('udharChallan'),
      description: t('create_rental'),
      icon: FileText,
      path: '/udhar-challan',
      gradient: 'from-red-500 to-red-700',
      hoverGradient: 'hover:from-red-600 hover:to-red-800',
    },
    {
      title: t('jamaChallan'),
      description: t('record_returns'),
      icon: FileCheck,
      path: '/jama-challan',
      gradient: 'from-green-500 to-green-700',
      hoverGradient: 'hover:from-green-600 hover:to-green-800',
    },
    {
      title: t('clientLedger'),
      description: t('track_balances'),
      icon: BookMarked,
      path: '/client-ledger',
      gradient: 'from-indigo-500 to-indigo-700',
      hoverGradient: 'hover:from-indigo-600 hover:to-indigo-800',
    },
    {
      title: t('stockManagement'),
      description: t('manage_inventory'),
      icon: Package,
      path: '/stock',
      gradient: 'from-purple-500 to-purple-700',
      hoverGradient: 'hover:from-purple-600 hover:to-purple-800',
    },
    {
      title: t('addClient'),
      description: t('add_new_clients'),
      icon: UserPlus,
      path: '/clients',
      gradient: 'from-blue-500 to-blue-700',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-800',
    },
    {
      title: t('challanBook'),
      description: t('view_all_challans'),
      icon: BookOpen,
      path: '/challan-book',
      gradient: 'from-teal-500 to-teal-700',
      hoverGradient: 'hover:from-teal-600 hover:to-teal-800',
    },
  ];

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '13px',
            padding: '10px 14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }}
      />
      <Navbar />
      
      <main className="flex-1 w-full ml-0 overflow-auto lg:ml-64 pt-[56px] lg:pt-0">
        <div className="w-full px-3 py-3 mx-auto sm:px-4 sm:py-5 lg:px-8 lg:py-8 max-w-7xl">
          {/* Welcome Section - Compact Mobile */}
          <div className="relative p-3 mb-3 overflow-hidden text-white rounded-lg shadow-lg sm:p-5 sm:mb-5 lg:p-8 lg:mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 sm:rounded-xl lg:rounded-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 -mt-12 -mr-12 bg-white rounded-full sm:w-40 sm:h-40 lg:w-64 lg:h-64 sm:-mt-20 sm:-mr-20 lg:-mt-32 lg:-mr-32 opacity-5"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 -mb-10 -ml-10 bg-white rounded-full sm:w-32 sm:h-32 lg:w-48 lg:h-48 sm:-mb-16 sm:-ml-16 lg:-mb-24 lg:-ml-24 opacity-5"></div>
            <div className="relative">
              <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
                <p className="text-xs font-medium text-blue-100 sm:text-sm lg:text-base"><span className="waving-hand">👋</span> {greeting}!</p>
              </div>
              <h1 className="mb-1 sm:mb-1.5 text-xl sm:text-2xl lg:text-4xl font-bold leading-tight">
                {t('appName')}
              </h1>
              <p className="mb-2 text-xs text-blue-100 sm:text-sm lg:text-base sm:mb-0">{t('Manage_your')}</p>
              
              {/* Mobile Date Display */}
              <div className="flex items-center gap-1.5 mt-2 sm:hidden">
                <Calendar className="w-3.5 h-3.5 text-blue-200" />
                <p className="text-xs font-medium">{format(new Date(), 'dd MMM yyyy')}</p>
              </div>
              
              {/* Desktop Date Display */}
              <div className="absolute items-center hidden gap-3 top-3 right-3 sm:flex sm:top-4 sm:right-4 lg:top-6 lg:right-6">
                <div className="text-right">
                  <p className="mb-0.5 text-[10px] sm:text-xs text-blue-100">{t('Todays_Date')}</p>
                  <p className="text-sm font-semibold sm:text-base lg:text-xl">{format(new Date(), 'dd MMM yyyy')}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-200 sm:w-9 sm:h-9 lg:w-12 lg:h-12" />
              </div>
            </div>
          </div>

          {/* Quick Actions - Compact Mobile */}
          <div className="mb-3 sm:mb-5 lg:mb-8">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-4 lg:mb-6">
              <Activity className="w-4 h-4 text-gray-700 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              <h2 className="text-base font-bold text-gray-900 sm:text-lg lg:text-2xl">{t('Quick_Actions')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 lg:gap-5">
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className={`group relative overflow-hidden bg-gradient-to-br ${action.gradient} ${action.hoverGradient} rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 lg:p-5 text-white transition-all transform active:scale-[0.97] sm:hover:scale-105 hover:shadow-2xl touch-manipulation`}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 transition-transform bg-white rounded-bl-full sm:w-24 sm:h-24 lg:w-28 lg:h-28 opacity-10 group-hover:scale-110"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div className="p-1.5 sm:p-2 lg:p-2.5 bg-white rounded-md sm:rounded-lg bg-opacity-20 backdrop-blur-sm">
                        <action.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                      </div>
                      <ArrowUpRight className="hidden w-4 h-4 transition-opacity opacity-0 sm:block sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:opacity-100" />
                    </div>
                    <h3 className="mb-1 text-sm font-bold leading-tight sm:text-base lg:text-lg">{action.title}</h3>
                    <p className="text-[10px] sm:text-xs text-white text-opacity-90 leading-snug line-clamp-1 sm:line-clamp-none">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity - Compact Mobile */}
          <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-4 lg:p-6 sm:rounded-xl">
            <div className="flex flex-col items-start justify-between gap-2 mb-3 sm:flex-row sm:items-center sm:gap-0 sm:mb-5">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Activity className="w-4 h-4 text-gray-700 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <h2 className="text-base font-bold text-gray-900 sm:text-lg lg:text-2xl">{t('recentActivity')}</h2>
              </div>
              <button 
                onClick={() => navigate('/challan-book')}
                className="flex items-center gap-0.5 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 touch-manipulation active:scale-95"
              >
                {t('viewAll')}
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
            <div className="py-6 text-center sm:py-8 lg:py-12">
              <div className="inline-flex items-center justify-center w-10 h-10 mb-2 bg-gray-100 rounded-full sm:w-12 sm:h-12 sm:mb-3 lg:w-16 lg:h-16 lg:mb-4">
                <Activity className="w-5 h-5 text-gray-400 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
              </div>
              <p className="mb-3 text-xs text-gray-500 sm:text-sm sm:mb-4">{t('recentChallansAppear')}</p>
              <div className="flex flex-col justify-center gap-2 sm:flex-row sm:gap-2.5">
                <button
                  onClick={() => navigate('/udhar-challan')}
                  className="w-full px-3 py-2 text-xs font-medium text-white transition-all bg-red-600 rounded-lg sm:w-auto sm:text-sm sm:px-4 hover:bg-red-700 touch-manipulation active:scale-95"
                >
                  {t('createUdhar')}
                </button>
                <button
                  onClick={() => navigate('/jama-challan')}
                  className="w-full px-3 py-2 text-xs font-medium text-white transition-all bg-green-600 rounded-lg sm:w-auto sm:text-sm sm:px-4 hover:bg-green-700 touch-manipulation active:scale-95"
                >
                  {t('createJama')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
