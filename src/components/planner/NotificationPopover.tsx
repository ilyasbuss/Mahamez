import React from 'react';
import { X, Bell, History, Check } from 'lucide-react';
import { format } from 'date-fns';
import { getPriorityColor } from '../../utils/dashboardUtils';

interface AppNotification {
    id: string;
    title: string;
    message: string;
    priority: number;
    timestamp: Date;
    readAt?: Date;
}

interface NotificationPopoverProps {
    isOpen: boolean;
    isHistoryView: boolean;
    activeNotifications: AppNotification[];
    notificationsHistory: AppNotification[];
    onClose: () => void;
    onSetHistoryView: (view: boolean) => void;
    onMarkAsRead: (id: string) => void;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({
    isOpen,
    isHistoryView,
    activeNotifications,
    notificationsHistory,
    onClose,
    onSetHistoryView,
    onMarkAsRead
}) => {
    if (!isOpen) return null;

    const renderNotificationItem = (n: AppNotification, isHistory: boolean) => (
        <div
            key={n.id}
            className={`relative pl-3 border-l-4 rounded-r-xl p-2.5 transition duration-200 ${isHistory ? 'bg-white opacity-90 border-slate-300' : 'bg-slate-50/70 hover:bg-white hover:shadow-md'
                }`}
            style={{ borderLeftColor: isHistory ? '#cbd5e1' : getPriorityColor(n.priority) }}
        >
            <div className="flex items-center justify-between mb-0.5">
                <h4 className="text-[13px] font-bold" style={{ color: isHistory ? '#64748b' : getPriorityColor(n.priority) }}>{n.title}</h4>
                <span className="text-[9px] font-medium text-slate-400">
                    {isHistory ? `Gelesen: ${n.readAt ? format(n.readAt, 'HH:mm') : ''}` : format(n.timestamp, 'HH:mm')}
                </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isHistory ? 'text-slate-400' : 'text-slate-500 mb-1.5'}`}>{n.message}</p>
            {!isHistory && (
                <div className="flex justify-end">
                    <button
                        onClick={() => onMarkAsRead(n.id)}
                        className="p-1 bg-white border rounded-lg text-slate-400 hover:text-green-600 hover:border-green-200 transition shadow-sm"
                        title="Als gelesen markieren"
                    >
                        <Check size={12} />
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="absolute top-full right-0 mt-3 w-80 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-4 duration-200 flex flex-col">
            <div className="bg-[#1D0B40] p-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2 font-bold">
                    {isHistoryView ? <History size={14} className="text-[#9F7AEA]" /> : <Bell size={14} className="text-[#9F7AEA]" />}
                    {isHistoryView ? 'Chronik' : 'Benachrichtigungen'}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onSetHistoryView(!isHistoryView)}
                        className="text-xs text-white/70 hover:text-white transition underline underline-offset-4"
                    >
                        {isHistoryView ? 'Live' : 'Chronik'}
                    </button>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition">
                        <X size={16} />
                    </button>
                </div>
            </div>
            <div className="relative overflow-hidden h-[350px]">
                <div className={`flex w-[200%] h-full transition-transform duration-500 ease-in-out ${isHistoryView ? '-translate-x-1/2' : 'translate-x-0'}`}>
                    <div className="w-full h-full p-2.5 overflow-y-auto custom-scrollbar space-y-2">
                        {activeNotifications.sort((a, b) => a.priority - b.priority).map((n) => renderNotificationItem(n, false))}
                        {activeNotifications.length === 0 && <div className="h-full flex flex-col items-center justify-center text-center py-4 text-slate-300 text-xs">Alles grün!</div>}
                    </div>
                    <div className="w-full h-full p-2.5 overflow-y-auto custom-scrollbar space-y-2 bg-slate-50/50">
                        {notificationsHistory.map((n) => renderNotificationItem(n, true))}
                        {notificationsHistory.length === 0 && <div className="h-full flex flex-col items-center justify-center text-center py-4 text-slate-300 text-xs">Leer</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationPopover;
