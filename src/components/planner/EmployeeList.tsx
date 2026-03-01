import React, { useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import { Employee, SkillGroup } from '../../types';

interface EmployeeListProps {
    employees: Employee[];
    skillGroups: SkillGroup[];
    onEdit: (e: Employee) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, skillGroups, onEdit }) => {
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [employeeSort, setEmployeeSort] = useState<{ key: 'name' | 'roles', direction: 'asc' | 'desc' | null }>({ key: null, direction: null });

    const departments: string[] = ['Radio-Redaktion', 'Online-Redaktion', 'Sounddesign'];

    const toggleDepartment = (dept: string) => {
        setSelectedDepartments(prev =>
            prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
        );
    };

    const getDisplayNameInitials = (employee: Employee): string => {
        if (employee.editorialMemberships && employee.editorialMemberships.length > 0) {
            return employee.editorialMemberships
                .map(dept => dept.charAt(0).toUpperCase())
                .join('');
        }

        const deptWeights: Record<string, number> = {};

        employee.skillAssignments.forEach(sa => {
            const group = skillGroups.find(g => g.roles.some(r => r.name === sa.skill));
            if (group && group.departments.length > 0) {
                const primaryDept = group.departments[0];
                deptWeights[primaryDept] = (deptWeights[primaryDept] || 0) + sa.percentage;
            }
        });

        let dominantDept = '';
        let maxWeight = -1;

        Object.entries(deptWeights).forEach(([dept, weight]) => {
            if (weight > maxWeight) {
                maxWeight = weight;
                dominantDept = dept;
            }
        });

        if (!dominantDept) return employee.name.charAt(0).toUpperCase();
        return dominantDept.charAt(0).toUpperCase();
    };

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

        if (selectedDepartments.length > 0) {
            result = result.filter(e =>
                e.departments.some(d => selectedDepartments.includes(d))
            );
        }

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
    }, [employees, employeeSearchTerm, employeeSort, selectedDepartments]);

    return (
        <div className="space-y-2.5">
            <div className="bg-white p-3 border rounded-3xl shadow-sm flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Personen oder Rollen suchen..." 
                        value={employeeSearchTerm} 
                        onChange={(e) => setEmployeeSearchTerm(e.target.value)} 
                        className="w-full pl-11 pr-10 py-2.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#4B2C82]/10 font-bold text-sm transition-all" 
                    />
                </div>
            </div>
            <div className="flex flex-wrap gap-2 px-1">
                {departments.map(dept => (
                    <button
                        key={dept}
                        onClick={() => toggleDepartment(dept)}
                        className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${selectedDepartments.includes(dept)
                            ? 'bg-[#4B2C82] text-white shadow-lg shadow-purple-900/20'
                            : 'bg-white text-slate-400 hover:bg-slate-50'
                        }`}
                    >
                        {dept}
                    </button>
                ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    Team
                                    <button onClick={() => toggleEmployeeSort('name')} className={`p-1 rounded-lg hover:bg-slate-200 transition ${employeeSort.key === 'name' ? 'text-[#4B2C82]' : 'text-slate-300'}`}>
                                        {employeeSort.key === 'name' && employeeSort.direction === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                                    </button>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    Primäre Rollen
                                    <button onClick={() => toggleEmployeeSort('roles')} className={`p-1 rounded-lg hover:bg-slate-200 transition ${employeeSort.key === 'roles' ? 'text-[#4B2C82]' : 'text-slate-300'}`}>
                                        {employeeSort.key === 'roles' && employeeSort.direction === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                                    </button>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Aktion</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredEmployees.map(e => (
                            <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-2.5">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-9 h-9 rounded-2xl bg-purple-50 flex items-center justify-center text-[#4B2C82] font-bold text-xs shadow-sm border border-purple-100/50">
                                            {getDisplayNameInitials(e)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-[13px] uppercase tracking-tight leading-none mb-1">{e.name}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{e.email || 'Keine Email'} • {e.role}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-2.5">
                                    <div className="flex flex-wrap gap-1.5">
                                        {e.skillAssignments
                                            .sort((a, b) => b.skill.localeCompare(a.skill))
                                            .slice(0, 3)
                                            .map((sa, i) => (
                                                <span key={i} className="bg-white text-[#4B2C82] border border-slate-100 px-2 py-1 rounded-xl text-[10px] font-bold shadow-sm uppercase tracking-tight">
                                                    {sa.skill}
                                                </span>
                                            ))
                                        }
                                        {e.skillAssignments.length > 3 && (
                                            <span className="text-[10px] font-bold text-slate-300 self-center ml-1">+{e.skillAssignments.length - 3}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-2.5 text-right">
                                    <button onClick={() => onEdit(e)} className="p-2 text-slate-300 hover:text-[#4B2C82] hover:bg-white rounded-xl transition-all shadow-sm opacity-0 group-hover:opacity-100 border border-transparent hover:border-slate-100">
                                        <Edit2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeList;
