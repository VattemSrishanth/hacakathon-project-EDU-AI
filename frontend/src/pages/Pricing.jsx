import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Zap,
  Shield,
  HelpCircle,
  ArrowRight,
  School,
  Sparkles,
  Award,
  ChevronDown,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const Pricing = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' | 'yearly'
  const [openFaq, setOpenFaq] = useState(null);

  const plans = [
    {
      id: 'free',
      name: 'Student Starter',
      badge: 'Free Forever',
      badgeColor: 'bg-app-bg-alt text-app-text-sub border border-app-border',
      description: 'Foundational learning resources for self-paced students and curious minds.',
      price: {
        monthly: '₹0',
        yearly: '₹0'
      },
      period: 'forever',
      features: [
        'Complete NCERT & State Board Curriculums',
        'Up to 5 Offline Downloaded Modules',
        'Standard Chapter Practice Quizzes',
        'Basic Accessibility (High Contrast & Font Scaling)',
        'Community Forum & Doubts Hub Access',
        'Standard Dashboard Analytics'
      ],
      cta: 'Start Learning Free',
      ctaVariant: 'outline',
      highlighted: false,
      onClick: () => navigate('/register')
    },
    {
      id: 'pro',
      name: 'Scholar Pro',
      badge: 'Most Popular 🔥',
      badgeColor: 'bg-primary text-white shadow-sm shadow-primary/30',
      description: 'Unlimited 24/7 AI-powered personal tutoring and zero-bandwidth offline studying.',
      price: {
        monthly: '₹149',
        yearly: '₹1,299'
      },
      period: billingCycle === 'yearly' ? '/ year (₹108/mo)' : '/ month',
      savings: billingCycle === 'yearly' ? 'Save 28% annually' : null,
      features: [
        'Everything in Student Starter',
        'Unlimited 24/7 AI Tutor Doubts (Groq LPU Engine)',
        'Unlimited Offline Downloads & Zero-Data Media Cache',
        'Upload Custom Textbooks & Generate Mock Exams',
        'Full Accessibility Suite (ISL, Captions, Speech Assist)',
        'Weekly Parent WhatsApp Progress Reports',
        'Interactive Pomodoro Focus Study Timer',
        'Verifiable Digital Course Completion Certificates'
      ],
      cta: 'Get Scholar Pro',
      ctaVariant: 'primary',
      highlighted: true,
      onClick: () => navigate('/register?plan=pro')
    },
    {
      id: 'institution',
      name: 'Institution & Academy',
      badge: 'Schools & Colleges',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
      description: 'Complete digital campus LMS and classroom manager for forward-thinking schools.',
      price: {
        monthly: '₹1,499',
        yearly: '₹14,999'
      },
      period: billingCycle === 'yearly' ? '/ school / year' : '/ school / month',
      savings: billingCycle === 'yearly' ? 'Up to 500 students included' : null,
      features: [
        'Everything in Scholar Pro for All Enrolled Students',
        'Teacher Classroom Manager & Auto-Graded Assignments',
        'Custom School Branding & White-Labeled Portal',
        'Sync-Station Support for Offline Computer Labs',
        'Attendance & Academic Performance CSV/Excel Exports',
        'Bulk Student Roster CSV Onboarding',
        'Dedicated 24/7 Account Manager & 99.9% Uptime SLA'
      ],
      cta: 'Contact for School Setup',
      ctaVariant: 'outline',
      highlighted: false,
      onClick: () => navigate('/support')
    }
  ];

  const faqs = [
    {
      q: 'Can our school test Edu-AI before purchasing an annual license?',
      a: 'Yes! We offer a 30-day full institution pilot for schools, coaching centers, and colleges with up to 100 students and teacher accounts at zero cost.'
    },
    {
      q: 'Does the Pro plan really work completely offline?',
      a: 'Absolutely. All lessons, chapter notes, and practice quizzes are cached locally on your device via IndexedDB. Your study streak and quiz scores sync to the cloud automatically whenever internet reconnects.'
    },
    {
      q: 'What payment methods are supported in India?',
      a: 'We support all major Indian payment gateways including UPI (GPay, PhonePe, Paytm), RuPay/Visa/Mastercard debit and credit cards, Net Banking, and school purchase orders (PO).'
    },
    {
      q: 'Are discounts available for non-profits or rural government schools?',
      a: 'Yes. Through our CSR Education Grant initiative, eligible rural and government schools receive subsidized or 100% free institutional licenses funded by educational partners.'
    }
  ];

  return (
    <div className="min-h-screen bg-app-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} />
            Transparent, Student-First Pricing
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-app-text-main tracking-tight leading-tight">
            Invest in Education that Works <span className="text-primary">Online & Offline</span>
          </h1>
          <p className="text-base sm:text-lg text-app-text-sub font-medium leading-relaxed">
            Accessible, affordable, and AI-powered education designed for individual students, parents, and entire institutions.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-app-bg-alt border border-app-border shadow-xs">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-app-bg text-app-text-main shadow-xs'
                    : 'text-app-text-sub hover:text-app-text-main'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-app-text-sub hover:text-app-text-main'
                }`}
              >
                <span>Annual Billing</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  billingCycle === 'yearly' ? 'bg-white text-primary' : 'bg-emerald-500/10 text-emerald-600'
                }`}>
                  Save 28%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                plan.highlighted
                  ? 'bg-app-bg border-2 border-primary shadow-2xl shadow-primary/10 ring-4 ring-primary/10 scale-100 lg:scale-[1.03]'
                  : 'bg-app-bg border border-app-border shadow-lg hover:border-primary/40'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                  Recommended Plan
                </div>
              )}

              {/* Card Header */}
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-black text-app-text-main tracking-tight">
                    {plan.name}
                  </h3>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${plan.badgeColor}`}>
                    {plan.badge}
                  </span>
                </div>

                <p className="text-xs text-app-text-sub font-medium leading-relaxed min-h-[36px]">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="pt-2 pb-4 border-b border-app-border">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-app-text-main tracking-tight font-mono">
                      {billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly}
                    </span>
                    <span className="text-xs font-semibold text-app-text-sub">
                      {plan.period}
                    </span>
                  </div>
                  {plan.savings && (
                    <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      {plan.savings}
                    </div>
                  )}
                </div>

                {/* Feature Checklist */}
                <div className="space-y-3 pt-2">
                  <p className="text-[11px] font-black uppercase tracking-wider text-app-text-muted">
                    What's included:
                  </p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs font-semibold text-app-text-sub">
                        <Check size={16} className="text-primary shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-8 mt-6 border-t border-app-border">
                <Button
                  variant={plan.ctaVariant}
                  onClick={plan.onClick}
                  className={`w-full py-3.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
                    plan.highlighted ? 'shadow-lg shadow-primary/20 hover:scale-[1.02]' : ''
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Institutional Trust Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
              <School size={14} />
              Educational Institutions & NGOs
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Empowering Over 50+ Schools & Learning Centers
            </h3>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl">
              Equip your school with custom syllabi, automated offline exam grading, and localized sign-language classrooms.
            </p>
          </div>
          <Button
            onClick={() => navigate('/support')}
            className="bg-white text-slate-900 hover:bg-slate-100 font-black text-xs uppercase tracking-wider py-4 px-8 rounded-2xl shadow-xl shrink-0 cursor-pointer"
          >
            Request Institutional Demo
          </Button>
        </div>

        {/* FAQs Section */}
        <div className="bg-app-bg border border-app-border rounded-3xl p-8 max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-app-border">
            <HelpCircle className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-black text-app-text-main tracking-tight">
                Frequently Asked Pricing Questions
              </h2>
              <p className="text-xs text-app-text-sub">Everything you need to know about plans, billing, and school onboarding.</p>
            </div>
          </div>

          <div className="divide-y divide-app-border/60">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="py-4 first:pt-2 last:pb-2">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer"
                  >
                    <span className="font-bold text-app-text-main text-sm group-hover:text-primary transition-colors">
                      {faq.q}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center bg-app-bg-alt text-app-text-muted group-hover:text-primary transition-all duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <ChevronDown size={16} />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="mt-3 pr-8 text-xs font-medium text-app-text-sub leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
