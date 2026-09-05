// ==========================================================================
// QUIZ & STUDY RUNNER LOGIC (quiz.js)
// ==========================================================================

const IMAGE_BASE_URL = 'https://notmax442.github.io/testforuhs-images/';

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
  // Detect page refresh inside active session -> Redirect back to home
  const navEntries = performance.getEntriesByType('navigation');
  if (navEntries.length > 0 && navEntries[0].type === 'reload') {
    const rawConfig = sessionStorage.getItem('activeSessionConfig');
    if (rawConfig) {
      try {
        const config = JSON.parse(rawConfig);
        sessionStorage.setItem('lastView', 'professor');
        sessionStorage.setItem('lastActiveMajor', config.major);
        sessionStorage.setItem('lastActiveYear', config.year);
        sessionStorage.setItem('lastActiveSemester', config.semester);
        sessionStorage.setItem('lastActiveSubject', config.subject);
      } catch (e) {}
    }
    window.location.href = '/';
    return;
  }

  const rawConfig = sessionStorage.getItem('activeSessionConfig');
  if (!rawConfig) {
    window.location.href = '/';
    return;
  }

  sessionConfig = JSON.parse(rawConfig);

  // Sync navigation view state
  sessionStorage.setItem('lastView', 'professor');
  sessionStorage.setItem('lastActiveMajor', sessionConfig.major);
  sessionStorage.setItem('lastActiveYear', sessionConfig.year);
  sessionStorage.setItem('lastActiveSemester', sessionConfig.semester);
  sessionStorage.setItem('lastActiveSubject', sessionConfig.subject);

  // Wire up Fullscreen Button
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullscreen);
  }

  // Wire up Image Zoom Modal Dismissal
  const imageZoomModal = document.getElementById('image-zoom-modal');
  if (imageZoomModal) {
    imageZoomModal.addEventListener('click', () => {
      imageZoomModal.classList.add('hidden');
    });
  }

  // Wire up "Next Question" button click handler
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

  // Floating Navigation Handlers
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  const goLatestQBtn = document.getElementById('go-latest-q-btn');

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (goLatestQBtn) {
    goLatestQBtn.addEventListener('click', () => {
      scrollToLatestUnansweredQuestion();
    });
  }

  setupNavigationGuards();
  await initSession();
});

// Helper: Extract image filenames as an array (supports images: [] or image: "")
function getImageList(q) {
  if (Array.isArray(q.images) && q.images.length > 0) {
    return q.images.map(img => img.trim()).filter(Boolean);
  }
  if (q.image && typeof q.image === 'string' && q.image.trim() !== '') {
    return [q.image.trim()];
  }
  return [];
}

// Helper: Open Zoom Modal
function openZoomModal(imgSrc) {
  const zoomModal = document.getElementById('image-zoom-modal');
  const zoomedImg = document.getElementById('zoomed-image');
  if (zoomModal && zoomedImg) {
    zoomedImg.src = imgSrc;
    zoomModal.classList.remove('hidden');
  }
}

// Helper for generating filename/storage key slugs
function getProfSlug(profName) {
  if (!profName) return '';
  return profName
    .toLowerCase()
    .replace(/\./g, '')           // Strip dots ("Pr." -> "pr")
    .replace(/\s+/g, '-')         // Convert spaces to dashes
    .replace(/[^a-z0-9-&]/g, ''); // Retain letters, numbers, dashes, and ampersands
}

function getStudyStorageKey() {
  const { major, year, semester, subject, professor, isSubjectWide } = sessionConfig;
  if (isSubjectWide) {
    return `saved_study_${major.toLowerCase()}_y${year}_s${semester}_${subject.toLowerCase()}_subject_all`;
  }
  const profSlug = getProfSlug(professor);
  return `saved_study_${major.toLowerCase()}_y${year}_s${semester}_${subject.toLowerCase()}_${profSlug}`;
}

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
      if (sessionConfig && sessionConfig.mode === 'study') {
        descEl.textContent = getTranslation('leave_modal_desc_study');
      } else {
        descEl.textContent = getTranslation('leave_modal_desc_quiz');
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
    try { history.pushState({ guard: true }, '', window.location.href); } catch (e) { }
  };

  pushGuardState();

  window.addEventListener('popstate', () => {
    if (!isSessionActive) return;
    pushGuardState();
    if (isModalOpen) return;

    showLeaveConfirmModal().then((wantsToLeave) => {
      if (wantsToLeave) {
        isSessionActive = false;
        window.location.href = '/';
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
          window.location.href = '/';
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
          window.location.href = '/';
        }
      } else {
        window.location.href = '/';
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
  const { major, year, semester, subject, professor, professors, isSubjectWide, mode, resume } = sessionConfig;
  const sessionInfo = document.getElementById('session-info');
  const loadingOverlay = document.getElementById('loading-overlay');

  if (sessionInfo) {
    const modeLabel = getTranslation(`mode_${mode}`).toUpperCase();
    const targetLabel = isSubjectWide ? 'All Professors' : professor;
    sessionInfo.textContent = `${major} Y${year} S${semester} - ${subject} (${targetLabel}) [${modeLabel} MODE]`;
  }

  isSessionActive = true;
  userScore = 0;
  currentQuestionIndex = 0;
  studyAnsweredCount = 0;

  const studyProgressKey = getStudyStorageKey();

  // Resume saved Study progress
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
      } catch (e) { }
    }
  }

  // Load Missed Vault (Single Professor Only)
  if (mode === 'missed') {
    const profSlug = getProfSlug(professor);
    const key = (typeof getStorageKey === 'function')
      ? getStorageKey(major, year, semester, subject, professor)
      : `missed_${major.toLowerCase()}_y${year}_s${semester}_${subject.toLowerCase()}_${profSlug}`;

    const rawMissed = localStorage.getItem(key);
    if (!rawMissed) {
      alert(getTranslation('no_missed_alert'));
      window.location.href = '/';
      return;
    }
    const missedList = JSON.parse(rawMissed);
    userAnswers = new Array(missedList.length).fill(null);
    questions = shuffleArray(missedList).map(q => prepareShuffledQuestion(q));
    renderStudyMode();
    return;
  }

  if (loadingOverlay) loadingOverlay.classList.remove('hidden');

  try {
    let rawQuestions = [];

    if (isSubjectWide && Array.isArray(professors) && professors.length > 0) {
      // --- Fetch JSONs for ALL professors in parallel ---
      const fetchPromises = professors.map(async (profName) => {
        const pSlug = getProfSlug(profName);
        const filePath = `data/${major.toLowerCase()}/year${year}/sem${semester}/${subject.toLowerCase()}/${pSlug}.json`;
        try {
          const res = await fetch(`${filePath}?t=${Date.now()}`);
          if (!res.ok) return [];
          const data = await res.json();
          // Tag each question with its professor's name for vault routing
          return (data.questions || []).map(q => ({ ...q, professor: profName }));
        } catch (err) {
          console.warn(`Could not load questions for ${profName}:`, err);
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      rawQuestions = results.flat();
    } else {
      // --- Single Professor JSON Fetch ---
      const profSlug = getProfSlug(professor);
      const filePath = `data/${major.toLowerCase()}/year${year}/sem${semester}/${subject.toLowerCase()}/${profSlug}.json`;
      const response = await fetch(`${filePath}?t=${Date.now()}`);
      if (!response.ok) throw new Error(`File not found at: ${filePath}`);
      const data = await response.json();
      rawQuestions = (data.questions || []).map(q => ({ ...q, professor: professor }));
    }

    if (rawQuestions.length === 0) {
      throw new Error("No questions available.");
    }

    let processed = shuffleArray(rawQuestions);
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
    alert(getTranslation('load_error_alert', { path: subject }));
    window.location.href = '/';
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
      alert(getTranslation('time_up_alert'));
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

// Auto-save Study progress
function saveStudyProgress() {
  if (sessionConfig && sessionConfig.mode === 'study') {
    const studyProgressKey = getStudyStorageKey();
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

  if (progressText) {
    progressText.textContent = getTranslation('study_progress', {
      total: questions.length,
      answered: studyAnsweredCount
    });
  }
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

    // Render Question Images for Study Mode
    const imgList = getImageList(q);
    if (imgList.length > 0) {
      const imgWrapper = document.createElement('div');
      imgWrapper.style.cssText = 'text-align: center; margin: 1rem 0; display: flex; flex-direction: column; gap: 0.75rem; align-items: center;';

      imgList.forEach((imgName) => {
        const img = document.createElement('img');
        const fullImgUrl = IMAGE_BASE_URL + imgName;
        img.src = fullImgUrl;
        img.alt = `Diagram for question ${qIndex + 1}`;
        img.className = 'question-img';
        img.addEventListener('click', () => openZoomModal(fullImgUrl));
        imgWrapper.appendChild(img);
      });

      qCard.appendChild(imgWrapper);
    }

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

  const studyNavControls = document.getElementById('study-nav-controls');
  if (studyNavControls) {
    studyNavControls.classList.remove('hidden');
    window.removeEventListener('scroll', handleStudyScroll);
    window.addEventListener('scroll', handleStudyScroll);
    handleStudyScroll();
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

  if (typeof recordQuestionResult === 'function') {
    const targetProf = q.professor || sessionConfig.professor;
    recordQuestionResult(
      q,
      isCorrect,
      sessionConfig.major,
      sessionConfig.year,
      sessionConfig.semester,
      sessionConfig.subject,
      targetProf
    );
  }
  studyAnsweredCount++;

  saveStudyProgress();

  const progressText = document.getElementById('progress-text');
  if (progressText) {
    progressText.textContent = getTranslation('study_progress', {
      total: questions.length,
      answered: studyAnsweredCount
    });
  }

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
  const nextBtn = document.getElementById('next-btn');
  const optionsContainer = document.getElementById('options-container');
  const progressText = document.getElementById('progress-text');
  const questionText = document.getElementById('question-text');
  const imgWrapper = document.getElementById('question-image-wrapper');

  if (nextBtn) nextBtn.classList.add('hidden');
  if (optionsContainer) optionsContainer.innerHTML = '';

  const q = questions[currentQuestionIndex];
  if (progressText) {
    progressText.textContent = getTranslation('quiz_progress', {
      current: currentQuestionIndex + 1,
      total: questions.length
    });
  }
  
  if (questionText) questionText.textContent = q.question;

  // Handle Question Images in Quiz Mode
  if (imgWrapper) {
    const imgList = getImageList(q);
    imgWrapper.innerHTML = '';

    if (imgList.length > 0) {
      imgWrapper.style.display = 'flex';
      imgWrapper.style.flexDirection = 'column';
      imgWrapper.style.gap = '0.75rem';
      imgWrapper.style.alignItems = 'center';

      imgList.forEach((imgName) => {
        const img = document.createElement('img');
        const fullImgUrl = IMAGE_BASE_URL + imgName;
        img.src = fullImgUrl;
        img.alt = 'Question Diagram';
        img.className = 'question-img';
        img.addEventListener('click', () => openZoomModal(fullImgUrl));
        imgWrapper.appendChild(img);
      });

      imgWrapper.classList.remove('hidden');
    } else {
      imgWrapper.classList.add('hidden');
    }
  }

  if (nextBtn) {
    nextBtn.textContent = (currentQuestionIndex === questions.length - 1)
      ? getTranslation('btn_finish_quiz')
      : getTranslation('btn_next_question');
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

  const isAutoAdvance = localStorage.getItem('auto_advance_quiz') === 'true';
  if (isAutoAdvance) {
    allOptionBtns.forEach(btn => btn.style.pointerEvents = 'none');

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuizQuestion();
      } else {
        finishSession();
      }
    }, 400);
  }
}

// Session Completion Handler
function finishSession() {
  clearInterval(timerInterval);
  cancelAutoScroll();

  if (sessionConfig && sessionConfig.mode === 'study') {
    const studyProgressKey = getStudyStorageKey();
    localStorage.removeItem(studyProgressKey);
  }

  if (sessionConfig.mode === 'quiz') {
    userScore = 0;
    questions.forEach((q, idx) => {
      const chosen = userAnswers[idx];
      const isAnswered = chosen !== null && chosen !== undefined;
      const isCorrect = isAnswered && chosen === q.correctIndex;

      if (isCorrect) userScore++;

      if (isAnswered && typeof recordQuestionResult === 'function') {
        const targetProf = q.professor || sessionConfig.professor;
        recordQuestionResult(
          q,
          isCorrect,
          sessionConfig.major,
          sessionConfig.year,
          sessionConfig.semester,
          sessionConfig.subject,
          targetProf
        );
      }
    });
  }

  isSessionActive = false;

  const lastQuizResult = {
    questions: questions,
    userAnswers: userAnswers,
    userScore: userScore,
    major: sessionConfig.major,
    year: sessionConfig.year,
    semester: sessionConfig.semester,
    subject: sessionConfig.subject,
    professor: sessionConfig.professor,
    mode: sessionConfig.mode
  };

  sessionStorage.setItem('lastQuizResult', JSON.stringify(lastQuizResult));
  window.location.href = '/result';
}

function handleStudyScroll() {
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  const goLatestQBtn = document.getElementById('go-latest-q-btn');
  const currentScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

  if (currentScroll > 150) {
    if (scrollTopBtn) scrollTopBtn.classList.remove('hidden');
  } else {
    if (scrollTopBtn) scrollTopBtn.classList.add('hidden');
  }

  const targetIndex = userAnswers.findIndex(ans => ans === null);
  if (targetIndex === -1) {
    if (goLatestQBtn) goLatestQBtn.classList.add('hidden');
    return;
  }

  const targetCard = document.getElementById(`q-card-${targetIndex}`);
  if (targetCard) {
    const rect = targetCard.getBoundingClientRect();
    const isOutOfView = rect.bottom < 0 || rect.top > window.innerHeight;
    if (isOutOfView) {
      if (goLatestQBtn) goLatestQBtn.classList.remove('hidden');
    } else {
      if (goLatestQBtn) goLatestQBtn.classList.add('hidden');
    }
  }
}

function scrollToLatestUnansweredQuestion() {
  const targetIndex = userAnswers.findIndex(ans => ans === null);
  if (targetIndex !== -1) {
    const targetCard = document.getElementById(`q-card-${targetIndex}`);
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

// Fullscreen Toggle Logic
function toggleFullscreen() {
  const docEl = document.documentElement;
  const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;

  if (!isFs) {
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen().catch((err) => console.warn(`Fullscreen error: ${err.message}`));
    } else if (docEl.webkitRequestFullscreen) {
      docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) {
      docEl.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}

['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(eventType => {
  document.addEventListener(eventType, () => {
    const fsBtn = document.getElementById('fullscreen-btn');
    const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    if (fsBtn) {
      fsBtn.textContent = isFs ? getTranslation('btn_exit_fullscreen') : getTranslation('btn_fullscreen');
    }
  });
});
