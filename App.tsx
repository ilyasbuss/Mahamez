import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  parseISO, 
  addWeeks, 
  subWeeks,
  getISOWeek
} from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2,
  Edit2,
  BarChart3, 
  CheckCircle2, 
  X,
  PieChart as PieChartIcon,
  Lock,
  Unlock,
  Layers,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Search,
  AlertTriangle,
  Clock,
  PlusCircle,
  Filter,
  Tag,
  Download,
  MessageSquareWarning,
  Bell,
  Check,
  History,
  ArrowLeft,
  UserPlus,
  Waves,
  ArrowUpDown,
  Settings2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

import { Employee, Shift, ShiftTypeID, Skill, SkillAssignment, Redaktion, SkillGroup, RoleDefinition } from './types';
import { INITIAL_EMPLOYEES } from './constants';
import { autoScheduleShifts } from './services/geminiService';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const validatePercentageSum = (assignments: SkillAssignment[]): boolean => {
  if (assignments.length === 0) return true;
  const sum = assignments.reduce((acc, curr) => acc + curr.percentage, 0);
  return Math.abs(sum - 100) < 0.01; 
};

const INITIAL_SKILL_GROUPS: SkillGroup[] = [
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
    id: "g_show_support",
    title: "Sendungs-Begleitung",
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
      { name: 'Mod POP', startTime: '15:15', endTime: '00:00', defaultPercentage: 100, defaultPriority: 1 },
      { name: 'Redakteur POP', startTime: '14:30', endTime: '23:15', defaultPercentage: 100, defaultPriority: 2 }
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

const HOURS_PER_SHIFT = 8;
const COLORS = ['#4B2C82', '#6B46C1', '#805AD5', '#9F7AEA', '#B794F4', '#D6BCFA', '#7C3AED', '#5B21B6', '#4C1D95'];
const VERTRAGS_OPTIONEN = ["Festangestellt (befristet)", "Festangestellt (unbefristet)", "Frei (befristet)", "Frei (unbefristet)"];
const REDAKTIONS_OPTIONEN: Redaktion[] = ["Radio-Redaktion", "Online-Redaktion", "Sounddesign"];

const MahamezLogo = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-[#9F7AEA]">
    <circle cx="12" cy="12" r="8" stroke="#f97316" opacity="0.8" />
    <rect x="4" y="4" width="6" height="6" rx="1.5" />
    <rect x="14" y="4" width="6" height="6" rx="1.5" />
    <rect x="4" y="14" width="6" height="6" rx="1.5" />
    <rect x="14" y="14" width="6" height="6" rx="1.5" />
  </svg>
);

interface DeleteConfirmation {
  isOpen: boolean;
  type: 'employee' | 'shift' | 'role' | 'group';
  id: string; 
  name: string;
}

interface CancelConfirmation {
  isOpen: boolean;
  onConfirm: () => void;
}

interface AppNotification {
  id: string;
  title: string;
  message: string;
  priority: number;
  timestamp: Date;
  readAt?: Date;
}

const App: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>(INITIAL_SKILL_GROUPS);
  const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'employees' | 'roles' | 'stats' | 'rules' | 'new-plan'>('calendar');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingGroup, setEditingGroup] = useState<SkillGroup | null>(null);
  const [editingRole, setEditingRole] = useState<{ role: RoleDefinition; groupId: string; isNew?: boolean } | null>(null);
  const [isRolesExpanded, setIsRolesExpanded] = useState(true);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  
  const [snapshot, setSnapshot] = useState<string>('');
  const [cancelConf, setCancelConf] = useState<CancelConfirmation>({ isOpen: false, onConfirm: () => {} });

  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [employeeSort, setEmployeeSort] = useState<{ key: 'name' | 'roles', direction: 'asc' | 'desc' | null }>({ key: null, direction: null });
  const [prodPoolSearchTerm, setProdPoolSearchTerm] = useState('');
  const [deleteConf, setDeleteConf] = useState<DeleteConfirmation>({ isOpen: false, type: 'employee', id: '', name: '' });
  const [deleteTimer, setDeleteTimer] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [roleTabFilters, setRoleTabFilters] = useState<Redaktion[]>([]);

  const [shadowingRows, setShadowingRows] = useState<Set<string>>(new Set());
  const [activeDropdown, setActiveDropdown] = useState<{ roleName: string; dateStr: string } | null>(null);
  const [expandedSelects, setExpandedSelects] = useState<Set<string>>(new Set());

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [activeNotifications, setActiveNotifications] = useState<AppNotification[]>([
    { id: 'n1', title: 'Kritische Unterbesetzung', message: 'Besetzungskritisch! Lorem ipsum dolor sit amet, consectetur adipiscing elit.', priority: 1, timestamp: new Date() },
    { id: 'n2', title: 'Konflikt im Layout', message: 'Hohe Priorität. Lorem ipsum dolor sit amet.', priority: 2, timestamp: new Date(Date.now() - 1000 * 60 * 30) }
  ]);
  const [notificationsHistory, setNotificationsHistory] = useState<AppNotification[]>([]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i)), [currentWeek]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (deleteConf.isOpen) {
      setDeleteTimer(5);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setDeleteTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [deleteConf.isOpen]);

  const markAsRead = useCallback((id: string) => {
    const notif = activeNotifications.find(n => n.id === id);
    if (!notif) return;
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
    setNotificationsHistory(prev => [{ ...notif, readAt: new Date() }, ...prev].slice(0, 100));
  }, [activeNotifications]);

  const markAllAsRead = useCallback(() => {
    if (activeNotifications.length === 0) return;
    const now = new Date();
    const marked = activeNotifications.map(n => ({ ...n, readAt: now }));
    setActiveNotifications([]);
    setNotificationsHistory(prev => [...marked, ...prev].slice(0, 100));
  }, [activeNotifications]);

  const handleAiOptimize = useCallback(async () => {
    setIsAiLoading(true);
    const start = format(weekDays[0], 'yyyy-MM-dd');
    const end = format(weekDays[6], 'yyyy-MM-dd');
    try {
      const suggestedShifts = await autoScheduleShifts(employees, start, end);
      const newShifts: Shift[] = suggestedShifts.map((s) => ({
        id: generateId(),
        employeeId: s.employeeId || '',
        date: s.date || '',
        typeId: (s.typeId as ShiftTypeID) || 'MORNING',
        roleName: (s as any).roleName || 'Sonstige'
      }));
      setShifts(prev => {
        const otherWeeks = prev.filter(s => {
          const d = parseISO(s.date);
          return d < weekDays[0] || d > weekDays[6];
        });
        return [...otherWeeks, ...newShifts];
      });
      setActiveTab('calendar');
    } catch (err) {
      console.error('AI Error:', err);
      alert("Fehler bei der KI-Generierung.");
    } finally { setIsAiLoading(false); }
  }, [employees, weekDays]);

  const addManualShift = useCallback((employeeId: string, date: string, roleName: string) => {
    const newShift: Shift = { id: generateId(), employeeId, date, typeId: 'MORNING', roleName };
    setShifts(prev => [...prev, newShift]);
    setActiveDropdown(null);
  }, []);

  const deleteShift = useCallback((id: string) => {
    const shift = shifts.find(s => s.id === id);
    const emp = employees.find(e => e.id === shift?.employeeId);
    setDeleteConf({ isOpen: true, type: 'shift', id, name: `Schicht von ${emp?.name || 'Mitarbeiter'}` });
  }, [shifts, employees]);

  const handleOpenAddModal = useCallback(() => {
    const newEmp: Employee = { id: `new-${generateId()}`, name: '', role: VERTRAGS_OPTIONEN[0], departments: [], skillAssignments: [], maxHoursPerWeek: 40, contractHours: 100, preferredShifts: [], unavailability: [], producerPool: [] };
    setEditingEmployee(newEmp);
    setSnapshot(JSON.stringify(newEmp));
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((emp: Employee) => { 
    setEditingEmployee({ ...emp }); 
    setSnapshot(JSON.stringify(emp));
    setIsModalOpen(true); 
  }, []);

  const handleSaveEmployee = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    if (!validatePercentageSum(editingEmployee.skillAssignments)) {
      alert('Die Prozentsätze der Qualifikationen müssen zusammen 100% ergeben.');
      return;
    }
    setEmployees(prev => {
      const exists = prev.find(e => e.id === editingEmployee.id);
      return exists ? prev.map(e => e.id === editingEmployee.id ? editingEmployee : e) : [...prev, editingEmployee];
    });
    setIsModalOpen(false);
    setEditingEmployee(null);
  }, [editingEmployee]);

  const confirmDeleteAction = useCallback(() => {
    if (deleteTimer > 0) return;
    if (deleteConf.type === 'employee') {
      setEmployees(prev => prev.filter(e => e.id !== deleteConf.id));
      setShifts(prev => prev.filter(s => s.employeeId !== deleteConf.id));
      setIsModalOpen(false);
      setEditingEmployee(null);
    } else if (deleteConf.type === 'shift') {
      setShifts(prev => prev.filter(s => s.id !== deleteConf.id));
    } else if (deleteConf.type === 'group') {
      setSkillGroups(prev => prev.filter(g => g.id !== deleteConf.id));
      setEditingGroup(null);
    } else if (deleteConf.type === 'role') {
      const [groupId, roleName] = deleteConf.id.split('|');
      setSkillGroups(prev => prev.map(g => {
        if (g.id === groupId) {
          return { ...g, roles: g.roles.filter(r => r.name !== roleName) };
        }
        return g;
      }));
      setEditingRole(null);
    }
    setDeleteConf(prev => ({ ...prev, isOpen: false }));
  }, [deleteConf, deleteTimer]);

  const toggleSkillAssignment = useCallback((roleDef: RoleDefinition) => {
    if (!editingEmployee) return;
    const exists = editingEmployee.skillAssignments.find(sa => sa.skill === roleDef.name);
    let newAssignments: SkillAssignment[] = [];
    if (exists) {
      newAssignments = editingEmployee.skillAssignments.filter(sa => sa.skill !== roleDef.name);
      if (newAssignments.length > 0) {
        const share = exists.percentage / newAssignments.filter(n => !n.locked).length || 0;
        newAssignments = newAssignments.map(n => n.locked ? n : { ...n, percentage: Math.min(100, Math.max(0, n.percentage + share)) });
      }
    } else {
      newAssignments = [...editingEmployee.skillAssignments, { skill: roleDef.name, percentage: editingEmployee.skillAssignments.length === 0 ? 100 : 0, priority: roleDef.defaultPriority, locked: false }];
    }
    setEditingEmployee({ ...editingEmployee, skillAssignments: newAssignments });
  }, [editingEmployee]);

  const updateSkillAssignment = useCallback((skill: Skill, field: keyof SkillAssignment, value: any) => {
    if (!editingEmployee) return;
    let currentAssignments = [...editingEmployee.skillAssignments];
    const targetIdx = currentAssignments.findIndex(sa => sa.skill === skill);
    if (targetIdx === -1) return;

    if (field === 'percentage') {
      const newVal = Number(value);
      const others = currentAssignments.filter((sa, idx) => idx !== targetIdx && !sa.locked);
      
      if (others.length === 0) {
          currentAssignments[targetIdx].percentage = 100;
      } else {
          const lockedSum = currentAssignments.filter((sa, idx) => idx !== targetIdx && sa.locked).reduce((a,b)=>a+b.percentage, 0);
          const maxForTarget = 100 - lockedSum;
          const safeVal = Math.min(newVal, maxForTarget);
          
          const diff = safeVal - currentAssignments[targetIdx].percentage;
          currentAssignments[targetIdx].percentage = safeVal;
          
          const othersSum = others.reduce((a, b) => a + b.percentage, 0);
          if (othersSum > 0) {
              const factor = (othersSum - diff) / othersSum;
              currentAssignments = currentAssignments.map((sa, idx) => 
                  (idx === targetIdx || sa.locked) ? sa : { ...sa, percentage: Math.max(0, sa.percentage * factor) }
              );
          } else if (diff < 0) {
              const gain = Math.abs(diff) / others.length;
              currentAssignments = currentAssignments.map((sa, idx) => 
                  (idx === targetIdx || sa.locked) ? sa : { ...sa, percentage: sa.percentage + gain }
              );
          }
      }
    } else {
      currentAssignments[targetIdx] = { ...currentAssignments[targetIdx], [field]: value };
    }
    setEditingEmployee({ ...editingEmployee, skillAssignments: currentAssignments });
  }, [editingEmployee]);

  const handlePreviousWeek = useCallback(() => setCurrentWeek(prev => subWeeks(prev, 1)), []);
  const handleNextWeek = useCallback(() => setCurrentWeek(prev => addWeeks(prev, 1)), []);

  const handleCloseModal = useCallback(() => { 
    const isDirty = (editingEmployee && snapshot !== JSON.stringify(editingEmployee)) ||
                    (editingGroup && snapshot !== JSON.stringify(editingGroup)) ||
                    (editingRole && snapshot !== JSON.stringify(editingRole));
    if (isDirty) {
      setCancelConf({ 
        isOpen: true, 
        onConfirm: () => {
          setIsModalOpen(false); 
          setEditingEmployee(null); 
          setEditingGroup(null); 
          setEditingRole(null);
          setCancelConf({ isOpen: false, onConfirm: () => {} });
        } 
      });
    } else {
      setIsModalOpen(false); 
      setEditingEmployee(null); 
      setEditingGroup(null); 
      setEditingRole(null);
    }
  }, [editingEmployee, editingGroup, editingRole, snapshot]);

  const handleCloseDeleteConf = useCallback(() => setDeleteConf(prev => ({ ...prev, isOpen: false })), []);
  
  const handleExport = useCallback(() => {
    const data = { week: format(currentWeek, 'yyyy-ww'), shifts, employees: employees.map(e => ({ id: e.id, name: e.name })) };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dienstplan-kw${getISOWeek(currentWeek)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [currentWeek, shifts, employees]);

  const toggleShadowing = useCallback((roleName: string) => {
    setShadowingRows(prev => {
      const next = new Set(prev);
      if (next.has(roleName)) next.delete(roleName); else next.add(roleName);
      return next;
    });
  }, []);

  const toggleDepartmentFilter = useCallback((dept: Redaktion) => {
    setRoleTabFilters(prev => prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]);
  }, []);

  const statsData = useMemo(() => employees.map(emp => {
    const hours = shifts.filter(s => s.employeeId === emp.id && (parseISO(s.date) >= weekDays[0] && parseISO(s.date) <= weekDays[6])).length * HOURS_PER_SHIFT;
    return { name: emp.name, hours, limit: emp.maxHoursPerWeek, over: hours > emp.maxHoursPerWeek };
  }), [employees, shifts, weekDays]);

  const toggleEmployeeSort = (key: 'name' | 'roles') => {
    setEmployeeSort(prev => ({
      key,
      direction: prev.key === key ? (prev.direction === 'asc' ? 'desc' : (prev.direction === 'desc' ? null : 'asc')) : 'asc'
    }));
  };

  const filteredEmployees = useMemo(() => {
    const term = employeeSearchTerm.toLowerCase();
    let result = term 
      ? employees.filter(e => e.name.toLowerCase().includes(term) || e.role.toLowerCase().includes(term) || e.skillAssignments.some(sa => sa.skill.toLowerCase().includes(term))) 
      : [...employees];
    if (employeeSort.key && employeeSort.direction) {
      result.sort((a, b) => {
        let valA = (employeeSort.key === 'name' ? a.name : (a.skillAssignments[0]?.skill || '')).toLowerCase();
        let valB = (employeeSort.key === 'name' ? b.name : (b.skillAssignments[0]?.skill || '')).toLowerCase();
        if (valA < valB) return employeeSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return employeeSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      result.sort((a, b) => {
        const lastA = a.name.split(' ').pop()?.toLowerCase() || '';
        const lastB = b.name.split(' ').pop()?.toLowerCase() || '';
        if (lastA < lastB) return -1;
        if (lastA > lastB) return 1;
        return 0;
      });
    }
    return result;
  }, [employees, employeeSearchTerm, employeeSort]);

  const filteredSkillGroups = useMemo(() => roleTabFilters.length === 0 ? skillGroups : skillGroups.filter(g => g.departments.some(d => roleTabFilters.includes(d))), [skillGroups, roleTabFilters]);

  const allRolesWithShadowing = useMemo(() => {
    const temp: (RoleDefinition & { groupId: string; isShadowing?: boolean; originalRoleName: string; hasThickBorder?: boolean })[] = [];
    const special = ['Käpt’n', 'Käpt’n Future', 'Redakteur 2 Morningshow', 'Redakteur POP', 'Redakteur Mainz 2', 'Redakteur 2 PA', 'Qualitätsmanagement'];
    filteredSkillGroups.forEach(g => g.roles.forEach(r => {
      const active = shadowingRows.has(r.name);
      temp.push({ ...r, groupId: g.id, isShadowing: false, originalRoleName: r.name });
      if (active) temp.push({ ...r, name: `Mitlaufen ${r.name}`, isShadowing: true, groupId: g.id, originalRoleName: r.name });
    }));
    return temp.map((r, i, arr) => {
      const prev = arr[i - 1];
      const thick = prev && special.includes(prev.originalRoleName) && (!prev.isShadowing ? !shadowingRows.has(prev.originalRoleName) : true);
      return { ...r, hasThickBorder: thick };
    });
  }, [filteredSkillGroups, shadowingRows]);

  const getPriorityColor = (prio: number) => {
    switch (prio) { case 1: return '#ef4444'; case 2: return '#f97316'; case 3: return '#3b82f6'; case 4: return '#94a3b8'; default: return '#cbd5e1'; }
  };

  const renderNotificationItem = (n: AppNotification, isHistory: boolean) => (
    <div key={n.id} className={`relative pl-3 border-l-4 rounded-r-xl p-2.5 transition duration-200 ${isHistory ? 'bg-white opacity-90 border-slate-300' : 'bg-slate-50/70 hover:bg-white hover:shadow-md'}`} style={{ borderLeftColor: isHistory ? '#cbd5e1' : getPriorityColor(n.priority) }}>
      <div className="flex items-center justify-between mb-0.5">
        <h4 className="text-[13px] font-bold" style={{ color: isHistory ? '#64748b' : getPriorityColor(n.priority) }}>{n.title}</h4>
        <span className="text-[9px] font-medium text-slate-400">{isHistory ? `Gelesen: ${n.readAt ? format(n.readAt, 'HH:mm') : ''}` : format(n.timestamp, 'HH:mm')}</span>
      </div>
      <p className={`text-[11px] leading-relaxed ${isHistory ? 'text-slate-400' : 'text-slate-500 mb-1.5'}`}>{n.message}</p>
      {!isHistory && (
        <div className="flex justify-end"><button onClick={() => markAsRead(n.id)} className="p-1 bg-white border rounded-lg text-slate-400 hover:text-green-600 hover:border-green-200 transition shadow-sm" title="Als gelesen markieren"><Check size={12} /></button></div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-700">
      <nav className="w-full md:w-64 bg-[#1D0B40] text-white flex flex-col p-4 space-y-0.5">
        <div className="flex items-center space-x-1 px-1.5 py-3 cursor-pointer" onClick={() => setActiveTab('calendar')}>
          <MahamezLogo />
          <span className="text-xl font-bold tracking-tight leading-none">Mahamez</span>
        </div>
        <div className="space-y-0.5">
          <button onClick={() => setActiveTab('calendar')} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition ${activeTab === 'calendar' ? 'bg-[#4B2C82]' : 'hover:bg-white/10'}`}><CalendarIcon size={18} /><span>Aktueller Dienstplan</span></button>
          <button onClick={() => setActiveTab('new-plan')} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition ${activeTab === 'new-plan' ? 'bg-[#4B2C82]' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}><PlusCircle size={18} /><span>Neuen Dienstplan erstellen</span></button>
        </div>
        <div className="pt-2 space-y-0.5">
          <button onClick={() => setActiveTab('employees')} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition ${activeTab === 'employees' ? 'bg-[#4B2C82]' : 'hover:bg-white/10'}`}><Users size={18} /><span>Team</span></button>
          <button onClick={() => setActiveTab('roles')} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition ${activeTab === 'roles' ? 'bg-[#4B2C82]' : 'hover:bg-white/10'}`}><LayoutGrid size={18} /><span>Rollen</span></button>
          <button onClick={() => setActiveTab('rules')} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition ${activeTab === 'rules' ? 'bg-[#4B2C82]' : 'hover:bg-white/10'}`}><Settings2 size={18} /><span>Regeln</span></button>
          <button onClick={() => setActiveTab('stats')} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition ${activeTab === 'stats' ? 'bg-[#4B2C82]' : 'hover:bg-white/10'}`}><BarChart3 size={18} /><span>Statistiken</span></button>
        </div>
        <div className="mt-auto pt-3 border-t border-white/10">
          <button onClick={handleAiOptimize} disabled={isAiLoading} className="w-full bg-[#4B2C82] hover:bg-[#5B3798] flex items-center justify-center space-x-2 py-2 rounded-xl font-medium transition shadow-lg">{isAiLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <><Sparkles size={16} className="text-[#9F7AEA]" /><span>Regel erstellen</span></>}</button>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-4 overflow-y-auto bg-[#f8fafc]">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800">
              {activeTab === 'calendar' ? 'Aktueller Dienstplan' : 
               activeTab === 'new-plan' ? 'Neuer Dienstplan' :
               activeTab === 'employees' ? 'Personalverwaltung' : 
               activeTab === 'roles' ? 'Rollenverwaltung' : 
               activeTab === 'rules' ? 'Dienstplanregeln' : 'Auslastung & Analyse'}
            </h1>
            {(activeTab === 'calendar' || activeTab === 'new-plan') && (
              <div className="flex items-center bg-white border rounded-xl px-1 py-0.5 shadow-sm">
                <button onClick={handlePreviousWeek} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-[#4B2C82] transition"><ChevronLeft size={14}/></button>
                <button className="px-2 py-0.5 font-semibold text-slate-700 text-xs flex items-center gap-2"><span className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">KW {getISOWeek(currentWeek)}</span><span>{format(weekDays[0], 'dd.MM.')} - {format(weekDays[6], 'dd.MM.yyyy')}</span></button>
                <button onClick={handleNextWeek} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-[#4B2C82] transition"><ChevronRight size={14}/></button>
              </div>
            )}
          </div>
          
          {activeTab === 'new-plan' && (
            <div className="flex justify-center flex-1 order-3 md:order-none w-full md:w-auto">
              <button onClick={handleAiOptimize} disabled={isAiLoading} className="bg-[#4B2C82] hover:bg-[#5B3798] text-white px-8 py-1.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
                <Sparkles size={16} className="text-[#9F7AEA]" />
                <span>Autofill</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {activeTab === 'employees' && (
              <button onClick={handleOpenAddModal} className="bg-[#4B2C82] text-white p-2 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-black/10 hover:bg-[#5B3798] transition-all"><Plus size={18}/></button>
            )}
            
            {activeTab === 'roles' && (
              <div className="relative">
                <button onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} className="bg-[#4B2C82] text-white px-3 py-1.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-black/10 hover:bg-[#5B3798] transition-all"><Plus size={18} /><span>Hinzufügen</span></button>
                {isAddMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button onClick={() => { const newGrp: SkillGroup = { id: generateId(), title: '', roles: [], departments: [] }; setEditingGroup(newGrp); setSnapshot(JSON.stringify(newGrp)); setIsAddMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-bold text-slate-700 flex items-center gap-2.5 border-b transition-colors"><LayoutGrid size={16} className="text-[#4B2C82]" />Gruppe hinzufügen</button>
                    <button onClick={() => { const newRol = { role: { name: '', startTime: '08:00', endTime: '17:00', defaultPercentage: 100, defaultPriority: 2 }, groupId: skillGroups[0]?.id || '', isNew: true }; setEditingRole(newRol); setSnapshot(JSON.stringify(newRol)); setIsAddMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-bold text-slate-700 flex items-center gap-2.5 transition-colors"><PlusCircle size={16} className="text-[#4B2C82]" />Rolle hinzufügen</button>
                  </div>
                )}
              </div>
            )}

            {(activeTab === 'calendar' || activeTab === 'new-plan') && (
              <div className="flex items-center gap-1 relative">
                <button onClick={handleExport} className="p-1.5 bg-white border rounded-xl text-slate-400 hover:text-[#4B2C82] transition shadow-sm" title="Dienstplan exportieren"><Download size={16} /></button>
                <button onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); if (!isNotificationsOpen) setIsHistoryView(false); }} className={`p-1.5 bg-white border rounded-xl transition shadow-sm relative ${isNotificationsOpen ? 'text-[#4B2C82] border-[#4B2C82]/30 ring-2 ring-[#4B2C82]/10' : 'text-slate-400 hover:text-[#4B2C82]'}`} title="Benachrichtigungen"><MessageSquareWarning size={16} />{activeNotifications.length > 0 && (<span className={`absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 border border-white rounded-full`}></span>)}</button>

                {isNotificationsOpen && (
                  <div className="absolute top-full right-0 mt-3 w-80 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-4 duration-200 flex flex-col">
                    <div className="bg-[#1D0B40] p-3 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2 font-bold">{isHistoryView ? <History size={14} className="text-[#9F7AEA]" /> : <Bell size={14} className="text-[#9F7AEA]" />}{isHistoryView ? 'Chronik' : 'Benachrichtigungen'}</div>
                      <button onClick={() => setIsNotificationsOpen(false)} className="text-white/50 hover:text-white transition"><X size={16} /></button>
                    </div>
                    <div className="relative overflow-hidden h-[350px]">
                      <div className={`flex w-[200%] h-full transition-transform duration-500 ease-in-out ${isHistoryView ? '-translate-x-1/2' : 'translate-x-0'}`}>
                        <div className="w-full h-full p-2.5 overflow-y-auto custom-scrollbar space-y-2">{activeNotifications.sort((a, b) => a.priority - b.priority).map((n) => renderNotificationItem(n, false))}{activeNotifications.length === 0 && <div className="h-full flex flex-col items-center justify-center text-center py-4 text-slate-300 text-xs">Alles grün!</div>}</div>
                        <div className="w-full h-full p-2.5 overflow-y-auto custom-scrollbar space-y-2 bg-slate-50/50">{notificationsHistory.map((n) => renderNotificationItem(n, true))}{notificationsHistory.length === 0 && <div className="h-full flex flex-col items-center justify-center text-center py-4 text-slate-300 text-xs">Leer</div>}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {(activeTab === 'calendar' || activeTab === 'new-plan') && (
          <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto relative">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-2.5 border-b border-r sticky left-0 bg-slate-50 z-20 w-64 font-bold text-slate-600 text-[13px] uppercase tracking-widest">Funktion</th>
                  {weekDays.map(day => (
                    <th key={day.toISOString()} className={`p-2.5 border-b border-r min-w-[120px] text-center ${isSameDay(day, new Date()) ? 'bg-purple-50/50' : ''}`}>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">{format(day, 'EEEE', { locale: de })}</div>
                      <div className={`text-sm font-bold ${isSameDay(day, new Date()) ? 'text-[#4B2C82]' : 'text-slate-700'}`}>{format(day, 'dd.MM.')}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {allRolesWithShadowing.map((r, i) => (
                  <tr key={`${r.name}-${i}`} className={`hover:bg-slate-50/50 transition ${r.isShadowing ? 'bg-slate-50/20' : ''} ${r.hasThickBorder ? 'border-b-[8px] border-[#7A758F]' : ''}`}>
                    <td className="py-1 px-2 border-r sticky left-0 bg-white z-10 shadow-sm relative w-64">
                      <div className="flex flex-col pr-8">
                        {r.isShadowing ? <div className="pl-4 font-bold text-slate-500 text-xs">Mitlaufen<br/>{r.name.replace('Mitlaufen ', '')}</div> : <><div className="font-bold text-slate-700 text-xs uppercase tracking-tight leading-tight">{r.name}</div><div className="text-[9px] font-medium text-slate-400 flex items-center gap-1 mt-0.5"><Clock size={9} /> {r.startTime} - {r.endTime}</div></>}
                      </div>
                      {!r.isShadowing && <button onClick={() => toggleShadowing(r.name)} className={`w-4 h-4 rounded-full border text-[8px] font-bold transition shadow-sm absolute top-1 right-1 flex items-center justify-center ${shadowingRows.has(r.name) ? 'bg-[#4B2C82] border-[#4B2C82] text-white' : 'border-slate-300 text-slate-400 bg-white'}`}>M</button>}
                    </td>
                    {weekDays.map(day => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const shift = shifts.find(s => s.date === dateStr && s.roleName === r.name);
                      const employee = shift ? employees.find(e => e.id === shift.employeeId) : null;
                      const cellKey = `${r.name}-${dateStr}`;
                      const isCellActive = activeDropdown?.roleName === r.name && activeDropdown?.dateStr === dateStr;

                      return (
                        <td key={cellKey} className={`py-0.5 px-1 border-r group/cell relative ${[0, 6].includes(day.getDay()) ? 'bg-slate-50/30' : ''}`}>
                          {employee ? (
                            <div className={`h-full min-h-[32px] px-1 border rounded flex items-center justify-center group/pill relative overflow-hidden ${r.isShadowing ? 'bg-slate-100 border-slate-200' : 'bg-purple-50 border-purple-100'}`}>
                              <span className={`font-bold text-[13px] leading-tight text-center truncate px-1 w-full ${r.isShadowing ? 'text-slate-600' : 'text-[#4B2C82]'}`}>
                                {employee.name.split(' ').pop()}
                              </span>
                              <button 
                                onClick={() => deleteShift(shift!.id)} 
                                className="absolute right-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/pill:opacity-100 text-slate-400 hover:text-red-500 transition bg-white/90 rounded-full p-0.5 shadow-sm border"
                              >
                                <X size={10}/>
                              </button>
                            </div>
                          ) : (
                            <div className="h-8 flex items-center justify-center">
                              <button 
                                onClick={() => setActiveDropdown({ roleName: r.name, dateStr })}
                                className="w-full h-full text-[10px] text-slate-300 hover:text-[#4B2C82] italic group-hover/cell:opacity-100 transition"
                              >
                                --
                              </button>
                              {isCellActive && (
                                <div ref={dropdownRef} className="absolute left-0 top-full z-[100] w-48 bg-white border border-slate-200 rounded-xl shadow-2xl py-1 max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1">
                                  {employees
                                    .filter(e => expandedSelects.has(cellKey) || e.skillAssignments.some(sa => sa.skill === (r.isShadowing ? r.name.replace('Mitlaufen ', '') : r.name)))
                                    .sort((a,b) => a.name.localeCompare(b.name))
                                    .map(e => (
                                      <button key={e.id} onClick={() => addManualShift(e.id, dateStr, r.name)} className="w-full text-left px-3 py-1.5 hover:bg-purple-50 text-[11px] font-medium text-slate-600 transition-colors">{e.name}</button>
                                    ))
                                  }
                                  {!expandedSelects.has(cellKey) && (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setExpandedSelects(prev => new Set(prev).add(cellKey)); }} 
                                      className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-[#4B2C82] hover:bg-slate-50 uppercase tracking-tight flex items-center gap-1 border-t mt-1 pt-2"
                                    >
                                      <Plus size={10} /> Alle anzeigen
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="space-y-2.5">
            <div className="bg-white p-2.5 border rounded-2xl shadow-sm flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Personen oder Rollen suchen" value={employeeSearchTerm} onChange={(e) => setEmployeeSearchTerm(e.target.value)} className="w-full pl-10 pr-10 py-1.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-[#4B2C82]/20 font-medium text-sm" />
              </div>
            </div>
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-sm font-semibold text-slate-600 uppercase"><div className="flex items-center gap-2">Team<button onClick={() => toggleEmployeeSort('name')} className={`p-1 rounded hover:bg-slate-200 transition ${employeeSort.key === 'name' ? 'text-[#4B2C82]' : 'text-slate-400'}`}>{employeeSort.key === 'name' && employeeSort.direction === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}</button></div></th>
                    <th className="px-4 py-2 text-sm font-semibold text-slate-600 uppercase"><div className="flex items-center gap-2">Rollen<button onClick={() => toggleEmployeeSort('roles')} className={`p-1 rounded hover:bg-slate-200 transition ${employeeSort.key === 'roles' ? 'text-[#4B2C82]' : 'text-slate-400'}`}>{employeeSort.key === 'roles' && employeeSort.direction === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}</button></div></th>
                    <th className="px-4 py-2 text-sm font-semibold text-slate-600 uppercase text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredEmployees.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-2 flex items-center space-x-3"><div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-[#4B2C82] font-bold text-xs">{e.name.charAt(0)}</div><div><div className="font-medium text-slate-700 text-sm leading-tight">{e.name}</div><div className="text-[10px] text-slate-400">{e.role}</div></div></td>
                      <td className="px-4 py-2"><div className="flex flex-wrap gap-1">{e.skillAssignments.slice(0, 3).map((sa, i) => <span key={i} className="bg-purple-50 text-[#4B2C82] border border-purple-100 px-1.5 py-0.5 rounded-md text-[10px] font-medium">{sa.skill}</span>)}</div></td>
                      <td className="px-4 py-2 text-right"><button onClick={() => handleOpenEditModal(e)} className="p-1 text-slate-400 hover:text-[#4B2C82] transition"><Edit2 size={13}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border shadow-sm flex-wrap">
              <button onClick={() => setRoleTabFilters([])} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${roleTabFilters.length === 0 ? 'bg-[#4B2C82] text-white shadow-lg shadow-black/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Alle anzeigen</button>
              {REDAKTIONS_OPTIONEN.map(dept => {
                const isActive = roleTabFilters.includes(dept);
                return (
                  <button key={dept} onClick={() => toggleDepartmentFilter(dept)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isActive ? 'bg-[#4B2C82] text-white shadow-lg shadow-black/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                    {isActive && <CheckCircle2 size={12} />}
                    {dept}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkillGroups.map(group => (
                <div key={group.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                  <div className="p-4 border-b flex flex-col gap-1.5 bg-slate-50/50 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <div className="p-1 bg-purple-100 rounded-lg"><LayoutGrid size={14} className="text-[#4B2C82]"/></div>
                        {group.title}
                      </h3>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingGroup(group); setSnapshot(JSON.stringify(group)); }} className="p-1.5 text-slate-400 hover:text-[#4B2C82] transition rounded-lg hover:bg-white" title="Gruppe bearbeiten"><Edit2 size={14} /></button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {group.departments.map(dept => (
                        <span key={dept} className="bg-white border border-slate-200 px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider"><Tag size={8} className="text-[#9F7AEA]" />{dept}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 space-y-2.5 flex-1">
                    {group.roles.map(role => (
                      <div key={role.name} className="flex flex-col gap-1.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-purple-50/50 hover:border-purple-100 transition group/item relative">
                        <span className="font-bold text-slate-700 text-[13px] leading-tight block pr-8">{role.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] text-slate-400 font-medium flex items-center gap-1"><Clock size={9} /> {role.startTime} - {role.endTime}</span>
                          <div className="bg-white border px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-400 shrink-0">Prio {role.defaultPriority}</div>
                        </div>
                        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button onClick={() => { const rolData = { role, groupId: group.id }; setEditingRole(rolData); setSnapshot(JSON.stringify(rolData)); }} className="p-1 text-slate-300 hover:text-[#4B2C82] transition rounded-lg hover:bg-white" title="Rolle bearbeiten"><Edit2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => { const newRol = { role: { name: '', startTime: '08:00', endTime: '17:00', defaultPercentage: 100, defaultPriority: 2 }, groupId: group.id, isNew: true }; setEditingRole(newRol); setSnapshot(JSON.stringify(newRol)); }} className="w-full py-2.5 border-2 border-dashed border-slate-100 rounded-2xl text-[9px] font-bold text-slate-300 uppercase tracking-widest hover:border-[#4B2C82]/20 hover:text-[#4B2C82] transition-all flex items-center justify-center gap-2 mt-2"><Plus size={12} /> Rolle hinzufügen</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="bg-white p-6 border rounded-2xl shadow-sm text-center py-10">
            <Settings2 size={40} className="mx-auto text-slate-200 mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">In Vorbereitung</h3>
            <p className="text-slate-400 text-sm">Hier werden bald Regeln verwaltet.</p>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-white p-4 border rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800"><BarChart3 size={18} className="text-[#4B2C82]" /> Auslastung (Stunden)</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData}>
                  <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} />
                  <YAxis fontSize={9} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}} />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {statsData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.over ? '#ef4444' : COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>

      {cancelConf.isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1D0B40]/70 backdrop-blur-lg">
          <div className="bg-white rounded-3xl w-full max-md md:max-w-md shadow-2xl p-6 text-center animate-in zoom-in duration-200">
            <div className="mx-auto w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3"><AlertTriangle size={20}/></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Abbrechen?</h3>
            <p className="text-sm text-slate-400 mb-6">Nicht gespeicherte Daten gehen verloren.</p>
            <div className="flex gap-3"><button onClick={() => setCancelConf({ isOpen: false, onConfirm: () => {} })} className="flex-1 py-2 text-slate-500 font-bold">Nein</button><button onClick={cancelConf.onConfirm} className="flex-1 py-2 bg-[#4B2C82] text-white rounded-2xl font-bold hover:bg-[#5B3798]">Ja</button></div>
          </div>
        </div>
      )}

      {editingRole && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1D0B40]/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-md shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 p-6">
             <h3 className="text-xl font-bold text-slate-800 mb-4">{editingRole.isNew ? 'Neue Rolle' : 'Rolle bearbeiten'}</h3>
             <div className="space-y-3">
                {editingRole.isNew && (
                  <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gruppe</label><select value={editingRole.groupId} onChange={(e) => setEditingRole({ ...editingRole, groupId: e.target.value })} className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium">{skillGroups.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}</select></div>
                )}
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Name</label><input type="text" value={editingRole.role.name} onChange={(e) => setEditingRole({ ...editingRole, role: { ...editingRole.role, name: e.target.value } })} className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Start</label><input type="time" value={editingRole.role.startTime} onChange={(e) => setEditingRole({ ...editingRole, role: { ...editingRole.role, startTime: e.target.value } })} className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ende</label><input type="time" value={editingRole.role.endTime} onChange={(e) => setEditingRole({ ...editingRole, role: { ...editingRole.role, endTime: e.target.value } })} className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium" /></div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button onClick={() => { setSkillGroups(prev => prev.map(g => { if (g.id === editingRole.groupId) { if (editingRole.isNew) return { ...g, roles: [...g.roles, editingRole.role] }; return { ...g, roles: g.roles.map(r => r.name === editingRole.role.name ? editingRole.role : r) }; } return g; })); setEditingRole(null); }} className="flex-1 py-2.5 bg-[#4B2C82] text-white font-bold rounded-2xl hover:bg-[#5B3798]">Speichern</button>
                  <button onClick={handleCloseModal} className="flex-1 py-2.5 border rounded-2xl text-slate-500 font-bold hover:bg-slate-50">Abbrechen</button>
                  {!editingRole.isNew && <button onClick={() => setDeleteConf({ isOpen: true, type: 'role', id: `${editingRole.groupId}|${editingRole.role.name}`, name: editingRole.role.name })} className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl"><Trash2 size={20} /></button>}
                </div>
             </div>
          </div>
        </div>
      )}

      {editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D0B40]/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 p-6">
             <h3 className="text-xl font-bold text-slate-800 mb-4">{editingGroup.id.includes('-') ? 'Neue Gruppe' : 'Gruppe bearbeiten'}</h3>
             <div className="space-y-4">
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Titel</label><input type="text" value={editingGroup.title} onChange={(e) => setEditingGroup({ ...editingGroup, title: e.target.value })} className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium" /></div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button onClick={() => { setSkillGroups(prev => { const exists = prev.find(g => g.id === editingGroup.id); return exists ? prev.map(g => g.id === editingGroup.id ? editingGroup : g) : [...prev, editingGroup]; }); setEditingGroup(null); }} className="flex-1 py-2.5 bg-[#4B2C82] text-white font-bold rounded-2xl hover:bg-[#5B3798]">Speichern</button>
                  <button onClick={handleCloseModal} className="flex-1 py-2.5 border rounded-2xl text-slate-500 font-bold hover:bg-slate-50">Abbrechen</button>
                  {!editingGroup.id.includes('-') && <button onClick={() => setDeleteConf({ isOpen: true, type: 'group', id: editingGroup.id, name: editingGroup.title })} className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl"><Trash2 size={20} /></button>}
                </div>
             </div>
          </div>
        </div>
      )}

      {isModalOpen && editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D0B40]/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 text-slate-700">
            <div className="flex items-center justify-between p-4 bg-slate-50 border-b">
              <div className="flex items-center gap-2"><div className="bg-[#4B2C82] p-1.5 rounded-xl text-white"><Users size={20} /></div><h2 className="text-lg font-bold text-slate-800">Informationen bearbeiten</h2></div>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition bg-white p-1.5 rounded-full border shadow-sm"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveEmployee} className="p-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Name</label><input type="text" required value={editingEmployee.name} onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })} className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium text-sm" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vertrag</label><select required value={editingEmployee.role} onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })} className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium text-sm">{VERTRAGS_OPTIONEN.map(opt => (<option key={opt} value={opt}>{opt}</option>))}</select></div>
                    <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{editingEmployee.role.includes("Festangestellt") ? "Teilzeit (%)" : "Tage"}</label><input type="number" step="1" min="0" max="100" required value={editingEmployee.contractHours} onChange={(e) => setEditingEmployee({ ...editingEmployee, contractHours: Number(e.target.value) })} className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#4B2C82] bg-slate-50 font-medium text-sm" /></div>
                  </div>
                  <div className="space-y-3">
                    <button type="button" onClick={() => setIsRolesExpanded(!isRolesExpanded)} className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase py-1"><span>Rollen</span>{isRolesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                    {isRolesExpanded && (
                      <div className="space-y-3 h-[280px] overflow-y-auto pr-2 bg-slate-50/50 p-2.5 rounded-2xl border">
                        {skillGroups.map(g => (
                          <div key={g.id} className="space-y-1.5"><h4 className="text-[9px] font-bold text-slate-400 uppercase">{g.title}</h4><div className="grid grid-cols-2 gap-2">{g.roles.map(r => { const sel = editingEmployee.skillAssignments.some(sa => sa.skill === r.name); return (<button key={r.name} type="button" onClick={() => toggleSkillAssignment(r)} className={`flex items-center justify-between p-2 rounded-xl border transition text-left ${sel ? 'border-[#4B2C82] bg-purple-50 text-[#4B2C82]' : 'border-slate-100 bg-white text-slate-500'}`}><span className="text-[11px] font-semibold">{r.name}</span>{sel && <CheckCircle2 size={14} />}</button>); })}</div></div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border space-y-4 flex flex-col h-full max-h-[600px]">
                  <h3 className="text-[11px] font-bold text-slate-800 uppercase flex items-center gap-2"><PieChartIcon size={14} className="text-[#4B2C82]" /> Zeitliche Verteilung</h3>
                  <div className="h-40 flex items-center justify-center bg-white rounded-2xl border shadow-sm"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[...editingEmployee.skillAssignments]} dataKey="percentage" nameKey="skill" cx="50%" cy="50%" outerRadius={60} innerRadius={40} paddingAngle={4}>{editingEmployee.skillAssignments.map((_, i) => (<Cell key={`cp-${i}`} fill={COLORS[i % COLORS.length]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
                  <div className="flex-1 space-y-2 overflow-y-auto pr-1">{editingEmployee.skillAssignments.map((sa, i) => (<div key={sa.skill} className="bg-white p-2.5 rounded-xl shadow-sm border space-y-1.5"><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2 truncate"><div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: COLORS[i % COLORS.length]}}></div><span className="text-[11px] font-bold text-slate-700 truncate">{sa.skill}</span></div><button type="button" onClick={() => updateSkillAssignment(sa.skill, 'locked', !sa.locked)} className={`p-1 rounded transition ${sa.locked ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>{sa.locked ? <Lock size={12} /> : <Unlock size={12} />}</button></div><input type="range" min="0" max="100" value={Math.round(sa.percentage)} disabled={sa.locked} onChange={(e) => updateSkillAssignment(sa.skill, 'percentage', e.target.value)} className={`w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#4B2C82] ${sa.locked ? 'opacity-30' : ''}`} /></div>))}</div>
                </div>
              </div>
              <div className="flex gap-2.5 pt-4 mt-4 border-t">
                <button type="submit" className="flex-1 py-2.5 bg-[#4B2C82] text-white font-bold rounded-2xl hover:bg-[#5B3798]">Speichern</button>
                <button type="button" onClick={handleCloseModal} className="flex-1 py-2.5 border rounded-2xl text-slate-500 font-bold hover:bg-slate-50">Abbrechen</button>
                {!editingEmployee.id.startsWith('new-') && (
                  <button type="button" onClick={() => setDeleteConf({ isOpen: true, type: 'employee', id: editingEmployee.id, name: editingEmployee.name })} className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl"><Trash2 size={20} /></button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConf.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1D0B40]/70 backdrop-blur-lg">
          <div className="bg-white rounded-3xl w-full max-md md:max-w-md shadow-2xl p-6 text-center animate-in zoom-in duration-200">
            <div className="mx-auto w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3"><AlertTriangle size={20}/></div>
            <h3 className="text-lg font-bold text-slate-800 mb-1.5">"{deleteConf.name}" löschen?</h3>
            <p className="text-sm text-slate-400 mb-6">Dies kann nicht rückgängig gemacht werden.</p>
            <div className="flex gap-3"><button onClick={handleCloseDeleteConf} className="flex-1 py-2 text-slate-500 font-bold">Abbrechen</button><button disabled={deleteTimer > 0} onClick={confirmDeleteAction} className={`flex-1 py-2 text-white rounded-2xl font-bold shadow-lg transition-all ${deleteTimer > 0 ? 'bg-slate-300 shadow-none cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>{deleteTimer > 0 ? `Warten (${deleteTimer}s)` : 'Ja, löschen'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;