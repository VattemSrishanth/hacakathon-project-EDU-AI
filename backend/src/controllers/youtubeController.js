const asyncHandler = require("../utils/asyncHandler");
const { ISL_DICTIONARY, ISL_ALPHABET, ISL_NUMBERS } = require("../data/islDictionary");

/**
 * Normalizes text for robust dictionary search
 */
function normalizeQuery(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Find sign in curated ISL dictionary using exact, alias, and keyword matching
 */
function findInISLDictionary(rawQuery) {
  const q = normalizeQuery(rawQuery);
  if (!q) return null;

  // 1. Direct match on id or exact phrase
  const directMatch = ISL_DICTIONARY.find(
    (item) => item.id === q || normalizeQuery(item.phrase) === q
  );
  if (directMatch) return directMatch;

  // 2. Search aliases / keywords array
  const aliasMatch = ISL_DICTIONARY.find((item) =>
    item.search.some((alias) => q === alias || q.includes(alias) || alias.includes(q))
  );
  if (aliasMatch) return aliasMatch;

  // 3. Substring match on phrase or Hindi phrase
  const subMatch = ISL_DICTIONARY.find(
    (item) =>
      normalizeQuery(item.phrase).includes(q) ||
      q.includes(normalizeQuery(item.phrase)) ||
      (item.hindiPhrase && item.hindiPhrase.includes(q))
  );
  if (subMatch) return subMatch;

  // 4. Token-based word overlap
  const tokens = q.split(" ").filter((w) => w.length > 2);
  if (tokens.length > 0) {
    for (const item of ISL_DICTIONARY) {
      for (const token of tokens) {
        if (
          normalizeQuery(item.phrase).includes(token) ||
          item.search.some((s) => s.includes(token))
        ) {
          return item;
        }
      }
    }
  }

  return null;
}

/**
 * Searches for a sign language video.
 * Uses curated official ISLRTC signs first for instant, verified, quota-free responses.
 * Gracefully falls back if external YouTube API is blocked, restricted, or unavailable.
 */
const searchVideo = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();

  if (!q) {
    return res.status(400).json({ error: "Query parameter 'q' is required." });
  }

  // 1. Check curated ISLRTC dictionary first
  const curatedMatch = findInISLDictionary(q);
  if (curatedMatch) {
    return res.json({
      success: true,
      videoId: curatedMatch.videoId,
      embedUrl: curatedMatch.embedUrl || `https://www.youtube.com/embed/${curatedMatch.videoId}?rel=0`,
      title: curatedMatch.phrase,
      hindiPhrase: curatedMatch.hindiPhrase,
      group: curatedMatch.group,
      handshape: curatedMatch.handshape,
      movement: curatedMatch.movement,
      expression: curatedMatch.expression,
      etiquette: curatedMatch.etiquette,
      difficulty: curatedMatch.difficulty,
      source: "ISLRTC Standardized Indian Sign Language",
      officialDictionaryUrl: "https://divyangjan.depwd.gov.in/islrtc/",
      fallbackUsed: false
    });
  }

  // 2. If not in curated dictionary, attempt YouTube API search if key exists
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey) {
    try {
      const cleanSearch = q
        .replace(/Indian Sign Language/gi, "")
        .replace(/ISLRTC/gi, "")
        .trim();

      const params = new URLSearchParams({
        part: "snippet",
        maxResults: "1",
        type: "video",
        q: `${cleanSearch} Indian Sign Language`,
        key: apiKey
      });

      if (req.query.source === "islrtc") {
        params.set("channelId", "UC3AcGIlqVI4nJWCwHgHFXtg");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const item = data.items?.[0];
        const videoId = item?.id?.videoId;

        if (videoId) {
          return res.json({
            success: true,
            videoId,
            embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
            title: item.snippet?.title || q,
            description: item.snippet?.description || "",
            source: "YouTube ISL Search",
            fallbackUsed: false
          });
        }
      } else {
        const errText = await response.text();
        console.warn("YouTube API responded with error:", response.status, errText);
      }
    } catch (apiError) {
      console.warn("YouTube API search request failed:", apiError.message);
    }
  }

  // 3. Resilient Fallback: Provide the official ISLRTC foundational course video
  // and direct official channel search links so the user is NEVER blocked by an API error.
  const defaultSign = ISL_DICTIONARY[0]; // Hello / Namaste
  const isClassroom = /class|school|teach|study|learn|book|read|exam/i.test(q);
  const selectedFallback = isClassroom
    ? ISL_DICTIONARY.find((item) => item.group === "In class") || defaultSign
    : defaultSign;

  return res.json({
    success: true,
    videoId: selectedFallback.videoId,
    embedUrl: selectedFallback.embedUrl,
    title: selectedFallback.phrase,
    hindiPhrase: selectedFallback.hindiPhrase,
    group: selectedFallback.group,
    handshape: selectedFallback.handshape,
    movement: selectedFallback.movement,
    expression: selectedFallback.expression,
    etiquette: selectedFallback.etiquette,
    difficulty: selectedFallback.difficulty,
    source: "ISLRTC Foundation Reference",
    officialDictionaryUrl: "https://divyangjan.depwd.gov.in/islrtc/",
    officialChannelSearchUrl: `https://www.youtube.com/@ISLRTC/search?query=${encodeURIComponent(q)}`,
    fallbackUsed: true,
    note: `Showing official ISL foundation module for "${q}". You can also browse the official ISLRTC library.`
  });
});

/**
 * Returns captions or transcript for an ISL video.
 */
const getCaptions = asyncHandler(async (req, res) => {
  const videoId = (req.query.videoId || "").trim();
  if (!videoId) {
    return res.status(400).json({ error: "videoId is required" });
  }

  // Find if it belongs to curated dictionary
  const sign = ISL_DICTIONARY.find((item) => item.videoId === videoId);
  if (sign) {
    const transcript = [
      `Sign: ${sign.phrase} (${sign.hindiPhrase || ""})`,
      `Category: ${sign.group}`,
      `Handshape: ${sign.handshape}`,
      `Movement: ${sign.movement}`,
      `Facial Expression: ${sign.expression}`,
      `Cultural Etiquette: ${sign.etiquette}`
    ].join("\n");
    return res.json({ success: true, transcript });
  }

  return res.json({
    success: true,
    transcript: "Visual Indian Sign Language demonstration from official ISLRTC standards."
  });
});

/**
 * Returns full curated ISL dictionary, alphabet, and numbers
 */
const getDictionary = asyncHandler(async (req, res) => {
  return res.json({
    success: true,
    count: ISL_DICTIONARY.length,
    dictionary: ISL_DICTIONARY,
    alphabet: ISL_ALPHABET,
    numbers: ISL_NUMBERS,
    officialPortal: "https://divyangjan.depwd.gov.in/islrtc/",
    source: "Indian Sign Language Research and Training Centre (ISLRTC), Govt. of India"
  });
});

module.exports = { searchVideo, getCaptions, getDictionary };
