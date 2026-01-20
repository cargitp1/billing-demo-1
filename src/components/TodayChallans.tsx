import React, { useState, useEffect } from 'react';
import { Package, Calendar, MapPin, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchDailyChallans } from '../utils/challanFetching';
import { useNavigate } from 'react-router-dom';
import ChallanDetailsModal from './ChallanDetailsModal';
import { generateJPEG } from '../utils/generateJPEG';
import ReceiptTemplate from './ReceiptTemplate';
import toast from 'react-hot-toast';

const TodayChallans: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [challans, setChallans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChallan, setSelectedChallan] = useState<any | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        const loadChallans = async () => {
            try {
                const data = await fetchDailyChallans(new Date());
                setChallans(data);
            } catch (error) {
                console.error('Error loading daily challans:', error);
            } finally {
                setLoading(false);
            }
        };

        loadChallans();
    }, []);

    const handleViewDetails = (challan: any) => {
        setSelectedChallan(challan);
        setShowDetailsModal(true);
    };

    const transformItems = (items: any) => {
        return {
            ...items,
            size_1_note: items.size_1_note || '',
            size_2_note: items.size_2_note || '',
            size_3_note: items.size_3_note || '',
            size_4_note: items.size_4_note || '',
            size_5_note: items.size_5_note || '',
            size_6_note: items.size_6_note || '',
            size_7_note: items.size_7_note || '',
            size_8_note: items.size_8_note || '',
            size_9_note: items.size_9_note || '',
            main_note: items.main_note || ''
        };
    };

    const handleDownloadJPEG = async (challan: any) => {
        const loadingToast = toast.loading('Generating JPEG...');
        try {
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            document.body.appendChild(container);

            const root = await import('react-dom/client');
            const reactRoot = root.createRoot(container);

            await new Promise<void>((resolve) => {
                reactRoot.render(
                    <ReceiptTemplate
                        challanType={challan.type}
                        challanNumber={challan.challanNumber}
                        date={new Date(challan.date).toLocaleDateString('en-GB')}
                        clientName={challan.clientFullName}
                        clientSortName={challan.clientNicName}
                        site={challan.site}
                        phone={challan.phone}
                        driverName={challan.driverName || ''}
                        items={transformItems(challan.items)}
                    />
                );
                setTimeout(resolve, 100);
            });

            await generateJPEG(
                challan.type,
                challan.challanNumber,
                new Date(challan.date).toLocaleDateString('en-GB')
            );

            reactRoot.unmount();
            document.body.removeChild(container);

            toast.dismiss(loadingToast);
            toast.success(t('challanDownloadSuccess'));
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Error generating JPEG:', error);
            toast.error(t('challanDownloadError'));
        }
    };

    if (loading) {
        return (
            <div className="p-3 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-4 sm:mb-5 lg:p-6 sm:rounded-xl">
                <div className="w-40 h-6 mb-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="p-3 border rounded-lg animate-pulse">
                            <div className="w-24 h-5 mb-2 bg-gray-200 rounded"></div>
                            <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (challans.length === 0) {
        return null; // Don't show anything if no challans today
    }

    return (
        <>
            <div className="mb-3 sm:mb-5 lg:mb-8">
                <div className="flex items-center justify-between mb-2.5 sm:mb-4 lg:mb-6">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Calendar className="w-4 h-4 text-gray-700 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                        <h2 className="text-base font-bold text-gray-900 sm:text-lg lg:text-2xl">{t('todaysActivity') || "Today's Activity"}</h2>
                    </div>
                    <button
                        onClick={() => navigate('/challan-book')}
                        className="flex items-center gap-0.5 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 touch-manipulation active:scale-95"
                    >
                        {t('viewAll')}
                        <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {challans.map((challan) => (
                        <div
                            key={`${challan.type}-${challan.challanNumber}`}
                            onClick={() => handleViewDetails(challan)}
                            className={`relative overflow-hidden p-3 border shadow-sm rounded-lg transition-all active:scale-[0.98] touch-manipulation cursor-pointer ${challan.type === 'udhar'
                                    ? 'bg-red-50 border-red-100'
                                    : 'bg-green-50 border-green-100'
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-md font-bold text-xs text-white shadow-sm ${challan.type === 'udhar'
                                            ? 'bg-gradient-to-r from-red-600 to-red-500'
                                            : 'bg-gradient-to-r from-green-600 to-green-500'
                                        }`}>
                                        #{challan.challanNumber}
                                    </span>
                                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${challan.type === 'udhar' ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                        {challan.type === 'udhar' ? t('udhar') : t('jama')}
                                    </span>
                                </div>
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${challan.type === 'udhar'
                                        ? 'bg-white text-red-700 border-red-100'
                                        : 'bg-white text-green-700 border-green-100'
                                    }`}>
                                    <Package className="w-3 h-3" />
                                    {challan.totalItems}
                                </span>
                            </div>

                            {/* Client Info */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-start">
                                    <span className="text-base font-bold text-gray-900 line-clamp-1 flex-1">{challan.clientNicName}</span>
                                    <div className="flex items-center gap-1 text-gray-500 shrink-0 ml-2 pt-1">
                                        <MapPin className="w-3 h-3" />
                                        <span className="text-xs font-medium truncate max-w-[100px]">{challan.site}</span>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 line-clamp-1">{challan.clientFullName}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ChallanDetailsModal
                challan={selectedChallan}
                type={selectedChallan?.type || 'udhar'}
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                onDownload={handleDownloadJPEG}
            />
        </>
    );
};

export default TodayChallans;
