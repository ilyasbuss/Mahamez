import React, { useState, useRef, useEffect } from 'react';
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    startOfWeek, endOfWeek, addMonths, subMonths,
    isToday, isSameDay, parseISO
} from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerPopupProps {
    value: string;       // "YYYY-MM-DD" or ""
    onChange: (date: string) => void;
    min?: string;        // "YYYY-MM-DD" – earlier dates are disabled
    placeholder?: string;
}

const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const DatePickerPopup: React.FC<DatePickerPopupProps> = ({
    value,
    onChange,
    min,
    placeholder = 'Datum wählen',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewMonth, setViewMonth] = useState<Date>(() => {
        if (value) return startOfMonth(parseISO(value));
        if (min) return startOfMonth(parseISO(min));
        return startOfMonth(new Date());
    });
    const containerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    const selectedDate = value ? parseISO(value) : null;
    const minDate = min ? parseISO(min) : null;

    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calStart, end: calEnd });

    const handleSelect = (day: Date) => {
        if (minDate && day < minDate) return;
        onChange(format(day, 'yyyy-MM-dd'));
        // If clicking a day from an adjacent month, navigate to it
        if (day.getMonth() !== viewMonth.getMonth() || day.getFullYear() !== viewMonth.getFullYear()) {
            setViewMonth(startOfMonth(day));
        }
        setIsOpen(false);
    };

    const displayValue = selectedDate
        ? format(selectedDate, 'dd. MMMM yyyy', { locale: de })
        : placeholder;

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-medium text-left transition-all duration-200 ${isOpen
                    ? 'border-[#4B2C82] bg-purple-50/40'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    } ${selectedDate ? 'text-slate-800' : 'text-slate-400'}`}
            >
                <Calendar size={16} className={isOpen ? 'text-[#4B2C82]' : 'text-slate-400'} />
                <span className="text-[15px] font-bold">{displayValue}</span>
            </button>

            {/* Popup */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-[300] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-top-1 duration-150 origin-top">
                    {/* Month nav header */}
                    <div className="flex items-center justify-between px-3 py-2.5 bg-[#1D0B40]">
                        <button
                            type="button"
                            onClick={() => setViewMonth(prev => subMonths(prev, 1))}
                            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-bold text-white capitalize select-none">
                            {format(viewMonth, 'MMMM yyyy', { locale: de })}
                        </span>
                        <button
                            type="button"
                            onClick={() => setViewMonth(prev => addMonths(prev, 1))}
                            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Weekday labels */}
                    <div className="grid grid-cols-7 px-2 pt-2.5 pb-1">
                        {WEEKDAY_LABELS.map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-slate-400 pb-1">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day grid */}
                    <div className="grid grid-cols-7 gap-y-0.5 px-2 pb-3">
                        {days.map(day => {
                            const inCurrentMonth = day.getMonth() === viewMonth.getMonth();
                            const selected = selectedDate ? isSameDay(day, selectedDate) : false;
                            const disabled = !!(minDate && day < minDate);
                            const todayDay = isToday(day);
                            const weekend = day.getDay() === 0 || day.getDay() === 6;

                            return (
                                <button
                                    key={day.toISOString()}
                                    type="button"
                                    onClick={() => handleSelect(day)}
                                    disabled={disabled}
                                    className={`
                                        relative flex items-center justify-center h-8 rounded-lg text-[13px] font-bold transition-all duration-100
                                        ${!inCurrentMonth ? 'opacity-30' : ''}
                                        ${selected
                                            ? 'bg-[#4B2C82] text-white shadow-md shadow-purple-900/20'
                                            : disabled
                                                ? 'text-slate-300 cursor-not-allowed'
                                                : weekend
                                                    ? 'text-purple-400 hover:bg-purple-50'
                                                    : 'text-slate-700 hover:bg-purple-50 hover:text-[#4B2C82]'
                                        }
                                    `}
                                >
                                    {format(day, 'd')}
                                    {todayDay && !selected && (
                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#4B2C82]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePickerPopup;
