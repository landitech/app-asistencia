import React, { useState, useCallback } from 'react';
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

const App: React.FC = () => {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [attendance, setAttendance] = useState<AttendanceData>({});
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(getTodaysDateString());

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
            />
        </div>
      )}
    </div>
  );
};

export default App;