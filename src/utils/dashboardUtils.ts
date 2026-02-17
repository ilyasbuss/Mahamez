import { SkillAssignment } from '../types';

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
