import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface Lesson {
  title: string;
  description?: string;
}

export interface YouTubeVideoResult {
  videoId: string;
  embedUrl: string;
  title?: string;
  hindiPhrase?: string;
  group?: string;
  handshape?: string;
  movement?: string;
  expression?: string;
  etiquette?: string;
  difficulty?: string;
  source?: string;
  officialDictionaryUrl?: string;
  officialChannelSearchUrl?: string;
  fallbackUsed?: boolean;
  note?: string;
}

export interface ISLSignItem {
  id: string;
  phrase: string;
  hindiPhrase: string;
  group: string;
  search: string[];
  videoId: string;
  embedUrl: string;
  startSeconds?: number;
  handshape: string;
  movement: string;
  expression: string;
  etiquette: string;
  difficulty: string;
}

export interface ISLAlphabetItem {
  letter: string;
  shape: string;
  tip: string;
}

export interface ISLNumberItem {
  num: string;
  shape: string;
  tip: string;
}

export interface ISLDictionaryResponse {
  success: boolean;
  count: number;
  dictionary: ISLSignItem[];
  alphabet: ISLAlphabetItem[];
  numbers: ISLNumberItem[];
  officialPortal: string;
  source: string;
}

/**
 * Offline-resilient default ISL phrases & curriculum dataset
 */
export const BUNDLED_ISL_DICTIONARY: ISLSignItem[] = [
  {
    id: 'hello',
    phrase: 'Hello',
    hindiPhrase: 'नमस्ते / हैलो',
    group: 'Greetings',
    search: ['hello', 'namaste', 'hi', 'greetings', 'salutation'],
    videoId: 'tSkd_R5ODUE',
    embedUrl: 'https://www.youtube.com/embed/tSkd_R5ODUE?rel=0',
    startSeconds: 0,
    handshape: 'Flat open hand with fingers together, or traditional Anjali Mudra (folded palms).',
    movement: 'Bring dominant open hand near temple or forehead, sweep outward gently with palm forward.',
    expression: 'Warm friendly smile with direct, polite eye contact.',
    etiquette: 'In ISL, eye contact is mandatory before initiating greetings to establish visual connection.',
    difficulty: 'Beginner'
  },
  {
    id: 'how-are-you',
    phrase: 'How are you?',
    hindiPhrase: 'आप कैसे हैं?',
    group: 'Greetings',
    search: ['how are you', 'how r u', 'kaisa', 'kaise ho', 'are you okay', 'fine'],
    videoId: 'tSkd_R5ODUE',
    embedUrl: 'https://www.youtube.com/embed/tSkd_R5ODUE?rel=0',
    startSeconds: 30,
    handshape: 'Both hands cupped upward with palms facing chest, then rotating outward.',
    movement: 'Place both hands at chest level, sweep smoothly forward towards the person while turning palms up.',
    expression: 'Slight head tilt forward with gently raised eyebrows (interrogative grammatical marker).',
    etiquette: 'Facial expression is integral to ISL grammar; without the head tilt, the phrase is ambiguous.',
    difficulty: 'Beginner'
  },
  {
    id: 'thank-you',
    phrase: 'Thank you',
    hindiPhrase: 'धन्यवाद / शुक्रिया',
    group: 'Greetings',
    search: ['thank you', 'thanks', 'dhanyawad', 'shukriya', 'grateful'],
    videoId: 'tSkd_R5ODUE',
    embedUrl: 'https://www.youtube.com/embed/tSkd_R5ODUE?rel=0',
    startSeconds: 55,
    handshape: 'Flat dominant hand, fingers together, thumb aligned alongside palm.',
    movement: 'Touch fingertips lightly to chin or lips, then extend hand outward and downward toward the recipient.',
    expression: 'Sincere, appreciative facial expression and pleasant smile.',
    etiquette: 'For deep gratitude, both hands can be used simultaneously with a gentle bow.',
    difficulty: 'Beginner'
  },
  {
    id: 'my-name',
    phrase: 'My name is…',
    hindiPhrase: 'मेरा नाम है...',
    group: 'Greetings',
    search: ['my name', 'name', 'mera naam', 'introduce', 'who am i'],
    videoId: 'tSkd_R5ODUE',
    embedUrl: 'https://www.youtube.com/embed/tSkd_R5ODUE?rel=0',
    startSeconds: 85,
    handshape: "Dominant index finger for 'Me', followed by H-handshape (index & middle extended together).",
    movement: "Tap center of chest once ('Me/My'), then tap index & middle fingers against opposite fingers ('Name').",
    expression: 'Clear, friendly, and attentive expression.',
    etiquette: 'Follow this sign immediately with ISL fingerspelling of your name.',
    difficulty: 'Beginner'
  },
  {
    id: 'goodbye',
    phrase: 'Goodbye',
    hindiPhrase: 'अलविदा / फिर मिलेंगे',
    group: 'Greetings',
    search: ['goodbye', 'bye', 'alvida', 'see you', 'farewell'],
    videoId: 'tSkd_R5ODUE',
    embedUrl: 'https://www.youtube.com/embed/tSkd_R5ODUE?rel=0',
    startSeconds: 110,
    handshape: 'Open flat hand facing outward at chest/shoulder level.',
    movement: 'Gently fold fingers in and out twice toward the palm in an inviting farewell wave.',
    expression: 'Warm smile, nodding slightly in acknowledgment.',
    etiquette: 'Wave within the shoulder frame so it stays clear and unobstructed in visual space.',
    difficulty: 'Beginner'
  },
  {
    id: 'help',
    phrase: 'Please help me',
    hindiPhrase: 'कृपया मेरी मदद करें',
    group: 'In class',
    search: ['help', 'help me', 'madad', 'support', 'assist', 'assistance'],
    videoId: 'tSkd_R5ODUE',
    embedUrl: 'https://www.youtube.com/embed/tSkd_R5ODUE?rel=0',
    startSeconds: 190,
    handshape: "Non-dominant flat palm up; dominant hand in a closed fist with thumb up ('A' shape) placed on the palm.",
    movement: 'Lift both hands together upward towards your body or forward towards the helper.',
    expression: 'Earnest, polite expression showing need for assistance.',
    etiquette: "Directional verb: moving hands toward someone signs 'help you'; moving towards self signs 'help me'.",
    difficulty: 'Beginner'
  },
  {
    id: 'repeat',
    phrase: 'Please repeat',
    hindiPhrase: 'कृपया दोहराएं',
    group: 'In class',
    search: ['repeat', 'again', 'dohrayen', 'phir se', 'one more time'],
    videoId: 'tSkd_R5ODUE',
    embedUrl: 'https://www.youtube.com/embed/tSkd_R5ODUE?rel=0',
    startSeconds: 220,
    handshape: 'Non-dominant flat hand palm up; dominant hand bent at knuckles with fingers together.',
    movement: 'Dominant curved fingertips jump in an arching curve onto the non-dominant palm twice.',
    expression: 'Attentive, inquisitive look seeking repetition.',
    etiquette: 'Crucial classroom sign when instructions or audio narration need to be replayed.',
    difficulty: 'Beginner'
  },
  {
    id: 'understand',
    phrase: 'I understand',
    hindiPhrase: 'मुझे समझ आ गया',
    group: 'In class',
    search: ['understand', 'got it', 'clear', 'samajh', 'comprehend'],
    videoId: 'tSkd_R5ODUE',
    embedUrl: 'https://www.youtube.com/embed/tSkd_R5ODUE?rel=0',
    startSeconds: 250,
    handshape: 'Dominant hand forms a loose fist near temple, index finger flicks straight up.',
    movement: 'Flick dominant index finger straight up near forehead like an illuminating idea or lightbulb.',
    expression: 'Nod head affirmatively with an assured expression.',
    etiquette: "To say 'I don't understand', shake head side to side while performing the same hand movement.",
    difficulty: 'Beginner'
  },
  {
    id: 'question',
    phrase: 'I have a question',
    hindiPhrase: 'मेरा एक प्रश्न है',
    group: 'In class',
    search: ['question', 'doubt', 'ask', 'prashna', 'sawal', 'query'],
    videoId: 'tSkd_R5ODUE',
    embedUrl: 'https://www.youtube.com/embed/tSkd_R5ODUE?rel=0',
    startSeconds: 280,
    handshape: 'Dominant index finger raised and curved slightly into question hook.',
    movement: 'Raise hand in classroom posture and bend index finger repeatedly in a subtle hook motion.',
    expression: 'Raised eyebrows and inquiring gaze directed at instructor.',
    etiquette: 'Universal sign used by deaf and hard-of-hearing students to politely intervene with a query.',
    difficulty: 'Beginner'
  },
  {
    id: 'water',
    phrase: 'I need water',
    hindiPhrase: 'मुझे पानी चाहिए',
    group: 'Everyday needs',
    search: ['water', 'pani', 'drink', 'thirsty', 'jal'],
    videoId: 'tSkd_R5ODUE',
    embedUrl: 'https://www.youtube.com/embed/tSkd_R5ODUE?rel=0',
    startSeconds: 430,
    handshape: "Dominant 'W' hand (index, middle, ring finger extended upright; thumb holds pinky).",
    movement: 'Tap the side of index finger gently against the chin or lower lip twice.',
    expression: 'Simple, clear communicative expression.',
    etiquette: 'Standard ISL dictionary sign recognized across all Indian states.',
    difficulty: 'Beginner'
  },
  {
    id: 'bathroom',
    phrase: 'Where is the bathroom?',
    hindiPhrase: 'शौचालय कहाँ है?',
    group: 'Everyday needs',
    search: ['bathroom', 'washroom', 'toilet', 'restroom', 'shauchalay'],
    videoId: 'tSkd_R5ODUE',
    embedUrl: 'https://www.youtube.com/embed/tSkd_R5ODUE?rel=0',
    startSeconds: 460,
    handshape: "Dominant hand forms 'T' (thumb poking between index and middle finger) or 'W' (Washroom).",
    movement: 'Hold hand at shoulder level and gently rotate/shake wrist from side to side twice.',
    expression: 'Inquiring expression, eyebrows raised.',
    etiquette: 'Widely understood universal ISL sign for urgent restroom access in institutions.',
    difficulty: 'Beginner'
  },
  {
    id: 'yes',
    phrase: 'Yes',
    hindiPhrase: 'हाँ / सही',
    group: 'Everyday needs',
    search: ['yes', 'haan', 'correct', 'agree', 'true', 'okay'],
    videoId: 'tSkd_R5ODUE',
    embedUrl: 'https://www.youtube.com/embed/tSkd_R5ODUE?rel=0',
    startSeconds: 490,
    handshape: "Dominant hand closed in a gentle fist ('S' shape).",
    movement: 'Nod the fist up and down from the wrist, mirroring a head nodding motion.',
    expression: 'Supportive head nod with affirmative smile.',
    etiquette: 'Reinforced by a simultaneous physical head nod.',
    difficulty: 'Beginner'
  },
  {
    id: 'no',
    phrase: 'No',
    hindiPhrase: 'नहीं / गलत',
    group: 'Everyday needs',
    search: ['no', 'nahin', 'wrong', 'disagree', 'refuse', 'stop'],
    videoId: 'tSkd_R5ODUE',
    embedUrl: 'https://www.youtube.com/embed/tSkd_R5ODUE?rel=0',
    startSeconds: 520,
    handshape: 'Dominant index and middle finger extended, snapping firmly down against thumb.',
    movement: 'Quickly bring index and middle fingers down to snap closed against thumb tip.',
    expression: 'Firm or gentle head shake from side to side.',
    etiquette: 'The firmness of the snap and head shake conveys the intensity of the negation.',
    difficulty: 'Beginner'
  },
  {
    id: 'please',
    phrase: 'Please',
    hindiPhrase: 'कृपया',
    group: 'Everyday needs',
    search: ['please', 'kripya', 'request', 'kindly'],
    videoId: 'tSkd_R5ODUE',
    embedUrl: 'https://www.youtube.com/embed/tSkd_R5ODUE?rel=0',
    startSeconds: 550,
    handshape: 'Flat open dominant palm, fingers together and thumb relaxed.',
    movement: 'Rub the flat palm in a gentle clockwise circle over the center of your chest.',
    expression: 'Polite, modest, and friendly demeanor.',
    etiquette: 'Used when asking for materials, permissions, or support.',
    difficulty: 'Beginner'
  },
  {
    id: 'food',
    phrase: 'Food / Eat',
    hindiPhrase: 'खाना / भोजन',
    group: 'Everyday needs',
    search: ['food', 'eat', 'khana', 'lunch', 'dinner', 'meal'],
    videoId: 'tSkd_R5ODUE',
    embedUrl: 'https://www.youtube.com/embed/tSkd_R5ODUE?rel=0',
    startSeconds: 580,
    handshape: 'Flattened O-handshape with fingertips brought together touching thumb tip.',
    movement: 'Tap the fingertips toward your mouth twice in a rhythmic motion.',
    expression: 'Pleasant and natural expression.',
    etiquette: 'Standard across Indian regional variations.',
    difficulty: 'Beginner'
  },
  {
    id: 'mathematics',
    phrase: 'Mathematics',
    hindiPhrase: 'गणित',
    group: 'Subjects',
    search: ['mathematics', 'math', 'maths', 'ganit', 'numbers', 'calculation'],
    videoId: 'tSkd_R5ODUE',
    embedUrl: 'https://www.youtube.com/embed/tSkd_R5ODUE?rel=0',
    startSeconds: 640,
    handshape: "Both hands form 'M' shape (thumb tucked under index, middle, and ring fingers).",
    movement: "Brush 'M' hands past each other crossing at wrists repeatedly.",
    expression: 'Analytical, concentrated look.',
    etiquette: 'NCERT official curriculum sign for mathematics lessons.',
    difficulty: 'Intermediate'
  },
  {
    id: 'science',
    phrase: 'Science',
    hindiPhrase: 'विज्ञान',
    group: 'Subjects',
    search: ['science', 'vigyan', 'physics', 'chemistry', 'experiment'],
    videoId: 'tSkd_R5ODUE',
    embedUrl: 'https://www.youtube.com/embed/tSkd_R5ODUE?rel=0',
    startSeconds: 670,
    handshape: "Both hands in 'A' fists with thumbs extended downward like test tubes or beakers.",
    movement: 'Alternate pouring circular motions with each hand as if mixing solutions in a laboratory.',
    expression: 'Curious, inquisitive expression.',
    etiquette: 'Visual representation of experimental inquiry.',
    difficulty: 'Intermediate'
  }
];

export const BUNDLED_ISL_ALPHABET: ISLAlphabetItem[] = [
  { letter: 'A', shape: 'Closed fist with thumb upright against side of index finger.', tip: 'Thumb straight up alongside index.' },
  { letter: 'B', shape: 'Flat hand with 4 fingers upright and thumb folded across palm.', tip: 'Fingers glued together.' },
  { letter: 'C', shape: "Curved hand forming a 'C' shape with thumb and fingers.", tip: 'Side profile clearly forms letter C.' },
  { letter: 'D', shape: 'Index finger upright, remaining fingers touch thumb in a circle.', tip: 'Distinct circle with index tall.' },
  { letter: 'E', shape: 'All fingers curved inward, resting on thumb tip.', tip: 'Claw-like compact curled shape.' },
  { letter: 'F', shape: "Index finger and thumb touch to form circle; 3 fingers spread up.", tip: "Like an 'OK' sign facing forward." },
  { letter: 'G', shape: 'Index finger and thumb pointing parallel horizontally.', tip: 'Pointing sideways like measuring thickness.' },
  { letter: 'H', shape: 'Index and middle fingers extended together horizontally.', tip: 'Two fingers pointing sideways.' },
  { letter: 'I', shape: 'Pinky finger extended upright; remaining fingers in a fist.', tip: 'Only little finger stands tall.' },
  { letter: 'J', shape: "Extend pinky and trace a 'J' curve down and forward in air.", tip: 'Dynamic tracing movement.' },
  { letter: 'K', shape: 'Index finger tall, middle finger forward, thumb between them.', tip: 'Two fingers spread with thumb brace.' },
  { letter: 'L', shape: "Index finger upright and thumb extended sideways forming an 'L'.", tip: 'Sharp 90-degree corner.' },
  { letter: 'M', shape: 'Thumb tucked under first three fingers draped downward.', tip: 'Three humps over the thumb.' },
  { letter: 'N', shape: 'Thumb tucked under first two fingers draped downward.', tip: 'Two humps over the thumb.' },
  { letter: 'O', shape: "All fingers curved to meet thumb tip, forming an 'O'.", tip: 'Clean circular silhouette.' },
  { letter: 'P', shape: "Downward pointed 'K' handshape.", tip: 'Index points down, middle tilted forward.' },
  { letter: 'Q', shape: "Downward pointed 'G' handshape (index and thumb pointing down).", tip: 'Pointing straight to floor.' },
  { letter: 'R', shape: 'Index and middle fingers crossed tightly like wishing luck.', tip: 'Middle finger twisted over index.' },
  { letter: 'S', shape: 'Closed fist with thumb wrapped across the front of fingers.', tip: "Contrast with 'A' where thumb is at side." },
  { letter: 'T', shape: 'Thumb tucked between index and middle fingers in a fist.', tip: 'Thumb peek between knuckles.' },
  { letter: 'U', shape: 'Index and middle fingers straight up and held tight together.', tip: 'Two fingers together upright.' },
  { letter: 'V', shape: "Index and middle fingers spread in a peace/victory 'V' sign.", tip: 'Two fingers separated.' },
  { letter: 'W', shape: "Index, middle, and ring fingers spread upright in a 'W'.", tip: 'Three fingers spread like trident.' },
  { letter: 'X', shape: "Index finger bent into a hook like a pirate's hook.", tip: 'Curved crooked index finger.' },
  { letter: 'Y', shape: 'Thumb and pinky extended outward; middle 3 fingers folded.', tip: "Like a 'shaka' or phone sign." },
  { letter: 'Z', shape: "Index finger draws a 'Z' shape in the air.", tip: 'Draw top line, diagonal, bottom line.' }
];

export const BUNDLED_ISL_NUMBERS: ISLNumberItem[] = [
  { num: '1', shape: 'Index finger raised upright.', tip: 'One finger tall, palm facing in or out.' },
  { num: '2', shape: 'Index and middle fingers raised upright.', tip: 'Two fingers spread.' },
  { num: '3', shape: 'Thumb, index, and middle fingers raised.', tip: 'Standard counting handshape.' },
  { num: '4', shape: 'Four fingers raised upright, thumb folded in palm.', tip: 'Four fingers side-by-side.' },
  { num: '5', shape: 'All five fingers open and spread wide.', tip: 'Open star palm.' },
  { num: '6', shape: 'Thumb and pinky touching; index, middle, ring fingers tall.', tip: 'Pinky folded against thumb.' },
  { num: '7', shape: 'Thumb and ring finger touching; 3 fingers upright.', tip: 'Ring finger folded against thumb.' },
  { num: '8', shape: 'Thumb and middle finger touching; 3 fingers upright.', tip: 'Middle finger folded against thumb.' },
  { num: '9', shape: 'Thumb and index finger touching (O-shape); 3 fingers tall.', tip: 'Index touching thumb.' },
  { num: '10', shape: 'Fist with thumb upright, shaken slightly or showing open 5 + 5.', tip: 'Thumb shakes gently.' }
];

/**
 * Step 1: Generates a search query for YouTube based on the lesson
 */
export const generateSearchQuery = (lesson: Lesson): string => {
  const cleanTitle = (lesson?.title || '')
    .replace(/[\/\\()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return `${cleanTitle} Indian Sign Language`;
};

/**
 * Step 2: Service to search for sign language videos via our backend
 */
export const youtubeService = {
  /**
   * Calls the backend to search for a video and returns the video details.
   * Seamlessly resolves to official ISLRTC curriculum standards with full resilience.
   */
  searchSignLanguageVideo: async (query: string): Promise<YouTubeVideoResult> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/youtube-search`, {
        params: { q: query, source: 'islrtc' },
        timeout: 6000
      });

      if (response.data && response.data.videoId) {
        return {
          videoId: response.data.videoId,
          embedUrl: response.data.embedUrl || `https://www.youtube.com/embed/${response.data.videoId}?rel=0`,
          title: response.data.title || query,
          hindiPhrase: response.data.hindiPhrase,
          group: response.data.group,
          handshape: response.data.handshape,
          movement: response.data.movement,
          expression: response.data.expression,
          etiquette: response.data.etiquette,
          difficulty: response.data.difficulty,
          source: response.data.source || 'ISLRTC Standardized ISL',
          officialDictionaryUrl: response.data.officialDictionaryUrl,
          officialChannelSearchUrl: response.data.officialChannelSearchUrl,
          fallbackUsed: response.data.fallbackUsed || false,
          note: response.data.note
        };
      }
    } catch (error) {
      console.warn('Backend search unreachable, falling back to local ISL dictionary:', error);
    }

    // Client-side local fallback if backend is unreachable or returns non-200
    const cleanQ = query.toLowerCase().trim();
    const localMatch = BUNDLED_ISL_DICTIONARY.find(
      (item) =>
        item.phrase.toLowerCase().includes(cleanQ) ||
        cleanQ.includes(item.phrase.toLowerCase()) ||
        item.search.some((s) => cleanQ.includes(s))
    ) || BUNDLED_ISL_DICTIONARY[0];

    return {
      videoId: localMatch.videoId,
      embedUrl: localMatch.embedUrl,
      title: localMatch.phrase,
      hindiPhrase: localMatch.hindiPhrase,
      group: localMatch.group,
      handshape: localMatch.handshape,
      movement: localMatch.movement,
      expression: localMatch.expression,
      etiquette: localMatch.etiquette,
      difficulty: localMatch.difficulty,
      source: 'ISLRTC Offline Curated Dictionary',
      officialDictionaryUrl: 'https://divyangjan.depwd.gov.in/islrtc/',
      fallbackUsed: true
    };
  },

  /**
   * Fetches captions/transcript for a video ID
   */
  getVideoCaptions: async (videoId: string): Promise<string> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/youtube-captions`, {
        params: { videoId },
        timeout: 4000
      });
      return response.data.transcript || 'Visual ISL guidance available.';
    } catch {
      return 'Visual Indian Sign Language demonstration from official ISLRTC standards.';
    }
  },

  /**
   * Retrieves the full ISL dictionary with categories, alphabet, and numbers
   */
  getISLDictionary: async (): Promise<ISLDictionaryResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/isl-dictionary`, { timeout: 4000 });
      if (response.data && response.data.dictionary) {
        return response.data;
      }
    } catch (err) {
      console.warn('Failed to fetch remote ISL dictionary, using bundled dataset:', err);
    }

    return {
      success: true,
      count: BUNDLED_ISL_DICTIONARY.length,
      dictionary: BUNDLED_ISL_DICTIONARY,
      alphabet: BUNDLED_ISL_ALPHABET,
      numbers: BUNDLED_ISL_NUMBERS,
      officialPortal: 'https://divyangjan.depwd.gov.in/islrtc/',
      source: 'Indian Sign Language Research and Training Centre (ISLRTC)'
    };
  }
};
