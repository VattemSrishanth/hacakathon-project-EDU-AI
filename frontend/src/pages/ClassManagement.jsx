import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  Search, 
  Plus, 
  Mail, 
  CheckCircle, 
  Clock, 
  FileDown,
  Layers,
  ChevronRight
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

export default function ClassManagement() {
  const [activeClass, setActiveClass] = useState('10-A');
  const [searchQuery, setSearchQuery] = useState('');

  const classes = [
    { id: '10-A', grade: 'Class 10-A', count: 32, subject: 'Mathematics & Science', avgScore: 84 },
    { id: '9-B', grade: 'Class 9-B', count: 28, subject: 'General Science', avgScore: 79 },
    { id: '8-A', grade: 'Class 8-A', count: 30, subject: 'Social Studies & English', avgScore: 88 }
  ];

  const students = [
    { id: 1, roll: '101', name: 'Demo Student', email: 'student@eduai.com', attendance: '96%', assignments: '14/15', score: '88%' },
    { id: 2, roll: '102', name: 'Aarav Sharma', email: 'aarav@eduai.com', attendance: '92%', assignments: '15/15', score: '94%' },
    { id: 3, roll: '103', name: 'Diya Patel', email: 'diya@eduai.com', attendance: '88%', assignments: '12/15', score: '78%' },
    { id: 4, roll: '104', name: 'Rohan Verma', email: 'rohan@eduai.com', attendance: '95%', assignments: '13/15', score: '82%' },
    { id: 5, roll: '105', name: 'Ananya Reddy', email: 'ananya@eduai.com', attendance: '98%', assignments: '15/15', score: '96%' }
  ];

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.roll.includes(searchQuery)
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-app-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-app-text-main flex items-center gap-3">
            <Users className="w-7 h-7 text-primary" />
            Classroom & Student Roster
          </h1>
          <p className="text-sm text-app-text-sub mt-1">
            Manage student batches, monitor attendance telemetry, and review assignment completion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2 text-xs">
            <FileDown className="w-4 h-4" /> Export Report
          </Button>
          <Button variant="primary" className="flex items-center gap-2 text-xs">
            <Plus className="w-4 h-4" /> Enroll Student
          </Button>
        </div>
      </div>

      {/* Class Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {classes.map((c) => (
          <div
            key={c.id}
            onClick={() => setActiveClass(c.id)}
            className={`p-5 rounded-2xl cursor-pointer transition-all border ${
              activeClass === c.id 
                ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' 
                : 'bg-app-card border-app-border hover:border-app-border-hover'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-app-text-main">{c.grade}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-app-bg-alt text-app-text-sub">
                {c.count} Students
              </span>
            </div>
            <p className="text-xs text-app-text-sub mb-3">{c.subject}</p>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-app-border">
              <span className="text-app-text-sub">Class Average:</span>
              <strong className="text-primary font-bold">{c.avgScore}%</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Student Table */}
      <Card className="p-6 border-app-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-app-border">
          <h2 className="text-base font-bold text-app-text-main flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Enrolled Students ({filteredStudents.length})
          </h2>

          <div className="relative">
            <Search className="w-4 h-4 text-app-text-sub absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or roll..."
              className="bg-app-bg-alt border border-app-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-app-text-main placeholder-app-text-sub focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-app-text-main">
            <thead>
              <tr className="border-b border-app-border text-app-text-sub font-semibold">
                <th className="py-2.5 px-3">Roll</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Attendance</th>
                <th className="py-2.5 px-3">Assignments</th>
                <th className="py-2.5 px-3">Performance</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-app-bg-alt/30 transition">
                  <td className="py-3 px-3 font-mono font-medium">{s.roll}</td>
                  <td className="py-3 px-3 font-semibold">{s.name}</td>
                  <td className="py-3 px-3">
                    <span className="text-emerald-500 font-semibold">{s.attendance}</span>
                  </td>
                  <td className="py-3 px-3">{s.assignments}</td>
                  <td className="py-3 px-3 font-bold text-primary">{s.score}</td>
                  <td className="py-3 px-3 text-right">
                    <button className="text-xs text-app-text-sub hover:text-primary transition font-medium">
                      View Profile →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
