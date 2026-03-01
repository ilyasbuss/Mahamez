import { format } from 'date-fns';

export interface SchoolHoliday {
    id: string;
    startDate: string;
    endDate: string;
    name: string;
    subdivisionCode: string;
}

class SchoolHolidayService {
    // Cache by combination of year and subdivision (e.g., "2026-DE-BW")
    private memoryCache: Map<string, SchoolHoliday[]> = new Map();

    async getSchoolHolidays(date: Date, state: 'BW' | 'RP'): Promise<SchoolHoliday[]> {
        const year = date.getFullYear();
        const subdivisionCode = `DE-${state}`;
        const cacheKey = `${year}-${subdivisionCode}`;
        const monthPrefix = format(date, 'yyyy-MM');

        // 1. Check in-memory first
        if (this.memoryCache.has(cacheKey)) {
            return this.memoryCache.get(cacheKey)!;
        }

        // 2. Check localStorage
        const storageKey = `school_holidays_v2_${cacheKey}`;
        const cached = localStorage.getItem(storageKey);
        if (cached) {
            const holidays: SchoolHoliday[] = JSON.parse(cached);
            this.memoryCache.set(cacheKey, holidays);
            return holidays;
        }

        // 3. Fetch from OpenHolidays API
        try {
            const validFrom = `${year}-01-01`;
            const validTo = `${year}-12-31`;
            const url = `https://openholidaysapi.org/SchoolHolidays?countryIsoCode=DE&languageIsoCode=DE&validFrom=${validFrom}&validTo=${validTo}&subdivisionCode=${subdivisionCode}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch school holidays');

            const data = await response.json();
            const holidays: SchoolHoliday[] = data.map((item: any) => ({
                id: item.id,
                startDate: item.startDate,
                endDate: item.endDate,
                name: item.name && item.name[0] ? item.name[0].text : 'Ferien',
                subdivisionCode: item.subdivisions && item.subdivisions[0] ? item.subdivisions[0].code : ''
            }));

            this.memoryCache.set(cacheKey, holidays);
            localStorage.setItem(storageKey, JSON.stringify(holidays));
            return holidays;
        } catch (error) {
            console.error('Error fetching school holidays:', error);
            return [];
        }
    }
}

export const schoolHolidayService = new SchoolHolidayService();
