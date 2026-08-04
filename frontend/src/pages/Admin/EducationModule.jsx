import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Video,
  List,
  Sparkles,
  PlusCircle,
  FolderPlus
} from 'lucide-react';

const EducationModule = ({
  stats,
  syllabusForm,
  setSyllabusForm,
  lessonForm,
  setLessonForm,
  handleLessonSubmit,
  handleSyllabusSubmit,
  handleSyllabusPdfUpload,
  handleDeleteSyllabusContent,
  handleDeleteLesson,
  handleEditClick,
  availableClasses,
  availableSubjects,
  availableTopics,
  loading,
  isEditing
}) => {
  const [eduTab, setEduTab] = useState('lessons');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-app-text-main">Education Module</h1>
        <p className="text-app-text-sub mt-1 text-sm">Manage educational boards, classes, courses, topics, study materials and generated content.</p>
      </div>

      {/* Sub tabs */}
      <div className="flex gap-3 border-b border-app-border pb-px">
        <button
          onClick={() => setEduTab('lessons')}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-sm font-bold transition-all ${
            eduTab === 'lessons' ? 'border-primary text-primary' : 'border-transparent text-app-text-muted hover:text-app-text-main'
          }`}>
          <PlusCircle size={16} /> Course Materials / Lessons
        </button>
        <button
          onClick={() => setEduTab('syllabus')}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-sm font-bold transition-all ${
            eduTab === 'syllabus' ? 'border-primary text-primary' : 'border-transparent text-app-text-muted hover:text-app-text-main'
          }`}>
          <FolderPlus size={16} /> Custom Syllabus Content
        </button>
      </div>

      {/* Lessons content manager */}
      {eduTab === 'lessons' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Form: Add/Edit Lesson */}
          <div className="bg-app-bg-alt border border-app-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-primary">{isEditing ? 'Edit Existing Lesson' : 'Create New Course Material'}</h3>
            <form onSubmit={handleLessonSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  placeholder="e.g. Introduction to Physics"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Category / Subject</label>
                <input
                  type="text"
                  value={lessonForm.category}
                  onChange={(e) => setLessonForm({ ...lessonForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  placeholder="e.g. Science"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Description</label>
                <textarea
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary min-h-[70px]"
                  placeholder="Brief summary of lessons covered..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Level</label>
                  <select
                    value={lessonForm.level}
                    onChange={(e) => setLessonForm({ ...lessonForm, level: e.target.value })}
                    className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Duration</label>
                  <input
                    type="text"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                    placeholder="e.g. 45 mins"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Topics (comma separated)</label>
                <input
                  type="text"
                  value={lessonForm.topics}
                  onChange={(e) => setLessonForm({ ...lessonForm, topics: e.target.value })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  placeholder="topic1, topic2..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">PDF File (in public/lessons/)</label>
                <input
                  type="text"
                  value={lessonForm.pdf_path}
                  onChange={(e) => setLessonForm({ ...lessonForm, pdf_path: e.target.value })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  placeholder="lesson.pdf"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50">
                  {isEditing ? 'Update Lesson' : 'Create Lesson'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Table: Lesson List */}
          <div className="bg-app-bg-alt border border-app-border rounded-xl overflow-hidden shadow-sm xl:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-app-border text-xs uppercase font-bold text-app-text-sub">
                  <tr>
                    <th className="p-4">Lesson</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Level</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border text-sm">
                  {!stats?.lesson_list || stats.lesson_list.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-app-text-muted">No course lessons registered yet.</td>
                    </tr>
                  ) : (
                    stats.lesson_list.map((lesson) => (
                      <tr key={lesson.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-app-text-main flex items-center gap-1.5">
                            <BookOpen size={16} className="text-primary" />
                            {lesson.title}
                          </div>
                          <p className="text-xs text-app-text-muted font-semibold pl-5">{lesson.duration || 'N/A'}</p>
                        </td>
                        <td className="p-4 text-xs font-semibold text-app-text-sub">{lesson.category}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-extrabold uppercase rounded tracking-wider">{lesson.level}</span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(lesson)}
                            className="text-xs text-primary hover:underline font-bold">
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="text-xs text-rose-600 hover:underline font-bold">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Syllabus topics manager */}
      {eduTab === 'syllabus' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Form: Edit Syllabus Content */}
          <div className="bg-app-bg-alt border border-app-border rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-primary">Syllabus Custom Content</h3>
              <p className="text-[11px] text-app-text-muted mt-0.5">Syllabus PDF files and markdown summaries take precedence over raw AI generations.</p>
            </div>
            <form onSubmit={handleSyllabusSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Education Board</label>
                <select
                  value={syllabusForm.board}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, board: e.target.value, class: '', subject: '', topic: '' })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary">
                  <option value="NCERT">NCERT (National)</option>
                  <option value="Telangana">Telangana State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh State</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Class / Grade</label>
                <select
                  value={syllabusForm.class}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, class: e.target.value, subject: '', topic: '' })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  required>
                  <option value="">Select Class</option>
                  {availableClasses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Subject</label>
                <select
                  value={syllabusForm.subject}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, subject: e.target.value, topic: '' })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  required
                  disabled={!syllabusForm.class}>
                  <option value="">Select Subject</option>
                  {availableSubjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Topic</label>
                <select
                  value={syllabusForm.topic}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  required
                  disabled={!syllabusForm.subject}>
                  <option value="">Select Topic</option>
                  {availableTopics.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Custom Text / Description (Markdown)</label>
                <textarea
                  value={syllabusForm.description}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary min-h-[120px]"
                  placeholder="Insert formatted lecture contents..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Attach Course Syllabus PDF</label>
                <input
                  type="file"
                  id="syllabusPdfInput2"
                  accept="application/pdf"
                  onChange={handleSyllabusPdfUpload}
                  className="w-full bg-white border border-app-border rounded-lg p-1.5 text-xs text-app-text-muted file:bg-primary file:text-white file:border-none file:px-3 file:py-1 file:rounded file:mr-2 file:cursor-pointer"
                />
                {syllabusForm.pdf_base64 && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-emerald-600 font-bold">✓ PDF Loaded</span>
                    <button
                      type="button"
                      onClick={() => setSyllabusForm({ ...syllabusForm, pdf_base64: '' })}
                      className="text-[9px] bg-rose-50 border border-rose-200 text-rose-700 px-1.5 py-0.5 rounded font-bold hover:bg-rose-100">
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading || !syllabusForm.topic}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50">
                  Save Topic Content
                </button>
              </div>
            </form>
          </div>

          {/* Right Table: Custom Syllabus Content list */}
          <div className="bg-app-bg-alt border border-app-border rounded-xl overflow-hidden shadow-sm xl:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-app-border text-xs uppercase font-bold text-app-text-sub">
                  <tr>
                    <th className="p-4">Topic Details</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Attachments</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border text-sm">
                  {!stats?.syllabus_list || stats.syllabus_list.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-app-text-muted">No custom syllabus summaries recorded.</td>
                    </tr>
                  ) : (
                    stats.syllabus_list.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-app-text-main flex items-center gap-1.5">
                            <List size={16} className="text-secondary" />
                            {item.topic}
                          </div>
                          <p className="text-[10px] text-app-text-muted font-bold pl-5">Board: {item.board} | Class: {item.class_level}</p>
                        </td>
                        <td className="p-4 text-xs font-semibold text-app-text-sub italic">{item.subject}</td>
                        <td className="p-4">
                          {item.pdf_data_url || item.pdf_base64 ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase rounded border border-emerald-200 flex items-center gap-1 w-fit">
                              <FileText size={10} /> PDF Syllabus
                            </span>
                          ) : (
                            <span className="text-[10px] text-app-text-muted">Text Only</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEduTab('syllabus');
                              setSyllabusForm({
                                board: item.board,
                                class: item.class_level,
                                subject: item.subject,
                                topic: item.topic,
                                description: item.description,
                                pdf_base64: item.pdf_data_url || item.pdf_base64
                              });
                            }}
                            className="text-xs text-primary hover:underline font-bold">
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSyllabusContent(item.id)}
                            className="text-xs text-rose-600 hover:underline font-bold">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationModule;
