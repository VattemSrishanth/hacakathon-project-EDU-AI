import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Award, Play } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';

const MOCK_EXAMS = [
  {
    id: 'math-final-01',
    title: 'Mathematics Final Assessment',
    subject: 'Math',
    questionsCount: 3,
    duration: 30,
    difficulty: 'Intermediate'
  },
  {
    id: 'sci-unit-02',
    title: 'Science: Forces and Motion',
    subject: 'Science',
    questionsCount: 2,
    duration: 15,
    difficulty: 'Beginner'
  }
];

const Exams = () => {
  const navigate = useNavigate();

  const handleStartExam = (exam) => {
    navigate(`/exams/attempt/${exam.id}`);
  };

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-app-text-main tracking-tight uppercase">Assessments</h1>
        <p className="text-app-text-sub font-medium text-lg">Test your knowledge with timed exams and earn certifications.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_EXAMS.map((exam) => (
          <Card key={exam.id} className="p-6 rounded-[2.5rem] border-app-border hover:border-primary/50 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Award size={120} />
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                  {exam.subject}
                </span>
                <span className="text-[10px] font-bold text-app-text-muted uppercase tracking-widest flex items-center gap-1">
                  <Clock size={12} />
                  {exam.duration} MINS
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-app-text-main group-hover:text-primary transition-colors">{exam.title}</h3>
                <p className="text-app-text-sub text-sm font-medium mt-1">{exam.questionsCount} Questions • {exam.difficulty}</p>
              </div>

              <Button
                variant="outline"
                className="w-full rounded-xl flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all py-4"
                onClick={() => handleStartExam(exam)}
              >
                <Play size={18} fill="currentColor" />
                Start Exam
              </Button>
            </div>
          </Card>
        ))}

        {/* Empty State / Coming Soon */}
        <div className="flex flex-col items-center justify-center p-12 rounded-[2.5rem] border-2 border-dashed border-app-border text-center space-y-4">
          <BookOpen size={48} className="text-app-text-muted" />
          <div className="space-y-1">
            <p className="text-app-text-main font-bold">More exams coming soon</p>
            <p className="text-app-text-muted text-xs font-medium">Keep studying your lessons to unlock new assessments.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exams;