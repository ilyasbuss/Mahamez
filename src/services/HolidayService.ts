import { format } from 'date-fns';

export interface Holiday {
    date: string;
    name: string;
    states: string[];
}

class HolidayService {
    // In-memory cache so we don't hit localStorage repeatedly within a session
    private memoryCache: Map<number, Holiday[]> = new Map();

    async getHolidays(date: Date): Promise<Holiday[]> {
        const year = date.getFullYear();
        const monthPrefix = format(date, 'yyyy-MM');

        // 1. Check in-memory first
        if (this.memoryCache.has(year)) {
            return this.memoryCache.get(year)!;
        }

        // 2. Check localStorage
        const cacheKey = `holidays_v2_${year}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const holidays: Holiday[] = JSON.parse(cached);
            this.memoryCache.set(year, holidays);
            return holidays;
        }

        // 3. Fetch from API (once per year)
        try {
            const response = await fetch(`https://get.api-feiertage.de?states=bw,rp&year=${year}`);
            if (!response.ok) throw new Error('Failed to fetch holidays');

            const data = await response.json();
            const holidays: Holiday[] = [];

            if (data && data.status === 'success' && Array.isArray(data.feiertage)) {
                data.feiertage.forEach((item: any) => {
                    const states: string[] = [];
                    if (item.all_states === '1') {
                        states.push('ALL');
                    } else {
                        if (item.bw === '1') states.push('BW');
                        if (item.rp === '1') states.push('RP');
                    }

                    holidays.push({
                        date: item.date,
                        name: item.fname || item.name || 'Feiertag',
                        states: states
                    });
                });
            }

            this.memoryCache.set(year, holidays);
            localStorage.setItem(cacheKey, JSON.stringify(holidays));
            return holidays;
        } catch (error) {
            console.error('Error fetching holidays:', error);
            return [];
        }
    }
}

export const holidayService = new HolidayService();
