import React, { createContext, useContext, useState, useEffect } from 'react';

interface ExamContextType {
  isExamActive: boolean;
  startExam: () => void;
  endExam: () => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isExamActive, setIsExamActive] = useState(false);

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isExamActive) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isExamActive]);

  const startExam = () => setIsExamActive(true);
  const endExam = () => setIsExamActive(false);

  return (
    <ExamContext.Provider value={{ isExamActive, startExam, endExam }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) throw new Error('useExam must be used within ExamProvider');
  return context;
};
