import React from 'react';
import { useAuth } from '../services/AuthContext';

const Profile: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Mein Profil</h1>
            <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-slate-500">Name</p>
                        <p className="text-lg font-medium">{user?.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <p className="text-lg font-medium">{user?.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Rolle</p>
                        <p className="text-lg font-medium capitalize">{user?.role}</p>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100">
                    <h2 className="text-xl font-bold mb-4">Einstellungen</h2>
                    <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-6 rounded-xl transition mr-4">
                        Passwort ändern
                    </button>
                    <button
                        onClick={logout}
                        className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-6 rounded-xl transition"
                    >
                        Abmelden
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
