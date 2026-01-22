// Global variables
let mode = "normal";

// Initialize on page load
window.addEventListener('load', function() {
  // Load user progress first (must load before displaying lessons)
  loadUserProgress();
  
  // Load and display user information
  loadUserInfo();
  
  // Load and display current lesson
  displayCurrentLesson();
  
  // Update progress summary
  updateProgressSummary();
});

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

// Send question to AI tutor
function askAI() {
  const questionInput = document.getElementById("question");
  const question = questionInput.value.trim();
  
  if (question === '') {
    alert('Please enter a question');
    return;
  }
  
  // Add user message to chat
  addMessage('You: ' + question);
  
  // Clear input
  questionInput.value = '';
  
  // Send request to backend
  fetch("http://127.0.0.1:5000/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      question: question,
      online: navigator.onLine,
      mode: mode
    })
  })
  .then(res => res.json())
  .then(data => {
    addMessage('AI Tutor: ' + data.answer);
  })
  .catch(error => {
    addMessage('AI Tutor: I\'m currently offline. Please check your connection or review your lesson materials.');
  });
}

// Add message to chat
function addMessage(text) {
  const messagesDiv = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  
  const parts = text.split(': ');
  if (parts.length > 1) {
    messageDiv.innerHTML = '<strong>' + parts[0] + ':</strong> ' + parts.slice(1).join(': ');
  } else {
    messageDiv.textContent = text;
  }
  
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Handle Enter key in chat input
function handleEnterKey(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    askAI();
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
  
  addMessage('AI Tutor: Mode changed to ' + modeNames[selectedMode]);
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
  
  if (section === 'lessons') {
    addMessage('AI Tutor: You have ' + getUserProgressSummary().total + ' lessons available. Keep learning!');
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
