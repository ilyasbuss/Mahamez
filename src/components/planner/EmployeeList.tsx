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
    const [employeeSort, setEmployeeSort] = useState<{ key: 'name' | 'roles', direction: 'asc' | 'desc' | null }>({ key: null, direction: null });

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

    return (
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
                                <td className="px-4 py-2 flex items-center space-x-3">
                                    <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-[#4B2C82] font-bold text-xs">
                                        {getDisplayNameInitials(e)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-700 text-sm leading-tight">{e.name}</div>
                                        <div className="text-[10px] text-slate-400">{e.email || 'Keine Email'} • {e.role}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex flex-wrap gap-1">
                                        {e.skillAssignments
                                            .sort((a, b) => b.skill.localeCompare(a.skill))
                                            .slice(0, 3)
                                            .map((sa, i) => (
                                                <span key={i} className="bg-purple-50 text-[#4B2C82] border border-purple-100 px-1.5 py-0.5 rounded-md text-[10px] font-medium">
                                                    {sa.skill}
                                                </span>
                                            ))
                                        }
                                        {e.skillAssignments.length > 3 && (
                                            <span className="text-[9px] text-slate-400 self-center">+{e.skillAssignments.length - 3}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <button onClick={() => onEdit(e)} className="p-1 text-slate-400 hover:text-[#4B2C82] transition">
                                        <Edit2 size={13} />
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
