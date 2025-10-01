import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'gu' ? 'en' : 'gu')}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      {language === 'gu' ? 'English' : 'ગુજરાતી'}
    </button>
  );
};

export default LanguageToggle;
