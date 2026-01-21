import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const Profile = () => {
    const { t } = useTranslation();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('profile/');
                setUserData(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                setError(t('profile.error'));
                setLoading(false);
            }
        };

        fetchProfile();
    }, [t]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-3xl shadow-sm">
                    <p className="font-bold text-red-800">{t('common.error')}</p>
                    <p className="text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    if (!userData) return null;

    const enrollmentCount = userData.enrollments ? userData.enrollments.length : 0;
    const completedCount = userData.certificates ? userData.certificates.length : 0;
    const completionRate = enrollmentCount > 0 ? Math.round((completedCount / enrollmentCount) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#f8fafc] py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
                <div className="glass p-10 rounded-[2.5rem] shadow-xl border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-10 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                    <div className="relative group">
                        <div className="h-32 w-32 bg-gradient-to-tr from-primary to-primary-light rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-2xl transform transition-transform group-hover:rotate-6">
                            {userData.username[0].toUpperCase()}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-primary border border-gray-100">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left pt-2">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl mb-2">
                            {userData.first_name} {userData.last_name}
                        </h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center">
                            <span className="text-lg text-gray-400 font-bold uppercase tracking-widest text-sm">@{userData.username}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-200 hidden md:block"></span>
                            <span className="text-gray-500 font-medium">{userData.email}</span>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <div className="bg-white/50 px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                                <span className="text-2xl font-black text-gray-900">{enrollmentCount}</span>
                                <span className="text-xs font-black uppercase text-gray-400 tracking-widest">{t('profile.stats.enrolled')}</span>
                            </div>
                            <div className="bg-white/50 px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                                <span className="text-2xl font-black text-primary">{completedCount}</span>
                                <span className="text-xs font-black uppercase text-gray-400 tracking-widest">{t('profile.stats.completed')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="md:w-64 pt-6">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">{t('profile.stats.percentage')}</span>
                            <span className="text-sm font-black text-primary">{completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-primary h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                                style={{ width: `${completionRate}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 mt-3 text-center uppercase tracking-widest">Growth Mindset</p>
                    </div>
                </div>

                {/* Certificates List */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('profile.certificateSection')}</h2>
                        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                            Official Credentials
                        </span>
                    </div>

                    {userData.certificates && userData.certificates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {userData.certificates.map((cert) => (
                                <div key={cert.id} className="group glass p-8 rounded-[2rem] flex flex-col hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-gray-100 relative overflow-hidden">
                                    <div className="absolute -top-4 -right-4 h-24 w-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors"></div>

                                    <div className="mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-110">
                                            <svg className="w-6 h-6 border-2 border-primary rounded-full p-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h4 className="text-2xl font-black text-gray-900 mb-2 leading-tight group-hover:text-primary transition-colors">{cert.course_title}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                                {t('profile.certificates.issued', { date: new Date(cert.issued_at).toLocaleDateString() })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Verified</span>
                                            <button
                                                onClick={async () => {
                                                    if (confirm(t('common.deleteConfirm') || 'Are you sure you want to delete this certificate?')) {
                                                        try {
                                                            await api.delete(`certificates/${cert.id}/`);
                                                            setUserData(prev => ({
                                                                ...prev,
                                                                certificates: prev.certificates.filter(c => c.id !== cert.id)
                                                            }));
                                                        } catch (err) {
                                                            alert('Failed to delete certificate');
                                                        }
                                                    }
                                                }}
                                                className="text-red-400 hover:text-red-600 transition-colors p-1"
                                                title={t('common.delete')}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                        <a
                                            href={cert.pdf_file}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary transition-all shadow-lg active:scale-95 transform"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            {t('profile.certificates.download')}
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.364-6.364l-.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5z" />
                                </svg>
                            </div>
                            <p className="text-gray-400 font-black uppercase tracking-widest text-sm">{t('profile.certificates.noCertificates')}</p>
                            <p className="text-gray-400 text-xs mt-2">Complete a course to unlock your first credential.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
