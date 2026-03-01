import React, { useState } from 'react';
import { PartialAvailability } from '../types';
import AvailabilityCalendar from '../components/employee/AvailabilityCalendar';
import CurrentSchedule from '../components/employee/CurrentSchedule';
import MyShifts from '../components/employee/MyShifts';
import EmployeeAnalytics from '../components/employee/EmployeeAnalytics';
import MahamezLogo from '../components/MahamezLogo';
import { useAuth } from '../services/AuthContext';
import { Calendar, ClipboardList, Clock, LogOut, TrendingUp, User } from 'lucide-react';

type TabType = 'availability' | 'schedule' | 'shifts' | 'analyse';

const Availability: React.FC = () => {
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('availability');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [availability, setAvailability] = useState<Map<string, PartialAvailability>>(new Map());

    const handleAvailabilityChange = (date: string, avail: PartialAvailability | null) => {
        setAvailability((prev) => {
            const next = new Map(prev);
            if (avail === null) {
                next.delete(date);
            } else {
                next.set(date, avail);
            }
            return next;
        });
    };

    const handleSave = () => {
        const count = availability.size;
        alert(`Gespeichert! ${count} ${count === 1 ? 'Tag' : 'Tage'} mit Verfügbarkeitsangaben.`);
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row text-slate-700 bg-[#f8fafc]">
            {/* Left Sidebar */}
            <nav className="w-full md:w-64 bg-[#1D0B40] text-white flex flex-col p-4 space-y-0.5">
                <div className="flex items-center space-x-1 px-1.5 py-3 cursor-pointer" onClick={() => setActiveTab('availability')}>
                    <MahamezLogo />
                    <span className="text-xl font-bold tracking-tight leading-none">Mahamez</span>
                </div>

                <div className="space-y-0.5 pt-2">
                    <button
                        onClick={() => setActiveTab('shifts')}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition ${activeTab === 'shifts' ? 'bg-[#4B2C82]' : 'hover:bg-white/10'
                            }`}
                    >
                        <User size={18} />
                        <span>Meine Schichten</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition ${activeTab === 'schedule' ? 'bg-[#4B2C82]' : 'hover:bg-white/10'
                            }`}
                    >
                        <ClipboardList size={18} />
                        <span>Aktueller Dienstplan</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('availability')}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition ${activeTab === 'availability' ? 'bg-[#4B2C82]' : 'hover:bg-white/10'
                            }`}
                    >
                        <Calendar size={18} />
                        <span>Verfügbarkeiten eintragen</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('analyse')}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition ${activeTab === 'analyse' ? 'bg-[#4B2C82]' : 'hover:bg-white/10'
                            }`}
                    >
                        <TrendingUp size={18} />
                        <span>Analyse</span>
                    </button>
                </div>

                <div className="mt-auto pt-3 border-t border-white/10">
                    <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition text-red-400 hover:bg-red-500/10 hover:text-red-300">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>


            </nav>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-800">
                            {activeTab === 'availability' ? 'Verfügbarkeiten eintragen' :
                                activeTab === 'schedule' ? 'Aktueller Dienstplan' :
                                    activeTab === 'shifts' ? 'Meine Schichten' : 'Auslastung & Analyse'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500 hidden md:block">
                            {user?.email ?? 'Mitarbeiter'}
                        </span>
                    </div>
                </header>

                {/* Tab Content */}
                {activeTab === 'availability' && (
                    <div className="space-y-4">
                        <AvailabilityCalendar
                            currentMonth={currentMonth}
                            onMonthChange={setCurrentMonth}
                            onMonthJump={setCurrentMonth}
                            availability={availability}
                            onAvailabilityChange={handleAvailabilityChange}
                        />

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                className="bg-[#4B2C82] hover:bg-[#5B3798] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-900/10 transition"
                            >
                                Speichern
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'schedule' && <CurrentSchedule />}

                {activeTab === 'shifts' && <MyShifts />}

                {activeTab === 'analyse' && <EmployeeAnalytics />}
            </main>
        </div>
    );
};

export default Availability;
