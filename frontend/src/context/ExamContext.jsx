import React, { createContext, useContext, useState, useEffect } from 'react';
const ExamContext = createContext(undefined);

export const ExamProvider = ({ children }) => {
  const [isExamActive, setIsExamActive] = useState(false);

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
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
    </ExamContext.Provider>);

};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) throw new Error('useExam must be used within ExamProvider');
  return context;
};