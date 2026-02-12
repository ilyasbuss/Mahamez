
export type Skill = string;

export interface SkillAssignment {
  skill: Skill;
  percentage: number;
  priority: number; // 1 (Highest) to N
  locked?: boolean;
}

export type Redaktion = 'Radio-Redaktion' | 'Online-Redaktion' | 'Sounddesign';

export interface Employee {
  id: string;
  name: string;
  role: string; // Used for "Vertrag" type
  departments: Redaktion[];
  skillAssignments: SkillAssignment[];
  maxHoursPerWeek: number;
  contractHours: number; // Interpretation: Teilzeitgrad (0-100) or contract days
  preferredShifts: ShiftTypeID[];
  unavailability: string[]; // ISO Dates
  producerPool?: string[]; // IDs of preferred producers
}

export type ShiftTypeID = 'MORNING' | 'LATE' | 'NIGHT' | 'WEEKEND_DAY';

export interface ShiftType {
  id: ShiftTypeID;
  label: string;
  startTime: string;
  endTime: string;
  color: string;
  requiredSkills: Skill[];
}

export interface Shift {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  typeId: ShiftTypeID;
  roleName: string; // The specific function from the roster
}

export interface PlanningState {
  employees: Employee[];
  shifts: Shift[];
  currentWeek: Date;
}

export interface RoleDefinition {
  name: Skill;
  startTime: string;
  endTime: string;
  defaultPercentage: number;
  defaultPriority: number;
}

export interface SkillGroup {
  id: string;
  title: string;
  roles: RoleDefinition[];
  departments: Redaktion[];
}
