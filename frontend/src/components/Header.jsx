import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Header = () => {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close mobile menu on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (isMenuOpen) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMenuOpen]);

    const changeLanguage = (e) => {
        i18n.changeLanguage(e.target.value);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 glass border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center space-x-3 group w-auto">
                            <img src="/LOGO.jpeg" alt="Logo" className="h-10 w-auto rounded-xl shadow-lg group-hover:rotate-3 transition-transform duration-300" />
                            <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-primary transition-colors uppercase hidden sm:block">LEARN</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <div className="relative group">
                            <select
                                onChange={changeLanguage}
                                value={i18n.language}
                                className="appearance-none bg-white/50 border border-gray-200 text-gray-700 py-2 pl-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold cursor-pointer transition-all hover:bg-white/80"
                            >
                                <option value="en">English</option>
                                <option value="ru">Русский</option>
                                <option value="kk">Қазақша</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {user && (
                            <div className="flex items-center space-x-4">
                                {user.role === 'ADMIN' && (
                                    <Link to="/admin" className="px-4 py-2 text-sm font-semibold text-primary/90 bg-primary/10 rounded-xl hover:bg-primary/20 transition-all">
                                        Admin Panel
                                    </Link>
                                )}
                                <Link to="/profile" className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>{t('header.profile')}</span>
                                </Link>
                                <div className="flex items-center px-4 py-2 bg-white/50 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-green-400 flex items-center justify-center text-white font-bold text-xs shadow-md mr-3">
                                        {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 font-medium leading-none mb-1">{t('header.welcome').replace(', {{name}}', '')}</span>
                                        <span className="text-sm font-bold text-gray-900 leading-none">{user.first_name || user.username}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title={t('header.logout')}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden glass border-t border-white/20 absolute w-full">
                    <div className="px-4 pt-2 pb-3 space-y-1 sm:px-3">
                        <div className="mb-4">
                            <select
                                onChange={changeLanguage}
                                value={i18n.language}
                                className="w-full bg-white/50 border border-gray-200 text-gray-700 py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold"
                            >
                                <option value="en">English</option>
                                <option value="ru">Русский</option>
                                <option value="kk">Қазақша</option>
                            </select>
                        </div>
                        {user && (
                            <>
                                <div className="flex items-center px-4 py-3 bg-white/50 rounded-xl mb-4">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-green-400 flex items-center justify-center text-white font-bold text-sm shadow-md mr-3">
                                        {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 font-medium leading-none mb-1">{t('header.welcome').replace(', {{name}}', '')}</span>
                                        <span className="text-sm font-bold text-gray-900 leading-none">{user.first_name || user.username}</span>
                                    </div>
                                </div>

                                {user.role === 'ADMIN' && (
                                    <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/10" onClick={() => setIsMenuOpen(false)}>
                                        Admin Panel
                                    </Link>
                                )}
                                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/10" onClick={() => setIsMenuOpen(false)}>
                                    {t('header.profile')}
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-red-500 hover:bg-red-50"
                                >
                                    {t('header.logout')}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
