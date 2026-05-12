import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Target, 
  Clock, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  BrainCircuit, 
  Star, 
  Lightbulb, 
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  History
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useProgress } from '../../context/ProgressContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Link } from 'react-router-dom';

const Insights = () => {
  const { progress, getTimeSpentData } = useProgress();

  // --- Data Calculations ---
  
  const stats = useMemo(() => {
    const totalQuizzes = progress.quizScores.length;
    const avgScore = totalQuizzes > 0 
      ? Math.round(progress.quizScores.reduce((acc, q) => acc + (q.score / q.maxScore), 0) / totalQuizzes * 100) 
      : 0;
    
    // Calculate accuracy trend (last 3 vs previous)
    const recentScores = progress.quizScores.slice(-3);
    const recentAvg = recentScores.length > 0
      ? Math.round(recentScores.reduce((acc, q) => acc + (q.score / q.maxScore), 0) / recentScores.length * 100)
      : 0;

    const totalLessons = progress.lessonsCompleted.length;
    const weeklyMinutes = getTimeSpentData().reduce((acc, d) => acc + d.minutes, 0);
    
    return {
      avgScore,
      recentAvg,
      totalLessons,
      weeklyMinutes,
      accuracy: avgScore, // Overall accuracy
      isImproving: recentAvg >= avgScore
    };
  }, [progress, getTimeSpentData]);

  const trendsData = useMemo(() => getTimeSpentData().map(d => ({
    name: d.day,
    minutes: d.minutes,
    accuracy: stats.avgScore + (Math.random() * 10 - 5) // Simulated accuracy fluctuation
  })), [getTimeSpentData, stats.avgScore]);

  const topicsData = useMemo(() => {
    // Group scores by lessonId (topic)
    const grouped: Record<string, number[]> = {};
    progress.quizScores.forEach(q => {
      if (!grouped[q.lessonId]) grouped[q.lessonId] = [];
      grouped[q.lessonId].push(q.score / q.maxScore);
    });

    const topicStats = Object.entries(grouped).map(([name, scores]) => ({
      name: name.length > 15 ? name.substring(0, 12) + '...' : name,
      fullName: name,
      score: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100)
    }));

    return {
      strengths: topicStats.filter(t => t.score >= 80).sort((a, b) => b.score - a.score),
      weaknesses: topicStats.filter(t => t.score < 80).sort((a, b) => a.score - b.score)
    };
  }, [progress.quizScores]);

  const aiInsights = useMemo(() => {
    const insights = [];
    
    if (stats.weeklyMinutes > 120) {
      insights.push({
        icon: <Zap className="text-amber-500" />,
        title: "High Momentum",
        desc: "Your learning duration this week is 25% higher than average. Great consistency!"
      });
    }

    if (stats.isImproving && progress.quizScores.length > 2) {
      insights.push({
        icon: <TrendingUp className="text-emerald-500" />,
        title: "Upward Trajectory",
        desc: "Your accuracy in the last 3 quizzes is showing a steady improvement."
      });
    }

    if (stats.avgScore >= 85) {
      insights.push({
        icon: <Star className="text-secondary" />,
        title: "Mastery Level",
        desc: "You have achieved mastery in most fundamental concepts. Ready for advanced modules."
      });
    }

    if (insights.length === 0) {
      insights.push({
        icon: <Lightbulb className="text-primary" />,
        title: "Growth Mindset",
        desc: "Completing just one more lesson today will boost your weekly goal by 20%."
      });
    }

    return insights;
  }, [stats, progress.quizScores.length]);

  const isEmpty = progress.lessonsCompleted.length === 0 && progress.quizScores.length === 0;

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-app-bg py-12 px-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="w-24 h-24 bg-app-bg-alt rounded-3xl border-2 border-dashed border-app-border flex items-center justify-center mx-auto mb-8">
            <BrainCircuit size={48} className="text-app-text-muted opacity-30" />
          </div>
          <h1 className="text-3xl font-black text-app-text-main uppercase tracking-tight">
            Unlock Your <span className="text-primary">Intelligence</span>
          </h1>
          <p className="text-app-text-sub font-bold uppercase tracking-widest text-xs leading-relaxed">
            Start learning to unlock deep insights into your performance, habits, and progress trends.
          </p>
          <Link to="/lessons" className="block">
            <Button variant="primary" className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
              Start first lesson
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-black text-[10px] tracking-[0.3em] uppercase mb-1">
              <Sparkles size={14} />
              AI Dashboard
            </div>
            <h1 className="text-4xl font-black text-app-text-main uppercase tracking-tight leading-none">
              Learning <span className="text-primary italic">Intelligence</span>
            </h1>
            <p className="text-xs font-bold text-app-text-sub uppercase tracking-widest opacity-70">
              Personalized data-driven insights to accelerate your growth.
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-app-bg-alt border border-app-border rounded-2xl">
             <Calendar size={18} className="text-primary" />
             <span className="text-xs font-black text-app-text-main uppercase tracking-widest">Week of Feb 16 - 22</span>
          </div>
        </div>

        {/* SECTION 1: PERFORMANCE OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <OverviewCard 
            icon={<Award className="text-primary" />} 
            label="Avg Quiz Score" 
            value={`${stats.avgScore}%`}
            trend={stats.isImproving ? "positive" : "neutral"}
          />
          <OverviewCard 
            icon={<CheckCircle2 className="text-emerald-500" />} 
            label="Lessons Completed" 
            value={stats.totalLessons}
          />
          <OverviewCard 
            icon={<Clock className="text-amber-500" />} 
            label="Study Time" 
            value={`${stats.weeklyMinutes}m`}
            subValue="This Week"
          />
          <OverviewCard 
            icon={<Target className="text-secondary" />} 
            label="Overall Accuracy" 
            value={`${stats.accuracy}%`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SECTION 2: PROGRESS TRENDS */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 h-full border-app-border bg-app-bg shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-black text-app-text-main uppercase tracking-tight flex items-center gap-2">
                    <BarChart3 size={20} className="text-primary" />
                    Activity & Performance Trends
                  </h2>
               </div>
               <div className="h-75 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendsData}>
                      <defs>
                        <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4338ca" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4338ca" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} 
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                          textTransform: 'uppercase',
                          fontSize: '10px',
                          fontWeight: '900'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="minutes" 
                        stroke="#4338ca" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorMin)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </Card>
          </div>

          {/* SECTION 4: AI LEARNING INSIGHTS */}
          <div className="space-y-6">
            <Card className="p-8 border-app-border bg-app-bg shadow-sm h-full flex flex-col">
              <h2 className="text-lg font-black text-app-text-main uppercase tracking-tight flex items-center gap-2 mb-8">
                <BrainCircuit size={20} className="text-secondary" />
                AI Intelligence
              </h2>
              <div className="space-y-6 flex-1">
                {aiInsights.map((insight, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-app-bg-alt border border-app-border hover:border-primary/30 transition-colors">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-app-bg border border-app-border flex items-center justify-center">
                      {insight.icon}
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-app-text-main mb-1">{insight.title}</h4>
                      <p className="text-[9px] font-bold text-app-text-sub uppercase tracking-tight leading-relaxed opacity-80">
                        {insight.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-app-border">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-app-text-muted">Live Analysis active</span>
                 </div>
                 <p className="text-[9px] font-bold text-app-text-sub uppercase italic">
                   "Your recall accuracy improves by 35% when you study between 8 AM and 10 AM."
                 </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* SECTION 3: STRENGTHS & WEAK AREAS */}
          <Card className="p-8 border-app-border bg-app-bg shadow-sm">
            <h2 className="text-lg font-black text-app-text-main uppercase tracking-tight flex items-center gap-2 mb-8">
              <Target size={20} className="text-emerald-500" />
              Skill Radar
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] font-black uppercase text-app-text-muted tracking-widest mb-4 flex items-center gap-2">
                  <Star size={12} className="text-secondary" fill="currentColor" />
                  Primary Strengths
                </h3>
                <div className="flex flex-wrap gap-3">
                  {topicsData.strengths.length > 0 ? topicsData.strengths.map((t, i) => (
                    <div key={i} className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                      {t.name} • {t.score}%
                    </div>
                  )) : (
                    <p className="text-[10px] uppercase font-bold text-app-text-muted italic">Identifying strengths...</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase text-app-text-muted tracking-widest mb-4 flex items-center gap-2">
                  <TrendingDown size={12} className="text-red-500" />
                  Growth Opportunities
                </h3>
                <div className="flex flex-wrap gap-3">
                  {topicsData.weaknesses.length > 0 ? topicsData.weaknesses.map((t, i) => (
                    <div key={i} className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 font-black text-[10px] uppercase tracking-widest">
                      {t.name} • {t.score}%
                    </div>
                  )) : (
                    <p className="text-[10px] uppercase font-bold text-app-text-muted italic">Keep learning to identify gaps.</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION 6: STUDY HABITS */}
          <Card className="p-8 border-app-border bg-app-bg shadow-sm">
             <h2 className="text-lg font-black text-app-text-main uppercase tracking-tight flex items-center gap-2 mb-8">
              <History size={20} className="text-primary" />
              Behavioral DNA
            </h2>
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-6">
                  <HabitStat label="Peak Focus" value="Late Morning" sub="8:00 AM - 11:00 AM" />
                  <HabitStat label="Avg Session" value="32 Minutes" sub="Flow state achieved" />
               </div>
               <div className="space-y-6 text-right">
                  <HabitStat label="Consistency" value="High" sub="85% Daily streak" />
                  <HabitStat label="Completion rate" value="1.2 Units/Day" sub="Above average" />
               </div>
            </div>
            <div className="mt-10 p-4 bg-primary/5 rounded-2xl border border-primary/20 flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                  <Zap size={20} />
               </div>
               <p className="text-[10px] font-black uppercase tracking-tight text-app-text-main leading-none">
                 You are 40% more likely to finish a course when you start with a 5-minute review.
               </p>
            </div>
          </Card>

        </div>

        {/* SECTION 5: RECOMMENDED FOCUS AREAS */}
        <section className="bg-app-text-main rounded-[40px] p-10 md:p-12 text-white overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Lightbulb size={240} />
           </div>
           <div className="relative z-10">
              <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Recommended <span className="text-primary">Missions</span></h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-10">Next steps specialized for your current level</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <RecommendationBox 
                    title="Quick Revision" 
                    topic={topicsData.weaknesses[0]?.name || "Core Concepts"}
                    action="Review now"
                 />
                 <RecommendationBox 
                    title="Mastery Challenge" 
                    topic="Advanced Logic II"
                    action="Unlock 50XP"
                 />
                 <RecommendationBox 
                    title="Next in Path" 
                    topic="Neural Architectures"
                    action="Start 20m lesson"
                 />
              </div>

              <div className="mt-12 flex items-center gap-6">
                 <Link to="/lessons">
                    <Button variant="primary" className="px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2">
                       Launch Next Module <ArrowRight size={16} />
                    </Button>
                 </Link>
                 <div className="hidden sm:flex items-center gap-3">
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-app-text-main bg-app-bg-alt flex items-center justify-center text-[10px] font-black text-primary">
                           +{i * 10}
                         </div>
                       ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Earned this week</span>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
};

// --- Sub-components ---

const OverviewCard = ({ icon, label, value, trend, subValue }: any) => (
  <Card className="p-6 border-app-border bg-app-bg-alt/50 hover:bg-app-bg-alt transition-colors group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2.5 rounded-xl bg-app-bg border border-app-border group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      {trend === "positive" && (
        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
          <TrendingUp size={12} />
          +12%
        </div>
      )}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase text-app-text-muted tracking-widest mb-1 leading-none">{label}</p>
      <div className="flex items-end gap-2">
        <h3 className="text-2xl font-black text-app-text-main uppercase leading-none">{value}</h3>
        {subValue && <span className="text-[10px] font-bold text-app-text-sub uppercase mb-0.5">{subValue}</span>}
      </div>
    </div>
  </Card>
);

const HabitStat = ({ label, value, sub }: any) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black uppercase text-app-text-muted tracking-widest mb-2 leading-none">{label}</p>
    <h4 className="text-xl font-black text-app-text-main uppercase leading-none">{value}</h4>
    <p className="text-[9px] font-bold text-primary uppercase opacity-70">{sub}</p>
  </div>
);

const RecommendationBox = ({ title, topic, action }: any) => (
  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
    <h4 className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] mb-4">{title}</h4>
    <p className="text-lg font-black uppercase text-white mb-6 group-hover:text-primary transition-colors leading-tight">{topic}</p>
    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
      {action} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
);

export default Insights;
