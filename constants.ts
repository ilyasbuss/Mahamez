
import { Employee, ShiftType, ShiftTypeID } from './types';

export const SHIFT_TYPES: Record<ShiftTypeID, ShiftType> = {
  MORNING: {
    id: 'MORNING',
    label: 'Frühdienst',
    startTime: '06:00',
    endTime: '14:00',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    requiredSkills: ['Mod Morningshow']
  },
  LATE: {
    id: 'LATE',
    label: 'Spätdienst',
    startTime: '13:30',
    endTime: '21:30',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    requiredSkills: ['Mod POP']
  },
  NIGHT: {
    id: 'NIGHT',
    label: 'Nachtdienst',
    startTime: '21:00',
    endTime: '06:30',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    requiredSkills: ['Aktuell Redakteur Nacht']
  },
  WEEKEND_DAY: {
    id: 'WEEKEND_DAY',
    label: 'Wochenendtag',
    startTime: '08:00',
    endTime: '18:00',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    requiredSkills: ['Mod NOW']
  }
};

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Sabrina Kemmer',
    role: 'Festangestellt (unbefristet)',
    departments: ['Radio-Redaktion'],
    skillAssignments: [
      { skill: 'Mod Morningshow', percentage: 50, priority: 1 },
      { skill: 'Redakteur 1 Morningshow', percentage: 50, priority: 2 }
    ],
    maxHoursPerWeek: 40,
    contractHours: 100,
    preferredShifts: ['MORNING'],
    unavailability: []
  },
  {
    id: '2',
    name: 'Joost Schmidt',
    role: 'Frei (unbefristet)',
    departments: ['Radio-Redaktion', 'Online-Redaktion'],
    skillAssignments: [
      { skill: 'Aktuell Redakteur Nacht', percentage: 100, priority: 1 }
    ],
    maxHoursPerWeek: 35,
    contractHours: 4,
    preferredShifts: ['NIGHT'],
    unavailability: []
  },
  {
    id: '3',
    name: 'Vanessa Auer',
    role: 'Festangestellt (befristet)',
    departments: ['Radio-Redaktion', 'Online-Redaktion'],
    skillAssignments: [
      { skill: 'Redakteur PUSH', percentage: 50, priority: 1 },
      { skill: 'Reporter Elchbus', percentage: 50, priority: 2 }
    ],
    maxHoursPerWeek: 40,
    contractHours: 100,
    preferredShifts: ['MORNING', 'LATE'],
    unavailability: []
  }
];
