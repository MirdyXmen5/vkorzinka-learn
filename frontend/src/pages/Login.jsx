import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(username, password);
            if (!result.success) {
                setError(result.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements are inherited from body, but adding extra flair */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="max-w-md w-full space-y-8 glass-card relative z-10 animate-fade-in">
                <div className="text-center">
                    <img
                        className="mx-auto h-20 w-auto rounded-2xl shadow-lg mb-6 hover:rotate-3 transition-transform duration-500"
                        src="/LOGO.jpeg"
                        alt="Logo"
                    />
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                        LEARN
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        {t('login.title')}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl animate-fade-in">
                            <p className="text-sm text-red-700 font-medium flex items-center">
                                <span className="mr-2">⚠️</span> {error}
                            </p>
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 ml-1 mb-1">
                                {t('login.username')}
                            </label>
                            <input
                                name="username"
                                type="text"
                                required
                                className="glass-input w-full"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 ml-1 mb-1">
                                {t('login.password')}
                            </label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="glass-input w-full"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full btn-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : t('login.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
