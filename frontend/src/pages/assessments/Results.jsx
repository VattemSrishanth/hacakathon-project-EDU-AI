import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { result, examTitle } = location.state || {
    result: { score: 100, correctAnswers: 3, totalQuestions: 3 },
    examTitle: 'Practice Exam'
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 py-8">
      <Card className="p-12 text-center rounded-[3rem] border-secondary/30 bg-secondary/5 shadow-inner">
        <div className="w-20 h-20 bg-secondary text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-4xl font-black text-app-text-main mb-2">Exam Completed!</h2>
        <p className="text-app-text-sub font-bold uppercase tracking-widest text-sm mb-8">
          {examTitle} Result Details
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-6 rounded-3xl bg-app-bg border border-app-border">
            <p className="text-3xl font-black text-primary">{Math.round(result.score)}%</p>
            <p className="text-xs font-bold text-app-text-muted uppercase tracking-tighter">Score Percentage</p>
          </div>
          <div className="p-6 rounded-3xl bg-app-bg border border-app-border">
            <p className="text-3xl font-black text-secondary">{result.correctAnswers}/{result.totalQuestions}</p>
            <p className="text-xs font-bold text-app-text-muted uppercase tracking-tighter">Correct Answers</p>
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-2"
          onClick={() => navigate('/exams')}
        >
          Return to Assessments <ChevronRight size={18} />
        </Button>
      </Card>
    </div>
  );
};

export default Results;