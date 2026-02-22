import React, { useState } from 'react';
import { LayoutGrid, List, Clock, Calendar, CheckCircle2 } from 'lucide-react';

const WEEK_DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const SHOWS = [
    { name: 'POPNACHT', time: '00:00 - 05:00' },
    { name: 'Morningshow / FIT', time: '05:00 - 10:00' },
    { name: 'Vormittag / TALK', time: '10:00 - 13:00' },
    { name: 'Nachmittag', time: '13:00 - 16:00' },
    { name: 'MOVE / EASY', time: '16:00 - 20:00' },
    { name: 'Abendshow', time: '20:00 - 00:00' }
];

const WeeklyViewMockups: React.FC = () => {
    return (
        <div className="space-y-12 py-6">
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-bold text-slate-800">Mockup 1: Klassische Tabelle (PDF-Style)</h4>
                        <p className="text-sm text-slate-500">Maximale Informationsdichte, perfekt für eine schnelle Wochenübersicht.</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-full">Dichte & Übersicht</span>
                </div>
                <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b">
                                <th className="p-3 text-left border-r font-bold text-slate-400 w-40">SENDUNG / ZEIT</th>
                                {WEEK_DAYS.map(day => (
                                    <th key={day} className="p-3 text-center font-bold text-slate-600">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {SHOWS.map((show, idx) => (
                                <tr key={show.name} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="p-3 border-r bg-slate-50/30">
                                        <div className="font-bold text-slate-800">{show.name}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">{show.time}</div>
                                    </td>
                                    {WEEK_DAYS.map(day => (
                                        <td key={day} className="p-2 text-center">
                                            <div className={`p-2 rounded-xl border ${idx % 2 === 0 ? 'bg-purple-50 border-purple-100 text-[#4B2C82]' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
                                                <div className="font-bold">Moderator</div>
                                                <div className="text-[9px] opacity-70 italic">Redakteur</div>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-bold text-slate-800">Mockup 2: Moderne Spalten-Ansicht (Flow)</h4>
                        <p className="text-sm text-slate-500">Vertikale Trennung der Tage, ideal für die mobile Ansicht oder Drag & Drop.</p>
                    </div>
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider rounded-full">Flexibilität & Fokus</span>
                </div>
                <div className="grid grid-cols-7 gap-3">
                    {WEEK_DAYS.map(day => (
                        <div key={day} className="space-y-2">
                            <div className="bg-[#4B2C82] text-white p-2 rounded-2xl text-center font-bold text-sm shadow-md">
                                {day}
                            </div>
                            <div className="space-y-2">
                                {SHOWS.slice(1, 5).map(show => (
                                    <div key={show.name} className="bg-white p-2 rounded-2xl border shadow-sm hover:border-[#4B2C82] cursor-pointer transition-all group">
                                        <div className="text-[9px] font-bold text-slate-400 group-hover:text-[#4B2C82] mb-1 uppercase">{show.name.split(' ')[0]}</div>
                                        <div className="font-bold text-slate-800 text-[11px] truncate">Name Vorname</div>
                                        <div className="flex items-center gap-1 text-[8px] text-slate-400 mt-1">
                                            <Clock size={8} /> {show.time.split(' ')[0]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-bold text-slate-800">Mockup 3: Interaktive Timeline (Gantt)</h4>
                        <p className="text-sm text-slate-500">Zeitstrahl-Visualisierung, zeigt Schichtübergänge und Überschneidungen perfekt an.</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-50 text-[#4B2C82] text-[10px] font-bold uppercase tracking-wider rounded-full">Präzision & Logik</span>
                </div>
                <div className="bg-white border rounded-3xl p-4 shadow-sm overflow-x-auto">
                    <div className="min-w-[800px]">
                        <div className="flex border-b pb-2 mb-4">
                            <div className="w-40 shrink-0 font-bold text-slate-400 text-[10px] uppercase">Rolle / Tag</div>
                            <div className="flex-1 flex text-[10px] font-bold text-slate-400 uppercase text-center">
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <div key={i} className="flex-1 border-l last:border-r">{i}:00</div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            {['Morningshow Moderator', 'Morningshow Redakteur', 'NOW Moderator'].map((role, idx) => (
                                <div key={role} className="flex items-center">
                                    <div className="w-40 shrink-0 font-bold text-slate-700 text-xs">{role}</div>
                                    <div className="flex-1 h-6 bg-slate-50 rounded-full relative overflow-hidden group">
                                        <div
                                            className="absolute h-full bg-[#4B2C82]/80 flex items-center justify-center text-white text-[9px] font-bold shadow-lg"
                                            style={{
                                                left: `${(idx * 4 + 4) / 24 * 100}%`,
                                                width: `${8 / 24 * 100}%`
                                            }}
                                        >
                                            Mitarbeiter Name
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <div className="border-t-2 border-dashed border-slate-100 my-12" />

            <section className="space-y-6">
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-slate-800">Integration in das aktuelle Dashboard</h3>
                    <p className="text-slate-500 max-w-2xl mx-auto">Vorschläge, wie die abweichenden Namen (z.B. FIT statt Morningshow) direkt im bestehenden Kalender-Design gelöst werden könnten.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Mockup 4: Adaptive Sidebar */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">4</div>
                            Kontext-sensitive Sidebar
                        </h4>
                        <div className="bg-white border rounded-3xl p-4 shadow-sm space-y-3">
                            <p className="text-xs text-slate-500 mb-2">Die linke Spalte ändert ihren Namen automatisch, wenn das Wochenende im Sichtfeld ist.</p>
                            <div className="flex gap-2">
                                <div className="w-40 bg-slate-100 p-3 rounded-2xl border border-dashed border-purple-200">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Wochentage</div>
                                    <div className="font-bold text-[#4B2C82] text-sm">Morningshow</div>
                                </div>
                                <div className="flex-1 flex items-center justify-center text-slate-300">
                                    <Clock size={16} />
                                </div>
                                <div className="w-40 bg-purple-50 p-3 rounded-2xl border border-purple-200">
                                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-tighter">Sa / So</div>
                                    <div className="font-bold text-[#4B2C82] text-sm">FIT</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mockup 5: Inline Badges */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center text-sm font-bold">5</div>
                            Inline Weekend Badges
                        </h4>
                        <div className="bg-white border rounded-3xl p-4 shadow-sm space-y-3">
                            <p className="text-xs text-slate-500 mb-2">Die Schicht-Karten am Wochenende bekommen einen kleinen Indikator oben rechts.</p>
                            <div className="border border-purple-100 bg-purple-50 p-4 rounded-3xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-[#4B2C82] text-white px-2 py-0.5 text-[8px] font-bold rounded-bl-xl uppercase tracking-widest">FIT</div>
                                <div className="text-xs font-bold text-slate-400 uppercase">Sa, 28.03.</div>
                                <div className="text-lg font-black text-[#4B2C82]">Wilhelm</div>
                                <div className="text-[10px] font-bold text-slate-500 opacity-60">05:00 - 10:00</div>
                            </div>
                        </div>
                    </div>

                    {/* Mockup 6: Dual-Namen Sticky Row */}
                    <div className="space-y-4 md:col-span-2">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-50 text-[#4B2C82] rounded-lg flex items-center justify-center text-sm font-bold">6</div>
                            Duale Zeilenbeschriftung (Stacked Labels)
                        </h4>
                        <div className="bg-white border rounded-[2rem] p-6 shadow-sm overflow-hidden">
                            <p className="text-xs text-slate-500 mb-4">Beide Namen werden permanent in der Sidebar untereinander angezeigt – der jeweils aktive Name wird hervorgehoben.</p>
                            <div className="flex flex-col space-y-1 w-64">
                                <div className="p-4 bg-slate-50 border rounded-2xl">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] font-bold text-slate-300 uppercase">Standard</span>
                                        <span className="block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                    </div>
                                    <div className="text-sm font-bold text-slate-400 grayscale">Morningshow</div>
                                    <div className="border-t my-2 border-slate-200"></div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] font-bold text-[#4B2C82] uppercase">Wochenende</span>
                                        <span className="block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    </div>
                                    <div className="text-lg font-black text-[#4B2C82]">FIT</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-8 h-8 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center text-sm font-bold">7</div>
                        Realer Design-Klon (Status Quo + Weekend Logic)
                    </h4>
                    <div className="bg-white border rounded-[2rem] shadow-sm overflow-hidden p-1">
                        <p className="text-xs text-slate-500 p-4 mb-2">Dies ist ein exakter Nachbau des aktuellen Kalenders, jedoch mit dynamischen Rollen-Labels, die sich am Wochenende (Sa/So) anpassen.</p>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-xs text-left">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="p-2 border-b border-r sticky left-0 bg-slate-50 z-20 min-w-[200px] font-bold text-slate-600 text-[10px] uppercase tracking-widest">Funktion</th>
                                        {WEEK_DAYS.map((day, i) => (
                                            <th key={day} className={`p-2 border-b border-r min-w-[100px] text-center ${[5, 6].includes(i) ? 'bg-purple-50/20' : ''}`}>
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{day === 'Mo' ? 'Montag' : day === 'Di' ? 'Dienstag' : day === 'Mi' ? 'Mittwoch' : day === 'Do' ? 'Donnerstag' : day === 'Fr' ? 'Freitag' : day === 'Sa' ? 'Samstag' : 'Sonntag'}</div>
                                                <div className="text-[12px] font-bold text-slate-700">{23 + i}.03.</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {[
                                        { normal: 'Morningshow', weekend: 'FIT', time: '05:00 - 10:00' },
                                        { normal: 'Vormittag', weekend: 'TALK', time: '10:00 - 13:00' },
                                        { normal: 'MOVE', weekend: 'EASY', time: '16:00 - 20:00' }
                                    ].map((row) => (
                                        <tr key={row.normal} className="hover:bg-slate-50/50 transition">
                                            <td className="py-2 px-3 border-r sticky left-0 bg-slate-50 z-10 shadow-sm min-w-[200px]">
                                                <div className="flex flex-col">
                                                    <div className="font-black text-slate-900 text-[12px] uppercase tracking-tight leading-none mb-1">
                                                        <span className="opacity-40 group-hover:opacity-100 transition-opacity mr-1">●</span>
                                                        {row.normal}
                                                        <span className="text-[9px] text-[#4B2C82] ml-2 font-bold px-1.5 py-0.5 bg-purple-50 rounded border border-purple-100">+{row.weekend}</span>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                                        <Clock size={10} /> {row.time}
                                                    </div>
                                                </div>
                                            </td>
                                            {WEEK_DAYS.map((day, i) => {
                                                const isWeekend = [5, 6].includes(i);
                                                return (
                                                    <td key={day} className={`py-1 px-1.5 border-r relative group/cell ${isWeekend ? 'bg-purple-50/10' : ''}`}>
                                                        <div className={`h-8 border rounded-xl flex items-center justify-center relative overflow-hidden transition-all ${isWeekend ? 'bg-purple-100/50 border-purple-200' : 'bg-slate-50 border-slate-100'}`}>
                                                            <span className={`font-bold text-[11px] ${isWeekend ? 'text-[#4B2C82]' : 'text-slate-400'}`}>
                                                                {isWeekend ? (day === 'Sa' ? 'Wilhelm' : 'Thees') : '--'}
                                                            </span>
                                                            {isWeekend && (
                                                                <div className="absolute top-0 right-0 bg-[#4B2C82] text-white px-1 py-0.5 text-[6px] font-black rounded-bl-lg uppercase">{row.weekend}</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">8</div>
                        Visualisierung Abweichende Arbeitszeiten
                    </h4>
                    <div className="bg-white border rounded-[2rem] shadow-sm overflow-hidden p-6">
                        <p className="text-xs text-slate-500 mb-6">Wie gehen wir damit um, wenn die Schicht am Wochenende nicht nur anders heißt, sondern auch früher endet oder später anfängt? Hier sind zwei Ansätze:</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Option A: Time Tag in Sidebar */}
                            <div className="space-y-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">Option A: Zeit-Tags in der Sidebar</span>
                                <div className="p-4 border rounded-2xl bg-slate-50/50">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-col">
                                            <div className="text-[13px] font-black text-slate-800 uppercase leading-none mb-1">Morningshow</div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 px-1.5 py-0.5 bg-white border rounded">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Mo-Fr: 05:00 - 11:00
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-[#4B2C82] px-1.5 py-0.5 bg-purple-50 border border-purple-100 rounded">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span> Sa/So: 05:00 - 10:00 (FIT)
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Option B: "Ghost-Time" Indicator */}
                            <div className="space-y-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">Option B: Visuelle "Leerzeit" im Kalender</span>
                                <div className="relative">
                                    <div className="flex gap-1 h-12 bg-slate-100 rounded-2xl p-1 items-center">
                                        <div className="flex-1 bg-white rounded-xl border flex items-center justify-center font-bold text-[#4B2C82] text-xs h-full">
                                            Schicht bis 10:00
                                        </div>
                                        <div className="w-12 h-full bg-red-50 border border-red-100 border-dashed rounded-xl flex items-center justify-center group relative cursor-help">
                                            <Clock size={14} className="text-red-300" />
                                            <div className="absolute bottom-full mb-2 hidden group-hover:block w-32 bg-slate-800 text-white text-[9px] p-2 rounded-lg shadow-xl z-50">
                                                Am Wochenende endet diese Schicht 1 Std. früher (10:00 statt 11:00).
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 italic text-center">Rote Zone zeigt an, dass die Sendung hier früher endet als im Standard.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default WeeklyViewMockups;
