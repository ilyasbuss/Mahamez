import React, { useState } from 'react';
import { Settings2, Plus, GripVertical, Trash2, CheckCircle2, AlertCircle, ChevronRight, X } from 'lucide-react';

export interface RosterRule {
    id: string;
    title: string;
    description: string;
    type: 'constraint' | 'preference' | 'fairness';
    active: boolean;
    logic: {
        condition: string;
        value: string | number;
        operator: string;
    };
    priority: number;
}

const RulesConfig: React.FC = () => {
    const [rules, setRules] = useState<RosterRule[]>([
        { id: 'r1', title: 'Maximale Wochenarbeitszeit', description: 'Kein Mitarbeiter darf mehr als seine vertraglich vereinbarten Stunden pro Woche arbeiten.', type: 'constraint', active: true, logic: { condition: 'weekly_hours', operator: '<=', value: 'contract_limit' }, priority: 1 },
        { id: 'r2', title: 'Mindestruhezeit', description: 'Zwischen zwei Schichten müssen mindestens 11 Stunden Ruhezeit liegen.', type: 'constraint', active: true, logic: { condition: 'rest_period', operator: '>=', value: 11 }, priority: 2 },
        { id: 'r3', title: 'Wochenend-Limit', description: 'Maximal 2 Wochenenden pro Monat pro Mitarbeiter.', type: 'fairness', active: true, logic: { condition: 'weekend_count', operator: '<=', value: 2 }, priority: 3 },
        { id: 'r4', title: 'Qualifikations-Check', description: 'Jede Rolle muss mit einem Mitarbeiter besetzt sein, der die entsprechende Qualifikation hat.', type: 'constraint', active: true, logic: { condition: 'skill_match', operator: '=', value: 'required' }, priority: 4 },
    ]);

    const [isAdding, setIsAdding] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl border shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Settings2 className="text-[#4B2C82]" size={24} />
                        Dienstplanregeleinstellungen
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Definieren und sortieren Sie die Regeln für den automatischen Planungsalgorithmus.
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-[#4B2C82] text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg hover:bg-[#5B3798] transition-all flex items-center gap-2"
                >
                    <Plus size={20} />
                    Neue Regel
                </button>
            </div>

            {/* Rules List */}
            <div className="space-y-3">
                <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6">
                    <div className="w-10">Prio</div>
                    <div className="flex-1">Regel & Beschreibung</div>
                    <div className="w-24 px-4 text-center">Status</div>
                    <div className="w-24 text-right">Aktionen</div>
                </div>

                {rules.sort((a, b) => a.priority - b.priority).map((rule, index) => (
                    <div
                        key={rule.id}
                        className={`group bg-white border rounded-2xl p-4 flex items-center gap-4 transition-all hover:shadow-md ${!rule.active ? 'opacity-60' : ''}`}
                    >
                        <div className="flex flex-col items-center gap-1">
                            <button className="text-slate-300 hover:text-slate-500">
                                <GripVertical size={20} />
                            </button>
                            <span className="text-xs font-black text-slate-400">{index + 1}</span>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-800">{rule.title}</h3>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${rule.type === 'constraint' ? 'bg-red-50 text-red-600' :
                                    rule.type === 'fairness' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                    }`}>
                                    {rule.type}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 leading-snug">{rule.description}</p>

                            {/* Logic Display Case (Graphical representation) */}
                            <div className="mt-3 flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 w-fit">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">LOGIK:</span>
                                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600">
                                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{rule.logic.condition}</span>
                                    <span className="text-purple-600 font-bold">{rule.logic.operator}</span>
                                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{rule.logic.value}</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-24 flex justify-center">
                            <button
                                onClick={() => {
                                    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: !r.active } : r));
                                }}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${rule.active ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-100 text-slate-400'
                                    }`}
                            >
                                {rule.active ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                {rule.active ? 'Aktiv' : 'Inaktiv'}
                            </button>
                        </div>

                        <div className="w-24 text-right flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-[#4B2C82] hover:bg-purple-50 rounded-xl transition">
                                <Settings2 size={18} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Visual Builder Sidebar (Mockup) */}
            {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-end md:p-4 bg-[#1D0B40]/70 backdrop-blur-md">
                    <div className="bg-white w-full md:w-[600px] h-[90vh] md:h-full md:rounded-[40px] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-8 border-b">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-2xl font-black text-slate-800">Regel-Editor</h3>
                                <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-500 transition">
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-slate-500">Erstellen Sie grafisch eine neue Dienstplanregel.</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <section>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">1. Wenn (Bedingung)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Schicht zugewiesen', 'Wochenende', 'Aufeinanderfolgend', 'Qualifikation'].map(item => (
                                        <button key={item} className="p-4 border-2 border-slate-100 rounded-2xl text-left hover:border-[#4B2C82] hover:bg-purple-50 transition group">
                                            <div className="text-sm font-bold text-slate-700 group-hover:text-[#4B2C82]">{item}</div>
                                            <div className="text-[10px] text-slate-400 mt-1">Details hier konfigurieren...</div>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <div className="flex justify-center">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                    <ChevronRight size={20} className="rotate-90 text-slate-300" />
                                </div>
                            </div>

                            <section>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">2. Dann (Aktion/Einschränkung)</label>
                                <div className="space-y-3">
                                    <div className="p-4 bg-purple-50 border-2 border-[#4B2C82]/20 rounded-3xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="font-bold text-slate-800 text-sm italic">Einschränkung anwenden:</div>
                                            <span className="bg-white px-2 py-1 rounded-lg text-[10px] font-bold text-[#4B2C82] shadow-sm">CONSTRAINT</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <select className="flex-1 bg-white border rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 ring-purple-100 transition">
                                                <option>Maximale Stunden</option>
                                                <option>Mindestruhezeit</option>
                                                <option>Max. Wochenenden</option>
                                            </select>
                                            <span className="font-black text-purple-600">DARF NICHT</span>
                                            <input type="number" defaultValue={40} className="w-20 bg-white border rounded-xl px-4 py-2 text-sm font-bold outline-none" />
                                            <span className="text-xs font-bold text-slate-500 uppercase">Überschreiten</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
                                <h4 className="text-xs font-black text-slate-400 uppercase mb-4">Regel-Vorschau</h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-purple-600 font-black">IF</div>
                                    <div className="text-sm font-bold text-slate-600">Wochenarbeitsstunden</div>
                                    <div className="text-purple-600 font-black">&gt;</div>
                                    <div className="text-sm font-bold text-slate-600">Vertragslimit (40h)</div>
                                    <div className="ml-auto bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black italic">BLOCKIEREN</div>
                                </div>
                            </section>
                        </div>

                        <div className="p-8 border-t flex gap-4">
                            <button onClick={() => setIsAdding(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-3xl font-bold text-slate-500 hover:bg-slate-50 transition">Abbrechen</button>
                            <button onClick={() => setIsAdding(false)} className="flex-1 py-4 bg-[#4B2C82] text-white rounded-3xl font-bold shadow-xl shadow-purple-900/20 hover:bg-[#5B3798] transition">Regel speichern</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RulesConfig;
