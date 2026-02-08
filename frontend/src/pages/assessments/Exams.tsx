import { useState } from 'react';
import { BookOpen, Clock, Award, Play, CheckCircle2 } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ExamMode from '../../components/assessments/ExamMode';
import { useExam } from '../../context/ExamContext';

const MOCK_EXAMS = [
  {
    id: 'math-final-01',
    title: 'Mathematics Final Assessment',
    subject: 'Math',
    questions: [
      { id: 'q1', text: 'Determine the value of x in the equation 2x + 5 = 15.', options: ['x = 5', 'x = 10', 'x = 7.5', 'x = 2.5'], correctAnswer: 0 },
      { id: 'q2', text: 'Simplified expression of (x+2)(x-2) is?', options: ['x^2 + 4', 'x^2 - 4', 'x^2 + 4x + 4', 'x^2 - 4x + 4'], correctAnswer: 1 },
      { id: 'q3', text: 'The sum of angles in a triangle is?', options: ['90 degrees', '180 degrees', '360 degrees', '270 degrees'], correctAnswer: 1 },
    ],
    duration: 30,
    difficulty: 'Intermediate'
  },
  {
    id: 'sci-unit-02',
    title: 'Science: Forces and Motion',
    subject: 'Science',
    questions: [
      { id: 'sq1', text: 'Which of Newton\'s laws is known as the Law of Inertia?', options: ['First Law', 'Second Law', 'Third Law', 'Universal Gravitation'], correctAnswer: 0 },
      { id: 'sq2', text: 'Unit of Force is?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], correctAnswer: 2 },
    ],
    duration: 15,
    difficulty: 'Beginner'
  }
];

const Exams = () => {
  const { isExamActive, startExam } = useExam();
  const [selectedExam, setSelectedExam] = useState<typeof MOCK_EXAMS[0] | null>(null);
  const [examResult, setExamResult] = useState<any>(null);

  const handleStartExam = (exam: typeof MOCK_EXAMS[0]) => {
    setSelectedExam(exam);
    startExam();
  };

  const handleExamComplete = (result: any) => {
    setExamResult(result);
    setSelectedExam(null);
  };

  if (isExamActive && selectedExam) {
    return (
      <ExamMode
        examTitle={selectedExam.title}
        questions={selectedExam.questions}
        durationMinutes={selectedExam.duration}
        onComplete={handleExamComplete}
      />
    );
  }

  if (examResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <Card className="p-12 text-center rounded-[3rem] border-secondary/30 bg-secondary/5 shadow-inst">
          <div className="w-20 h-20 bg-secondary text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inst">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-4xl font-black text-app-text-main mb-2">Exam Completed!</h2>
          <p className="text-app-text-sub font-bold uppercase tracking-widest text-sm mb-8">Great job on finishing the assessment</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-6 rounded-3xl bg-app-bg border border-app-border">
              <p className="text-3xl font-black text-primary">{Math.round(examResult.score)}%</p>
              <p className="text-xs font-bold text-app-text-muted uppercase tracking-tighter">Score Percentage</p>
            </div>
            <div className="p-6 rounded-3xl bg-app-bg border border-app-border">
              <p className="text-3xl font-black text-secondary">{examResult.correctAnswers}/{examResult.totalQuestions}</p>
              <p className="text-xs font-bold text-app-text-muted uppercase tracking-tighter">Correct Answers</p>
            </div>
          </div>

          <Button 
            variant="primary" 
            className="w-full h-16 rounded-2xl font-black text-lg"
            onClick={() => setExamResult(null)}
          >
            Back to Exams
          </Button>
        </Card>
      </div>
    );
  }

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
                <p className="text-app-text-sub text-sm font-medium mt-1">{exam.questions.length} Questions • {exam.difficulty}</p>
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

