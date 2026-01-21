// Lessons Data Structure
// This file contains all lesson information for the Inclusive AI Learning application
// Each lesson includes: id, title, description, video file, duration

const lessons = [
  {
    id: 1,
    title: "Understanding Fractions",
    description: "Learn the fundamentals of fractions, including numerators, denominators, and how to perform basic operations with fractions.",
    videoFile: "sign_fraction.mp4",
    duration: 15,
    completed: false
  },
  {
    id: 2,
    title: "Decimal Numbers",
    description: "Explore decimal numbers and their relationship to fractions. Learn how to convert between decimals and fractions.",
    videoFile: "sign_decimals.mp4",
    duration: 12,
    completed: false
  },
  {
    id: 3,
    title: "Basic Multiplication",
    description: "Master multiplication tables and techniques for multiplying multi-digit numbers.",
    videoFile: "sign_multiplication.mp4",
    duration: 18,
    completed: false
  },
  {
    id: 4,
    title: "Introduction to Algebra",
    description: "Learn algebraic expressions, variables, and solving simple equations.",
    videoFile: "sign_algebra.mp4",
    duration: 20,
    completed: false
  },
  {
    id: 5,
    title: "Geometry Basics",
    description: "Understand shapes, angles, area, and perimeter calculations.",
    videoFile: "sign_geometry.mp4",
    duration: 16,
    completed: false
  }
];

// Get all lessons
function getLessons() {
  return lessons;
}

// Get a specific lesson by ID
function getLessonById(id) {
  return lessons.find(lesson => lesson.id === id);
}

// Get the current lesson (first incomplete or first lesson)
function getCurrentLesson() {
  // Try to get the lesson user is currently working on from localStorage
  const currentLessonId = localStorage.getItem('currentLessonId');
  
  if (currentLessonId) {
    const lesson = getLessonById(parseInt(currentLessonId));
    if (lesson) return lesson;
  }
  
  // Otherwise return first incomplete lesson or first lesson
  const incompleteLessons = lessons.filter(lesson => !lesson.completed);
  return incompleteLessons.length > 0 ? incompleteLessons[0] : lessons[0];
}

// Mark a lesson as completed
function completeLesson(lessonId) {
  const lesson = getLessonById(lessonId);
  if (lesson) {
    lesson.completed = true;
    // Save progress to localStorage
    saveUserProgress();
  }
}

// Set current lesson
function setCurrentLesson(lessonId) {
  localStorage.setItem('currentLessonId', lessonId);
  saveUserProgress();
}

// Get user progress summary
function getUserProgressSummary() {
  const completedCount = lessons.filter(lesson => lesson.completed).length;
  const totalCount = lessons.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  
  return {
    completed: completedCount,
    total: totalCount,
    percentage: percentage,
    totalHours: calculateTotalLearningHours()
  };
}

// Calculate total learning hours from completed lessons
function calculateTotalLearningHours() {
  const totalMinutes = lessons
    .filter(lesson => lesson.completed)
    .reduce((sum, lesson) => sum + lesson.duration, 0);
  
  return Math.round(totalMinutes / 60 * 10) / 10; // Convert to hours with one decimal
}

// Save user progress to localStorage
function saveUserProgress() {
  const progressData = {
    lessonsCompleted: lessons.filter(lesson => lesson.completed).map(lesson => lesson.id),
    currentLessonId: localStorage.getItem('currentLessonId') || 1,
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem('userProgress', JSON.stringify(progressData));
}

// Load user progress from localStorage and apply it
function loadUserProgress() {
  const progressData = localStorage.getItem('userProgress');
  
  if (progressData) {
    try {
      const data = JSON.parse(progressData);
      
      // Mark completed lessons based on stored data
      if (data.lessonsCompleted && Array.isArray(data.lessonsCompleted)) {
        data.lessonsCompleted.forEach(lessonId => {
          const lesson = getLessonById(lessonId);
          if (lesson) {
            lesson.completed = true;
          }
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error loading progress data:', error);
      return null;
    }
  }
  
  return null;
}
