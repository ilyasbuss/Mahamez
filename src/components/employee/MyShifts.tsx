import React from 'react';
import { Clock, Calendar } from 'lucide-react';

const MyShifts: React.FC = () => {
    return (
        <div className="bg-white p-8 border rounded-3xl shadow-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock size={32} className="text-[#4B2C82]" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Meine Schichten</h3>
                <p className="text-slate-500 mb-6">
                    Hier werden bald Ihre vergangenen und zukünftigen Schichten angezeigt.
                </p>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-sm text-slate-400">
                        Diese Funktion ist derzeit in Entwicklung.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MyShifts;
