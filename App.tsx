import React, { useState, useCallback, useEffect } from 'react';
import { TEACHERS, STUDENTS, SUBJECTS } from './constants';
import { Teacher, AttendanceStatus, AttendanceData } from './types';
import LoginScreen from './components/LoginScreen';
import AttendanceSheet from './components/AttendanceSheet';
import SpinnerIcon from './components/icons/SpinnerIcon';
import * as api from './api';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await api.getInitialData();
        if (data) {
          setAttendance(data.attendance);
          setSavedRecords(data.savedRecords);
        }
      } catch (error) {
        console.error("Error al cargar datos desde la API simulada", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const saveData = useCallback(async (newAttendance: AttendanceData, newSavedRecords: SavedRecords) => {
    setIsSaving(true);
    try {
      await api.saveAllData(newAttendance, newSavedRecords);
    } catch (error) {
      console.error("Error al guardar datos en la API simulada", error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleTeacherSelect = useCallback((teacher: Teacher) => {
    setSelectedTeacher(teacher);
  }, []);

  const handleLogout = useCallback(() => {
    setSelectedTeacher(null);
    setSelectedSubjectId('');
  }, []);

  const handleAttendanceChange = useCallback((studentId: string, subjectId: string, date: string, status: AttendanceStatus) => {
    const newAttendance = { ...attendance };
    if (!newAttendance[date]) {
      newAttendance[date] = {};
    }
    if (!newAttendance[date][subjectId]) {
      newAttendance[date][subjectId] = {};
    }
    newAttendance[date][subjectId][studentId] = status;
    setAttendance(newAttendance);
    saveData(newAttendance, savedRecords);
  }, [attendance, savedRecords, saveData]);

  const handleClearAttendance = useCallback((subjectId: string, date: string) => {
    if (!attendance[date]?.[subjectId]) {
      return;
    }
    
    const newAttendance = { ...attendance };
    const newDateAttendance = { ...newAttendance[date] };
    
    delete newDateAttendance[subjectId];

    if (Object.keys(newDateAttendance).length === 0) {
      delete newAttendance[date];
    } else {
      newAttendance[date] = newDateAttendance;
    }
    
    setAttendance(newAttendance);
    saveData(newAttendance, savedRecords);
  }, [attendance, savedRecords, saveData]);

  const handleSaveRecord = useCallback((teacherId: string, subjectId: string, date: string) => {
    const newRecords = { ...savedRecords };
    if (!newRecords[date]) {
      newRecords[date] = {};
    }
    if (!newRecords[date][teacherId]) {
      newRecords[date][teacherId] = {};
    }
    newRecords[date][teacherId][subjectId] = true;
    setSavedRecords(newRecords);
    saveData(attendance, newRecords);
  }, [savedRecords, attendance, saveData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-emerald-50">
        <SpinnerIcon size="large" />
      </div>
    );
  }

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
              isSaving={isSaving}
            />
        </div>
      )}
    </div>
  );
};

export default App;