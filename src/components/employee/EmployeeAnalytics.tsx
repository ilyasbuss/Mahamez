import React from 'react';
import { PieChart as PieIcon, BarChart3, Target, Calendar, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const EmployeeAnalytics: React.FC = () => {
    // Mock Data for the last 6 months
    const shiftData = [
        { name: 'Mod Morningshow', value: 45, color: '#4B2C82' },
        { name: 'Redakteur NOW', value: 25, color: '#9F7AEA' },
        { name: 'Mod PUSH', value: 15, color: '#f97316' },
        { name: 'Sonstige', value: 15, color: '#cbd5e1' },
    ];

    const complianceData = [
        { month: 'Jan', worked: 18, target: 20 },
        { month: 'Feb', worked: 14, target: 20 }, // Half month dummy
        { month: 'Mär', worked: 19, target: 20 },
        { month: 'Apr', worked: 21, target: 20 },
        { month: 'Mai', worked: 20, target: 20 },
        { month: 'Jun', worked: 19, target: 20 },
    ];

    const currentMonthWorked = 14;
    const currentMonthTarget = 20;
    const sixMonthAverage = 18.5;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border shadow-sm border-l-4 border-l-[#4B2C82]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-50 rounded-xl text-[#4B2C82]">
                            <Target size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dieser Monat</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800">{currentMonthWorked} / {currentMonthTarget}</h3>
                    <p className="text-sm text-slate-500 mt-1">Geleistete Arbeitstage</p>
                    <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-[#4B2C82] h-full rounded-full transition-all duration-1000"
                            style={{ width: `${(currentMonthWorked / currentMonthTarget) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border shadow-sm border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ø 6 Monate</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800">{sixMonthAverage}</h3>
                    <p className="text-sm text-slate-500 mt-1">Tage pro Monat im Schnitt</p>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <CheckCircle2 size={12} /> Einhaltung: 92%
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border shadow-sm border-l-4 border-l-orange-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-orange-50 rounded-xl text-orange-500">
                            <PieIcon size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meiste Schicht</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">Morningshow</h3>
                    <p className="text-sm text-slate-500 mt-1">45% aller Einsätze</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Shift Distribution Chart */}
                <div className="bg-white p-8 rounded-3xl border shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <BarChart3 size={20} className="text-[#4B2C82]" />
                        Schichtverteilung (letzte 6 Monate)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={shiftData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {shiftData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Contract Compliance Chart */}
                <div className="bg-white p-8 rounded-3xl border shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Calendar size={20} className="text-[#4B2C82]" />
                        Vertragseinhaltung (Arbeitstage)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={complianceData}>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="worked" name="Gearbeitet" fill="#4B2C82" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="target" name="Vertragsziel" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Compliance Message */}
            <div className={`p-6 rounded-3xl border flex items-start gap-4 ${currentMonthWorked < currentMonthTarget ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
                }`}>
                <div className={`p-3 rounded-2xl ${currentMonthWorked < currentMonthTarget ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                    }`}>
                    {currentMonthWorked < currentMonthTarget ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                </div>
                <div>
                    <h4 className={`font-bold ${currentMonthWorked < currentMonthTarget ? 'text-orange-800' : 'text-green-800'
                        }`}>
                        Status Ihrer Arbeitstage
                    </h4>
                    <p className={`text-sm mt-1 ${currentMonthWorked < currentMonthTarget ? 'text-orange-700' : 'text-green-700'
                        }`}>
                        {currentMonthWorked < currentMonthTarget
                            ? `Diesen Monat haben Sie bisher ${currentMonthWorked} von ${currentMonthTarget} geplanten Tagen geleistet. Es fehlen noch ${currentMonthTarget - currentMonthWorked} Tage bis zum Vertragsziel.`
                            : `Glückwunsch! Sie haben Ihr monatliches Vertragsziel von ${currentMonthTarget} Tagen bereits erreicht.`
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmployeeAnalytics;
