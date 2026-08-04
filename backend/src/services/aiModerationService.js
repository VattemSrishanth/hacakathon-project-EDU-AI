const User = require("../models/User");
const ModerationLog = require("../models/ModerationLog");
const BannedIdentifier = require("../models/BannedIdentifier");
const { generateWithFallback } = require("./aiService");

// Basic local wordlist for quick filtering & offline support
const BLOCK_LIST = [
  "abuse", "harass", "vulgar", "fuck", "shit", "bitch", "asshole", "kill yourself",
  "spam", "buy bitcoin", "porn", "adult content", "sex", "nude", "advertisement"
];

const checkLocalModeration = (content) => {
  const normalized = content.toLowerCase();
  for (const word of BLOCK_LIST) {
    if (normalized.includes(word)) {
      return {
        safe: false,
        infractionType: "abusive/vulgar",
        reason: `Flagged by local filters for word: ${word}`
      };
    }
  }
  return { safe: true };
};

const moderateMessage = async (userId, content, fingerprint = "") => {
  const user = await User.findById(userId);
  if (!user) {
    return { safe: false, action: "blocked", reason: "User not found" };
  }

  // 1. Check if already banned
  if (user.is_permanently_banned) {
    return { safe: false, action: "permaban", reason: "Your account is permanently suspended." };
  }

  if (user.ban_expires_at && new Date(user.ban_expires_at) > new Date()) {
    return { 
      safe: false, 
      action: "suspended", 
      reason: `Your chat access is suspended until ${new Date(user.ban_expires_at).toLocaleString()}` 
    };
  }

  // 2. Local check
  const localResult = checkLocalModeration(content);
  if (!localResult.safe) {
    return await handleInfraction(user, content, localResult.infractionType, fingerprint);
  }

  // 3. AI Deep Moderation via Gemini/Groq
  try {
    const prompt = `You are a strict content moderator for Edu AI, a premium school/college educational platform.
Analyze this message sent by a user:
"${content}"

Check if it contains any of the following:
- Abusive, vulgar, offensive language or slurs
- Harassment or bullying
- Spam, advertisements, or promotional links
- Adult content, nudity, or sexual innuendos
- Politics or hate speech
- Non-educational inappropriate content

Return JSON output ONLY, strictly in this format:
{
  "safe": true/false,
  "infractionType": "none" or "abusive" or "adult" or "spam" or "hate_speech" or "politics" or "other",
  "reason": "short explanation"
}`;

    const rawResponse = await generateWithFallback({
      prompt,
      language: "English",
      answerStyle: "Short JSON"
    });

    let result;
    try {
      // Cleanup markdown backticks if returned
      const cleanJson = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      result = JSON.parse(cleanJson);
    } catch (e) {
      // Fallback parse if AI did not return clean JSON
      const isUnsafe = rawResponse.toLowerCase().includes('"safe": false') || rawResponse.toLowerCase().includes('"safe":false');
      result = {
        safe: !isUnsafe,
        infractionType: isUnsafe ? "inappropriate" : "none",
        reason: "Parsed fallback from AI response"
      };
    }

    if (!result.safe) {
      return await handleInfraction(user, content, result.infractionType, fingerprint);
    }
  } catch (error) {
    console.error("AI Moderation API failed, relying on local filters:", error);
    // Since AI failed, if local check succeeded we allow it to keep the app working, but log it
  }

  return { safe: true };
};

const handleInfraction = async (user, content, infractionType, fingerprint) => {
  // Increment warning count
  user.warning_count = (user.warning_count || 0) + 1;
  
  let actionTaken = "warning";
  let banDuration = 0;

  if (user.warning_count === 1) {
    actionTaken = "warning";
  } else if (user.warning_count === 2) {
    actionTaken = "muted_24h";
    banDuration = 24 * 60 * 60 * 1000; // 24 hours
    user.ban_expires_at = new Date(Date.now() + banDuration);
  } else if (user.warning_count === 3) {
    actionTaken = "suspended_7d";
    banDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
    user.ban_expires_at = new Date(Date.now() + banDuration);
  } else if (user.warning_count >= 4) {
    actionTaken = "permaban";
    user.is_permanently_banned = true;
    
    // Log in banned identifiers to prevent re-registration
    await BannedIdentifier.create({
      fingerprint: fingerprint || "",
      email: user.email,
      phone: "", // Fill when phone verification is active
      reason: "Exceeded maximum moderation warnings (4 infractions)"
    });
  }

  await user.save();

  // Log in ModerationLog
  await ModerationLog.create({
    userId: user._id,
    messageContent: content,
    infractionType,
    actionTaken
  });

  return {
    safe: false,
    action: actionTaken,
    warningCount: user.warning_count,
    banExpiresAt: user.ban_expires_at,
    reason: `Violation of community standards: ${infractionType}`
  };
};

module.exports = {
  moderateMessage
};
