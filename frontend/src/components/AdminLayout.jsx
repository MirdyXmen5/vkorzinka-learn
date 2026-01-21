import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const AdminLayout = () => {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Secondary check for admin role
    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="p-8 bg-white shadow-lg rounded-lg text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">{t('common.error')}</h1>
                    <p className="text-gray-600 mb-6">Unauthorized access.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-[#5cad2d] text-white px-6 py-2 rounded-md hover:bg-[#4a8c24]"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }


    const isActive = (path) => {
        return location.pathname === path ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-600 hover:bg-white hover:text-primary';
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-sans flex text-sm">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#ffffffcc] backdrop-blur-3xl border-r border-white/50 flex flex-col transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Logo Area */}
                <div className="h-24 flex items-center px-8 border-b border-gray-100/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-green-400 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                            Admin
                        </div>
                        <span className="text-xl font-bold text-gray-800 tracking-tight">VK Admin</span>
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={toggleSidebar} className="lg:hidden ml-auto text-gray-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{t('admin.sidebar.panel')}</p>

                    <Link to="/admin" onClick={() => setIsSidebarOpen(false)} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold group ${isActive('/admin')}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>{t('admin.sidebar.dashboard')}</span>
                    </Link>

                    <Link to="/admin/courses" onClick={() => setIsSidebarOpen(false)} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold group ${isActive('/admin/courses')}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>{t('admin.sidebar.courses')}</span>
                    </Link>

                    <Link to="/admin/users" onClick={() => setIsSidebarOpen(false)} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold group ${isActive('/admin/users')}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>{t('admin.sidebar.users')}</span>
                    </Link>
                </nav>

                {/* Footer User Info */}
                <div className="p-6 border-t border-gray-100/50">
                    <div className="glass p-4 rounded-2xl flex items-center space-x-3 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                user?.first_name?.charAt(0) || user?.username?.charAt(0)
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user?.first_name || user?.username}</p>
                            <p className="text-xs text-gray-500 font-medium truncate">{t('admin.header.administrator')}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Header */}
                <header className="h-20 bg-[#ffffffcc] backdrop-blur-md border-b border-white/50 flex items-center justify-between px-8 z-10 sticky top-0">
                    <div className="flex items-center">
                        <button onClick={toggleSidebar} className="lg:hidden mr-4 text-gray-500 bg-white p-2 rounded-lg shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight hidden sm:block">{t('admin.nav.dashboard')}</h1>
                    </div>

                    <div className="flex items-center space-x-6">
                        <Link to="/" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>{t('admin.header.backToSite')}</span>
                        </Link>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-auto p-8 relative scroll-smooth">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
