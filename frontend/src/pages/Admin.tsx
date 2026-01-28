import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Admin: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'users'>('content');
  
  // Lesson form state
  const [isEditing, setIsEditing] = useState<string | null>(null);
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
  const [isEditingUser, setIsEditingUser] = useState<string | null>(null);
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred fetching stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...lessonForm,
        topics: lessonForm.topics.split(',').map(t => t.trim()).filter(t => t)
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (lesson: any) => {
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

  const handleEditUserClick = (user: any) => {
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

  const handleToggleUserStatus = async (user: any) => {
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

  const handleResetPassword = async (userId: string) => {
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

  const handleDeleteLesson = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    
    setLoading(true);
    try {
      const res = await adminAPI.deleteLesson(id);
      if (res.success) {
        setSuccess('Lesson deleted');
        await fetchStats();
      }
    } catch (err: any) {
      setError('Failed to delete lesson');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) return <div className="p-8 text-center text-white">Loading Admin Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <Navbar />
      <main className="grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-indigo-400">Admin Command Center</h1>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-500 p-4 rounded mb-6">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('content')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'content' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Content Management
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            User Management
          </button>
        </div>

        {/* Content Management Form */}
        {activeTab === 'content' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl mb-12 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-semibold mb-4 text-indigo-300">
              {isEditing ? 'Edit Lesson' : 'Add New Learning Content'}
            </h2>
            <form onSubmit={handleLessonSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Title</label>
                <input 
                  type="text" 
                  value={lessonForm.title}
                  onChange={e => setLessonForm({...lessonForm, title: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-indigo-500 outline-none"
                  placeholder="e.g. Intro to Physics"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Category / Subject</label>
                <input 
                  type="text" 
                  value={lessonForm.category}
                  onChange={e => setLessonForm({...lessonForm, category: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-indigo-500 outline-none"
                  placeholder="e.g. Science"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-slate-400">Description</label>
                <textarea 
                  value={lessonForm.description}
                  onChange={e => setLessonForm({...lessonForm, description: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-indigo-500 outline-none h-20"
                  placeholder="Brief summary of the lesson..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Level</label>
                <select 
                  value={lessonForm.level}
                  onChange={e => setLessonForm({...lessonForm, level: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-indigo-500 outline-none"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Duration</label>
                <input 
                  type="text" 
                  value={lessonForm.duration}
                  onChange={e => setLessonForm({...lessonForm, duration: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-indigo-500 outline-none"
                  placeholder="e.g. 45 mins"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Topics (comma separated)</label>
                <input 
                  type="text" 
                  value={lessonForm.topics}
                  onChange={e => setLessonForm({...lessonForm, topics: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-indigo-500 outline-none"
                  placeholder="topic1, topic2..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">PDF Filename (in public/lessons/)</label>
                <input 
                  type="text" 
                  value={lessonForm.pdf_path}
                  onChange={e => setLessonForm({...lessonForm, pdf_path: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-indigo-500 outline-none"
                  placeholder="lesson.pdf"
                />
              </div>
              <div className="md:col-span-2 flex gap-4 mt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50"
                >
                  {isEditing ? 'Update Lesson' : 'Create Lesson'}
                </button>
                {isEditing && (
                  <button 
                    type="button"
                    onClick={() => { setIsEditing(null); setLessonForm({title: '', description: '', category: '', level: 'Beginner', duration: '', topics: '', pdf_path: ''}); }}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* User Management Form */}
        {activeTab === 'users' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl mb-12 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-semibold mb-4 text-emerald-300">
              {isEditingUser ? 'Edit User' : 'Add New User'}
            </h2>
            <form onSubmit={handleUserSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Username</label>
                <input 
                  type="text" 
                  value={userForm.username}
                  onChange={e => setUserForm({...userForm, username: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-indigo-500 outline-none"
                  placeholder="johndoe"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Email Address</label>
                <input 
                  type="email" 
                  value={userForm.email}
                  onChange={e => setUserForm({...userForm, email: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-indigo-500 outline-none"
                  placeholder="john@example.com"
                  required
                />
              </div>
              {!isEditingUser && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-slate-400">Password</label>
                  <input 
                    type="password" 
                    value={userForm.password}
                    onChange={e => setUserForm({...userForm, password: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-indigo-500 outline-none"
                    placeholder="Minimum 8 characters"
                    required={!isEditingUser}
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Role</label>
                <select 
                  value={userForm.role}
                  onChange={e => setUserForm({...userForm, role: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-indigo-500 outline-none"
                >
                  <option value="user">Student / User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Accessibility Mode</label>
                <select 
                  value={userForm.accessibility_mode}
                  onChange={e => setUserForm({...userForm, accessibility_mode: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-indigo-500 outline-none"
                >
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50"
                >
                  {isEditingUser ? 'Update User' : 'Create User'}
                </button>
                {isEditingUser && (
                  <button 
                    type="button"
                    onClick={() => { setIsEditingUser(null); setUserForm({username: '', email: '', password: '', role: 'user', accessibility_mode: 'regular', preferred_language: 'en'}); }}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
              <h3 className="text-slate-400 text-sm font-medium">Total Users</h3>
              <p className="text-4xl font-bold mt-2 text-indigo-400">{stats.total_users}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
              <h3 className="text-slate-400 text-sm font-medium">Courses</h3>
              <p className="text-4xl font-bold mt-2 text-emerald-400">{stats.total_lessons}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
              <h3 className="text-slate-400 text-sm font-medium">AI Chats</h3>
              <p className="text-4xl font-bold mt-2 text-amber-400">{stats.total_chats}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
              <h3 className="text-slate-400 text-sm font-medium">Assignments</h3>
              <p className="text-4xl font-bold mt-2 text-rose-400">{stats.total_assignments}</p>
            </div>
          </div>
        )}

        {/* Existing Content List */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl mb-12">
          <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Existing Lessons</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left p-4 text-slate-400 text-sm">Lesson</th>
                  <th className="text-left p-4 text-slate-400 text-sm">Category</th>
                  <th className="text-left p-4 text-slate-400 text-sm">Level</th>
                  <th className="text-left p-4 text-slate-400 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {stats?.lesson_list?.map((lesson: any) => (
                  <tr key={lesson.id} className="hover:bg-slate-700/30 transition-colors text-sm">
                    <td className="p-4 font-semibold text-slate-200">{lesson.title}</td>
                    <td className="p-4 text-indigo-400">{lesson.category}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-700 rounded text-[10px] uppercase font-bold text-slate-400">
                        {lesson.level}
                      </span>
                    </td>
                    <td className="p-4 flex gap-3">
                      <button 
                        onClick={() => handleEditClick(lesson)}
                        className="text-indigo-400 hover:text-indigo-300 font-bold"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="text-rose-500 hover:text-rose-400 font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User List & Progress */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
              <h2 className="text-xl font-semibold">User management & Progress</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-sm">User</th>
                    <th className="text-left p-4 text-slate-400 text-sm">Role</th>
                    <th className="text-left p-4 text-slate-400 text-sm">Accessibility</th>
                    <th className="text-left p-4 text-slate-400 text-sm">Status</th>
                    <th className="text-left p-4 text-slate-400 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {stats?.user_list?.map((user: any) => {
                    const progress = stats.all_progress?.find((p: any) => p.user_id === user.id);
                    const isActive = user.is_active !== false;
                    return (
                      <tr key={user.id} className="hover:bg-slate-700/30 transition-colors text-sm">
                        <td className="p-4">
                          <div className="font-bold">{user.username}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{user.accessibility_mode}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => handleEditUserClick(user)}
                              className="text-indigo-400 hover:text-indigo-300 font-bold"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleResetPassword(user.id)}
                              className="text-amber-500 hover:text-amber-400 font-bold"
                            >
                              Reset Pass
                            </button>
                            <button 
                              onClick={() => handleToggleUserStatus(user)}
                              className={`${isActive ? 'text-rose-500 hover:text-rose-400' : 'text-emerald-500 hover:text-emerald-400'} font-bold`}
                            >
                              {isActive ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-8">
            {/* Feedback */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <h2 className="text-xl font-semibold">User Feedback & Issues</h2>
              </div>
              <div className="p-4">
                {!stats?.recent_feedback || stats.recent_feedback.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No feedback submitted yet.</p>
                ) : (
                  <div className="space-y-4 max-h-100 overflow-y-auto">
                    {stats.recent_feedback.map((f: any) => (
                      <div key={f.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${f.type === 'issue' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {f.type || 'Feedback'}
                          </span>
                          <span className="text-[10px] text-slate-500">{new Date(f.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-200 text-sm">"{f.comment}"</p>
                        <div className="mt-2 text-xs text-yellow-500 font-bold">Rating: {f.rating}/5</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <h2 className="text-xl font-semibold">Latest Notifications Sent</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {!stats?.all_notifications || stats.all_notifications.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No recent notifications.</p>
                  ) : (
                    stats.all_notifications.map((n: any) => (
                      <div key={n.id} className="flex gap-3 text-sm">
                        <div className="w-1 h-8 bg-indigo-500 rounded-full shrink-0"></div>
                        <div>
                          <p className="font-bold">{n.title}</p>
                          <p className="text-slate-400 text-xs">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
