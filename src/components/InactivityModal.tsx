import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface InactivityModalProps {
    onContinue: () => void;
    expiresInSeconds: number;
}

const InactivityModal: React.FC<InactivityModalProps> = ({ onContinue, expiresInSeconds }) => {
    const [seconds, setSeconds] = useState(expiresInSeconds);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (s: number) => {
        const mm = Math.floor(s / 60).toString().padStart(2, '0');
        const ss = (s % 60).toString().padStart(2, '0');
        return `${mm}:${ss}`;
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
                    <Clock size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Inaktivitt</h2>
                <p className="text-slate-500 mb-6">
                    Sie werden in <span className="font-bold text-amber-600">{formatTime(seconds)}</span> aufgrund von Inaktivitt abgemeldet.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={onContinue}
                        className="bg-[#4B2C82] hover:bg-[#5B3798] text-white font-bold py-3 rounded-xl transition shadow-lg shadow-purple-900/20"
                    >
                        Weiterarbeiten
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InactivityModal;
