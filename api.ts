import { AttendanceData } from './types';

type SavedRecords = Record<string, Record<string, Record<string, boolean>>>;

const FAKE_LATENCY = 500; // ms

interface AppData {
  attendance: AttendanceData;
  savedRecords: SavedRecords;
}

// Simula la obtención de datos iniciales desde un servidor
export const getInitialData = (): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const storedAttendance = localStorage.getItem('attendanceData');
        const storedSavedRecords = localStorage.getItem('savedRecords');

        const attendance = storedAttendance ? JSON.parse(storedAttendance) : {};
        const savedRecords = storedSavedRecords ? JSON.parse(storedSavedRecords) : {};

        resolve({ attendance, savedRecords });
      } catch (error) {
        console.error("Error al leer desde localStorage", error);
        // Resuelve con datos vacíos en caso de error para que la app no falle
        resolve({ attendance: {}, savedRecords: {} });
      }
    }, FAKE_LATENCY);
  });
};

// Simula el guardado de todos los datos en un servidor
export const saveAllData = (attendance: AttendanceData, savedRecords: SavedRecords): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        localStorage.setItem('attendanceData', JSON.stringify(attendance));
        localStorage.setItem('savedRecords', JSON.stringify(savedRecords));
        resolve();
      } catch (error) {
        console.error("Error al guardar en localStorage", error);
        reject(error);
      }
    }, FAKE_LATENCY);
  });
};