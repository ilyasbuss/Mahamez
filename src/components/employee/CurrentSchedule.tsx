import React from 'react';
import { Download, Calendar } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';

const CurrentSchedule: React.FC = () => {
    // Mock schedule data
    const currentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

    const mockShifts = [
        { day: 0, role: 'Mod Morningshow', time: '04:30 - 11:00' },
        { day: 1, role: 'Mod Morningshow', time: '04:30 - 11:00' },
        { day: 2, role: 'Redakteur NOW', time: '07:30 - 16:15' },
        { day: 4, role: 'Mod PUSH', time: '08:30 - 17:15' },
    ];

    const handleExportPDF = () => {
        alert('PDF-Export wird vorbereitet...');
    };

    const handleExportExcel = () => {
        alert('Excel-Export wird vorbereitet...');
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with Download Buttons */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Calendar size={20} className="text-[#4B2C82]" />
                    Mein Dienstplan
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportPDF}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-[#4B2C82] hover:text-[#4B2C82] transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Download size={16} />
                        PDF
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-[#4B2C82] hover:text-[#4B2C82] transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Download size={16} />
                        Excel
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
                                                        <div className="font-bold text-sm text-slate-800 mb-1">
                                                            {shift.role}
                                                        </div>
                                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                                            <Calendar size={12} />
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
