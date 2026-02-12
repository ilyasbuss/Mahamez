import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend, addMonths, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, LogOut, Save, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Availability: React.FC = () => {
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    // Mock State for Unavailable Dates (Set of ISO strings)
    const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set());

    const handleLogout = () => {
        localStorage.removeItem('mahamez_auth');
        navigate('/login');
    };

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    const toggleUnavailable = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        setUnavailableDates(prev => {
            const next = new Set(prev);
            if (next.has(dateStr)) next.delete(dateStr);
            else next.add(dateStr);
            return next;
        });
    };

    const saveAvailability = () => {
        alert(`Gespeichert! ${unavailableDates.size} Tage als nicht verfügbar markiert.`);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-700 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#4B2C82] text-white rounded-lg flex items-center justify-center font-bold">M</div>
                    <h1 className="font-bold text-lg hidden md:block">Meine Verfügbarkeit</h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 hidden md:block">{localStorage.getItem('mahamez_user_email')}</span>
                    <button onClick={handleLogout} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
                <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                    {/* Calendar Header */}
                    <div className="p-6 border-b flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 capitalize">{format(currentMonth, 'MMMM yyyy', { locale: de })}</h2>
                        <div className="flex gap-1">
                            <button onClick={() => setCurrentMonth(prev => subMonths(prev, 1))} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronLeft size={20} /></button>
                            <button onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronRight size={20} /></button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-6">
                        <div className="grid grid-cols-7 mb-4">
                            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                                <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {/* Padding for start of month */}
                            {Array.from({ length: (days[0].getDay() + 6) % 7 }).map((_, i) => (
                                <div key={`pad-${i}`} className="aspect-square"></div>
                            ))}

                            {days.map(day => {
                                const dateStr = format(day, 'yyyy-MM-dd');
                                const isUnavailable = unavailableDates.has(dateStr);
                                const isWknd = isWeekend(day);

                                return (
                                    <button
                                        key={dateStr}
                                        onClick={() => toggleUnavailable(day)}
                                        className={`
                                    aspect-square rounded-2xl flex flex-col items-center justify-center relative border transition-all duration-200
                                    ${isUnavailable
                                                ? 'bg-red-50 border-red-200 text-red-600'
                                                : 'bg-white border-slate-100 hover:border-purple-200 hover:shadow-md'
                                            }
                                    ${isWknd && !isUnavailable ? 'bg-slate-50/50' : ''}
                                `}
                                    >
                                        <span className={`text-lg font-bold ${isUnavailable ? 'text-red-600' : 'text-slate-700'}`}>{format(day, 'd')}</span>
                                        {isUnavailable && <Ban size={16} className="mt-1 opacity-50" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 bg-slate-50 border-t flex justify-end">
                        <button onClick={saveAvailability} className="bg-[#4B2C82] hover:bg-[#5B3798] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-900/10 flex items-center gap-2 transition">
                            <Save size={18} />
                            <span>Speichern</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Availability;
