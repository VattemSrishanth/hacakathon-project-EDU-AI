import React, { useEffect, useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminAPI, syllabusAPI } from '../services/api';















const Admin = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const [activeSyllabus, setActiveSyllabus] = useState({ board: 'NCERT', classes: {} });

  // Syllabus form state
  const [syllabusForm, setSyllabusForm] = useState({
    board: 'NCERT',
    class: '',
    subject: '',
    topic: '',
    description: '',
    pdf_base64: ''
  });

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const res = await syllabusAPI.getBoard(syllabusForm.board);
        if (res.success && res.syllabus) {
          setActiveSyllabus(res.syllabus);
        } else {
          setActiveSyllabus({ board: syllabusForm.board, classes: {} });
          setError(res.message || 'Failed to load syllabus');
        }
      } catch (err) {
        setActiveSyllabus({ board: syllabusForm.board, classes: {} });
        setError('Failed to load syllabus');
      }
    };
    fetchSyllabus();
  }, [syllabusForm.board]);

  const availableClasses = useMemo(() => Object.keys(activeSyllabus.classes), [activeSyllabus]);
  const availableSubjects = useMemo(() => {
    if (!syllabusForm.class) return [];
    return Object.keys(activeSyllabus.classes[syllabusForm.class]?.subjects || {});
  }, [syllabusForm.class, activeSyllabus]);

  const availableTopics = useMemo(() => {
    if (!syllabusForm.class || !syllabusForm.subject) return [];
    const subjects = activeSyllabus.classes[syllabusForm.class]?.subjects?.[syllabusForm.subject] || [];
    return subjects.flatMap((s) => s.topics || []);
  }, [syllabusForm.class, syllabusForm.subject, activeSyllabus]);

  // Fetch existing content when topic selection changes
  useEffect(() => {
    const fetchExisting = async () => {
      if (syllabusForm.board && syllabusForm.class && syllabusForm.subject && syllabusForm.topic) {
        try {
          const res = await syllabusAPI.getContent(
            syllabusForm.board,
            syllabusForm.class,
            syllabusForm.subject,
            syllabusForm.topic
          );
          if (res.success && res.content) {
            setSyllabusForm((prev) => ({
              ...prev,
              description: res.content.description || '',
              pdf_base64: res.content.pdf_data_url || ''
            }));
            setSuccess('Loaded existing content for this topic.');
          } else {
            // Reset description/pdf if no content found
            setSyllabusForm((prev) => ({
              ...prev,
              description: '',
              pdf_base64: ''
            }));
          }
        } catch (err) {
          console.error('Failed to fetch existing syllabus content', err);
        }
      }
    };
    fetchExisting();
  }, [syllabusForm.board, syllabusForm.class, syllabusForm.subject, syllabusForm.topic]);

  // Lesson form state
  const [isEditing, setIsEditing] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    duration: '',
    topics: '',
    pdf_path: ''
  });

  // User form state
  const [isEditingUser, setIsEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    accessibility_mode: 'regular',
    preferred_language: 'en'
  });

  const fetchStats = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const adminId = auth.user?.id;

      if (!adminId) {
        setError('Admin ID not found. Please login.');
        setLoading(false);
        return;
      }

      const data = await adminAPI.getStats(adminId);
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to fetch admin stats');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred fetching stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...lessonForm,
        topics: lessonForm.topics.split(',').map((t) => t.trim()).filter((t) => t)
      };

      let res;
      if (isEditing) {
        res = await adminAPI.updateLesson(isEditing, payload);
      } else {
        res = await adminAPI.createLesson(payload);
      }

      if (res.success) {
        setSuccess(isEditing ? 'Lesson updated!' : 'Lesson created!');
        setIsEditing(null);
        setLessonForm({ title: '', description: '', category: '', level: 'Beginner', duration: '', topics: '', pdf_path: '' });
        await fetchStats();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let res;
      if (isEditingUser) {
        // Don't send password in update
        const { password, ...updateData } = userForm;
        res = await adminAPI.updateUser(isEditingUser, updateData);
      } else {
        res = await adminAPI.createUser(userForm);
      }

      if (res.success) {
        setSuccess(isEditingUser ? 'User updated!' : 'User created!');
        setIsEditingUser(null);
        setUserForm({ username: '', email: '', password: '', role: 'user', accessibility_mode: 'regular', preferred_language: 'en' });
        await fetchStats();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (lesson) => {
    setIsEditing(lesson.id);
    setActiveTab('content');
    setLessonForm({
      title: lesson.title || '',
      description: lesson.description || '',
      category: lesson.category || '',
      level: lesson.level || 'Beginner',
      duration: lesson.duration || '',
      topics: (lesson.topics || []).join(', '),
      pdf_path: lesson.pdf_path || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSyllabusPdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 12 * 1024 * 1024) {
        setError('PDF file too large. Please use a file smaller than 12MB.');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSyllabusForm({ ...syllabusForm, pdf_base64: event.target?.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteSyllabusContent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this custom topic content?')) return;
    setLoading(true);
    try {
      await adminAPI.deleteSyllabusContent(id);
      setSuccess('Topic content deleted successfully');
      await fetchStats();
    } catch (err) {
      setError('Failed to delete content');
    } finally {
      setLoading(false);
    }
  };

  const handleSyllabusSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        board: syllabusForm.board,
        class_level: syllabusForm.class,
        subject: syllabusForm.subject,
        topic: syllabusForm.topic,
        description: syllabusForm.description,
        pdf_data_url: syllabusForm.pdf_base64
      };

      const res = await adminAPI.saveSyllabusContent(payload);
      if (res.success) {
        setSuccess('Syllabus content saved successfully!');
        setSyllabusForm({ ...syllabusForm, description: '', pdf_base64: '' });
        await fetchStats(); // Refresh stats to show new content
      } else {
        setError(res.error || 'Failed to save syllabus content');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save syllabus content');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUserClick = (user) => {
    setIsEditingUser(user.id);
    setActiveTab('users');
    setUserForm({
      username: user.username || '',
      email: user.email || '',
      password: '', // Hidden in edit
      role: user.role || 'user',
      accessibility_mode: user.accessibility_mode || 'regular',
      preferred_language: user.preferred_language || 'en'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleUserStatus = async (user) => {
    setLoading(true);
    try {
      const newStatus = !(user.is_active !== false); // Handle undefined as true
      await adminAPI.updateUser(user.id, { is_active: newStatus });
      setSuccess(`User ${newStatus ? 'enabled' : 'disabled'}`);
      await fetchStats();
    } catch (err) {
      setError('Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPass = window.prompt('Enter new password for this user:');
    if (!newPass || newPass.length < 8) {
      if (newPass) alert('Password too short (min 8 chars)');
      return;
    }

    setLoading(true);
    try {
      await adminAPI.resetUserPassword(userId, newPass);
      setSuccess('Password reset successfully');
    } catch (err) {
      setError('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;

    setLoading(true);
    try {
      const res = await adminAPI.deleteLesson(id);
      if (res.success) {
        setSuccess('Lesson deleted');
        await fetchStats();
      }
    } catch (err) {
      setError('Failed to delete lesson');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) return <div className="p-8 text-center text-white">Loading Admin Dashboard...</div>;

  return (
    <div className="min-h-screen bg-app-bg text-app-text-main flex flex-col">
      <main className="grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Admin Command Center</h1>
          <button
            onClick={() => fetchStats()}
            className="flex items-center gap-2 px-4 py-2 bg-app-bg hover:bg-app-border rounded-lg text-sm font-bold border border-app-border transition-colors text-app-text-main">
            
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        </div>
        
        {error &&
        <div className="bg-error/20 border border-error text-error p-4 rounded mb-6">
            {error}
          </div>
        }
        {success &&
        <div className="bg-secondary/20 border border-secondary text-secondary p-4 rounded mb-6">
            {success}
          </div>
        }

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'content' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-app-bg-alt text-app-text-muted hover:bg-gray-200'}`}>
            
            Content Management
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-app-bg-alt text-app-text-muted hover:bg-gray-200'}`}>
            
            User Management
          </button>
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'syllabus' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-app-bg-alt text-app-text-muted hover:bg-gray-200'}`}>
            
            Syllabus Topic Content
          </button>
        </div>

        {/* Content Management Form */}
        {activeTab === 'content' &&
        <div className="bg-app-bg-alt p-6 rounded-xl border border-app-border shadow-xl mb-12 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              {isEditing ? 'Edit Lesson' : 'Add New Learning Content'}
            </h2>
            <form onSubmit={handleLessonSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-app-text-muted">Title</label>
                <input
                type="text"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                className="w-full bg-white border border-app-border rounded p-2 text-sm focus:border-primary outline-none"
                placeholder="e.g. Intro to Physics"
                required />
              
              </div>
              <div className="space-y-2">
                <label className="text-sm text-app-text-muted">Category / Subject</label>
                <input
                type="text"
                value={lessonForm.category}
                onChange={(e) => setLessonForm({ ...lessonForm, category: e.target.value })}
                className="w-full bg-white border border-app-border rounded p-2 text-sm focus:border-primary outline-none"
                placeholder="e.g. Science"
                required />
              
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-app-text-muted">Description</label>
                <textarea
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                className="w-full bg-white border border-app-border rounded p-2 text-sm focus:border-primary outline-none h-20"
                placeholder="Brief summary of the lesson..." />
              
              </div>
              <div className="space-y-2">
                <label className="text-sm text-app-text-muted">Level</label>
                <select
                value={lessonForm.level}
                onChange={(e) => setLessonForm({ ...lessonForm, level: e.target.value })}
                className="w-full bg-white border border-app-border rounded p-2 text-sm focus:border-primary outline-none">
                
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-app-text-muted">Duration</label>
                <input
                type="text"
                value={lessonForm.duration}
                onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                className="w-full bg-white border border-app-border rounded p-2 text-sm focus:border-primary outline-none"
                placeholder="e.g. 45 mins" />
              
              </div>
              <div className="space-y-2">
                <label className="text-sm text-app-text-muted">Topics (comma separated)</label>
                <input
                type="text"
                value={lessonForm.topics}
                onChange={(e) => setLessonForm({ ...lessonForm, topics: e.target.value })}
                className="w-full bg-white border border-app-border rounded p-2 text-sm focus:border-primary outline-none"
                placeholder="topic1, topic2..." />
              
              </div>
              <div className="space-y-2">
                <label className="text-sm text-app-text-muted">PDF Filename (in public/lessons/)</label>
                <input
                type="text"
                value={lessonForm.pdf_path}
                onChange={(e) => setLessonForm({ ...lessonForm, pdf_path: e.target.value })}
                className="w-full bg-white border border-app-border rounded p-2 text-sm focus:border-primary outline-none"
                placeholder="lesson.pdf" />
              
              </div>
              <div className="md:col-span-2 flex gap-4 mt-2">
                <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50">
                
                  {isEditing ? 'Update Lesson' : 'Create Lesson'}
                </button>
                {isEditing &&
              <button
                type="button"
                onClick={() => {setIsEditing(null);setLessonForm({ title: '', description: '', category: '', level: 'Beginner', duration: '', topics: '', pdf_path: '' });}}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition-colors">
                
                    Cancel
                  </button>
              }
              </div>
            </form>
          </div>
        }

        {/* User Management Form */}
        {activeTab === 'users' &&
        <div className="bg-app-bg-alt p-6 rounded-xl border border-app-border shadow-xl mb-12 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-semibold mb-4 text-secondary">
              {isEditingUser ? 'Edit User' : 'Add New User'}
            </h2>
            <form onSubmit={handleUserSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-app-text-muted">Username</label>
                <input
                type="text"
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                className="w-full bg-white border border-app-border rounded p-2 text-sm focus:border-primary outline-none"
                placeholder="johndoe"
                required />
              
              </div>
              <div className="space-y-2">
                <label className="text-sm text-app-text-muted">Email Address</label>
                <input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="w-full bg-white border border-app-border rounded p-2 text-sm focus:border-primary outline-none"
                placeholder="john@example.com"
                required />
              
              </div>
              {!isEditingUser &&
            <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-app-text-muted">Password</label>
                  <input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="w-full bg-white border border-app-border rounded p-2 text-sm focus:border-primary outline-none"
                placeholder="Minimum 8 characters"
                required={!isEditingUser} />
              
                </div>
            }
              <div className="space-y-2">
                <label className="text-sm text-app-text-muted">Role</label>
                <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full bg-white border border-app-border rounded p-2 text-sm focus:border-primary outline-none">
                
                  <option value="user">Student / User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-app-text-muted">Accessibility Mode</label>
                <select
                value={userForm.accessibility_mode}
                onChange={(e) => setUserForm({ ...userForm, accessibility_mode: e.target.value })}
                className="w-full bg-white border border-app-border rounded p-2 text-sm focus:border-primary outline-none">
                
                  <option value="regular">Regular</option>
                  <option value="deaf">Deaf / Hard of Hearing</option>
                  <option value="speech">Speech Related</option>
                  <option value="blind">Screen Reader User</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-4 mt-2">
                <button
                type="submit"
                disabled={loading}
                className="bg-secondary hover:bg-secondary/90 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50">
                
                  {isEditingUser ? 'Update User' : 'Create User'}
                </button>
                {isEditingUser &&
              <button
                type="button"
                onClick={() => {setIsEditingUser(null);setUserForm({ username: '', email: '', password: '', role: 'user', accessibility_mode: 'regular', preferred_language: 'en' });}}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition-colors">
                
                    Cancel
                  </button>
              }
              </div>
            </form>
          </div>
        }

        {/* Syllabus Topic Management Form */}
        {activeTab === 'syllabus' &&
        <div className="bg-app-bg-alt p-6 rounded-xl border border-app-border shadow-xl mb-12 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              Manage Syllabus Topic Content
            </h2>
            <p className="text-app-text-muted text-sm mb-6 italic">
              Use this section to add custom descriptions and PDF files to existing syllabus topics. 
              This content will be shown to users instead of AI-generated content.
            </p>
            <form onSubmit={handleSyllabusSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-app-text-muted">Education Board</label>
                <select
                value={syllabusForm.board}
                onChange={(e) => setSyllabusForm({ ...syllabusForm, board: e.target.value, class: '', subject: '', topic: '' })}
                className="w-full bg-white border border-app-border rounded p-2 text-sm focus:border-primary outline-none"
                required>
                
                  <option value="NCERT">NCERT (National)</option>
                  <option value="Telangana">Telangana State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh State</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-app-text-muted">Class / Grade</label>
                <select
                value={syllabusForm.class}
                onChange={(e) => setSyllabusForm({ ...syllabusForm, class: e.target.value, subject: '', topic: '' })}
                className="w-full bg-white border border-app-border rounded p-2 text-sm focus:border-primary outline-none"
                required>
                
                  <option value="">Select Class</option>
                  {availableClasses.map((c) =>
                <option key={c} value={c}>{c}</option>
                )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-app-text-muted">Subject</label>
                <select
                value={syllabusForm.subject}
                onChange={(e) => setSyllabusForm({ ...syllabusForm, subject: e.target.value, topic: '' })}
                className="w-full bg-white border border-app-border rounded p-2 text-sm focus:border-primary outline-none"
                required
                disabled={!syllabusForm.class}>
                
                  <option value="">Select Subject</option>
                  {availableSubjects.map((s) =>
                <option key={s} value={s}>{s}</option>
                )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-app-text-muted">Topic</label>
                <select
                value={syllabusForm.topic}
                onChange={(e) => setSyllabusForm({ ...syllabusForm, topic: e.target.value })}
                className="w-full bg-white border border-app-border rounded p-2 text-sm focus:border-primary outline-none"
                required
                disabled={!syllabusForm.subject}>
                
                  <option value="">Select Topic</option>
                  {availableTopics.map((t) =>
                <option key={t} value={t}>{t}</option>
                )}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-app-text-muted">Description / Topic Content</label>
                <textarea
                value={syllabusForm.description}
                onChange={(e) => setSyllabusForm({ ...syllabusForm, description: e.target.value })}
                className="w-full bg-white border border-app-border rounded p-2 text-sm focus:border-primary outline-none h-48"
                placeholder="Paste the topic content here. Markdown is supported." />
              
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-app-text-muted">Upload PDF for Topic (Optional)</label>
                <div className="flex flex-col gap-2">
                  <input
                  type="file"
                  id="syllabusPdfInput"
                  accept="application/pdf"
                  onChange={handleSyllabusPdfUpload}
                  className="w-full bg-white border border-app-border rounded p-2 text-sm text-app-text-muted file:bg-primary file:text-white file:border-none file:px-4 file:py-1 file:rounded file:mr-4 file:cursor-pointer" />
                
                  {syllabusForm.pdf_base64 &&
                <div className="flex items-center gap-4">
                      <p className="text-xs text-secondary font-medium">✓ PDF Attached</p>
                      <button
                    type="button"
                    onClick={() => {
                      setSyllabusForm({ ...syllabusForm, pdf_base64: '' });
                      const fileInput = document.getElementById('syllabusPdfInput');
                      if (fileInput) fileInput.value = '';
                    }}
                    className="text-xs text-error hover:text-red-300 font-bold underline px-2 py-1 bg-error/10 rounded">
                    
                        Remove PDF
                      </button>
                    </div>
                }
                </div>
              </div>
              <div className="md:col-span-2 flex gap-4 mt-2">
                <button
                type="submit"
                disabled={loading || !syllabusForm.topic}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50">
                
                  Save Topic Content
                </button>
                <button
                type="button"
                onClick={() => setSyllabusForm({ board: 'NCERT', class: '', subject: '', topic: '', description: '', pdf_base64: '' })}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition-colors">
                
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        }

        {stats &&
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
            <div className="bg-app-bg-alt p-6 rounded-xl border border-app-border shadow-lg">
              <h3 className="text-app-text-muted text-sm font-medium">Total Users</h3>
              <p className="text-4xl font-bold mt-2 text-primary">{stats.total_users}</p>
            </div>
            <div className="bg-app-bg-alt p-6 rounded-xl border border-app-border shadow-lg">
              <h3 className="text-app-text-muted text-sm font-medium">Courses</h3>
              <p className="text-4xl font-bold mt-2 text-secondary">{stats.total_lessons}</p>
            </div>
            <div className="bg-app-bg-alt p-6 rounded-xl border border-app-border shadow-lg">
              <h3 className="text-app-text-muted text-sm font-medium">Syllabus Topics</h3>
              <p className="text-4xl font-bold mt-2 text-primary">{stats.total_syllabi || 0}</p>
            </div>
            <div className="bg-app-bg-alt p-6 rounded-xl border border-app-border shadow-lg">
              <h3 className="text-app-text-muted text-sm font-medium">AI Chats</h3>
              <p className="text-4xl font-bold mt-2 text-secondary">{stats.total_chats}</p>
            </div>
            <div className="bg-app-bg-alt p-6 rounded-xl border border-app-border shadow-lg">
              <h3 className="text-app-text-muted text-sm font-medium">Assignments</h3>
              <p className="text-4xl font-bold mt-2 text-error">{stats.total_assignments}</p>
            </div>
          </div>
        }

        {/* Existing Content List */}
        <div className="bg-app-bg-alt rounded-xl border border-app-border overflow-hidden shadow-xl mb-12">
          <div className="p-4 border-b border-app-border bg-gray-50 flex justify-between items-center text-gray-900">
            <h2 className="text-xl font-semibold">Manage Existing Lessons</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 text-app-text-muted text-sm">Lesson</th>
                  <th className="text-left p-4 text-app-text-muted text-sm">Category</th>
                  <th className="text-left p-4 text-app-text-muted text-sm">Level</th>
                  <th className="text-left p-4 text-app-text-muted text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {stats?.lesson_list?.map((lesson) =>
                <tr key={lesson.id} className="hover:bg-gray-50 transition-colors text-sm">
                    <td className="p-4 font-semibold text-gray-900">{lesson.title}</td>
                    <td className="p-4 text-primary">{lesson.category}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-gray-200 rounded text-[10px] uppercase font-bold text-app-text-muted">
                        {lesson.level}
                      </span>
                    </td>
                    <td className="p-4 flex gap-3">
                      <button
                      onClick={() => handleEditClick(lesson)}
                      className="text-primary hover:text-primary/80 font-bold">
                      
                        Edit
                      </button>
                      <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="text-error hover:text-red-700 font-bold">
                      
                        Delete
                      </button>
                    </td>
                  </tr>
                )}
                {stats?.syllabus_list?.map((item) =>
                <tr key={item.id} className="hover:bg-gray-50 transition-colors text-sm border-l-4 border-primary">
                    <td className="p-4 font-semibold text-gray-900">
                      <div className="flex flex-col">
                        <span>{item.topic}</span>
                        <span className="text-[10px] text-app-text-muted uppercase tracking-tighter">Syllabus Topic: {item.board} - Class {item.class_level}</span>
                      </div>
                    </td>
                    <td className="p-4 text-primary italic">{item.subject}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-0.5 bg-primary/10 rounded text-[10px] uppercase font-bold text-primary border border-primary/30 w-fit">
                          Custom Content
                        </span>
                        {item.updated_by &&
                      <span className="text-[10px] text-app-text-muted font-medium">
                            By: <span className="text-gray-900">{item.updated_by}</span>
                          </span>
                      }
                      </div>
                    </td>
                    <td className="p-4 flex gap-3">
                       <button
                      onClick={() => {
                        setActiveTab('syllabus');
                        setSyllabusForm({
                          board: item.board,
                          class: item.class_level,
                          subject: item.subject,
                          topic: item.topic,
                          description: item.description,
                          pdf_base64: item.pdf_data_url || item.pdf_base64 // Handle both naming conventions
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-primary hover:text-primary/80 font-bold">
                      
                        Edit
                      </button>
                      <button
                      onClick={() => handleDeleteSyllabusContent(item.id)}
                      className="text-error hover:text-red-700 font-bold">
                      
                        Delete
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User List & Progress */}
          <div className="bg-app-bg-alt rounded-xl border border-app-border overflow-hidden shadow-xl">
            <div className="p-4 border-b border-app-border bg-gray-50 flex justify-between items-center text-gray-900">
              <h2 className="text-xl font-semibold">User management & Progress</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-4 text-app-text-muted text-sm">User</th>
                    <th className="text-left p-4 text-app-text-muted text-sm">Role</th>
                    <th className="text-left p-4 text-app-text-muted text-sm">Accessibility</th>
                    <th className="text-left p-4 text-app-text-muted text-sm">Status</th>
                    <th className="text-left p-4 text-app-text-muted text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {stats?.user_list?.map((user) => {
                    const isActive = user.is_active !== false;
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors text-sm">
                        <td className="p-4">
                          <div className="font-bold text-gray-900">{user.username}</div>
                          <div className="text-xs text-app-text-muted">{user.email}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-app-text-muted">{user.accessibility_mode}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isActive ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'}`}>
                            {isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleEditUserClick(user)}
                              className="text-primary hover:text-primary/80 font-bold">
                              
                              Edit
                            </button>
                            <button
                              onClick={() => handleResetPassword(user.id)}
                              className="text-secondary hover:text-yellow-600 font-bold">
                              
                              Reset Pass
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user)}
                              className={`${isActive ? 'text-error hover:text-red-700' : 'text-secondary hover:text-yellow-600'} font-bold`}>
                              
                              {isActive ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </td>
                      </tr>);

                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-8">
            {/* Feedback */}
            <div className="bg-app-bg-alt rounded-xl border border-app-border overflow-hidden shadow-xl">
              <div className="p-4 border-b border-app-border bg-gray-50 text-gray-900">
                <h2 className="text-xl font-semibold">User Feedback & Issues</h2>
              </div>
              <div className="p-4">
                {!stats?.recent_feedback || stats.recent_feedback.length === 0 ?
                <p className="text-app-text-muted text-center py-8">No feedback submitted yet.</p> :

                <div className="space-y-4 max-h-100 overflow-y-auto">
                    {stats.recent_feedback.map((f) =>
                  <div key={f.id} className="bg-white p-4 rounded-lg border border-app-border">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${f.type === 'issue' ? 'bg-error/20 text-error' : 'bg-primary/20 text-primary'}`}>
                            {f.type || 'Feedback'}
                          </span>
                          <span className="text-[10px] text-app-text-muted">{new Date(f.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-900 text-sm">"{f.comment}"</p>
                        <div className="mt-2 text-xs text-secondary font-bold">Rating: {f.rating}/5</div>
                      </div>
                  )}
                  </div>
                }
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-app-bg-alt rounded-xl border border-app-border overflow-hidden shadow-xl">
              <div className="p-4 border-b border-app-border bg-gray-50 text-gray-900">
                <h2 className="text-xl font-semibold">Latest Notifications Sent</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {!stats?.all_notifications || stats.all_notifications.length === 0 ?
                  <p className="text-app-text-muted text-center py-4">No recent notifications.</p> :

                  stats.all_notifications.map((n) =>
                  <div key={n.id} className="flex gap-3 text-sm">
                        <div className="w-1 h-8 bg-primary rounded-full shrink-0"></div>
                        <div>
                          <p className="font-bold text-gray-900">{n.title}</p>
                          <p className="text-app-text-muted text-xs">{n.message}</p>
                        </div>
                      </div>
                  )
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>);

};

export default Admin;