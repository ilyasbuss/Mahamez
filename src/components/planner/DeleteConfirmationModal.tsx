import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    type: 'employee' | 'shift' | 'role' | 'group';
    name: string;
    timer: number;
    onConfirm: () => void;
    onClose: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    type,
    name,
    timer,
    onConfirm,
    onClose
}) => {
    if (!isOpen) return null;

    const typeLabels = {
        employee: 'Mitarbeiter',
        shift: 'Schicht',
        role: 'Rolle',
        group: 'Gruppe'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1D0B40]/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 text-center animate-in zoom-in duration-200">
                <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Wirklich löschen?</h3>
                <p className="text-slate-500 text-sm mb-1">Du bist dabei, folgenden Eintrag unwiderruflich zu löschen:</p>
                <p className="font-bold text-slate-700 mb-8 px-4 py-2 bg-slate-50 rounded-xl inline-block">{typeLabels[type]}: {name}</p>

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                    >
                        Abbrechen
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={timer > 0}
                        className={`flex-1 py-3 rounded-2xl font-bold text-white shadow-lg transition-all ${timer > 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                            }`}
                    >
                        {timer > 0 ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-400 animate-spin" />
                                Löschen ({timer}s)
                            </span>
                        ) : 'Jetzt Löschen'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
