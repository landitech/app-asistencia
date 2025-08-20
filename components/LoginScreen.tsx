import React, { useState } from 'react';
import { Teacher } from '../types';
import BookIcon from './icons/BookIcon';

interface LoginScreenProps {
  teachers: Teacher[];
  onSelectTeacher: (teacher: Teacher) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ teachers, onSelectTeacher }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

  const handleContinue = () => {
    const teacher = teachers.find(t => t.id === selectedTeacherId);
    if (teacher) {
      onSelectTeacher(teacher);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-100 to-emerald-200 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl transform transition-all hover:scale-[1.02]">
        <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-teal-100 rounded-full">
                <BookIcon />
            </div>
            <h1 className="text-4xl font-bold text-teal-900">Control de Asistencia</h1>
            <p className="text-teal-700">Selecciona tu perfil para comenzar</p>
        </div>
        <div className="space-y-6">
            <div>
                <label htmlFor="teacher-select" className="block text-sm font-medium text-teal-800 mb-1">
                    Docente
                </label>
                <select
                    id="teacher-select"
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base text-teal-900 border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-lg shadow-sm transition-all"
                    style={{ colorScheme: 'light' }}
                >
                    <option value="" disabled>Seleccione un docente...</option>
                    {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                        </option>
                    ))}
                </select>
            </div>
            <button
                onClick={handleContinue}
                disabled={!selectedTeacherId}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-300 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
            >
                Ingresar
            </button>
        </div>
        <div className="text-center pt-6">
            <span className="inline-block bg-teal-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out">
                Creado por Orlando Rivas
            </span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;