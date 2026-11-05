import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import {
  Mail,
  Phone,
  LifeBuoy,
  MessageCircle,
  Send,
  Star,
  BookText,
  ArrowUpRight,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { userDataAPI } from '../services/api';
import Button from '../components/Button';

const Support = () => {
  const { t } = useSettings();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(1);

  const faqs = [
    {
      id: 1,
      question: 'Can I use Edu-AI completely offline?',
      answer: 'Yes! Edu-AI caches downloaded lessons, summaries, and quizzes locally using IndexedDB. When your device reconnects, your quiz scores and study streak automatically sync to the cloud in the background.'
    },
    {
      id: 2,
      question: 'How does the AI Tutor generate educational explanations?',
      answer: 'The AI Tutor leverages open-source educational models via high-speed inference (Groq LPU Engine), delivering rapid, distraction-free concept breakdowns and step-by-step problem solutions.'
    },
    {
      id: 3,
      question: 'How do parents and teachers monitor student progress?',
      answer: 'Parents and teachers can access dedicated portal views from the navigation sidebar (/student-progress and /class-management) to review assignment submissions, attendance, and subject mastery.'
    },
    {
      id: 4,
      question: 'How do I reduce data usage on cellular connections?',
      answer: 'Navigate to the Data Usage dashboard (/data-usage) and activate Data Saver mode. This compresses multimedia, prioritizes text summaries, and delays non-essential background downloads.'
    },
    {
      id: 5,
      question: 'Where can I customize accessibility preferences?',
      answer: 'The Accessibility Hub (/accessibility) allows you to adjust font scaling, toggle high-contrast Wednesday/Dark/Light themes, enable audio speech assistance, and configure live captioning.'
    }
  ];

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (rating === 0) return;

    setSubmitting(true);
    try {
      const authData = localStorage.getItem('auth');
      const userId = authData ? JSON.parse(authData).user.id : 'anonymous';

      await userDataAPI.submitFeedback({
        user_id: userId,
        rating,
        comment,
        category: 'general',
        created_at: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Feedback submit failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg-alt py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/5 text-primary">
            <div className="animate-spin-slow">
              <LifeBuoy size={48} />
            </div>
          </div>
          <h1 className="text-4xl font-black text-app-text-main tracking-tight mb-4">{t.support.title}</h1>
          <p className="text-app-text-sub font-medium max-w-xl mx-auto leading-relaxed">{t.support.subtitle}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Help Center */}
          <div className="group rounded-3xl bg-app-bg border border-app-border shadow-2xl p-8 hover:border-primary/50 transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-primary">
              <BookText size={32} />
            </div>
            <h2 className="text-xl font-black text-app-text-main mb-3 tracking-tight">{t.support.helpCenter}</h2>
            <p className="text-app-text-sub text-sm font-medium leading-relaxed mb-6">
              {t.support.helpCenterDesc}
            </p>
            <a
              href="#faqs"
              className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest hover:gap-3 transition-all"
            >
              Browse Articles <ArrowUpRight size={16} />
            </a>
          </div>

          {/* Contact Info */}
          <div className="group rounded-3xl bg-app-bg border border-app-border shadow-2xl p-8 hover:border-primary/50 transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-primary">
              <MessageCircle size={32} />
            </div>
            <h2 className="text-xl font-black text-app-text-main mb-3 tracking-tight">{t.support.contactUs}</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-app-bg-alt rounded-lg flex items-center justify-center text-primary">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-app-text-muted">Email</p>
                  <a href="mailto:srishanthvattem190@gmail.com" className="text-sm font-bold text-app-text-main hover:text-primary transition-colors">srishanthvattem190@gmail.com</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-app-bg-alt rounded-lg flex items-center justify-center text-primary">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-app-text-muted">Phone</p>
                  <a href="tel:+919553693996" className="text-sm font-bold text-app-text-main hover:text-primary transition-colors">+91-95536-93996</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive FAQ Section */}
        <section id="faqs" className="bg-app-bg rounded-3xl border border-app-border shadow-2xl p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <HelpCircle size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-app-text-main tracking-tight">Frequently Asked Questions</h2>
              <p className="text-xs font-semibold text-app-text-muted mt-1">Quick answers to common questions about offline learning, AI features, and data usage.</p>
            </div>
          </div>

          <div className="divide-y divide-app-border/60">
            {faqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id} className="py-4 first:pt-2 last:pb-2">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between text-left gap-4 group"
                  >
                    <span className="font-bold text-app-text-main text-base group-hover:text-primary transition-colors">
                      {faq.question}
                    </span>
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center bg-app-bg-alt text-app-text-muted group-hover:text-primary transition-all duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <ChevronDown size={18} />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="mt-3 pr-8 text-sm font-medium text-app-text-sub leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Feedback System */}
        <section className="bg-app-bg rounded-3xl border border-app-border shadow-2xl p-8 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
              <Star size={24} />
            </div>
            <h2 className="text-2xl font-black text-app-text-main tracking-tight">Share Your Feedback</h2>
          </div>

          {submitted ? (
            <div className="text-center py-12 bg-secondary/10 rounded-2xl border border-secondary/20">
              <div className="w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={24} />
              </div>
              <h3 className="text-xl font-black text-secondary mb-2">Thank You!</h3>
              <p className="text-secondary font-medium">Your feedback helps us improve the learning experience.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-secondary font-black uppercase tracking-widest text-xs"
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-app-text-muted mb-4 text-center sm:text-left">
                  How would you rate your experience?
                </label>
                <div className="flex justify-center sm:justify-start gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        rating >= star ? 'bg-secondary text-white scale-110' : 'bg-app-bg-alt text-app-text-muted hover:bg-secondary/20'
                      }`}
                    >
                      <Star fill={rating >= star ? 'currentColor' : 'none'} size={24} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-app-text-muted mb-2">
                  Tell us more (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like? What can we improve?"
                  className="w-full bg-app-bg border border-app-border rounded-2xl p-4 text-app-text-main font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-30"
                />
              </div>

              <Button
                type="submit"
                disabled={rating === 0 || submitting}
                className="w-full sm:w-auto px-10 py-4 font-black uppercase tracking-widest text-[10px]"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          )}
        </section>

        {/* Footer Note */}
        <div className="text-center p-8 bg-primary/3 rounded-3xl border border-primary/10">
          <p className="text-sm font-bold text-app-text-sub">
            Available 24/7 for Enterprise users. Standard support hours: Mon-Fri, 9am-6pm IST.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;
