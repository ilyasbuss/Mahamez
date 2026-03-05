import { SkillAssignment, Employee } from '../types';

export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const validatePercentageSum = (assignments: SkillAssignment[] | undefined): boolean => {
    if (!assignments || assignments.length === 0) return true;
    const sum = assignments.reduce((acc, curr) => acc + curr.percentage, 0);
    return Math.abs(sum - 100) < 0.01;
};

export const getPriorityColor = (prio: number) => {
    switch (prio) {
        case 1: return '#ef4444';
        case 2: return '#f97316';
        case 3: return '#3b82f6';
        case 4: return '#94a3b8';
        default: return '#cbd5e1';
    }
};

export const formatEmployeeName = (name: string, allEmployees: Pick<Employee, 'name'>[]): string => {
    const parts = name.trim().split(' ');
    if (parts.length < 2) return name;

    const lastName = parts[parts.length - 1];
    const hasDuplicateLastName = allEmployees.some(emp => {
        if (emp.name === name) return false;
        const empParts = emp.name.trim().split(' ');
        if (empParts.length < 2) return false;
        return empParts[empParts.length - 1] === lastName;
    });

    if (hasDuplicateLastName) {
        const firstInitial = parts[0].charAt(0);
        return `${firstInitial}. ${lastName}`;
    }

    return name;
};
export const isEmployeeAvailable = (employee: Employee, date: string): boolean => {
    if (!employee.absences || employee.absences.length === 0) return true;

    return !employee.absences.some(abs => {
        const start = abs.start;
        const end = abs.end;

        if (end === 'open') {
            return date >= start;
        }

        return date >= start && date <= end;
    });
};
