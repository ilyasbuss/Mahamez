import React, { useMemo } from 'react';
import {
  format,
  getISOWeek
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  Users,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  BarChart3,
  LayoutGrid,
  AlertTriangle,
  Clock,
  PlusCircle,
  Tag,
  Download,
  Send,
  MessageSquareWarning,
  Settings2,
  GripVertical,
  LogOut,
  User,
  Calendar
} from 'lucide-react';
import MahamezLogo from '../components/MahamezLogo';
import MyShifts from '../components/employee/MyShifts';
import AvailabilityCalendar from '../components/employee/AvailabilityCalendar';
import DatePickerPopup from '../components/employee/DatePickerPopup';
import { PartialAvailability, Redaktion, SkillGroup, CalendarEvent } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

import { COLORS, HOURS_PER_SHIFT } from '../constants';
import EditEmployeeModal from '../components/planner/EditEmployeeModal';
import ShiftCalendar from '../components/planner/ShiftCalendar';
import EmployeeList from '../components/planner/EmployeeList';
import RulesConfig from '../components/planner/RulesConfig';
import DeleteConfirmationModal from '../components/planner/DeleteConfirmationModal';
import RoleEditorModal from '../components/planner/RoleEditorModal';
import GroupEditorModal from '../components/planner/GroupEditorModal';
import RedaktionManagerModal from '../components/planner/RedaktionManagerModal';
import NotificationPopover from '../components/planner/NotificationPopover';
import WeeklyViewMockups from '../components/planner/WeeklyViewMockups';
import { usePlannerDashboard } from '../hooks/usePlannerDashboard';
import { useAuth } from '../services/AuthContext';

const PlannerDashboard: React.FC = () => {
  const {
    employees,
    shifts, setShifts,
    skillGroups, setSkillGroups,
    currentWeek, weekDays,
    isAiLoading,
    activeTab, setActiveTab,
    isModalOpen,
    isNotificationsOpen, setIsNotificationsOpen,
    isHistoryView, setIsHistoryView,
    editingEmployee,
    editingGroup, setEditingGroup,
    editingRole, setEditingRole,
    isAddMenuOpen, setIsAddMenuOpen,
    cancelConf, setCancelConf,
    deleteConf, deleteTimer,
    redaktionen, handleAddRedaktion, handleDeleteRedaktion,
    roleTabFilters, selectedDept, setSelectedDept,
    shadowingRows, allRolesWithShadowing,
    activeNotifications, notificationsHistory,
    markAsRead,
    handleAiOptimize, addManualShift, deleteShift,
    handleDeleteRole, handleDeleteGroup,
    handleOpenAddModal, handleOpenEditModal, handleSaveEmployee,
    confirmDeleteAction, handleCloseModal, handlePreviousWeek, handleNextWeek,
    handleCloseDeleteConf, handleExport, toggleShadowing, toggleDepartmentFilter,
    handleDeleteEmployee, handleAddRow, handleReorderRoles, handleEditRow, handleReorderRoleInGroup,
    filteredSkillGroups, rolesTabSkillGroups,
    hasUnpublishedChanges, handlePublish,
    availability, handleAvailabilityChange, isSaving, lastSaved,
    events, handleSaveEvent, handleDeleteEvent
  } = usePlannerDashboard();

  const { logout } = useAuth();

  const [draggedRole, setDraggedRole] = React.useState<{ groupId: string; index: number } | null>(null);
  const [dragOverRole, setDragOverRole] = React.useState<{ groupId: string; index: number } | null>(null);

  const [isRedaktionManagerOpen, setIsRedaktionManagerOpen] = React.useState(false);

  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const [isEventModalOpen, setIsEventModalOpen] = React.useState(false);
  const [newEventName, setNewEventName] = React.useState('');
  const [newEventStart, setNewEventStart] = React.useState('');
  const [newEventEnd, setNewEventEnd] = React.useState('');

  const onSaveEvent = () => {
    if (!newEventName.trim() || !newEventStart || !newEventEnd) return;
    const ev: CalendarEvent = {
      id: Date.now().toString(),
      name: newEventName.trim(),
      startDate: newEventStart,
      endDate: newEventEnd,
      planIds: [], // Event applies to all now as requested
    };
    handleSaveEvent(ev);
    setIsEventModalOpen(false);
    setNewEventName('');
    setNewEventStart('');
    setNewEventEnd('');
  };

  const statsData = useMemo(() => {
    // ISO date strings are lexicographically comparable — no need to call parseISO twice per shift
    const startStr = format(weekDays[0], 'yyyy-MM-dd');
    const endStr = format(weekDays[6], 'yyyy-MM-dd');
    return employees.map(emp => {
      const hours = shifts.filter(s => s.employeeId === emp.id && s.date >= startStr && s.date <= endStr).length * HOURS_PER_SHIFT;
      return { name: emp.name, hours, limit: emp.maxHoursPerWeek, over: hours > emp.maxHoursPerWeek };
    });
  }, [employees, shifts, weekDays]);

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
        <div className="pt-2 border-t border-white/10 space-y-0.5">
          <button onClick={() => setActiveTab('my-shifts')} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition ${activeTab === 'my-shifts' ? 'bg-[#4B2C82]' : 'hover:bg-white/10'}`}><User size={18} /><span>Meine Schichten</span></button>
          <button onClick={() => setActiveTab('my-availability')} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition ${activeTab === 'my-availability' ? 'bg-[#4B2C82]' : 'hover:bg-white/10'}`}><Calendar size={18} /><span>Verfügbarkeiten eintragen</span></button>
        </div>
        <div className="mt-auto pt-3 border-t border-white/10">
          <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition text-red-400 hover:bg-red-500/10 hover:text-red-300">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-4 overflow-y-auto bg-[#f8fafc]">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800 w-[220px] shrink-0">
              {activeTab === 'calendar' ? 'Aktueller Dienstplan' :
                activeTab === 'new-plan' ? 'Neuer Dienstplan' :
                  activeTab === 'employees' ? 'Personalverwaltung' :
                    activeTab === 'roles' ? 'Rollenverwaltung' :
                      activeTab === 'rules' ? 'Dienstplanregeln' :
                        activeTab === 'my-shifts' ? 'Meine Schichten' :
                          activeTab === 'my-availability' ? 'Meine Verfügbarkeiten' : 'Auslastung & Analyse'}
            </h1>
            {(activeTab === 'calendar' || activeTab === 'new-plan') && (
              <div className="flex items-center bg-white border rounded-xl px-1 py-0.5 shadow-sm">
                <button onClick={handlePreviousWeek} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-[#4B2C82] transition"><ChevronLeft size={14} /></button>
                <button className="px-2 py-0.5 font-semibold text-slate-700 text-xs flex items-center gap-2"><span className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">KW {getISOWeek(currentWeek)}</span><span>{format(weekDays[0], 'dd.MM.')} - {format(weekDays[6], 'dd.MM.yyyy')}</span></button>
                <button onClick={handleNextWeek} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-[#4B2C82] transition"><ChevronRight size={14} /></button>
              </div>
            )}
          </div>

          {(activeTab === 'calendar' || activeTab === 'new-plan' || activeTab === 'rules') && (
            <div className="flex justify-center flex-1 order-3 md:order-none w-full md:w-auto gap-3">
              {activeTab === 'calendar' && (
                <button
                  onClick={handlePublish}
                  disabled={!hasUnpublishedChanges}
                  className={`px-8 h-9 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${hasUnpublishedChanges
                    ? 'bg-[#4B2C82] hover:bg-[#5B3798] text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                >
                  <Send size={16} className={hasUnpublishedChanges ? 'text-[#9F7AEA]' : 'text-slate-300'} />
                  <span>Veröffentlichen</span>
                </button>
              )}
              {activeTab === 'new-plan' ? (
                <>
                  <button
                    onClick={() => setIsEventModalOpen(true)}
                    className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-6 h-9 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2"
                  >
                    <CalendarIcon size={15} className="text-[#4B2C82]" />
                    <span>Event erstellen</span>
                  </button>
                  <button onClick={handleAiOptimize} disabled={isAiLoading} className="bg-[#4B2C82] hover:bg-[#5B3798] text-white px-8 h-9 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
                    <Sparkles size={16} className="text-[#9F7AEA]" />
                    <span>Autofill</span>
                  </button>
                </>
              ) : activeTab === 'rules' ? (
                <button onClick={handleAiOptimize} disabled={isAiLoading} className="bg-[#4B2C82] hover:bg-[#5B3798] text-white px-8 h-9 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
                  {isAiLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <><Sparkles size={16} className="text-[#9F7AEA]" /><span>Regel erstellen</span></>}
                </button>
              ) : null}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {activeTab === 'employees' && (
              <button onClick={handleOpenAddModal} className="bg-[#4B2C82] text-white p-2 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-black/10 hover:bg-[#5B3798] transition-all"><Plus size={18} /></button>
            )}

            {activeTab === 'roles' && (
              <div className="relative">
                <button onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} className="bg-[#4B2C82] text-white px-3 py-1.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-black/10 hover:bg-[#5B3798] transition-all"><Plus size={18} /><span>Hinzufügen</span></button>
                {isAddMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button onClick={() => {
                      const newGrp: SkillGroup = { id: `${Date.now()}`, title: '', roles: [], departments: [] };
                      setEditingGroup(newGrp);
                      setIsAddMenuOpen(false);
                    }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-bold text-slate-700 flex items-center gap-2.5 border-b transition-colors"><LayoutGrid size={16} className="text-[#4B2C82]" />Gruppe hinzufügen</button>
                    <button onClick={() => {
                      const newRol = { role: { name: '', startTime: '08:00', endTime: '17:00', defaultPercentage: 100, defaultPriority: 2 }, groupId: skillGroups[0]?.id || '', isNew: true };
                      setEditingRole(newRol);
                      setIsAddMenuOpen(false);
                    }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-bold text-slate-700 flex items-center gap-2.5 transition-colors"><PlusCircle size={16} className="text-[#4B2C82]" />Rolle hinzufügen</button>
                  </div>
                )}
              </div>
            )}

            {(activeTab === 'calendar' || activeTab === 'new-plan') && (
              <div className="flex items-center gap-1 relative">
                <button onClick={handleExport} className="p-1.5 bg-white border rounded-xl text-slate-400 hover:text-[#4B2C82] transition shadow-sm" title="Dienstplan exportieren"><Download size={16} /></button>
                <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={`p-1.5 bg-white border rounded-xl transition shadow-sm relative ${isNotificationsOpen ? 'text-[#4B2C82] border-[#4B2C82]/30 ring-2 ring-[#4B2C82]/10' : 'text-slate-400 hover:text-[#4B2C82]'}`} title="Benachrichtigungen"><MessageSquareWarning size={16} />{activeNotifications.length > 0 && (<span className={`absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 border border-white rounded-full`}></span>)}</button>

                <NotificationPopover
                  isOpen={isNotificationsOpen}
                  isHistoryView={isHistoryView}
                  activeNotifications={activeNotifications}
                  notificationsHistory={notificationsHistory}
                  onClose={() => setIsNotificationsOpen(false)}
                  onMarkAsRead={markAsRead}
                  onSetHistoryView={setIsHistoryView}
                />
              </div>
            )}
          </div>
        </header>

        {(activeTab === 'calendar' || activeTab === 'new-plan') && (
          <div className="flex gap-2 mb-4">
            {['Alle', 'Radioredaktion', 'Moderation', 'Onlineredaktion'].map((dept) => (
              <button
                key={dept}
                onClick={() => {
                  setSelectedDept(dept);
                }}
                className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${selectedDept === dept
                  ? 'bg-[#4B2C82] text-white shadow-lg shadow-purple-900/20'
                  : 'bg-white text-slate-400 hover:bg-slate-50'
                  }`}
              >
                {dept}
              </button>
            ))}
          </div>
        )}

        {(activeTab === 'calendar' || activeTab === 'new-plan') && (
          <ShiftCalendar
            weekDays={weekDays}
            shifts={shifts}
            employees={employees}
            allRolesWithShadowing={allRolesWithShadowing}
            shadowingRows={shadowingRows}
            onToggleShadowing={toggleShadowing}
            onDeleteShift={deleteShift}
            onAddShift={addManualShift}
            isNewPlanView={activeTab === 'new-plan'}
            onAddRow={handleAddRow}
            onReorder={handleReorderRoles}
            onEditRow={handleEditRow}
            events={events}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeeList employees={employees} skillGroups={skillGroups} onEdit={handleOpenEditModal} />
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button onClick={() => toggleDepartmentFilter(roleTabFilters[0])} className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${roleTabFilters.length === 0 ? 'bg-[#4B2C82] text-white shadow-lg shadow-purple-900/20' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>Alle anzeigen</button>
              {redaktionen.map(dept => {
                const isActive = roleTabFilters.includes(dept);
                return (
                  <button key={dept} onClick={() => toggleDepartmentFilter(dept)} className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${isActive ? 'bg-[#4B2C82] text-white shadow-lg shadow-purple-900/20' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>
                    {dept}
                  </button>
                );
              })}
              <button
                onClick={() => setIsRedaktionManagerOpen(true)}
                className="ml-auto p-2.5 text-slate-300 hover:text-[#4B2C82] hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 shadow-sm"
                title="Redaktionen verwalten"
              >
                <Edit2 size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {rolesTabSkillGroups.map(group => (
                <div key={group.id} className="bg-white border border-slate-200 rounded-[2rem] shadow-sm flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                  <div className="p-4 border-b border-slate-100 flex flex-col gap-1 bg-slate-50/50 rounded-t-[2rem]">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 flex items-center gap-3 text-[16px] uppercase tracking-tight">
                        <div className="p-2 bg-purple-50 rounded-xl border border-purple-100/50"><LayoutGrid size={16} className="text-[#4B2C82]" /></div>
                        {group.title}
                      </h3>
                      <button onClick={() => setEditingGroup(group)} className="p-2 text-slate-300 hover:text-[#4B2C82] transition rounded-xl hover:bg-white border border-transparent hover:border-slate-100 shadow-sm"><Edit2 size={14} /></button>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 flex-1">
                    {group.roles.map((role, rIdx) => (
                      <div
                        key={role.name}
                        draggable
                        onDragStart={() => setDraggedRole({ groupId: group.id, index: rIdx })}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverRole({ groupId: group.id, index: rIdx });
                        }}
                        onDragEnd={() => {
                          if (draggedRole && dragOverRole && draggedRole.groupId === dragOverRole.groupId) {
                            handleReorderRoleInGroup(draggedRole.groupId, draggedRole.index, dragOverRole.index);
                          }
                          setDraggedRole(null);
                          setDragOverRole(null);
                        }}
                        className={`flex flex-col gap-1 py-3 px-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-purple-50/50 hover:border-purple-100 transition-all relative group/item
                            ${draggedRole?.groupId === group.id && draggedRole?.index === rIdx ? 'opacity-30' : ''}
                            ${dragOverRole?.groupId === group.id && dragOverRole?.index === rIdx ? 'border-t-2 border-t-[#4B2C82]' : ''}
                          `}
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-slate-300 cursor-grab active:cursor-grabbing hover:text-[#4B2C82] transition-colors">
                            <GripVertical size={14} />
                          </div>
                          <span className="font-bold text-slate-900 text-[13px] uppercase tracking-tight leading-none pr-8">{role.name}</span>
                        </div>
                        <div className="flex items-center gap-3 pl-6">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1"><Clock size={12} className="text-slate-300" /> {role.startTime} - {role.endTime}</span>
                          <div className="bg-white border border-slate-100 px-1.5 py-0.5 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">Prio {role.defaultPriority}</div>
                        </div>
                        <button onClick={() => setEditingRole({ role, groupId: group.id })} className="absolute top-3 right-3 opacity-0 group-hover/item:opacity-100 transition-opacity p-1.5 text-slate-300 hover:text-[#4B2C82] bg-white rounded-lg border border-slate-100 shadow-sm"><Edit2 size={14} /></button>
                      </div>
                    ))}
                    <button onClick={() => setEditingRole({ role: { name: '', startTime: '08:00', endTime: '17:00', defaultPercentage: 100, defaultPriority: 2 }, groupId: group.id, isNew: true })} className="w-full py-3 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:border-[#4B2C82]/30 hover:text-[#4B2C82] transition-all flex items-center justify-center gap-2 mt-2 bg-slate-50/20"><Plus size={12} /> Rolle hinzufügen</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rules' && <RulesConfig />}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-white p-4 border rounded-2xl shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800"><BarChart3 size={18} className="text-[#4B2C82]" /> Auslastung (Stunden)</h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData}>
                    <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} />
                    <YAxis fontSize={9} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                      {statsData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.over ? '#ef4444' : COLORS[index % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 border rounded-[2rem] shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-xl text-[#4B2C82]">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Mockups: Wochenansicht Konzepte</h3>
                  <p className="text-sm text-slate-500 font-medium">Verschiedene Ansätze für eine effiziente Wochenplanung</p>
                </div>
              </div>
              <WeeklyViewMockups />
            </div>
          </div>
        )}

        {activeTab === 'my-shifts' && (
          <MyShifts />
        )}

        {activeTab === 'my-availability' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Verfügbarkeiten verwalten</h2>
            </div>
            <AvailabilityCalendar
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              onMonthJump={setCurrentMonth}
              availability={availability}
              onAvailabilityChange={handleAvailabilityChange}
              isSaving={isSaving}
              lastSaved={lastSaved}
              events={events}
            />
          </div>
        )}
      </main>

      {/* Modals and Confirms */}
      {cancelConf.isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1D0B40]/70 backdrop-blur-lg">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 text-center animate-in zoom-in duration-200">
            <div className="mx-auto w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3"><AlertTriangle size={20} /></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Abbrechen?</h3>
            <p className="text-sm text-slate-400 mb-6">Nicht gespeicherte Daten gehen verloren.</p>
            <div className="flex gap-3">
              <button onClick={() => setCancelConf({ isOpen: false, onConfirm: () => { } })} className="flex-1 py-2 text-slate-500 font-bold">Nein</button>
              <button onClick={cancelConf.onConfirm} className="flex-1 py-2 bg-[#4B2C82] text-white rounded-2xl font-bold hover:bg-[#5B3798]">Ja</button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        {...deleteConf}
        timer={deleteTimer}
        onConfirm={confirmDeleteAction}
        onClose={handleCloseDeleteConf}
      />

      {editingRole && (
        <RoleEditorModal
          editingRole={editingRole}
          skillGroups={skillGroups}
          redaktionen={redaktionen}
          onSetEditingRole={setEditingRole}
          onSave={() => {
            const { role, groupId, isNew } = editingRole;
            setSkillGroups(prev => prev.map(g => {
              if (g.id === groupId) {
                if (isNew) {
                  return { ...g, roles: [...g.roles, role] };
                } else {
                  return { ...g, roles: g.roles.map(r => r.name === role.name ? role : r) };
                }
              }
              return g;
            }));
            setEditingRole(null);
          }}
          onClose={handleCloseModal}
          onDelete={handleDeleteRole}
        />
      )}

      {editingGroup && (
        <GroupEditorModal
          editingGroup={editingGroup}
          onSetEditingGroup={setEditingGroup}
          onSave={() => {
            setSkillGroups(prev => {
              const exists = prev.find(g => g.id === editingGroup.id);
              if (exists) {
                return prev.map(g => g.id === editingGroup.id ? editingGroup : g);
              } else {
                return [...prev, editingGroup];
              }
            });
            setEditingGroup(null);
          }}
          onClose={handleCloseModal}
          onDelete={handleDeleteGroup}
        />
      )}

      {isRedaktionManagerOpen && (
        <RedaktionManagerModal
          redaktionen={redaktionen}
          onAdd={handleAddRedaktion}
          onDelete={handleDeleteRedaktion}
          onClose={() => setIsRedaktionManagerOpen(false)}
        />
      )}

      <EditEmployeeModal
        isOpen={isModalOpen && !!editingEmployee}
        employee={editingEmployee}
        skillGroups={skillGroups}
        redaktionen={redaktionen}
        allEmployees={employees}
        onClose={handleCloseModal}
        onSave={handleSaveEmployee}
        onDelete={handleDeleteEmployee}
      />

      {/* Event Creation Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1D0B40]/70 backdrop-blur-lg">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-slate-800">Event erstellen</h3>
              <button onClick={() => setIsEventModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Name</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Name eingeben..."
                  value={newEventName}
                  onChange={e => setNewEventName(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#4B2C82] font-bold text-slate-800 bg-slate-50"
                />
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Von</label>
                  <DatePickerPopup value={newEventStart} onChange={setNewEventStart} placeholder="Startdatum" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bis</label>
                  <DatePickerPopup value={newEventEnd} onChange={setNewEventEnd} min={newEventStart || undefined} placeholder="Enddatum" />
                </div>
              </div>

              {/* Existing events list */}
              {events.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bestehende Events</label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {events.map(ev => (
                      <div key={ev.id} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <span className="font-bold text-sm text-slate-700">{ev.name}</span>
                          <span className="ml-2 text-[10px] text-slate-400">{ev.startDate} – {ev.endDate}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(ev)}
                          className="text-slate-300 hover:text-red-400 transition-all p-0.5 rounded"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  className="flex-1 py-2.5 border-2 border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Abbrechen
                </button>
                <button
                  onClick={onSaveEvent}
                  disabled={!newEventName.trim() || !newEventStart || !newEventEnd}
                  className="flex-1 py-2.5 bg-[#4B2C82] text-white rounded-2xl font-bold hover:bg-[#5B3798] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Event speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerDashboard;