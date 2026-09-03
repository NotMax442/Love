// ==========================================================================
// QUIZ & STUDY RUNNER LOGIC (quiz.html)
// ==========================================================================

let sessionConfig = null;
let questions = [];
let userAnswers = [];
let currentQuestionIndex = 0;
let userScore = 0;
let studyAnsweredCount = 0;
let isSessionActive = true;
let isModalOpen = false;

let timerInterval = null;
let timeRemaining = 3600;
let autoScrollTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  const rawConfig = sessionStorage.getItem('activeSessionConfig');
  if (!rawConfig) {
    window.location.href = 'index.html';
    return;
  }

  sessionConfig = JSON.parse(rawConfig);

  // Sync navigation view back to subject selection
  localStorage.setItem('lastView', 'subject');
  localStorage.setItem('lastActiveYear', sessionConfig.year);

  setupNavigationGuards();
  await initSession();
});

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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

// Navigation Guard Modal for Leave Prevention
function showLeaveConfirmModal() {
  if (isModalOpen) return Promise.resolve(false);
  isModalOpen = true;

  return new Promise((resolve) => {
    const modal = document.getElementById('leave-confirm-modal');
    const confirmBtn = document.getElementById('leave-confirm-btn');
    const cancelBtn = document.getElementById('leave-cancel-btn');
    const descEl = document.getElementById('leave-modal-desc');

    if (!modal) {
      isModalOpen = false;
      return resolve(true);
    }

    if (descEl) {
      const isKm = currentLang === 'km';
      if (sessionConfig && sessionConfig.mode === 'study') {
        descEl.textContent = isKm 
          ? "តើអ្នកពិតជាចង់ចាកចេញឬ? កុំបារម្ភ ការវិវឌ្ឍរបស់អ្នកត្រូវបានរក្សាទុក!"
          : "Are you sure you want to leave? Your progress will be saved, don't worry!";
      } else {
        descEl.textContent = isKm
          ? "ការវិវឌ្ឍនៃការធ្វើតេស្តប្រឡងរបស់អ្នកនឹងត្រូវបាត់បង់។"
          : "Are you sure you want to leave? Your active timed quiz progress will be lost.";
      }
    }

    modal.classList.remove('hidden');

    const onConfirm = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };

    function cleanup() {
      modal.classList.add('hidden');
      isModalOpen = false;
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
    }

    confirmBtn.addEventListener('click', onConfirm, { once: true });
    cancelBtn.addEventListener('click', onCancel, { once: true });
  });
}

function setupNavigationGuards() {
  const pushGuardState = () => {
    try { history.pushState({ guard: true }, '', window.location.href); } catch (e) {}
  };

  pushGuardState();

  window.addEventListener('popstate', (e) => {
    if (!isSessionActive) return;
    pushGuardState();
    if (isModalOpen) return;

    showLeaveConfirmModal().then((wantsToLeave) => {
      if (wantsToLeave) {
        isSessionActive = false;
        window.location.href = 'index.html';
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (!isSessionActive) return;
    const isAltBack = e.altKey && (e.key === 'ArrowLeft' || e.code === 'ArrowLeft');
    const isCmdBack = (e.metaKey || e.ctrlKey) && e.key === '[';

    if (isAltBack || isCmdBack) {
      e.preventDefault();
      e.stopPropagation();
      if (isModalOpen) return;

      showLeaveConfirmModal().then((wantsToLeave) => {
        if (wantsToLeave) {
          isSessionActive = false;
          window.location.href = 'index.html';
        }
      });
    }
  });

  const navGuards = document.querySelectorAll('.nav-leave-guard');
  navGuards.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const targetUrl = link.getAttribute('href');
      if (isSessionActive) {
        if (isModalOpen) return;
        const wantsToLeave = await showLeaveConfirmModal();
        if (wantsToLeave) {
          isSessionActive = false;
          window.location.href = targetUrl;
        }
      } else {
        window.location.href = targetUrl;
      }
    });
  });

  const quitBtn = document.getElementById('quit-session-btn');
  if (quitBtn) {
    quitBtn.addEventListener('click', async () => {
      if (isSessionActive) {
        if (isModalOpen) return;
        const wantsToLeave = await showLeaveConfirmModal();
        if (wantsToLeave) {
          isSessionActive = false;
          window.location.href = 'index.html';
        }
      } else {
        window.location.href = 'index.html';
      }
    });
  }

  window.addEventListener('beforeunload', (e) => {
    if (isSessionActive) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

// Session Initialization
async function initSession() {
  const { year, subject, mode, resume } = sessionConfig;
  const sessionInfo = document.getElementById('session-info');
  const loadingOverlay = document.getElementById('loading-overlay');

  if (sessionInfo) {
    sessionInfo.textContent = `Year ${year} - ${subject} (${mode.toUpperCase()} MODE)`;
  }

  isSessionActive = true;
  userScore = 0;
  currentQuestionIndex = 0;
  studyAnsweredCount = 0;

  const studyProgressKey = `saved_study_y${year}_${subject.toLowerCase()}`;

  // Resume saved Study progress ONLY
  if (mode === 'study' && resume) {
    const savedStudyRaw = localStorage.getItem(studyProgressKey);
    if (savedStudyRaw) {
      try {
        const progressData = JSON.parse(savedStudyRaw);
        questions = progressData.questions;
        userAnswers = progressData.userAnswers;
        studyAnsweredCount = progressData.studyAnsweredCount;
        userScore = progressData.userScore;

        renderStudyMode();
        return;
      } catch (e) {}
    }
  }

  if (mode === 'missed') {
    const key = getStorageKey(year, subject);
    const rawMissed = localStorage.getItem(key);
    if (!rawMissed) {
      alert("No saved missed questions found for this subject!");
      window.location.href = 'index.html';
      return;
    }
    const missedList = JSON.parse(rawMissed);
    userAnswers = new Array(missedList.length).fill(null);
    questions = shuffleArray(missedList).map(q => prepareShuffledQuestion(q));
    renderStudyMode();
    return;
  }

  const filePath = `data/year${year}/${subject.toLowerCase()}.json`;
  if (loadingOverlay) loadingOverlay.classList.remove('hidden');

  try {
    const response = await fetch(`${filePath}?t=${Date.now()}`);
    if (!response.ok) throw new Error(`File not found at: ${filePath}`);
    const data = await response.json();

    let processed = shuffleArray(data.questions);
    if (mode === 'quiz') {
      processed = processed.slice(0, 60);
    }

    userAnswers = new Array(processed.length).fill(null);
    questions = processed.map(q => prepareShuffledQuestion(q));

    if (mode === 'study') {
      renderStudyMode();
    } else {
      startQuizTimer();
      renderQuizQuestion();
    }
  } catch (error) {
    alert(`Could not load questions!\nMake sure your file exists at:\n"${filePath}"`);
    window.location.href = 'index.html';
  } finally {
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
  }
}

function prepareShuffledQuestion(q) {
  const originalCorrectText = q.options[q.correctIndex];
  const shuffledOptions = shuffleArray(q.options);
  const newCorrectIndex = shuffledOptions.indexOf(originalCorrectText);

  return {
    ...q,
    options: shuffledOptions,
    correctIndex: newCorrectIndex
  };
}

// Timer Logic
function startQuizTimer() {
  clearInterval(timerInterval);
  timeRemaining = 3600;
  updateTimerUI();

  const timerDisplay = document.getElementById('timer-display');
  if (timerDisplay) timerDisplay.classList.remove('hidden');

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerUI();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      alert("⏱️ Time is up! Submitting your quiz now.");
      finishSession();
    }
  }, 1000);
}

function updateTimerUI() {
  const timerDisplay = document.getElementById('timer-display');
  if (!timerDisplay) return;
  const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
  const seconds = String(timeRemaining % 60).padStart(2, '0');
  timerDisplay.textContent = `⏱️ ${minutes}:${seconds}`;
}

// Auto-save Study progress ONLY
function saveStudyProgress() {
  if (sessionConfig && sessionConfig.mode === 'study') {
    const studyProgressKey = `saved_study_y${sessionConfig.year}_${sessionConfig.subject.toLowerCase()}`;
    const progressData = {
      questions: questions,
      userAnswers: userAnswers,
      studyAnsweredCount: studyAnsweredCount,
      userScore: userScore,
      timestamp: Date.now()
    };
    localStorage.setItem(studyProgressKey, JSON.stringify(progressData));
  }
}

// Study Mode Renderer
function renderStudyMode() {
  window.scrollTo(0, 0);
  const progressText = document.getElementById('progress-text');
  const questionText = document.getElementById('question-text');
  const optionsContainer = document.getElementById('options-container');
  const nextBtn = document.getElementById('next-btn');

  if (progressText) progressText.textContent = `Total Questions: ${questions.length} (Answered: ${studyAnsweredCount})`;
  if (questionText) questionText.textContent = '';
  if (optionsContainer) optionsContainer.innerHTML = '';
  if (nextBtn) nextBtn.classList.add('hidden');

  questions.forEach((q, qIndex) => {
    const qCard = document.createElement('div');
    qCard.classList.add('study-q-card');
    qCard.id = `q-card-${qIndex}`;
    qCard.style.cssText = 'margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-color);';

    const qTitle = document.createElement('h3');
    qTitle.textContent = `${qIndex + 1}. ${q.question}`;
    qCard.appendChild(qTitle);

    const optsDiv = document.createElement('div');
    optsDiv.classList.add('options-grid');
    optsDiv.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;';

    const previousAnswer = userAnswers[qIndex];
    const hasBeenAnswered = previousAnswer !== null && previousAnswer !== undefined;

    q.options.forEach((optText, optIndex) => {
      const btn = document.createElement('button');
      btn.classList.add('option-btn');
      btn.textContent = optText;

      if (hasBeenAnswered) {
        btn.style.pointerEvents = 'none';
        if (optIndex === q.correctIndex) {
          btn.style.backgroundColor = '#10b981';
          btn.style.color = '#ffffff';
        }
        if (optIndex === previousAnswer && previousAnswer !== q.correctIndex) {
          btn.style.backgroundColor = '#ef4444';
          btn.style.color = '#ffffff';
        }
      } else {
        btn.addEventListener('click', () => handleStudyOptionClick(qIndex, optIndex, btn, optsDiv));
      }

      optsDiv.appendChild(btn);
    });

    qCard.appendChild(optsDiv);
    optionsContainer.appendChild(qCard);
  });

  if (sessionConfig.resume) {
    const firstUnansweredIndex = userAnswers.findIndex(ans => ans === null);
    if (firstUnansweredIndex > 0) {
      setTimeout(() => {
        const card = document.getElementById(`q-card-${firstUnansweredIndex}`);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }
}

function handleStudyOptionClick(qIndex, selectedIndex, selectedBtn, optsDiv) {
  const q = questions[qIndex];
  const allBtns = optsDiv.querySelectorAll('.option-btn');
  const isCorrect = selectedIndex === q.correctIndex;

  userAnswers[qIndex] = selectedIndex;
  allBtns.forEach(btn => btn.style.pointerEvents = 'none');

  if (isCorrect) {
    selectedBtn.style.backgroundColor = '#10b981';
    selectedBtn.style.color = '#ffffff';
    userScore++;
  } else {
    selectedBtn.style.backgroundColor = '#ef4444';
    selectedBtn.style.color = '#ffffff';
    if (allBtns[q.correctIndex]) {
      allBtns[q.correctIndex].style.backgroundColor = '#10b981';
      allBtns[q.correctIndex].style.color = '#ffffff';
    }
  }

  recordQuestionResult(q, isCorrect, sessionConfig.year, sessionConfig.subject);
  studyAnsweredCount++;

  saveStudyProgress();

  const progressText = document.getElementById('progress-text');
  if (progressText) progressText.textContent = `Total Questions: ${questions.length} (Answered: ${studyAnsweredCount})`;

  if (studyAnsweredCount === questions.length) {
    cancelAutoScroll();
    isSessionActive = false;
    setTimeout(() => finishSession(), 1200);
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

// Quiz Mode Renderer
function renderQuizQuestion() {
  window.scrollTo(0, 0);
  const nextBtn = document.getElementById('next-btn');
  const optionsContainer = document.getElementById('options-container');
  const progressText = document.getElementById('progress-text');
  const questionText = document.getElementById('question-text');

  if (nextBtn) nextBtn.classList.add('hidden');
  if (optionsContainer) optionsContainer.innerHTML = '';

  const q = questions[currentQuestionIndex];
  if (progressText) progressText.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  if (questionText) questionText.textContent = q.question;

  if (nextBtn) {
    nextBtn.textContent = (currentQuestionIndex === questions.length - 1) 
      ? "Finish Quiz 🏁" 
      : "Next Question ➡️";
  }

  q.options.forEach((optionText, index) => {
    const btn = document.createElement('button');
    btn.classList.add('option-btn');
    btn.textContent = optionText;

    if (userAnswers[currentQuestionIndex] === index) {
      btn.style.backgroundColor = '#0284c7';
      btn.style.borderColor = '#38bdf8';
      if (nextBtn) nextBtn.classList.remove('hidden');
    }

    btn.addEventListener('click', () => handleQuizOptionClick(index, btn));
    optionsContainer.appendChild(btn);
  });
}

function handleQuizOptionClick(selectedIndex, selectedBtn) {
  userAnswers[currentQuestionIndex] = selectedIndex;

  const optionsContainer = document.getElementById('options-container');
  const nextBtn = document.getElementById('next-btn');
  const allOptionBtns = optionsContainer.querySelectorAll('.option-btn');

  allOptionBtns.forEach(btn => {
    btn.style.backgroundColor = 'var(--bg-subcard)';
    btn.style.borderColor = 'var(--border-sub)';
  });

  selectedBtn.style.backgroundColor = '#0284c7';
  selectedBtn.style.borderColor = '#38bdf8';

  if (nextBtn) nextBtn.classList.remove('hidden');
}

const nextBtn = document.getElementById('next-btn');
if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      renderQuizQuestion();
    } else {
      finishSession();
    }
  });
}

// Session Completion Handler
function finishSession() {
  clearInterval(timerInterval);
  cancelAutoScroll();

  // Remove saved study progress when finished
  if (sessionConfig && sessionConfig.mode === 'study') {
    const studyProgressKey = `saved_study_y${sessionConfig.year}_${sessionConfig.subject.toLowerCase()}`;
    localStorage.removeItem(studyProgressKey);
  }

  if (sessionConfig.mode === 'quiz') {
    userScore = 0;
    questions.forEach((q, idx) => {
      const chosen = userAnswers[idx];
      const isCorrect = chosen !== null && chosen === q.correctIndex;
      if (isCorrect) userScore++;
      recordQuestionResult(q, isCorrect, sessionConfig.year, sessionConfig.subject);
    });
  }

  isSessionActive = false;

  const lastQuizResult = {
    questions: questions,
    userAnswers: userAnswers,
    userScore: userScore,
    year: sessionConfig.year,
    subject: sessionConfig.subject,
    mode: sessionConfig.mode
  };

  sessionStorage.setItem('lastQuizResult', JSON.stringify(lastQuizResult));
  window.location.href = 'result.html';
}
