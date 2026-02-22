import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { startOfWeek, addDays, format, parseISO, subWeeks, addWeeks, getISOWeek } from 'date-fns';
import { Employee, Shift, SkillGroup, RoleDefinition, Redaktion, SkillAssignment, ShiftTypeID } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_SKILL_GROUPS, VERTRAGS_OPTIONEN } from '../constants';
import { autoScheduleShifts } from '../services/geminiService';
import { generateId, validatePercentageSum } from '../utils/dashboardUtils';

interface AppNotification {
    id: string;
    title: string;
    message: string;
    priority: number;
    timestamp: Date;
    readAt?: Date;
}

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

export const usePlannerDashboard = () => {
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
    // Note: isRolesExpanded was removed — it was never used or exported
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

    const [snapshot, setSnapshot] = useState<string>('');
    const [cancelConf, setCancelConf] = useState<CancelConfirmation>({ isOpen: false, onConfirm: () => { } });

    const [deleteConf, setDeleteConf] = useState<DeleteConfirmation>({ isOpen: false, type: 'employee', id: '', name: '' });
    const [deleteTimer, setDeleteTimer] = useState(0);
    const timerRef = useRef<number | null>(null);
    const [roleTabFilters, setRoleTabFilters] = useState<Redaktion[]>([]);
    const [selectedDept, setSelectedDept] = useState<string>('Radioredaktion');

    const [shadowingRows, setShadowingRows] = useState<Set<string>>(new Set());

    const [activeNotifications, setActiveNotifications] = useState<AppNotification[]>([
        { id: 'n1', title: 'Kritische Unterbesetzung', message: 'Besetzungskritisch! Lorem ipsum dolor sit amet, consectetur adipiscing elit.', priority: 1, timestamp: new Date() },
        { id: 'n2', title: 'Konflikt im Layout', message: 'Hohe Priorität. Lorem ipsum dolor sit amet.', priority: 2, timestamp: new Date(Date.now() - 1000 * 60 * 30) }
    ]);
    const [notificationsHistory, setNotificationsHistory] = useState<AppNotification[]>([]);

    const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i)), [currentWeek]);

    useEffect(() => {
        if (deleteConf.isOpen) {
            setDeleteTimer(3);
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

    const addManualShift = useCallback((employeeId: string, date: string, roleName: string, customName?: string) => {
        const newShift: Shift = { id: generateId(), employeeId, date, typeId: 'MORNING', roleName, customName };
        setShifts(prev => [...prev, newShift]);
    }, []);

    const deleteShift = useCallback((id: string) => {
        const shift = shifts.find(s => s.id === id);
        const emp = employees.find(e => e.id === shift?.employeeId);
        setDeleteConf({ isOpen: true, type: 'shift', id, name: `${emp?.name || 'Mitarbeiter'} als ${shift?.roleName || 'Schicht'}` });
    }, [shifts, employees]);

    const handleDeleteEmployee = useCallback((emp: Employee) => {
        setDeleteConf({ isOpen: true, type: 'employee', id: emp.id, name: emp.name });
    }, []);

    const handleOpenAddModal = useCallback(() => {
        const newEmp: Employee = { id: `new-${generateId()}`, name: '', email: '', systemRole: 'EMPLOYEE', role: VERTRAGS_OPTIONEN[0], departments: [], skillAssignments: [], maxHoursPerWeek: 40, contractHours: 100, preferredShifts: [], unavailability: [], prodPoolWith: [], prodPoolWithout: [] };
        setEditingEmployee(newEmp);
        setSnapshot(JSON.stringify(newEmp));
        setIsModalOpen(true);
    }, []);

    const handleOpenEditModal = useCallback((emp: Employee) => {
        setEditingEmployee({ ...emp });
        setSnapshot(JSON.stringify(emp));
        setIsModalOpen(true);
    }, []);

    const handleSaveEmployee = useCallback((updatedEmp: Employee) => {
        if (!updatedEmp) return;
        if (!validatePercentageSum(updatedEmp.skillAssignments)) {
            alert('Die Prozentsätze der Qualifikationen müssen zusammen 100% ergeben.');
            return;
        }
        setEmployees(prev => {
            const exists = prev.find(e => e.id === updatedEmp.id);
            return exists ? prev.map(e => e.id === updatedEmp.id ? updatedEmp : e) : [...prev, updatedEmp];
        });
        setIsModalOpen(false);
        setEditingEmployee(null);
    }, []);

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
                    setCancelConf({ isOpen: false, onConfirm: () => { } });
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

    const filteredSkillGroups = useMemo(() => {
        if (selectedDept === 'Moderation') return skillGroups.filter(g => g.id === 'g_moderation');
        if (selectedDept === 'Onlineredaktion') return skillGroups.filter(g => g.departments.includes('Online-Redaktion'));
        return skillGroups.filter(g => g.departments.includes('Radio-Redaktion') && g.id !== 'g_moderation');
    }, [skillGroups, selectedDept]);

    const allRolesWithShadowing = useMemo(() => {
        const temp: (RoleDefinition & { groupId: string; isShadowing?: boolean; originalRoleName: string; hasThickBorder?: boolean })[] = [];
        const special = ['Käpt’n', 'Käpt’n Future', 'Redakteur 2 Morningshow', 'Redakteur Mainz 2', 'Redakteur 2 PA', 'Qualitätsmanagement'];
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

    const handleAddRow = useCallback((roleName: string) => {
        setSkillGroups(prev => prev.map(g => {
            if (g.roles.some(r => r.name === roleName || r.name.startsWith(roleName))) {
                const baseRole = g.roles.find(r => r.name === roleName) ?? g.roles[0];
                const uniqueSuffix = generateId().slice(0, 4);
                return {
                    ...g,
                    roles: [...g.roles, { ...baseRole, name: `${roleName} (${uniqueSuffix})` }]
                };
            }
            return g;
        }));
    }, []);

    const handleEditRow = useCallback((oldName: string, newName: string) => {
        setSkillGroups(prev => prev.map(g => ({
            ...g,
            roles: g.roles.map(r => r.name === oldName ? { ...r, name: newName } : r)
        })));
    }, []);

    const handleReorderRoles = useCallback((fromIdx: number, toIdx: number) => {
        setSkillGroups(prev => {
            // Build the same flat mapping that allRolesWithShadowing uses (non-shadowing rows only)
            const flat: { groupIdx: number; roleIdx: number }[] = [];
            prev.forEach((g, gi) => g.roles.forEach((_, ri) => flat.push({ groupIdx: gi, roleIdx: ri })));

            if (fromIdx >= flat.length || toIdx >= flat.length || fromIdx === toIdx) return prev;

            const { groupIdx: fromGi, roleIdx: fromRi } = flat[fromIdx];
            const { groupIdx: toGi, roleIdx: toRi } = flat[toIdx];

            // Deep-copy the affected groups' roles arrays
            const next = prev.map(g => ({ ...g, roles: [...g.roles] }));
            const [removed] = next[fromGi].roles.splice(fromRi, 1);
            next[toGi].roles.splice(toRi, 0, removed);
            return next;
        });
    }, []);

    return {
        employees, setEmployees,
        shifts, setShifts,
        skillGroups, setSkillGroups,
        currentWeek, weekDays,
        isAiLoading,
        activeTab, setActiveTab,
        isModalOpen, setIsModalOpen,
        isNotificationsOpen, setIsNotificationsOpen,
        isHistoryView, setIsHistoryView,
        editingEmployee, setEditingEmployee,
        editingGroup, setEditingGroup,
        editingRole, setEditingRole,
        isAddMenuOpen, setIsAddMenuOpen,
        cancelConf, setCancelConf,
        deleteConf, deleteTimer,
        roleTabFilters, selectedDept, setSelectedDept,
        shadowingRows, allRolesWithShadowing,
        filteredSkillGroups, // exported so PlannerDashboard doesn't need its own duplicate memo
        activeNotifications, notificationsHistory,
        markAsRead, markAllAsRead,
        handleAiOptimize, addManualShift, deleteShift,
        handleOpenAddModal, handleOpenEditModal, handleSaveEmployee,
        confirmDeleteAction, handleCloseModal, handlePreviousWeek, handleNextWeek,
        handleCloseDeleteConf, handleExport, toggleShadowing, toggleDepartmentFilter,
        handleDeleteEmployee, handleAddRow, handleReorderRoles, handleEditRow
    };
};
