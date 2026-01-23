export type SupportedLanguage = 'English' | 'Telugu' | 'Hindi' | 'Spanish' | 'French';

export interface TranslationKeys {
  // Navigation
  nav: {
    home: string;
    dashboard: string;
    lessons: string;
    aiTutor: string;
    accessibility: string;
    support: string;
    settings: string;
    login: string;
    logout: string;
    profile: string;
  };
  // Voice Control
  voiceControl: {
    start: string;
    listening: string;
    unrecognized: string;
    notSupported: string;
  };
  // Home Page
  home: {
    welcome: string;
    brandName: string;
    tagline: string;
    getStarted: string;
    tryAiTutor: string;
    features: string;
    aiTutorTitle: string;
    aiTutorDesc: string;
    richContentTitle: string;
    richContentDesc: string;
    offlineTitle: string;
    offlineDesc: string;
    accessibleTitle: string;
    accessibleDesc: string;
    personalizedTitle: string;
    personalizedDesc: string;
    mobileFirstTitle: string;
    mobileFirstDesc: string;
    ctaTitle: string;
    ctaDesc: string;
    startLearning: string;
  };
  // Dashboard
  dashboard: {
    title: string;
    subtitle: string;
    lessonsCompleted: string;
    certificatesEarned: string;
    progressRate: string;
    recentActivity: string;
    learningGoals: string;
    activities: {
      completedMath: string;
      earnedBadge: string;
      startedEnglish: string;
    };
    goals: {
      completeLessons: string;
      practiceAI: string;
      achieveScore: string;
    };
  };
  // Lessons
  lessons: {
    title: string;
    subtitle: string;
    startLesson: string;
    duration: string;
    level: string;
    beginner: string;
    intermediate: string;
    advanced: string;
    noLessons: string;
  };
  // AI Tutor
  aiTutor: {
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    sending: string;
    greeting: string;
    errorMessage: string;
    disabled: string;
    disabledMessage: string;
  };
  // Settings
  settings: {
    title: string;
    subtitle: string;
    changesSaved: string;
    profile: {
      title: string;
      name: string;
      email: string;
      uploadAvatar: string;
      removeAvatar: string;
    };
    learning: {
      title: string;
      language: string;
      level: string;
      contentPreference: string;
      text: string;
      video: string;
      both: string;
    };
    aiTutorSettings: {
      title: string;
      enabled: string;
      answerStyle: string;
      short: string;
      detailed: string;
      showChatHistory: string;
      clearChatHistory: string;
      chatHistoryCleared: string;
    };
    notifications: {
      title: string;
      assignmentReminders: string;
      newLessonNotifications: string;
      reminderFrequency: string;
      daily: string;
      weekly: string;
      off: string;
    };
    themeAccessibility: {
      title: string;
      theme: string;
      light: string;
      dark: string;
      fontSize: string;
      small: string;
      medium: string;
      large: string;
      highContrast: string;
      reduceMotion: string;
      lowPowerMode: string;
      lowPowerModeDesc: string;
      voiceLanguage: string;
    };
    navigation: {
      title: string;
      accessibilitySettings: string;
      supportPage: string;
    };
  };
  // Support
  support: {
    title: string;
    subtitle: string;
    helpCenter: string;
    helpCenterDesc: string;
    contactUs: string;
    email: string;
    phone: string;
  };
  // Accessibility
  accessibility: {
    title: string;
    subtitle: string;
  };
  // Auth
  auth: {
    welcomeBack: string;
    signInToAccount: string;
    email: string;
    password: string;
    signIn: string;
    signingIn: string;
    noAccount: string;
    signUp: string;
    createAccount: string;
    name: string;
    confirmPassword: string;
    register: string;
    registering: string;
    haveAccount: string;
    loginSuccess: string;
    registerSuccess: string;
  };
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    pageNotFound: string;
    pageNotFoundDesc: string;
  };
}

const translations: Record<SupportedLanguage, TranslationKeys> = {
  English: {
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      lessons: 'Lessons',
      aiTutor: 'AI Tutor',
      accessibility: 'Accessibility',
      support: 'Support',
      settings: 'Settings',
      login: 'Login',
      logout: 'Logout',
      profile: 'Profile',
    },
    voiceControl: {
      start: 'Start Voice Control',
      listening: 'Listening... Speak now',
      unrecognized: 'Command not recognized',
      notSupported: 'Voice control is unavailable on this browser',
    },
    home: {
      welcome: 'Welcome to',
      brandName: 'RuralAccess AI',
      tagline: 'Empowering rural communities with AI-powered education. Learn anytime, anywhere with our intelligent tutoring system.',
      getStarted: 'Get Started',
      tryAiTutor: 'Try AI Tutor',
      features: 'Our Features',
      aiTutorTitle: 'AI Tutor',
      aiTutorDesc: 'Get instant answers to your questions with our intelligent AI tutor.',
      richContentTitle: 'Rich Content',
      richContentDesc: 'Access a wide range of lessons across multiple subjects.',
      offlineTitle: 'Offline Access',
      offlineDesc: 'Learn without internet connectivity with our offline mode.',
      accessibleTitle: 'Accessible',
      accessibleDesc: 'Built with accessibility in mind for all learners.',
      personalizedTitle: 'Personalized',
      personalizedDesc: 'Adaptive learning paths tailored to your needs.',
      mobileFirstTitle: 'Mobile First',
      mobileFirstDesc: 'Responsive design that works on any device.',
      ctaTitle: 'Ready to Start Learning?',
      ctaDesc: 'Join thousands of learners and transform your education journey today.',
      startLearning: 'Start Learning Now',
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Track your learning progress and achievements',
      lessonsCompleted: 'Lessons Completed',
      certificatesEarned: 'Certificates Earned',
      progressRate: 'Progress Rate',
      recentActivity: 'Recent Activity',
      learningGoals: 'Learning Goals',
      activities: {
        completedMath: 'Completed Mathematics Basics lesson',
        earnedBadge: 'Earned Science Explorer badge',
        startedEnglish: 'Started English Grammar module',
      },
      goals: {
        completeLessons: 'Complete 5 lessons this week',
        practiceAI: 'Practice AI tutor daily',
        achieveScore: 'Achieve 90% in assessments',
      },
    },
    lessons: {
      title: 'Lessons',
      subtitle: 'Explore our curated learning content',
      startLesson: 'Start Lesson',
      duration: 'Duration',
      level: 'Level',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      noLessons: 'No lessons available at the moment.',
    },
    aiTutor: {
      title: 'AI Tutor',
      subtitle: 'Get instant help with your learning questions',
      placeholder: 'Ask your question...',
      send: 'Send',
      sending: 'Sending...',
      greeting: 'Hello! I am your AI tutor. How can I help you today?',
      errorMessage: 'Sorry, I encountered an error. Please try again later.',
      disabled: 'AI Tutor Disabled',
      disabledMessage: 'The AI Tutor is currently disabled. You can enable it in Settings.',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Manage your account and learning preferences.',
      changesSaved: 'Changes saved',
      profile: {
        title: 'Profile Settings',
        name: 'Full Name',
        email: 'Email',
        uploadAvatar: 'Upload Avatar',
        removeAvatar: 'Remove avatar',
      },
      learning: {
        title: 'Learning Preferences',
        language: 'Preferred Language',
        level: 'Learning Level',
        contentPreference: 'Content Preference',
        text: 'Text',
        video: 'Video',
        both: 'Both',
      },
      aiTutorSettings: {
        title: 'AI Tutor Settings',
        enabled: 'Enable AI Tutor',
        answerStyle: 'Answer Style',
        short: 'Short',
        detailed: 'Detailed',
        showChatHistory: 'Show chat history',
        clearChatHistory: 'Clear AI chat history',
        chatHistoryCleared: 'Chat history cleared',
      },
      notifications: {
        title: 'Notification Settings',
        assignmentReminders: 'Assignment reminders',
        newLessonNotifications: 'New lesson notifications',
        reminderFrequency: 'Reminder Frequency',
        daily: 'Daily',
        weekly: 'Weekly',
        off: 'Off',
      },
      themeAccessibility: {
        title: 'Theme & Accessibility',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        fontSize: 'Font Size',
        small: 'Small',
        medium: 'Medium',
        large: 'Large',
        highContrast: 'High contrast',
        reduceMotion: 'Reduce motion',
        lowPowerMode: 'Low Power Mode',
        lowPowerModeDesc: 'Disable animations and reduce resource usage for older devices or low battery.',
        voiceLanguage: 'Voice Navigation Language',
      },
      navigation: {
        title: 'Navigation',
        accessibilitySettings: 'Accessibility Settings',
        supportPage: 'Support',
      },
    },
    support: {
      title: 'Support',
      subtitle: 'Need help? Reach out to our support team and we will assist you.',
      helpCenter: 'Help Center',
      helpCenterDesc: 'Browse FAQs, guides, and troubleshooting tips for RuralAccess AI.',
      contactUs: 'Contact Us',
      email: 'Email',
      phone: 'Phone',
    },
    accessibility: {
      title: 'Accessibility',
      subtitle: 'Accessibility features and settings',
    },
    auth: {
      welcomeBack: 'Welcome Back',
      signInToAccount: 'Sign in to your account',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign In',
      signingIn: 'Signing in...',
      noAccount: "Don't have an account?",
      signUp: 'Sign up',
      createAccount: 'Create Account',
      name: 'Full Name',
      confirmPassword: 'Confirm Password',
      register: 'Register',
      registering: 'Registering...',
      haveAccount: 'Already have an account?',
      loginSuccess: 'Login successful!',
      registerSuccess: 'Registration successful!',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      pageNotFound: 'Page Not Found',
      pageNotFoundDesc: 'The page you are looking for does not exist.',
    },
  },
  Telugu: {
    nav: {
      home: 'హోమ్',
      dashboard: 'డాష్‌బోర్డ్',
      lessons: 'పాఠాలు',
      aiTutor: 'AI ట్యూటర్',
      accessibility: 'అందుబాటు',
      support: 'సహాయం',
      settings: 'సెట్టింగులు',
      login: 'లాగిన్',
      logout: 'లాగౌట్',
      profile: 'ప్రొఫైల్',
    },
    voiceControl: {
      start: 'వాయిస్ కంట్రోల్ ప్రారంభించండి',
      listening: 'వినడం... ఇప్పుడే మాట్లాడండి',
      unrecognized: 'కమాండ్ గుర్తించబడలేదు',
      notSupported: 'ఈ బ్రౌజర్‌లో వాయిస్ కంట్రోల్ అందుబాటులో లేదు',
    },
    home: {
      welcome: 'స్వాగతం',
      brandName: 'రూరల్ యాక్సెస్ AI',
      tagline: 'AI-ఆధారిత విద్యతో గ్రామీణ సమాజాలకు శక్తినివ్వడం. మా తెలివైన ట్యూటరింగ్ సిస్టమ్‌తో ఎప్పుడైనా, ఎక్కడైనా నేర్చుకోండి.',
      getStarted: 'ప్రారంభించండి',
      tryAiTutor: 'AI ట్యూటర్ ప్రయత్నించండి',
      features: 'మా ఫీచర్లు',
      aiTutorTitle: 'AI ట్యూటర్',
      aiTutorDesc: 'మా తెలివైన AI ట్యూటర్‌తో మీ ప్రశ్నలకు తక్షణ సమాధానాలు పొందండి.',
      richContentTitle: 'సమృద్ధ కంటెంట్',
      richContentDesc: 'బహుళ విషయాలలో విస్తృత శ్రేణి పాఠాలను యాక్సెస్ చేయండి.',
      offlineTitle: 'ఆఫ్‌లైన్ యాక్సెస్',
      offlineDesc: 'మా ఆఫ్‌లైన్ మోడ్‌తో ఇంటర్నెట్ కనెక్టివిటీ లేకుండా నేర్చుకోండి.',
      accessibleTitle: 'అందుబాటులో',
      accessibleDesc: 'అన్ని అభ్యాసకుల కోసం అందుబాటు దృష్టిలో నిర్మించబడింది.',
      personalizedTitle: 'వ్యక్తిగతీకరించిన',
      personalizedDesc: 'మీ అవసరాలకు అనుగుణంగా అనుకూల అభ్యాస మార్గాలు.',
      mobileFirstTitle: 'మొబైల్ ఫస్ట్',
      mobileFirstDesc: 'ఏ పరికరంలోనైనా పనిచేసే రెస్పాన్సివ్ డిజైన్.',
      ctaTitle: 'నేర్చుకోవడం ప్రారంభించడానికి సిద్ధంగా ఉన్నారా?',
      ctaDesc: 'వేలాది మంది అభ్యాసకులతో చేరి ఈ రోజు మీ విద్యా ప్రయాణాన్ని మార్చుకోండి.',
      startLearning: 'ఇప్పుడే నేర్చుకోవడం ప్రారంభించండి',
    },
    dashboard: {
      title: 'డాష్‌బోర్డ్',
      subtitle: 'మీ అభ్యాస పురోగతి మరియు సాధనలను ట్రాక్ చేయండి',
      lessonsCompleted: 'పూర్తయిన పాఠాలు',
      certificatesEarned: 'సంపాదించిన సర్టిఫికేట్లు',
      progressRate: 'పురోగతి రేటు',
      recentActivity: 'ఇటీవలి కార్యాచరణ',
      learningGoals: 'అభ్యాస లక్ష్యాలు',
      activities: {
        completedMath: 'గణిత ప్రాథమికాల పాఠం పూర్తయింది',
        earnedBadge: 'సైన్స్ ఎక్స్‌ప్లోరర్ బ్యాడ్జ్ సంపాదించారు',
        startedEnglish: 'ఇంగ్లీష్ గ్రామర్ మాడ్యూల్ ప్రారంభించారు',
      },
      goals: {
        completeLessons: 'ఈ వారంలో 5 పాఠాలు పూర్తి చేయండి',
        practiceAI: 'రోజూ AI ట్యూటర్ సాధన చేయండి',
        achieveScore: 'అసెస్‌మెంట్లలో 90% సాధించండి',
      },
    },
    lessons: {
      title: 'పాఠాలు',
      subtitle: 'మా క్యూరేటెడ్ లెర్నింగ్ కంటెంట్‌ను అన్వేషించండి',
      startLesson: 'పాఠం ప్రారంభించండి',
      duration: 'వ్యవధి',
      level: 'స్థాయి',
      beginner: 'ప్రారంభకుడు',
      intermediate: 'మధ్యస్థం',
      advanced: 'అధునాతన',
      noLessons: 'ప్రస్తుతం పాఠాలు అందుబాటులో లేవు.',
    },
    aiTutor: {
      title: 'AI ట్యూటర్',
      subtitle: 'మీ అభ్యాస ప్రశ్నలకు తక్షణ సహాయం పొందండి',
      placeholder: 'మీ ప్రశ్న అడగండి...',
      send: 'పంపండి',
      sending: 'పంపుతోంది...',
      greeting: 'నమస్కారం! నేను మీ AI ట్యూటర్‌ను. ఈ రోజు మీకు ఎలా సహాయం చేయగలను?',
      errorMessage: 'క్షమించండి, లోపం సంభవించింది. దయచేసి తర్వాత మళ్ళీ ప్రయత్నించండి.',
      disabled: 'AI ట్యూటర్ నిలిపివేయబడింది',
      disabledMessage: 'AI ట్యూటర్ ప్రస్తుతం నిలిపివేయబడింది. మీరు సెట్టింగ్‌లలో దీన్ని ఎనేబుల్ చేయవచ్చు.',
    },
    settings: {
      title: 'సెట్టింగులు',
      subtitle: 'మీ ఖాతా మరియు అభ్యాస ప్రాధాన్యతలను నిర్వహించండి.',
      changesSaved: 'మార్పులు సేవ్ చేయబడ్డాయి',
      profile: {
        title: 'ప్రొఫైల్ సెట్టింగులు',
        name: 'పూర్తి పేరు',
        email: 'ఇమెయిల్',
        uploadAvatar: 'అవతార్ అప్‌లోడ్ చేయండి',
        removeAvatar: 'అవతార్ తొలగించండి',
      },
      learning: {
        title: 'అభ్యాస ప్రాధాన్యతలు',
        language: 'ప్రాధాన్య భాష',
        level: 'అభ్యాస స్థాయి',
        contentPreference: 'కంటెంట్ ప్రాధాన్యత',
        text: 'టెక్స్ట్',
        video: 'వీడియో',
        both: 'రెండూ',
      },
      aiTutorSettings: {
        title: 'AI ట్యూటర్ సెట్టింగులు',
        enabled: 'AI ట్యూటర్ ఎనేబుల్ చేయండి',
        answerStyle: 'సమాధాన శైలి',
        short: 'చిన్నది',
        detailed: 'వివరంగా',
        showChatHistory: 'చాట్ హిస్టరీ చూపించు',
        clearChatHistory: 'AI చాట్ హిస్టరీ క్లియర్ చేయండి',
        chatHistoryCleared: 'చాట్ హిస్టరీ క్లియర్ చేయబడింది',
      },
      notifications: {
        title: 'నోటిఫికేషన్ సెట్టింగులు',
        assignmentReminders: 'అసైన్‌మెంట్ రిమైండర్లు',
        newLessonNotifications: 'కొత్త పాఠ నోటిఫికేషన్లు',
        reminderFrequency: 'రిమైండర్ ఫ్రీక్వెన్సీ',
        daily: 'రోజూ',
        weekly: 'వారానికి',
        off: 'ఆఫ్',
      },
      themeAccessibility: {
        title: 'థీమ్ & అందుబాటు',
        theme: 'థీమ్',
        light: 'లైట్',
        dark: 'డార్క్',
        fontSize: 'ఫాంట్ సైజ్',
        small: 'చిన్నది',
        medium: 'మధ్యస్థం',
        large: 'పెద్దది',
        highContrast: 'హై కాంట్రాస్ట్',
        reduceMotion: 'మోషన్ తగ్గించు',
        lowPowerMode: 'తక్కువ పవర్ మోడ్',
        lowPowerModeDesc: 'పాత పరికరాలు లేదా తక్కువ బ్యాటరీ కోసం యానిమేషన్లను నిలిపివేస్తుంది.',
        voiceLanguage: 'వాయిస్ నావిగేషన్ భాష',
      },
      navigation: {
        title: 'నావిగేషన్',
        accessibilitySettings: 'అందుబాటు సెట్టింగులు',
        supportPage: 'సహాయం',
      },
    },
    support: {
      title: 'సహాయం',
      subtitle: 'సహాయం కావాలా? మా సపోర్ట్ టీమ్‌ని సంప్రదించండి మరియు మేము మీకు సహాయం చేస్తాము.',
      helpCenter: 'హెల్ప్ సెంటర్',
      helpCenterDesc: 'RuralAccess AI కోసం FAQలు, గైడ్‌లు మరియు ట్రబుల్‌షూటింగ్ చిట్కాలను బ్రౌజ్ చేయండి.',
      contactUs: 'మమ్మల్ని సంప్రదించండి',
      email: 'ఇమెయిల్',
      phone: 'ఫోన్',
    },
    accessibility: {
      title: 'అందుబాటు',
      subtitle: 'అందుబాటు ఫీచర్లు మరియు సెట్టింగులు',
    },
    auth: {
      welcomeBack: 'తిరిగి స్వాగతం',
      signInToAccount: 'మీ ఖాతాలో సైన్ ఇన్ చేయండి',
      email: 'ఇమెయిల్',
      password: 'పాస్‌వర్డ్',
      signIn: 'సైన్ ఇన్',
      signingIn: 'సైన్ ఇన్ అవుతోంది...',
      noAccount: 'ఖాతా లేదా?',
      signUp: 'సైన్ అప్',
      createAccount: 'ఖాతా సృష్టించండి',
      name: 'పూర్తి పేరు',
      confirmPassword: 'పాస్‌వర్డ్ నిర్ధారించండి',
      register: 'రిజిస్టర్',
      registering: 'రిజిస్టర్ అవుతోంది...',
      haveAccount: 'ఇప్పటికే ఖాతా ఉందా?',
      loginSuccess: 'లాగిన్ విజయవంతం!',
      registerSuccess: 'రిజిస్ట్రేషన్ విజయవంతం!',
    },
    common: {
      loading: 'లోడ్ అవుతోంది...',
      error: 'లోపం',
      success: 'విజయం',
      cancel: 'రద్దు చేయి',
      save: 'సేవ్ చేయి',
      pageNotFound: 'పేజీ కనుగొనబడలేదు',
      pageNotFoundDesc: 'మీరు వెతుకుతున్న పేజీ ఉనికిలో లేదు.',
    },
  },
  Hindi: {
    nav: {
      home: 'होम',
      dashboard: 'डैशबोर्ड',
      lessons: 'पाठ',
      aiTutor: 'AI ट्यूटर',
      accessibility: 'सुलभता',
      support: 'सहायता',
      settings: 'सेटिंग्स',
      login: 'लॉगिन',
      logout: 'लॉगआउट',
      profile: 'प्रोफाइल',
    },
    voiceControl: {
      start: 'वॉयस कंट्रोल शुरू करें',
      listening: 'सुन रहे हैं... अब बोलें',
      unrecognized: 'कमांड पहचाना नहीं गया',
      notSupported: 'इस ब्राउज़र पर वॉयस कंट्रोल उपलब्ध नहीं है',
    },
    home: {
      welcome: 'स्वागत है',
      brandName: 'रूरल एक्सेस AI',
      tagline: 'AI-संचालित शिक्षा के साथ ग्रामीण समुदायों को सशक्त बनाना। हमारी बुद्धिमान ट्यूटरिंग प्रणाली के साथ कभी भी, कहीं भी सीखें।',
      getStarted: 'शुरू करें',
      tryAiTutor: 'AI ट्यूटर आज़माएं',
      features: 'हमारी विशेषताएं',
      aiTutorTitle: 'AI ट्यूटर',
      aiTutorDesc: 'हमारे बुद्धिमान AI ट्यूटर के साथ अपने सवालों के तुरंत जवाब पाएं।',
      richContentTitle: 'समृद्ध सामग्री',
      richContentDesc: 'कई विषयों में पाठों की विस्तृत श्रृंखला तक पहुंच।',
      offlineTitle: 'ऑफलाइन एक्सेस',
      offlineDesc: 'हमारे ऑफलाइन मोड के साथ इंटरनेट कनेक्टिविटी के बिना सीखें।',
      accessibleTitle: 'सुलभ',
      accessibleDesc: 'सभी शिक्षार्थियों के लिए सुलभता को ध्यान में रखकर बनाया गया।',
      personalizedTitle: 'व्यक्तिगत',
      personalizedDesc: 'आपकी आवश्यकताओं के अनुरूप अनुकूली सीखने के रास्ते।',
      mobileFirstTitle: 'मोबाइल फर्स्ट',
      mobileFirstDesc: 'किसी भी डिवाइस पर काम करने वाला रेस्पॉन्सिव डिज़ाइन।',
      ctaTitle: 'सीखना शुरू करने के लिए तैयार हैं?',
      ctaDesc: 'हजारों शिक्षार्थियों से जुड़ें और आज ही अपनी शिक्षा यात्रा को बदलें।',
      startLearning: 'अभी सीखना शुरू करें',
    },
    dashboard: {
      title: 'डैशबोर्ड',
      subtitle: 'अपनी सीखने की प्रगति और उपलब्धियों को ट्रैक करें',
      lessonsCompleted: 'पूर्ण पाठ',
      certificatesEarned: 'अर्जित प्रमाणपत्र',
      progressRate: 'प्रगति दर',
      recentActivity: 'हालिया गतिविधि',
      learningGoals: 'सीखने के लक्ष्य',
      activities: {
        completedMath: 'गणित मूलभूत पाठ पूरा किया',
        earnedBadge: 'विज्ञान एक्सप्लोरर बैज अर्जित किया',
        startedEnglish: 'अंग्रेजी व्याकरण मॉड्यूल शुरू किया',
      },
      goals: {
        completeLessons: 'इस सप्ताह 5 पाठ पूरे करें',
        practiceAI: 'दैनिक AI ट्यूटर अभ्यास करें',
        achieveScore: 'मूल्यांकन में 90% प्राप्त करें',
      },
    },
    lessons: {
      title: 'पाठ',
      subtitle: 'हमारी क्यूरेटेड लर्निंग सामग्री का अन्वेषण करें',
      startLesson: 'पाठ शुरू करें',
      duration: 'अवधि',
      level: 'स्तर',
      beginner: 'शुरुआती',
      intermediate: 'मध्यवर्ती',
      advanced: 'उन्नत',
      noLessons: 'वर्तमान में कोई पाठ उपलब्ध नहीं है।',
    },
    aiTutor: {
      title: 'AI ट्यूटर',
      subtitle: 'अपने सीखने के सवालों पर तुरंत मदद पाएं',
      placeholder: 'अपना सवाल पूछें...',
      send: 'भेजें',
      sending: 'भेज रहा है...',
      greeting: 'नमस्ते! मैं आपका AI ट्यूटर हूं। आज मैं आपकी कैसे मदद कर सकता हूं?',
      errorMessage: 'क्षमा करें, एक त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।',
      disabled: 'AI ट्यूटर अक्षम',
      disabledMessage: 'AI ट्यूटर वर्तमान में अक्षम है। आप इसे सेटिंग्स में सक्षम कर सकते हैं।',
    },
    settings: {
      title: 'सेटिंग्स',
      subtitle: 'अपने खाते और सीखने की प्राथमिकताएं प्रबंधित करें।',
      changesSaved: 'परिवर्तन सहेजे गए',
      profile: {
        title: 'प्रोफाइल सेटिंग्स',
        name: 'पूरा नाम',
        email: 'ईमेल',
        uploadAvatar: 'अवतार अपलोड करें',
        removeAvatar: 'अवतार हटाएं',
      },
      learning: {
        title: 'सीखने की प्राथमिकताएं',
        language: 'पसंदीदा भाषा',
        level: 'सीखने का स्तर',
        contentPreference: 'सामग्री प्राथमिकता',
        text: 'टेक्स्ट',
        video: 'वीडियो',
        both: 'दोनों',
      },
      aiTutorSettings: {
        title: 'AI ट्यूटर सेटिंग्स',
        enabled: 'AI ट्यूटर सक्षम करें',
        answerStyle: 'उत्तर शैली',
        short: 'छोटा',
        detailed: 'विस्तृत',
        showChatHistory: 'चैट इतिहास दिखाएं',
        clearChatHistory: 'AI चैट इतिहास साफ़ करें',
        chatHistoryCleared: 'चैट इतिहास साफ़ किया गया',
      },
      notifications: {
        title: 'अधिसूचना सेटिंग्स',
        assignmentReminders: 'असाइनमेंट रिमाइंडर',
        newLessonNotifications: 'नए पाठ अधिसूचनाएं',
        reminderFrequency: 'रिमाइंडर आवृत्ति',
        daily: 'दैनिक',
        weekly: 'साप्ताहिक',
        off: 'बंद',
      },
      themeAccessibility: {
        title: 'थीम और सुलभता',
        theme: 'थीम',
        light: 'लाइट',
        dark: 'डार्क',
        fontSize: 'फ़ॉन्ट आकार',
        small: 'छोटा',
        medium: 'मध्यम',
        large: 'बड़ा',
        highContrast: 'उच्च कंट्रास्ट',
        reduceMotion: 'गति कम करें',
        lowPowerMode: 'लो पावर मोड',
        lowPowerModeDesc: 'पुरानी मशीनों या कम बैटरी के लिए एनिमेशन बंद करें।',
        voiceLanguage: 'वॉयस नेविगेशन भाषा',
      },
      navigation: {
        title: 'नेविगेशन',
        accessibilitySettings: 'सुलभता सेटिंग्स',
        supportPage: 'सहायता',
      },
    },
    support: {
      title: 'सहायता',
      subtitle: 'मदद चाहिए? हमारी सहायता टीम से संपर्क करें और हम आपकी सहायता करेंगे।',
      helpCenter: 'सहायता केंद्र',
      helpCenterDesc: 'RuralAccess AI के लिए FAQs, गाइड और समस्या निवारण सुझाव ब्राउज़ करें।',
      contactUs: 'हमसे संपर्क करें',
      email: 'ईमेल',
      phone: 'फोन',
    },
    accessibility: {
      title: 'सुलभता',
      subtitle: 'सुलभता सुविधाएं और सेटिंग्स',
    },
    auth: {
      welcomeBack: 'वापसी पर स्वागत',
      signInToAccount: 'अपने खाते में साइन इन करें',
      email: 'ईमेल',
      password: 'पासवर्ड',
      signIn: 'साइन इन',
      signingIn: 'साइन इन हो रहा है...',
      noAccount: 'खाता नहीं है?',
      signUp: 'साइन अप करें',
      createAccount: 'खाता बनाएं',
      name: 'पूरा नाम',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      register: 'रजिस्टर करें',
      registering: 'रजिस्टर हो रहा है...',
      haveAccount: 'पहले से खाता है?',
      loginSuccess: 'लॉगिन सफल!',
      registerSuccess: 'पंजीकरण सफल!',
    },
    common: {
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      cancel: 'रद्द करें',
      save: 'सहेजें',
      pageNotFound: 'पेज नहीं मिला',
      pageNotFoundDesc: 'जो पेज आप ढूंढ रहे हैं वह मौजूद नहीं है।',
    },
  },
  Spanish: {
    nav: {
      home: 'Inicio',
      dashboard: 'Panel',
      lessons: 'Lecciones',
      aiTutor: 'Tutor IA',
      accessibility: 'Accesibilidad',
      support: 'Soporte',
      settings: 'Configuración',
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      profile: 'Perfil',
    },
    voiceControl: {
      start: 'Iniciar control de voz',
      listening: 'Escuchando... hable ahora',
      unrecognized: 'Comando no reconocido',
      notSupported: 'El control de voz no está disponible en este navegador',
    },
    home: {
      welcome: 'Bienvenido a',
      brandName: 'RuralAccess AI',
      tagline: 'Empoderando comunidades rurales con educación impulsada por IA. Aprende en cualquier momento, en cualquier lugar con nuestro sistema de tutoría inteligente.',
      getStarted: 'Comenzar',
      tryAiTutor: 'Probar Tutor IA',
      features: 'Nuestras Características',
      aiTutorTitle: 'Tutor IA',
      aiTutorDesc: 'Obtén respuestas instantáneas a tus preguntas con nuestro tutor IA inteligente.',
      richContentTitle: 'Contenido Rico',
      richContentDesc: 'Accede a una amplia gama de lecciones en múltiples materias.',
      offlineTitle: 'Acceso Sin Conexión',
      offlineDesc: 'Aprende sin conectividad a internet con nuestro modo sin conexión.',
      accessibleTitle: 'Accesible',
      accessibleDesc: 'Construido pensando en la accesibilidad para todos los estudiantes.',
      personalizedTitle: 'Personalizado',
      personalizedDesc: 'Rutas de aprendizaje adaptativas a tus necesidades.',
      mobileFirstTitle: 'Móvil Primero',
      mobileFirstDesc: 'Diseño responsive que funciona en cualquier dispositivo.',
      ctaTitle: '¿Listo para Empezar a Aprender?',
      ctaDesc: 'Únete a miles de estudiantes y transforma tu viaje educativo hoy.',
      startLearning: 'Empezar a Aprender Ahora',
    },
    dashboard: {
      title: 'Panel',
      subtitle: 'Rastrea tu progreso de aprendizaje y logros',
      lessonsCompleted: 'Lecciones Completadas',
      certificatesEarned: 'Certificados Ganados',
      progressRate: 'Tasa de Progreso',
      recentActivity: 'Actividad Reciente',
      learningGoals: 'Metas de Aprendizaje',
      activities: {
        completedMath: 'Completó lección de Matemáticas Básicas',
        earnedBadge: 'Ganó insignia de Explorador de Ciencias',
        startedEnglish: 'Comenzó módulo de Gramática Inglesa',
      },
      goals: {
        completeLessons: 'Completar 5 lecciones esta semana',
        practiceAI: 'Practicar con tutor IA diariamente',
        achieveScore: 'Lograr 90% en evaluaciones',
      },
    },
    lessons: {
      title: 'Lecciones',
      subtitle: 'Explora nuestro contenido de aprendizaje curado',
      startLesson: 'Iniciar Lección',
      duration: 'Duración',
      level: 'Nivel',
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
      noLessons: 'No hay lecciones disponibles en este momento.',
    },
    aiTutor: {
      title: 'Tutor IA',
      subtitle: 'Obtén ayuda instantánea con tus preguntas de aprendizaje',
      placeholder: 'Haz tu pregunta...',
      send: 'Enviar',
      sending: 'Enviando...',
      greeting: '¡Hola! Soy tu tutor IA. ¿Cómo puedo ayudarte hoy?',
      errorMessage: 'Lo siento, encontré un error. Por favor intenta de nuevo más tarde.',
      disabled: 'Tutor IA Deshabilitado',
      disabledMessage: 'El Tutor IA está actualmente deshabilitado. Puedes habilitarlo en Configuración.',
    },
    settings: {
      title: 'Configuración',
      subtitle: 'Administra tu cuenta y preferencias de aprendizaje.',
      changesSaved: 'Cambios guardados',
      profile: {
        title: 'Configuración de Perfil',
        name: 'Nombre Completo',
        email: 'Correo Electrónico',
        uploadAvatar: 'Subir Avatar',
        removeAvatar: 'Eliminar avatar',
      },
      learning: {
        title: 'Preferencias de Aprendizaje',
        language: 'Idioma Preferido',
        level: 'Nivel de Aprendizaje',
        contentPreference: 'Preferencia de Contenido',
        text: 'Texto',
        video: 'Video',
        both: 'Ambos',
      },
      aiTutorSettings: {
        title: 'Configuración del Tutor IA',
        enabled: 'Habilitar Tutor IA',
        answerStyle: 'Estilo de Respuesta',
        short: 'Corto',
        detailed: 'Detallado',
        showChatHistory: 'Mostrar historial de chat',
        clearChatHistory: 'Limpiar historial de chat IA',
        chatHistoryCleared: 'Historial de chat limpiado',
      },
      notifications: {
        title: 'Configuración de Notificaciones',
        assignmentReminders: 'Recordatorios de tareas',
        newLessonNotifications: 'Notificaciones de nuevas lecciones',
        reminderFrequency: 'Frecuencia de Recordatorios',
        daily: 'Diario',
        weekly: 'Semanal',
        off: 'Apagado',
      },
      themeAccessibility: {
        title: 'Tema y Accesibilidad',
        theme: 'Tema',
        light: 'Claro',
        dark: 'Oscuro',
        fontSize: 'Tamaño de Fuente',
        small: 'Pequeño',
        medium: 'Mediano',
        large: 'Grande',
        highContrast: 'Alto contraste',
        reduceMotion: 'Reducir movimiento',
        lowPowerMode: 'Modo de bajo consumo',
        lowPowerModeDesc: 'Desactive las animaciones y reduzca el uso de recursos para dispositivos antiguos o batería baja.',
        voiceLanguage: 'Idioma de navegación por voz',
      },
      navigation: {
        title: 'Navegación',
        accessibilitySettings: 'Configuración de Accesibilidad',
        supportPage: 'Soporte',
      },
    },
    support: {
      title: 'Soporte',
      subtitle: '¿Necesitas ayuda? Contacta a nuestro equipo de soporte y te asistiremos.',
      helpCenter: 'Centro de Ayuda',
      helpCenterDesc: 'Explora FAQs, guías y consejos de solución de problemas para RuralAccess AI.',
      contactUs: 'Contáctanos',
      email: 'Correo',
      phone: 'Teléfono',
    },
    accessibility: {
      title: 'Accesibilidad',
      subtitle: 'Características y configuración de accesibilidad',
    },
    auth: {
      welcomeBack: 'Bienvenido de Nuevo',
      signInToAccount: 'Inicia sesión en tu cuenta',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      signIn: 'Iniciar Sesión',
      signingIn: 'Iniciando sesión...',
      noAccount: '¿No tienes cuenta?',
      signUp: 'Regístrate',
      createAccount: 'Crear Cuenta',
      name: 'Nombre Completo',
      confirmPassword: 'Confirmar Contraseña',
      register: 'Registrarse',
      registering: 'Registrando...',
      haveAccount: '¿Ya tienes cuenta?',
      loginSuccess: '¡Inicio de sesión exitoso!',
      registerSuccess: '¡Registro exitoso!',
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      pageNotFound: 'Página No Encontrada',
      pageNotFoundDesc: 'La página que buscas no existe.',
    },
  },
  French: {
    nav: {
      home: 'Accueil',
      dashboard: 'Tableau de bord',
      lessons: 'Leçons',
      aiTutor: 'Tuteur IA',
      accessibility: 'Accessibilité',
      support: 'Support',
      settings: 'Paramètres',
      login: 'Connexion',
      logout: 'Déconnexion',
      profile: 'Profil',
    },
    voiceControl: {
      start: 'Démarrer le contrôle vocal',
      listening: 'Écoute... parlez maintenant',
      unrecognized: 'Commande non reconnue',
      notSupported: "Le contrôle vocal n'est pas disponible sur ce navigateur",
    },
    home: {
      welcome: 'Bienvenue sur',
      brandName: 'RuralAccess AI',
      tagline: "Autonomiser les communautés rurales avec l'éducation alimentée par l'IA. Apprenez n'importe quand, n'importe où avec notre système de tutorat intelligent.",
      getStarted: 'Commencer',
      tryAiTutor: 'Essayer Tuteur IA',
      features: 'Nos Fonctionnalités',
      aiTutorTitle: 'Tuteur IA',
      aiTutorDesc: 'Obtenez des réponses instantanées à vos questions avec notre tuteur IA intelligent.',
      richContentTitle: 'Contenu Riche',
      richContentDesc: 'Accédez à une large gamme de leçons dans plusieurs matières.',
      offlineTitle: 'Accès Hors Ligne',
      offlineDesc: 'Apprenez sans connexion internet avec notre mode hors ligne.',
      accessibleTitle: 'Accessible',
      accessibleDesc: "Conçu avec l'accessibilité à l'esprit pour tous les apprenants.",
      personalizedTitle: 'Personnalisé',
      personalizedDesc: "Parcours d'apprentissage adaptatifs à vos besoins.",
      mobileFirstTitle: 'Mobile First',
      mobileFirstDesc: 'Design responsive qui fonctionne sur tous les appareils.',
      ctaTitle: "Prêt à Commencer l'Apprentissage?",
      ctaDesc: "Rejoignez des milliers d'apprenants et transformez votre parcours éducatif aujourd'hui.",
      startLearning: 'Commencer à Apprendre',
    },
    dashboard: {
      title: 'Tableau de bord',
      subtitle: 'Suivez votre progression et vos réalisations',
      lessonsCompleted: 'Leçons Terminées',
      certificatesEarned: 'Certificats Obtenus',
      progressRate: 'Taux de Progression',
      recentActivity: 'Activité Récente',
      learningGoals: "Objectifs d'Apprentissage",
      activities: {
        completedMath: 'Terminé la leçon Bases des Mathématiques',
        earnedBadge: "Obtenu le badge Explorateur de Sciences",
        startedEnglish: 'Commencé le module Grammaire Anglaise',
      },
      goals: {
        completeLessons: 'Terminer 5 leçons cette semaine',
        practiceAI: 'Pratiquer avec le tuteur IA quotidiennement',
        achieveScore: 'Atteindre 90% aux évaluations',
      },
    },
    lessons: {
      title: 'Leçons',
      subtitle: "Explorez notre contenu d'apprentissage sélectionné",
      startLesson: 'Commencer la Leçon',
      duration: 'Durée',
      level: 'Niveau',
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé',
      noLessons: 'Aucune leçon disponible pour le moment.',
    },
    aiTutor: {
      title: 'Tuteur IA',
      subtitle: "Obtenez une aide instantanée pour vos questions d'apprentissage",
      placeholder: 'Posez votre question...',
      send: 'Envoyer',
      sending: 'Envoi...',
      greeting: "Bonjour! Je suis votre tuteur IA. Comment puis-je vous aider aujourd'hui?",
      errorMessage: "Désolé, j'ai rencontré une erreur. Veuillez réessayer plus tard.",
      disabled: 'Tuteur IA Désactivé',
      disabledMessage: 'Le Tuteur IA est actuellement désactivé. Vous pouvez le réactiver dans les Paramètres.',
    },
    settings: {
      title: 'Paramètres',
      subtitle: "Gérez votre compte et vos préférences d'apprentissage.",
      changesSaved: 'Modifications enregistrées',
      profile: {
        title: 'Paramètres du Profil',
        name: 'Nom Complet',
        email: 'Email',
        uploadAvatar: "Télécharger l'Avatar",
        removeAvatar: "Supprimer l'avatar",
      },
      learning: {
        title: "Préférences d'Apprentissage",
        language: 'Langue Préférée',
        level: "Niveau d'Apprentissage",
        contentPreference: 'Préférence de Contenu',
        text: 'Texte',
        video: 'Vidéo',
        both: 'Les deux',
      },
      aiTutorSettings: {
        title: 'Paramètres Tuteur IA',
        enabled: 'Activer Tuteur IA',
        answerStyle: 'Style de Réponse',
        short: 'Court',
        detailed: 'Détaillé',
        showChatHistory: "Afficher l'historique du chat",
        clearChatHistory: "Effacer l'historique du chat IA",
        chatHistoryCleared: 'Historique du chat effacé',
      },
      notifications: {
        title: 'Paramètres de Notification',
        assignmentReminders: 'Rappels de devoirs',
        newLessonNotifications: 'Notifications de nouvelles leçons',
        reminderFrequency: 'Fréquence des Rappels',
        daily: 'Quotidien',
        weekly: 'Hebdomadaire',
        off: 'Désactivé',
      },
      themeAccessibility: {
        title: 'Thème et Accessibilité',
        theme: 'Thème',
        light: 'Clair',
        dark: 'Sombre',
        fontSize: 'Taille de Police',
        small: 'Petit',
        medium: 'Moyen',
        large: 'Grand',
        highContrast: 'Contraste élevé',
        reduceMotion: 'Réduire les animations',
        lowPowerMode: 'Mode économie d\'énergie',
        lowPowerModeDesc: 'Désactivez les animations et réduisez l\'utilisation des ressources pour les anciens appareils ou la batterie faible.',
        voiceLanguage: 'Langue de navigation vocale',
      },
      navigation: {
        title: 'Navigation',
        accessibilitySettings: "Paramètres d'Accessibilité",
        supportPage: 'Support',
      },
    },
    support: {
      title: 'Support',
      subtitle: "Besoin d'aide? Contactez notre équipe de support et nous vous aiderons.",
      helpCenter: "Centre d'Aide",
      helpCenterDesc: "Parcourez les FAQs, guides et conseils de dépannage pour RuralAccess AI.",
      contactUs: 'Nous Contacter',
      email: 'Email',
      phone: 'Téléphone',
    },
    accessibility: {
      title: 'Accessibilité',
      subtitle: "Fonctionnalités et paramètres d'accessibilité",
    },
    auth: {
      welcomeBack: 'Bon Retour',
      signInToAccount: 'Connectez-vous à votre compte',
      email: 'Email',
      password: 'Mot de passe',
      signIn: 'Se Connecter',
      signingIn: 'Connexion en cours...',
      noAccount: "Pas de compte?",
      signUp: "S'inscrire",
      createAccount: 'Créer un Compte',
      name: 'Nom Complet',
      confirmPassword: 'Confirmer le Mot de passe',
      register: "S'inscrire",
      registering: 'Inscription en cours...',
      haveAccount: 'Déjà un compte?',
      loginSuccess: 'Connexion réussie!',
      registerSuccess: 'Inscription réussie!',
    },
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Enregistrer',
      pageNotFound: 'Page Non Trouvée',
      pageNotFoundDesc: "La page que vous cherchez n'existe pas.",
    },
  },
};

export default translations;
