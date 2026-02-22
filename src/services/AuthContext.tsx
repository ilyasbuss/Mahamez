import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import InactivityModal from '../components/InactivityModal';

interface User {
    id: number;
    email: string;
    name: string;
    role: 'planer' | 'mitarbeiter';
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    login: (accessToken: string, refreshToken: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [showInactivityModal, setShowInactivityModal] = useState(false);

    // Load from localStorage on init
    useEffect(() => {
        const savedUser = localStorage.getItem('mahamez_user');
        const token = localStorage.getItem('mahamez_access_token');
        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
            setAccessToken(token);
            setIsAuthenticated(true);
        }
    }, []);

    const login = (token: string, refresh: string, userData: User) => {
        setAccessToken(token);
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('mahamez_access_token', token);
        localStorage.setItem('mahamez_refresh_token', refresh);
        localStorage.setItem('mahamez_user', JSON.stringify(userData));
    };

    const logout = useCallback(() => {
        setAccessToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setShowInactivityModal(false);
        localStorage.removeItem('mahamez_access_token');
        localStorage.removeItem('mahamez_refresh_token');
        localStorage.removeItem('mahamez_user');
    }, []);

    const handleContinue = () => {
        setShowInactivityModal(false);
    };

    // Keep a ref so the stable resetTimers callback always reads the latest value
    // without needing to re-register event listeners on every state change (stale-closure fix).
    const showModalRef = useRef(showInactivityModal);
    useEffect(() => { showModalRef.current = showInactivityModal; }, [showInactivityModal]);

    // Inactivity Timer logic (10 min warning, 12 min logout)
    useEffect(() => {
        if (!isAuthenticated) return;

        let warningTimer: number;
        let logoutTimer: number;

        const resetTimers = () => {
            window.clearTimeout(warningTimer);
            window.clearTimeout(logoutTimer);

            if (!showModalRef.current) {
                // 10 minutes warning
                warningTimer = window.setTimeout(() => {
                    setShowInactivityModal(true);
                }, 10 * 60 * 1000);

                // 12 minutes logout
                logoutTimer = window.setTimeout(() => {
                    logout();
                }, 12 * 60 * 1000);
            }
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimers));
        resetTimers();

        return () => {
            window.clearTimeout(warningTimer);
            window.clearTimeout(logoutTimer);
            events.forEach(event => window.removeEventListener(event, resetTimers));
        };
    }, [isAuthenticated, logout]); // removed showInactivityModal dep – handled via ref

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logout, isAuthenticated }}>
            {children}
            {showInactivityModal && (
                <InactivityModal
                    onContinue={handleContinue}
                    expiresInSeconds={120}
                />
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
