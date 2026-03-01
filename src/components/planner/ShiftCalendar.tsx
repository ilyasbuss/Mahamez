import React, { useRef, useState, useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { Clock, X, Plus, GripVertical, Edit2, Search } from 'lucide-react';
import { Employee, Shift, RoleDefinition } from '../../types';
import { formatEmployeeName } from '../../utils/dashboardUtils';

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
    const [searchQuery, setSearchQuery] = useState("");
    const [dropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('down');
    const [expandedSelects, setExpandedSelects] = useState<Set<string>>(new Set());
    const [customNameInput, setCustomNameInput] = useState("");
    const [canDragRow, setCanDragRow] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Drag and drop states
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [dragDirection, setDragDirection] = useState<'up' | 'down' | null>(null);

    // Edit Row modal states
    const [editingRowName, setEditingRowName] = useState<string | null>(null);
    const [editRowInput, setEditRowInput] = useState("");

    // Close dropdown on outside click and reset search
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
                setSearchQuery("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Smart positioning logic
    React.useEffect(() => {
        if (activeDropdown && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.top;
            const dropdownHeight = 350; // Estimated max height
            if (spaceBelow < dropdownHeight) {
                setDropdownDirection('up');
            } else {
                setDropdownDirection('down');
            }
        }
    }, [activeDropdown]);

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
                            draggable={isNewPlanView && canDragRow}
                            onDragStart={(e) => {
                                if (!canDragRow) {
                                    e.preventDefault();
                                    return;
                                }
                                e.dataTransfer.setData('text/plain', i.toString());
                                e.currentTarget.classList.add('opacity-30', 'bg-slate-200');
                            }}
                            onDragEnd={(e) => {
                                e.currentTarget.classList.remove('opacity-30', 'bg-slate-200');
                                setDragOverIndex(null);
                            }}
                            onDragOver={(e) => {
                                if (Array.from(e.dataTransfer.types).includes('application/shift-data')) return;
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
                                if (Array.from(e.dataTransfer.types).includes('application/shift-data')) return;
                                e.preventDefault();
                                setDragOverIndex(null);
                                setDragDirection(null);
                                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                                const toIdx = i;
                                if (onReorder && fromIdx !== toIdx) onReorder(fromIdx, toIdx);
                            }}
                            className={`hover:bg-slate-50/50 transition-all duration-200 ${r.isShadowing ? 'bg-slate-50/20' : ''} group/row cursor-default relative
                                ${dragOverIndex === i && dragDirection === 'up' ? 'border-t-4 border-t-[#4B2C82]' : ''}
                                ${dragOverIndex === i && dragDirection === 'down' ? 'border-b-4 border-b-[#4B2C82]' : ''}
                            `}
                        >
                            <td className={`py-0.5 px-3 border-r sticky left-0 bg-slate-100 z-10 shadow-sm relative whitespace-nowrap w-[1%] ${r.hasThickBorder ? 'border-b-[4px] border-[#7A758F]' : ''}`}>
                                <div className="flex flex-row items-center justify-between w-full h-full gap-3">
                                    <div className="flex items-center gap-2">
                                        {isNewPlanView && (
                                            <div
                                                onMouseEnter={() => setCanDragRow(true)}
                                                onMouseLeave={() => setCanDragRow(false)}
                                                className="text-slate-300 group-hover/row:text-slate-400 p-0.5 cursor-grab active:cursor-grabbing hover:bg-slate-200 rounded transition-colors shrink-0"
                                            >
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
                                                    <div className="font-bold text-slate-900 text-[11.7px] uppercase tracking-tight leading-[1] mb-[1px] whitespace-nowrap">{r.name}</div>
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
                                                        setEditingRowName(r.name);
                                                        setEditRowInput(r.name);
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
                                    <td
                                        key={dateStr}
                                        onDragOver={(e) => {
                                            if (Array.from(e.dataTransfer.types).includes('application/shift-data')) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                e.dataTransfer.dropEffect = 'copy';
                                            }
                                        }}
                                        onDrop={(e) => {
                                            const shiftDataStr = e.dataTransfer.getData('application/shift-data') || e.dataTransfer.getData('text/plain');
                                            if (shiftDataStr && (shiftDataStr.startsWith('{') || Array.from(e.dataTransfer.types).includes('application/shift-data'))) {
                                                try {
                                                    const data = JSON.parse(shiftDataStr);
                                                    if (data.employeeId !== undefined || data.customName !== undefined) {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        onAddShift(data.employeeId || "", dateStr, r.name, data.customName);
                                                    }
                                                } catch (err) {
                                                    // Not our data
                                                }
                                            }
                                        }}
                                        className={`py-1 px-1.5 border-r relative group/cell ${r.hasThickBorder ? 'border-b-[4px] border-[#7A758F]' : ''}`}
                                    >
                                        {shift ? (
                                            <div
                                                draggable
                                                onDragStart={(e) => {
                                                    const data = JSON.stringify({
                                                        employeeId: shift.employeeId || "",
                                                        customName: shift.customName || ""
                                                    });
                                                    e.dataTransfer.setData('application/shift-data', data);
                                                    e.dataTransfer.setData('text/plain', data);
                                                    e.dataTransfer.effectAllowed = 'copy';
                                                    e.stopPropagation();
                                                }}
                                                onDoubleClick={() => {
                                                    const currentIndex = weekDays.findIndex(d => format(d, 'yyyy-MM-dd') === shift.date);
                                                    if (currentIndex === -1) return;

                                                    for (let j = currentIndex + 1; j < weekDays.length; j++) {
                                                        const targetDate = weekDays[j];
                                                        const dayOfWeek = targetDate.getDay(); // 0 is Sun, 1 is Mon, 5 is Fri
                                                        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                                                            const targetDateStr = format(targetDate, 'yyyy-MM-dd');
                                                            const existing = shifts.find(s => s.date === targetDateStr && s.roleName === r.name);
                                                            if (!existing) {
                                                                onAddShift(shift.employeeId, targetDateStr, r.name, shift.customName);
                                                            }
                                                        }
                                                    }
                                                }}
                                                className={`h-8 border rounded-xl flex items-center justify-center relative transition shadow-sm cursor-move ${shift.id.startsWith('new-') ? 'animate-in fade-in slide-in-from-left-2' : ''} ${employees.find(e => e.id === shift.employeeId)?.role.includes('Fest') ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100'}`}
                                            >
                                                <span className="font-bold text-[11px] text-slate-700 select-none">
                                                    {employees.find(e => e.id === shift.employeeId)
                                                        ? formatEmployeeName(employees.find(e => e.id === shift.employeeId)!.name, employees)
                                                        : (shift.customName || '--')}
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

                                        {isSelected && (() => {
                                            const roleObj = allRolesWithShadowing.find(rr => rr.name === r.name);
                                            const isShadowing = roleObj?.isShadowing;
                                            const baseRoleName = roleObj?.originalRoleName || r.name;

                                            const filteredEmployees = employees.filter(emp =>
                                                emp.name.toLowerCase().includes(searchQuery.toLowerCase())
                                            );

                                            let displayList: ({ type: 'emp', emp: Employee, isQualified: boolean } | { type: 'separator' })[] = [];

                                            if (isShadowing) {
                                                displayList = [...filteredEmployees]
                                                    .sort((a, b) => a.name.localeCompare(b.name))
                                                    .map(e => ({ type: 'emp', emp: e, isQualified: true }));
                                            } else {
                                                const hasRole = filteredEmployees
                                                    .filter(emp => emp.skillAssignments.some(sa => sa.skill === baseRoleName))
                                                    .sort((a, b) => a.name.localeCompare(b.name));
                                                const others = filteredEmployees
                                                    .filter(emp => !emp.skillAssignments.some(sa => sa.skill === baseRoleName))
                                                    .sort((a, b) => a.name.localeCompare(b.name));

                                                const list: any[] = hasRole.map(e => ({ type: 'emp', emp: e, isQualified: true }));
                                                if (hasRole.length > 0 && others.length > 0) {
                                                    list.push({ type: 'separator' });
                                                }
                                                others.forEach(e => list.push({ type: 'emp', emp: e, isQualified: false }));
                                                displayList = list;
                                            }

                                            return (
                                                <div
                                                    ref={dropdownRef}
                                                    className={`absolute ${dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 w-64 bg-white border rounded-2xl shadow-2xl z-[100] p-3 animate-in fade-in zoom-in-95 duration-200 flex flex-col`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Person einteilen</h3>
                                                        </div>
                                                        <button onClick={() => { setActiveDropdown(null); setSearchQuery(""); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><X size={12} /></button>
                                                    </div>

                                                    <div className="relative mb-2">
                                                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                                                            <Search size={12} />
                                                        </div>
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            placeholder="Suchen..."
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:border-[#4B2C82]/30 focus:ring-2 focus:ring-purple-50 transition-all"
                                                        />
                                                    </div>

                                                    <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                                                        {displayList.map((item, idx) => {
                                                            if (item.type === 'separator') {
                                                                return <div key={`sep-${idx}`} className="my-2 border-t border-slate-100" />;
                                                            }
                                                            const emp = item.emp;
                                                            return (
                                                                <button
                                                                    key={emp.id}
                                                                    onClick={() => {
                                                                        onAddShift(emp.id, dateStr, r.name);
                                                                        setActiveDropdown(null);
                                                                        setSearchQuery("");
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 flex items-center justify-between group/emp border border-transparent hover:border-slate-100 transition-all"
                                                                >
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-slate-700">{formatEmployeeName(emp.name, employees)}</span>
                                                                        <span className="text-[8px] text-slate-400 font-bold uppercase">{emp.role}</span>
                                                                    </div>
                                                                    <Plus size={12} className="text-slate-300 group-hover/emp:text-[#4B2C82]" />
                                                                </button>
                                                            );
                                                        })}
                                                        {displayList.length === 0 && (
                                                            <div className="py-4 text-center text-slate-400 text-[10px] italic">Keine Ergebnisse</div>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t border-slate-100 flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Manueller Name..."
                                                            value={customNameInput}
                                                            onChange={e => setCustomNameInput(e.target.value)}
                                                            className="flex-1 text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#4B2C82] focus:ring-1 focus:ring-[#4B2C82]"
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter' && customNameInput.trim()) {
                                                                    onAddShift('custom', dateStr, r.name, customNameInput.trim());
                                                                    setActiveDropdown(null);
                                                                    setCustomNameInput("");
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                if (customNameInput.trim()) {
                                                                    onAddShift('custom', dateStr, r.name, customNameInput.trim());
                                                                    setActiveDropdown(null);
                                                                    setCustomNameInput("");
                                                                }
                                                            }}
                                                            disabled={!customNameInput.trim()}
                                                            className="p-1.5 bg-[#4B2C82] text-white rounded-lg hover:bg-[#3d2369] disabled:opacity-50 transition-colors"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })()}
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

            {/* Edit Row Name Modal */}
            {editingRowName && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setEditingRowName(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Dienstname anpassen</h3>
                            <p className="text-sm text-slate-500 mt-1">Ändern Sie den Namen für diesen speziellen Dienst.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Neuer Name</label>
                                <input
                                    type="text"
                                    value={editRowInput}
                                    onChange={(e) => setEditRowInput(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#4B2C82] focus:ring-1 focus:ring-[#4B2C82] outline-none transition-all text-sm font-bold text-slate-800"
                                    placeholder="z.B. Frühschicht Extra"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && editRowInput.trim()) {
                                            if (onEditRow) onEditRow(editingRowName, editRowInput.trim());
                                            setEditingRowName(null);
                                        } else if (e.key === 'Escape') {
                                            setEditingRowName(null);
                                        }
                                    }}
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingRowName(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    onClick={() => {
                                        if (editRowInput.trim() && onEditRow) {
                                            onEditRow(editingRowName, editRowInput.trim());
                                        }
                                        setEditingRowName(null);
                                    }}
                                    disabled={!editRowInput.trim()}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-[#4B2C82] hover:bg-[#3d2369] transition-colors disabled:opacity-50"
                                >
                                    Speichern
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(ShiftCalendar);
