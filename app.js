// DOM Element Selectors
const screens = document.querySelectorAll('.screen');
const enterStudyBtn = document.getElementById('enter-study-btn');
const yearCards = document.querySelectorAll('.year-card');
const backToLandingBtn = document.getElementById('back-to-landing-btn');
const backToYearsBtn = document.getElementById('back-to-years-btn');
const selectedYearTitle = document.getElementById('selected-year-title');
const subjectList = document.getElementById('subject-list');

// Quiz & Result Screen Selectors
const sessionInfo = document.getElementById('session-info');
const progressText = document.getElementById('progress-text');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const quitSessionBtn = document.getElementById('quit-session-btn');
const retryMissedBtn = document.getElementById('retry-missed-btn');
const missedCountEl = document.getElementById('missed-count');
const finalScore = document.getElementById('final-score');
const timerDisplay = document.getElementById('timer-display');
const scorePercentageEl = document.getElementById('score-percentage');
const progressBarFillEl = document.getElementById('progress-bar-fill');
const reviewContainer = document.getElementById('review-container');

// Theme Toggle Selector
const themeToggleBtn = document.getElementById('theme-toggle-btn');

// App State
let currentYear = null;
let currentSubject = '';
let currentMode = 'study';
let questions = [];
let userAnswers = []; // Tracks user option picks in Quiz Mode
let missedQuestions = [];
let currentQuestionIndex = 0;
let userScore = 0;
let studyAnsweredCount = 0;

// Timer & Auto-scroll State
let timerInterval = null;
let timeRemaining = 3600; // 60 Minutes
let autoScrollTimer = null;

// Manifest data mapping years to available subjects
const manifestData = {
  "1": ["I-D-A", "MED-PRO", "F-N-S", "I-D-A-Khmer"],
  "2": [],
  "3": [],
  "4": [],
  "5": [],
  "6": ["MED-PRO"]
};

// --- Theme Toggle Logic ---
function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeToggleBtn) themeToggleBtn.textContent = '☀️ Light';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeToggleBtn) themeToggleBtn.textContent = '🌙 Dark';
  }
}

const savedTheme = localStorage.getItem('app_theme') || 'dark';
applyTheme(savedTheme);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const newTheme = isLight ? 'dark' : 'light';
    applyTheme(newTheme);
    localStorage.setItem('app_theme', newTheme);
  });
}

// Helper: Generates unique key for local storage per year & subject
function getStorageKey() {
  return `missed_y${currentYear}_${currentSubject.toLowerCase()}`;
}

// --- Fisher-Yates Shuffle Algorithm ---
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// --- Cancel Auto-scroll on User Manual Input ---
function cancelAutoScroll() {
  if (autoScrollTimer) {
    clearTimeout(autoScrollTimer);
    autoScrollTimer = null;
  }
}

window.addEventListener('wheel', cancelAutoScroll);
window.addEventListener('touchmove', cancelAutoScroll);
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Space'].includes(e.code)) {
    cancelAutoScroll();
  }
});

// --- Custom Promise-Based Confirm Modal ---
function showCustomConfirm() {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');

    if (!modal) return resolve(true);

    modal.classList.remove('hidden');

    function handleConfirm() {
      cleanup();
      resolve(true);
    }

    function handleCancel() {
      cleanup();
      resolve(false);
    }

    function cleanup() {
      modal.classList.add('hidden');
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
    }

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
  });
}

// --- Warn User Before Refreshing Active Session ---
window.addEventListener('beforeunload', (e) => {
  const quizScreen = document.getElementById('quiz-screen');
  if (quizScreen && !quizScreen.classList.contains('hidden')) {
    e.preventDefault();
    e.returnValue = ''; // Standard browser refresh prompt
  }
});

// --- Navigation & Session Storage State ---
function navigateTo(screenId, isBackAction = false) {
  clearInterval(timerInterval);
  cancelAutoScroll();

  screens.forEach(screen => screen.classList.add('hidden'));
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }

  if (!isBackAction) {
    history.pushState({ screenId: screenId }, '');
  }

  // Save location to sessionStorage (fallback active quiz to subject screen on hard refresh)
  if (screenId === 'quiz-screen' || screenId === 'result-screen') {
    sessionStorage.setItem('lastScreen', 'subject-screen');
  } else {
    sessionStorage.setItem('lastScreen', screenId);
  }
}

// --- Intercept Browser Back Button & Alt + Left Arrow ---
window.addEventListener('popstate', async (event) => {
  const quizScreen = document.getElementById('quiz-screen');
  const isQuizActive = quizScreen && !quizScreen.classList.contains('hidden');

  if (isQuizActive) {
    history.pushState({ screenId: 'quiz-screen' }, '');

    const isConfirmed = await showCustomConfirm();
    if (isConfirmed) {
      clearInterval(timerInterval);
      cancelAutoScroll();
      navigateTo('subject-screen');
    }
  } else {
    if (event.state && event.state.screenId) {
      navigateTo(event.state.screenId, true);
    } else {
      navigateTo('landing-screen', true);
    }
  }
});

// --- Restore Screen State on Page Refresh ---
window.addEventListener('DOMContentLoaded', () => {
  const savedScreen = sessionStorage.getItem('lastScreen');
  const savedYear = sessionStorage.getItem('lastYear');

  if (savedYear) {
    currentYear = savedYear;
  }

  if (savedScreen === 'subject-screen' && currentYear) {
    selectedYearTitle.textContent = `Year ${currentYear} Subjects`;
    loadSubjectsForYear(currentYear);
    navigateTo('subject-screen');
  } else if (savedScreen === 'year-screen') {
    navigateTo('year-screen');
  } else {
    navigateTo('landing-screen');
  }
});

// --- Navigation & Exit Action Event Listeners ---
enterStudyBtn.addEventListener('click', () => navigateTo('year-screen'));

yearCards.forEach(card => {
  card.addEventListener('click', () => {
    currentYear = card.getAttribute('data-year');
    sessionStorage.setItem('lastYear', currentYear);
    selectedYearTitle.textContent = `Year ${currentYear} Subjects`;
    loadSubjectsForYear(currentYear);
    navigateTo('subject-screen');
  });
});

if (backToLandingBtn) {
  backToLandingBtn.addEventListener('click', () => navigateTo('landing-screen'));
}

if (backToYearsBtn) {
  backToYearsBtn.addEventListener('click', () => navigateTo('year-screen'));
}

// Return Button: Navigates back to Subject Selection for active year
if (restartBtn) {
  restartBtn.addEventListener('click', () => {
    if (currentYear) {
      selectedYearTitle.textContent = `Year ${currentYear} Subjects`;
      loadSubjectsForYear(currentYear);
      navigateTo('subject-screen');
    } else {
      navigateTo('year-screen');
    }
  });
}

if (quitSessionBtn) {
  quitSessionBtn.addEventListener('click', async () => {
    const isConfirmed = await showCustomConfirm();
    if (isConfirmed) {
      clearInterval(timerInterval);
      cancelAutoScroll();
      navigateTo('subject-screen');
    }
  });
}

// --- Subject Cards Rendering ---
function loadSubjectsForYear(year) {
  subjectList.innerHTML = '';
  const subjects = manifestData[year] || [];
  
  subjects.forEach(subject => {
    const storageKey = `missed_y${year}_${subject.toLowerCase()}`;
    const savedMissed = localStorage.getItem(storageKey);
    const missedCount = savedMissed ? JSON.parse(savedMissed).length : 0;

    const subjectCard = document.createElement('div');
    subjectCard.classList.add('subject-card');
    
    subjectCard.innerHTML = `
      <h3>${subject}</h3>
      ${missedCount > 0 ? `<p class="missed-badge">⚠️ ${missedCount} saved missed question${missedCount > 1 ? 's' : ''}</p>` : ''}
      
      <div class="subject-actions">
        <button class="btn study-btn" onclick="startSession('${subject}', 'study')">📖 Study All</button>
        <button class="btn quiz-btn" onclick="startSession('${subject}', 'quiz')">📝 Quiz</button>
      </div>

      ${missedCount > 0 ? `
        <button class="btn study-missed-btn" onclick="startMissedSession('${subject}')">🎯 Review Missed (${missedCount})</button>
        <button class="btn clear-btn" onclick="clearSavedMissed('${subject}')">🗑️ Clear Saved Missed</button>
      ` : ''}
    `;
    
    subjectList.appendChild(subjectCard);
  });
}

// --- Launch Session with Only Saved Missed Questions ---
function startMissedSession(subjectName) {
  currentSubject = subjectName;
  currentMode = 'study';
  currentQuestionIndex = 0;
  userScore = 0;
  studyAnsweredCount = 0;

  const savedMissed = localStorage.getItem(getStorageKey());
  if (!savedMissed) return;

  const rawMissed = JSON.parse(savedMissed);
  missedQuestions = [...rawMissed];

  if (sessionInfo) {
    sessionInfo.textContent = `Year ${currentYear} - ${subjectName} (REVIEW MISSED MODE)`;
  }

  questions = shuffleArray(rawMissed).map(q => {
    const originalCorrectText = q.options[q.correctIndex];
    const shuffledOptions = shuffleArray(q.options);
    const newCorrectIndex = shuffledOptions.indexOf(originalCorrectText);

    return {
      ...q,
      options: shuffledOptions,
      correctIndex: newCorrectIndex
    };
  });

  navigateTo('quiz-screen');
  renderStudyMode();
}

function clearSavedMissed(subjectName) {
  currentSubject = subjectName;
  localStorage.removeItem(getStorageKey());
  loadSubjectsForYear(currentYear);
}

// --- 60-Minute Countdown Timer for Quiz Mode ---
function startQuizTimer() {
  clearInterval(timerInterval);
  timeRemaining = 3600; // 60 minutes
  updateTimerUI();

  if (timerDisplay) timerDisplay.classList.remove('hidden');

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerUI();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      alert("⏱️ Time is up! Submitting your quiz now.");
      finishQuiz();
    }
  }, 1000);
}

function updateTimerUI() {
  if (!timerDisplay) return;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  const formattedMins = String(minutes).padStart(2, '0');
  const formattedSecs = String(seconds).padStart(2, '0');
  
  timerDisplay.textContent = `⏱️ ${formattedMins}:${formattedSecs}`;
}

// --- Session Initialization ---
async function startSession(subjectName, mode) {
  currentSubject = subjectName;
  currentMode = mode;
  currentQuestionIndex = 0;
  userScore = 0;
  studyAnsweredCount = 0;

  const savedMissed = localStorage.getItem(getStorageKey());
  missedQuestions = savedMissed ? JSON.parse(savedMissed) : [];

  if (sessionInfo) {
    sessionInfo.textContent = `Year ${currentYear} - ${subjectName} (${mode.toUpperCase()} MODE)`;
  }

  const filePath = `data/year${currentYear}/${subjectName.toLowerCase()}.json`;

  try {
    const response = await fetch(`${filePath}?t=${Date.now()}`);
    if (!response.ok) throw new Error(`File not found at: ${filePath}`);
    const data = await response.json();

    let processedQuestions = shuffleArray(data.questions);

    if (mode === 'quiz') {
      processedQuestions = processedQuestions.slice(0, 60);
      userAnswers = new Array(processedQuestions.length).fill(null);
    }

    questions = processedQuestions.map(q => {
      const originalCorrectText = q.options[q.correctIndex];
      const shuffledOptions = shuffleArray(q.options);
      const newCorrectIndex = shuffledOptions.indexOf(originalCorrectText);

      return {
        ...q,
        options: shuffledOptions,
        correctIndex: newCorrectIndex
      };
    });

    // 1. Navigate to screen first (clears old timers safely)
    navigateTo('quiz-screen');

    // 2. Start mode UI and timer AFTER screen navigation
    if (currentMode === 'study') {
      if (timerDisplay) timerDisplay.classList.add('hidden');
      renderStudyMode();
    } else {
      startQuizTimer(); // Timer starts cleanly after navigation completes
      renderQuizQuestion();
    }
  } catch (error) {
    alert(`Could not load questions!\nMake sure your file exists at:\n"${filePath}"`);
    console.error(error);
  }
}

// --- STUDY MODE ---
function renderStudyMode() {
  progressText.textContent = `Total Questions: ${questions.length}`;
  questionText.textContent = '';
  optionsContainer.innerHTML = '';
  if (nextBtn) nextBtn.classList.add('hidden');

  questions.forEach((q, qIndex) => {
    const qCard = document.createElement('div');
    qCard.classList.add('study-q-card');
    qCard.id = `q-card-${qIndex}`;
    qCard.style.cssText = 'margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #334155;';

    const qTitle = document.createElement('h3');
    qTitle.textContent = `${qIndex + 1}. ${q.question}`;
    qCard.appendChild(qTitle);

    const optsDiv = document.createElement('div');
    optsDiv.classList.add('options-grid');

    q.options.forEach((optText, optIndex) => {
      const btn = document.createElement('button');
      btn.classList.add('option-btn');
      btn.textContent = optText;
      btn.addEventListener('click', () => handleStudyOptionClick(qIndex, optIndex, btn, optsDiv));
      optsDiv.appendChild(btn);
    });

    qCard.appendChild(optsDiv);
    optionsContainer.appendChild(qCard);
  });
}

function handleStudyOptionClick(qIndex, selectedIndex, selectedBtn, optsDiv) {
  const q = questions[qIndex];
  const allBtns = optsDiv.querySelectorAll('.option-btn');

  allBtns.forEach(btn => btn.style.pointerEvents = 'none');

  if (selectedIndex === q.correctIndex) {
    selectedBtn.style.backgroundColor = '#10b981';
    selectedBtn.style.color = '#ffffff';
    userScore++;

    missedQuestions = missedQuestions.filter(item => item.question !== q.question);
    if (missedQuestions.length > 0) {
      localStorage.setItem(getStorageKey(), JSON.stringify(missedQuestions));
    } else {
      localStorage.removeItem(getStorageKey());
    }
  } else {
    selectedBtn.style.backgroundColor = '#ef4444';
    selectedBtn.style.color = '#ffffff';
    allBtns[q.correctIndex].style.backgroundColor = '#10b981';
    allBtns[q.correctIndex].style.color = '#ffffff';

    if (!missedQuestions.some(item => item.question === q.question)) {
      missedQuestions.push(q);
      localStorage.setItem(getStorageKey(), JSON.stringify(missedQuestions));
    }
  }

  studyAnsweredCount++;

  if (studyAnsweredCount === questions.length) {
    cancelAutoScroll();
    setTimeout(() => showResults(), 1500);
    return;
  }

  cancelAutoScroll();
  autoScrollTimer = setTimeout(() => {
    const nextCard = document.getElementById(`q-card-${qIndex + 1}`);
    if (nextCard) {
      nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 1000);
}

// --- QUIZ MODE ---
function renderQuizQuestion() {
  nextBtn.classList.add('hidden');
  optionsContainer.innerHTML = '';

  const q = questions[currentQuestionIndex];
  progressText.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  questionText.textContent = q.question;

  if (currentQuestionIndex === questions.length - 1) {
    nextBtn.textContent = "Finish Quiz 🏁";
  } else {
    nextBtn.textContent = "Next Question ➡️";
  }

  q.options.forEach((optionText, index) => {
    const btn = document.createElement('button');
    btn.classList.add('option-btn');
    btn.textContent = optionText;

    if (userAnswers[currentQuestionIndex] === index) {
      btn.style.backgroundColor = '#0284c7';
      btn.style.borderColor = '#38bdf8';
      nextBtn.classList.remove('hidden');
    }

    btn.addEventListener('click', () => handleQuizOptionClick(index, btn));
    optionsContainer.appendChild(btn);
  });
}

function handleQuizOptionClick(selectedIndex, selectedBtn) {
  userAnswers[currentQuestionIndex] = selectedIndex;

  const allOptionBtns = optionsContainer.querySelectorAll('.option-btn');
  allOptionBtns.forEach(btn => {
    btn.style.backgroundColor = '#334155';
    btn.style.borderColor = '#475569';
  });

  selectedBtn.style.backgroundColor = '#0284c7';
  selectedBtn.style.borderColor = '#38bdf8';

  nextBtn.classList.remove('hidden');
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      renderQuizQuestion();
    } else {
      finishQuiz();
    }
  });
}

// --- EVALUATE QUIZ & DISPLAY RESULTS ---
function finishQuiz() {
  clearInterval(timerInterval);

  userScore = 0;
  questions.forEach((q, idx) => {
    const chosen = userAnswers[idx];
    if (chosen !== null && chosen === q.correctIndex) {
      userScore++;
      missedQuestions = missedQuestions.filter(item => item.question !== q.question);
    } else {
      if (!missedQuestions.some(item => item.question === q.question)) {
        missedQuestions.push(q);
      }
    }
  });

  if (missedQuestions.length > 0) {
    localStorage.setItem(getStorageKey(), JSON.stringify(missedQuestions));
  } else {
    localStorage.removeItem(getStorageKey());
  }

  showResults();
}

// --- RENDER DETAILED BREAKDOWN ---
function renderReviewBreakdown() {
  if (!reviewContainer) return;
  reviewContainer.innerHTML = '';

  questions.forEach((q, idx) => {
    const userChoiceIdx = userAnswers[idx];
    const isCorrect = userChoiceIdx !== null && userChoiceIdx === q.correctIndex;

    const card = document.createElement('div');
    card.classList.add('review-card', isCorrect ? 'correct' : 'incorrect');

    const userChoiceText = (userChoiceIdx !== null && userChoiceIdx !== undefined)
      ? q.options[userChoiceIdx]
      : "⚠️ No Answer (Timed Out)";

    card.innerHTML = `
      <h4>${idx + 1}. ${q.question}</h4>
      <p class="review-answer ${isCorrect ? 'text-correct' : 'text-incorrect'}">
        <strong>Your Choice:</strong> ${userChoiceText} ${isCorrect ? '✓' : '✗'}
      </p>
      ${!isCorrect ? `
        <p class="review-answer text-correct">
          <strong>Correct Choice:</strong> ${q.options[q.correctIndex]}
        </p>
      ` : ''}
    `;

    reviewContainer.appendChild(card);
  });
}

// --- RESULTS DISPLAY ---
function showResults() {
  clearInterval(timerInterval);
  cancelAutoScroll();

  const percentage = questions.length > 0 ? Math.round((userScore / questions.length) * 100) : 0;

  if (finalScore) {
    finalScore.textContent = `You answered ${userScore} out of ${questions.length} questions correctly!`;
  }

  if (scorePercentageEl) {
    scorePercentageEl.textContent = `${percentage}%`;
  }

  if (progressBarFillEl) {
    progressBarFillEl.style.width = '0%';
    setTimeout(() => {
      progressBarFillEl.style.width = `${percentage}%`;
    }, 150);
  }

  // Render question-by-question breakdown
  if (currentMode === 'quiz') {
    renderReviewBreakdown();
  } else if (reviewContainer) {
    reviewContainer.innerHTML = ''; // Hide breakdown for study mode
  }

  if (missedQuestions.length > 0) {
    if (missedCountEl) missedCountEl.textContent = missedQuestions.length;
    if (retryMissedBtn) retryMissedBtn.classList.remove('hidden');
  } else {
    if (retryMissedBtn) retryMissedBtn.classList.add('hidden');
    localStorage.removeItem(getStorageKey());
  }

  navigateTo('result-screen');
}

// Retry Missed Questions Click Handler
if (retryMissedBtn) {
  retryMissedBtn.addEventListener('click', () => {
    questions = shuffleArray(missedQuestions);
    missedQuestions = [];
    localStorage.removeItem(getStorageKey());
    currentQuestionIndex = 0;
    userScore = 0;
    studyAnsweredCount = 0;

    navigateTo('quiz-screen');

    if (currentMode === 'study') {
      renderStudyMode();
    } else {
      userAnswers = new Array(questions.length).fill(null);
      renderQuizQuestion();
    }
  });
}
