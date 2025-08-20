import React, { useMemo } from 'react';
import { Teacher, Student, Subject, AttendanceStatus, AttendanceData } from '../types';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';
import ClockIcon from './icons/ClockIcon';
import LogoutIcon from './icons/LogoutIcon';
import CalendarIcon from './icons/CalendarIcon';
import ClipboardCheckIcon from './icons/ClipboardCheckIcon';
import ChartPieIcon from './icons/ChartPieIcon';
import UsersIcon from './icons/UsersIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import SaveIcon from './icons/SaveIcon';
import TrashIcon from './icons/TrashIcon';
import SpinnerIcon from './icons/SpinnerIcon';

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
  savedRecords: Record<string, Record<string, Record<string, boolean>>>;
  onSaveRecord: (teacherId: string, subjectId: string, date: string) => void;
  onClearAttendance: (subjectId: string, date: string) => void;
  isSaving: boolean;
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
  onDateChange,
  savedRecords,
  onSaveRecord,
  onClearAttendance,
  isSaving
}) => {
  const currentAttendance = useMemo(() => {
    return attendance[selectedDate]?.[selectedSubjectId] || {};
  }, [attendance, selectedDate, selectedSubjectId]);

  const isRecordSaved = useMemo(() => {
    return savedRecords[selectedDate]?.[teacher.id]?.[selectedSubjectId] || false;
  }, [savedRecords, selectedDate, teacher.id, selectedSubjectId]);

  const hasAttendanceData = useMemo(() => {
    return Object.keys(currentAttendance).length > 0;
  }, [currentAttendance]);

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
    if (isRecordSaved || isSaving) return;
    onAttendanceChange(studentId, selectedSubjectId, selectedDate, status);
  };

  const getStatusButtonClass = (studentId: string, status: AttendanceStatus) => {
    const baseClass = "p-2 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none";
    const isActive = currentAttendance[studentId] === status;
    switch (status) {
      case AttendanceStatus.Present:
        return `${baseClass} ${isActive ? 'bg-emerald-500 text-white shadow-lg' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`;
      case AttendanceStatus.Absent:
        return `${baseClass} ${isActive ? 'bg-rose-500 text-white shadow-lg' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`;
      case AttendanceStatus.Late:
        return `${baseClass} ${isActive ? 'bg-amber-500 text-white shadow-lg' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <header className="mb-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
          <div className="order-2 sm:order-1 flex flex-col items-center sm:items-start text-center sm:text-left">
              <h2 className="text-2xl font-bold text-teal-700">Bienvenido,</h2>
              <p className="text-xl text-teal-600">{teacher.name}</p>
          </div>
          
          <div className="order-1 sm:order-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-teal-800">Control de Asistencia</h1>
            </div>
            <p className="text-sm font-bold text-teal-600 mt-1">Versión 1.0</p>
          </div>

          <div className="order-3 sm:order-3 flex justify-center sm:justify-end">
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 bg-rose-100 rounded-lg hover:bg-rose-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all duration-300 transform hover:scale-105"
            >
              <LogoutIcon />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
            <h3 className="flex items-center justify-center gap-2 font-bold text-xl text-teal-700 mb-4">
              <ClipboardListIcon />
              Seleccione una Asignatura
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {subjects.map((subject, index) => {
                const color = subjectColors[index % subjectColors.length];
                const isSelected = selectedSubjectId === subject.id;
                return (
                  <button
                    key={subject.id}
                    onClick={() => onSubjectChange(subject.id)}
                    className={`p-3 text-sm font-semibold rounded-lg transition-all duration-300 transform focus:outline-none ${color.bg} ${color.text} ${color.hoverBg} ${isSelected ? `scale-110 ring-2 ${color.ring} shadow-md` : 'hover:scale-105'}`}
                  >
                    {subject.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="bg-cyan-100/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
            <h3 className="flex items-center justify-center gap-2 font-bold text-xl text-cyan-800 mb-4">
              <CalendarIcon />
              Seleccione una Fecha
            </h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-white border-2 border-slate-300 text-teal-900 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 block w-full max-w-xs p-2.5"
            />
          </div>
        </div>

        {selectedSubjectId ? (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-xl text-teal-700 mb-4 text-center">Listado de Estudiantes Presenciales Primer Nivel Medio D</h3>
              <ul className="space-y-3">
                {students.map(student => (
                  <li key={student.id} className={`grid grid-cols-[1fr_auto_auto] items-center gap-2 p-3 bg-slate-50 rounded-lg shadow-sm transition-opacity ${isRecordSaved || isSaving ? 'opacity-70' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-10 rounded-full ${getPercentageColor(studentAttendancePercentages[student.id] || 0).replace('text-', 'bg-')}`}></div>
                      <div>
                        <span className="font-medium text-teal-900">{student.name}</span>
                        <div className="flex items-center gap-1 text-xs">
                          <span className={getPercentageColor(studentAttendancePercentages[student.id] || 0)}>
                            Asistencia: {(studentAttendancePercentages[student.id] || 0).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-start-3 flex justify-end items-center gap-2">
                      <button onClick={() => handleStatusChange(student.id, AttendanceStatus.Present)} className={getStatusButtonClass(student.id, AttendanceStatus.Present)} aria-label={`Marcar a ${student.name} como presente`} disabled={isRecordSaved || isSaving}>
                        <CheckIcon />
                      </button>
                      <button onClick={() => handleStatusChange(student.id, AttendanceStatus.Absent)} className={getStatusButtonClass(student.id, AttendanceStatus.Absent)} aria-label={`Marcar a ${student.name} como ausente`} disabled={isRecordSaved || isSaving}>
                        <XIcon />
                      </button>
                      <button onClick={() => handleStatusChange(student.id, AttendanceStatus.Late)} className={getStatusButtonClass(student.id, AttendanceStatus.Late)} aria-label={`Marcar a ${student.name} como atrasado`} disabled={isRecordSaved || isSaving}>
                        <ClockIcon />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex justify-center items-center gap-4">
                {isRecordSaved ? (
                  <div className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-green-700 bg-green-100 rounded-lg shadow-sm">
                    <CheckIcon />
                    <span>Registro guardado para el día de hoy.</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onClearAttendance(selectedSubjectId, selectedDate)}
                      disabled={!hasAttendanceData || isSaving}
                      className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
                      aria-label="Limpiar selección de asistencia"
                    >
                      {isSaving ? <SpinnerIcon /> : <TrashIcon />}
                      <span className="ml-2">Limpiar Selección</span>
                    </button>
                    <button
                      onClick={() => onSaveRecord(teacher.id, selectedSubjectId, selectedDate)}
                      disabled={!hasAttendanceData || isSaving}
                      className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
                      aria-label="Guardar registro de asistencia"
                    >
                      {isSaving ? <SpinnerIcon /> : <SaveIcon />}
                      <span className="ml-2">Guardar Registro</span>
                    </button>
                  </>
                )}
              </div>

            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-indigo-100/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg flex flex-col items-center">
                <h4 className="flex items-center gap-2 text-lg font-bold text-indigo-800 mb-4">
                  <ChartPieIcon />
                  {subjectChartTitle}
                </h4>
                <div className="relative w-40 h-40">
                  <div 
                    className="w-full h-full rounded-full" 
                    style={{ background: subjectDonutChartData.gradient }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-indigo-100/80 w-24 h-24 rounded-full"></div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
                  <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>Presente: {subjectCumulativeSummary.present}</span>
                  <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-slate-500 mr-2"></div>Ausente: {subjectCumulativeSummary.absent}</span>
                  <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>Atraso: {subjectCumulativeSummary.late}</span>
                </div>
              </div>

              <div className="bg-emerald-100/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg flex flex-col items-center">
                <h4 className="flex items-center gap-2 text-lg font-bold text-emerald-800 mb-4">
                  <UsersIcon />
                  Asistencia General del Curso
                </h4>
                <div className="relative w-40 h-40">
                  <div 
                    className="w-full h-full rounded-full" 
                    style={{ background: overallDonutChartData.gradient }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-emerald-100/80 w-24 h-24 rounded-full"></div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
                  <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>Presente: {overallCumulativeSummary.present}</span>
                  <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-rose-500 mr-2"></div>Ausente: {overallCumulativeSummary.absent}</span>
                  <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>Atraso: {overallCumulativeSummary.late}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg flex flex-col items-center justify-center">
            <ClipboardCheckIcon />
            <h3 className="mt-4 text-2xl font-semibold text-teal-700">Seleccione una asignatura</h3>
            <p className="mt-1 text-teal-600">Elija una asignatura y fecha para comenzar a registrar la asistencia.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AttendanceSheet;