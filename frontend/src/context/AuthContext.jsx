import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            try {
                // Fetch user profile to ensure token is valid and get user data
                const response = await api.get('profile/');
                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch user profile", error);
                // If fetching profile fails (likely 401 even after refresh), clear tokens
                if (!localStorage.getItem('access_token')) {
                    setUser(null);
                }
            }
        }
        setLoading(false);
    };

    const login = async (username, password) => {
        try {
            const response = await api.post('token/', {
                username,
                password,
            });

            if (response.status === 200) {
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);

                // Fetch user profile immediately after login
                const profileResponse = await api.get('profile/');
                setUser(profileResponse.data);

                // Navigate to where they came from, or home
                const origin = location.state?.from?.pathname || '/';
                navigate(origin);
                return { success: true };
            }
        } catch (error) {
            console.error("Login failed", error);
            return {
                success: false,
                message: error.response?.data?.detail || "Login failed. Please check your credentials."
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        navigate('/login');
    };

    const value = {
        user,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
