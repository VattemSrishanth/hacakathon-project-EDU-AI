// Global variables
let mode = "normal";

// Initialize on page load
window.addEventListener('load', function() {
  // Apply dark mode if enabled
  applyDarkModeIfEnabled();

  // Apply low data mode if enabled
  applyLowDataModeIfEnabled();
  
  // Load user progress first (must load before displaying lessons)
  loadUserProgress();
  
  // Load and display user information
  loadUserInfo();

  // Toggle auth UI visibility based on login state
  updateAuthUI();

  // Register service worker for offline support
  registerServiceWorker();

  // Network status helper
  setupNetworkStatusUI();

  // Offline lessons download UI
  setupOfflineDownloads();

  // Video fallback for low internet/offline
  setupVideoFallback();
  
  // Load and display current lesson
  displayCurrentLesson();
  
  // Update progress summary
  updateProgressSummary();
});

const OFFLINE_CACHE_NAME = 'edu-ai-cache-v1';

// Low data mode (reduced network usage)
function isLowDataMode() {
  return localStorage.getItem('lowDataMode') === 'true';
}

function applyLowDataModeIfEnabled() {
  const lowDataEnabled = isLowDataMode();
  if (lowDataEnabled) {
    document.body.classList.add('low-data-mode');
  } else {
    document.body.classList.remove('low-data-mode');
  }
}

function toggleLowDataMode() {
  const enabled = document.getElementById('lowDataToggle')?.checked === true;
  localStorage.setItem('lowDataMode', enabled ? 'true' : 'false');
  applyLowDataModeIfEnabled();
  updateNetworkStatusUI();
}

// Offline/online status banner
function setupNetworkStatusUI() {
  const container = document.querySelector('.main-content');
  if (!container) return;

  let status = document.getElementById('networkStatus');
  if (!status) {
    status = document.createElement('div');
    status.id = 'networkStatus';
    status.className = 'network-status';
    container.prepend(status);
  }

  updateNetworkStatusUI();
  window.addEventListener('online', updateNetworkStatusUI);
  window.addEventListener('offline', updateNetworkStatusUI);
}

function updateNetworkStatusUI() {
  const status = document.getElementById('networkStatus');
  if (!status) return;

  const online = navigator.onLine;
  const lowData = isLowDataMode();

  if (!online) {
    status.textContent = 'Offline mode: using cached lessons and offline AI support.';
    status.classList.add('is-offline');
    status.classList.remove('is-lowdata');
    return;
  }

  if (lowData) {
    status.textContent = 'Low data mode enabled: reduced network usage.';
    status.classList.remove('is-offline');
    status.classList.add('is-lowdata');
    return;
  }

  status.textContent = 'Online: full learning experience available.';
  status.classList.remove('is-offline');
  status.classList.remove('is-lowdata');
}

// Register service worker for offline-first support
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('sw.js').catch(() => {
    // Ignore registration errors for local/dev use
  });
}

// Offline downloads for lessons
function setupOfflineDownloads() {
  const list = document.getElementById('offlineDownloadsList');
  const status = document.getElementById('offlineDownloadsStatus');
  if (!list || typeof getLessons !== 'function') return;

  const lessonsList = getLessons();
  if (!Array.isArray(lessonsList) || lessonsList.length === 0) return;

  const downloadAll = document.createElement('button');
  downloadAll.className = 'button btn-small';
  downloadAll.type = 'button';
  downloadAll.textContent = 'Download All Lessons';
  downloadAll.addEventListener('click', async function () {
    if (status) status.textContent = 'Downloading lessons for offline use...';
    for (const lesson of lessonsList) {
      if (!lesson.videoFile) continue;
      await cacheAsset(lesson.videoFile);
    }
    if (status) status.textContent = 'Offline downloads completed.';
  });
  list.appendChild(downloadAll);

  lessonsList.forEach(lesson => {
    const item = document.createElement('div');
    item.className = 'offline-item';

    const meta = document.createElement('div');
    meta.className = 'offline-meta';
    const title = document.createElement('div');
    title.className = 'offline-title';
    title.textContent = lesson.title || 'Lesson';
    const duration = document.createElement('div');
    duration.className = 'offline-duration';
    duration.textContent = (lesson.duration ? lesson.duration + ' min' : 'Duration N/A');
    meta.appendChild(title);
    meta.appendChild(duration);

    const btn = document.createElement('button');
    btn.className = 'button btn-small';
    btn.type = 'button';
    btn.textContent = 'Download';
    btn.addEventListener('click', async function () {
      if (!lesson.videoFile) {
        if (status) status.textContent = 'Offline video not available for this lesson.';
        return;
      }
      if (status) status.textContent = 'Downloading ' + (lesson.title || 'lesson') + '...';
      const ok = await cacheAsset(lesson.videoFile);
      if (status) {
        status.textContent = ok ? 'Saved for offline use.' : 'Download failed. Check connection.';
      }
    });

    item.appendChild(meta);
    item.appendChild(btn);
    list.appendChild(item);
  });
}

async function cacheAsset(url) {
  if (!('caches' in window)) return false;
  try {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    const absoluteUrl = new URL(url, window.location.href).toString();
    await cache.add(absoluteUrl);
    return true;
  } catch (e) {
    return false;
  }
}

// Video fallback for low internet and offline
function setupVideoFallback() {
  const video = document.getElementById('lessonVideo');
  const caption = document.querySelector('.video-caption');
  if (!video || !caption) return;

  const applyState = () => {
    const offline = !navigator.onLine;
    const lowData = isLowDataMode();
    if (offline || lowData) {
      video.style.display = 'none';
      caption.textContent = offline
        ? 'Offline: sign language video unavailable. Please view text lessons.'
        : 'Low data mode: video disabled to save bandwidth.';
    } else {
      video.style.display = '';
      caption.textContent = 'Sign language interpretation of the Fractions lesson';
    }
  };

  applyState();
  window.addEventListener('online', applyState);
  window.addEventListener('offline', applyState);
}

// Check whether the user is logged in
function isLoggedIn() {
  return !!localStorage.getItem('loginTime');
}

// Toggle auth UI (login/signup vs user icon)
function updateAuthUI() {
  const loggedIn = isLoggedIn();
  const userMenus = document.querySelectorAll('.user-menu');
  const authActions = document.querySelectorAll('.auth-actions');

  userMenus.forEach(menu => {
    menu.style.display = loggedIn ? 'inline-block' : 'none';
  });

  authActions.forEach(actions => {
    actions.style.display = loggedIn ? 'none' : 'flex';
  });
}

// Apply dark mode if it was previously enabled
function applyDarkModeIfEnabled() {
  const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
  if (darkModeEnabled) {
    document.body.classList.add('dark-mode');
  }
}

// Load user information from localStorage
// The user's name and email are stored during login/registration
// Name is stored in 'userFullName' key, email in 'userEmail' key
function loadUserInfo() {
  // Retrieve user data from localStorage (stored during registration/login)
  const userFullName = localStorage.getItem('userFullName');
  const userEmail = localStorage.getItem('userEmail');
  
  // Determine display name: use full name if available, otherwise 'User'
  let displayName = 'User';
  let firstName = 'User';
  
  if (userFullName && userFullName.trim() !== '') {
    displayName = userFullName;
    // Extract first name for welcome message
    firstName = userFullName.split(' ')[0];
  }
  
  // Update user panel with name
  const panelUserName = document.getElementById('panelUserName');
  if (panelUserName) {
    panelUserName.textContent = displayName;
  }
  
  // Update user panel with email (hide if not available)
  const panelUserEmail = document.getElementById('panelUserEmail');
  const emailInfo = document.getElementById('emailInfo');
  if (userEmail && userEmail.trim() !== '') {
    if (panelUserEmail) {
      panelUserEmail.textContent = userEmail;
    }
    if (emailInfo) {
      emailInfo.style.display = 'flex';
    }
  } else {
    // Hide email field if not available
    if (emailInfo) {
      emailInfo.style.display = 'none';
    }
  }
  
  // Update welcome message with first name
  const welcomeNameElement = document.getElementById('welcomeName');
  if (welcomeNameElement) {
    welcomeNameElement.textContent = firstName;
  }
}

// Display current lesson on dashboard
function displayCurrentLesson() {
  const currentLesson = getCurrentLesson();
  
  if (!currentLesson) {
    console.error('No lessons available');
    return;
  }
  
  // Update lesson info in the lesson section
  const lessonSection = document.querySelector('.lesson-info');
  if (lessonSection) {
    lessonSection.innerHTML = `
      <h4>${currentLesson.title}</h4>
      <p>${currentLesson.description}</p>
      <button class="button" onclick="startLesson(${currentLesson.id})">Continue Lesson</button>
    `;
  }
  
  // Update video
  const videoElement = document.getElementById('lessonVideo');
  if (videoElement) {
    videoElement.src = currentLesson.videoFile;
  }
}

// Start or continue a lesson
function startLesson(lessonId) {
  setCurrentLesson(lessonId);
  const lesson = getLessonById(lessonId);
  
  if (lesson) {
    const video = document.getElementById('lessonVideo');
    if (video) {
      video.scrollIntoView({ behavior: 'smooth' });
      video.play();
    }
  }
}

// Update progress summary display
function updateProgressSummary() {
  const progress = getUserProgressSummary();
  
  // Update progress items on dashboard
  const progressItems = document.querySelectorAll('.progress-item');
  if (progressItems.length >= 3) {
    progressItems[0].innerHTML = `
      <span class="label">Lessons Completed:</span>
      <span class="value">${progress.completed} / ${progress.total}</span>
    `;
    progressItems[1].innerHTML = `
      <span class="label">Total Learning Time:</span>
      <span class="value">${progress.totalHours} hours</span>
    `;
    progressItems[2].innerHTML = `
      <span class="label">Current Progress:</span>
      <span class="value">${progress.percentage}%</span>
    `;
  }
}



// Set accessibility mode
function setMode(selectedMode) {
  mode = selectedMode;
  
  const modeNames = {
    'normal': 'Normal Mode',
    'deaf': 'Deaf Mode',
    'speech': 'Speech-Impaired Mode'
  };
  
  document.getElementById('currentModeText').textContent = modeNames[selectedMode];
  localStorage.setItem('accessibilityMode', selectedMode);
}

// Navigate to sections
function navigateTo(section) {
  // Prevent default link behavior
  if (event) {
    event.preventDefault();
  }
  
  // Remove active class from all nav items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  
  // Add active to clicked item
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }
  
  // Show/hide sections
  const accessibilitySection = document.getElementById('accessibilitySection');
  
  if (section === 'accessibility') {
    accessibilitySection.style.display = 'block';
    accessibilitySection.scrollIntoView({ behavior: 'smooth' });
  } else {
    accessibilitySection.style.display = 'none';
  }
  

}

// Continue learning
function continueLearning() {
  const currentLesson = getCurrentLesson();
  if (currentLesson) {
    startLesson(currentLesson.id);
  }
}

// Logout
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('loginTime');
    window.location.href = 'login.html';
  }
}

// Load saved accessibility mode
const savedMode = localStorage.getItem('accessibilityMode');
if (savedMode) {
  mode = savedMode;
  const modeNames = {
    'normal': 'Normal Mode',
    'deaf': 'Deaf Mode',
    'speech': 'Speech-Impaired Mode'
  };
  document.addEventListener('DOMContentLoaded', function() {
    const radio = document.querySelector('input[name="mode"][value="' + savedMode + '"]');
    if (radio) radio.checked = true;
    
    const modeText = document.getElementById('currentModeText');
    if (modeText) modeText.textContent = modeNames[savedMode];
  });
}


// --- AI Tutor Frontend Logic ---
document.addEventListener('DOMContentLoaded', function() {
  const askBtn = document.getElementById('aiTutorAskBtn');
  const questionInput = document.getElementById('aiTutorQuestion');
  const responseDiv = document.getElementById('aiTutorResponse');

  if (askBtn && questionInput && responseDiv) {
    askBtn.addEventListener('click', function() {
      const question = questionInput.value.trim();
      responseDiv.textContent = '';
      if (!question || question.length < 2) {
        responseDiv.textContent = 'Please enter a clear question.';
        responseDiv.style.color = 'red';
        return;
      }
      askBtn.disabled = true;
      responseDiv.textContent = 'Thinking...';
      responseDiv.style.color = '#333';

      // Use accessibility mode from global variable
      const currentMode = mode || 'normal';

      // Low internet support: use offline mode when needed
      const online = navigator.onLine && !isLowDataMode();

      fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: question,
          online: online,
          mode: currentMode
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.answer) {
          const prefix = online ? '' : '[Offline] ';
          responseDiv.textContent = prefix + data.answer;
          responseDiv.style.color = '#333';
        } else {
          responseDiv.textContent = 'No answer received.';
          responseDiv.style.color = 'red';
        }
      })
      .catch(err => {
        responseDiv.textContent = 'Offline or low connectivity. Please try again later.';
        responseDiv.style.color = 'red';
      })
      .finally(() => {
        askBtn.disabled = false;
      });
    });
  }
});

// --- Premium Motion Enhancements (non-breaking) ---
// Uses CSS hooks added in style.css. Safe to run on every page.
document.addEventListener('DOMContentLoaded', function() {
  try {
    enableMotionEnhancements();
  } catch (e) {
    // Silently ignore motion errors to avoid breaking core flows.
  }
});

function enableMotionEnhancements() {
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  if (document.body) {
    document.body.classList.add('js-motion');
  }

  const revealSelectors = [
    '.section',
    '.dashboard-card',
    '.lesson-card',
    '.course-module',
    '.settings-container',
    '.chat-box',
    '#aiTutorSection',
    '.progress-item',
    '.radio-option'
  ];

  const elements = Array.from(document.querySelectorAll(revealSelectors.join(',')));
  if (elements.length === 0) return;

  // Add reveal class + gentle stagger without touching markup.
  const revealTargets = [];
  elements.forEach((el, idx) => {
    if (!(el instanceof HTMLElement)) return;
    if (el.classList.contains('reveal')) return;
    el.classList.add('reveal');
    el.style.transitionDelay = Math.min(idx * 45, 240) + 'ms';
    revealTargets.push(el);
  });

  if (revealTargets.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    revealTargets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const target = entry.target;
      if (target && target.classList) {
        target.classList.add('is-visible');
      }
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

  revealTargets.forEach(el => observer.observe(el));
}
