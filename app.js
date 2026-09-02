// DOM Element Selectors
const screens = document.querySelectorAll('.screen');
const enterStudyBtn = document.getElementById('enter-study-btn');
const yearCards = document.querySelectorAll('.year-card');
const backToLandingBtn = document.getElementById('back-to-landing-btn');
const backToYearsBtn = document.getElementById('back-to-years-btn');
const selectedYearTitle = document.getElementById('selected-year-title');
const subjectList = document.getElementById('subject-list');

// Top Navigation Bar Selectors
const navHomeBtn = document.getElementById('nav-home-btn');
const navAboutBtn = document.getElementById('nav-about-btn');
const navContactBtn = document.getElementById('nav-contact-btn');
const navAccountBtn = document.getElementById('nav-account-btn');

const backFromAboutBtn = document.getElementById('back-from-about-btn');
const backFromContactBtn = document.getElementById('back-from-contact-btn');
const backFromAccountBtn = document.getElementById('back-from-account-btn');

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
const accountSubjectList = document.getElementById('account-subject-list');

// Theme Toggle Selector
const themeToggleBtn = document.getElementById('theme-toggle-btn');

// Bulk Selection & Deletion Selectors
const toggleSelectModeBtn = document.getElementById('toggle-select-mode-btn');
const bulkControls = document.getElementById('bulk-controls');
const selectAllBtn = document.getElementById('select-all-btn');
const deleteSelectedBtn = document.getElementById('delete-selected-btn');
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const deleteWarningText = document.getElementById('delete-warning-text');

// Anki Export Modal Selectors
const ankiModal = document.getElementById('anki-modal');
const ankiKeepBtn = document.getElementById('anki-keep-btn');
const ankiClearBtn = document.getElementById('anki-clear-btn');
const ankiCancelBtn = document.getElementById('anki-cancel-btn');

const translations = {
  en: {
    nav_home: "HOME",
    nav_about: "ABOUT",
    nav_contact: "CONTACT US",
    nav_account: "MY ACCOUNT",
    landing_title: "Medical Study Platform",
    landing_sub: "Select your year, review saved missed questions, or test your knowledge.",
    btn_start_study: "🚀 Start Studying",
    btn_cancel: "Cancel",
    btn_leave: "Leave",
    leave_modal_title: "⚠️ Leave Study Session?",
    leave_modal_desc: "Your active test progress will be lost.",
    contact_title: "Report Question Error",
    contact_notice: "Found an incorrect question or answer? Send us a report below!",
    contact_desc_label: "Description:",
    contact_submit_btn: "📤 Send Feedback",
    cooldown_alert: "⏱️ Cooldown Active:\nPlease wait {mins} minute(s) before sending feedback again.",
    btn_back: "⬅️ Back",
    account_title: "My Account & Vault",
    account_empty_vault: "🎉 Fantastic! You have 0 missed questions in your vault.",
    // Year & Subject Selection Keys
    year_selection_title: "Select Academic Year",
    year_1: "Year 1",
    year_2: "Year 2",
    year_3: "Year 3",
    year_4: "Year 4",
    year_5: "Year 5",
    year_6: "Year 6",
    btn_back_years: "⬅️ Back to Years",
    btn_study_all: "📖 Study All",
    btn_quiz: "📝 Quiz",
    btn_review_missed: "🎯 Review Missed",
    btn_clear_missed: "🗑️ Clear Saved Missed",
    subjects_header: "Year {year} Subjects",
    missed_badge: "⚠️ {count} saved missed question(s)",
    loading_text: "Loading Questions... / កំពុងទាញយកសំណួរ..."
  },
  km: {
    nav_home: "ទំព័រដើម",
    nav_about: "អំពីពួកយើង",
    nav_contact: "ទំនាក់ទំនង",
    nav_account: "គណនីខ្ញុំ",
    landing_title: "កម្មវិធីសិក្សាវេជ្ជសាស្ត្រ",
    landing_sub: "ជ្រើសរើសឆ្នាំសិក្សា រំលឹកសំណួរដែលខុស ឬប្រឡងតេស្តសមត្ថភាព។",
    btn_start_study: "🚀 ចាប់ផ្តើមសិក្សា",
    btn_cancel: "បោះបង់",
    btn_leave: "ចាកចេញ",
    leave_modal_title: "⚠️ តើអ្នកពិតជាចង់ចាកចេញឬ?",
    leave_modal_desc: "ការវិវឌ្ឍនៃការធ្វើតេស្តរបស់អ្នកនឹងត្រូវបាត់បង់។",
    contact_title: "ផ្តល់មតិត្រឡប់ / រាយការណ៍កំហុស",
    contact_notice: "តើអ្នកប្រទះឃើញសំណួរ ឬចម្លើយមិនត្រឹមត្រូវមែនទេ? សូមផ្ញើការរាយការណ៍មកកាន់យើង!",
    contact_desc_label: "ការបរិយាយ:",
    contact_submit_btn: "📤 ផ្ញើការរាយការណ៍",
    cooldown_alert: "⏱️ រយៈពេលរង់ចាំ:\nសូមរង់ចាំ {mins} នាទីទៀតមុនពេលផ្ញើម្តងទៀត។",
    btn_back: "⬅️ ត្រឡប់ក្រោយ",
    account_title: "គណនី និងឃ្លាំងសំណួររបស់ខ្ញុំ",
    account_empty_vault: "🎉 អស្ចារ្យណាស់! អ្នកគ្មានសំណួរដែលខុសនៅក្នុងឃ្លាំងទេ។",
    // Year & Subject Selection Keys
    year_selection_title: "ជ្រើសរើសឆ្នាំសិក្សា",
    year_1: "ឆ្នាំទី ១",
    year_2: "ឆ្នាំទី ២",
    year_3: "ឆ្នាំទី ៣",
    year_4: "ឆ្នាំទី ៤",
    year_5: "ឆ្នាំទី ៥",
    year_6: "ឆ្នាំទី ៦",
    btn_back_years: "⬅️ ត្រឡប់ទៅឆ្នាំ",
    btn_study_all: "📖 សិក្សាទាំងអស់",
    btn_quiz: "📝 ប្រឡងតេស្ត",
    btn_review_missed: "🎯 រំលឹកសំណួរខុស",
    btn_clear_missed: "🗑️ លុបសំណួរខុស",
    subjects_header: "មុខវិជ្ជាឆ្នាំទី {year}",
    missed_badge: "⚠️ {count} សំណួរខុសដែលបានរក្សាទុក",
    loading_text: "កំពុងទាញយកសំណួរ..."
  }
};

let currentLang = localStorage.getItem('app_language') || 'en';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('app_language', lang);
  document.documentElement.setAttribute('lang', lang);

  // Update text elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Update inputs/textareas with data-i18n-placeholder attribute
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });

  // Sync dropdown UI
  const langSelect = document.getElementById('language-select');
  if (langSelect) langSelect.value = lang;
}

// Initialize Language Switcher on Load
document.addEventListener('DOMContentLoaded', () => {
  const langSelect = document.getElementById('language-select');
  setLanguage(currentLang);

  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }
});

// Corrected App State
let currentYear = null;
let currentSubject = '';
let currentMode = 'study';
let questions = [];
let userAnswers = []; 
let missedQuestions = [];
let currentQuestionIndex = 0;
let userScore = 0;
let studyAnsweredCount = 0;
let activeExportSubjectKey = null;
let currentScreen = 'landing-screen';

// Timer & Auto-scroll State
let timerInterval = null;
let timeRemaining = 3600; // 60 Minutes
let autoScrollTimer = null;

// Manifest data mapping years to available subjects
const manifestData = {
  "1": ["I-D-A", "MED-PRO-B1", "MED-PRO", "F-N-S", "I-D-A-Khmer"],
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

// Storage Key Helper
function getStorageKey(year = currentYear, subject = currentSubject) {
  return `missed_y${year}_${subject.toLowerCase()}`;
}

// --- Vault Mastery Manager (Streak >= 2 Removes Question Automatically) ---
function recordQuestionResult(questionObj, isCorrect, year = currentYear, subject = currentSubject) {
  const key = getStorageKey(year, subject);
  const raw = localStorage.getItem(key);
  let vault = raw ? JSON.parse(raw) : [];

  const existingIndex = vault.findIndex(item => item.question === questionObj.question);

  if (!isCorrect) {
    // Answered wrong: Add to vault or reset streak counter to 0
    if (existingIndex >= 0) {
      vault[existingIndex].streak = 0;
    } else {
      vault.push({ ...questionObj, streak: 0 });
    }
  } else {
    // Answered correct: Increment streak. If streak >= 2, question is Mastered (removed)
    if (existingIndex >= 0) {
      vault[existingIndex].streak = (vault[existingIndex].streak || 0) + 1;
      if (vault[existingIndex].streak >= 2) {
        vault.splice(existingIndex, 1);
      }
    }
  }

  if (vault.length > 0) {
    localStorage.setItem(key, JSON.stringify(vault));
  } else {
    localStorage.removeItem(key);
  }
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

// --- Cancel Auto-scroll on Manual Input ---
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

// --- Custom Exit Confirm Modal ---
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

window.addEventListener('beforeunload', (e) => {
  const quizScreen = document.getElementById('quiz-screen');
  if (quizScreen && !quizScreen.classList.contains('hidden')) {
    e.preventDefault();
    e.returnValue = '';
  }
});

// --- Navigation & Screen Storage State ---
function navigateTo(screenId, isBackAction = false) {
  clearInterval(timerInterval);
  cancelAutoScroll();

  currentScreen = screenId; // Update state

  screens.forEach(screen => screen.classList.add('hidden'));
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }

  if (screenId === 'account-screen') {
    renderAccountDashboard();
  }

  if (!isBackAction) {
    history.pushState({ screenId: screenId }, '');
  }

  if (screenId === 'quiz-screen' || screenId === 'result-screen') {
    sessionStorage.setItem('lastScreen', 'subject-screen');
  } else {
    sessionStorage.setItem('lastScreen', screenId);
  }
}

// --- Browser Back/Forward Button Handler ---
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
  } else if (['about-screen', 'contact-screen', 'account-screen'].includes(savedScreen)) {
    navigateTo(savedScreen);
  } else {
    navigateTo('landing-screen');
  }
});

// --- Top Navigation Bar Event Listeners ---
if (navHomeBtn) navHomeBtn.addEventListener('click', () => navigateTo('landing-screen'));
if (navAboutBtn) navAboutBtn.addEventListener('click', () => navigateTo('about-screen'));
if (navContactBtn) navContactBtn.addEventListener('click', () => navigateTo('contact-screen'));
if (navAccountBtn) navAccountBtn.addEventListener('click', () => navigateTo('account-screen'));

if (backFromAboutBtn) backFromAboutBtn.addEventListener('click', () => navigateTo('landing-screen'));
if (backFromContactBtn) backFromContactBtn.addEventListener('click', () => navigateTo('landing-screen'));
if (backFromAccountBtn) backFromAccountBtn.addEventListener('click', () => navigateTo('landing-screen'));

if (enterStudyBtn) enterStudyBtn.addEventListener('click', () => navigateTo('year-screen'));

yearCards.forEach(card => {
  card.addEventListener('click', () => {
    currentYear = card.getAttribute('data-year');
    sessionStorage.setItem('lastYear', currentYear);
    selectedYearTitle.textContent = `Year ${currentYear} Subjects`;
    loadSubjectsForYear(currentYear);
    navigateTo('subject-screen');
  });
});

if (backToLandingBtn) backToLandingBtn.addEventListener('click', () => navigateTo('landing-screen'));
if (backToYearsBtn) backToYearsBtn.addEventListener('click', () => navigateTo('year-screen'));

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

const loadingOverlay = document.getElementById('loading-overlay');

// --- Dynamic Localized Subject Cards Rendering ---
function loadSubjectsForYear(year) {
  subjectList.innerHTML = '';
  const subjects = manifestData[year] || [];
  const t = translations[currentLang] || translations.en;

  if (selectedYearTitle) {
    selectedYearTitle.textContent = t.subjects_header ? t.subjects_header.replace('{year}', year) : `Year ${year} Subjects`;
  }

  subjects.forEach(subject => {
    const storageKey = getStorageKey(year, subject);
    const savedMissed = localStorage.getItem(storageKey);
    const missedCount = savedMissed ? JSON.parse(savedMissed).length : 0;

    const subjectCard = document.createElement('div');
    subjectCard.classList.add('subject-card');

    const badgeText = t.missed_badge ? t.missed_badge.replace('{count}', missedCount) : `⚠️ ${missedCount} saved missed questions`;

    subjectCard.innerHTML = `
      <h3>${subject}</h3>
      ${missedCount > 0 ? `<p class="missed-badge">${badgeText}</p>` : ''}
      
      <div class="subject-actions">
        <button class="btn study-btn" onclick="startSession('${subject}', 'study')">${t.btn_study_all}</button>
        <button class="btn quiz-btn" onclick="startSession('${subject}', 'quiz')">${t.btn_quiz}</button>
      </div>

      ${missedCount > 0 ? `
        <button class="btn study-missed-btn" onclick="startMissedSession('${subject}')">${t.btn_review_missed} (${missedCount})</button>
        <button class="btn clear-btn" onclick="clearSavedMissed('${subject}')">${t.btn_clear_missed}</button>
      ` : ''}
    `;
    
    subjectList.appendChild(subjectCard);
  });
}

// --- Session Initialization with Loading Spinner ---
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

  // Show Loading Spinner
  if (loadingOverlay) loadingOverlay.classList.remove('hidden');

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

    navigateTo('quiz-screen');

    if (currentMode === 'study') {
      if (timerDisplay) timerDisplay.classList.add('hidden');
      renderStudyMode();
    } else {
      startQuizTimer();
      renderQuizQuestion();
    }
  } catch (error) {
    alert(`Could not load questions!\nMake sure your file exists at:\n"${filePath}"`);
    console.error(error);
  } finally {
    // Hide Loading Spinner
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
  }
}
// --- Review Missed Session Launcher ---
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
  timeRemaining = 3600;
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

    navigateTo('quiz-screen');

    if (currentMode === 'study') {
      if (timerDisplay) timerDisplay.classList.add('hidden');
      renderStudyMode();
    } else {
      startQuizTimer();
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
  const isCorrect = selectedIndex === q.correctIndex;

  allBtns.forEach(btn => btn.style.pointerEvents = 'none');

  if (isCorrect) {
    selectedBtn.style.backgroundColor = '#10b981';
    selectedBtn.style.color = '#ffffff';
    userScore++;
  } else {
    selectedBtn.style.backgroundColor = '#ef4444';
    selectedBtn.style.color = '#ffffff';
    allBtns[q.correctIndex].style.backgroundColor = '#10b981';
    allBtns[q.correctIndex].style.color = '#ffffff';
  }

  // Update streak / mastery in permanent storage
  recordQuestionResult(q, isCorrect);

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

function finishQuiz() {
  clearInterval(timerInterval);

  userScore = 0;
  questions.forEach((q, idx) => {
    const chosen = userAnswers[idx];
    const isCorrect = chosen !== null && chosen === q.correctIndex;
    if (isCorrect) userScore++;
    recordQuestionResult(q, isCorrect);
  });

  showResults();
}

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

  if (currentMode === 'quiz') {
    renderReviewBreakdown();
  } else if (reviewContainer) {
    reviewContainer.innerHTML = '';
  }

  const savedMissed = localStorage.getItem(getStorageKey());
  const missedList = savedMissed ? JSON.parse(savedMissed) : [];

  if (missedList.length > 0) {
    if (missedCountEl) missedCountEl.textContent = missedList.length;
    if (retryMissedBtn) retryMissedBtn.classList.remove('hidden');
  } else {
    if (retryMissedBtn) retryMissedBtn.classList.add('hidden');
  }

  navigateTo('result-screen');
}

if (retryMissedBtn) {
  retryMissedBtn.addEventListener('click', () => {
    const savedMissed = localStorage.getItem(getStorageKey());
    if (!savedMissed) return;
    questions = shuffleArray(JSON.parse(savedMissed));
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

// ==========================================================================
// MY ACCOUNT DASHBOARD, BULK DELETION & ANKI EXPORT (.TXT) LOGIC
// ==========================================================================

// --- Toggle Select Mode ---
if (toggleSelectModeBtn) {
  toggleSelectModeBtn.addEventListener('click', () => {
    isSelectMode = !isSelectMode;
    selectedSubjectKeys.clear();
    
    if (isSelectMode) {
      toggleSelectModeBtn.textContent = '❌ Cancel';
      if (bulkControls) bulkControls.classList.remove('hidden');
    } else {
      toggleSelectModeBtn.textContent = '☑️ Select';
      if (bulkControls) bulkControls.classList.add('hidden');
    }
    
    updateDeleteButtonState();
    renderAccountDashboard();
  });
}

// --- Select / Deselect All ---
if (selectAllBtn) {
  selectAllBtn.addEventListener('click', () => {
    const allCheckboxes = document.querySelectorAll('.card-checkbox');
    const allKeys = Array.from(allCheckboxes).map(cb => cb.getAttribute('data-key'));

    if (selectedSubjectKeys.size === allKeys.length) {
      selectedSubjectKeys.clear();
    } else {
      allKeys.forEach(key => selectedSubjectKeys.add(key));
    }

    updateDeleteButtonState();
    renderAccountDashboard();
  });
}

function updateDeleteButtonState() {
  if (!deleteSelectedBtn) return;
  const count = selectedSubjectKeys.size;
  deleteSelectedBtn.textContent = `🗑️ Delete Selected (${count})`;
  deleteSelectedBtn.disabled = count === 0;
  
  if (selectAllBtn) {
    const totalCards = document.querySelectorAll('.card-checkbox').length;
    selectAllBtn.textContent = (totalCards > 0 && selectedSubjectKeys.size === totalCards) 
      ? 'Deselect All' 
      : 'Select All';
  }
}

// --- Trigger Delete Warning Modal ---
if (deleteSelectedBtn) {
  deleteSelectedBtn.addEventListener('click', () => {
    if (selectedSubjectKeys.size === 0) return;
    if (deleteWarningText) {
      deleteWarningText.textContent = `Are you sure you want to permanently delete missed questions from ${selectedSubjectKeys.size} selected subject(s)?`;
    }
    if (deleteConfirmModal) deleteConfirmModal.classList.remove('hidden');
  });
}

if (cancelDeleteBtn) {
  cancelDeleteBtn.addEventListener('click', () => {
    if (deleteConfirmModal) deleteConfirmModal.classList.add('hidden');
  });
}

// --- Execute Bulk Deletion ---
if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener('click', () => {
    selectedSubjectKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    selectedSubjectKeys.clear();
    isSelectMode = false;
    if (toggleSelectModeBtn) toggleSelectModeBtn.textContent = '☑️ Select';
    if (bulkControls) bulkControls.classList.add('hidden');
    if (deleteConfirmModal) deleteConfirmModal.classList.add('hidden');
    
    updateDeleteButtonState();
    renderAccountDashboard();
  });
}

// --- Render Account Vault Dashboard ---
function renderAccountDashboard() {
  if (!accountSubjectList) return;
  accountSubjectList.innerHTML = '';

  let totalMissedAcrossApp = 0;

  Object.keys(manifestData).forEach(year => {
    manifestData[year].forEach(subject => {
      const key = getStorageKey(year, subject);
      const rawData = localStorage.getItem(key);
      const missedArray = rawData ? JSON.parse(rawData) : [];

      if (missedArray.length > 0) {
        totalMissedAcrossApp += missedArray.length;

        const card = document.createElement('div');
        card.classList.add('subject-card');
        if (selectedSubjectKeys.has(key)) {
          card.classList.add('selected-for-delete');
        }

        const isChecked = selectedSubjectKeys.has(key) ? 'checked' : '';
        const checkboxHTML = isSelectMode 
          ? `<input type="checkbox" class="card-checkbox" data-key="${key}" ${isChecked}>` 
          : '';

        card.innerHTML = `
          <div style="display: flex; gap: 1rem; align-items: flex-start;">
            ${checkboxHTML}
            <div style="flex: 1;">
              <h3>Year ${year} - ${subject}</h3>
              <p class="missed-badge">⚠️ ${missedArray.length} Missed Question${missedArray.length > 1 ? 's' : ''} Saved</p>
              ${!isSelectMode ? `
                <div class="subject-actions" style="flex-direction: column;">
                  <button class="btn study-missed-btn" onclick="launchAccountReview('${year}', '${subject}')">🎯 Practice Missed (${missedArray.length})</button>
                  <button class="btn primary-btn" onclick="promptAnkiExport('${key}', 'Year_${year}_${subject}')">📦 Export to Anki (.txt)</button>
                </div>
              ` : ''}
            </div>
          </div>
        `;

        if (isSelectMode) {
          card.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
              const cb = card.querySelector('.card-checkbox');
              if (cb) cb.checked = !cb.checked;
            }
            
            if (selectedSubjectKeys.has(key)) {
              selectedSubjectKeys.delete(key);
            } else {
              selectedSubjectKeys.add(key);
            }
            
            updateDeleteButtonState();
            renderAccountDashboard();
          });
        }

        accountSubjectList.appendChild(card);
      }
    });
  });

  if (totalMissedAcrossApp === 0) {
    if (toggleSelectModeBtn) toggleSelectModeBtn.classList.add('hidden');
    if (bulkControls) bulkControls.classList.add('hidden');
    
    const emptyText = translations[currentLang]?.account_empty_vault 
      || "🎉 Fantastic! You have 0 missed questions in your vault.";

    accountSubjectList.innerHTML = `
      <div class="score-card" style="text-align: center; padding: 2rem;">
        <p style="margin: 0; color: var(--text-sub);" data-i18n="account_empty_vault">${emptyText}</p>
      </div>
    `;
  } else {
    if (toggleSelectModeBtn) toggleSelectModeBtn.classList.remove('hidden');
  }
} 
function launchAccountReview(year, subject) {
  currentYear = year;
  currentSubject = subject;
  sessionStorage.setItem('lastYear', year);
  startMissedSession(subject);
}

// --- Anki Export Handlers ---
function promptAnkiExport(storageKey, subjectFilenameTag) {
  activeExportSubjectKey = storageKey;
  if (ankiModal) ankiModal.classList.remove('hidden');
}

if (ankiCancelBtn) {
  ankiCancelBtn.addEventListener('click', () => {
    if (ankiModal) ankiModal.classList.add('hidden');
  });
}

if (ankiKeepBtn) {
  ankiKeepBtn.addEventListener('click', () => {
    executeAnkiDownload(false);
  });
}

if (ankiClearBtn) {
  ankiClearBtn.addEventListener('click', () => {
    executeAnkiDownload(true);
  });
}

function executeAnkiDownload(shouldClearAfter) {
  if (!activeExportSubjectKey) return;

  const raw = localStorage.getItem(activeExportSubjectKey);
  if (!raw) return;

  const questionsList = JSON.parse(raw);
  
  // Format as Tab-Separated Values for direct Anki import
  let fileContent = "#separator:Tab\n#html:true\n";

  questionsList.forEach(q => {
    let optionsText = q.options.map((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      return `<div><b>${letter})</b> ${opt}</div>`;
    }).join('');

    const front = `<div style='font-size:1.1em; font-weight:bold; margin-bottom:8px;'>${q.question}</div>${optionsText}`;
    const correctLetter = String.fromCharCode(65 + q.correctIndex);
    const back = `<div><b>Correct Choice:</b> ${correctLetter}) ${q.options[q.correctIndex]}</div>`;

    fileContent += `${front}\t${back}\n`;
  });

  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `Anki_${activeExportSubjectKey}.txt`;
  downloadLink.click();

  if (shouldClearAfter) {
    localStorage.removeItem(activeExportSubjectKey);
    renderAccountDashboard();
  }

  if (ankiModal) ankiModal.classList.add('hidden');
}

// ==========================================================================
// TELEGRAM FEEDBACK VIA CLOUDFLARE WORKER PROXY
// ==========================================================================

const WORKER_URL = "https://telegram-proxy.pensamkhan9.workers.dev";

const feedbackForm = document.getElementById('feedback-form');
const feedbackText = document.getElementById('feedback-text');
const feedbackImage = document.getElementById('feedback-image');
const contactConfirmModal = document.getElementById('contact-confirm-modal');
const confirmFeedbackBtn = document.getElementById('confirm-feedback-btn');
const cancelFeedbackBtn = document.getElementById('cancel-feedback-btn');
const myFeedbackList = document.getElementById('my-feedback-list');

let pendingFeedbackPayload = null;

async function getInternetTime() {
  try {
    const response = await fetch(`${WORKER_URL}/time`);
    if (!response.ok) throw new Error("Time API unavailable");
    const data = await response.json();
    return data.timestamp;
  } catch (err) {
    return Date.now();
  }
}

if (feedbackForm) {
  feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const lastSentTime = localStorage.getItem('last_feedback_internet_time');
    const nowInternet = await getInternetTime();

    if (lastSentTime) {
      const elapsed = nowInternet - parseInt(lastSentTime, 10);
      const cooldownMs = 30 * 60 * 1000;

      if (elapsed < cooldownMs) {
        const remainingMins = Math.ceil((cooldownMs - elapsed) / 60000);
        alert(`⏱️ Cooldown Active / រយៈពេលរង់ចាំ:\n🇬🇧 Please wait ${remainingMins} minute(s) before sending feedback again.\n🇰🇭 សូមរង់ចាំ ${remainingMins} នាទីទៀតមុនពេលផ្ញើម្តងទៀត។`);
        return;
      }
    }

    pendingFeedbackPayload = {
      text: feedbackText.value,
      file: feedbackImage.files[0] || null,
      timestamp: nowInternet
    };

    if (contactConfirmModal) contactConfirmModal.classList.remove('hidden');
  });
}

if (cancelFeedbackBtn) {
  cancelFeedbackBtn.addEventListener('click', () => {
    if (contactConfirmModal) contactConfirmModal.classList.add('hidden');
    pendingFeedbackPayload = null;
  });
}

if (confirmFeedbackBtn) {
  confirmFeedbackBtn.addEventListener('click', async () => {
    if (!pendingFeedbackPayload) return;

    confirmFeedbackBtn.disabled = true;
    confirmFeedbackBtn.textContent = "Sending... / កំពុងផ្ញើ...";

    const { text, file, timestamp } = pendingFeedbackPayload;

    try {
      const formData = new FormData();
      formData.append('text', text);
      if (file) {
        formData.append('photo', file);
      }

      const res = await fetch(WORKER_URL, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.ok && data.result) {
        const telegramMsgId = data.result.message_id;
        localStorage.setItem('last_feedback_internet_time', timestamp.toString());
        saveLocalFeedbackLog(text, timestamp, telegramMsgId);

        feedbackForm.reset();
        alert("✅ Feedback Sent Successfully! / បានផ្ញើដោយជោគជ័យ!");
      } else {
        alert(`⚠️ Telegram Error:\n${data.description || 'Failed to deliver message.'}`);
      }
    } catch (err) {
      alert(`⚠️ Connection Error:\n${err.message}`);
    }

    confirmFeedbackBtn.disabled = false;
    confirmFeedbackBtn.textContent = "Send / ផ្ញើ";
    if (contactConfirmModal) contactConfirmModal.classList.add('hidden');
    pendingFeedbackPayload = null;
    renderMyFeedbacks();
  });
}

function saveLocalFeedbackLog(text, timestamp, msgId) {
  const raw = localStorage.getItem('my_submitted_feedbacks');
  const logs = raw ? JSON.parse(raw) : [];

  logs.unshift({
    id: Date.now(),
    telegram_msg_id: msgId,
    text: text,
    date: new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Pending ⏳'
  });

  localStorage.setItem('my_submitted_feedbacks', JSON.stringify(logs));
}

async function syncFeedbackStatusWithTelegram() {
  const raw = localStorage.getItem('my_submitted_feedbacks');
  if (!raw) return;

  let logs = JSON.parse(raw);
  const pendingLogs = logs.filter(l => l.status === 'Pending ⏳' && l.telegram_msg_id);

  if (pendingLogs.length === 0) return;

  try {
    const res = await fetch(`${WORKER_URL}/getUpdates`);
    if (!res.ok) return;

    const data = await res.json();
    if (!data.result || !Array.isArray(data.result)) return;

    let updated = false;

    data.result.forEach(update => {
      const msg = update.message || update.edited_message || update.channel_post || update.edited_channel_post;

      if (msg && msg.reply_to_message) {
        const repliedId = msg.reply_to_message.message_id;
        const matchedLog = logs.find(l => String(l.telegram_msg_id) === String(repliedId));

        if (matchedLog && matchedLog.status !== 'Checked ✅') {
          matchedLog.status = 'Checked ✅';
          updated = true;
        }
      }
    });

    if (updated) {
      localStorage.setItem('my_submitted_feedbacks', JSON.stringify(logs));
    }
  } catch (err) {
    console.error("Failed to sync Telegram status:", err);
  }
}

async function renderMyFeedbacks() {
  if (!myFeedbackList) return;

  await syncFeedbackStatusWithTelegram();

  myFeedbackList.innerHTML = '';
  const raw = localStorage.getItem('my_submitted_feedbacks');
  const logs = raw ? JSON.parse(raw) : [];

  if (logs.length === 0) {
    myFeedbackList.innerHTML = `<p style="color: var(--text-sub); font-size: 0.9rem;">No submitted reports yet. / មិនទាន់មានប្រវត្តិរាយការណ៍នៅឡើយទេ។</p>`;
    return;
  }

  logs.forEach(log => {
    const card = document.createElement('div');
    card.classList.add('subject-card');
    card.style.padding = '1rem';

    const statusClass = log.status === 'Checked ✅' ? 'status-checked' : 'status-pending';

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
        <span style="font-size:0.8rem; color:var(--text-sub);">${log.date}</span>
        <span class="feedback-status-badge ${statusClass}">${log.status}</span>
      </div>
      <p style="margin:0; font-size:0.95rem; color:var(--text-main); line-height:1.4;">${log.text}</p>
    `;
    myFeedbackList.appendChild(card);
  });
}

// ==========================================================================
// ASYNC CUSTOM LEAVE CONFIRMATION MODAL & NAVIGATION GUARD
// ==========================================================================

function showLeaveConfirmModal() {
  return new Promise((resolve) => {
    const modal = document.getElementById('leave-confirm-modal');
    const confirmBtn = document.getElementById('leave-confirm-btn');
    const cancelBtn = document.getElementById('leave-cancel-btn');

    if (!modal) return resolve(true);

    modal.classList.remove('hidden');

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    function cleanup() {
      modal.classList.add('hidden');
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
    }

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
  });
}

const baseNavigateTo = navigateTo;

navigateTo = async function(screenId, isBackAction = false) {
  const isCurrentlyStudying = (currentScreen === 'quiz-screen');

  if (isCurrentlyStudying && screenId !== currentScreen) {
    const userWantsToLeave = await showLeaveConfirmModal();
    if (!userWantsToLeave) return;
  }

  baseNavigateTo(screenId, isBackAction);

  if (screenId === 'contact-screen') {
    renderMyFeedbacks();
  }
};

window.addEventListener('beforeunload', (e) => {
  const isCurrentlyStudying = (currentScreen === 'quiz-screen');
  if (isCurrentlyStudying) {
    e.preventDefault();
    e.returnValue = '';
  }
});
