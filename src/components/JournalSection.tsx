import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Calendar, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchDailyChallans } from '../utils/challanFetching';
import { calculateTotalFromItems } from '../utils/challanFetching';
import { toJpeg } from 'html-to-image';
import toast from 'react-hot-toast';

const JournalSection: React.FC = () => {
    const { t } = useLanguage();
    const [challans, setChallans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [isStockExpanded, setIsStockExpanded] = useState(false);

    // Size labels mapping (matching PLATE_SIZES from ItemsTable)
    const sizeLabels = [
        "2 X 3",
        "21 X 3",
        "18 X 3",
        "15 X 3",
        "12 X 3",
        "9 X 3",
        "પતરા",
        "2 X 2",
        "2 ફુટ"
    ];

    const getSizeLabel = (sizeIndex: number) => {
        return sizeLabels[sizeIndex - 1] || `Size ${sizeIndex}`;
    };

    const goToPreviousDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const goToNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    const calculateDayEndStock = () => {
        const stock = Array(9).fill(0).map((_, i) => ({
            size: i + 1,
            udhar: 0,
            jama: 0,
            closing: 0
        }));

        challans.forEach(challan => {
            const isUdhar = challan.type === 'udhar';
            for (let i = 1; i <= 9; i++) {
                const qty = (challan.items?.[`size_${i}_qty`] || 0) +
                    (challan.items?.[`size_${i}_borrowed`] || 0);
                if (isUdhar) {
                    stock[i - 1].udhar += qty;
                } else {
                    stock[i - 1].jama += qty;
                }
            }
        });

        stock.forEach(s => {
            s.closing = s.jama - s.udhar;
        });

        return stock.filter(s => s.closing !== 0 || s.udhar > 0 || s.jama > 0);
    };

    const calculateTotals = () => {
        let totalUdhar = 0;
        let totalJama = 0;

        challans.forEach(challan => {
            const total = calculateTotalFromItems(challan.items);
            if (challan.type === 'udhar') {
                totalUdhar += total;
            } else {
                totalJama += total;
            }
        });

        return { totalUdhar, totalJama };
    };

    const journalRef = useRef<HTMLDivElement>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const downloadJournal = async () => {
        const loadingToast = toast.loading('Generating journal...');
        try {
            if (printRef.current) {
                // Wait for any images/fonts to settle (though hidden)
                await new Promise(resolve => setTimeout(resolve, 500));

                const dataUrl = await toJpeg(printRef.current, {
                    quality: 0.95,
                    pixelRatio: 2,
                    cacheBust: true,
                    backgroundColor: '#ffffff'
                });

                const link = document.createElement('a');
                const dateStr = selectedDate.toISOString().split('T')[0];
                link.download = `journal_${dateStr}.jpg`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.dismiss(loadingToast);
                toast.success('Journal downloaded!');
            }
        } catch (error) {
            console.error('Error generating journal:', error);
            toast.dismiss(loadingToast);
            toast.error('Failed to download journal');
        }
    };

    useEffect(() => {
        const loadChallans = async () => {
            setLoading(true);
            try {
                const data = await fetchDailyChallans(selectedDate);

                // Filter out bills, keep only udhar and jama
                const filteredData = data.filter((c: any) => c.type === 'udhar' || c.type === 'jama');

                // Sort: Udhar first, then Jama
                const sortedData = filteredData.sort((a: any, b: any) => {
                    if (a.type === 'udhar' && b.type === 'jama') return -1;
                    if (a.type === 'jama' && b.type === 'udhar') return 1;
                    return 0;
                });

                setChallans(sortedData);
            } catch (error) {
                console.error('Error loading journal challans:', error);
            } finally {
                setLoading(false);
            }
        };

        loadChallans();
    }, [selectedDate]);

    const toggleRow = (challanKey: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(challanKey)) {
            newExpanded.delete(challanKey);
        } else {
            newExpanded.add(challanKey);
        }
        setExpandedRows(newExpanded);
    };

    const getSizeDetails = (items: any) => {
        const sizes = [];
        for (let i = 1; i <= 9; i++) {
            const qty = items[`size_${i}_qty`] || 0;
            const borrowed = items[`size_${i}_borrowed`] || 0;
            const total = qty + borrowed;
            if (total > 0) {
                sizes.push({ size: i, qty, borrowed, total });
            }
        }
        return sizes;
    };

    if (loading) {
        return (
            <div className="p-3 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-4 sm:mb-5 lg:p-6 sm:rounded-xl">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse sm:w-6 sm:h-6"></div>
                    <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div ref={journalRef} className="p-3 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-4 sm:mb-5 lg:p-6 sm:rounded-xl">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 lg:mb-5">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <BookOpen className="w-4 h-4 text-gray-700 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    <h2 className="text-base font-bold text-gray-900 sm:text-lg lg:text-2xl">{t('journal')}</h2>
                </div>

                {/* Date Navigation Controls */}
                <div className="flex items-center gap-2 ml-auto">
                    {/* Date Picker */}
                    <input
                        type="date"
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm sm:px-3 sm:py-1.5 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Up/Down Arrow Buttons - Side by Side */}
                    <div className="flex flex-row gap-0.5">
                        {/* Previous Day Button (Down Arrow) */}
                        <button
                            onClick={goToPreviousDay}
                            className="p-1 text-gray-600 bg-white border border-gray-300 rounded-l-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Previous day"
                        >
                            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>

                        {/* Next Day Button (Up Arrow) */}
                        <button
                            onClick={goToNextDay}
                            className="p-1 text-gray-600 bg-white border border-gray-300 rounded-r-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Next day"
                        >
                            <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {challans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
                    <Calendar className="w-10 h-10 mb-3 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">{t('noJournalEntries')}</p>
                </div>
            ) : (
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sm:px-3 sm:py-3 sm:text-sm">
                                        {t('totalStock')}
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sm:px-3 sm:py-3 sm:text-sm">
                                        {t('challanNumber')}
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sm:px-3 sm:py-3 sm:text-sm">
                                        {t('client')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {challans.map((challan) => {
                                    const totalStock = calculateTotalFromItems(challan.items);
                                    const isUdhar = challan.type === 'udhar';
                                    const challanKey = `${challan.type}-${challan.challanNumber}`;
                                    const isExpanded = expandedRows.has(challanKey);
                                    const sizeDetails = getSizeDetails(challan.items);

                                    return (
                                        <React.Fragment key={challanKey}>
                                            <tr
                                                onClick={() => toggleRow(challanKey)}
                                                className={`transition-colors cursor-pointer ${isUdhar
                                                    ? 'bg-red-50 hover:bg-red-100'
                                                    : 'bg-green-50 hover:bg-green-100'
                                                    }`}
                                            >
                                                {/* Total Stock Column */}
                                                <td className="px-2 py-2 sm:px-3 sm:py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold sm:text-sm ${isUdhar
                                                            ? 'bg-red-600 text-white'
                                                            : 'bg-green-600 text-white'
                                                            }`}>
                                                            {isUdhar ? '+' : '-'}{totalStock}
                                                        </span>
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-4 h-4 text-gray-500" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4 text-gray-500" />
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Challan Number Column */}
                                                <td className="px-2 py-2 sm:px-3 sm:py-3">
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-bold sm:text-base ${isUdhar ? 'text-red-700' : 'text-green-700'
                                                            }`}>
                                                            #{challan.challanNumber}
                                                        </span>
                                                        <span className={`text-[10px] font-medium uppercase tracking-wide sm:text-xs ${isUdhar ? 'text-red-600' : 'text-green-600'
                                                            }`}>
                                                            {isUdhar ? t('udhar') : t('jama')}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Client Column */}
                                                <td className="px-2 py-2 sm:px-3 sm:py-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900 sm:text-base line-clamp-1">
                                                            {challan.clientNicName}
                                                        </span>
                                                        <span className="text-xs text-gray-600 sm:text-sm line-clamp-1">
                                                            {challan.clientFullName}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expanded Row - Size Details */}
                                            {isExpanded && (
                                                <tr className={isUdhar ? 'bg-red-100' : 'bg-green-100'}>
                                                    <td colSpan={3} className="px-2 py-3 sm:px-4 sm:py-4">
                                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                                                            {sizeDetails.map((detail) => (
                                                                <div
                                                                    key={detail.size}
                                                                    className="p-2 bg-white rounded-lg shadow-sm border border-gray-200"
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs font-semibold text-gray-700 sm:text-sm">
                                                                            {getSizeLabel(detail.size)}
                                                                        </span>
                                                                        <span className={`text-xs font-bold sm:text-sm ${isUdhar ? 'text-red-600' : 'text-green-600'}`}>
                                                                            {detail.total}
                                                                        </span>
                                                                    </div>
                                                                    {detail.borrowed > 0 && (
                                                                        <div className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                                                                            {t('mainStock')}: {detail.qty} | {t('borrowed')}: {detail.borrowed}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Day-End Summary Section */}
            {challans.length > 0 && (
                <div className="mt-4 space-y-3 sm:mt-6">
                    {/* Collapsible Stock Inventory */}
                    <div className="overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                        {/* Header - Clickable to expand/collapse */}
                        <button
                            onClick={() => setIsStockExpanded(!isStockExpanded)}
                            className="flex items-center justify-between w-full p-3 text-left transition-colors hover:bg-gray-100 sm:p-4"
                        >
                            <h3 className="text-sm font-semibold text-gray-800 sm:text-base">
                                📊 {t('endOfDayStock') || 'End of Day Stock'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-600">
                                    {isStockExpanded ? (t('hide') || 'Hide') : (t('show') || 'Show')}
                                </span>
                                {isStockExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-gray-600" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                )}
                            </div>
                        </button>

                        {/* Expandable Content */}
                        {isStockExpanded && (
                            <div className="p-3 pt-0 sm:p-4 sm:pt-0">
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                                    {calculateDayEndStock().map(stock => (
                                        <div key={stock.size} className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm sm:p-3">
                                            <div className="text-xs font-medium text-gray-600 mb-1">
                                                {getSizeLabel(stock.size)}
                                            </div>
                                            <div className="text-xl font-bold text-gray-900 sm:text-2xl">
                                                {stock.closing}
                                            </div>
                                            <div className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                                                <span className="text-red-600">-{stock.udhar}</span>
                                                {' | '}
                                                <span className="text-green-600">+{stock.jama}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Compact Summary Row for Mobile - All in One Line */}
                    <div className="sm:hidden">
                        {/* Single Row with All Summary Info */}
                        <div className="grid grid-cols-3 gap-2 mb-2">
                            {/* Final Stock */}
                            <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                <div className="text-[10px] font-medium text-blue-700 mb-0.5">
                                    📈 {t('finalStock') || 'Final'}
                                </div>
                                <div className="text-xl font-bold text-blue-900">
                                    {calculateTotals().totalJama - calculateTotals().totalUdhar}
                                </div>
                            </div>

                            {/* Total Udhar */}
                            <div className="p-2 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                                <div className="text-[10px] font-medium text-red-700 mb-0.5">
                                    📤 {t('udhar') || 'Udhar'}
                                </div>
                                <div className="text-xl font-bold text-red-800">
                                    {calculateTotals().totalUdhar}
                                </div>
                            </div>

                            {/* Total Jama */}
                            <div className="p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                <div className="text-[10px] font-medium text-green-700 mb-0.5">
                                    📥 {t('jama') || 'Jama'}
                                </div>
                                <div className="text-xl font-bold text-green-800">
                                    {calculateTotals().totalJama}
                                </div>
                            </div>
                        </div>

                        {/* Download Button - Full Width */}
                        <button
                            onClick={downloadJournal}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95 transition-all"
                        >
                            <Download className="w-4 h-4" />
                            <span className="text-sm">{t('downloadJournal') || 'Download Journal'}</span>
                        </button>
                    </div>

                    {/* Desktop Layout - Original */}
                    <div className="hidden sm:flex sm:flex-col sm:gap-3 sm:items-center sm:justify-between lg:flex-row">
                        <div className="flex gap-3">
                            {/* Total Udhar */}
                            <div className="flex-1 px-4 py-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border-2 border-red-200 sm:flex-none">
                                <div className="text-xs font-medium text-red-700 mb-1 sm:text-sm">
                                    📤 {t('totalUdhar') || 'Total Udhar'}
                                </div>
                                <div className="text-2xl font-bold text-red-800 sm:text-3xl">
                                    {calculateTotals().totalUdhar}
                                </div>
                            </div>

                            {/* Total Jama */}
                            <div className="flex-1 px-4 py-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 sm:flex-none">
                                <div className="text-xs font-medium text-green-700 mb-1 sm:text-sm">
                                    📥 {t('totalJama') || 'Total Jama'}
                                </div>
                                <div className="text-2xl font-bold text-green-800 sm:text-3xl">
                                    {calculateTotals().totalJama}
                                </div>
                            </div>
                        </div>

                        {/* Download Button */}
                        <button
                            onClick={downloadJournal}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 transition-all"
                        >
                            <Download className="w-5 h-5" />
                            <span className="text-base">{t('downloadJournal') || 'Download Journal'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Hidden Print Template */}
            <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
                <div ref={printRef} className="bg-white p-8" style={{ width: '1000px', minHeight: '1414px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    {/* Print Header */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-800">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{t('appName')}</h1>
                            <p className="text-gray-600 mt-1">{t('journal')} {t('report') || 'Report'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                                {selectedDate.toLocaleDateString('gu-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {t('generatedOn') || 'Generated on'} {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                    </div>

                    {/* Print Content Table */}
                    <div className="mb-8">
                        <table className="w-full mb-6">
                            <thead>
                                <tr className="border-b-2 border-gray-300">
                                    <th className="py-2 text-left text-sm font-bold text-gray-700 w-24">{t('type') || 'Type'}</th>
                                    <th className="py-2 text-left text-sm font-bold text-gray-700 w-24">{t('challanNumber')}</th>
                                    <th className="py-2 text-left text-sm font-bold text-gray-700 flex-1">{t('client')}</th>
                                    <th className="py-2 text-right text-sm font-bold text-gray-700 w-24">{t('total')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {challans.map((challan, idx) => {
                                    const totalStock = calculateTotalFromItems(challan.items);
                                    const isUdhar = challan.type === 'udhar';
                                    const sizeDetails = getSizeDetails(challan.items);

                                    return (
                                        <tr key={`${challan.type}-${challan.challanNumber}`} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                            <td className="py-3 px-2 align-top">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${isUdhar ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {isUdhar ? (t('udhar') || 'UDHAR') : (t('jama') || 'JAMA')}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 align-top text-sm font-medium text-gray-900">
                                                #{challan.challanNumber}
                                            </td>
                                            <td className="py-3 px-2 align-top">
                                                <div className="font-bold text-gray-900 text-sm">{challan.clientNicName}</div>
                                                <div className="text-xs text-gray-500">{challan.clientFullName}</div>

                                                {/* Size details grid for print */}
                                                <div className="grid grid-cols-6 gap-2 mt-2 pt-2 border-t border-gray-200">
                                                    {sizeDetails.map(detail => (
                                                        <div key={detail.size} className="text-[10px] text-gray-600 bg-white border border-gray-100 p-1 rounded">
                                                            <span className="font-semibold block">{getSizeLabel(detail.size)}</span>
                                                            <span className={isUdhar ? 'text-red-600' : 'text-green-600 font-bold'}>
                                                                {detail.total}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className={`py-3 px-2 align-top text-right font-bold text-lg ${isUdhar ? 'text-red-700' : 'text-green-700'
                                                }`}>
                                                {isUdhar ? '+' : '-'}{totalStock}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Print Summary Footer */}
                    <div className="border-t-4 border-gray-800 pt-6 mt-auto">
                        <div className="flex gap-8">
                            {/* Stock Summary */}
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">{t('endOfDayStock') || 'End of Day Stock'}</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {calculateDayEndStock().map(stock => (
                                        <div key={stock.size} className="p-2 border border-gray-200 rounded bg-gray-50">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold">{getSizeLabel(stock.size)}</div>
                                            <div className="text-xl font-bold text-gray-900 my-1">{stock.closing}</div>
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-red-600 font-medium">-{stock.udhar}</span>
                                                <span className="text-green-600 font-medium">+{stock.jama}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="w-64 flex flex-col gap-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-0 border-b border-gray-300 pb-2">{t('daySummary') || 'Day Summary'}</h3>

                                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
                                    <div className="text-xs font-bold text-red-800 uppercase tracking-widest">{t('totalUdhar') || 'Total Udhar'}</div>
                                    <div className="text-3xl font-bold text-red-900 mt-1">{calculateTotals().totalUdhar}</div>
                                </div>

                                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r">
                                    <div className="text-xs font-bold text-green-800 uppercase tracking-widest">{t('totalJama') || 'Total Jama'}</div>
                                    <div className="text-3xl font-bold text-green-900 mt-1">{calculateTotals().totalJama}</div>
                                </div>

                                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r mt-2">
                                    <div className="text-xs font-bold text-blue-800 uppercase tracking-widest">{t('netChange') || 'Net Change'}</div>
                                    <div className="text-4xl font-bold text-blue-900 mt-1">
                                        {calculateTotals().totalJama - calculateTotals().totalUdhar}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Promotional Footer */}
                        <div style={{
                            textAlign: 'center',
                            padding: '4px 0',
                            marginTop: '40px',
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#dc2626',
                            letterSpacing: '0.5px',
                            opacity: 0.6
                        }}>
                            કસ્ટમ બિલિંગ સોફ્ટવેર બનાવા સંપર્ક કરો - 8866471567
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default JournalSection;
