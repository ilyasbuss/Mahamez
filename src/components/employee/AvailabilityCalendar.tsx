import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isWeekend, startOfWeek, endOfWeek, addDays, getISOWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Ban, Clock, X, Plus, AlertCircle, Plane, MessageSquare, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { PartialAvailability, AvailabilityStatus, CalendarEvent } from '../../types';
import { holidayService, Holiday } from '../../services/HolidayService';
import { schoolHolidayService, SchoolHoliday } from '../../services/SchoolHolidayService';
import DatePickerPopup from './DatePickerPopup';

interface AvailabilityCalendarProps {
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    onMonthJump: (date: Date) => void;
    availability: Map<string, PartialAvailability>;
    onAvailabilityChange: (date: string, availability: PartialAvailability | null) => void;
    isSaving?: boolean;
    lastSaved?: Date | null;
    events?: CalendarEvent[];
    currentPlanId?: string;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
    currentMonth,
    onMonthChange,
    onMonthJump,
    availability,
    onAvailabilityChange,
    isSaving,
    lastSaved,
    events = [],
    currentPlanId,
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

    // Convert HH:MM time to percentage (0–100) along 48 half-hour slots.
    // Visual rounding to nearest half hour; exact time still shown as text.
    const timeToPercent = (time: string): number => {
        const [hStr, mStr] = time.split(':');
        const h = parseInt(hStr, 10) || 0;
        const m = parseInt(mStr, 10) || 0;
        const slot = Math.round((h * 60 + m) / 30);
        return Math.min(Math.max((slot / 48) * 100, 0), 100);
    };

    return (
        <>
            <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                {/* Calendar Header */}
                <div className="p-4 border-b flex items-center justify-between gap-4">
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
                                    size={1}
                                    style={{ maxHeight: '50vh' }}
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

                        {/* Bulk Blocking Button — original design */}
                        <button
                            onClick={() => setIsBulkBlockingOpen(true)}
                            className="p-1.5 bg-purple-50 hover:bg-purple-100 text-[#4B2C82] rounded-lg transition flex items-center gap-1.5 px-3"
                            title="Zeitraum blocken"
                        >
                            <Plus size={16} />
                            <span className="text-sm font-bold">Zeitraum blocken</span>
                        </button>
                    </div>

                    {/* Autosave indicator — original design */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                        {isSaving ? (
                            <>
                                <Loader2 size={13} className="text-[#4B2C82] animate-spin" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Speichere...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={13} className="text-emerald-500" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {lastSaved
                                        ? `Gespeichert ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                        : 'Alle Änderungen übernommen'}
                                </span>
                            </>
                        )}
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

                            // Block adjacency: connect only when time boundaries are continuous at midnight
                            // LEFT ends at 24:00: unavailable_full or unavailable_from (goes until end of day)
                            // RIGHT starts at 00:00: unavailable_full or unavailable_until (starts at beginning of day)
                            const leftEndsAtMidnight = (s?: string) => s === 'unavailable_full' || s === 'unavailable_from';
                            const rightStartsAtMidnight = (s?: string) => s === 'unavailable_full' || s === 'unavailable_until';
                            const isPrevInBlock = !isMonday && isUnavailable && !!prevAvail && leftEndsAtMidnight(prevAvail.status) && rightStartsAtMidnight(avail!.status) && avail!.status !== 'vacation' && prevAvail.status !== 'vacation' && addDays(day, -1) >= monthStart;
                            const isNextInBlock = !isSunday && isUnavailable && !!nextAvail && leftEndsAtMidnight(avail!.status) && rightStartsAtMidnight(nextAvail.status) && avail!.status !== 'vacation' && nextAvail.status !== 'vacation' && addDays(day, 1) <= monthEnd;

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => handleDayClick(day)}
                                    draggable={isCurrentMonth && isUnavailable}
                                    onDragStart={(e) => {
                                        if (isCurrentMonth && avail) {
                                            setDraggedAvailability(avail);
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
                                    className={`
                                        relative flex flex-col items-center border transition-all duration-200 py-4 px-2 min-h-[90px] rounded-xl
                                        ${!isCurrentMonth ? 'opacity-40 bg-slate-50/30 border-slate-200/60 hover:opacity-60' : ''}
                                        ${isCurrentMonth && isUnavailable && avail!.status === 'unavailable_full'
                                            ? 'border-red-300 bg-red-50/80'
                                            : isCurrentMonth && isUnavailable && avail!.status === 'vacation'
                                                ? 'border-blue-300 bg-blue-50/80'
                                                : isCurrentMonth && isUnavailable && (avail!.status === 'unavailable_from' || avail!.status === 'unavailable_until')
                                                    ? 'border-red-300 bg-white'
                                                    : isCurrentMonth && holidayData
                                                        ? 'bg-amber-50 border-orange-400/60 shadow-sm z-10'
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
                                    {/* Partial time coloring overlay — #fcf4f4 = same shade as full-day */}
                                    {isUnavailable && avail && avail.status === 'unavailable_from' && avail.time && (() => {
                                        const pct = timeToPercent(avail.time);
                                        return (
                                            <div
                                                className="absolute inset-0 pointer-events-none z-[1] rounded-xl"
                                                style={{ background: `linear-gradient(to right, transparent ${pct}%, #fcf4f4 ${pct}%)` }}
                                            />
                                        );
                                    })()}
                                    {isUnavailable && avail && avail.status === 'unavailable_until' && avail.time && (() => {
                                        const pct = timeToPercent(avail.time);
                                        return (
                                            <div
                                                className="absolute inset-0 pointer-events-none z-[1] rounded-xl"
                                                style={{ background: `linear-gradient(to right, #fcf4f4 ${pct}%, transparent ${pct}%)` }}
                                            />
                                        );
                                    })()}

                                    {/* Merged Background Overlay (Backdrop) */}
                                    {isUnavailable && isCurrentMonth && (
                                        <>
                                            {isPrevInBlock && (
                                                <div className={`absolute top-3 bottom-3 -left-[7px] w-[7px] z-[-1] ${avail!.status === 'vacation' ? 'bg-blue-50/80' : 'bg-red-50/80'}`} />
                                            )}
                                            {isNextInBlock && (
                                                <div className={`absolute top-3 bottom-3 -right-[7px] w-[7px] z-[-1] ${avail!.status === 'vacation' ? 'bg-blue-50/80' : 'bg-red-50/80'}`} />
                                            )}
                                        </>
                                    )}

                                    {/* Event band — runs across top of cell */}
                                    {isCurrentMonth && (() => {
                                        const activeEvents = events.filter(ev =>
                                            (ev.planIds.length === 0 || (currentPlanId && ev.planIds.includes(currentPlanId))) &&
                                            dateStr >= ev.startDate && dateStr <= ev.endDate
                                        );
                                        if (activeEvents.length === 0) return null;
                                        const ev = activeEvents[0];
                                        const isFirstDayOfEvent = ev.startDate === dateStr;
                                        const isLastDayOfEvent = ev.endDate === dateStr;

                                        // Find visible days in current week to center text
                                        const weekStart = startOfWeek(day, { weekStartsOn: 1 });
                                        const currentWeekDays = [0, 1, 2, 3, 4, 5, 6].map(i => addDays(weekStart, i));
                                        const visibleEventDaysInWeek = currentWeekDays.filter(d => {
                                            const s = format(d, 'yyyy-MM-dd');
                                            return s >= ev.startDate && s <= ev.endDate;
                                        });
                                        const middleDay = visibleEventDaysInWeek[Math.floor(visibleEventDaysInWeek.length / 2)];
                                        const showName = isSameDay(day, middleDay);

                                        return (
                                            <div
                                                className={`absolute top-0 h-[18px] bg-[#4B2C82] flex items-center justify-center z-[25] overflow-visible ${isFirstDayOfEvent ? 'rounded-tl-xl left-0' : '-left-[4px] pl-[4px]'
                                                    } ${isLastDayOfEvent ? 'rounded-tr-xl right-0' : '-right-[4px] pr-[4px]'
                                                    }`}
                                            >
                                                {showName && (
                                                    <span className="text-[10px] font-bold text-white/90 truncate px-1 whitespace-nowrap">{ev.name}</span>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Monday KW Banner — pushed down if event band present */}
                                    {isMonday && isCurrentMonth && (() => {
                                        const hasEvent = events.some(ev =>
                                            (ev.planIds.length === 0 || (currentPlanId && ev.planIds.includes(currentPlanId))) &&
                                            dateStr >= ev.startDate && dateStr <= ev.endDate
                                        );
                                        return (
                                            <div className={`absolute ${hasEvent ? 'top-[18px] rounded-br-lg' : 'top-0 rounded-tl-xl rounded-br-lg'} left-0 bg-[#1D0B40] text-white text-[8px] font-bold px-1.5 py-0.5 shadow-sm z-[26]`}>
                                                KW {getISOWeek(day)}
                                            </div>
                                        );
                                    })()}

                                    {/* Holiday Name — anchored bottom-left above day number */}
                                    {holidayData && isCurrentMonth && (
                                        <div className="absolute bottom-7 left-2 right-2 z-10">
                                            <span className="text-[9px] font-bold text-orange-800/80 leading-tight line-clamp-2 block">
                                                {holidayData.name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Large centered Ban icon for full-day absence */}
                                    {isUnavailable && avail && avail.status === 'unavailable_full' && (
                                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                            <Ban size={isCurrentMonth ? 48 : 28} className="text-red-500 opacity-80" strokeWidth={1.5} />
                                        </div>
                                    )}

                                    {/* Large centered Plane icon for vacation */}
                                    {isUnavailable && avail && avail.status === 'vacation' && (
                                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                            <Plane size={isCurrentMonth ? 48 : 28} className="text-blue-500 opacity-80" strokeWidth={1.5} />
                                        </div>
                                    )}

                                    {/* Hourly status (small, with time) */}
                                    {isUnavailable && avail && (avail.status === 'unavailable_from' || avail.status === 'unavailable_until') && (
                                        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                                            <Clock size={isCurrentMonth ? 16 : 12} className="text-red-400" />
                                            {avail.time && (
                                                <span className={`font-bold mt-0.5 text-slate-600 ${isCurrentMonth ? 'text-[11px]' : 'text-[9px]'}`}>{avail.time}</span>
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
                                    {(bwHoliday || rpHoliday || isBwSchool || isRpSchool) && isCurrentMonth && (() => {
                                        const hasEvent = events && events.some(ev =>
                                            (ev.planIds.length === 0 || (currentPlanId && ev.planIds.includes(currentPlanId))) &&
                                            dateStr >= ev.startDate && dateStr <= ev.endDate
                                        );
                                        return (
                                            <div className={`absolute ${hasEvent ? 'top-[20px]' : 'top-1'} right-1.5 z-20 transition-all`}>
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
                                        );
                                    })()}
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

                            <div className="space-y-5">
                                {/* Von + Erster Tag */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Von</label>
                                    <DatePickerPopup
                                        value={bulkStartDate}
                                        onChange={setBulkStartDate}
                                        placeholder="Startdatum wählen"
                                    />
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Erster Tag</label>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setBulkFirstDayType('full')}
                                                className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all font-bold text-[15px] ${bulkFirstDayType === 'full'
                                                    ? 'border-[#4B2C82] bg-purple-50/50 text-[#4B2C82]'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                                    }`}
                                            >
                                                Ganzer Tag
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setBulkFirstDayType('from')}
                                                className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all font-bold text-[15px] ${bulkFirstDayType === 'from'
                                                    ? 'border-[#4B2C82] bg-purple-50/50 text-[#4B2C82]'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                                    }`}
                                            >
                                                Abwesend ab
                                            </button>
                                            <div className={`rounded-xl border-2 transition-all flex items-center w-[90px] ${bulkFirstDayType === 'from' ? 'border-[#4B2C82] bg-purple-50/50' : 'border-slate-100 bg-slate-50'
                                                }`}>
                                                <input
                                                    type="time"
                                                    value={bulkFirstDayTime}
                                                    placeholder="--:--"
                                                    onChange={(e) => {
                                                        setBulkFirstDayTime(e.target.value);
                                                        if (e.target.value) setBulkFirstDayType('from');
                                                    }}
                                                    className="w-full bg-transparent px-2 py-2.5 outline-none font-bold text-sm text-slate-600 cursor-pointer text-center"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setBulkFirstDayType('until')}
                                                className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all font-bold text-[15px] ${bulkFirstDayType === 'until'
                                                    ? 'border-[#4B2C82] bg-purple-50/50 text-[#4B2C82]'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                                    }`}
                                            >
                                                Abwesend bis
                                            </button>
                                            <div className={`rounded-xl border-2 transition-all flex items-center w-[90px] ${bulkFirstDayType === 'until' ? 'border-[#4B2C82] bg-purple-50/50' : 'border-slate-100 bg-slate-50'
                                                }`}>
                                                <input
                                                    type="time"
                                                    value={bulkFirstDayTime}
                                                    placeholder="--:--"
                                                    onChange={(e) => {
                                                        setBulkFirstDayTime(e.target.value);
                                                        if (e.target.value) setBulkFirstDayType('until');
                                                    }}
                                                    className="w-full bg-transparent px-2 py-2.5 outline-none font-bold text-sm text-slate-600 cursor-pointer text-center"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100" />

                                {/* Bis + Letzter Tag */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bis</label>
                                    <DatePickerPopup
                                        value={bulkEndDate}
                                        onChange={setBulkEndDate}
                                        min={bulkStartDate || undefined}
                                        placeholder="Enddatum wählen"
                                    />
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Letzter Tag</label>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setBulkLastDayType('full')}
                                                className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all font-bold text-[15px] ${bulkLastDayType === 'full'
                                                    ? 'border-[#4B2C82] bg-purple-50/50 text-[#4B2C82]'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                                    }`}
                                            >
                                                Ganzer Tag
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setBulkLastDayType('from')}
                                                className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all font-bold text-[15px] ${bulkLastDayType === 'from'
                                                    ? 'border-[#4B2C82] bg-purple-50/50 text-[#4B2C82]'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                                    }`}
                                            >
                                                Abwesend ab
                                            </button>
                                            <div className={`rounded-xl border-2 transition-all flex items-center w-[90px] ${bulkLastDayType === 'from' ? 'border-[#4B2C82] bg-purple-50/50' : 'border-slate-100 bg-slate-50'
                                                }`}>
                                                <input
                                                    type="time"
                                                    value={bulkLastDayTime}
                                                    placeholder="--:--"
                                                    onChange={(e) => {
                                                        setBulkLastDayTime(e.target.value);
                                                        if (e.target.value) setBulkLastDayType('from');
                                                    }}
                                                    className="w-full bg-transparent px-2 py-2.5 outline-none font-bold text-sm text-slate-600 cursor-pointer text-center"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setBulkLastDayType('until')}
                                                className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all font-bold text-[15px] ${bulkLastDayType === 'until'
                                                    ? 'border-[#4B2C82] bg-purple-50/50 text-[#4B2C82]'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                                    }`}
                                            >
                                                Abwesend bis
                                            </button>
                                            <div className={`rounded-xl border-2 transition-all flex items-center w-[90px] ${bulkLastDayType === 'until' ? 'border-[#4B2C82] bg-purple-50/50' : 'border-slate-100 bg-slate-50'
                                                }`}>
                                                <input
                                                    type="time"
                                                    value={bulkLastDayTime}
                                                    placeholder="--:--"
                                                    onChange={(e) => {
                                                        setBulkLastDayTime(e.target.value);
                                                        if (e.target.value) setBulkLastDayType('until');
                                                    }}
                                                    className="w-full bg-transparent px-2 py-2.5 outline-none font-bold text-sm text-slate-600 cursor-pointer text-center"
                                                />
                                            </div>
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
