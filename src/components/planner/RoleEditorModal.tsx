import React from 'react';
import { Trash2 } from 'lucide-react';
import { RoleDefinition, SkillGroup } from '../../types';

interface RoleEditorModalProps {
    editingRole: { role: RoleDefinition; groupId: string; isNew?: boolean };
    skillGroups: SkillGroup[];
    onSetEditingRole: (data: { role: RoleDefinition; groupId: string; isNew?: boolean } | null) => void;
    onSave: () => void;
    onClose: () => void;
    onDelete: (groupId: string, roleName: string) => void;
}

const RoleEditorModal: React.FC<RoleEditorModalProps> = ({
    editingRole,
    skillGroups,
    onSetEditingRole,
    onSave,
    onClose,
    onDelete
}) => {
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
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                        <button
                            onClick={onSave}
                            className="flex-1 py-2.5 bg-[#4B2C82] text-white font-bold rounded-2xl hover:bg-[#5B3798]"
                        >
                            Speichern
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 border rounded-2xl text-slate-500 font-bold hover:bg-slate-50"
                        >
                            Abbrechen
                        </button>
                        {!editingRole.isNew && (
                            <button
                                onClick={() => onDelete(editingRole.groupId, editingRole.role.name)}
                                className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl"
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
