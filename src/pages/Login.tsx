import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth, User } from '../services/AuthContext';
import MahamezLogo from '../components/MahamezLogo';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [lockCountdown, setLockCountdown] = useState<number | null>(null);
    const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        let interval: number;
        if (lockCountdown !== null && lockCountdown > 0) {
            interval = window.setInterval(() => {
                setLockCountdown(prev => (prev !== null && prev > 0) ? prev - 1 : null);
            }, 1000);
        }
        return () => window.clearInterval(interval);
    }, [lockCountdown]);

    const formatTime = (seconds: number) => {
        const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
        const ss = (seconds % 60).toString().padStart(2, '0');
        return `${mm}:${ss}`;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Mock login for UX demonstration
        setTimeout(() => {
            if (email === 'planer@swr.de' && password === 'planer') {
                const mockUser: User = { id: 1, email: 'planer@swr.de', name: 'Planer Admin', role: 'planer' };
                login('mock_token', 'mock_refresh', mockUser);
                navigate('/planner');
            } else if (email === 'user@swr.de' && password === 'user') {
                const mockUser: User = { id: 2, email: 'user@swr.de', name: 'Mitarbeiter User', role: 'mitarbeiter' };
                login('mock_token', 'mock_refresh', mockUser);
                navigate('/availability');
            } else {
                setError("Ungültige Anmeldedaten. (Demo: planer@swr.de / planer oder user@swr.de / user)");
            }
            setLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#1D0B40] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-8 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center mx-auto mb-6">
                        <MahamezLogo className="w-24 h-24" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Dienstplanung - Anmelden</h1>
                    <p className="text-slate-400 font-bold tracking-widest mt-2 uppercase text-xs">SWR</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3 rounded-r-xl animate-in slide-in-from-top-2">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium">{error}</p>
                            {lockCountdown !== null && lockCountdown > 0 && (
                                <p className="text-xs font-bold mt-1">
                                    Warten Sie: {formatTime(lockCountdown)}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {remainingAttempts !== null && remainingAttempts <= 5 && remainingAttempts > 0 && !lockCountdown && (
                    <div className="mb-4 text-center">
                        <p className="text-xs font-bold text-amber-600">
                            Noch {remainingAttempts} Versuche brig, bevor Account gesperrt wird.
                        </p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Adresse</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                disabled={loading || (lockCountdown !== null && lockCountdown > 0)}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#4B2C82] focus:ring-1 focus:ring-[#4B2C82] transition font-medium text-slate-700 disabled:opacity-50"
                                placeholder="name@swr.de"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Passwort</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                disabled={loading || (lockCountdown !== null && lockCountdown > 0)}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#4B2C82] focus:ring-1 focus:ring-[#4B2C82] transition font-medium text-slate-700 disabled:opacity-50"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="text-right">
                        <button type="button" className="text-xs font-semibold text-[#4B2C82] hover:underline">
                            Passwort vergessen?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || (lockCountdown !== null && lockCountdown > 0)}
                        className="w-full bg-[#4B2C82] hover:bg-[#5B3798] text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                    >
                        {loading ? "Wird angemeldet..." : "Anmelden"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
