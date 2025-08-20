import React, { useState, useCallback, useEffect } from 'react';
import { TEACHERS, STUDENTS, SUBJECTS } from './constants';
import { Teacher, AttendanceStatus, AttendanceData } from './types';
import LoginScreen from './components/LoginScreen';
import AttendanceSheet from './components/AttendanceSheet';

const getTodaysDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type SavedRecords = Record<string, Record<string, Record<string, boolean>>>; // { [date]: { [teacherId]: { [subjectId]: boolean } } }

const App: React.FC = () => {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [attendance, setAttendance] = useState<AttendanceData>({});
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(getTodaysDateString());
  const [savedRecords, setSavedRecords] = useState<SavedRecords>({});

  useEffect(() => {
    try {
      const storedAttendance = localStorage.getItem('attendanceData');
      if (storedAttendance) {
        setAttendance(JSON.parse(storedAttendance));
      }
      const storedSavedRecords = localStorage.getItem('savedRecords');
      if (storedSavedRecords) {
        setSavedRecords(JSON.parse(storedSavedRecords));
      }
    } catch (error) {
      console.error("Error al cargar datos desde localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('attendanceData', JSON.stringify(attendance));
    } catch (error) {
      console.error("Error al guardar datos de asistencia en localStorage", error);
    }
  }, [attendance]);

  useEffect(() => {
    try {
      localStorage.setItem('savedRecords', JSON.stringify(savedRecords));
    } catch (error) {
      console.error("Error al guardar registros en localStorage", error);
    }
  }, [savedRecords]);

  const handleTeacherSelect = useCallback((teacher: Teacher) => {
    setSelectedTeacher(teacher);
  }, []);

  const handleLogout = useCallback(() => {
    setSelectedTeacher(null);
    setSelectedSubjectId('');
  }, []);

  const handleAttendanceChange = useCallback((studentId: string, subjectId: string, date: string, status: AttendanceStatus) => {
    setAttendance(prev => {
      const newAttendance = { ...prev };
      if (!newAttendance[date]) {
        newAttendance[date] = {};
      }
      if (!newAttendance[date][subjectId]) {
        newAttendance[date][subjectId] = {};
      }
      newAttendance[date][subjectId][studentId] = status;
      return newAttendance;
    });
  }, []);

  const handleClearAttendance = useCallback((subjectId: string, date: string) => {
    setAttendance(prev => {
      if (!prev[date]?.[subjectId]) {
        return prev;
      }

      const newAttendance = { ...prev };
      const newDateAttendance = { ...newAttendance[date] };
      
      delete newDateAttendance[subjectId];

      if (Object.keys(newDateAttendance).length === 0) {
        delete newAttendance[date];
      } else {
        newAttendance[date] = newDateAttendance;
      }
      
      return newAttendance;
    });
  }, []);

  const handleSaveRecord = useCallback((teacherId: string, subjectId: string, date: string) => {
    setSavedRecords(prev => {
      const newRecords = { ...prev };
      if (!newRecords[date]) {
        newRecords[date] = {};
      }
      if (!newRecords[date][teacherId]) {
        newRecords[date][teacherId] = {};
      }
      newRecords[date][teacherId][subjectId] = true;
      return newRecords;
    });
  }, []);

  return (
    <div className="min-h-screen bg-emerald-50 font-sans text-teal-800">
      {!selectedTeacher ? (
        <LoginScreen teachers={TEACHERS} onSelectTeacher={handleTeacherSelect} />
      ) : (
        <div className="flex justify-center w-full px-4 sm:px-6 lg:px-8 py-8">
            <AttendanceSheet
              teacher={selectedTeacher}
              students={STUDENTS}
              subjects={SUBJECTS}
              onLogout={handleLogout}
              attendance={attendance}
              onAttendanceChange={handleAttendanceChange}
              selectedSubjectId={selectedSubjectId}
              onSubjectChange={setSelectedSubjectId}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              savedRecords={savedRecords}
              onSaveRecord={handleSaveRecord}
              onClearAttendance={handleClearAttendance}
            />
        </div>
      )}
    </div>
  );
};

export default App;