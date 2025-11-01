import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <motion.button
      onClick={() => setLanguage(language === 'gu' ? 'en' : 'gu')}
      className="relative group flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 text-sm font-medium text-blue-400 rounded-lg transition-all hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20"
      whileTap={{ scale: 0.95 }}
    >
      <Globe className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
      <span className="relative">
        {/* Desktop View */}
        <span className="hidden md:block">
          <span className={`transition-opacity duration-200 ${language === 'gu' ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
            English
          </span>
          <span className={`transition-opacity duration-200 ${language === 'en' ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
            ગુજરાતી
          </span>
        </span>
        {/* Mobile View */}
        <span className="block md:hidden">
          <span className={`transition-opacity duration-200 ${language === 'gu' ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
            EN
          </span>
          <span className={`transition-opacity duration-200 ${language === 'en' ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
            ગુ
          </span>
        </span>
      </span>
      
      {/* Background Glow Effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg blur-sm" />
    </motion.button>
  );
};

export default LanguageToggle;
