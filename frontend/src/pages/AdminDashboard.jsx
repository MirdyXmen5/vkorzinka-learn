import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('admin/stats/');
                setStats(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch admin stats:", err);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!stats) return <div className="text-center py-10 text-red-600 font-bold">Failed to load platform statistics.</div>;

    const cards = [
        { label: t('admin.stats.employees'), value: stats.total_employees, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: t('admin.stats.courses'), value: stats.total_courses, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.247 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'text-green-600', bg: 'bg-green-50' },
        { label: t('admin.stats.enrollments'), value: stats.total_enrollments, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: t('admin.stats.completions'), value: stats.total_completions, icon: 'M5 13l4 4L19 7', color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { label: t('admin.stats.certificates'), value: stats.total_certificates, icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: t('admin.stats.rate'), value: `${stats.completion_rate}%`, icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'text-pink-600', bg: 'bg-pink-50' },
    ];

    return (
        <div className="space-y-10">
            <header>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">{t('admin.dashboard.title')}</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">{t('admin.dashboard.subtitle')}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cards.map((card, idx) => (
                    <div key={idx} className="glass p-8 rounded-[2rem] border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                        <div className="flex items-center gap-6">
                            <div className={`${card.bg} ${card.color} w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={card.icon} />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{card.label}</p>
                                <p className="text-3xl font-black text-gray-900 tracking-tighter">{card.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass p-10 rounded-[3rem] border-gray-100 mt-12 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">{t('admin.dashboard.trend')}</h3>
                <div className="h-48 flex items-end gap-3 px-4">
                    {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                        <div key={i} className="flex-1 bg-primary/20 rounded-t-xl group relative cursor-pointer" style={{ height: `${h}%` }}>
                            <div className="absolute inset-x-0 bottom-0 bg-primary rounded-t-xl transition-all duration-700 group-hover:h-full" style={{ height: `${h * 0.7}%` }}></div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                                {h}%
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-6 px-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
