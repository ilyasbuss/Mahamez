import { format, startOfMonth } from 'date-fns';

export interface Holiday {
    date: string;
    name: string;
    states: string[];
}

class HolidayService {
    private cache: Map<string, Holiday[]> = new Map();

    async getHolidays(date: Date): Promise<Holiday[]> {
        const monthKey = format(startOfMonth(date), 'yyyy-MM');
        
        // Check localStorage first
        const cached = localStorage.getItem(`holidays_${monthKey}`);
        if (cached) {
            return JSON.parse(cached);
        }

        try {
            // Fetch from API
            const year = date.getFullYear();
            const response = await fetch(`https://get.api-feiertage.de?states=bw,rp&year=${year}`);
            if (!response.ok) throw new Error('Failed to fetch holidays');
            
            const data = await response.json();
            
            // The API structure for get.api-feiertage.de usually returns an object with dates as keys
            // or a list. Let's assume it's an object where keys are dates.
            // Actually, looking at common holiday APIs, they often return { "2026-01-01": { "fname": "Neujahr", ... } }
            
            const holidays: Holiday[] = [];
            
            if (data && typeof data === 'object') {
                Object.entries(data).forEach(([date, details]: [string, any]) => {
                    holidays.push({
                        date,
                        name: details.fname || details.name || 'Feiertag',
                        states: details.states || ['BW', 'RP']
                    });
                });
            }

            localStorage.setItem(`holidays_${monthKey}`, JSON.stringify(holidays));
            return holidays;
        } catch (error) {
            console.error('Error fetching holidays:', error);
            return [];
        }
    }
}

export const holidayService = new HolidayService();
