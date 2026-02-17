import React from 'react';
import { Trash2 } from 'lucide-react';
import { SkillGroup } from '../../types';

interface GroupEditorModalProps {
    editingGroup: SkillGroup;
    onSetEditingGroup: (group: SkillGroup | null) => void;
    onSave: () => void;
    onClose: () => void;
    onDelete: (groupId: string, groupTitle: string) => void;
}

const GroupEditorModal: React.FC<GroupEditorModalProps> = ({
    editingGroup,
    onSetEditingGroup,
    onSave,
    onClose,
    onDelete
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D0B40]/60 backdrop-blur-md">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">{editingGroup.id.includes('-') ? 'Neue Gruppe' : 'Gruppe bearbeiten'}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Titel</label>
                        <input
                            type="text"
                            value={editingGroup.title}
                            onChange={(e) => onSetEditingGroup({ ...editingGroup, title: e.target.value })}
                            className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium"
                        />
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
                        {!editingGroup.id.includes('-') && (
                            <button
                                onClick={() => onDelete(editingGroup.id, editingGroup.title)}
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

export default GroupEditorModal;
