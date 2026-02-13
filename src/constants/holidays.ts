// Holiday data for Baden-Württemberg (BW) and Rheinland-Pfalz (RP)
// All German public holidays for 2026

export interface Holiday {
    date: string; // YYYY-MM-DD format
    name: string;
    states: ('BW' | 'RP' | 'ALL')[]; // ALL means nationwide
}

export const HOLIDAYS_2026: Holiday[] = [
    // Nationwide holidays
    { date: '2026-01-01', name: 'Neujahr', states: ['ALL'] },
    { date: '2026-04-03', name: 'Karfreitag', states: ['ALL'] },
    { date: '2026-04-06', name: 'Ostermontag', states: ['ALL'] },
    { date: '2026-05-01', name: 'Tag der Arbeit', states: ['ALL'] },
    { date: '2026-05-14', name: 'Christi Himmelfahrt', states: ['ALL'] },
    { date: '2026-05-25', name: 'Pfingstmontag', states: ['ALL'] },
    { date: '2026-10-03', name: 'Tag der Deutschen Einheit', states: ['ALL'] },
    { date: '2026-12-25', name: '1. Weihnachtstag', states: ['ALL'] },
    { date: '2026-12-26', name: '2. Weihnachtstag', states: ['ALL'] },

    // Baden-Württemberg only
    { date: '2026-01-06', name: 'Heilige Drei Könige', states: ['BW'] },

    // BW and RP
    { date: '2026-06-04', name: 'Fronleichnam', states: ['BW', 'RP'] },
    { date: '2026-11-01', name: 'Allerheiligen', states: ['BW', 'RP'] },
];

export interface SchoolHoliday {
    start: string;
    end: string;
    name: string;
    state: 'BW' | 'RP';
}

export const SCHOOL_HOLIDAYS_2026: SchoolHoliday[] = [
    // Baden-Württemberg
    { start: '2026-03-30', end: '2026-04-11', name: 'Osterferien', state: 'BW' },
    { start: '2026-05-26', end: '2026-06-05', name: 'Pfingstferien', state: 'BW' },
    { start: '2026-07-30', end: '2026-09-12', name: 'Sommerferien', state: 'BW' },
    { start: '2026-10-26', end: '2026-10-31', name: 'Herbstferien', state: 'BW' },
    { start: '2026-12-23', end: '2026-12-31', name: 'Weihnachtsferien', state: 'BW' }, // Ends 2027, but capping here

    // Rheinland-Pfalz
    { start: '2026-03-30', end: '2026-04-10', name: 'Osterferien', state: 'RP' },
    { start: '2026-06-29', end: '2026-08-07', name: 'Sommerferien', state: 'RP' },
    { start: '2026-10-05', end: '2026-10-16', name: 'Herbstferien', state: 'RP' },
    { start: '2026-12-23', end: '2026-12-31', name: 'Weihnachtsferien', state: 'RP' }, // Ends 2027
];

// Helper function to check if a date is a holiday in a specific state
export const isHoliday = (date: string, state: 'BW' | 'RP'): Holiday | null => {
    const holiday = HOLIDAYS_2026.find(
        h => h.date === date && (h.states.includes(state) || h.states.includes('ALL'))
    );
    return holiday || null;
};

// Helper function for school holidays
export const isSchoolHoliday = (date: string, state: 'BW' | 'RP'): boolean => {
    return SCHOOL_HOLIDAYS_2026.some(sh => {
        if (sh.state !== state) return false;
        return date >= sh.start && date <= sh.end;
    });
};

// Get holiday display text for a date (e.g., "BW, RP" or "BW")
export const getHolidayStates = (date: string): string | null => {
    const bwHoliday = isHoliday(date, 'BW');
    const rpHoliday = isHoliday(date, 'RP');

    if (bwHoliday && rpHoliday) {
        return 'BW, RP';
    } else if (bwHoliday) {
        return 'BW';
    } else if (rpHoliday) {
        return 'RP';
    }
    return null;
};
