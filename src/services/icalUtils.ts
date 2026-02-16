export interface ICalEvent {
    start: Date;
    end: Date;
    summary: string;
    description?: string;
    location?: string;
}

export const generateICalContent = (events: ICalEvent[]): string => {
    const formatDate = (date: Date): string => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    let ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Mahamez//Schedule//DE',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ];

    events.forEach(event => {
        ics.push('BEGIN:VEVENT');
        ics.push(`DTSTART:${formatDate(event.start)}`);
        ics.push(`DTEND:${formatDate(event.end)}`);
        ics.push(`SUMMARY:${event.summary}`);
        if (event.description) ics.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`);
        if (event.location) ics.push(`LOCATION:${event.location}`);
        ics.push(`UID:${Date.now()}-${Math.random().toString(36).substring(2)}@mahamez.swr.de`);
        ics.push(`DTSTAMP:${formatDate(new Date())}`);
        ics.push('END:VEVENT');
    });

    ics.push('END:VCALENDAR');

    return ics.join('\r\n');
};

export const downloadICalFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
