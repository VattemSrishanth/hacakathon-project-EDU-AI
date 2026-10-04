import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExamMode from '../../components/assessments/ExamMode';
import { useExam } from '../../context/ExamContext';
import { useProgress } from '../../context/ProgressContext';

const MOCK_EXAMS = [
  {
    id: 'math-final-01',
    title: 'Mathematics Final Assessment',
    subject: 'Math',
    questions: [
      { id: 'q1', text: 'Determine the value of x in the equation 2x + 5 = 15.', options: ['x = 5', 'x = 10', 'x = 7.5', 'x = 2.5'], correctAnswer: 0 },
      { id: 'q2', text: 'Simplified expression of (x+2)(x-2) is?', options: ['x^2 + 4', 'x^2 - 4', 'x^2 + 4x + 4', 'x^2 - 4x + 4'], correctAnswer: 1 },
      { id: 'q3', text: 'The sum of angles in a triangle is?', options: ['90 degrees', '180 degrees', '360 degrees', '270 degrees'], correctAnswer: 1 }
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
      { id: 'sq2', text: 'Unit of Force is?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], correctAnswer: 2 }
    ],
    duration: 15,
    difficulty: 'Beginner'
  }
];

const AttemptExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { startExam } = useExam();
  const { recordQuizScore } = useProgress();

  const exam = MOCK_EXAMS.find(e => e.id === examId);

  React.useEffect(() => {
    startExam();
  }, [startExam]);

  const handleExamComplete = (result) => {
    if (exam) {
      recordQuizScore(
        exam.id,
        result.correctAnswers,
        result.totalQuestions,
        `Completed Exam: ${exam.title}`
      );
    }
    // Navigate to results page with scores
    navigate('/exams/results', { state: { result, examTitle: exam?.title || 'Assessment' } });
  };

  if (!exam) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Exam not found</h2>
        <button onClick={() => navigate('/exams')} className="mt-4 px-4 py-2 bg-primary text-white rounded">
          Back to Exams
        </button>
      </div>
    );
  }

  return (
    <ExamMode
      examTitle={exam.title}
      questions={exam.questions}
      durationMinutes={exam.duration}
      onComplete={handleExamComplete}
    />
  );
};

export default AttemptExam;