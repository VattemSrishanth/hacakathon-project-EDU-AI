const Timetable = require("../models/Timetable");
const { generateWithFallback } = require("./aiService");

const generateTimetable = async (userId, college, branch, semester, subjects = []) => {
  const subjectsList = subjects.length > 0 ? subjects.join(", ") : "general academic subjects";

  const prompt = `You are an expert academic counselor and AI study planner.
Generate a structured daily study plan, weekly schedule, and reminder schedule for a student with the following profile:
College: ${college}
Branch: ${branch}
Semester: ${semester}
Subjects: ${subjectsList}

We need the response formatted strictly as a JSON object with this exact structure:
{
  "schedule": {
    "Monday": [{"time": "09:00 - 10:30", "subject": "SubjectName", "activity": "Lecture Revision"}, {"time": "15:00 - 16:30", "subject": "SubjectName", "activity": "Self Study & Problem Solving"}],
    "Tuesday": [],
    "Wednesday": [],
    "Thursday": [],
    "Friday": [],
    "Saturday": [],
    "Sunday": []
  },
  "studyPlan": "A markdown string containing general tips, key topics to focus on, and a structured study outline.",
  "reminders": [
    {"title": "Revision: Chapter 1 of SubjectName", "daysFromNow": 3, "type": "revision"},
    {"title": "Assignment Prep: SubjectName Module 1", "daysFromNow": 7, "type": "assignment"},
    {"title": "Midterm Prep Quiz", "daysFromNow": 14, "type": "exam"}
  ]
}

Make sure every weekday from Monday to Friday has at least 2 study blocks related to the student's subjects. Return ONLY raw JSON, with no wrapping backticks.`;

  try {
    const aiResponse = await generateWithFallback({
      prompt,
      language: "English",
      answerStyle: "Structured JSON"
    });

    let result;
    try {
      const cleanJson = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      result = JSON.parse(cleanJson);
    } catch (e) {
      console.error("AI JSON parsing failed, using standard default template");
      result = getDefaultSchedule(subjects);
    }

    // Convert daysFromNow to actual dates for reminders
    const reminders = (result.reminders || []).map((r) => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + (r.daysFromNow || 1));
      return {
        title: r.title,
        date: targetDate,
        type: r.type || "revision"
      };
    });

    // Save or update in database
    const timetable = await Timetable.findOneAndUpdate(
      { userId },
      {
        college,
        branch,
        semester,
        subjects,
        schedule: result.schedule || {},
        studyPlan: result.studyPlan || "Perform structured daily self-studies and mock exams regularly.",
        reminders
      },
      { new: true, upsert: true }
    );

    return timetable;
  } catch (err) {
    console.error("Failed to generate AI timetable:", err);
    throw err;
  }
};

const getDefaultSchedule = (subjects) => {
  const schedule = {};
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const subs = subjects.length > 0 ? subjects : ["Mathematics", "Physics", "Chemistry"];

  days.forEach((day, index) => {
    if (index < 5) {
      schedule[day] = [
        { time: "09:00 - 10:30", subject: subs[index % subs.length], activity: "Standard Practice & Revision" },
        { time: "16:00 - 17:30", subject: subs[(index + 1) % subs.length], activity: "Notes Review & Homework" }
      ];
    } else {
      schedule[day] = [
        { time: "10:00 - 12:00", subject: "All Subjects", activity: "Weekly Self Assessment Quiz" }
      ];
    }
  });

  return {
    schedule,
    studyPlan: "# Study Outline\n- Revise topics every 24 hours.\n- Practice coding or math problems daily.\n- Join community group discussion topics.",
    reminders: [
      { title: "Weekly progress quiz assessment", daysFromNow: 7, type: "revision" }
    ]
  };
};

module.exports = {
  generateTimetable
};
