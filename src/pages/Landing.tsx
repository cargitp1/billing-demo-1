import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  PlayCircle,
  Menu,
  X,
  Package,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Product pricing - All items at ₹1.5 per day
  const products = [
    { name: '2 X 3', size: '2 X 3 ફુટ' },
    { name: '21 X 3', size: '21 X 3 ફુટ' },
    { name: '18 X 3', size: '18 X 3 ફુટ' },
    { name: '15 X 3', size: '15 X 3 ફુટ' },
    { name: '12 X 3', size: '12 X 3 ફુટ' },
    { name: '9 X 3', size: '9 X 3 ફુટ' },
    { name: 'પતરા', size: 'પતરા' },
    { name: '2 X 2', size: '2 X 2 ફુટ' },
    { name: '2 ફુટ', size: '2 ફુટ' }
  ];

  const features = [
    {
      icon: Shield,
      title: t('highQuality'),
      description: t('qualityDesc')
    },
    {
      icon: Clock,
      title: t('fastService'),
      description: t('serviceDesc')
    },
    {
      icon: TrendingUp,
      title: t('fairRent'),
      description: t('rentDesc')
    },
    {
      icon: Package,
      title: t('allSizes'),
      description: t('sizesDesc')
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-4 left-4 right-4 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/90 backdrop-blur-xl shadow-lg border border-gray-200/50' 
            : 'bg-white/70 backdrop-blur-md border border-white/20'
        } rounded-2xl`}
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 blur-lg opacity-60"></div>
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
                  <Package className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold text-gray-900">{t('appName')}</span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="items-center hidden gap-8 md:flex">
              <motion.a
                href="#products"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-orange-600"
                whileHover={{ y: -2 }}
              >
                {t('products')}
              </motion.a>
              <motion.a
                href="#video"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-orange-600"
                whileHover={{ y: -2 }}
              >
                {t('howToUse')}
              </motion.a>
              <LanguageToggle />
              <motion.button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-lg hover:shadow-orange-500/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('login')}
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 md:hidden">
              <LanguageToggle />
              <motion.button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                whileTap={{ scale: 0.9 }}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-900" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-900" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Mobile Dropdown */}
          <motion.div
            initial={false}
            animate={{ height: isMobileMenuOpen ? 'auto' : 0, opacity: isMobileMenuOpen ? 1 : 0 }}
            className={`md:hidden overflow-hidden ${isMobileMenuOpen ? 'border-t border-gray-200/50' : ''}`}
          >
            <div className="px-4 py-3 space-y-3">
              <motion.a
                href="#products"
                className="block text-sm font-medium text-gray-700 transition-colors hover:text-orange-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ઉત્પાદનો
              </motion.a>
              <motion.a
                href="#video"
                className="block text-sm font-medium text-gray-700 transition-colors hover:text-orange-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                કેવી રીતે વાપરવું
              </motion.a>
              <motion.button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-orange-500 to-red-600"
              >
                લોગિન
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.nav>

      {/* Clean Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden sm:pt-40 sm:pb-24">
        <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Brand Name */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="mb-4 text-6xl font-extrabold text-gray-900 sm:text-7xl lg:text-8xl">
                {t('appName')}
              </h1>
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-16 h-1 rounded bg-gradient-to-r from-orange-500 to-red-600"></div>
                <Sparkles className="w-6 h-6 text-orange-500" />
                <div className="w-16 h-1 rounded bg-gradient-to-l from-orange-500 to-red-600"></div>
              </div>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl mx-auto mb-12 text-2xl font-medium leading-relaxed text-gray-600 sm:text-3xl"
            >
              "{t('slogan')}"
              <br />
              <span className="text-lg text-gray-500 sm:text-xl">{t('subSlogan')}</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col items-center justify-center gap-4 mb-16 sm:flex-row"
            >
              <motion.button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 text-lg font-semibold text-white rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-2xl hover:shadow-orange-500/50 group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  {t('viewProducts')}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </motion.button>

              <motion.button
                onClick={() => document.getElementById('video')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-8 py-4 text-lg font-semibold text-gray-900 transition-all border-2 border-gray-300 rounded-2xl hover:border-gray-400 hover:bg-gray-50"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlayCircle className="w-5 h-5" />
                {t('howToUse')}
              </motion.button>
            </motion.div>

            {/* Quick Features */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="grid max-w-4xl grid-cols-2 gap-2 mx-auto sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-3 bg-white border shadow-md sm:p-6 rounded-xl sm:rounded-2xl border-gray-200/50"
                >
                  <div className="p-2 mx-auto mb-2 rounded-lg sm:p-3 sm:mb-3 sm:rounded-xl bg-orange-500/10 w-fit">
                    <feature.icon className="w-5 h-5 text-orange-600 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="mb-1 text-sm font-bold text-gray-900 sm:text-base">{feature.title}</h3>
                  <p className="text-xs text-gray-600 sm:text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Pricing Section */}
      <section id="products" className="py-20 bg-white sm:py-24">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border rounded-full bg-orange-50/50 border-orange-200/50">
              <Package className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-semibold text-orange-600">{t('productsAndPrices')}</span>
            </div>
            <h2 className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl">
              {t('ourPlates')}
            </h2>
            <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-600">
              {t('allSizesOnePrice')}
            </p>

            {/* Uniform Pricing Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-8 py-4 mb-12 border-2 border-orange-300 shadow-lg bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl"
            >
              <div className="flex items-center justify-center w-12 h-12 text-2xl font-bold text-white rounded-full bg-gradient-to-br from-orange-500 to-red-600">
                ₹
              </div>
              <div className="text-left">
                <div className="text-3xl font-extrabold text-gray-900">₹1.5 / {t('pricePerDay')}</div>
                <div className="text-sm text-gray-600">{t('sameRentAllPlates')}</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Product Grid */}
          <div className="grid max-w-4xl grid-cols-2 gap-2 mx-auto sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {products.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative p-3 overflow-hidden transition-all bg-white border shadow-md sm:p-6 rounded-xl sm:rounded-2xl border-gray-200/50 hover:shadow-xl group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 transition-opacity rounded-full opacity-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 blur-2xl group-hover:opacity-100"></div>
                
                <div className="relative text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 text-xl font-bold text-white rounded-lg sm:w-16 sm:h-16 sm:mb-4 sm:text-2xl sm:rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
                    {product.name.includes('X') ? product.name.split('X')[0].trim() : product.name.charAt(0)}
                  </div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 sm:text-xl">{product.size}</h3>
                  <div className="inline-flex items-baseline gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-orange-50">
                    <span className="text-lg font-bold text-orange-600 sm:text-2xl">₹1.5</span>
                    <span className="text-xs text-gray-600 sm:text-sm">/દિવસ</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mt-12"
          >
            <div className="p-6 border rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
              <div className="flex items-start gap-4">
                <CheckCircle className="flex-shrink-0 w-6 h-6 mt-1 text-blue-600" />
                <div>
                  <h4 className="mb-2 text-lg font-bold text-gray-900">વિશેષ નોંધ</h4>
                  <p className="text-gray-700">
                    • બધી પ્લેટ્સ ઉચ્ચ ગુણવત્તાની MS સ્ટીલથી બનેલી છે
                    <br />
                    • મિનિમમ ભાડા સમયગાળો: 30 દિવસ
                    <br />
                    • બલ્ક ઓર્ડર પર વિશેષ ડિસ્કાઉન્ટ
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How to Use Video Section */}
      <section id="video" className="py-20 bg-gradient-to-b from-white to-gray-50 sm:py-24">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border rounded-full bg-purple-50/50 border-purple-200/50">
              <PlayCircle className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">{t('videoGuide')}</span>
            </div>
            <h2 className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl">
              {t('howToUsePlates')}
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              {t('watchVideo')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative p-2 border shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl border-gray-200/50">
                <div className="overflow-hidden aspect-video rounded-2xl">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/Iqr3XIhSnUQ"
                    title="નીલકંઠ પ્લેટ ડેપો - કેવી રીતે વાપરવું"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-2 mt-4 sm:grid-cols-3 sm:gap-4 sm:mt-8"
            >
              <div className="p-3 text-center bg-white border rounded-lg shadow-sm sm:p-4 sm:rounded-xl border-gray-200/50">
                <div className="mb-1 text-2xl font-bold text-orange-600 sm:mb-2 sm:text-3xl">{t('step1')}</div>
                <p className="text-xs text-gray-600 sm:text-sm">{t('selectSize')}</p>
              </div>
              <div className="p-3 text-center bg-white border rounded-lg shadow-sm sm:p-4 sm:rounded-xl border-gray-200/50">
                <div className="mb-1 text-2xl font-bold text-orange-600 sm:mb-2 sm:text-3xl">{t('step2')}</div>
                <p className="text-xs text-gray-600 sm:text-sm">{t('properArrangement')}</p>
              </div>
              <div className="col-span-2 p-3 text-center bg-white border rounded-lg shadow-sm sm:col-span-1 sm:p-4 sm:rounded-xl border-gray-200/50">
                <div className="mb-1 text-2xl font-bold text-orange-600 sm:mb-2 sm:text-3xl">{t('step3')}</div>
                <p className="text-xs text-gray-600 sm:text-sm">{t('safeUsage')}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 border-t border-gray-800">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 mb-8 sm:gap-8 md:grid-cols-3">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg sm:w-10 sm:h-10 sm:rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
                  <Package className="w-4 h-4 text-white sm:w-5 sm:h-5" />
                </div>
                <span className="text-lg font-bold text-white sm:text-xl">નીલકંઠ પ્લેટ ડેપો</span>
              </div>
              <p className="mb-4 text-xs text-gray-400 sm:text-sm">
                તમારા બાંધકામ પ્રોજેક્ટ્સ માટે વિશ્વસનીય પ્લેટ ભાડા સેવા
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="mb-4 text-sm font-bold text-white uppercase">{t('quickLinks')}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#products" className="text-sm text-gray-400 transition-colors hover:text-white">
                    {t('products')}
                  </a>
                </li>
                <li>
                  <a href="#video" className="text-sm text-gray-400 transition-colors hover:text-white">
                    {t('howToUse')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                    {t('aboutUs')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-4 text-sm font-bold text-white uppercase">{t('contactUs')}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Phone className="flex-shrink-0 w-5 h-5 mt-0.5 text-orange-400" />
                  <div>
                    <p className="text-sm text-gray-400">+91 98765 43210</p>
                    <p className="text-xs text-gray-500">સોમવાર - શનિવાર</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="flex-shrink-0 w-5 h-5 mt-0.5 text-orange-400" />
                  <p className="text-sm text-gray-400">info@neelkanthplate.com</p>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="flex-shrink-0 w-5 h-5 mt-0.5 text-orange-400" />
                  <p className="text-sm text-gray-400">અમદાવાદ, ગુજરાત</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-gray-400">
                © 2025 {t('appName')}. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm text-gray-400">
                <a href="#" className="transition-colors hover:text-white">
                  {t('privacyPolicy')}
                </a>
                <a href="#" className="transition-colors hover:text-white">
                  {t('terms')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
