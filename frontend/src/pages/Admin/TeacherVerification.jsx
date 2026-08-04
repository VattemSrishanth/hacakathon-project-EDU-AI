import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  FileText,
  Video,
  Award,
  BookOpen,
  Mail,
  User,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

const TeacherVerification = ({ initialVerifications = [], onRefreshStats }) => {
  const [verifications, setVerifications] = useState(initialVerifications);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Review context state
  const [activeVerification, setActiveVerification] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  const fetchVerifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getTeacherVerifications();
      if (res.success) {
        setVerifications(res.verifications);
        // Sync active verification if exists
        if (activeVerification) {
          const updated = res.verifications.find(v => v._id === activeVerification._id);
          setActiveVerification(updated || null);
        }
      }
    } catch (err) {
      setError('Failed to fetch verification list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialVerifications.length === 0) {
      fetchVerifications();
    }
  }, []);

  const handleAction = async (action) => {
    if (!activeVerification) return;
    if (action === 'reject' && !feedbackText) {
      alert('Please provide feedback explain the rejection reason.');
      return;
    }
    if (action === 'request_more' && !feedbackText) {
      alert('Please specify the documents/details requested.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await adminAPI.verifyTeacher(activeVerification._id, action, feedbackText);
      if (res.success) {
        setSuccess(`Verification status set to: ${res.verification.status}`);
        setFeedbackText('');
        await fetchVerifications();
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update verification status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-app-text-main">Teacher Verification</h1>
        <p className="text-app-text-sub mt-1 text-sm">Review credentials, experience, certificates, intro videos, and verify educator accounts.</p>
      </div>

      {error && <div className="bg-error/10 border border-error text-error p-3.5 rounded-lg text-sm font-semibold">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-500 text-emerald-700 p-3.5 rounded-lg text-sm font-semibold">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Applicants List */}
        <div className="bg-app-bg-alt border border-app-border rounded-xl shadow-sm flex flex-col overflow-hidden h-[600px]">
          <div className="p-4 border-b border-app-border bg-gray-50 text-app-text-main font-bold text-sm">
            Educator Applications
          </div>
          <div className="overflow-y-auto divide-y divide-app-border flex-1">
            {loading && verifications.length === 0 ? (
              <div className="p-8 text-center text-app-text-muted text-sm">Loading applications...</div>
            ) : verifications.length === 0 ? (
              <div className="p-8 text-center text-app-text-muted text-sm italic">No educator profiles registered yet.</div>
            ) : (
              verifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => { setActiveVerification(item); setFeedbackText(''); }}
                  className={`p-4 cursor-pointer transition-colors flex justify-between items-start ${
                    activeVerification?._id === item._id ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-gray-50'
                  }`}>
                  <div>
                    <h4 className="font-bold text-app-text-main text-sm">{item.userId?.name || 'Applicant'}</h4>
                    <p className="text-xs text-app-text-muted">{item.userId?.email || 'N/A'}</p>
                    <span className="text-[10px] text-app-text-sub font-semibold mt-1 inline-block">Experience: {item.experience} yrs</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    item.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                    item.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                    item.status === 'more_documents_requested' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.status === 'more_documents_requested' ? 'Docs Reqd' : item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Verification Details Review */}
        <div className="bg-app-bg-alt border border-app-border rounded-xl shadow-sm lg:col-span-2 overflow-hidden flex flex-col h-[600px]">
          {activeVerification ? (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Header profile */}
              <div className="p-5 border-b border-app-border bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={activeVerification.profilePhoto || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                    alt="Profile"
                    className="w-14 h-14 rounded-full object-cover border border-app-border bg-white shadow-sm"
                  />
                  <div>
                    <h3 className="text-base font-bold text-app-text-main">{activeVerification.userId?.name}</h3>
                    <p className="text-xs text-app-text-muted">{activeVerification.userId?.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-app-text-muted block font-semibold">APPLICATION STATUS</span>
                  <span className="text-xs font-extrabold capitalize text-primary">{activeVerification.status.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {/* Document details container */}
              <div className="p-6 space-y-6 flex-1">
                {/* 2-column info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-app-text-sub uppercase tracking-wider">Credentials</h4>
                    <div className="space-y-2 text-sm text-app-text-main font-semibold">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-primary" />
                        <span>Subjects: {activeVerification.subjects.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-secondary" />
                        <span>Languages: {activeVerification.languages.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-emerald-600" />
                        <span>Experience: {activeVerification.experience} Years</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-indigo-600" />
                        <span>Levels: {activeVerification.teachingLevels.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-app-text-sub uppercase tracking-wider">Government ID</h4>
                    <a
                      href={activeVerification.governmentId}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-app-border p-2 rounded-lg block hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2 text-sm text-primary font-bold">
                        <FileText size={16} />
                        <span>View Government ID</span>
                      </div>
                      <p className="text-[10px] text-app-text-muted mt-0.5">Click to verify identity certificate details.</p>
                    </a>
                  </div>
                </div>

                <hr className="border-app-border" />

                {/* Resume and Video Intro */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-app-text-sub uppercase tracking-wider mb-2">Resume / Curriculum Vitae</h4>
                    <a
                      href={activeVerification.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 border border-app-border hover:bg-gray-50 rounded-lg text-sm text-primary font-bold transition-colors">
                      <FileText size={20} className="text-primary" />
                      <div>
                        <span>View Resume Summary</span>
                        <p className="text-[10px] text-app-text-muted font-normal mt-0.5">Curriculum Vitae containing academic background.</p>
                      </div>
                    </a>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-app-text-sub uppercase tracking-wider mb-2">Introduction Video</h4>
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-app-border bg-black">
                      {activeVerification.videoIntroUrl.includes('embed') ? (
                        <iframe
                          src={activeVerification.videoIntroUrl}
                          className="w-full h-full"
                          title="Introduction Video"
                          allowFullScreen
                        />
                      ) : (
                        <a
                          href={activeVerification.videoIntroUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-full flex flex-col items-center justify-center text-white hover:text-primary transition-colors gap-2">
                          <Video size={32} />
                          <span className="text-xs font-bold">Watch Intro Video</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="border-app-border" />

                {/* Decision form */}
                {activeVerification.status === 'pending' && (
                  <div className="space-y-4 bg-gray-50 p-4 border border-app-border rounded-xl">
                    <h4 className="text-xs font-bold text-app-text-sub uppercase tracking-wider">Verification Moderation Action</h4>
                    <textarea
                      placeholder="Add reviewer notes/feedback. Required for rejecting or requesting more documents..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full bg-white border border-app-border rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none min-h-[80px]"
                    />
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => handleAction('approve')}
                        disabled={loading}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors">
                        <CheckCircle size={14} /> Approve Verified
                      </button>
                      <button
                        onClick={() => handleAction('reject')}
                        disabled={loading}
                        className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors">
                        <XCircle size={14} /> Reject Application
                      </button>
                      <button
                        onClick={() => handleAction('request_more')}
                        disabled={loading}
                        className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors">
                        <HelpCircle size={14} /> Request Documents
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-app-text-muted gap-2">
              <BookOpen size={48} className="opacity-40 text-primary" />
              <p className="text-sm font-bold">Select a teacher application from the left panel to review details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherVerification;
