import React, { useState, useEffect } from 'react';
import { Users, X, ChevronUp, ChevronDown, CheckCircle2, PieChart as PieChartIcon, Lock, Unlock, Trash2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Employee, SkillGroup, SkillAssignment, Skill, RoleDefinition, Redaktion } from '../../types';

interface EditEmployeeModalProps {
    isOpen: boolean;
    employee: Employee | null;
    skillGroups: SkillGroup[];
    onClose: () => void;
    onSave: (employee: Employee) => void;
    onDelete: (employee: Employee) => void;
}

const COLORS = ['#4B2C82', '#6B46C1', '#805AD5', '#9F7AEA', '#B794F4', '#D6BCFA', '#7C3AED', '#5B21B6', '#4C1D95'];
const VERTRAGS_OPTIONEN = ["Festangestellt (befristet)", "Festangestellt (unbefristet)", "Frei (befristet)", "Frei (unbefristet)"];

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ isOpen, employee, skillGroups, onClose, onSave, onDelete }) => {
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [isRolesExpanded, setIsRolesExpanded] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteTimer, setDeleteTimer] = useState(0);

    useEffect(() => {
        let interval: number;
        if (isDeleting && deleteTimer > 0) {
            interval = window.setInterval(() => {
                setDeleteTimer(prev => prev - 1);
            }, 1000);
        }
        return () => window.clearInterval(interval);
    }, [isDeleting, deleteTimer]);

    useEffect(() => {
        if (isOpen && employee) {
            setEditingEmployee({ ...employee });
        } else {
            setEditingEmployee(null);
        }
    }, [isOpen, employee]);

    if (!isOpen || !editingEmployee) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editingEmployee);
    };

    const toggleSkillAssignment = (roleDef: RoleDefinition) => {
        const exists = editingEmployee.skillAssignments.find(sa => sa.skill === roleDef.name);
        let newAssignments: SkillAssignment[] = [];
        if (exists) {
            newAssignments = editingEmployee.skillAssignments.filter(sa => sa.skill !== roleDef.name);
            if (newAssignments.length > 0) {
                const share = exists.percentage / newAssignments.filter(n => !n.locked).length || 0;
                newAssignments = newAssignments.map(n => n.locked ? n : { ...n, percentage: Math.min(100, Math.max(0, n.percentage + share)) });
            }
        } else {
            newAssignments = [...editingEmployee.skillAssignments, { skill: roleDef.name, percentage: editingEmployee.skillAssignments.length === 0 ? 100 : 0, priority: roleDef.defaultPriority, locked: false }];
        }
        setEditingEmployee({ ...editingEmployee, skillAssignments: newAssignments });
    };

    const updateSkillAssignment = (skill: Skill, field: keyof SkillAssignment, value: any) => {
        let currentAssignments = [...editingEmployee.skillAssignments];
        const targetIdx = currentAssignments.findIndex(sa => sa.skill === skill);
        if (targetIdx === -1) return;

        if (field === 'percentage') {
            const newVal = Number(value);
            const others = currentAssignments.filter((sa, idx) => idx !== targetIdx && !sa.locked);

            if (others.length === 0) {
                // If no other unlocked roles exist, calculate remaining percentage after locked roles
                const lockedSum = currentAssignments.filter((sa, idx) => idx !== targetIdx && sa.locked).reduce((a, b) => a + b.percentage, 0);
                currentAssignments[targetIdx].percentage = Math.max(0, Math.min(100 - lockedSum, newVal));
            } else {
                const lockedSum = currentAssignments.filter((sa, idx) => idx !== targetIdx && sa.locked).reduce((a, b) => a + b.percentage, 0);
                const maxForTarget = 100 - lockedSum;
                const safeVal = Math.min(newVal, maxForTarget);

                const diff = safeVal - currentAssignments[targetIdx].percentage;
                currentAssignments[targetIdx].percentage = safeVal;

                const othersSum = others.reduce((a, b) => a + b.percentage, 0);
                if (othersSum > 0) {
                    const factor = (othersSum - diff) / othersSum;
                    currentAssignments = currentAssignments.map((sa, idx) =>
                        (idx === targetIdx || sa.locked) ? sa : { ...sa, percentage: Math.max(0, sa.percentage * factor) }
                    );
                } else if (diff < 0) {
                    const gain = Math.abs(diff) / others.length;
                    currentAssignments = currentAssignments.map((sa, idx) =>
                        (idx === targetIdx || sa.locked) ? sa : { ...sa, percentage: sa.percentage + gain }
                    );
                }
            }
        } else {
            currentAssignments[targetIdx] = { ...currentAssignments[targetIdx], [field]: value };
        }
        setEditingEmployee({ ...editingEmployee, skillAssignments: currentAssignments });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D0B40]/60 backdrop-blur-md overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 text-slate-700">
                <div className="flex items-center justify-between p-4 bg-slate-50 border-b">
                    <div className="flex items-center gap-2"><div className="bg-[#4B2C82] p-1.5 rounded-xl text-white"><Users size={20} /></div><h2 className="text-lg font-bold text-slate-800">Informationen bearbeiten</h2></div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition bg-white p-1.5 rounded-full border shadow-sm"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Name</label><input type="text" required value={editingEmployee.name} onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })} className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium text-sm" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email (Login)</label><input type="email" value={editingEmployee.email || ''} onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })} className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium text-sm" placeholder="name@mahamez.de" /></div>
                                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">System-Rolle</label><select value={editingEmployee.systemRole || 'EMPLOYEE'} onChange={(e) => setEditingEmployee({ ...editingEmployee, systemRole: e.target.value as any })} className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium text-sm"><option value="EMPLOYEE">Mitarbeiter</option><option value="PLANNER">Planer (Admin)</option></select></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vertrag</label><select required value={editingEmployee.role} onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })} className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium text-sm">{VERTRAGS_OPTIONEN.map(opt => (<option key={opt} value={opt}>{opt}</option>))}</select></div>
                                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{editingEmployee.role.includes("Festangestellt") ? "Teilzeit (%)" : "Tage"}</label><input type="number" step="1" min="0" max="100" required value={editingEmployee.contractHours} onChange={(e) => setEditingEmployee({ ...editingEmployee, contractHours: Number(e.target.value) })} className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium text-sm" /></div>
                            </div>
                            <div className="space-y-3">
                                <button type="button" onClick={() => setIsRolesExpanded(!isRolesExpanded)} className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase py-1"><span>Rollen</span>{isRolesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                                {isRolesExpanded && (
                                    <div className="space-y-3 h-[280px] overflow-y-auto pr-2 bg-slate-50/50 p-2.5 rounded-2xl border">
                                        {skillGroups.map(g => (
                                            <div key={g.id} className="space-y-1.5"><h4 className="text-[9px] font-bold text-slate-400 uppercase">{g.title}</h4><div className="grid grid-cols-2 gap-2">{g.roles.map(r => { const sel = editingEmployee.skillAssignments.some(sa => sa.skill === r.name); return (<button key={r.name} type="button" onClick={() => toggleSkillAssignment(r)} className={`flex items-center justify-between p-2 rounded-xl border transition text-left ${sel ? 'border-[#4B2C82] bg-purple-50 text-[#4B2C82]' : 'border-slate-100 bg-white text-slate-500'}`}><span className="text-[11px] font-semibold">{r.name}</span>{sel && <CheckCircle2 size={14} />}</button>); })}</div></div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4 border space-y-4 flex flex-col h-full max-h-[600px]">
                            <h3 className="text-[11px] font-bold text-slate-800 uppercase flex items-center gap-2"><PieChartIcon size={14} className="text-[#4B2C82]" /> Zeitliche Verteilung</h3>
                            <div className="h-40 flex items-center justify-center bg-white rounded-2xl border shadow-sm"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[...editingEmployee.skillAssignments]} dataKey="percentage" nameKey="skill" cx="50%" cy="50%" outerRadius={60} innerRadius={40} paddingAngle={4}>{editingEmployee.skillAssignments.map((_, i) => (<Cell key={`cp-${i}`} fill={COLORS[i % COLORS.length]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
                            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                                {editingEmployee.skillAssignments.map((sa, i) => (
                                    <div key={sa.skill} className="bg-white p-2.5 rounded-xl shadow-sm border space-y-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 truncate">
                                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                                <span className="text-[11px] font-bold text-slate-700 truncate">{sa.skill}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-[#4B2C82] bg-purple-50 px-1.5 py-0.5 rounded-md min-w-[32px] text-center">
                                                    {Math.round(sa.percentage)}%
                                                </span>
                                                <button type="button" onClick={() => updateSkillAssignment(sa.skill, 'locked', !sa.locked)} className={`p-1 rounded transition ${sa.locked ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                                                    {sa.locked ? <Lock size={12} /> : <Unlock size={12} />}
                                                </button>
                                            </div>
                                        </div>
                                        <input type="range" min="0" max="100" value={Math.round(sa.percentage)} disabled={sa.locked} onChange={(e) => updateSkillAssignment(sa.skill, 'percentage', e.target.value)} className={`w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#4B2C82] ${sa.locked ? 'opacity-30' : ''}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2.5 pt-4 mt-4 border-t">
                        <button type="submit" className="flex-1 py-2.5 bg-[#4B2C82] text-white font-bold rounded-2xl hover:bg-[#5B3798]">Speichern</button>
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 border rounded-2xl text-slate-500 font-bold hover:bg-slate-50">Abbrechen</button>
                        {!editingEmployee.id.startsWith('new-') && (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isDeleting) {
                                            if (deleteTimer === 0) {
                                                onDelete(editingEmployee);
                                                setIsDeleting(false);
                                            }
                                        } else {
                                            setIsDeleting(true);
                                            setDeleteTimer(5);
                                        }
                                    }}
                                    className={`p-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 ${isDeleting
                                        ? (deleteTimer > 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20')
                                        : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                >
                                    <Trash2 size={20} />
                                    {isDeleting && (
                                        <span className="text-xs">
                                            {deleteTimer > 0 ? `Löschen (${deleteTimer}s)` : 'Jetzt Löschen'}
                                        </span>
                                    )}
                                </button>
                                {isDeleting && (
                                    <button
                                        type="button"
                                        onClick={() => setIsDeleting(false)}
                                        className="p-2.5 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-2xl text-xs font-bold"
                                    >
                                        Abbrechen
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEmployeeModal;
