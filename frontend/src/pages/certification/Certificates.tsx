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
  History, 
  ExternalLink, 
  Printer,
  TrendingUp,
  Star,
  ChevronRight,
  Medal,
  Trophy,
  Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Certificate, InProgressCertificate, AchievementBadge, LearningMilestones } from '../../types';

// Mock Data
const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: '1',
    courseName: 'AI Fundamentals: Foundations of Machine Learning',
    completionDate: '2026-02-15',
    score: '96%',
    grade: 'A+',
    courseImage: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=1974&auto=format&fit=crop'
  },
  {
    id: '2',
    courseName: 'Python for Data Science: Intermediate Level',
    completionDate: '2026-01-20',
    score: '88%',
    grade: 'A',
    courseImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop'
  }
];

const MOCK_IN_PROGRESS: InProgressCertificate[] = [
  {
    id: '3',
    courseName: 'Natural Language Processing Masterclass',
    progress: 75,
    lessonsRemaining: 3,
    totalLessons: 12,
    courseImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop'
  },
  {
    id: '4',
    courseName: 'Advanced Computer Vision with AI',
    progress: 40,
    lessonsRemaining: 8,
    totalLessons: 14,
    courseImage: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=2070&auto=format&fit=crop'
  }
];

const MOCK_BADGES: AchievementBadge[] = [
  { id: 'b1', name: 'First Lesson', description: 'Completed your very first lesson', iconName: 'Rocket', isUnlocked: true, earnedDate: '2026-01-05' },
  { id: 'b2', name: '3 Day Streak', description: 'Learned for 3 consecutive days', iconName: 'Flame', isUnlocked: true, earnedDate: '2026-01-08' },
  { id: 'b3', name: 'Quiz Master', description: 'Scored 100% on 5 different quizzes', iconName: 'Star', isUnlocked: true, earnedDate: '2026-02-10' },
  { id: 'b4', name: 'Consistent Learner', description: 'Maintain a 7-day learning streak', iconName: 'Target', isUnlocked: false },
  { id: 'b5', name: 'Code Ninja', description: 'Successfully write 50 snippets', iconName: 'Zap', isUnlocked: false },
  { id: 'b6', name: 'Deep Thinker', description: 'Spent over 10 hours on complex topics', iconName: 'Medal', isUnlocked: false },
];

const MILESTONES: LearningMilestones = {
  lessonsCompleted: 42,
  quizAccuracy: 92,
  learningStreak: 5
};

const Certificates = () => {
  const [activeTab, setActiveTab] = useState<'certificates' | 'achievements'>('certificates');

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
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'certificates' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-app-text-sub hover:bg-app-bg-alt'}`}
              >
                Certificates
              </button>
              <button 
                onClick={() => setActiveTab('achievements')}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'achievements' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-app-text-sub hover:bg-app-bg-alt'}`}
              >
                Badges
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-4 border-t border-app-border/50">
            <StatsCard 
              icon={<Award className="text-primary" size={24} />} 
              label="Certificates" 
              value={MOCK_CERTIFICATES.length} 
              subValue="Global Standards"
            />
            <StatsCard 
              icon={<Zap className="text-amber-500" size={24} />} 
              label="Quiz Accuracy" 
              value={`${MILESTONES.quizAccuracy}%`} 
              subValue="Top 5% Student"
            />
            <StatsCard 
              icon={<Flame className="text-secondary" size={24} />} 
              label="Learning Streak" 
              value={`${MILESTONES.learningStreak} Days`} 
              subValue="Consistent Progress"
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'certificates' ? (
            <motion.div 
              key="certificates"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-16"
            >
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

                {MOCK_CERTIFICATES.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {MOCK_CERTIFICATES.map((cert) => (
                      <CertificateCard key={cert.id} certificate={cert} variants={itemVariants} />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Earn your first certificate!" subtext="Complete any course to unlock your first professional certificate." />
                )}
              </section>

              {/* In-Progress Certs */}
              <section>
                <h2 className="text-2xl font-black text-app-text-main uppercase tracking-tight flex items-center gap-3 mb-8">
                  <Clock className="text-primary" size={28} />
                  In-Progress Certifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {MOCK_IN_PROGRESS.map((cert) => (
                    <InProgressCard key={cert.id} certificate={cert} variants={itemVariants} />
                  ))}
                </div>
              </section>

              {/* Steps to Earn */}
              <section className="bg-app-bg-alt rounded-[40px] border border-app-border p-10 md:p-12 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                  <Medal size={240} />
                </div>
                <div className="relative z-10 max-w-3xl">
                  <h3 className="text-3xl font-black text-app-text-main uppercase tracking-tight mb-4">How to Earn Your <span className="text-primary">Global Certificate</span></h3>
                  <p className="text-sm font-bold text-app-text-sub uppercase tracking-widest leading-relaxed opacity-70 mb-10">
                    Follow these simple steps and transform your learning into a globally recognized credential.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <HowToStep 
                      number="01" 
                      title="Master Lessons" 
                      desc="Engage with interactive lessons and video tutorials designed by AI experts." 
                    />
                    <HowToStep 
                      number="02" 
                      title="Pass Quizzes" 
                      desc="Demonstrate your knowledge with accuracy scores above 80% on each module." 
                    />
                    <HowToStep 
                      number="03" 
                      title="Final Assessment" 
                      desc="Complete the comprehensive final exam to verify your mastery of the entire course." 
                    />
                    <HowToStep 
                      number="04" 
                      title="Share Success" 
                      desc="Instantly download your PDF and share your achievement on professional networks." 
                    />
                  </div>

                  <Link to="/lessons" className="mt-12 inline-flex items-center gap-3 px-10 py-5 bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Continue Learning <ChevronRight size={18} />
                  </Link>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="achievements"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-16"
            >
              {/* Badges Section */}
              <section>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                  {MOCK_BADGES.map((badge) => (
                    <BadgeIcon key={badge.id} badge={badge} variants={itemVariants} />
                  ))}
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
                             <div className="text-4xl font-black text-primary mb-1">{MILESTONES.lessonsCompleted}</div>
                             <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Lessons Finished</div>
                          </div>
                          <div>
                             <div className="text-4xl font-black text-secondary mb-1">{MILESTONES.quizAccuracy}%</div>
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
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- Subsections ---

const StatsCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, subValue: string }> = ({ icon, label, value, subValue }) => (
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

const CertificateCard: React.FC<{ certificate: Certificate, variants: any }> = ({ certificate, variants }) => (
  <motion.div 
    variants={variants}
    whileHover={{ y: -8 }}
    className="group bg-app-bg-alt border-2 border-app-border rounded-[40px] overflow-hidden flex flex-col hover:border-emerald-500/50 transition-all duration-500 shadow-xl shadow-black/5"
  >
    <div className="relative h-48 overflow-hidden">
      <img src={certificate.courseImage} alt={certificate.courseName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute inset-0 bg-linear-to-t from-app-bg-alt via-transparent to-transparent opacity-60" />
      <div className="absolute top-6 left-6 flex gap-3">
        <div className="px-3 py-1 bg-white border border-app-border text-app-text-main text-[8px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5">
           <Star size={10} className="text-amber-500" fill="currentColor" />
           Certified
        </div>
      </div>
      <div className="absolute bottom-6 left-6 text-2xl font-black text-white px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/20">
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
            <div className="text-[8px] font-black text-app-text-muted uppercase tracking-widest mb-1 opacity-60">Assessment Score</div>
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

const InProgressCard: React.FC<{ certificate: InProgressCertificate, variants: any }> = ({ certificate, variants }) => (
  <motion.div 
    variants={variants}
    className="bg-app-bg-alt/50 border border-app-border rounded-[40px] p-8 group hover:bg-app-bg-alt transition-all duration-300"
  >
    <div className="flex gap-6 items-start mb-8">
       <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-app-border">
          <img src={certificate.courseImage} alt={certificate.courseName} className="w-full h-full object-cover" />
       </div>
       <div>
          <h3 className="text-lg font-black text-app-text-main uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{certificate.courseName}</h3>
          <div className="flex items-center gap-2 mt-2">
             <div className="px-2 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded">
                Earned Status: Soon
             </div>
             <span className="text-[9px] font-bold text-app-text-muted uppercase tracking-widest flex items-center gap-1">
                <BookOpen size={10} />
                {certificate.lessonsRemaining} Lessons Left
             </span>
          </div>
       </div>
    </div>

    <div className="space-y-4">
       <div className="flex justify-between items-end mb-1">
          <span className="text-[10px] font-black text-app-text-main uppercase tracking-widest">Progress to Certificate</span>
          <span className="text-xs font-black text-primary">{certificate.progress}%</span>
       </div>
       <div className="h-4 w-full bg-app-border rounded-full p-1 overflow-hidden">
          <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${certificate.progress}%` }}
             transition={{ duration: 1, ease: "easeOut" }}
             className="h-full bg-linear-to-r from-primary to-secondary rounded-full relative"
          >
             <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </motion.div>
       </div>
       <p className="text-[10px] font-bold text-app-text-sub uppercase tracking-widest italic opacity-60">
          "Almost there! Just {certificate.lessonsRemaining} more lessons to earn your official credential."
       </p>
    </div>
    
    <button className="w-full mt-8 py-4 bg-app-bg border border-app-border rounded-2xl text-[9px] font-black text-app-text-main uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
       Continue Learning
    </button>
  </motion.div>
);

const BadgeIcon: React.FC<{ badge: AchievementBadge, variants: any }> = ({ badge, variants }) => {
  const Icon = badge.iconName === 'Rocket' ? Rocket : 
               badge.iconName === 'Flame' ? Flame : 
               badge.iconName === 'Star' ? Star : 
               badge.iconName === 'Target' ? Target : 
               badge.iconName === 'Zap' ? Zap : Medal;

  return (
    <motion.div 
      variants={variants}
      className="flex flex-col items-center group cursor-pointer"
    >
      <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full border-2 flex items-center justify-center transition-all duration-500 mb-4 
        ${badge.isUnlocked 
          ? 'bg-app-bg border-secondary/30 shadow-xl shadow-secondary/5 rotate-0' 
          : 'bg-app-bg-alt border-app-border greyscale opacity-40 grayscale rotate-12'}`}
      >
        <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center 
          ${badge.isUnlocked ? 'bg-linear-to-br from-secondary/10 to-primary/5' : 'bg-transparent'}`}
        >
          <Icon className={badge.isUnlocked ? 'text-secondary w-10 h-10 md:w-14 md:h-14' : 'text-app-text-muted w-10 h-10 md:w-14 md:h-14'} />
        </div>
        
        {badge.isUnlocked && (
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center border-4 border-app-bg scale-90">
             <CheckCircle2 size={16} fill="currentColor" />
          </div>
        )}
      </div>
      <h4 className="text-[10px] font-black text-app-text-main uppercase tracking-widest text-center">{badge.name}</h4>
      {badge.earnedDate && (
        <span className="text-[8px] font-bold text-secondary uppercase tracking-tight mt-1">{badge.earnedDate}</span>
      )}
      {!badge.isUnlocked && (
        <div className="mt-2 text-[8px] font-bold text-app-text-muted uppercase tracking-widest text-center max-w-20 leading-tight">
          {badge.description}
        </div>
      )}
    </motion.div>
  );
};

const HowToStep: React.FC<{ number: string, title: string, desc: string }> = ({ number, title, desc }) => (
  <div className="flex gap-5">
    <div className="text-3xl font-black text-primary/20 italic select-none">{number}</div>
    <div>
      <h4 className="text-xs font-black text-app-text-main uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-[10px] font-bold text-app-text-sub uppercase tracking-tight opacity-60 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const EmptyState: React.FC<{ message: string, subtext: string }> = ({ message, subtext }) => (
  <div className="py-20 text-center border-2 border-dashed border-app-border rounded-[40px] bg-app-bg-alt/30">
    <Medal className="mx-auto text-app-border mb-6" size={64} />
    <h3 className="text-2xl font-black text-app-text-main uppercase tracking-tight mb-2">{message}</h3>
    <p className="text-xs font-bold text-app-text-sub uppercase tracking-widest opacity-60 max-w-sm mx-auto mb-8">
      {subtext}
    </p>
    <Link to="/lessons" className="px-10 py-4 bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
       Browse Courses
    </Link>
  </div>
);

export default Certificates;
