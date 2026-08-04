const socketIo = require("socket.io");
const User = require("../models/User");
const TeacherProfile = require("../models/TeacherProfile");
const DoubtSession = require("../models/DoubtSession");
const { moderateMessage } = require("./aiModerationService");

let io;
const activeSockets = {}; // userId -> socket.id
const activeSessions = {}; // socket.id -> sessionId (tracks active rooms)

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    // 1. Authenticate & track socket mapping
    socket.on("register_user", async ({ userId, role }) => {
      socket.userId = userId;
      socket.role = role;
      activeSockets[userId] = socket.id;

      // If teacher, set profile to online
      if (role === "teacher") {
        await TeacherProfile.findOneAndUpdate(
          { userId },
          { isOnline: true, isFree: true },
          { upsert: true }
        );
        // Broadcast online status to all sockets
        io.emit("teacher_status_changed", { userId, isOnline: true, isFree: true });
      }
    });

    // Toggle teacher availability status manually
    socket.on("toggle_availability", async ({ userId, isFree }) => {
      if (socket.role === "teacher") {
        await TeacherProfile.findOneAndUpdate({ userId }, { isFree });
        io.emit("teacher_status_changed", { userId, isOnline: true, isFree });
      }
    });

    // 2. Student requests doubt match
    socket.on("start_doubt_match", async (matchData) => {
      const { studentId, subject, topic, language, grade, difficulty, questionText } = matchData;

      try {
        const session = await DoubtSession.create({
          studentId,
          subject,
          topic,
          language,
          grade,
          difficulty,
          questionText,
          status: "matching"
        });

        // Trigger the matching logic
        findAndNotifyTeacher(session);
      } catch (err) {
        console.error("Failed to start doubt match:", err);
        socket.emit("match_error", { error: "Failed to initialize matching" });
      }
    });

    // 3. Teacher accepts incoming doubt request
    socket.on("accept_doubt_request", async ({ sessionId, teacherId }) => {
      try {
        const session = await DoubtSession.findById(sessionId);
        if (!session || session.status !== "matching") {
          socket.emit("match_error", { error: "Session no longer matching" });
          return;
        }

        // Connect session
        session.status = "active";
        session.teacherId = teacherId;
        session.startTime = new Date();
        await session.save();

        // Mark teacher busy
        await TeacherProfile.findOneAndUpdate({ userId: teacherId }, { isFree: false });
        io.emit("teacher_status_changed", { userId: teacherId, isOnline: true, isFree: false });

        // Join both to socket room
        const roomName = `session_${sessionId}`;
        socket.join(roomName);

        const studentSocketId = activeSockets[session.studentId.toString()];
        if (studentSocketId) {
          const studentSocket = io.sockets.sockets.get(studentSocketId);
          if (studentSocket) {
            studentSocket.join(roomName);
          }
        }

        // Notify both
        io.to(roomName).emit("match_success", { session });
      } catch (err) {
        console.error("Accept error:", err);
      }
    });

    // 4. Teacher declines incoming request
    socket.on("decline_doubt_request", async ({ sessionId, teacherId }) => {
      try {
        const session = await DoubtSession.findById(sessionId);
        if (session && session.status === "matching") {
          session.declinedTeacherIds.push(teacherId);
          await session.save();
          // Find next teacher
          findAndNotifyTeacher(session);
        }
      } catch (err) {
        console.error("Decline error:", err);
      }
    });

    // 5. Synced Interactive Elements (Whiteboard & Code Snippets)
    socket.on("whiteboard_draw", ({ sessionId, drawData }) => {
      socket.to(`session_${sessionId}`).emit("whiteboard_draw", drawData);
    });

    socket.on("code_update", ({ sessionId, code }) => {
      socket.to(`session_${sessionId}`).emit("code_update", code);
    });

    // 6. WebRTC Voice/Video Calling Signaling
    socket.on("webrtc_signal", ({ sessionId, signalData }) => {
      socket.to(`session_${sessionId}`).emit("webrtc_signal", signalData);
    });

    // 7. Text Chat with Content Moderation & Typing Indicators
    socket.on("send_message", async ({ sessionId, senderId, text, attachments = [], fingerprint = "" }) => {
      const roomName = `session_${sessionId}`;

      // Moderate message content
      const modResult = await moderateMessage(senderId, text, fingerprint);
      if (!modResult.safe) {
        socket.emit("message_blocked", {
          error: modResult.reason,
          action: modResult.action,
          warningCount: modResult.warningCount
        });
        return;
      }

      // Valid educational message: deliver to room
      io.to(roomName).emit("receive_message", {
        senderId,
        text,
        attachments,
        timestamp: new Date()
      });
    });

    socket.on("typing", ({ sessionId, isTyping, username }) => {
      socket.to(`session_${sessionId}`).emit("typing", { isTyping, username });
    });

    // 8. End Doubt Session
    socket.on("end_session", async ({ sessionId }) => {
      try {
        const session = await DoubtSession.findById(sessionId);
        if (session && session.status === "active") {
          session.status = "completed";
          session.endTime = new Date();
          await session.save();

          // Free the teacher
          if (session.teacherId) {
            await TeacherProfile.findOneAndUpdate({ userId: session.teacherId }, { isFree: true });
            io.emit("teacher_status_changed", { userId: session.teacherId, isOnline: true, isFree: true });
          }

          io.to(`session_${sessionId}`).emit("session_ended", { session });
        }
      } catch (err) {
        console.error("End session error:", err);
      }
    });

    // Cleanups on disconnect
    socket.on("disconnect", async () => {
      if (socket.userId) {
        delete activeSockets[socket.userId];

        if (socket.role === "teacher") {
          await TeacherProfile.findOneAndUpdate(
            { userId: socket.userId },
            { isOnline: false, isFree: true }
          );
          io.emit("teacher_status_changed", { userId: socket.userId, isOnline: false, isFree: true });
        }
      }
    });
  });
};

// Helper: Matches best teacher and handles timeouts
const findAndNotifyTeacher = async (session) => {
  const sessionId = session._id.toString();

  try {
    // 1. Query online, free, matching subjects/languages, approved teachers
    const query = {
      isOnline: true,
      isFree: true,
      verificationStatus: "verified",
      subjects: session.subject,
      languages: session.language,
      userId: { $nin: session.declinedTeacherIds } // exclude declined
    };

    // Find all matching teachers, sort by rating, lowest response time, experience
    const candidates = await TeacherProfile.find(query)
      .sort({ rating: -1, responseTime: 1, experience: -1 })
      .populate("userId");

    // 2. If no teachers are available, notify the student
    if (candidates.length === 0) {
      session.status = "expired";
      await session.save();

      const studentSocketId = activeSockets[session.studentId.toString()];
      if (studentSocketId) {
        io.to(studentSocketId).emit("match_failed", {
          message: "No matching online teachers found at the moment. Please try again shortly or post your doubt in our Peer Forums."
        });
      }
      return;
    }

    // 3. Dispatch incoming request to first matched candidate
    const bestTeacher = candidates[0];
    const teacherSocketId = activeSockets[bestTeacher.userId._id.toString()];

    if (teacherSocketId) {
      io.to(teacherSocketId).emit("incoming_doubt_request", {
        session,
        teacherProfile: bestTeacher
      });

      // Update student on current match status
      const studentSocketId = activeSockets[session.studentId.toString()];
      if (studentSocketId) {
        io.to(studentSocketId).emit("matching_status_update", {
          message: `Connecting you with verified educator ${bestTeacher.userId.name}...`,
          teacherId: bestTeacher.userId._id
        });
      }

      // Start 30s timeout
      setTimeout(async () => {
        // Re-query session to check if still matching
        const currentSession = await DoubtSession.findById(sessionId);
        if (currentSession && currentSession.status === "matching" && !currentSession.teacherId) {
          // Add teacher to declined list and find next candidate
          currentSession.declinedTeacherIds.push(bestTeacher.userId._id);
          await currentSession.save();
          
          // Notify teacher that request timed out
          io.to(teacherSocketId).emit("request_timeout", { sessionId });

          findAndNotifyTeacher(currentSession);
        }
      }, 30000); // 30 seconds
    } else {
      // Teacher socket disconnected, mark declined and fetch next
      session.declinedTeacherIds.push(bestTeacher.userId._id);
      await session.save();
      findAndNotifyTeacher(session);
    }
  } catch (err) {
    console.error("Match Engine iteration failed:", err);
  }
};

module.exports = {
  initSocket,
  io
};
