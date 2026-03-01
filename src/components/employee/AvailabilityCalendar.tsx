import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isWeekend, startOfWeek, endOfWeek, addDays, getISOWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Ban, Clock, X, Plus, AlertCircle, Plane, MessageSquare, Trash2 } from 'lucide-react';
import { PartialAvailability, AvailabilityStatus } from '../../types';
import { holidayService, Holiday } from '../../services/HolidayService';
import { schoolHolidayService, SchoolHoliday } from '../../services/SchoolHolidayService';

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
    const [tempTime, setTempTime] = useState<string>('');
    // New state for redesigned modal
    const [rangeEndDate, setRangeEndDate] = useState<string>('');
    const [recurrence, setRecurrence] = useState<'none' | 'weekly' | 'monthly'>('none');
    const [tempEndTime, setTempEndTime] = useState<string>('');
    const [comment, setComment] = useState<string>('');
    const [draggedAvailability, setDraggedAvailability] = useState<PartialAvailability | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteTimer, setDeleteTimer] = useState(0);

    const [dynamicHolidays, setDynamicHolidays] = useState<Holiday[]>([]);
    const [dynamicSchoolHolidaysBW, setDynamicSchoolHolidaysBW] = useState<SchoolHoliday[]>([]);
    const [dynamicSchoolHolidaysRP, setDynamicSchoolHolidaysRP] = useState<SchoolHoliday[]>([]);

    useEffect(() => {
        const fetchAllData = async () => {
            const [holidays, schoolBW, schoolRP] = await Promise.all([
                holidayService.getHolidays(currentMonth),
                schoolHolidayService.getSchoolHolidays(currentMonth, 'BW'),
                schoolHolidayService.getSchoolHolidays(currentMonth, 'RP')
            ]);
            setDynamicHolidays(holidays);
            setDynamicSchoolHolidaysBW(schoolBW);
            setDynamicSchoolHolidaysRP(schoolRP);
        };
        fetchAllData();
    }, [currentMonth]);

    useEffect(() => {
        let interval: number;
        if (isDeleting && deleteTimer > 0) {
            interval = window.setInterval(() => {
                setDeleteTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isDeleting, deleteTimer]);

    const getHolidayForDate = (dateStr: string, state: 'BW' | 'RP') => {
        return dynamicHolidays.find(h =>
            h.date === dateStr && (h.states.includes(state) || h.states.includes('ALL'))
        );
    };

    const isSchoolHolidayForDate = (dateStr: string, state: 'BW' | 'RP') => {
        const list = state === 'BW' ? dynamicSchoolHolidaysBW : dynamicSchoolHolidaysRP;
        return list.some(sh => dateStr >= sh.startDate && dateStr <= sh.endDate);
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
            setTempTime(current.time || '');
            setTempEndTime('');
        } else {
            setTempStatus('unavailable_full');
            setTempTime('');
            setTempEndTime('');
        }
        setEditingDate(dateStr);
        setRangeEndDate('');
        setRecurrence('none');
        setComment(current?.comment || '');
    };

    const handleSaveAvailability = () => {
        if (!editingDate) return;

        const start = new Date(editingDate);
        const datesToUpdate: string[] = [editingDate];

        // Handle date range
        if ((tempStatus === 'unavailable_full' || tempStatus === 'vacation') && rangeEndDate) {
            const end = new Date(rangeEndDate);
            if (end > start) {
                const rangeDays = eachDayOfInterval({ start, end });
                rangeDays.forEach(d => {
                    const dStr = format(d, 'yyyy-MM-dd');
                    if (!datesToUpdate.includes(dStr)) datesToUpdate.push(dStr);
                });
            }
        }

        // Handle recurrence
        let allDatesToUpdate = [...datesToUpdate];
        if (recurrence !== 'none') {
            datesToUpdate.forEach(baseDateStr => {
                const baseDate = new Date(baseDateStr);
                for (let i = 1; i <= 12; i++) {
                    let nextDate: Date;
                    if (recurrence === 'weekly') {
                        nextDate = addDays(baseDate, i * 7);
                    } else { // monthly
                        nextDate = addMonths(baseDate, i);
                        // Validation already handled in UI button disable, but safety check:
                        if (nextDate.getDate() !== baseDate.getDate()) continue;
                    }
                    allDatesToUpdate.push(format(nextDate, 'yyyy-MM-dd'));
                }
            });
        }

        allDatesToUpdate.forEach(dateStr => {
            if (tempStatus === 'available') {
                onAvailabilityChange(dateStr, null);
            } else {
                const isTimeBased = tempStatus === 'unavailable_from' || tempStatus === 'unavailable_until';
                onAvailabilityChange(dateStr, {
                    date: dateStr,
                    status: tempStatus,
                    time: isTimeBased ? tempTime : undefined,
                    comment: comment.trim() || undefined
                });

                // If special case: both abwesend ab AND bis (custom logic mentioned by user)
                // The current type only supports one. We might need to extend it later if they want true stundenweise.
                // For now, we apply the chosen status.
            }
        });

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
            case 'vacation': return 'Urlaub';
        }
    };

    const isMonthlyPossible = (dateStr: string) => {
        const date = new Date(dateStr);
        const dayOfMonth = date.getDate();
        if (dayOfMonth <= 28) return true;

        // Check next 12 months
        for (let i = 1; i <= 12; i++) {
            const nextMonth = addMonths(date, i);
            const daysInMonth = endOfMonth(nextMonth).getDate();
            if (dayOfMonth > daysInMonth) return false;
        }
        return true;
    };

    // Generate month options for jump selector (+/- 12 months)
    const monthOptions = [];
    for (let i = -12; i <= 12; i++) {
        const monthDate = addMonths(new Date(), i);
        monthOptions.push(monthDate);
    }

    return (
        <>
            <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                {/* Calendar Header */}
                <div className="p-4 border-b flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-slate-50/50 p-1 rounded-xl border border-slate-100/50">
                            <button
                                onClick={() => {
                                    const prev = subMonths(currentMonth, 1);
                                    if (prev >= monthOptions[0]) onMonthChange(prev);
                                }}
                                disabled={currentMonth <= monthOptions[0]}
                                className={`p-1.5 rounded-lg transition-colors ${currentMonth <= monthOptions[0] ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-white text-slate-600'}`}
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <div className="relative group">
                                <select
                                    value={format(currentMonth, 'yyyy-MM')}
                                    onChange={(e) => onMonthJump(new Date(e.target.value + '-01'))}
                                    className="pl-2 pr-5 py-1 text-base font-bold text-slate-800 bg-transparent focus:outline-none rounded-lg cursor-pointer capitalize appearance-none transition-all duration-200"
                                >
                                    {monthOptions.map((month) => (
                                        <option key={format(month, 'yyyy-MM')} value={format(month, 'yyyy-MM')}>
                                            {format(month, 'MMMM yyyy', { locale: de })}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600">
                                    <ChevronRight size={10} className="rotate-90" />
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    const next = addMonths(currentMonth, 1);
                                    if (next <= monthOptions[monthOptions.length - 1]) onMonthChange(next);
                                }}
                                disabled={currentMonth >= monthOptions[monthOptions.length - 1]}
                                className={`p-1.5 rounded-lg transition-colors ${currentMonth >= monthOptions[monthOptions.length - 1] ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-white text-slate-600'}`}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        {/* Bulk Blocking Button */}
                        <button
                            onClick={() => setIsBulkBlockingOpen(true)}
                            className="p-1.5 bg-purple-50 hover:bg-purple-100 text-[#4B2C82] rounded-lg transition flex items-center gap-1.5 px-3"
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
                    <div className="grid grid-cols-7 gap-y-1.5 gap-x-1.5">
                        {calendarDays.map((day, dayIndex) => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const isCurrentMonth = day >= monthStart && day <= monthEnd;
                            const avail = availability.get(dateStr);
                            const isUnavailable = avail && avail.status !== 'available';
                            const dayOfWeek = day.getDay();
                            const isMonday = dayOfWeek === 1;
                            const isSunday = dayOfWeek === 0;
                            const isWknd = dayOfWeek === 0 || dayOfWeek === 6;

                            const bwHoliday = getHolidayForDate(dateStr, 'BW');
                            const rpHoliday = getHolidayForDate(dateStr, 'RP');
                            const holidayData = bwHoliday || rpHoliday;

                            const isBwSchool = isSchoolHolidayForDate(dateStr, 'BW');
                            const isRpSchool = isSchoolHolidayForDate(dateStr, 'RP');
                            const isSchool = isBwSchool || isRpSchool;

                            // Merging logic for overlay
                            const prevDayStr = format(addDays(day, -1), 'yyyy-MM-dd');
                            const nextDayStr = format(addDays(day, 1), 'yyyy-MM-dd');
                            const prevAvail = availability.get(prevDayStr);
                            const nextAvail = availability.get(nextDayStr);

                            const isPrevInBlock = !isMonday && isUnavailable && prevAvail && prevAvail.status === avail.status && (day >= monthStart && addDays(day, -1) >= monthStart);
                            const isNextInBlock = !isSunday && isUnavailable && nextAvail && nextAvail.status === avail.status && (day <= monthEnd && addDays(day, 1) <= monthEnd);

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => isCurrentMonth && handleDayClick(day)}
                                    draggable={isCurrentMonth && isUnavailable}
                                    onDragStart={(e) => {
                                        if (isCurrentMonth && avail) {
                                            setDraggedAvailability(avail);
                                            // Set a transparent drag image to not obscure the cursor too much
                                            const ghost = document.createElement('div');
                                            ghost.style.opacity = '0';
                                            document.body.appendChild(ghost);
                                            e.dataTransfer.setDragImage(ghost, 0, 0);
                                            setTimeout(() => document.body.removeChild(ghost), 0);
                                        }
                                    }}
                                    onDragOver={(e) => {
                                        if (isCurrentMonth) {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'copy';
                                        }
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        if (isCurrentMonth && draggedAvailability) {
                                            onAvailabilityChange(dateStr, { ...draggedAvailability, date: dateStr });
                                            setDraggedAvailability(null);
                                        }
                                    }}
                                    disabled={!isCurrentMonth}
                                    className={`
                                        relative flex flex-col items-center border transition-all duration-200 py-4 px-2 min-h-[90px] rounded-xl
                                        ${!isCurrentMonth ? 'opacity-40 cursor-not-allowed bg-slate-50/30 border-slate-200/60' : ''}
                                        ${isCurrentMonth && isUnavailable && avail!.status === 'unavailable_full'
                                            ? 'border-red-300 bg-red-50/80'
                                            : isCurrentMonth && isUnavailable && avail!.status === 'vacation'
                                                ? 'border-blue-300 bg-blue-50/80'
                                                : isCurrentMonth && holidayData
                                                    ? 'bg-gradient-to-br from-amber-50 to-orange-100 border-orange-400/60 shadow-sm z-10'
                                                    : isCurrentMonth && isSchool
                                                        ? 'bg-orange-50/50 border-slate-200'
                                                        : isCurrentMonth && isWknd
                                                            ? 'bg-purple-50 border-purple-200'
                                                            : isCurrentMonth
                                                                ? 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-md z-10'
                                                                : ''
                                        }
                                        ${isUnavailable ? 'z-10' : 'z-20'}
                                    `}
                                >
                                    {/* Merged Background Overlay (Backdrop) */}
                                    {isUnavailable && isCurrentMonth && (
                                        <>
                                            {isPrevInBlock && (
                                                <div className={`absolute top-3 bottom-3 -left-[7px] w-[7px] z-[-1] ${avail!.status === 'vacation' ? 'bg-blue-50/80 shadow-inner' : 'bg-red-50/80 shadow-inner'}`} />
                                            )}
                                            {isNextInBlock && (
                                                <div className={`absolute top-3 bottom-3 -right-[7px] w-[7px] z-[-1] ${avail!.status === 'vacation' ? 'bg-blue-50/80 shadow-inner' : 'bg-red-50/80 shadow-inner'}`} />
                                            )}
                                        </>
                                    )}

                                    {/* Monday KW Banner */}
                                    {isMonday && isCurrentMonth && (
                                        <div className="absolute top-0 left-0 bg-[#1D0B40] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-lg shadow-sm z-20">
                                            KW {getISOWeek(day)}
                                        </div>
                                    )}

                                    {/* Holiday Name - Centered */}
                                    {holidayData && isCurrentMonth && (
                                        <div className="absolute inset-0 flex items-center justify-center p-2 z-10">
                                            <span className="text-[10px] font-bold text-orange-800/80 text-center leading-tight line-clamp-2">
                                                {holidayData.name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Large centered Ban icon for full-day absence */}
                                    {isUnavailable && avail && avail.status === 'unavailable_full' && isCurrentMonth && (
                                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                            <Ban size={48} className="text-red-500 opacity-80" strokeWidth={1.5} />
                                        </div>
                                    )}

                                    {/* Large centered Plane icon for vacation */}
                                    {isUnavailable && avail && avail.status === 'vacation' && isCurrentMonth && (
                                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                            <Plane size={48} className="text-blue-500 opacity-80" strokeWidth={1.5} />
                                        </div>
                                    )}

                                    {/* Hourly status (small, with time) */}
                                    {isUnavailable && avail && (avail.status === 'unavailable_from' || avail.status === 'unavailable_until') && (
                                        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                                            <Clock size={16} className="opacity-60 text-slate-600" />
                                            {avail.time && (
                                                <span className="text-[10px] font-bold mt-0.5 text-slate-600">{avail.time}</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Comment Chat-bubble — bottom right */}
                                    {isUnavailable && avail && avail.comment && (
                                        <div className="absolute bottom-[11px] right-2 z-20">
                                            <MessageSquare size={12} className="text-slate-400 fill-slate-200" />
                                        </div>
                                    )}

                                    {/* Day Number Bottom Left */}
                                    <span className={`absolute bottom-2 left-2 text-sm font-black z-20
                                        ${!isCurrentMonth ? 'text-slate-300'
                                            : holidayData ? 'text-orange-800'
                                                : 'text-slate-700'}`}>
                                        {format(day, 'd')}
                                    </span>

                                    {/* State Badges Top Right */}
                                    {(bwHoliday || rpHoliday || isBwSchool || isRpSchool) && isCurrentMonth && (
                                        <div className="absolute top-1 right-1.5 z-20">
                                            <div className="flex gap-0.5">
                                                {(bwHoliday || isBwSchool) && (
                                                    <span className={`text-[7px] font-bold text-white px-1 py-0.5 rounded shadow-sm ${bwHoliday ? 'bg-orange-400' : 'bg-orange-300'}`}>
                                                        BW
                                                    </span>
                                                )}
                                                {(rpHoliday || isRpSchool) && (
                                                    <span className={`text-[7px] font-bold text-white px-1 py-0.5 rounded shadow-sm ${rpHoliday ? 'bg-blue-400' : 'bg-blue-300'}`}>
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
            </div >

            {/* Availability Edit Modal */}
            {
                editingDate && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1D0B40]/70 backdrop-blur-lg">
                        <div className="bg-white rounded-3xl w-full max-w-[32rem] shadow-2xl p-6 animate-in zoom-in duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-slate-800">
                                    Verfügbarkeit für {format(new Date(editingDate), 'dd. MMMM yyyy', { locale: de })}
                                </h3>
                                <button onClick={() => setEditingDate(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Ganztägig Section */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        Ganztägig
                                    </label>
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setTempStatus('unavailable_full')}
                                                className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all ${tempStatus === 'unavailable_full'
                                                    ? 'border-[#4B2C82] bg-purple-50/50 text-[#4B2C82]'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                                    }`}
                                            >
                                                <span className="font-bold text-[15px] whitespace-nowrap">Abwesend (ganzer Tag)</span>
                                            </button>
                                            <button
                                                onClick={() => setTempStatus('vacation')}
                                                className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all ${tempStatus === 'vacation'
                                                    ? 'border-[#4B2C82] bg-purple-50/50 text-[#4B2C82]'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                                    }`}
                                            >
                                                <span className="font-bold text-[15px] whitespace-nowrap">Urlaub</span>
                                            </button>
                                        </div>

                                        {(tempStatus === 'unavailable_full' || tempStatus === 'vacation') && (
                                            <div
                                                className="space-y-4"
                                                style={{
                                                    transform: tempStatus === 'vacation' ? 'translateX(calc(100% + 8px))' : 'translateX(0%)',
                                                    transition: 'transform 0.8s cubic-bezier(0.07, 0.95, 0.1, 1.0)',
                                                    width: 'calc(50% - 4px)',
                                                }}
                                            >
                                                {/* Bis Datum */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center">
                                                        <span className="text-xs font-bold text-slate-400">bis</span>
                                                    </div>
                                                    <div className={`relative w-[140px] rounded-xl border-2 transition-all ${rangeEndDate ? 'border-[#4B2C82] bg-purple-50/50' : 'border-slate-100 bg-slate-50'}`}>
                                                        <input
                                                            type="date"
                                                            min={editingDate}
                                                            value={rangeEndDate}
                                                            placeholder="--.--.----"
                                                            onChange={(e) => {
                                                                setRangeEndDate(e.target.value);
                                                                if (e.target.value && (tempStatus === 'available' || tempStatus === 'unavailable_from' || tempStatus === 'unavailable_until')) {
                                                                    setTempStatus('unavailable_full');
                                                                }
                                                            }}
                                                            className="w-full text-xs font-bold text-slate-600 bg-transparent px-3 py-2.5 focus:outline-none appearance-none cursor-pointer"
                                                        />
                                                    </div>
                                                </div>

                                                {/* wiederholen */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">wiederholen</label>
                                                    </div>
                                                    <div className="relative w-[140px]">
                                                        <div className={`rounded-xl border-2 transition-all ${recurrence !== 'none' ? 'border-[#4B2C82] bg-purple-50/50' : 'border-slate-100 bg-slate-50'}`}>
                                                            <select
                                                                value={recurrence}
                                                                onChange={(e) => setRecurrence(e.target.value as any)}
                                                                className="w-full pl-3 pr-8 py-2.5 bg-transparent outline-none font-bold text-xs text-slate-600 appearance-none cursor-pointer"
                                                            >
                                                                <option value="none">Keine</option>
                                                                <option value="weekly">Wöchentlich</option>
                                                                <option value="monthly" disabled={!isMonthlyPossible(editingDate)}>Monatlich</option>
                                                            </select>
                                                        </div>
                                                        {!isMonthlyPossible(editingDate) && (
                                                            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-amber-500" title="Nicht jeder Monat hat diesen Tag">
                                                                <AlertCircle size={12} />
                                                            </div>
                                                        )}
                                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                            <ChevronRight size={12} className="rotate-90" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 my-2"></div>

                                {/* Stundenweise Section */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        Stundenweise
                                    </label>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setTempStatus('unavailable_from')}
                                                className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all font-bold text-[15px] ${tempStatus === 'unavailable_from'
                                                    ? 'border-[#4B2C82] bg-purple-50/50 text-[#4B2C82]'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                                    }`}
                                            >
                                                Abwesend ab
                                            </button>
                                            <div className={`rounded-xl border-2 transition-all flex items-center w-[90px] ${tempStatus === 'unavailable_from' ? 'border-[#4B2C82] bg-purple-50/50' : 'border-slate-100 bg-slate-50'}`}>
                                                <input
                                                    type="time"
                                                    value={tempStatus === 'unavailable_from' ? tempTime : ''}
                                                    placeholder="--:--"
                                                    onKeyDown={(e) => {
                                                        if (/[0-9]/.test(e.key)) {
                                                            setTempStatus('unavailable_from');
                                                        }
                                                    }}
                                                    onInput={(e) => {
                                                        const val = (e.target as HTMLInputElement).value;
                                                        setTempTime(val);
                                                        if (val) setTempStatus('unavailable_from');
                                                    }}
                                                    className="w-full bg-transparent px-2 py-2.5 outline-none font-bold text-sm text-slate-600 cursor-pointer text-center"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setTempStatus('unavailable_until')}
                                                className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all font-bold text-[15px] ${tempStatus === 'unavailable_until'
                                                    ? 'border-[#4B2C82] bg-purple-50/50 text-[#4B2C82]'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                                    }`}
                                            >
                                                Abwesend bis
                                            </button>
                                            <div className={`rounded-xl border-2 transition-all flex items-center w-[90px] ${tempStatus === 'unavailable_until' ? 'border-[#4B2C82] bg-purple-50/50' : 'border-slate-100 bg-slate-50'}`}>
                                                <input
                                                    type="time"
                                                    value={tempStatus === 'unavailable_until' ? tempTime : ''}
                                                    placeholder="--:--"
                                                    onKeyDown={(e) => {
                                                        if (/[0-9]/.test(e.key)) {
                                                            setTempStatus('unavailable_until');
                                                        }
                                                    }}
                                                    onInput={(e) => {
                                                        const val = (e.target as HTMLInputElement).value;
                                                        setTempTime(val);
                                                        if (val) setTempStatus('unavailable_until');
                                                    }}
                                                    className="w-full bg-transparent px-2 py-2.5 outline-none font-bold text-sm text-slate-600 cursor-pointer text-center"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 my-1"></div>

                                {/* Kommentar */}
                                <div className="mt-4">
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value.slice(0, 500))}
                                        placeholder="Optionaler Kommentar..."
                                        maxLength={500}
                                        className="w-full min-h-[60px] p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#4B2C82] text-xs font-medium text-slate-600 resize-none transition-all"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 pt-4 border-t relative">
                                    <button
                                        onClick={() => { setEditingDate(null); setIsDeleting(false); }}
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

                                    {/* Delete Button - only if there is an existing availability */}
                                    {availability.has(editingDate) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsDeleting(true);
                                                setDeleteTimer(1);
                                            }}
                                            className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl font-bold transition-all flex items-center justify-center shrink-0 border border-red-100 shadow-sm"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}

                                    {/* Deletion Warning Overlay */}
                                    {isDeleting && (
                                        <div className="absolute inset-0 bg-white flex flex-col items-center justify-center animate-in slide-in-from-bottom-2 duration-300 z-50">
                                            <p className="text-[11px] font-bold text-slate-700 mb-2">
                                                Willst du den Eintrag am {format(new Date(editingDate), 'dd.MM.yyyy')} wirklich löschen?
                                            </p>
                                            <div className="flex gap-2 w-full">
                                                <button
                                                    onClick={() => setIsDeleting(false)}
                                                    className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
                                                >
                                                    Nein
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (deleteTimer === 0) {
                                                            onAvailabilityChange(editingDate, null);
                                                            setEditingDate(null);
                                                            setIsDeleting(false);
                                                        }
                                                    }}
                                                    disabled={deleteTimer > 0}
                                                    className={`flex-1 py-2 rounded-xl font-bold transition-all ${deleteTimer > 0
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                        : 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                                                        }`}
                                                >
                                                    {deleteTimer > 0 ? `Ja (${deleteTimer}s)` : 'Ja, löschen'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Bulk Blocking Modal */}
            {
                isBulkBlockingOpen && (
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
                )
            }
        </>
    );
};

export default AvailabilityCalendar;
