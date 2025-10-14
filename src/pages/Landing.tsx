import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Truck, 
  Award, 
  Phone, 
  ArrowRight,
  CheckCircle,
  Users,
  Package,
  FileText,
  BarChart3,
  Shield,
  Zap,
  Clock,
  Star,
  Mail,
  MapPin,
  Sparkles,
  TrendingUp,
  Globe,
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Users,
      title: 'Client Management',
      description: 'Manage all your clients with detailed profiles and contact information',
      color: '#2563eb'
    },
    {
      icon: FileText,
      title: 'Udhar & Jama Challans',
      description: 'Create and track rental and return challans effortlessly',
      color: '#dc2626'
    },
    {
      icon: Package,
      title: 'Stock Management',
      description: 'Real-time inventory tracking with automated stock updates',
      color: '#16a34a'
    },
    {
      icon: BarChart3,
      title: 'Client Ledger',
      description: 'Complete transaction history and balance tracking for each client',
      color: '#0891b2'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security',
      color: '#f59e0b'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance for quick operations and smooth workflow',
      color: '#059669'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Automate repetitive tasks and focus on growing your business'
    },
    {
      icon: TrendingUp,
      title: 'Increase Efficiency',
      description: 'Streamline operations with intelligent workflows'
    },
    {
      icon: CheckCircle,
      title: 'Reduce Errors',
      description: 'Minimize manual mistakes with automated calculations'
    },
    {
      icon: Globe,
      title: 'Access Anywhere',
      description: 'Cloud-based solution accessible from any device'
    }
  ];

  const stats = [
    { value: '1000+', label: 'Active Users' },
    { value: '50K+', label: 'Challans Created' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Business Owner',
      content: 'This system has transformed how we manage our rental business. Everything is organized and accessible.',
      rating: 5
    },
    {
      name: 'Priya Patel',
      role: 'Operations Manager',
      content: 'The client ledger feature is a game-changer. We can track everything in real-time without any hassle.',
      rating: 5
    },
    {
      name: 'Amit Shah',
      role: 'Inventory Manager',
      content: 'Stock management has never been easier. The automated updates save us hours of manual work every week.',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '₹999',
      period: '/month',
      features: [
        'Up to 50 clients',
        'Unlimited challans',
        'Basic reporting',
        'Email support'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '₹1,999',
      period: '/month',
      features: [
        'Unlimited clients',
        'Unlimited challans',
        'Advanced reporting',
        'Priority support',
        'Custom branding',
        'API access'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom integrations',
        'On-premise deployment',
        'SLA guarantee'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}>
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Sparkles className={`${scrolled ? 'text-blue-600' : 'text-white'}`} size={28} />
              <span className={`text-xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                {t('appName')}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {t('login')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-24 pb-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
        <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white rounded-full bg-opacity-20 backdrop-blur-sm">
              <Sparkles size={20} className="text-yellow-300" />
              <span className="font-medium text-white">Modern Rental Management Solution</span>
            </div>
            <h1 className="mb-6 leading-tight text-white" style={{ fontSize: '48px', fontWeight: 700 }}>
              {t('heroTitle')}
            </h1>
            <p className="max-w-3xl mx-auto mb-10 text-xl text-white" style={{ opacity: 0.9 }}>
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={() => navigate('/login')}
                className="btn-primary inline-flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-gray-50"
                style={{ minHeight: '48px', fontSize: '18px' }}
              >
                {t('getStarted')}
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary border-2 border-white text-white hover:bg-white hover:text-blue-600"
                style={{ minHeight: '48px', fontSize: '18px', background: 'transparent' }}
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-8 mt-20 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 font-bold text-white" style={{ fontSize: '40px' }}>{stat.value}</div>
                <div className="text-white" style={{ opacity: 0.8 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-blue-100 rounded-full">
              <Sparkles size={20} className="text-blue-600" />
              <span className="font-medium text-blue-600">Features</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
              Everything You Need
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Powerful features designed to streamline your rental business operations
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card p-8 bg-white"
                style={{ minHeight: '180px' }}
              >
                <div className="inline-flex p-4 rounded-xl mb-6" style={{ backgroundColor: feature.color }}>
                  <feature.icon size={48} className="text-white" />
                </div>
                <h3 className="mb-3 font-semibold text-gray-900" style={{ fontSize: '20px' }}>{feature.title}</h3>
                <p className="leading-relaxed text-gray-600" style={{ fontSize: '16px' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About & Services Section */}
      <section className="py-24 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 mb-20 md:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-blue-100 rounded-full">
                <Building2 size={20} className="text-blue-600" />
                <span className="font-medium text-blue-600">About Us</span>
              </div>
              <h2 className="mb-6 text-4xl font-bold text-gray-900">{t('aboutUs')}</h2>
              <p className="mb-6 text-lg leading-relaxed text-gray-600">{t('aboutText')}</p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <benefit.icon size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">{benefit.title}</h4>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 transform rounded-2xl rotate-3" style={{ backgroundColor: '#2563eb' }}></div>
              <div className="relative p-8 bg-white shadow-xl rounded-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                    <Truck className="text-blue-600" size={40} />
                    <div>
                      <h4 className="font-bold text-gray-900">{t('ourServices')}</h4>
                      <p className="text-sm text-gray-600">{t('servicesText')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                    <Award className="text-green-600" size={40} />
                    <div>
                      <h4 className="font-bold text-gray-900">{t('whyChooseUs')}</h4>
                      <p className="text-sm text-gray-600">{t('whyChooseText')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-white rounded-full bg-opacity-20 backdrop-blur-sm">
              <MessageSquare size={20} className="text-white" />
              <span className="font-medium text-white">Testimonials</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              What Our Clients Say
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="p-8 bg-white shadow-2xl rounded-2xl md:p-12">
              <div className="flex gap-1 mb-6">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <Star key={i} size={24} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="mb-8 text-xl leading-relaxed text-gray-700 md:text-2xl">
                "{testimonials[activeTestimonial].content}"
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-white rounded-full" style={{ backgroundColor: '#2563eb' }}>
                  {testimonials[activeTestimonial].name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{testimonials[activeTestimonial].name}</div>
                  <div className="text-gray-600">{testimonials[activeTestimonial].role}</div>
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === activeTestimonial ? 'bg-blue-600 w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-blue-100 rounded-full">
              <BarChart3 size={20} className="text-blue-600" />
              <span className="font-medium text-blue-600">Pricing</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
              Choose Your Plan
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Flexible pricing options to match your business needs
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                  plan.popular ? 'ring-2 ring-blue-600 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute transform -translate-x-1/2 -top-4 left-1/2">
                    <span className="px-4 py-1 text-sm font-semibold text-white bg-blue-600 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="mb-2 text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle size={20} className="text-green-600" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/login')}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-blue-100 rounded-full">
                <Phone size={20} className="text-blue-600" />
                <span className="font-medium text-blue-600">Contact Us</span>
              </div>
              <h2 className="mb-6 text-4xl font-bold text-gray-900">{t('contactUs')}</h2>
              <p className="mb-8 text-lg text-gray-600">{t('contactText')}</p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Mail size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Email</div>
                    <div className="text-gray-600">support@example.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Phone size={24} className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Phone</div>
                    <div className="text-gray-600">+91 98765 43210</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <MapPin size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Location</div>
                    <div className="text-gray-600">Ahmedabad, Gujarat, India</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl" style={{ backgroundColor: '#f0f9ff' }}>
              <h3 className="mb-6 text-2xl font-bold text-gray-900">Send us a message</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  rows={4}
                  placeholder="Your Message"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="btn-primary w-full"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-white bg-gray-900">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles size={24} />
              <span className="text-2xl font-bold">{t('appName')}</span>
            </div>
            <p className="mb-8 text-gray-400">Modern Rental Management Solution</p>
            <div className="text-sm text-gray-500">
              © 2025 {t('appName')}. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
