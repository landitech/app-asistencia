import React, { useMemo } from 'react';
import { Teacher, Student, Subject, AttendanceStatus, AttendanceData } from '../types';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';
import ClockIcon from './icons/ClockIcon';
import LogoutIcon from './icons/LogoutIcon';
import PencilRulerIcon from './icons/PencilRulerIcon';
import CalendarIcon from './icons/CalendarIcon';
import ClipboardCheckIcon from './icons/ClipboardCheckIcon';
import ChartPieIcon from './icons/ChartPieIcon';
import UsersIcon from './icons/UsersIcon';

interface AttendanceSheetProps {
  teacher: Teacher;
  students: Student[];
  subjects: Subject[];
  onLogout: () => void;
  attendance: AttendanceData;
  onAttendanceChange: (studentId: string, subjectId: string, date: string, status: AttendanceStatus) => void;
  selectedSubjectId: string;
  onSubjectChange: (id: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const subjectColors = [
  { bg: 'bg-red-200', text: 'text-red-800', hoverBg: 'hover:bg-red-300', ring: 'ring-red-500' },
  { bg: 'bg-sky-200', text: 'text-sky-800', hoverBg: 'hover:bg-sky-300', ring: 'ring-sky-500' },
  { bg: 'bg-indigo-200', text: 'text-indigo-800', hoverBg: 'hover:bg-indigo-300', ring: 'ring-indigo-500' },
  { bg: 'bg-teal-200', text: 'text-teal-800', hoverBg: 'hover:bg-teal-300', ring: 'ring-teal-500' },
  { bg: 'bg-rose-200', text: 'text-rose-800', hoverBg: 'hover:bg-rose-300', ring: 'ring-rose-500' },
  { bg: 'bg-amber-200', text: 'text-amber-800', hoverBg: 'hover:bg-amber-300', ring: 'ring-amber-500' },
  { bg: 'bg-emerald-200', text: 'text-emerald-800', hoverBg: 'hover:bg-emerald-300', ring: 'ring-emerald-500' },
  { bg: 'bg-slate-200', text: 'text-slate-800', hoverBg: 'hover:bg-slate-300', ring: 'ring-slate-500' },
];


const AttendanceSheet: React.FC<AttendanceSheetProps> = ({ 
  teacher, 
  students, 
  subjects, 
  onLogout, 
  attendance, 
  onAttendanceChange,
  selectedSubjectId,
  onSubjectChange,
  selectedDate,
  onDateChange
}) => {
  const currentAttendance = useMemo(() => {
    return attendance[selectedDate]?.[selectedSubjectId] || {};
  }, [attendance, selectedDate, selectedSubjectId]);

  const selectedSubject = useMemo(() => {
    return subjects.find(s => s.id === selectedSubjectId);
  }, [subjects, selectedSubjectId]);

  const subjectChartTitle = selectedSubject 
    ? `Asistencia en ${selectedSubject.name}` 
    : 'Asistencia por Asignatura';

  const studentAttendancePercentages = useMemo(() => {
    if (!selectedSubjectId) return {};

    const percentages: Record<string, number> = {};

    students.forEach(student => {
      let presentOrLateCount = 0;
      let totalClasses = 0;

      Object.keys(attendance).forEach(date => {
        const subjectAttendance = attendance[date]?.[selectedSubjectId];
        if (subjectAttendance && typeof subjectAttendance[student.id] !== 'undefined') {
          totalClasses++;
          const status = subjectAttendance[student.id];
          if (status === AttendanceStatus.Present || status === AttendanceStatus.Late) {
            presentOrLateCount++;
          }
        }
      });
      
      percentages[student.id] = totalClasses > 0
        ? (presentOrLateCount / totalClasses) * 100
        : 100;
    });

    return percentages;
  }, [attendance, selectedSubjectId, students]);
  
  const subjectCumulativeSummary = useMemo(() => {
    const stats = { present: 0, absent: 0, late: 0 };
    if (!selectedSubjectId) {
      return stats;
    }

    Object.keys(attendance).forEach(date => {
      const dailySubjectAttendance = attendance[date]?.[selectedSubjectId];
      if (dailySubjectAttendance) {
        Object.values(dailySubjectAttendance).forEach(status => {
          if (stats[status] !== undefined) {
            stats[status]++;
          }
        });
      }
    });

    return stats;
  }, [attendance, selectedSubjectId]);

  const overallCumulativeSummary = useMemo(() => {
    const stats = { present: 0, absent: 0, late: 0 };
    Object.values(attendance).forEach(dailyAttendance => {
      Object.values(dailyAttendance).forEach(subjectAttendance => {
        Object.values(subjectAttendance).forEach(status => {
          if (stats[status] !== undefined) {
            stats[status]++;
          }
        });
      });
    });
    return stats;
  }, [attendance]);
  
  const subjectDonutChartData = useMemo(() => {
    const totalMarked = subjectCumulativeSummary.present + subjectCumulativeSummary.absent + subjectCumulativeSummary.late;
    if (totalMarked === 0) {
      return {
        gradient: `conic-gradient(#e2e8f0 0% 100%)`, // slate-200
      };
    }

    const presentPercent = (subjectCumulativeSummary.present / totalMarked) * 100;
    const absentPercent = (subjectCumulativeSummary.absent / totalMarked) * 100;

    const presentStop = presentPercent;
    const absentStop = presentPercent + absentPercent;
    
    // Using a different color scheme (blue, slate, indigo) to differentiate
    const gradient = `conic-gradient(
      #3b82f6 0% ${presentStop}%, 
      #64748b ${presentStop}% ${absentStop}%, 
      #6366f1 ${absentStop}% 100%
    )`;
    
    return { gradient };
  }, [subjectCumulativeSummary]);


  const overallDonutChartData = useMemo(() => {
    const totalMarked = overallCumulativeSummary.present + overallCumulativeSummary.absent + overallCumulativeSummary.late;
    if (totalMarked === 0) {
      return {
        gradient: `conic-gradient(#e2e8f0 0% 100%)`, // slate-200
      };
    }

    const presentPercent = (overallCumulativeSummary.present / totalMarked) * 100;
    const absentPercent = (overallCumulativeSummary.absent / totalMarked) * 100;

    const presentStop = presentPercent;
    const absentStop = presentPercent + absentPercent;
    
    const gradient = `conic-gradient(
      #10b981 0% ${presentStop}%, 
      #f43f5e ${presentStop}% ${absentStop}%, 
      #f59e0b ${absentStop}% 100%
    )`;
    
    return { gradient };
  }, [overallCumulativeSummary]);


  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    onAttendanceChange(studentId, selectedSubjectId, selectedDate, status);
  };

  const getStatusButtonClass = (studentId: string, status: AttendanceStatus) => {
    const baseClass = "p-2 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110 flex items-center justify-center";
    const isActive = currentAttendance[studentId] === status;
    switch (status) {
      case AttendanceStatus.Present:
        return `${baseClass} ${isActive ? 'bg-emerald-500 text-white shadow-lg' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`;
      case AttendanceStatus.Absent:
        return `${baseClass} ${isActive ? 'bg-rose-500 text-white shadow-lg' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`;
      case AttendanceStatus.Late:
        return `${baseClass} ${isActive ? 'bg-amber-500 text-white shadow-lg' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`;
      default:
        return '';
    }
  };


  return (
    <div className="w-full max-w-7xl">
      <header className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 mb-8 pb-4">
        {/* Title Block - Centered */}
        <div className="flex items-center gap-3 justify-center order-1 sm:order-2">
          <PencilRulerIcon />
          <div className="text-center">
            <h1 className="text-3xl font-bold text-teal-900">Control de Asistencia</h1>
            <p className="text-xs font-bold text-teal-600">Versión 1.0</p>
          </div>
        </div>
        {/* Welcome Block - Left on Desktop */}
        <div className="text-center sm:text-left order-2 sm:order-1">
            <p className="text-teal-700 text-lg">Bienvenido, <span className="font-semibold">{teacher.name}</span></p>
            <p className="text-base text-teal-600">Docente del CEIA Fermín Fierro Luengo</p>
        </div>
        {/* Logout Block - Right on Desktop */}
        <div className='flex items-center justify-center sm:justify-end order-3'>
          <button
            onClick={onLogout}
            className="p-2 rounded-full text-slate-500 hover:bg-teal-100 hover:text-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            title="Cerrar Sesión"
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      <main>
        <div className="mb-6 p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100">
            <h3 className="text-lg font-semibold text-teal-800 mb-4 text-center">Seleccione una Asignatura</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {subjects.map((subject, index) => {
                const isSelected = selectedSubjectId === subject.id;
                const colors = subjectColors[index % subjectColors.length];
                const buttonClasses = `
                  px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 ease-in-out transform focus:outline-none
                  ${colors.bg} ${colors.text} ${colors.hoverBg}
                  ${isSelected 
                    ? `ring-2 ${colors.ring} scale-110 shadow-xl` 
                    : 'hover:scale-105'}
                `;
                return (
                  <button
                    key={subject.id}
                    onClick={() => onSubjectChange(subject.id)}
                    className={buttonClasses}
                  >
                    {subject.name}
                  </button>
                );
              })}
            </div>
        </div>
        
        <div className="mb-8 p-6 bg-cyan-100/70 backdrop-blur-sm rounded-2xl shadow-lg border border-cyan-200">
          <div className="flex flex-col items-center gap-2">
              <h3 className="text-lg font-semibold text-teal-800 text-center">Seleccione una Fecha</h3>
              <div className="relative max-w-xs w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon />
                  </div>
                  <input
                    type="date"
                    id="date-picker"
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-base text-teal-900 bg-white/50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-lg shadow-sm"
                    style={{ colorScheme: 'light' }}
                  />
              </div>
          </div>
        </div>

        {selectedSubjectId ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-teal-800 tracking-wide">Listado de Estudiantes Presenciales Primer Nivel Medio D</h3>
              </div>
              <div className="flow-root">
                <ul role="list" className="-my-5 divide-y divide-slate-200/70">
                  {students.map((student, index) => {
                    const percentage = studentAttendancePercentages[student.id] ?? 100;
                    return (
                        <li key={student.id} className="py-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                            <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-teal-900 truncate">{student.name}</p>
                                <p className={`text-xs font-medium ${getPercentageColor(percentage)}`}>
                                    Asistencia acumulada: {percentage.toFixed(0)}%
                                </p>
                            </div>
                            <div className="inline-flex items-center space-x-3">
                              <button onClick={() => handleStatusChange(student.id, AttendanceStatus.Present)} className={getStatusButtonClass(student.id, AttendanceStatus.Present)} title="Presente"><CheckIcon /></button>
                              <button onClick={() => handleStatusChange(student.id, AttendanceStatus.Absent)} className={getStatusButtonClass(student.id, AttendanceStatus.Absent)} title="Ausente"><XIcon /></button>
                              <button onClick={() => handleStatusChange(student.id, AttendanceStatus.Late)} className={getStatusButtonClass(student.id, AttendanceStatus.Late)} title="Atrasado"><ClockIcon /></button>
                            </div>
                        </div>
                        </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <footer className="bg-teal-50/50 border-t border-slate-200/70 px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                     <div className="bg-indigo-100/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-indigo-200 flex flex-col items-center gap-6">
                        <div className="flex items-center gap-2 text-center">
                           <ChartPieIcon />
                           <h4 className="text-lg font-semibold text-teal-800">{subjectChartTitle}</h4>
                        </div>
                        <div className="relative w-40 h-40">
                        <div 
                            className="w-full h-full rounded-full transition-all duration-500"
                            style={{ background: subjectDonutChartData.gradient }}
                        ></div>
                        <div className="absolute inset-0 m-auto w-28 h-28 bg-indigo-50/80 rounded-full shadow-inner flex items-center justify-center">
                            <span className="text-2xl font-bold text-teal-800">
                                {
                                    (subjectCumulativeSummary.present + subjectCumulativeSummary.absent + subjectCumulativeSummary.late) > 0 ?
                                    `${Math.round(
                                        ((subjectCumulativeSummary.present + subjectCumulativeSummary.late) / (subjectCumulativeSummary.present + subjectCumulativeSummary.absent + subjectCumulativeSummary.late)) * 100
                                    )}%` : 'N/A'
                                }
                            </span>
                        </div>
                        </div>
                        <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-sm">
                            <div className="flex items-center">
                                <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                                <span className="font-medium text-teal-700">Presentes: {subjectCumulativeSummary.present}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-3 h-3 rounded-full bg-slate-500 mr-2"></span>
                                <span className="font-medium text-teal-700">Ausentes: {subjectCumulativeSummary.absent}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                                <span className="font-medium text-teal-700">Atrasados: {subjectCumulativeSummary.late}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-100/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-emerald-200 flex flex-col items-center gap-6">
                        <div className="flex items-center gap-2">
                            <UsersIcon />
                            <h4 className="text-lg font-semibold text-teal-800">Asistencia General del Curso</h4>
                        </div>
                        <div className="relative w-40 h-40">
                        <div 
                            className="w-full h-full rounded-full transition-all duration-500"
                            style={{ background: overallDonutChartData.gradient }}
                        ></div>
                        <div className="absolute inset-0 m-auto w-28 h-28 bg-emerald-50/80 rounded-full shadow-inner flex items-center justify-center">
                            <span className="text-2xl font-bold text-teal-800">
                                {
                                    (overallCumulativeSummary.present + overallCumulativeSummary.absent + overallCumulativeSummary.late) > 0 ?
                                    `${Math.round(
                                        ((overallCumulativeSummary.present + overallCumulativeSummary.late) / (overallCumulativeSummary.present + overallCumulativeSummary.absent + overallCumulativeSummary.late)) * 100
                                    )}%` : 'N/A'
                                }
                            </span>
                        </div>
                        </div>
                        <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-sm">
                            <div className="flex items-center">
                                <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span>
                                <span className="font-medium text-teal-700">Presentes: {overallCumulativeSummary.present}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-3 h-3 rounded-full bg-rose-500 mr-2"></span>
                                <span className="font-medium text-teal-700">Ausentes: {overallCumulativeSummary.absent}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                                <span className="font-medium text-teal-700">Atrasados: {overallCumulativeSummary.late}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100">
            <div className="flex justify-center items-center text-slate-400 mb-4">
                <ClipboardCheckIcon />
            </div>
            <h3 className="text-xl font-semibold text-teal-800">Comienza a pasar lista</h3>
            <p className="text-teal-600 mt-2">Por favor, elija una asignatura y una fecha para ver la nómina de estudiantes.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AttendanceSheet;