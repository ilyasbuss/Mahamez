import React, { useMemo, useState, useEffect } from 'react';
import { Download, Calendar, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { generateICalContent, downloadICalFile, ICalEvent } from '../../services/icalUtils';
import { Shift, Employee } from '../../types';
import { INITIAL_SKILL_GROUPS, INITIAL_EMPLOYEES } from '../../constants';

const CurrentSchedule: React.FC = () => {
    const [selectedDept, setSelectedDept] = useState('Radioredaktion');
    const [showUpdateNotification, setShowUpdateNotification] = useState(false);
    
    const currentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i)), [currentWeek]);

    // Load published shifts and employees
    const [publishedShifts, setPublishedShifts] = useState<Shift[]>(() => {
        const saved = localStorage.getItem('mahamez_published_shifts');
        return saved ? (JSON.parse(saved) as Shift[]) : [];
    });

    const employees = useMemo(() => INITIAL_EMPLOYEES, []);
    const currentUserId = localStorage.getItem('mahamez_user_id');

    // Listen for storage changes (when planner publishes)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'mahamez_published_shifts') {
                setShowUpdateNotification(true);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleReload = () => {
        const saved = localStorage.getItem('mahamez_published_shifts');
        if (saved) {
            setPublishedShifts(JSON.parse(saved));
        }
        setShowUpdateNotification(false);
    };

    // Filter roles for the selected department
    const deptRoles = useMemo(() => {
        let groups = INITIAL_SKILL_GROUPS;
        if (selectedDept === 'Moderation') {
            groups = INITIAL_SKILL_GROUPS.filter(g => g.id === 'g_moderation');
        } else if (selectedDept === 'Onlineredaktion') {
            groups = INITIAL_SKILL_GROUPS.filter(g => 
                g.departments.includes('Online-Redaktion') || 
                g.roles.some(r => r.departments?.includes('Online-Redaktion'))
            );
        } else {
            groups = INITIAL_SKILL_GROUPS.filter(g => 
                (g.departments.includes('Radio-Redaktion') && g.id !== 'g_moderation') ||
                g.roles.some(r => r.departments?.includes('Radio-Redaktion'))
            );
        }

        const roles: { name: string; startTime: string; endTime: string; groupId: string }[] = [];
        groups.forEach(g => {
            g.roles.forEach(r => {
                const rDeptKey = selectedDept === 'Onlineredaktion' ? 'Online-Redaktion' : 'Radio-Redaktion';
                if (selectedDept === 'Moderation' || r.departments?.includes(rDeptKey) || g.departments.includes(rDeptKey)) {
                    roles.push({ ...r, groupId: g.id });
                }
            });
        });
        return roles;
    }, [selectedDept]);

    const handleICalDownload = () => {
        const userShifts = publishedShifts.filter(s => s.employeeId === currentUserId);
        const events: ICalEvent[] = userShifts.map(s => {
            const roleInfo = deptRoles.find(r => r.name === s.roleName);
            const start = new Date(s.date);
            if (roleInfo) {
                const [h, m] = roleInfo.startTime.split(':').map(Number);
                start.setHours(h, m, 0);
            }
            const end = new Date(s.date);
            if (roleInfo) {
                const [h, m] = roleInfo.endTime.split(':').map(Number);
                end.setHours(h, m, 0);
            }
            return {
                start,
                end,
                summary: `Dienst: ${s.roleName}`,
                description: `SWR Dienstplan - Schicht als ${s.roleName}`,
                location: 'SWR Funkhaus'
            };
        });
        const content = generateICalContent(events);
        downloadICalFile('mein-dienstplan.ics', content);
    };

    const handleWebcalLink = () => {
        alert("Kalender-Abonnement ist in der Demo-Version (ohne Backend) nicht verfügbar.");
    };

    const handleExportPDF = () => {
        window.print();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {/* Update Notification Popup */}
            {showUpdateNotification && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1D0B40]/70 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-300">
                        <div className="mx-auto w-16 h-16 bg-purple-100 text-[#4B2C82] rounded-full flex items-center justify-center mb-6">
                            <RefreshCw size={32} className="animate-spin-slow" />
                        </div>
                        <div className="space-y-2 mb-8">
                            <h3 className="text-2xl font-bold text-slate-800">Eine neue Version wurde veröffentlicht</h3>
                            <p className="text-slate-500 text-sm leading-relaxed px-4">
                                Der Dienstplan wurde soeben aktualisiert. Bitte laden Sie die Daten neu, um die aktuellste Version zu sehen.
                            </p>
                        </div>
                        <button
                            onClick={handleReload}
                            className="w-full bg-[#4B2C82] hover:bg-[#5B3798] text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2 group"
                        >
                            <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                            Neu laden
                        </button>
                    </div>
                </div>
            )}

            {/* Department Tabs */}
            <div className="flex gap-2">
                {['Radioredaktion', 'Moderation', 'Onlineredaktion'].map((dept) => (
                    <button
                        key={dept}
                        onClick={() => setSelectedDept(dept)}
                        className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${selectedDept === dept
                            ? 'bg-[#4B2C82] text-white'
                            : 'bg-white text-slate-400 hover:bg-slate-50'
                            }`}
                    >
                        {dept}
                    </button>
                ))}
            </div>

            {/* Header with Download Buttons */}
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl border shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Calendar size={20} className="text-[#4B2C82]" />
                    Aktueller Dienstplan
                </h2>
                <div className="flex gap-2 items-center">
                    <div className="flex border rounded-xl overflow-hidden shadow-sm">
                        <button
                            onClick={handleICalDownload}
                            className="px-4 py-2 bg-white border-r text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                            title="iCal Datei herunterladen"
                        >
                            <Calendar size={16} className="text-[#4B2C82]" />
                            iCal Download
                        </button>
                        <button
                            onClick={handleWebcalLink}
                            className="px-4 py-2 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                            title="Kalender abonnieren"
                        >
                            🔗 Abonnieren
                        </button>
                    </div>

                    <div className="w-px h-6 bg-slate-200 mx-1" />

                    <button
                        onClick={handleExportPDF}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-[#4B2C82] hover:text-[#4B2C82] transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Download size={16} />
                        PDF / Drucken
                    </button>
                </div>
            </div>

            {/* Schedule Table - Planner Design */}
            <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto relative">
                <table className="w-full border-collapse text-xs text-left text-slate-800">
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="p-2 border-b border-r sticky left-0 bg-slate-50 z-20 font-bold text-slate-600 text-[12px] uppercase tracking-widest whitespace-nowrap w-[1%]">Funktion</th>
                            {weekDays.map(day => {
                                const isToday = isSameDay(day, new Date());
                                return (
                                    <th key={day.toISOString()} className={`p-2 border-b border-r min-w-[110px] text-center relative ${isToday ? 'bg-purple-50/20' : ''}`}>
                                        {isToday && <div className="absolute top-0 left-0 right-0 h-1 bg-[#4B2C82] z-30" />}
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{format(day, 'EEEE', { locale: de })}</div>
                                        <div className={`text-[13px] font-bold ${isToday ? 'text-slate-900' : 'text-slate-700'}`}>{format(day, 'dd.MM.')}</div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y relative">
                        {deptRoles.map((role, i) => (
                            <tr key={`${role.groupId}-${role.name}`} className="hover:bg-slate-50/50 transition-all duration-200 group/row cursor-default">
                                <td className="py-0.5 px-3 border-r sticky left-0 bg-slate-100 z-10 shadow-sm relative whitespace-nowrap w-[1%]">
                                    <div className="flex flex-col min-w-max">
                                        <div className="font-bold text-slate-900 text-[11.7px] uppercase tracking-tight leading-[1] mb-[1px] whitespace-nowrap">{role.name}</div>
                                        <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1 whitespace-nowrap">
                                            <Clock size={10} /> {role.startTime} - {role.endTime}
                                        </div>
                                    </div>
                                </td>
                                {weekDays.map(day => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const shift = publishedShifts.find(s => s.date === dateStr && s.roleName === role.name);
                                    const emp = shift ? employees.find(e => e.id === shift.employeeId) : null;
                                    const isOwnShift = shift?.employeeId === currentUserId;

                                    return (
                                        <td key={dateStr} className="py-1 px-1.5 border-r relative group/cell">
                                            {shift ? (
                                                <div className={`h-8 border rounded-xl flex items-center justify-center relative transition shadow-sm ${
                                                    isOwnShift 
                                                        ? 'bg-[#4B2C82] border-[#4B2C82]' 
                                                        : emp?.role.includes('Fest') ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100'
                                                }`}>
                                                    <span className={`font-bold text-[11px] select-none ${isOwnShift ? 'text-white' : 'text-slate-700'}`}>
                                                        {emp?.name || shift.customName || '--'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="w-full h-8 border border-dashed border-slate-100 rounded-xl flex items-center justify-center text-slate-200 text-[10px] italic">
                                                    --
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span><strong>Hinweis:</strong> Dies zeigt den aktuell veröffentlichten Dienstplan. Änderungen des Planers werden erst nach Veröffentlichung hier sichtbar.</span>
                </p>
            </div>
        </div>
    );
};

export default CurrentSchedule;
