import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Lock } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // MOCK AUTHENTICATION
        localStorage.setItem('mahamez_auth', 'true');
        localStorage.setItem('mahamez_user_email', email);

        // Simple mock logic to direct to different views
        if (email.includes('planer')) {
            navigate('/planner');
        } else {
            navigate('/availability');
        }
    };

    return (
        <div className="min-h-screen bg-[#1D0B40] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-8 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#4B2C82]">
                        <Users size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Willkommen bei Mahamez</h1>
                    <p className="text-slate-500 mt-2">Bitte melden Sie sich an</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Adresse</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#4B2C82] focus:ring-1 focus:ring-[#4B2C82] transition font-medium text-slate-700"
                                placeholder="name@firma.de"
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#4B2C82] focus:ring-1 focus:ring-[#4B2C82] transition font-medium text-slate-700"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-[#4B2C82] hover:bg-[#5B3798] text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 mt-2">
                        Anmelden
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-400">
                        Tipp: 'planer@...' für Planer-Ansicht,<br />andere für Mitarbeiter-Ansicht.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
