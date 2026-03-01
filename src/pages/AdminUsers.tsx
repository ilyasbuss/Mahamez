import React, { useState } from 'react';
import { UserPlus, Shield, Send } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'invited' | 'active' | 'inactive';
}

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([
        { id: 1, name: "Anna Schmidt", email: "a.schmidt@swr.de", role: "mitarbeiter", status: "active" },
        { id: 2, name: "Max Mustermann", email: "m.mustermann@swr.de", role: "planer", status: "active" },
        { id: 3, name: "Lena Weber", email: "l.weber@swr.de", role: "mitarbeiter", status: "invited" },
    ]);

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', role: 'mitarbeiter' });

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        // API call would go here
        alert("Einladung verschickt!");
        setShowInviteModal(false);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#1D0B40]">Mitarbeiter-Verwaltung</h1>
                    <p className="text-slate-500">Verwalten Sie Rollen und Zugnge</p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-[#4B2C82] hover:bg-[#5B3798] text-white font-bold py-3 px-6 rounded-xl transition flex items-center gap-2 shadow-lg shadow-purple-900/20"
                >
                    <UserPlus size={20} />
                    Mitarbeiter anlegen
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Rolle</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Aktion</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition">
                                <td className="px-6 py-4 font-medium text-slate-700">{user.name}</td>
                                <td className="px-6 py-4 text-slate-500">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${user.role === 'planer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`flex items-center gap-1.5 text-sm font-medium ${user.status === 'active' ? 'text-emerald-600' :
                                        user.status === 'invited' ? 'text-amber-500' : 'text-slate-400'
                                        }`}>
                                        <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-500' :
                                            user.status === 'invited' ? 'bg-amber-500' : 'bg-slate-400'
                                            }`} />
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.status === 'invited' && (
                                        <button className="text-amber-500 hover:text-amber-600 font-bold text-xs flex items-center gap-1">
                                            <Send size={14} />
                                            Neu senden
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showInviteModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
                        <h2 className="text-2xl font-bold mb-6">Neuen Mitarbeiter anlegen</h2>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Vorname</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Nachname</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Rolle</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                    value={formData.role}
                                    onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                                >
                                    <option value="mitarbeiter">Mitarbeiter</option>
                                    <option value="planer">Planer</option>
                                </select>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-500">Abbrechen</button>
                                <button type="submit" className="flex-1 px-6 py-3 bg-[#4B2C82] text-white rounded-xl font-bold shadow-lg shadow-purple-900/20">Anlegen</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
