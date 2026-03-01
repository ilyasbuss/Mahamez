import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isWeekend, startOfWeek, endOfWeek, addDays, getISOWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Ban, Clock, X, Plus } from 'lucide-react';
import { PartialAvailability, AvailabilityStatus } from '../../types';
import { isSchoolHoliday } from '../../constants/holidays';
import { holidayService, Holiday } from '../../services/HolidayService';

interface AvailabilityCalendarProps {
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    onMonthJump: (date: Date) => void;
    availability: Map<string, PartialAvailability>;
    onAvailabilityChange: (date: string, availability: PartialAvailability | null) => void;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
    currentMonth,
    onMonthChange,
    onMonthJump,
    availability,
    onAvailabilityChange
}) => {
    const [editingDate, setEditingDate] = useState<string | null>(null);
    const [tempStatus, setTempStatus] = useState<AvailabilityStatus>('available');
    const [tempTime, setTempTime] = useState<string>('08:00');
    const [dynamicHolidays, setDynamicHolidays] = useState<Holiday[]>([]);

    useEffect(() => {
        const fetchHolidays = async () => {
            const holidays = await holidayService.getHolidays(currentMonth);
            setDynamicHolidays(holidays);
        };
        fetchHolidays();
    }, [currentMonth]);

    const getHolidayForDate = (dateStr: string, state: 'BW' | 'RP') => {
        return dynamicHolidays.find(h => h.date === dateStr && (h.states.includes(state) || h.states.includes(state.toLowerCase()) || h.states.includes('ALL')));
    };

    // Bulk blocking state
    const [isBulkBlockingOpen, setIsBulkBlockingOpen] = useState(false);
    const [bulkStartDate, setBulkStartDate] = useState('');
    const [bulkEndDate, setBulkEndDate] = useState('');
    const [bulkFirstDayTime, setBulkFirstDayTime] = useState('');
    const [bulkLastDayTime, setBulkLastDayTime] = useState('');
    const [bulkFirstDayType, setBulkFirstDayType] = useState<'full' | 'from' | 'until'>('full');
    const [bulkLastDayType, setBulkLastDayType] = useState<'full' | 'from' | 'until'>('full');

    // Generate all days for the calendar grid (including prev/next month)
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const handleDayClick = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const current = availability.get(dateStr);

        if (current) {
            setTempStatus(current.status);
            setTempTime(current.time || '08:00');
        } else {
            setTempStatus('unavailable_full');
            setTempTime('08:00');
        }
        setEditingDate(dateStr);
    };

    const handleSaveAvailability = () => {
        if (!editingDate) return;

        if (tempStatus === 'available') {
            onAvailabilityChange(editingDate, null);
        } else {
            const needsTime = tempStatus === 'unavailable_from' || tempStatus === 'unavailable_until';
            onAvailabilityChange(editingDate, {
                date: editingDate,
                status: tempStatus,
                time: needsTime ? tempTime : undefined
            });
        }
        setEditingDate(null);
    };

    const handleBulkBlock = () => {
        if (!bulkStartDate || !bulkEndDate) return;

        const start = new Date(bulkStartDate);
        const end = new Date(bulkEndDate);
        const days = eachDayOfInterval({ start, end });

        days.forEach((day, index) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isFirst = index === 0;
            const isLast = index === days.length - 1;

            let status: AvailabilityStatus = 'unavailable_full';
            let time: string | undefined = undefined;

            if (isFirst && bulkFirstDayType !== 'full') {
                status = bulkFirstDayType === 'from' ? 'unavailable_from' : 'unavailable_until';
                time = bulkFirstDayTime;
            } else if (isLast && bulkLastDayType !== 'full') {
                status = bulkLastDayType === 'from' ? 'unavailable_from' : 'unavailable_until';
                time = bulkLastDayTime;
            }

            onAvailabilityChange(dateStr, { date: dateStr, status, time });
        });

        setIsBulkBlockingOpen(false);
        setBulkStartDate('');
        setBulkEndDate('');
        setBulkFirstDayTime('');
        setBulkLastDayTime('');
        setBulkFirstDayType('full');
        setBulkLastDayType('full');
    };

    const getStatusLabel = (status: AvailabilityStatus): string => {
        switch (status) {
            case 'available': return 'Verfügbar';
            case 'unavailable_full': return 'Abwesend (ganzer Tag)';
            case 'unavailable_from': return 'Abwesend ab';
            case 'unavailable_until': return 'Abwesend bis';
        }
    };

    // Generate month options for jump selector (-2 months to +6 months)
    const monthOptions = [];
    for (let i = -2; i <= 6; i++) {
        const monthDate = addMonths(new Date(), i);
        monthOptions.push(monthDate);
    }

    return (
        <>
            <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                {/* Calendar Header */}
                <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
                            className="p-1.5 hover:bg-slate-100 rounded-lg"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {/* Integrated Month Selector */}
                        <div className="relative">
                            <select
                                value={format(currentMonth, 'yyyy-MM')}
                                onChange={(e) => onMonthJump(new Date(e.target.value + '-01'))}
                                className="pl-3 pr-10 py-1.5 border-0 bg-transparent text-lg font-bold text-slate-800 hover:bg-slate-50 focus:outline-none focus:bg-slate-50 rounded-lg cursor-pointer capitalize appearance-none"
                            >
                                {monthOptions.map((month) => (
                                    <option key={format(month, 'yyyy-MM')} value={format(month, 'yyyy-MM')}>
                                        {format(month, 'MMMM yyyy', { locale: de })}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronRight size={16} className="rotate-90" />
                            </div>
                        </div>

                        <button
                            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
                            className="p-1.5 hover:bg-slate-100 rounded-lg"
                        >
                            <ChevronRight size={18} />
                        </button>

                        {/* Bulk Blocking Button */}
                        <button
                            onClick={() => setIsBulkBlockingOpen(true)}
                            className="ml-2 p-1.5 bg-purple-50 hover:bg-purple-100 text-[#4B2C82] rounded-lg transition flex items-center gap-1.5 px-3"
                            title="Zeitraum blocken"
                        >
                            <Plus size={16} />
                            <span className="text-sm font-bold">Zeitraum blocken</span>
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-4">
                    <div className="grid grid-cols-7 mb-4">
                        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day, idx) => (
                            <div key={day} className={`text-center text-xs font-bold uppercase tracking-widest py-2 ${idx >= 5 ? 'text-purple-500' : 'text-slate-500'}`}>
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                        {calendarDays.map((day, dayIndex) => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const isCurrentMonth = day >= monthStart && day <= monthEnd;
                            const avail = availability.get(dateStr);
                            const isUnavailable = avail && avail.status !== 'available';
                            const dayOfWeek = day.getDay();
                            const isMonday = dayOfWeek === 1;
                            const isWknd = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
                            
                            const bwHoliday = getHolidayForDate(dateStr, 'BW');
                            const rpHoliday = getHolidayForDate(dateStr, 'RP');
                            const holidayData = bwHoliday || rpHoliday;

                            const isBwSchool = isSchoolHoliday(dateStr, 'BW');
                            const isRpSchool = isSchoolHoliday(dateStr, 'RP');
                            const isSchool = isBwSchool || isRpSchool;

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => isCurrentMonth && handleDayClick(day)}
                                    disabled={!isCurrentMonth}
                                    className={`
                    relative rounded-xl flex flex-col items-center border transition-all duration-200 py-4 px-2 min-h-[90px]
                    ${!isCurrentMonth ? 'opacity-40 cursor-not-allowed bg-slate-50/30 border-slate-200' : ''}
                    ${isCurrentMonth && holidayData
                                            ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-400 shadow-sm'
                                            : isCurrentMonth && isUnavailable
                                                ? 'bg-red-50 border-red-300 text-red-600'
                                                : isCurrentMonth && isSchool
                                                    ? 'bg-orange-50/40 border-orange-200'
                                                    : isCurrentMonth && isWknd
                                                        ? 'bg-purple-50/50 border-purple-200'
                                                        : isCurrentMonth
                                                            ? 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-md'
                                                            : ''
                                        }
                  `}
                                >
                                    {/* Monday KW Banner */}
                                    {isMonday && isCurrentMonth && (
                                        <div className="absolute top-0 left-0 bg-[#1D0B40] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-lg shadow-sm z-10">
                                            KW {getISOWeek(day)}
                                        </div>
                                    )}

                                    {/* Holiday Name at Top */}
                                    {holidayData && isCurrentMonth && (
                                        <span className="text-[9px] font-bold text-orange-700 text-center leading-normal px-1 mb-auto w-full line-clamp-2">
                                            {holidayData.name}
                                        </span>
                                    )}

                                    {/* Availability Status in Middle */}
                                    {isUnavailable && avail && (
                                        <div className={`flex flex-col items-center ${holidayData ? '' : 'mt-auto'}`}>
                                            {avail.status === 'unavailable_full' && <Ban size={16} className="opacity-50" />}
                                            {(avail.status === 'unavailable_from' || avail.status === 'unavailable_until') && (
                                                <Clock size={14} className="opacity-50" />
                                            )}
                                            {avail.time && (
                                                <span className="text-[10px] font-bold mt-1">{avail.time}</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Day Number Bottom Left */}
                                    <span className={`absolute bottom-2 left-2 text-sm font-black ${!isCurrentMonth ? 'text-slate-300' : holidayData ? 'text-orange-700' : isUnavailable ? 'text-red-600' : 'text-slate-700'}`}>
                                        {format(day, 'd')}
                                    </span>

                                    {/* State Badges Top Right */}
                                    {(bwHoliday || rpHoliday || isBwSchool || isRpSchool) && isCurrentMonth && (
                                        <div className="absolute top-1.5 right-1.5">
                                            <div className="flex gap-0.5">
                                                {(bwHoliday || isBwSchool) && (
                                                    <span className={`text-[7px] font-bold text-white px-1 py-0.5 rounded shadow-sm ${bwHoliday ? 'bg-orange-500' : 'bg-orange-300'}`}>
                                                        BW
                                                    </span>
                                                )}
                                                {(rpHoliday || isRpSchool) && (
                                                    <span className={`text-[7px] font-bold text-white px-1 py-0.5 rounded shadow-sm ${rpHoliday ? 'bg-blue-500' : 'bg-blue-300'}`}>
                                                        RP
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Availability Edit Modal */}
            {editingDate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1D0B40]/70 backdrop-blur-lg">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-slate-800">
                                Verfügbarkeit für {format(new Date(editingDate), 'dd. MMMM yyyy', { locale: de })}
                            </h3>
                            <button onClick={() => setEditingDate(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Status Selection */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Status
                                </label>
                                <div className="space-y-2">
                                    {(['unavailable_full', 'unavailable_from', 'unavailable_until'] as AvailabilityStatus[]).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setTempStatus(status)}
                                            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${tempStatus === status
                                                ? 'border-[#4B2C82] bg-purple-50/50'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                                }`}
                                        >
                                            <span className="font-bold text-sm">{getStatusLabel(status)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Selection (if needed) */}
                            {(tempStatus === 'unavailable_from' || tempStatus === 'unavailable_until') && (
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        Uhrzeit
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="HH:MM"
                                        value={tempTime}
                                        onChange={(e) => setTempTime(e.target.value)}
                                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium"
                                    />
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    onClick={() => setEditingDate(null)}
                                    className="flex-1 py-2.5 border-2 border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    onClick={handleSaveAvailability}
                                    className="flex-1 py-2.5 bg-[#4B2C82] text-white rounded-2xl font-bold hover:bg-[#5B3798] transition shadow-lg"
                                >
                                    Speichern
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Blocking Modal */}
            {isBulkBlockingOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1D0B40]/70 backdrop-blur-lg">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-slate-800">Zeitraum blocken</h3>
                            <button onClick={() => setIsBulkBlockingOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        Von
                                    </label>
                                    <input
                                        type="date"
                                        value={bulkStartDate}
                                        onChange={(e) => setBulkStartDate(e.target.value)}
                                        className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        Bis
                                    </label>
                                    <input
                                        type="date"
                                        value={bulkEndDate}
                                        onChange={(e) => setBulkEndDate(e.target.value)}
                                        className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium"
                                    />
                                </div>
                            </div>

                            {/* First Day Options */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Erster Tag
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={bulkFirstDayType === 'full'}
                                            onChange={() => setBulkFirstDayType('full')}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-medium">Ganzer Tag</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={bulkFirstDayType === 'from'}
                                            onChange={() => setBulkFirstDayType('from')}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-medium">Abwesend ab</span>
                                        {bulkFirstDayType === 'from' && (
                                            <input
                                                type="text"
                                                placeholder="HH:MM"
                                                value={bulkFirstDayTime}
                                                onChange={(e) => setBulkFirstDayTime(e.target.value)}
                                                className="ml-2 border-2 border-slate-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-[#4B2C82]"
                                            />
                                        )}
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={bulkFirstDayType === 'until'}
                                            onChange={() => setBulkFirstDayType('until')}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-medium">Abwesend bis</span>
                                        {bulkFirstDayType === 'until' && (
                                            <input
                                                type="text"
                                                placeholder="HH:MM"
                                                value={bulkFirstDayTime}
                                                onChange={(e) => setBulkFirstDayTime(e.target.value)}
                                                className="ml-2 border-2 border-slate-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-[#4B2C82]"
                                            />
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Last Day Options */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        Letzter Tag
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={bulkLastDayType === 'full'}
                                                onChange={() => setBulkLastDayType('full')}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm font-medium">Ganzer Tag</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={bulkLastDayType === 'from'}
                                                onChange={() => setBulkLastDayType('from')}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm font-medium">Abwesend ab</span>
                                            {bulkLastDayType === 'from' && (
                                                <input
                                                    type="text"
                                                    placeholder="HH:MM"
                                                    value={bulkLastDayTime}
                                                    onChange={(e) => setBulkLastDayTime(e.target.value)}
                                                    className="ml-2 border-2 border-slate-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-[#4B2C82]"
                                                />
                                            )}
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={bulkLastDayType === 'until'}
                                                onChange={() => setBulkLastDayType('until')}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm font-medium">Abwesend bis</span>
                                            {bulkLastDayType === 'until' && (
                                                <input
                                                    type="text"
                                                    placeholder="HH:MM"
                                                    value={bulkLastDayTime}
                                                    onChange={(e) => setBulkLastDayTime(e.target.value)}
                                                    className="ml-2 border-2 border-slate-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-[#4B2C82]"
                                                />
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    onClick={() => setIsBulkBlockingOpen(false)}
                                    className="flex-1 py-2.5 border-2 border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    onClick={handleBulkBlock}
                                    disabled={!bulkStartDate || !bulkEndDate}
                                    className="flex-1 py-2.5 bg-[#4B2C82] text-white rounded-2xl font-bold hover:bg-[#5B3798] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Zeitraum blocken
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AvailabilityCalendar;
