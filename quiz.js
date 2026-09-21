// ==========================================================================
// QUIZ & STUDY RUNNER LOGIC (quiz.js)
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
let studyRenderedCount = 0;
let studyLoadObserver = null;
const STUDY_RENDER_BATCH_SIZE = 12;

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
      } catch (e) { }
    }
    window.location.href = './';
    return;
  }

  const rawConfig = sessionStorage.getItem('activeSessionConfig');
  if (!rawConfig) {
    window.location.href = './';
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

// Helper: Extract image filenames as an array
function getImageList(q) {
  if (Array.isArray(q.images) && q.images.length > 0) {
    return q.images.map(img => img.trim()).filter(Boolean);
  }
  if (q.image && typeof q.image === 'string' && q.image.trim() !== '') {
    return [q.image.trim()];
  }
  return [];
}

function getQuestionImageSource(q, imageName) {
  if (q && q.offlineImages && typeof q.offlineImages[imageName] === 'string') {
    return q.offlineImages[imageName];
  }
  return IMAGE_BASE_URL + imageName;
}

function openZoomModal(imgSrc) {
  const zoomModal = document.getElementById('image-zoom-modal');
  const zoomedImg = document.getElementById('zoomed-image');
  if (zoomModal && zoomedImg) {
    zoomedImg.src = imgSrc;
    zoomModal.classList.remove('hidden');
  }
}

function preloadNextQuestionImages(currentIndex, questionsArray) {
  const nextIndex = currentIndex + 1;
  if (!questionsArray || nextIndex >= questionsArray.length) return;

  const nextQ = questionsArray[nextIndex];
  const imgList = getImageList(nextQ);

  imgList.forEach(imgName => {
    const fullImgUrl = getQuestionImageSource(nextQ, imgName);
    const imgPreloader = new Image();
    imgPreloader.src = fullImgUrl;
  });
}

function getStudyStorageKey() {
  if (typeof StudyRepository !== 'undefined') {
    return StudyRepository.studyKey(sessionConfig);
  }

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
        window.location.href = './';
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
          window.location.href = './';
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
          window.location.href = './';
        }
      } else {
        window.location.href = './';
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

  if (mode === 'study' && resume) {
    const progressData = typeof StudyRepository !== 'undefined'
      ? await StudyRepository.getStudyProgress(sessionConfig)
      : (() => {
        const savedStudyRaw = localStorage.getItem(studyProgressKey);
        try { return savedStudyRaw ? JSON.parse(savedStudyRaw) : null; } catch (e) { return null; }
      })();

    if (progressData) {
      try {
        questions = progressData.questions;
        userAnswers = progressData.userAnswers;
        studyAnsweredCount = progressData.studyAnsweredCount;
        userScore = progressData.userScore;

        renderStudyMode();
        return;
      } catch (e) { }
    }
  }

  if (mode === 'missed') {
    const profSlug = getProfSlug(professor);
    const key = (typeof getStorageKey === 'function')
      ? getStorageKey(major, year, semester, subject, professor)
      : `missed_${major.toLowerCase()}_y${year}_s${semester}_${subject.toLowerCase()}_${profSlug}`;

    const missedList = typeof StudyRepository !== 'undefined'
      ? await StudyRepository.getMissedQuestions(key)
      : (() => {
        const rawMissed = localStorage.getItem(key);
        try { return rawMissed ? JSON.parse(rawMissed) : []; } catch (e) { return []; }
      })();
    if (!missedList || missedList.length === 0) {
      showToast(getTranslation('no_missed_alert'), 'info');
      window.location.href = './';
      return;
    }
    userAnswers = new Array(missedList.length).fill(null);
    questions = shuffleArray(missedList).map(q => prepareShuffledQuestion(q));
    renderStudyMode();
    return;
  }

  if (loadingOverlay) loadingOverlay.classList.remove('hidden');

  try {
    let rawQuestions = [];

    if (isSubjectWide && Array.isArray(professors) && professors.length > 0) {
      const fetchPromises = professors.map(async (profName) => {
        try {
          const loadedQuestions = typeof StudyRepository !== 'undefined'
            ? await StudyRepository.loadQuestions(sessionConfig, profName)
            : [];
          return loadedQuestions.map(q => ({ ...q, professor: profName }));
        } catch (err) {
          console.warn(`Could not load questions for ${profName}:`, err);
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      rawQuestions = results.flat();
    } else {
      const loadedQuestions = typeof StudyRepository !== 'undefined'
        ? await StudyRepository.loadQuestions(sessionConfig, professor)
        : [];
      rawQuestions = loadedQuestions.map(q => ({ ...q, professor }));
    }

    if (rawQuestions.length === 0) {
      throw new Error('No questions available.');
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
    showToast(getTranslation('load_error_alert', { path: subject }), 'error');
    window.location.href = './';
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
      showToast(getTranslation('time_up_alert'), 'warning');
      finishSession();
    }
  }, 1000);
}

function updateTimerUI() {
  const timerDisplay = document.getElementById('timer-display');
  if (!timerDisplay) return;
  const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
  const seconds = String(timeRemaining % 60).padStart(2, '0');

  // Keep clock icon intact while updating timer digits
  const timerText = document.getElementById('timer-text');
  if (timerText) {
    timerText.textContent = `${minutes}:${seconds}`;
  } else {
    timerDisplay.textContent = `⏱️ ${minutes}:${seconds}`;
  }
}

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
    if (typeof StudyRepository !== 'undefined') {
      StudyRepository.saveStudyProgress(sessionConfig, progressData);
    } else {
      localStorage.setItem(studyProgressKey, JSON.stringify(progressData));
    }
  }
}

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

  studyRenderedCount = 0;
  if (studyLoadObserver) studyLoadObserver.disconnect();
  studyLoadObserver = null;
  appendStudyQuestionBatch();

  if (optionsContainer && studyRenderedCount < questions.length && !('IntersectionObserver' in window)) {
    appendStudyQuestionBatch(questions.length - 1);
  } else if (optionsContainer && studyRenderedCount < questions.length) {
    const sentinel = document.createElement('div');
    sentinel.id = 'study-load-sentinel';
    sentinel.style.height = '1px';
    optionsContainer.appendChild(sentinel);
    studyLoadObserver = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        appendStudyQuestionBatch();
      }
    }, { rootMargin: '900px 0px' });
    studyLoadObserver.observe(sentinel);
  }

  if (sessionConfig.resume) {
    const firstUnansweredIndex = userAnswers.findIndex(ans => ans === null);
    if (firstUnansweredIndex > 0) {
      ensureStudyQuestionRendered(firstUnansweredIndex);
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

function appendStudyQuestionBatch(targetIndex = studyRenderedCount + STUDY_RENDER_BATCH_SIZE - 1) {
  const optionsContainer = document.getElementById('options-container');
  if (!optionsContainer || studyRenderedCount >= questions.length) return;

  const sentinel = document.getElementById('study-load-sentinel');
  if (sentinel) sentinel.remove();

  const endIndex = Math.min(questions.length, targetIndex + 1);
  for (let qIndex = studyRenderedCount; qIndex < endIndex; qIndex += 1) {
    const q = questions[qIndex];
    const qCard = document.createElement('div');
    qCard.classList.add('study-q-card');
    qCard.id = `q-card-${qIndex}`;
    qCard.style.cssText = 'margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-color);';

    const qTitle = document.createElement('h3');
    qTitle.textContent = `${qIndex + 1}. ${q.question}`;
    qCard.appendChild(qTitle);

    const imgList = getImageList(q);
    if (imgList.length > 0) {
      const imgWrapper = document.createElement('div');
      imgWrapper.style.cssText = 'text-align: center; margin: 1rem 0; display: flex; flex-direction: column; gap: 0.75rem; align-items: center;';

      imgList.forEach((imgName) => {
        const img = document.createElement('img');
        const fullImgUrl = getQuestionImageSource(q, imgName);
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
  }

  studyRenderedCount = endIndex;
  if (studyRenderedCount < questions.length && studyLoadObserver) {
    const nextSentinel = document.createElement('div');
    nextSentinel.id = 'study-load-sentinel';
    nextSentinel.style.height = '1px';
    optionsContainer.appendChild(nextSentinel);
    studyLoadObserver.observe(nextSentinel);
  }
}

function ensureStudyQuestionRendered(index) {
  if (index < studyRenderedCount) return;
  appendStudyQuestionBatch(index);
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
    ensureStudyQuestionRendered(qIndex + 1);
    const nextCard = document.getElementById(`q-card-${qIndex + 1}`);
    if (nextCard) {
      nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 1000);
}

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
        const fullImgUrl = getQuestionImageSource(q, imgName);
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

  // Uses innerHTML and re-indexes Lucide icons so HTML strings from shared.js render SVGs
  if (nextBtn) {
    nextBtn.innerHTML = (currentQuestionIndex === questions.length - 1)
      ? getTranslation('btn_finish_quiz')
      : getTranslation('btn_next_question');

    if (window.lucide) {
      lucide.createIcons();
    }
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

  preloadNextQuestionImages(currentQuestionIndex, questions);
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

async function finishSession() {
  clearInterval(timerInterval);
  cancelAutoScroll();

  if (sessionConfig && sessionConfig.mode === 'study') {
    const studyProgressKey = getStudyStorageKey();
    if (typeof StudyRepository !== 'undefined') {
      await StudyRepository.clearStudyProgress(sessionConfig);
    } else {
      localStorage.removeItem(studyProgressKey);
    }
  }

  if (sessionConfig.mode === 'quiz') {
    userScore = 0;
    const analyticsWrites = [];
    questions.forEach((q, idx) => {
      const chosen = userAnswers[idx];
      const isAnswered = chosen !== null && chosen !== undefined;
      const isCorrect = isAnswered && chosen === q.correctIndex;

      if (isCorrect) userScore++;

      if (isAnswered && typeof recordQuestionResult === 'function') {
        const targetProf = q.professor || sessionConfig.professor;
        analyticsWrites.push(recordQuestionResult(
          q,
          isCorrect,
          sessionConfig.major,
          sessionConfig.year,
          sessionConfig.semester,
          sessionConfig.subject,
          targetProf
        ));
      }
    });
    await Promise.all(analyticsWrites);
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
  window.location.href = 'result';
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

  ensureStudyQuestionRendered(targetIndex);
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
    ensureStudyQuestionRendered(targetIndex);
    const targetCard = document.getElementById(`q-card-${targetIndex}`);
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

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

// Fixed Fullscreen Toggle Listener (preserves Lucide icon structure)
['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(eventType => {
  document.addEventListener(eventType, () => {
    const fsBtn = document.getElementById('fullscreen-btn');
    const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;

    if (fsBtn) {
      const iconName = isFs ? 'minimize' : 'maximize';
      const textKey = isFs ? 'btn_exit_fullscreen' : 'btn_fullscreen';
      const labelText = typeof getTranslation === 'function'
        ? getTranslation(textKey)
        : (isFs ? 'Exit Fullscreen' : 'Fullscreen');

      fsBtn.innerHTML = `
        <i data-lucide="${iconName}" style="width: 16px; height: 16px;"></i>
        <span>${labelText}</span>
      `;

      if (window.lucide) {
        lucide.createIcons();
      }
    }
  });
});