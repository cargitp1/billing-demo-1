import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, FileText, FileCheck, Package, BookOpen, BookMarked, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import LanguageToggle from './LanguageToggle';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: null },
    { path: '/clients', label: t('addClient'), icon: UserPlus },
    { path: '/udhar-challan', label: t('udharChallan'), icon: FileText },
    { path: '/jama-challan', label: t('jamaChallan'), icon: FileCheck },
    { path: '/stock', label: t('stockManagement'), icon: Package },
    { path: '/challan-book', label: t('challanBook'), icon: BookOpen },
    { path: '/client-ledger', label: t('clientLedger'), icon: BookMarked },
  ];

  const getButtonClass = (path: string) => {
    const isActive = location.pathname === path;
    const baseClasses = 'flex items-center w-full gap-3 px-4 py-3 transition-colors rounded-lg';

    if (isActive) {
      if (path === '/udhar-challan') {
        return `${baseClasses} text-red-600 bg-red-50 font-medium`;
      }
      if (path === '/jama-challan') {
        return `${baseClasses} text-green-600 bg-green-50 font-medium`;
      }
      return `${baseClasses} text-blue-600 bg-blue-50 font-medium`;
    }

    let hoverClass = 'hover:bg-gray-100 hover:text-gray-900';
    if (path === '/udhar-challan') {
      hoverClass = 'hover:bg-red-50 hover:text-red-600';
    } else if (path === '/jama-challan') {
      hoverClass = 'hover:bg-green-50 hover:text-green-600';
    }

    return `${baseClasses} text-gray-600 ${hoverClass}`;
  };

  return (
    <nav className="fixed top-0 left-0 flex flex-col h-screen w-64 bg-white shadow-lg">
      {/* Header with App Name */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">{t('appName')}</h1>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full ${getButtonClass(path)}`}
            >
              {Icon && <Icon size={20} />}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer with Language Toggle and Logout */}
      <div className="p-4 border-t space-y-4">
        <div className="flex justify-center">
          <LanguageToggle />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full gap-2 px-4 py-3 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
        >
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
