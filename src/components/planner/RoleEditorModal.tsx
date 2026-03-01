import React, { useState, useEffect } from 'react';
import { Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { RoleDefinition, SkillGroup } from '../../types';

interface RoleEditorModalProps {
    editingRole: { role: RoleDefinition; groupId: string; isNew?: boolean };
    skillGroups: SkillGroup[];
    redaktionen: string[];
    onSetEditingRole: (data: { role: RoleDefinition; groupId: string; isNew?: boolean } | null) => void;
    onSave: () => void;
    onClose: () => void;
    onDelete: (groupId: string, roleName: string) => void;
}

const RoleEditorModal: React.FC<RoleEditorModalProps> = ({
    editingRole,
    skillGroups,
    redaktionen,
    onSetEditingRole,
    onSave,
    onClose,
    onDelete
}) => {
    const [isDeptListOpen, setIsDeptListOpen] = useState(false);

    const toggleDepartment = (dept: string) => {
        const currentDepts = editingRole.role.departments || [];
        const nextDepts = currentDepts.includes(dept)
            ? currentDepts.filter(d => d !== dept)
            : [...currentDepts, dept];
        onSetEditingRole({ ...editingRole, role: { ...editingRole.role, departments: nextDepts } });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1D0B40]/60 backdrop-blur-md">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">{editingRole.isNew ? 'Neue Rolle' : 'Rolle bearbeiten'}</h3>
                <div className="space-y-3">
                    {editingRole.isNew && (
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gruppe</label>
                            <select
                                value={editingRole.groupId}
                                onChange={(e) => onSetEditingRole({ ...editingRole, groupId: e.target.value })}
                                className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium"
                            >
                                {skillGroups.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Name</label>
                        <input
                            type="text"
                            value={editingRole.role.name}
                            onChange={(e) => onSetEditingRole({ ...editingRole, role: { ...editingRole.role, name: e.target.value } })}
                            className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Start</label>
                            <input
                                type="time"
                                value={editingRole.role.startTime}
                                onChange={(e) => onSetEditingRole({ ...editingRole, role: { ...editingRole.role, startTime: e.target.value } })}
                                className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ende</label>
                            <input
                                type="time"
                                value={editingRole.role.endTime}
                                onChange={(e) => onSetEditingRole({ ...editingRole, role: { ...editingRole.role, endTime: e.target.value } })}
                                className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Priorität</label>
                            <select
                                value={editingRole.role.defaultPriority}
                                onChange={(e) => onSetEditingRole({ ...editingRole, role: { ...editingRole.role, defaultPriority: parseInt(e.target.value) } })}
                                className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium"
                            >
                                <option value={1}>1 (Hoch)</option>
                                <option value={2}>2 (Mittel)</option>
                                <option value={3}>3 (Niedrig)</option>
                            </select>
                        </div>
                        <div className="relative">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Redaktion</label>
                            <div 
                                className="w-full border rounded-xl px-3 py-2 bg-slate-50 flex items-center justify-between cursor-pointer min-h-[42px]"
                                onClick={() => setIsDeptListOpen(!isDeptListOpen)}
                            >
                                <div className="flex flex-wrap gap-1 max-w-[120px]">
                                    {(editingRole.role.departments || []).length > 0 ? (
                                        (editingRole.role.departments || []).map(d => (
                                            <span key={d} className="bg-purple-100 text-[#4B2C82] text-[9px] px-1.5 py-0.5 rounded-md font-bold truncate max-w-[80px]">
                                                {d}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-400 text-[11px]">Keine</span>
                                    )}
                                </div>
                                {isDeptListOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                            </div>
                            
                            {isDeptListOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 space-y-1 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                    {redaktionen.map(r => (
                                        <label key={r} className="flex items-center gap-3 px-3 py-2 hover:bg-purple-50 rounded-xl cursor-pointer transition-all group/dept">
                                            <div className="relative flex items-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={(editingRole.role.departments || []).includes(r)}
                                                    onChange={() => toggleDepartment(r)}
                                                    className="w-4 h-4 rounded border-slate-300 text-[#4B2C82] focus:ring-[#4B2C82] transition-all cursor-pointer"
                                                />
                                            </div>
                                            <span className={`text-[11px] font-bold transition-colors ${ (editingRole.role.departments || []).includes(r) ? 'text-[#4B2C82]' : 'text-slate-500 group-hover/dept:text-slate-700' }`}>
                                                {r}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2.5 mt-4 pt-4 border-t">
                        <button
                            onClick={onSave}
                            className="flex-1 py-2.5 bg-[#4B2C82] text-white font-bold rounded-2xl hover:bg-[#5B3798] transition-all shadow-md active:scale-[0.98]"
                        >
                            Speichern
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-slate-200 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
                        >
                            Abbrechen
                        </button>
                        {!editingRole.isNew && (
                            <button
                                type="button"
                                onClick={() => onDelete(editingRole.groupId, editingRole.role.name)}
                                className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-all active:scale-95"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleEditorModal;
