import React, { useMemo } from 'react';
import {
  format,
  parseISO,
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
  MessageSquareWarning,
  Settings2
} from 'lucide-react';
import MahamezLogo from '../components/MahamezLogo';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

import { Redaktion, SkillGroup } from '../types';
import { COLORS, REDAKTIONS_OPTIONEN, HOURS_PER_SHIFT } from '../constants';
import EditEmployeeModal from '../components/planner/EditEmployeeModal';
import ShiftCalendar from '../components/planner/ShiftCalendar';
import EmployeeList from '../components/planner/EmployeeList';
import RulesConfig from '../components/planner/RulesConfig';
import DeleteConfirmationModal from '../components/planner/DeleteConfirmationModal';
import RoleEditorModal from '../components/planner/RoleEditorModal';
import GroupEditorModal from '../components/planner/GroupEditorModal';
import NotificationPopover from '../components/planner/NotificationPopover';
import { usePlannerDashboard } from '../hooks/usePlannerDashboard';

const PlannerDashboard: React.FC = () => {
  const {
    employees,
    shifts,
    skillGroups,
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
    roleTabFilters, selectedDept, setSelectedDept,
    shadowingRows, allRolesWithShadowing,
    activeNotifications, notificationsHistory,
    markAsRead,
    handleAiOptimize, addManualShift, deleteShift,
    handleOpenAddModal, handleOpenEditModal, handleSaveEmployee,
    confirmDeleteAction, handleCloseModal, handlePreviousWeek, handleNextWeek,
    handleCloseDeleteConf, handleExport, toggleShadowing, toggleDepartmentFilter
  } = usePlannerDashboard();

  const statsData = useMemo(() => employees.map(emp => {
    const hours = shifts.filter(s => s.employeeId === emp.id && (parseISO(s.date) >= weekDays[0] && parseISO(s.date) <= weekDays[6])).length * HOURS_PER_SHIFT;
    return { name: emp.name, hours, limit: emp.maxHoursPerWeek, over: hours > emp.maxHoursPerWeek };
  }), [employees, shifts, weekDays]);

  const filteredSkillGroups = useMemo(() => {
    if (selectedDept === 'Moderation') return skillGroups.filter(g => g.id === 'g_moderation');
    if (selectedDept === 'Onlineredaktion') return skillGroups.filter(g => g.departments.includes('Online-Redaktion'));
    return skillGroups.filter(g => g.departments.includes('Radio-Redaktion') && g.id !== 'g_moderation');
  }, [skillGroups, selectedDept]);

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
                <button onClick={handlePreviousWeek} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-[#4B2C82] transition"><ChevronLeft size={14} /></button>
                <button className="px-2 py-0.5 font-semibold text-slate-700 text-xs flex items-center gap-2"><span className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">KW {getISOWeek(currentWeek)}</span><span>{format(weekDays[0], 'dd.MM.')} - {format(weekDays[6], 'dd.MM.yyyy')}</span></button>
                <button onClick={handleNextWeek} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-[#4B2C82] transition"><ChevronRight size={14} /></button>
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
            {['Radioredaktion', 'Moderation', 'Onlineredaktion'].map((dept) => (
              <button
                key={dept}
                onClick={() => {
                  setSelectedDept(dept);
                  // Handled by selectedDept in filteredSkillGroups
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
          />
        )}

        {activeTab === 'employees' && (
          <EmployeeList employees={employees} skillGroups={skillGroups} onEdit={handleOpenEditModal} />
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border shadow-sm flex-wrap">
              <button onClick={() => toggleDepartmentFilter(roleTabFilters[0]) /* Simplified for logic */} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${roleTabFilters.length === 0 ? 'bg-[#4B2C82] text-white shadow-lg shadow-black/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Alle anzeigen</button>
              {REDAKTIONS_OPTIONEN.map(dept => {
                const isActive = roleTabFilters.includes(dept);
                return (
                  <button key={dept} onClick={() => toggleDepartmentFilter(dept)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isActive ? 'bg-[#4B2C82] text-white shadow-lg shadow-black/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                    {dept}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredSkillGroups.map(group => (
                <div key={group.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                  <div className="p-3 border-b flex flex-col gap-1 bg-slate-50/50 rounded-t-3xl text-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                        <div className="p-1 bg-purple-100 rounded-lg"><LayoutGrid size={12} className="text-[#4B2C82]" /></div>
                        {group.title}
                      </h3>
                      <button onClick={() => setEditingGroup(group)} className="p-1 text-slate-400 hover:text-[#4B2C82] transition rounded-lg hover:bg-white"><Edit2 size={12} /></button>
                    </div>
                  </div>
                  <div className="p-3 space-y-2 flex-1">
                    {group.roles.map(role => (
                      <div key={role.name} className="flex flex-col gap-1 p-2 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-purple-50/50 hover:border-purple-100 transition relative group/item">
                        <span className="font-bold text-slate-700 text-[16px] leading-tight block pr-8">{role.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] text-slate-400 font-bold flex items-center gap-1"><Clock size={12} /> {role.startTime} - {role.endTime}</span>
                          <div className="bg-white border px-1 py-0.5 rounded text-[10px] font-bold text-slate-400 shrink-0">Prio {role.defaultPriority}</div>
                        </div>
                        <button onClick={() => setEditingRole({ role, groupId: group.id })} className="absolute top-2 right-2 opacity-0 group-hover/item:opacity-100 transition-opacity p-1 text-slate-300 hover:text-[#4B2C82]"><Edit2 size={12} /></button>
                      </div>
                    ))}
                    <button onClick={() => setEditingRole({ role: { name: '', startTime: '08:00', endTime: '17:00', defaultPercentage: 100, defaultPriority: 2 }, groupId: group.id, isNew: true })} className="w-full py-2 border-2 border-dashed border-slate-100 rounded-2xl text-[9px] font-bold text-slate-300 uppercase tracking-widest hover:border-[#4B2C82]/20 hover:text-[#4B2C82] transition-all flex items-center justify-center gap-2 mt-1"><Plus size={10} /> Rolle hinzufügen</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rules' && <RulesConfig />}

        {activeTab === 'stats' && (
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
          onSetEditingRole={setEditingRole}
          onSave={() => {
            // Save logic
            setEditingRole(null);
          }}
          onClose={handleCloseModal}
          onDelete={(groupId, roleName) => {
            // Delete logic
          }}
        />
      )}

      {editingGroup && (
        <GroupEditorModal
          editingGroup={editingGroup}
          onSetEditingGroup={setEditingGroup}
          onSave={() => {
            // Save logic
            setEditingGroup(null);
          }}
          onClose={handleCloseModal}
          onDelete={(groupId) => {
            // Delete logic
          }}
        />
      )}

      <EditEmployeeModal
        isOpen={isModalOpen && !!editingEmployee}
        employee={editingEmployee}
        skillGroups={skillGroups}
        onClose={handleCloseModal}
        onSave={handleSaveEmployee}
      />
    </div>
  );
};

export default PlannerDashboard;