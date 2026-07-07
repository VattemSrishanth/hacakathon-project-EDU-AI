import React, { useState, useEffect, useCallback } from 'react';
import { Timer, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, Flag } from 'lucide-react';
import Button from '../Button';
import Card from '../Card';
import { useExam } from '../../context/ExamContext';
import { useSettings } from '../../context/SettingsContext';















const ExamMode = ({ examTitle, questions, durationMinutes, onComplete }) => {
  const { endExam } = useExam();
  const { settings } = useSettings();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Large text accessibility
  const baseTextSize = settings.themeAccessibility.fontSize === 'Large' ? 'text-2xl' : 'text-lg';

  const handleSubmit = useCallback(() => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    const correctCount = questions.reduce((acc, q) => {
      return answers[q.id] === q.correctAnswer ? acc + 1 : acc;
    }, 0);

    const result = {
      score: correctCount / questions.length * 100,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      timeSpent: durationMinutes * 60 - timeLeft
    };

    onComplete(result);
    endExam();
  }, [answers, questions, durationMinutes, timeLeft, onComplete, endExam, isSubmitted]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIdx];

  return (
    <div className="fixed inset-0 bg-app-bg z-50 overflow-y-auto pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Exam Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-app-bg-alt p-6 rounded-[2.5rem] border border-app-border sticky top-4 z-10 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-app-text-main uppercase tracking-tight">{examTitle}</h2>
            <p className="text-app-text-sub font-bold text-xs uppercase tracking-widest">Question {currentIdx + 1} of {questions.length}</p>
          </div>
          
          <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl ${timeLeft < 60 ? 'bg-red-500 text-white animate-pulse' : 'bg-primary/10 text-primary'} border border-primary/20`}>
            <Timer size={24} />
            <span className="text-xl font-black tabular-nums">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Question Area */}
        <div className="space-y-6">
          <Card className="p-8 md:p-12 rounded-[3rem] border-app-border shadow-2xl bg-app-bg relative">
            <div className="absolute top-8 right-8">
              <Flag size={20} className="text-app-text-muted hover:text-red-500 cursor-pointer transition-colors" />
            </div>
            
            <div className="space-y-8">
              <h3 className={`${baseTextSize} font-bold text-app-text-main leading-relaxed`}>
                {currentQuestion.text}
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.options.map((option, idx) =>
                <button
                  key={idx}
                  onClick={() => setAnswers({ ...answers, [currentQuestion.id]: idx })}
                  className={`
                      w-full text-left p-6 rounded-3xl border-2 transition-all flex items-center justify-between group
                      ${answers[currentQuestion.id] === idx ?
                  'border-primary bg-primary/5 shadow-lg shadow-primary/5' :
                  'border-app-border bg-app-bg-alt hover:border-app-text-muted/30'}
                    `}>
                  
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm
                        ${answers[currentQuestion.id] === idx ? 'bg-primary text-white' : 'bg-app-bg text-app-text-muted group-hover:bg-app-bg-alt'}
                      `}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`font-bold ${settings.themeAccessibility.fontSize === 'Large' ? 'text-xl' : 'text-base'} text-app-text-main`}>
                        {option}
                      </span>
                    </div>
                    {answers[currentQuestion.id] === idx &&
                  <CheckCircle2 size={24} className="text-primary" />
                  }
                  </button>
                )}
              </div>
            </div>
          </Card>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center py-4">
            <Button
              variant="outline"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((prev) => prev - 1)}
              className="px-8 rounded-2xl flex items-center gap-3">
              
              <ChevronLeft size={20} />
              Previous
            </Button>

            <div className="flex gap-2">
              {questions.map((_, i) =>
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${i === currentIdx ? 'w-6 bg-primary' : answers[questions[i].id] !== undefined ? 'bg-secondary' : 'bg-app-border'}`} />

              )}
            </div>

            {currentIdx === questions.length - 1 ?
            <Button
              variant="success"
              onClick={handleSubmit}
              className="px-10 rounded-2xl flex items-center gap-3 shadow-xl shadow-secondary/20">
              
                Submit Exam
                <CheckCircle2 size={20} />
              </Button> :

            <Button
              variant="primary"
              onClick={() => setCurrentIdx((prev) => prev + 1)}
              className="px-8 rounded-2xl flex items-center gap-3">
              
                Next
                <ChevronRight size={20} />
              </Button>
            }
          </div>
        </div>

        {/* Warning Toast */}
        {timeLeft < 300 && timeLeft > 290 &&
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-amber-600 text-white px-8 py-4 rounded-full shadow-2xl animate-bounce">
            <AlertTriangle size={24} />
            <span className="font-black uppercase tracking-widest text-sm">5 Minutes Remaining!</span>
          </div>
        }

      </div>
    </div>);

};

export default ExamMode;