import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, FileText, FileCheck, Package, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: null },
    { path: '/clients', label: t('addClient'), icon: UserPlus },
    { path: '/udhar-challan', label: t('udharChallan'), icon: FileText },
    { path: '/jama-challan', label: t('jamaChallan'), icon: FileCheck },
    { path: '/challan-book', label: t('challanBook'), icon: BookOpen },
    { path: '/stock', label: t('stockManagement'), icon: Package },
  ];

  const getButtonClass = (path: string) => {
    const isActive = location.pathname === path;

    if (isActive) {
      if (path === '/udhar-challan') {
        return 'flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg whitespace-nowrap font-medium';
      }
      if (path === '/jama-challan') {
        return 'flex items-center gap-2 px-4 py-2 text-green-600 bg-green-50 rounded-lg whitespace-nowrap font-medium';
      }
      return 'flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg whitespace-nowrap font-medium';
    }

    let hoverClass = 'hover:bg-gray-100';
    if (path === '/udhar-challan') {
      hoverClass = 'hover:bg-red-50 hover:text-red-600';
    } else if (path === '/jama-challan') {
      hoverClass = 'hover:bg-green-50 hover:text-green-600';
    }

    return `flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors rounded-lg ${hoverClass} whitespace-nowrap`;
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto py-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={getButtonClass(path)}
            >
              {Icon && <Icon size={20} />}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
