import React from 'react';
import { Download, Calendar } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { generateICalContent, downloadICalFile, ICalEvent } from '../../services/icalUtils';

const CurrentSchedule: React.FC = () => {
    const [selectedDept, setSelectedDept] = React.useState('Radioredaktion');
    // Mock schedule data
    const currentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

    const mockShifts = [
        { day: 0, role: 'Mod Morningshow', time: '04:30 - 11:00', startHour: 4, startMin: 30, endHour: 11, endMin: 0, dept: 'Moderation' },
        { day: 1, role: 'Mod Morningshow', time: '04:30 - 11:00', startHour: 4, startMin: 30, endHour: 11, endMin: 0, dept: 'Moderation' },
        { day: 2, role: 'Redakteur NOW', time: '07:30 - 16:15', startHour: 7, startMin: 30, endHour: 16, endMin: 15, dept: 'Radioredaktion' },
        { day: 4, role: 'Mod PUSH', time: '08:30 - 17:15', startHour: 8, startMin: 30, endHour: 17, endMin: 15, dept: 'Moderation' },
    ].filter(s => s.dept === selectedDept);

    const handleICalDownload = () => {
        const events: ICalEvent[] = mockShifts.map(s => {
            const start = new Date(weekDays[s.day]);
            start.setHours(s.startHour, s.startMin, 0);
            const end = new Date(weekDays[s.day]);
            end.setHours(s.endHour, s.endMin, 0);
            return {
                start,
                end,
                summary: `Dienst: ${s.role}`,
                description: `SWR Dienstplan - Schicht als ${s.role}`,
                location: 'SWR Funkhaus'
            };
        });
        const content = generateICalContent(events);
        downloadICalFile('mein-dienstplan.ics', content);
    };

    const handleWebcalLink = () => {
        const url = `webcal://localhost:8000/api/calendar/subscribe/${localStorage.getItem('mahamez_user_id') || 'guest'}.ics`;
        window.location.href = url;
    };

    const handleExportPDF = () => {
        window.print();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                    Mein Dienstplan
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

            {/* Schedule Table */}
            <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                {weekDays.map((day) => (
                                    <th
                                        key={day.toISOString()}
                                        className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                                    >
                                        <div className="flex flex-col">
                                            <span>{format(day, 'EEE', { locale: de })}</span>
                                            <span className="text-slate-800 text-sm">{format(day, 'dd.MM')}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {weekDays.map((day, idx) => {
                                    const shift = mockShifts.find((s) => s.day === idx);
                                    return (
                                        <td
                                            key={day.toISOString()}
                                            className="px-4 py-6 border-b border-r border-slate-100 align-top"
                                        >
                                            {shift ? (
                                                <div className="space-y-2">
                                                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                                                        <div className="font-bold text-[16px] text-slate-900 mb-1 leading-tight">
                                                            {shift.role}
                                                        </div>
                                                        <div className="text-[14px] font-bold text-slate-600 flex items-center gap-1">
                                                            <Calendar size={14} className="text-[#4B2C82]" />
                                                            {shift.time}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center text-slate-300 text-xs py-4">Frei</div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-sm text-blue-800">
                    <strong>Hinweis:</strong> Dies ist ein Mockup-Dienstplan. In der Produktivversion werden hier Ihre tatsächlichen Schichten angezeigt.
                </p>
            </div>
        </div>
    );
};

export default CurrentSchedule;
