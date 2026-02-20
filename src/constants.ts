
import { Employee, ShiftType, ShiftTypeID, SkillGroup, Redaktion } from './types';

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
    role: 'fest frei, unbefristet',
    departments: ['Radio-Redaktion', 'Online-Redaktion'],
    skillAssignments: [
      { skill: 'Redakteur PUSH', percentage: 50, priority: 1 },
      { skill: 'Reporter Elchbus', percentage: 50, priority: 2 }
    ],
    maxHoursPerWeek: 40,
    contractHours: 100,
    preferredShifts: ['MORNING', 'LATE'],
    unavailability: []
  },
  {
    id: '4',
    name: 'Steffen Auer',
    role: 'Frei (unbefristet)',
    departments: ['Radio-Redaktion'],
    skillAssignments: [{ skill: 'Redakteur Comedy', percentage: 100, priority: 2 }],
    maxHoursPerWeek: 40,
    contractHours: 4,
    preferredShifts: [],
    unavailability: []
  },
  {
    id: '5',
    name: 'Stefan Hoyer',
    role: 'Festangestellt (unbefristet)',
    departments: ['Radio-Redaktion'],
    skillAssignments: [
      { skill: 'Radio-Layout', percentage: 9, priority: 1 },
      { skill: 'Käpt’n', percentage: 9, priority: 2 },
      { skill: 'Käpt’n Future', percentage: 9, priority: 3 },
      { skill: 'Anchor 1', percentage: 9, priority: 2 },
      { skill: 'Anchor 2', percentage: 9, priority: 2 },
      { skill: 'Aktuell Redakteur Tag', percentage: 9, priority: 2 },
      { skill: 'Aktuell Redakteur Abend', percentage: 9, priority: 2 },
      { skill: 'Aktuell Redakteur Nacht', percentage: 9, priority: 2 },
      { skill: 'News 1', percentage: 9, priority: 1 },
      { skill: 'News 2', percentage: 9, priority: 1 },
      { skill: 'Regio Ticker', percentage: 10, priority: 2 }
    ],
    maxHoursPerWeek: 40,
    contractHours: 100,
    preferredShifts: [],
    unavailability: []
  },
  {
    id: '6',
    name: 'Manuela Rid',
    role: 'Festangestellt (unbefristet)',
    departments: ['Radio-Redaktion'],
    skillAssignments: [
      { skill: 'Radio-Layout', percentage: 11, priority: 1 },
      { skill: 'News 1', percentage: 11, priority: 1 },
      { skill: 'News 2', percentage: 11, priority: 1 },
      { skill: 'Anchor 1', percentage: 11, priority: 2 },
      { skill: 'Anchor 2', percentage: 11, priority: 2 },
      { skill: 'Aktuell Redakteur Tag', percentage: 11, priority: 2 },
      { skill: 'Aktuell Redakteur Abend', percentage: 11, priority: 2 },
      { skill: 'Aktuell Redakteur Nacht', percentage: 11, priority: 2 },
      { skill: 'Käpt’n Future', percentage: 12, priority: 3 }
    ],
    maxHoursPerWeek: 40,
    contractHours: 100,
    preferredShifts: [],
    unavailability: []
  },
  {
    id: '7',
    name: 'Kristof Kien',
    role: 'Festangestellt (unbefristet)',
    departments: ['Radio-Redaktion'],
    skillAssignments: [
      { skill: 'Radio-Layout', percentage: 8, priority: 1 },
      { skill: 'News 1', percentage: 8, priority: 1 },
      { skill: 'News 2', percentage: 8, priority: 1 },
      { skill: 'Anchor 1', percentage: 8, priority: 2 },
      { skill: 'Anchor 2', percentage: 8, priority: 2 },
      { skill: 'Käpt’n', percentage: 8, priority: 2 },
      { skill: 'Käpt’n Future', percentage: 8, priority: 3 },
      { skill: 'Redakteur NOW', percentage: 9, priority: 2 },
      { skill: 'Redakteur PUSH', percentage: 9, priority: 2 },
      { skill: 'Redakteur MOVE', percentage: 9, priority: 2 },
      { skill: 'Redakteur 1 Morningshow', percentage: 9, priority: 2 },
      { skill: 'Redakteur 2 Morningshow', percentage: 8, priority: 2 }
    ],
    maxHoursPerWeek: 40,
    contractHours: 100,
    preferredShifts: [],
    unavailability: []
  },
  {
    id: '8',
    name: 'Lisa Reister',
    role: 'Frei (befristet)',
    departments: ['Radio-Redaktion'],
    skillAssignments: [
      { skill: 'Anchor 1', percentage: 14, priority: 2 },
      { skill: 'Anchor 2', percentage: 14, priority: 2 },
      { skill: 'Aktuell Redakteur Tag', percentage: 14, priority: 2 },
      { skill: 'Aktuell Redakteur Abend', percentage: 14, priority: 2 },
      { skill: 'Aktuell Redakteur Nacht', percentage: 14, priority: 2 },
      { skill: 'Redakteur 1 Morningshow', percentage: 15, priority: 2 },
      { skill: 'Redakteur 2 Morningshow', percentage: 15, priority: 2 }
    ],
    maxHoursPerWeek: 40,
    contractHours: 5,
    preferredShifts: [],
    unavailability: []
  },
  {
    id: '9',
    name: 'Dennis Tinat',
    role: 'Frei (unbefristet)',
    departments: ['Radio-Redaktion'],
    skillAssignments: [
      { skill: 'Mod POPNACHT', percentage: 50, priority: 1 },
      { skill: 'Mod NOW', percentage: 50, priority: 1 }
    ],
    maxHoursPerWeek: 40,
    contractHours: 4,
    preferredShifts: [],
    unavailability: []
  },
  {
    id: '10',
    name: 'Nicola Müntefering',
    role: 'Frei (unbefristet)',
    departments: ['Radio-Redaktion'],
    skillAssignments: [{ skill: 'Mod NOW', percentage: 100, priority: 1 }],
    maxHoursPerWeek: 40,
    contractHours: 4,
    preferredShifts: [],
    unavailability: []
  },
  {
    id: '11',
    name: 'Gregor Glöckner',
    role: 'Festangestellt (unbefristet)',
    departments: ['Radio-Redaktion'],
    skillAssignments: [
      { skill: 'Radio-Layout', percentage: 34, priority: 1 },
      { skill: 'Käpt’n', percentage: 33, priority: 2 },
      { skill: 'Käpt’n Future', percentage: 33, priority: 3 }
    ],
    maxHoursPerWeek: 40,
    contractHours: 100,
    preferredShifts: [],
    unavailability: []
  },
  {
    id: '12',
    name: 'Sebastian Müller',
    role: 'Frei (unbefristet)',
    departments: ['Radio-Redaktion'],
    skillAssignments: [{ skill: 'Mod PUSH', percentage: 100, priority: 1 }],
    maxHoursPerWeek: 40,
    contractHours: 4,
    preferredShifts: [],
    unavailability: []
  },
  {
    id: '13',
    name: 'Markus Barsch',
    role: 'Frei (unbefristet)',
    departments: ['Radio-Redaktion'],
    skillAssignments: [{ skill: 'Mod POP', percentage: 100, priority: 1 }],
    maxHoursPerWeek: 40,
    contractHours: 4,
    preferredShifts: [],
    unavailability: []
  },
  {
    id: '14',
    name: 'Michael Reufstek',
    role: 'Frei (unbefristet)',
    departments: ['Radio-Redaktion'],
    skillAssignments: [{ skill: 'Mod POP', percentage: 100, priority: 1 }],
    maxHoursPerWeek: 40,
    contractHours: 4,
    preferredShifts: [],
    unavailability: []
  },
  {
    id: '15',
    name: 'Constantin Zöller',
    role: 'Frei (unbefristet)',
    departments: ['Radio-Redaktion'],
    skillAssignments: [{ skill: 'Mod Morningshow', percentage: 100, priority: 1 }],
    maxHoursPerWeek: 40,
    contractHours: 4,
    preferredShifts: [],
    unavailability: []
  }
];

export const INITIAL_SKILL_GROUPS: SkillGroup[] = [
  {
    id: "g_layout_radio",
    title: "Radio Layout",
    roles: [
      { name: 'Radio-Layout', startTime: '08:00', endTime: '16:45', defaultPercentage: 100, defaultPriority: 1 },
      { name: 'Digital-Layout', startTime: '08:00', endTime: '16:45', defaultPercentage: 100, defaultPriority: 1 },
      { name: 'Musik-Layout', startTime: '08:00', endTime: '16:45', defaultPercentage: 100, defaultPriority: 1 },
      { name: 'Käpt’n', startTime: '08:00', endTime: '16:45', defaultPercentage: 100, defaultPriority: 2 }
    ],
    departments: ['Radio-Redaktion', 'Online-Redaktion']
  },
  {
    id: "g_news",
    title: "News & Aktuell",
    roles: [
      { name: 'News 1', startTime: '04:30', endTime: '10:15', defaultPercentage: 100, defaultPriority: 1 },
      { name: 'News 2', startTime: '09:45', endTime: '17:15', defaultPercentage: 100, defaultPriority: 1 },
      { name: 'Wetter', startTime: '05:00', endTime: '12:00', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Serviceteam/Verkehr', startTime: '05:30', endTime: '12:00', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Aktuell Redakteur Nacht', startTime: '00:00', endTime: '05:00', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Anchor 1', startTime: '06:00', endTime: '14:45', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Anchor 2', startTime: '10:00', endTime: '18:45', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Aktuell Redakteur Abend', startTime: '16:00', endTime: '00:00', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Regio Ticker', startTime: '08:00', endTime: '16:45', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Käpt’n Future', startTime: '08:30', endTime: '17:15', defaultPercentage: 100, defaultPriority: 3 }
    ],
    departments: ['Radio-Redaktion']
  },
  {
    id: "g_morningshow_red",
    title: "Redaktion Morningshow",
    roles: [
      { name: 'Redakteur 1 Morningshow', startTime: '08:30', endTime: '17:15', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Redakteur 2 Morningshow', startTime: '09:30', endTime: '18:15', defaultPercentage: 100, defaultPriority: 2 }
    ],
    departments: ['Radio-Redaktion']
  },
  {
    id: "g_moderation",
    title: "Moderation",
    roles: [
      { name: 'Mod POPNACHT', startTime: '00:00', endTime: '05:00', defaultPercentage: 100, defaultPriority: 1 },
      { name: 'Mod Morningshow', startTime: '04:30', endTime: '11:00', defaultPercentage: 100, defaultPriority: 1 },
      { name: 'Co-Mod Morningshow', startTime: '04:30', endTime: '11:00', defaultPercentage: 100, defaultPriority: 1 },
      { name: 'Producer Morningshow', startTime: '04:30', endTime: '10:30', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Mod NOW', startTime: '07:30', endTime: '16:15', defaultPercentage: 100, defaultPriority: 1 },
      { name: 'Redakteur NOW', startTime: '07:30', endTime: '16:15', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Mod PUSH', startTime: '08:30', endTime: '17:15', defaultPercentage: 100, defaultPriority: 1 },
      { name: 'Redakteur PUSH', startTime: '08:30', endTime: '17:15', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Mod MOVE', startTime: '11:15', endTime: '20:00', defaultPercentage: 100, defaultPriority: 1 },
      { name: 'Redakteur MOVE', startTime: '11:15', endTime: '20:00', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Redakteur POP', startTime: '14:30', endTime: '23:15', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Mod POP', startTime: '15:15', endTime: '00:00', defaultPercentage: 100, defaultPriority: 1 }
    ],
    departments: ['Radio-Redaktion']
  },
  {
    id: "g_comedy",
    title: "Comedy",
    roles: [
      { name: 'Redakteur Comedy', startTime: '09:00', endTime: '17:00', defaultPercentage: 100, defaultPriority: 2 }
    ],
    departments: ['Radio-Redaktion']
  },
  {
    id: "g_regional",
    title: "Regional",
    roles: [
      { name: 'Redakteur Stuttgart 1', startTime: '08:00', endTime: '16:45', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Redakteur Stuttgart 2', startTime: '08:00', endTime: '16:45', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Redakteur Mainz 1', startTime: '08:00', endTime: '16:45', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Redakteur Mainz 2', startTime: '08:00', endTime: '16:45', defaultPercentage: 100, defaultPriority: 2 }
    ],
    departments: ['Radio-Redaktion']
  },
  {
    id: "g_design_pa",
    title: "Programmaktion & Design",
    roles: [
      { name: 'Programmdesign', startTime: '08:00', endTime: '17:00', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Redakteur 1 PA', startTime: '09:00', endTime: '17:15', defaultPercentage: 100, defaultPriority: 2 },
      { name: 'Redakteur 2 PA', startTime: '09:00', endTime: '17:15', defaultPercentage: 100, defaultPriority: 2 }
    ],
    departments: ['Radio-Redaktion', 'Sounddesign']
  },
  {
    id: "g_qm",
    title: "Qualitätsmanagement",
    roles: [
      { name: 'Qualitätsmanagement', startTime: '09:00', endTime: '17:00', defaultPercentage: 100, defaultPriority: 2 }
    ],
    departments: ['Radio-Redaktion']
  },
  {
    id: "g_reporter",
    title: "Reporter",
    roles: [
      { name: 'Reporter Elchbus', startTime: '06:00', endTime: '18:00', defaultPercentage: 100, defaultPriority: 2 }
    ],
    departments: ['Radio-Redaktion']
  },
  {
    id: "g_sonstige",
    title: "Sonstige",
    roles: [
      { name: 'Sonstige Dienste', startTime: '08:00', endTime: '17:00', defaultPercentage: 100, defaultPriority: 3 }
    ],
    departments: ['Radio-Redaktion', 'Online-Redaktion', 'Sounddesign']
  }
];

export const HOURS_PER_SHIFT = 8;
export const COLORS = ['#4B2C82', '#6B46C1', '#805AD5', '#9F7AEA', '#B794F4', '#D6BCFA', '#7C3AED', '#5B21B6', '#4C1D95'];
export const VERTRAGS_OPTIONEN = ["Festangestellt (befristet)", "Festangestellt (unbefristet)", "Frei (befristet)", "Frei (unbefristet)", "fest frei, unbefristet"];
export const REDAKTIONS_OPTIONEN: Redaktion[] = ["Radio-Redaktion", "Online-Redaktion", "Sounddesign"];
