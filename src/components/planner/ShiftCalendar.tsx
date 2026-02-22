import React, { useRef, useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { Clock, X, Plus, GripVertical, Edit2 } from 'lucide-react';
import { Employee, Shift, RoleDefinition } from '../../types';

interface ShiftCalendarProps {
    weekDays: Date[];
    shifts: Shift[];
    employees: Employee[];
    allRolesWithShadowing: (RoleDefinition & { groupId: string; isShadowing?: boolean; originalRoleName: string; hasThickBorder?: boolean })[];
    shadowingRows: Set<string>;
    onToggleShadowing: (roleName: string) => void;
    onDeleteShift: (id: string) => void;
    onAddShift: (employeeId: string, date: string, roleName: string, customName?: string) => void;
    isNewPlanView?: boolean;
    onAddRow?: (roleName: string) => void;
    onReorder?: (fromIdx: number, toIdx: number) => void;
    onEditRow?: (oldName: string, newName: string) => void;
}

const ShiftCalendar: React.FC<ShiftCalendarProps> = ({
    weekDays,
    shifts,
    employees,
    allRolesWithShadowing,
    shadowingRows,
    onToggleShadowing,
    onDeleteShift,
    onAddShift,
    isNewPlanView,
    onAddRow,
    onReorder,
    onEditRow
}) => {
    const [activeDropdown, setActiveDropdown] = useState<{ roleName: string; dateStr: string } | null>(null);
    const [expandedSelects, setExpandedSelects] = useState<Set<string>>(new Set());
    const [customNameInput, setCustomNameInput] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Drag and drop states
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [dragDirection, setDragDirection] = useState<'up' | 'down' | null>(null);

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
                    {allRolesWithShadowing.map((r, i) => (
                        <tr
                            key={`${r.groupId}-${r.originalRoleName}-${r.isShadowing ? 's' : 'm'}`}
                            draggable={isNewPlanView}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', i.toString());
                                e.currentTarget.classList.add('opacity-30', 'bg-slate-200');
                            }}
                            onDragEnd={(e) => {
                                e.currentTarget.classList.remove('opacity-30', 'bg-slate-200');
                                setDragOverIndex(null);
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                const rect = e.currentTarget.getBoundingClientRect();
                                const offset = e.clientY - rect.top;
                                if (offset < rect.height / 2) {
                                    setDragDirection('up');
                                } else {
                                    setDragDirection('down');
                                }
                                setDragOverIndex(i);
                            }}
                            onDragLeave={() => {
                                if (dragOverIndex === i) {
                                    setDragOverIndex(null);
                                    setDragDirection(null);
                                }
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragOverIndex(null);
                                setDragDirection(null);
                                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                                const toIdx = i;
                                if (onReorder && fromIdx !== toIdx) onReorder(fromIdx, toIdx);
                            }}
                            className={`hover:bg-slate-50/50 transition-all duration-200 ${r.isShadowing ? 'bg-slate-50/20' : ''} ${r.hasThickBorder ? 'border-b-[8px] border-[#7A758F]' : ''} group/row cursor-default relative
                                ${dragOverIndex === i && dragDirection === 'up' ? 'border-t-4 border-t-[#4B2C82]' : ''}
                                ${dragOverIndex === i && dragDirection === 'down' ? 'border-b-4 border-b-[#4B2C82]' : ''}
                            `}
                        >
                            <td className="py-0.5 px-3 border-r sticky left-0 bg-slate-100 z-10 shadow-sm relative whitespace-nowrap w-[1%]">
                                <div className="flex flex-row items-center justify-between w-full h-full gap-3">
                                    <div className="flex items-center gap-2">
                                        {isNewPlanView && (
                                            <div className="text-slate-300 group-hover/row:text-slate-400 p-0.5 cursor-grab active:cursor-grabbing hover:bg-slate-200 rounded transition-colors shrink-0">
                                                <GripVertical size={14} />
                                            </div>
                                        )}
                                        <div className="flex flex-col min-w-max">
                                            {r.isShadowing ? (
                                                <div className="pl-4 font-bold text-slate-600 text-[10px] leading-tight italic whitespace-nowrap">
                                                    Mitlaufen<br />{r.name.replace('Mitlaufen ', '')}
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="font-bold text-slate-900 text-[11.7px] uppercase tracking-tight leading-[1] mb-[-1px] whitespace-nowrap">{r.name}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1 whitespace-nowrap">
                                                        <Clock size={10} /> {r.startTime} - {r.endTime}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {!r.isShadowing && (
                                        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                                            <button onClick={() => onToggleShadowing(r.name)} className={`w-4 h-4 rounded-full border text-[8px] font-bold transition shadow-sm flex items-center justify-center shrink-0 ${shadowingRows.has(r.name) ? 'bg-[#4B2C82] border-[#4B2C82] text-white' : 'border-slate-300 text-slate-400 bg-white'}`}>M</button>
                                            {(r.groupId === 'g_sonstige' || r.originalRoleName.includes('Sonstige Dienste')) && r.name !== 'Qualitätsmanagement' && (
                                                <button
                                                    onClick={() => {
                                                        const newName = prompt('Dienstname anpassen:', r.name);
                                                        if (newName && onEditRow) {
                                                            onEditRow(r.name, newName);
                                                        }
                                                    }}
                                                    className="w-4 h-4 rounded-full border border-slate-300 text-slate-400 bg-white hover:text-[#4B2C82] hover:border-[#4B2C82] flex items-center justify-center transition-all shadow-sm shrink-0"
                                                    title="Dienst für diese Ausgabe anpassen"
                                                >
                                                    <Edit2 size={10} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </td>
                            {weekDays.map(day => {
                                const dateStr = format(day, 'yyyy-MM-dd');
                                const shift = shifts.find(s => s.date === dateStr && s.roleName === r.name);
                                const isSelected = activeDropdown?.roleName === r.name && activeDropdown?.dateStr === dateStr;

                                return (
                                    <td key={dateStr} className="py-1 px-1.5 border-r relative group/cell">
                                        {shift ? (
                                            <div className={`h-8 border rounded-xl flex items-center justify-center relative transition shadow-sm ${shift.id.startsWith('new-') ? 'animate-in fade-in slide-in-from-left-2' : ''} ${employees.find(e => e.id === shift.employeeId)?.role.includes('Fest') ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100'}`}>
                                                <span className="font-bold text-[11px] text-slate-700">
                                                    {employees.find(e => e.id === shift.employeeId)?.name || shift.customName || '--'}
                                                </span>
                                                <button
                                                    onClick={() => onDeleteShift(shift.id)}
                                                    className="absolute -top-1.5 -right-1.5 bg-white border rounded-full p-0.5 text-slate-400 opacity-0 group-hover/cell:opacity-100 hover:text-red-500 hover:border-red-200 transition shadow-sm z-10"
                                                >
                                                    <X size={8} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setActiveDropdown({ roleName: r.name, dateStr })}
                                                className="w-full h-8 border border-dashed border-slate-200 rounded-xl hover:border-[#4B2C82]/30 hover:bg-[#4B2C82]/5 flex items-center justify-center text-slate-300 hover:text-[#4B2C82] transition group/add"
                                            >
                                                <Plus size={12} className="group-hover/add:scale-110 transition shrink-0" />
                                            </button>
                                        )}

                                        {isSelected && (
                                            <div ref={dropdownRef} className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-2xl shadow-2xl z-[100] p-3 animate-in fade-in zoom-in-95 duration-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Team einteilen</h3>
                                                    <button onClick={() => setActiveDropdown(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><X size={12} /></button>
                                                </div>

                                                <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                                                    {employees.map(emp => (
                                                        <button
                                                            key={emp.id}
                                                            onClick={() => {
                                                                onAddShift(emp.id, dateStr, r.name);
                                                                setActiveDropdown(null);
                                                            }}
                                                            className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 flex items-center justify-between group/emp border border-transparent hover:border-slate-100 transition-all"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-700">{emp.name}</span>
                                                                <span className="text-[8px] text-slate-400 font-bold uppercase">{emp.role}</span>
                                                            </div>
                                                            <Plus size={12} className="text-slate-300 group-hover/emp:text-[#4B2C82]" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            {isNewPlanView && onAddRow && (
                <div className="p-2 flex justify-start sticky left-0 z-20">
                    <button
                        onClick={() => onAddRow('Sonstige Dienste')}
                        className="bg-purple-50 hover:bg-purple-100 text-[#4B2C82] p-1.5 rounded-xl border border-purple-100 transition-all flex items-center justify-center shadow-sm"
                        title="Weiteren 'Sonstigen Dienst' hinzufügen"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default React.memo(ShiftCalendar);
