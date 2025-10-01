import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Truck, Award, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">{t('heroTitle')}</h1>
          <p className="text-2xl md:text-3xl text-gray-600 mb-8">{t('heroSubtitle')}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            {t('getStarted')}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <Building2 className="text-blue-600" size={40} />
              <h2 className="text-2xl font-semibold text-gray-900">{t('aboutUs')}</h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">{t('aboutText')}</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <Truck className="text-blue-600" size={40} />
              <h2 className="text-2xl font-semibold text-gray-900">{t('ourServices')}</h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">{t('servicesText')}</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <Award className="text-blue-600" size={40} />
              <h2 className="text-2xl font-semibold text-gray-900">{t('whyChooseUs')}</h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">{t('whyChooseText')}</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <Phone className="text-blue-600" size={40} />
              <h2 className="text-2xl font-semibold text-gray-900">{t('contactUs')}</h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">{t('contactText')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
