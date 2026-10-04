import React, { useState } from 'react';
import {
  Award,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  Flame,
  BookOpen,
  Printer,
  TrendingUp,
  Star,
  ChevronRight,
  Medal,
  Trophy,
  Rocket } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProgress } from '../../context/ProgressContext';

const Certificates = () => {
  const [activeTab, setActiveTab] = useState('certificates');
  const { progress } = useProgress();

  const totalCompleted = progress.lessonsCompleted?.length || 0;
  const quizScores = progress.quizScores || [];

  // Calculate average quiz accuracy percentage
  const quizAccuracyVal = quizScores.length > 0
    ? Math.round(quizScores.reduce((acc, curr) => acc + (typeof curr.score === 'number' ? curr.score : 85), 0) / quizScores.length)
    : 0;

  // Streak days based on activity log size
  const learningStreakDays = progress.activityLog?.length || 0;

  const milestones = {
    lessonsCompleted: totalCompleted,
    quizAccuracy: quizAccuracyVal || 90,
    learningStreak: learningStreakDays || 1
  };

  // Define Certificates dynamically
  const certificatesEarned = [];
  const inProgressCerts = [];

  const certDefinitions = [
    {
      id: '1',
      courseName: 'AI Fundamentals: Foundations of Machine Learning',
      requiredLessons: 3,
      courseImage: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=1974&auto=format&fit=crop'
    },
    {
      id: '2',
      courseName: 'Python for Data Science: Intermediate Level',
      requiredLessons: 7,
      courseImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop'
    }
  ];

  certDefinitions.forEach(c => {
    if (totalCompleted >= c.requiredLessons) {
      certificatesEarned.push({
        id: c.id,
        courseName: c.courseName,
        completionDate: new Date(progress.lastActivityTimestamp || Date.now()).toISOString().split('T')[0],
        score: `${quizAccuracyVal || 92}%`,
        grade: (quizAccuracyVal || 92) >= 90 ? 'A+' : 'A',
        courseImage: c.courseImage
      });
    } else {
      const progPct = Math.round((totalCompleted / c.requiredLessons) * 100);
      inProgressCerts.push({
        id: c.id,
        courseName: c.courseName,
        progress: progPct,
        lessonsRemaining: c.requiredLessons - totalCompleted,
        totalLessons: c.requiredLessons,
        courseImage: c.courseImage,
        tasks: {
          lessonsCompleted: totalCompleted > 0,
          assignmentsSubmitted: totalCompleted > 1,
          quizAccuracyMet: quizAccuracyVal >= 80 || totalCompleted > 0,
          finalAssessmentCompleted: totalCompleted >= c.requiredLessons
        }
      });
    }
  });

  const badges = [
    { id: 'b1', name: 'First Lesson', description: 'Completed your very first lesson', iconName: 'Rocket', isUnlocked: totalCompleted >= 1, earnedDate: totalCompleted >= 1 ? 'Unlocked' : null },
    { id: 'b2', name: '3 Day Streak', description: 'Learned for 3 consecutive days', iconName: 'Flame', isUnlocked: learningStreakDays >= 3, earnedDate: learningStreakDays >= 3 ? 'Unlocked' : null },
    { id: 'b3', name: 'Quiz Master', description: 'Scored 100% on a study quiz', iconName: 'Star', isUnlocked: quizScores.filter(q => q.score === 100).length >= 1, earnedDate: quizScores.filter(q => q.score === 100).length >= 1 ? 'Unlocked' : null },
    { id: 'b4', name: 'Consistent Learner', description: 'Maintain a 7-day learning streak', iconName: 'Target', isUnlocked: learningStreakDays >= 7, earnedDate: learningStreakDays >= 7 ? 'Unlocked' : null },
    { id: 'b5', name: 'Code Ninja', description: 'Successfully ask 5 or more AI doubt questions', iconName: 'Zap', isUnlocked: (progress.questionsAsked || 0) >= 5, earnedDate: (progress.questionsAsked || 0) >= 5 ? 'Unlocked' : null },
    { id: 'b6', name: 'Deep Thinker', description: 'Spent over 2 hours studying modules', iconName: 'Medal', isUnlocked: (progress.timeSpent?.totalMinutes || 0) >= 120, earnedDate: (progress.timeSpent?.totalMinutes || 0) >= 120 ? 'Unlocked' : null }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-app-bg transition-colors duration-300">
      {/* Hero / Header Section */}
      <div className="bg-linear-to-br from-primary/10 via-app-bg to-secondary/5 border-b border-app-border">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-black text-[10px] tracking-[0.3em] uppercase mb-2">
                <span className="w-8 h-px bg-primary" />
                Proof of Excellence
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-app-text-main tracking-tight uppercase leading-none">
                Achievements & <span className="text-primary italic">Recognition</span>
              </h1>
              <p className="text-sm font-bold text-app-text-sub uppercase tracking-widest max-w-lg mt-4 opacity-70">
                Celebrate your learning journey! Every lesson completed is a step toward your global AI certification.
              </p>
            </div>
            
            <div className="flex bg-app-bg-alt p-1 rounded-2xl border border-app-border shadow-sm">
              <button
                onClick={() => setActiveTab('certificates')}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'certificates' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-app-text-sub hover:bg-app-bg-alt'}`}>
                Certificates
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'achievements' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-app-text-sub hover:bg-app-bg-alt'}`}>
                Badges
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-4 border-t border-app-border/50">
            <StatsCard
              icon={<Award className="text-primary" size={24} />}
              label="Certificates"
              value={certificatesEarned.length}
              subValue="Global Standards" />
            
            <StatsCard
              icon={<Zap className="text-amber-500" size={24} />}
              label="Quiz Accuracy"
              value={`${milestones.quizAccuracy}%`}
              subValue="Top 5% Student" />
            
            <StatsCard
              icon={<Flame className="text-secondary" size={24} />}
              label="Learning Streak"
              value={`${milestones.learningStreak} Days`}
              subValue="Consistent Progress" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'certificates' ?
          <motion.div
            key="certificates"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-16">
            
              {/* Earned Certificates */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-app-text-main uppercase tracking-tight flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-500" size={28} />
                    Certificates Earned
                  </h2>
                  <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                    Officially Verified
                  </span>
                </div>

                {certificatesEarned.length > 0 ?
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {certificatesEarned.map((cert) =>
                    <CertificateCard key={cert.id} certificate={cert} variants={itemVariants} />
                  )}
                </div> :
                <EmptyState
                  message="You're on your way to earning certificates!"
                  subtext="Every lesson completed brings you closer. Check your eligibility tracker below to see your path to certification." />
                }
              </section>

              {/* In-Progress Certs */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-app-text-main uppercase tracking-tight flex items-center gap-3">
                    <Clock className="text-primary" size={28} />
                    Eligibility Tracker
                  </h2>
                  <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-primary/5 border border-primary/20 rounded-full">
                    <TrendingUp size={14} className="text-primary" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Live Progress Tracking</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {inProgressCerts.map((cert) =>
                    <InProgressCard key={cert.id} certificate={cert} variants={itemVariants} />
                  )}
                </div>
              </section>

              {/* Steps to Earn */}
              <section className="bg-app-bg-alt rounded-[40px] border border-app-border p-10 md:p-12 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                  <Medal size={240} />
                </div>
                <div className="relative z-10 max-w-3xl">
                  <h3 className="text-3xl font-black text-app-text-main uppercase tracking-tight mb-4">Certification <span className="text-primary">Requirements</span></h3>
                  <p className="text-sm font-bold text-app-text-sub uppercase tracking-widest leading-relaxed opacity-70 mb-10">
                    To earn your official professional certificate, ensure all tasks below are completed for your chosen course.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <HowToStep
                      number="01"
                      title="Master All Lessons"
                      desc="Watch all video content and interact with the modules until 100% completion." />
                  
                    <HowToStep
                      number="02"
                      title="Submit Assignments"
                      desc="Practical application of your skills through course assignments and projects." />
                  
                    <HowToStep
                      number="03"
                      title="Meet Quiz Accuracy"
                      desc="Demonstrate mastery by scoring at least 80% accuracy across all module quizzes." />
                  
                    <HowToStep
                      number="04"
                      title="Final Assessment"
                      desc="Pass the comprehensive final exam to verify your knowledge and unlock your certificate." />
                  </div>

                  <Link to="/lessons" className="mt-12 inline-flex items-center gap-3 px-10 py-5 bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Continue My Tasks <ChevronRight size={18} />
                  </Link>
                </div>
              </section>
            </motion.div> :

          <motion.div
            key="achievements"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-16">
            
              {/* Badges Section */}
              <section>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                  {badges.map((badge) =>
                    <BadgeIcon key={badge.id} badge={badge} variants={itemVariants} />
                  )}
                </div>
              </section>

              {/* Milestone Summary */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="p-10 bg-app-text-main rounded-[40px] text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 opacity-10 p-4">
                       <Trophy size={160} />
                    </div>
                    <div className="relative z-10">
                       <h3 className="text-2xl font-black uppercase tracking-tight mb-2 italic">Student Milestone</h3>
                       <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-10">Your learning impact by the numbers</p>
                       <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/10">
                          <div>
                             <div className="text-4xl font-black text-primary mb-1">{milestones.lessonsCompleted}</div>
                             <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Lessons Finished</div>
                          </div>
                          <div>
                             <div className="text-4xl font-black text-secondary mb-1">{milestones.quizAccuracy}%</div>
                             <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Average Accuracy</div>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 <div className="p-10 bg-primary/10 border-2 border-dashed border-primary/20 rounded-[40px] flex flex-col justify-center items-center text-center">
                    <Rocket className="text-primary mb-6 animate-bounce" size={48} />
                    <h3 className="text-2xl font-black text-app-text-main uppercase tracking-tight mb-4">Level Up Your Profile</h3>
                    <p className="text-[10px] font-black text-app-text-sub uppercase tracking-widest leading-relaxed max-w-xs opacity-70 mb-8">
                       Unlock "Consistent Learner" and "Code Ninja" badges this week to boost your profile visibility by 35%.
                    </p>
                    <Link to="/lessons" className="px-8 py-4 bg-primary text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all">
                       Start Next Mission
                    </Link>
                 </div>
              </section>
            </motion.div>
          }
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- Subsections ---

const StatsCard = ({ icon, label, value, subValue }) => (
  <div className="bg-app-bg-alt border border-app-border p-6 rounded-3xl group hover:border-primary/50 transition-all flex items-center gap-6">
    <div className="w-14 h-14 rounded-2xl bg-app-bg border border-app-border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <div className="text-[10px] font-black text-app-text-muted uppercase tracking-widest mb-0.5">{label}</div>
      <div className="text-2xl font-black text-app-text-main uppercase leading-none mb-1">{value}</div>
      <div className="text-[9px] font-bold text-primary/70 uppercase tracking-tight">{subValue}</div>
    </div>
  </div>
);

const CertificateCard = ({ certificate, variants }) => (
  <motion.div
    variants={variants}
    whileHover={{ y: -8 }}
    className="group bg-app-bg-alt border-2 border-app-border rounded-[40px] overflow-hidden flex flex-col hover:border-emerald-500/50 transition-all duration-500 shadow-xl shadow-black/5">
    
    <div className="relative h-48 overflow-hidden">
      <img src={certificate.courseImage} alt={certificate.courseName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60" />
      <div className="absolute top-6 left-6 flex gap-3">
        <div className="px-3 py-1 bg-white border border-app-border text-app-text-main text-[8px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5">
           <Star size={10} className="text-amber-500" fill="currentColor" />
           Certified
        </div>
      </div>
      <div className="absolute bottom-6 left-6 text-2xl font-black text-white px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/20">
        {certificate.grade}
      </div>
    </div>
    
    <div className="p-8 flex-1 flex flex-col">
       <div className="flex items-center gap-2 mb-3 text-[10px] font-black text-app-text-muted uppercase tracking-widest">
          <Award size={14} className="text-emerald-500" />
          Professional Credential
       </div>
       <h3 className="text-xl font-black text-app-text-main uppercase tracking-tight line-clamp-2 leading-relaxed mb-6 group-hover:text-primary transition-colors">
          {certificate.courseName}
       </h3>
       
       <div className="grid grid-cols-2 gap-4 mb-8 py-4 border-y border-app-border">
          <div>
            <div className="text-[8px] font-black text-app-text-muted uppercase tracking-widest mb-1 opacity-60">Completion Date</div>
            <div className="text-xs font-black text-app-text-main uppercase">{new Date(certificate.completionDate).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-[8px] font-black text-app-text-muted uppercase tracking-widest mb-1 opacity-60">Final Score</div>
            <div className="text-xs font-black text-app-text-main uppercase">{certificate.score} Accuracy</div>
          </div>
       </div>

       <div className="mt-auto grid grid-cols-3 gap-3">
          <button className="flex-1 px-4 py-3 bg-app-bg border border-app-border rounded-xl text-[9px] font-black text-app-text-main uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-1.5">
             <Download size={14} /> Download
          </button>
          <button className="flex-1 px-4 py-3 bg-app-bg border border-app-border rounded-xl text-[9px] font-black text-app-text-main uppercase tracking-widest hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1.5">
             <Share2 size={14} /> Share
          </button>
          <button className="px-4 py-3 bg-app-bg border border-app-border rounded-xl text-[9px] font-black text-app-text-main uppercase tracking-widest hover:border-primary hover:text-primary transition-all flex items-center justify-center">
             <Printer size={14} />
          </button>
       </div>
    </div>
  </motion.div>
);

const InProgressCard = ({ certificate, variants }) => {
  const pendingTasksCount = Object.values(certificate.tasks || {}).filter((v) => !v).length;
  const isNearlyComplete = pendingTasksCount === 1;

  return (
    <motion.div
      variants={variants}
      className={`bg-app-bg-alt/50 border ${isNearlyComplete ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-app-border'} rounded-[40px] p-8 group hover:bg-app-bg-alt transition-all duration-300 relative overflow-hidden`}>
      
      {isNearlyComplete &&
        <div className="absolute top-0 right-0 px-4 py-1.5 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-2xl">
          Nearly Certified!
        </div>
      }

      <div className="flex gap-6 items-start mb-8">
         <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-app-border group-hover:scale-105 transition-transform duration-500">
            <img src={certificate.courseImage} alt={certificate.courseName} className="w-full h-full object-cover" />
         </div>
         <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
               <Clock size={12} className="text-primary" />
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">In Progress</span>
            </div>
            <h3 className="text-lg font-black text-app-text-main uppercase tracking-tight truncate group-hover:text-primary transition-colors">{certificate.courseName}</h3>
            <div className="flex items-center gap-2 mt-2">
               <div className={`px-2 py-1 ${isNearlyComplete ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'} text-[8px] font-black uppercase tracking-widest rounded`}>
                  {isNearlyComplete ? '1 task left to earn' : `${pendingTasksCount} tasks remaining`}
               </div>
               <span className="text-[9px] font-bold text-app-text-muted uppercase tracking-widest flex items-center gap-1">
                  <BookOpen size={10} />
                  {certificate.lessonsRemaining} Lessons Left
               </span>
            </div>
         </div>
      </div>

      <div className="space-y-6">
         <div>
            <div className="flex justify-between items-end mb-2">
               <span className="text-[10px] font-black text-app-text-main uppercase tracking-widest">Certification Readiness</span>
               <span className="text-xs font-black text-primary">{certificate.progress}%</span>
            </div>
            <div className="h-3 w-full bg-app-border rounded-full p-0.5 overflow-hidden">
               <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${certificate.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-linear-to-r from-primary via-secondary to-primary rounded-full relative">
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
               </motion.div>
            </div>
         </div>

         {/* Task Checklist */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-app-border/50">
            <TaskItem label="All Lessons" completed={certificate.tasks.lessonsCompleted} />
            <TaskItem label="Assignments" completed={certificate.tasks.assignmentsSubmitted} />
            <TaskItem label="Quiz Accuracy" completed={certificate.tasks.quizAccuracyMet} />
            <TaskItem label="Final Test" completed={certificate.tasks.finalAssessmentCompleted} />
         </div>

         <div className="bg-app-bg rounded-2xl p-4 border border-app-border">
            <p className="text-[10px] font-bold text-app-text-sub uppercase tracking-widest italic opacity-80 leading-relaxed text-center">
              {isNearlyComplete ?
                "🎯 You're just one step away! Complete the final requirement to unlock your global certificate." :
                `🚀 Great progress! Finish the remaining tasks to earn your credential.`
              }
            </p>
         </div>
      </div>
      
      <button className="w-full mt-8 py-4 bg-app-bg border border-app-border rounded-2xl text-[9px] font-black text-app-text-main uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
         Continue Course Tasks
      </button>
    </motion.div>
  );
};

const TaskItem = ({ label, completed }) => (
  <div className="flex items-center gap-2">
    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${completed ? 'bg-emerald-500 text-white' : 'border border-app-text-muted/30'}`}>
      {completed ? <CheckCircle2 size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-app-text-muted/20" />}
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-tight ${completed ? 'text-app-text-main' : 'text-app-text-muted'}`}>
      {label}
      {!completed && <span className="ml-1 text-[8px] opacity-40 italic">(Pending)</span>}
    </span>
  </div>
);

const BadgeIcon = ({ badge, variants }) => {
  const Icon = badge.iconName === 'Rocket' ? Rocket :
    badge.iconName === 'Flame' ? Flame :
    badge.iconName === 'Star' ? Star :
    badge.iconName === 'Target' ? Target :
    badge.iconName === 'Zap' ? Zap : Medal;

  return (
    <motion.div
      variants={variants}
      className="flex flex-col items-center group cursor-pointer">
      
      <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full border-2 flex items-center justify-center transition-all duration-500 mb-4 
        ${badge.isUnlocked ?
          'bg-app-bg border-secondary/30 shadow-xl shadow-secondary/5 rotate-0' :
          'bg-app-bg-alt border-app-border greyscale opacity-40 grayscale rotate-12'}`}>
        
        <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center 
          ${badge.isUnlocked ? 'bg-linear-to-br from-secondary/10 to-primary/5' : 'bg-transparent'}`}>
          <Icon className={badge.isUnlocked ? 'text-secondary w-10 h-10 md:w-14 md:h-14' : 'text-app-text-muted w-10 h-10 md:w-14 md:h-14'} />
        </div>
        
        {badge.isUnlocked &&
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center border-4 border-app-bg scale-90">
             <CheckCircle2 size={16} fill="currentColor" />
          </div>
        }
      </div>
      <h4 className="text-[10px] font-black text-app-text-main uppercase tracking-widest text-center">{badge.name}</h4>
      {badge.earnedDate &&
        <span className="text-[8px] font-bold text-secondary uppercase tracking-tight mt-1">{badge.earnedDate}</span>
      }
      {!badge.isUnlocked &&
        <div className="mt-2 text-[8px] font-bold text-app-text-muted uppercase tracking-widest text-center max-w-20 leading-tight">
          {badge.description}
        </div>
      }
    </motion.div>
  );
};

const HowToStep = ({ number, title, desc }) => (
  <div className="flex gap-5">
    <div className="text-3xl font-black text-primary/20 italic select-none">{number}</div>
    <div>
      <h4 className="text-xs font-black text-app-text-main uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-[10px] font-bold text-app-text-sub uppercase tracking-tight opacity-60 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const EmptyState = ({ message, subtext }) => (
  <div className="py-20 text-center border-2 border-dashed border-app-border rounded-[40px] bg-app-bg-alt/30">
    <Medal className="mx-auto text-app-border mb-6" size={64} />
    <h3 className="text-2xl font-black text-app-text-main uppercase tracking-tight mb-2">{message}</h3>
    <p className="text-xs font-bold text-app-text-sub uppercase tracking-widest opacity-60 max-w-sm mx-auto mb-8">
      {subtext}
    </p>
    <Link to="/lessons" className="px-10 py-4 bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 transition-all">
       Continue Learning
    </Link>
  </div>
);

export default Certificates;