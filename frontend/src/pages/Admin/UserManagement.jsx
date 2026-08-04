import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Users,
  UserPlus,
  Eye,
  Trash2,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Selection state for bulk actions
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  
  // Modal states
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [addingUser, setAddingUser] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student',
    accessibility_mode: 'regular'
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search,
        role,
        status,
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder
      };
      const res = await adminAPI.getUsersList(params);
      if (res.success) {
        setUsers(res.users);
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, role, status, pagination.page, sortBy, sortOrder]);

  const handleSelectUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(users.map((u) => u._id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUserIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to ${action} selected users?`)) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await adminAPI.performUserBulkAction(selectedUserIds, action);
      if (res.success) {
        setSuccess(`Successfully executed ${action} action on selected users.`);
        setSelectedUserIds([]);
        await fetchUsers();
      }
    } catch (err) {
      setError('Bulk action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPass = window.prompt('Enter new password for this user (min 8 chars):');
    if (!newPass) return;
    if (newPass.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await adminAPI.resetUserPassword(userId, newPass);
      if (res.success) {
        setSuccess('Password reset successfully');
      }
    } catch (err) {
      setError('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await adminAPI.updateUser(editingUser._id, userForm);
      if (res.success) {
        setSuccess('User updated successfully');
        setEditingUser(null);
        await fetchUsers();
      }
    } catch (err) {
      setError('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await adminAPI.createUser(userForm);
      if (res.success) {
        setSuccess('New user created successfully.');
        setAddingUser(false);
        await fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Name,Email,Username,Role,AccessibilityMode,Status\n';

    users.forEach((user) => {
      const isActive = !(user.is_permanently_banned || (user.ban_expires_at && new Date(user.ban_expires_at) > new Date()));
      const statusText = user.is_permanently_banned ? 'Banned' : user.ban_expires_at ? 'Suspended' : 'Active';
      csvContent += `"${user.name}","${user.email}","${user.username || ''}","${user.role}","${user.accessibility_mode}","${statusText}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'users_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-app-text-main">User Management</h1>
        <p className="text-app-text-sub mt-1 text-sm">Create, edit, suspend, ban or reset credentials of system users.</p>
      </div>

      {error && <div className="bg-error/10 border border-error text-error p-3.5 rounded-lg text-sm font-semibold">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-500 text-emerald-700 p-3.5 rounded-lg text-sm font-semibold">{success}</div>}

      {/* Toolbar Filter */}
      <div className="bg-app-bg-alt border border-app-border rounded-xl p-4 flex flex-wrap gap-3 items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 grow max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 text-app-text-muted" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="w-full pl-9 pr-4 py-2 border border-app-border rounded-lg bg-white text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="px-3 py-2 border border-app-border bg-white text-sm rounded-lg outline-none">
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="parent">Parent</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="px-3 py-2 border border-app-border bg-white text-sm rounded-lg outline-none">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 border border-app-border hover:bg-gray-100 rounded-lg text-sm font-semibold text-app-text-main transition-colors">
            <Download size={14} /> Export CSV
          </button>

          <button
            onClick={() => {
              setAddingUser(true);
              setUserForm({
                username: '',
                email: '',
                password: '',
                role: 'student',
                accessibility_mode: 'regular'
              });
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-white rounded-lg text-sm font-semibold transition-all hover:shadow shadow-sm active:scale-95">
            <UserPlus size={14} /> Add User
          </button>
        </div>
      </div>

      {/* Bulk Actions Console */}
      {selectedUserIds.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between animate-in slide-in-from-top-4">
          <span className="text-sm font-semibold text-primary">{selectedUserIds.length} users selected</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('activate')}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded text-xs transition-colors">
              <Unlock size={12} /> Activate
            </button>
            <button
              onClick={() => handleBulkAction('suspend')}
              className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-3 rounded text-xs transition-colors">
              <Lock size={12} /> Suspend (7d)
            </button>
            <button
              onClick={() => handleBulkAction('ban')}
              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 rounded text-xs transition-colors">
              <Trash2 size={12} /> Ban Permanent
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-1.5 px-3 rounded text-xs transition-colors">
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-app-bg-alt border border-app-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-app-border text-xs uppercase font-bold text-app-text-sub">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-4 cursor-pointer" onClick={() => handleToggleSort('name')}>
                  <div className="flex items-center gap-1">User <ArrowUpDown size={12} /></div>
                </th>
                <th className="p-4 cursor-pointer" onClick={() => handleToggleSort('role')}>
                  <div className="flex items-center gap-1">Role <ArrowUpDown size={12} /></div>
                </th>
                <th className="p-4">Accessibility</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-app-text-muted">Loading user database...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-app-text-muted">No users found matching query.</td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSuspended = user.ban_expires_at && new Date(user.ban_expires_at) > new Date();
                  const isBanned = user.is_permanently_banned;
                  const isActive = !isSuspended && !isBanned;

                  return (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-app-text-main">{user.name}</div>
                        <div className="text-xs text-app-text-muted font-medium">{user.email} | @{user.username || 'user'}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          user.role === 'admin' ? 'bg-primary/10 text-primary border border-primary/20' :
                          user.role === 'teacher' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-semibold text-app-text-sub capitalize">{user.accessibility_mode || 'Regular'}</td>
                      <td className="p-4">
                        {isBanned ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase">Banned</span>
                        ) : isSuspended ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">Suspended</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">Active</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2.5">
                          <button
                            onClick={() => setViewingUser(user)}
                            className="p-1 text-app-text-sub hover:text-primary transition-colors"
                            title="View Profile">
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setUserForm({
                                username: user.username || '',
                                email: user.email || '',
                                role: user.role || 'student',
                                accessibility_mode: user.accessibility_mode || 'regular'
                              });
                            }}
                            className="text-xs text-primary hover:underline font-bold">
                            Edit
                          </button>
                          <button
                            onClick={() => handleResetPassword(user._id)}
                            className="text-xs text-secondary hover:underline font-bold">
                            Reset Pass
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-app-border bg-gray-50 flex items-center justify-between text-xs text-app-text-muted font-semibold">
            <span>Showing page {pagination.page} of {pagination.pages}</span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="p-1 border border-app-border bg-white hover:bg-gray-100 rounded disabled:opacity-50 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="p-1 border border-app-border bg-white hover:bg-gray-100 rounded disabled:opacity-50 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal - View Profile */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-app-border rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-app-border bg-gray-50 flex justify-between items-center text-app-text-main font-bold">
              <span>View User Profile</span>
              <button onClick={() => setViewingUser(null)} className="text-gray-400 hover:text-gray-900 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                  {viewingUser.name[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-app-text-main">{viewingUser.name}</h3>
                  <p className="text-xs text-app-text-muted">ID: {viewingUser._id}</p>
                </div>
              </div>
              <div className="divide-y divide-app-border text-sm">
                <div className="py-2.5 flex justify-between">
                  <span className="text-app-text-muted font-medium">Username</span>
                  <span className="font-semibold text-app-text-main">@{viewingUser.username || 'user'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-app-text-muted font-medium">Email</span>
                  <span className="font-semibold text-app-text-main">{viewingUser.email}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-app-text-muted font-medium">System Role</span>
                  <span className="font-semibold text-app-text-main capitalize">{viewingUser.role}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-app-text-muted font-medium">Accessibility Mode</span>
                  <span className="font-semibold text-app-text-main capitalize">{viewingUser.accessibility_mode || 'regular'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-app-text-muted font-medium">Warnings Logged</span>
                  <span className="font-semibold text-rose-600">{viewingUser.warning_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Edit User */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-app-border rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-app-border bg-gray-50 flex justify-between items-center text-app-text-main font-bold">
              <span>Edit User Details</span>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-900 font-bold">&times;</button>
            </div>
            <form onSubmit={handleSaveUserEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Username</label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Accessibility Mode</label>
                <select
                  value={userForm.accessibility_mode}
                  onChange={(e) => setUserForm({ ...userForm, accessibility_mode: e.target.value })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary">
                  <option value="regular">Regular</option>
                  <option value="deaf">Deaf / Hard of Hearing</option>
                  <option value="speech">Speech Related</option>
                  <option value="blind">Screen Reader User</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-app-border rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg text-sm transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Add User */}
      {addingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-app-border rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-app-border bg-gray-50 flex justify-between items-center text-app-text-main font-bold">
              <span>Add New User</span>
              <button onClick={() => setAddingUser(false)} className="text-gray-400 hover:text-gray-900 font-bold">&times;</button>
            </div>
            <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Username</label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  placeholder="e.g. johndoe"
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="e.g. john@example.com"
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Password</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Accessibility Mode</label>
                <select
                  value={userForm.accessibility_mode}
                  onChange={(e) => setUserForm({ ...userForm, accessibility_mode: e.target.value })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary">
                  <option value="regular">Regular</option>
                  <option value="deaf">Deaf / Hard of Hearing</option>
                  <option value="speech">Speech Related</option>
                  <option value="blind">Screen Reader User</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddingUser(false)}
                  className="px-4 py-2 border border-app-border rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg text-sm transition-colors">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
