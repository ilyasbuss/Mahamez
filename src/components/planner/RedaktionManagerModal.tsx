import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface RedaktionManagerModalProps {
    redaktionen: string[];
    onAdd: (name: string) => void;
    onDelete: (name: string) => void;
    onClose: () => void;
}

const RedaktionManagerModal: React.FC<RedaktionManagerModalProps> = ({
    redaktionen,
    onAdd,
    onDelete,
    onClose
}) => {
    const [newName, setNewName] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim()) {
            onAdd(newName.trim());
            setNewName('');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1D0B40]/60 backdrop-blur-md">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-800">Redaktionen verwalten</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Neue Redaktion..."
                            className="flex-1 border rounded-xl px-4 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium"
                        />
                        <button
                            type="submit"
                            className="p-2 bg-[#4B2C82] text-white rounded-xl hover:bg-[#5B3798] transition shadow-lg shadow-purple-900/20"
                        >
                            <Plus size={24} />
                        </button>
                    </form>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {redaktionen.map(r => (
                            <div key={r} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                                <span className="font-bold text-slate-700">{r}</span>
                                <button
                                    onClick={() => onDelete(r)}
                                    className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {redaktionen.length === 0 && (
                            <p className="text-center text-slate-400 py-4 font-medium">Keine Redaktionen vorhanden.</p>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition"
                    >
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RedaktionManagerModal;
