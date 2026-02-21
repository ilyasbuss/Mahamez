import React, { useRef, useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { Clock, X, Plus } from 'lucide-react';
import { Employee, Shift, RoleDefinition } from '../../types';

interface ShiftCalendarProps {
    weekDays: Date[];
    shifts: Shift[];
    employees: Employee[];
    allRolesWithShadowing: (RoleDefinition & { groupId: string; isShadowing?: boolean; originalRoleName: string; hasThickBorder?: boolean })[];
    shadowingRows: Set<string>;
    onToggleShadowing: (roleName: string) => void;
    onDeleteShift: (id: string) => void;
    onAddShift: (employeeId: string, date: string, roleName: string) => void;
}

const ShiftCalendar: React.FC<ShiftCalendarProps> = ({
    weekDays,
    shifts,
    employees,
    allRolesWithShadowing,
    shadowingRows,
    onToggleShadowing,
    onDeleteShift,
    onAddShift
}) => {
    const [activeDropdown, setActiveDropdown] = useState<{ roleName: string; dateStr: string } | null>(null);
    const [expandedSelects, setExpandedSelects] = useState<Set<string>>(new Set());
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto relative">
            <table className="w-full border-collapse text-xs text-left">
                <thead>
                    <tr className="bg-slate-50">
                        <th className="p-2.5 border-b border-r sticky left-0 bg-slate-50 z-20 w-64 font-bold text-slate-600 text-[13px] uppercase tracking-widest">Funktion</th>
                        {weekDays.map(day => {
                            const isToday = isSameDay(day, new Date());
                            return (
                                <th key={day.toISOString()} className={`p-2.5 border-b border-r min-w-[120px] text-center relative ${isToday ? 'bg-purple-50/20' : ''}`}>
                                    {isToday && <div className="absolute top-0 left-0 right-0 h-1 bg-[#4B2C82] z-30" />}
                                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">{format(day, 'EEEE', { locale: de })}</div>
                                    <div className={`text-sm font-bold ${isToday ? 'text-slate-900' : 'text-slate-700'}`}>{format(day, 'dd.MM.')}</div>
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {allRolesWithShadowing.map((r, i) => (
                        <tr key={`${r.name}-${i}`} className={`hover:bg-slate-50/50 transition ${r.isShadowing ? 'bg-slate-50/20' : ''} ${r.hasThickBorder ? 'border-b-[8px] border-[#7A758F]' : ''}`}>
                            <td className="py-0.5 px-2 border-r sticky left-0 bg-slate-100 z-10 shadow-sm relative w-64">
                                <div className="flex flex-col pr-8">
                                    {r.isShadowing ? (
                                        <div className="pl-4 font-bold text-slate-600 text-[12px] leading-tight italic">
                                            Mitlaufen<br />{r.name.replace('Mitlaufen ', '')}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="font-bold text-slate-900 text-[14px] uppercase tracking-tight leading-[1.1]">{r.name}</div>
                                            <div className="text-[12px] font-bold text-slate-600 flex items-center gap-1 mt-0.5">
                                                <Clock size={11} /> {r.startTime} - {r.endTime}
                                            </div>
                                        </>
                                    )}
                                </div>
                                {!r.isShadowing && <button onClick={() => onToggleShadowing(r.name)} className={`w-4 h-4 rounded-full border text-[8px] font-bold transition shadow-sm absolute top-1 right-1 flex items-center justify-center ${shadowingRows.has(r.name) ? 'bg-[#4B2C82] border-[#4B2C82] text-white' : 'border-slate-300 text-slate-400 bg-white'}`}>M</button>}
                            </td>
                            {weekDays.map(day => {
                                const dateStr = format(day, 'yyyy-MM-dd');
                                const shift = shifts.find(s => s.date === dateStr && s.roleName === r.name);
                                const employee = shift ? employees.find(e => e.id === shift.employeeId) : null;
                                const cellKey = `${r.name}-${dateStr}`;
                                const isCellActive = activeDropdown?.roleName === r.name && activeDropdown?.dateStr === dateStr;

                                return (
                                    <td key={cellKey} className={`py-0.5 px-1 border-r group/cell relative ${[0, 6].includes(day.getDay()) ? 'bg-slate-50/30' : ''}`}>
                                        {employee ? (
                                            <div className={`h-full min-h-[32px] px-1 border rounded flex items-center justify-center group/pill relative overflow-hidden ${r.isShadowing ? 'bg-slate-100 border-slate-200' : 'bg-purple-50 border-purple-100'}`}>
                                                <span className={`font-bold text-[13px] leading-tight text-center truncate px-1 w-full ${r.isShadowing ? 'text-slate-600' : 'text-[#4B2C82]'}`}>
                                                    {employee.name.split(' ').pop()}
                                                </span>
                                                <button
                                                    onClick={() => onDeleteShift(shift!.id)}
                                                    className="absolute right-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/pill:opacity-100 text-slate-400 hover:text-red-500 transition bg-white/90 rounded-full p-0.5 shadow-sm border"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="h-8 flex items-center justify-center">
                                                <button
                                                    onClick={() => setActiveDropdown({ roleName: r.name, dateStr })}
                                                    className="w-full h-full text-[10px] text-slate-300 hover:text-[#4B2C82] italic group-hover/cell:opacity-100 transition"
                                                >
                                                    --
                                                </button>
                                                {isCellActive && (
                                                    <div ref={dropdownRef} className="absolute left-0 top-full z-[100] w-48 bg-white border border-slate-200 rounded-xl shadow-2xl py-1 max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1">
                                                        {employees
                                                            .filter(e => expandedSelects.has(cellKey) || r.name === 'Sonstige Dienste' || e.skillAssignments.some(sa => sa.skill === (r.isShadowing ? r.name.replace('Mitlaufen ', '') : r.name)))
                                                            .sort((a, b) => a.name.localeCompare(b.name))
                                                            .map(e => (
                                                                <button key={e.id} onClick={() => { onAddShift(e.id, dateStr, r.name); setActiveDropdown(null); }} className="w-full text-left px-3 py-1.5 hover:bg-purple-50 text-[11px] font-medium text-slate-600 transition-colors">{e.name}</button>
                                                            ))
                                                        }
                                                        {!expandedSelects.has(cellKey) && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setExpandedSelects(prev => new Set(prev).add(cellKey)); }}
                                                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-[#4B2C82] hover:bg-slate-50 uppercase tracking-tight flex items-center gap-1 border-t mt-1 pt-2"
                                                            >
                                                                <Plus size={10} /> Alle anzeigen
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
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
    );
};

export default React.memo(ShiftCalendar);
