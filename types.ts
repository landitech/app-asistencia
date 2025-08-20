export interface Teacher {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
}

export enum AttendanceStatus {
  Present = 'present',
  Absent = 'absent',
  Late = 'late',
}

export type AttendanceRecord = Record<string, AttendanceStatus>; // { [studentId]: status }

export type SubjectAttendance = Record<string, AttendanceRecord>; // { [subjectId]: AttendanceRecord }

export type AttendanceData = Record<string, SubjectAttendance>; // { [date]: SubjectAttendance }
