// ==========================================================================
// HOME PAGE LOGIC (home.js)
// ==========================================================================

let manifestData = {};

async function loadManifestData() {
  try {
    const res = await fetch('./data/manifest.json');
    if (res.ok) {
      manifestData = await res.json();
    }
  } catch (err) {
    console.warn('Could not load manifest.json:', err);
  }
}
loadManifestData();

let currentMajor = null;
let currentYear = null;
let currentSemester = null;
let currentSubject = null;

function getProfName(prof) {
  return typeof prof === 'object' && prof !== null ? prof.name : prof;
}

function toggleProfDrawer(drawerId, btnEl) {
  const drawer = document.getElementById(drawerId);
  if (!drawer) return;
  const isHidden = drawer.classList.contains('hidden');
  if (isHidden) {
    drawer.classList.remove('hidden');
    btnEl.classList.add('open');
  } else {
    drawer.classList.add('hidden');
    btnEl.classList.remove('open');
  }
}

async function fetchProfQuestionCount(major, year, semester, subject, profName, badgeEl) {
  if (!badgeEl) return;
  try {
    const config = { major, year, semester, subject };
    const questions = typeof StudyRepository !== 'undefined'
      ? await StudyRepository.loadQuestions(config, profName)
      : [];
    const count = questions.length;
    if (count > 0) {
      badgeEl.textContent = `${count} Qs`;
      badgeEl.style.display = 'inline-block';
    }
  } catch (e) {
    console.error(`Error loading questions for ${profName}:`, e);
  }
}

async function fetchSubjectQuestionCount(major, year, semester, subject, professors, countEl) {
  if (!countEl || !Array.isArray(professors)) return;

  try {
    const config = { major, year, semester, subject };
    const counts = await Promise.all(professors.map(async profName => {
      try {
        const questions = typeof StudyRepository !== 'undefined'
          ? await StudyRepository.loadQuestions(config, profName)
          : [];
        return questions.length;
      } catch (e) {
        console.error(`Error loading questions for ${profName}:`, e);
        return 0;
      }
    }));

    const total = counts.reduce((sum, count) => sum + count, 0);
    countEl.textContent = getTranslation('subject_study_all_count', { count: total });
  } catch (e) {
    console.error(`Error loading subject question count for ${subject}:`, e);
    countEl.textContent = '';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadManifestData();
  setupNavigation();
  restoreLastView();
  initUpdateSystem();
});

function showScreen(screenId, direction = 'forward') {
  const screens = ['landing-screen', 'major-screen', 'year-screen', 'semester-screen', 'subject-screen', 'professor-screen'];
  const currentVisibleId = screens.find(id => {
    const el = document.getElementById(id);
    return el && !el.classList.contains('hidden');
  });
  const currentEl = document.getElementById(currentVisibleId);
  const targetEl = document.getElementById(screenId);

  if (!targetEl || currentVisibleId === screenId) return;

  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('slide-in-right', 'slide-out-left', 'slide-in-left', 'slide-out-right');
  });

  if (currentEl && direction !== 'none') {
    const exitClass = direction === 'forward' ? 'slide-out-left' : 'slide-out-right';
    const enterClass = direction === 'forward' ? 'slide-in-right' : 'slide-in-left';
    currentEl.classList.add(exitClass);
    targetEl.classList.remove('hidden');
    targetEl.classList.add(enterClass);
    setTimeout(() => {
      currentEl.classList.add('hidden');
      currentEl.classList.remove(exitClass);
      targetEl.classList.remove(enterClass);
    }, 180);
  } else {
    screens.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === screenId) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
    });
  }
}

function setupNavigation() {
  const enterStudyBtn = document.getElementById('enter-study-btn');
  const backToLandingBtn = document.getElementById('back-to-landing-btn');
  const backToMajorsBtn = document.getElementById('back-to-majors-btn');
  const backToYearsBtn = document.getElementById('back-to-years-btn');
  const backToSemestersBtn = document.getElementById('back-to-semesters-btn');
  const backToSubjectsBtn = document.getElementById('back-to-subjects-btn');

  if (enterStudyBtn) {
    enterStudyBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'major');
      showScreen('major-screen', 'forward');
    });
  }

  if (backToLandingBtn) {
    backToLandingBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'landing');
      sessionStorage.removeItem('lastActiveMajor');
      showScreen('landing-screen', 'back');
    });
  }

  document.querySelectorAll('#major-grid .year-card').forEach(card => {
    card.addEventListener('click', () => {
      currentMajor = card.getAttribute('data-major');
      sessionStorage.setItem('lastActiveMajor', currentMajor);
      sessionStorage.setItem('lastView', 'year');
      showYears(currentMajor, 'forward');
    });
  });

  if (backToMajorsBtn) {
    backToMajorsBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'major');
      sessionStorage.removeItem('lastActiveYear');
      showScreen('major-screen', 'back');
    });
  }

  document.querySelectorAll('#year-screen .year-card').forEach(card => {
    card.addEventListener('click', () => {
      currentYear = card.getAttribute('data-year');
      sessionStorage.setItem('lastActiveYear', currentYear);
      sessionStorage.setItem('lastView', 'semester');
      showSemesters(currentMajor, currentYear, 'forward');
    });
  });

  if (backToYearsBtn) {
    backToYearsBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'year');
      sessionStorage.removeItem('lastActiveSemester');
      showYears(currentMajor, 'back');
    });
  }

  document.querySelectorAll('#semester-screen .year-card').forEach(card => {
    card.addEventListener('click', () => {
      currentSemester = card.getAttribute('data-semester');
      sessionStorage.setItem('lastActiveSemester', currentSemester);
      sessionStorage.setItem('lastView', 'subject');
      showSubjects(currentMajor, currentYear, currentSemester, 'forward');
    });
  });

  if (backToSemestersBtn) {
    backToSemestersBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'semester');
      sessionStorage.removeItem('lastActiveSubject');
      showSemesters(currentMajor, currentYear, 'back');
    });
  }

  if (backToSubjectsBtn) {
    backToSubjectsBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'subject');
      showSubjects(currentMajor, currentYear, currentSemester, 'back');
    });
  }
}

function restoreLastView() {
  const savedView = sessionStorage.getItem('lastView');
  currentMajor = sessionStorage.getItem('lastActiveMajor');
  currentYear = sessionStorage.getItem('lastActiveYear');
  currentSemester = sessionStorage.getItem('lastActiveSemester');
  currentSubject = sessionStorage.getItem('lastActiveSubject');

  if (savedView === 'professor' && currentMajor && currentYear && currentSemester && currentSubject) {
    showProfessors(currentMajor, currentYear, currentSemester, currentSubject, 'none');
  } else if (savedView === 'subject' && currentMajor && currentYear && currentSemester) {
    showSubjects(currentMajor, currentYear, currentSemester, 'none');
  } else if (savedView === 'semester' && currentMajor && currentYear) {
    showSemesters(currentMajor, currentYear, 'none');
  } else if (savedView === 'year' && currentMajor) {
    showYears(currentMajor, 'none');
  } else if (savedView === 'major') {
    showScreen('major-screen', 'none');
  } else {
    showScreen('landing-screen', 'none');
  }
}

function showYears(major, direction = 'forward') {
  showScreen('year-screen', direction);
  const title = document.getElementById('selected-major-title');
  if (title) title.textContent = getTranslation('title_select_year', { major });
}

function showSemesters(major, year, direction = 'forward') {
  showScreen('semester-screen', direction);
  const title = document.getElementById('selected-year-title');
  if (title) title.textContent = getTranslation('title_select_semester', { major, year });
}

function showSubjects(major, year, semester, direction = 'forward') {
  showScreen('subject-screen', direction);
  const title = document.getElementById('selected-subject-screen-title');
  if (title) title.textContent = getTranslation('title_subjects', { major, year, semester });
  const subjectList = document.getElementById('subject-list');
  if (!subjectList) return;
  subjectList.innerHTML = '';

  const subjects = manifestData[major]?.[year]?.[semester]
    ? Object.keys(manifestData[major][year][semester])
    : [];

  if (subjects.length === 0) {
    subjectList.innerHTML = `
      <div class="empty-state-card" style="cursor: default; text-align: center; padding: 2.5rem 1.5rem;">
        <h3 style="color: var(--text-heading); font-size: 1.4rem; margin-bottom: 0.5rem;">${getTranslation('coming_soon_title')}</h3>
        <p style="color: var(--text-sub); font-size: 0.95rem; margin-bottom: 0;">${getTranslation('coming_soon_sub')}</p>
      </div>
    `;
    return;
  }

  subjects.forEach(subject => {
    const card = document.createElement('div');
    card.classList.add('subject-card');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML = `
      <h3>${subject}</h3>
      <p style="color:var(--text-sub); font-size:0.85rem; margin-bottom: 0;">${getTranslation('click_select_prof')}</p>
    `;
    const triggerSelect = () => {
      currentSubject = subject;
      sessionStorage.setItem('lastActiveSubject', currentSubject);
      sessionStorage.setItem('lastView', 'professor');
      showProfessors(major, year, semester, subject, 'forward');
    };
    card.addEventListener('click', triggerSelect);
    subjectList.appendChild(card);
  });

  if (window.lucide) {
    lucide.createIcons();
  }
}

async function showProfessors(major, year, semester, subject, direction = 'forward') {
  showScreen('professor-screen', direction);
  const title = document.getElementById('selected-prof-screen-title');
  if (title) title.textContent = getTranslation('title_select_prof', { subject });
  const profList = document.getElementById('professor-list');
  if (!profList) return;
  profList.innerHTML = '';

  const professors = manifestData[major]?.[year]?.[semester]?.[subject] || [];

  if (professors.length === 0) {
    profList.innerHTML = `
      <div class="empty-state-card" style="cursor: default; text-align: center; padding: 2.5rem 1.5rem;">
        <h3 style="color: var(--text-heading); font-size: 1.4rem; margin-bottom: 0.5rem;">${getTranslation('coming_soon_title')}</h3>
        <p style="color: var(--text-sub); font-size: 0.95rem; margin-bottom: 0;">${getTranslation('coming_soon_sub')}</p>
      </div>
    `;
    return;
  }

  const isSingleProf = professors.length === 1;

  if (!isSingleProf) {
    const subjectWideConfig = {
      major,
      year,
      semester,
      subject,
      isSubjectWide: true
    };
    const subjectWideProgress = typeof StudyRepository !== 'undefined'
      ? await StudyRepository.getStudyProgress(subjectWideConfig)
      : null;
    const subjectWideAnswered = subjectWideProgress?.studyAnsweredCount || 0;
    const subjectWideTotal = Array.isArray(subjectWideProgress?.questions)
      ? subjectWideProgress.questions.length
      : 0;
    const canContinueSubjectStudy = subjectWideAnswered > 0 && subjectWideAnswered < subjectWideTotal;
    const continueSubjectButtonHTML = canContinueSubjectStudy
      ? `<button class="btn continue-btn" style="flex: 1; min-width: 180px; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;" onclick="continueSubjectStudySession()">
          <i data-lucide="play" style="width: 16px; height: 16px;"></i> ${getTranslation('btn_continue_study_all', { answered: subjectWideAnswered, total: subjectWideTotal })}
        </button>`
      : '';
    const studyAllLabel = canContinueSubjectStudy
      ? getTranslation('btn_restart_study')
      : getTranslation('btn_subject_study_all');
    const studyAllIcon = canContinueSubjectStudy ? 'rotate-ccw' : 'book-open';

    const subjectBanner = document.createElement('div');
    subjectBanner.classList.add('subject-card', 'prof-card');
    subjectBanner.style.cssText = 'margin-bottom: 1rem; border-left: 4px solid var(--accent, #38bdf8); background: var(--bg-subcard, #1e293b); padding: 1.25rem; border-radius: 10px;';
    subjectBanner.innerHTML = `
      <h3 style="margin: 0 0 0.25rem 0; font-size: 1.1rem; color: var(--text-main);">
        ${getTranslation('subject_assessments_title', { subject })}
      </h3>
      <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: var(--text-sub);">
        ${getTranslation('subject_assessments_desc')}
      </p>
      <div class="btn-row-dual" style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn quiz-btn" style="flex: 1; min-width: 180px; background: #10b981; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;" onclick="startSubjectSession('quiz')">
          <i data-lucide="help-circle" style="width: 16px; height: 16px;"></i> ${getTranslation('btn_subject_quiz')}
        </button>
        <button class="btn study-btn subject-wide-study-btn" style="flex: 1; min-width: 180px; background: #8b5cf6; color: white; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;" onclick="startSubjectSession('study')">
          <i data-lucide="${studyAllIcon}" style="width: 16px; height: 16px;"></i> ${studyAllLabel}
        </button>
      </div>
      ${continueSubjectButtonHTML ? `<div class="btn-row-dual" style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 0.75rem;">${continueSubjectButtonHTML}</div>` : ''}
      <p id="subject-study-all-count" style="margin: 0.75rem 0 0; font-size: 0.85rem; color: var(--text-sub); text-align: center;">
        ${getTranslation('subject_study_all_count_loading')}
      </p>
    `;
    profList.appendChild(subjectBanner);
    fetchSubjectQuestionCount(
      major,
      year,
      semester,
      subject,
      professors.map(getProfName),
      subjectBanner.querySelector('#subject-study-all-count')
    );
  }

  professors.forEach(async profItem => {
    const profName = getProfName(profItem);
    const profSlug = getProfSlug(profName);
    const storageKey = getStorageKey(major, year, semester, subject, profName);
    const savedMissed = typeof StudyRepository !== 'undefined'
      ? await StudyRepository.getMissedQuestions(storageKey)
      : [];
    const missedCount = savedMissed.length;

    const studyKey = `saved_study_${major.toLowerCase()}_y${year}_s${semester}_${subject.toLowerCase()}_${profSlug}`;
    const studyProgress = typeof StudyRepository !== 'undefined'
      ? await StudyRepository.getStudyProgress({ major, year, semester, subject, professor: profName })
      : null;

    let continueBtnHTML = '';
    let studyBtnLabel = isSingleProf ? getTranslation('btn_subject_study_all') : getTranslation('btn_study');
    let studyIcon = 'book-open';

    if (studyProgress && studyProgress.studyAnsweredCount > 0) {
      const answered = studyProgress.studyAnsweredCount;
      const total = studyProgress.questions ? studyProgress.questions.length : 0;
      if (answered < total) {
        const continueText = getTranslation('btn_continue_study', { answered, total });
        continueBtnHTML = `<button class="btn continue-btn" style="display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;" onclick="continueStudySession('${profName}')"><i data-lucide="play" style="width: 16px; height: 16px;"></i> ${continueText}</button>`;
        studyBtnLabel = getTranslation('btn_restart_study');
        studyIcon = 'rotate-ccw';
      }
    }

    const canDownloadOffline = typeof window !== 'undefined'
      && typeof isOfflineModeEnabled === 'function'
      && isOfflineModeEnabled()
      && window.OfflineRepository
      && typeof window.OfflineRepository.downloadPackage === 'function';
    const hasDrawerContent = continueBtnHTML || missedCount > 0 || canDownloadOffline;
    const drawerId = `drawer-${profSlug}`;

    const card = document.createElement('div');
    card.classList.add('subject-card', 'prof-card');

    let primaryActionsHTML = '';
    if (isSingleProf) {
      primaryActionsHTML = `
        <div class="subject-actions" style="display: flex; gap: 0.5rem; width: 100%;">
          <button class="btn quiz-btn" style="flex: 1; background: #10b981; color: white; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;" onclick="startSession('${profName}', 'quiz')">
            <i data-lucide="help-circle" style="width: 16px; height: 16px;"></i> ${getTranslation('btn_subject_quiz')}
          </button>
          <button class="btn study-btn" style="flex: 1; background: #0284c7; color: white; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;" onclick="startSession('${profName}', 'study')">
            <i data-lucide="${studyIcon}" style="width: 16px; height: 16px;"></i> ${studyBtnLabel}
          </button>
        </div>
      `;
    } else {
      primaryActionsHTML = `
        <div class="subject-actions" style="width: 100%;">
          <button class="btn study-btn" style="width: 100%; background: #0284c7; color: white; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;" onclick="startSession('${profName}', 'study')">
            <i data-lucide="${studyIcon}" style="width: 16px; height: 16px;"></i> ${studyBtnLabel}
          </button>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="prof-card-top" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; width: 100%;">
        <div>
          <h3 style="margin: 0;">${profName}</h3>
          ${missedCount > 0 ? `<p class="missed-badge" style="margin: 0.25rem 0 0 0; display: inline-flex; align-items: center; gap: 0.3rem;">${getTranslation('missed_badge', { count: missedCount })}</p>` : ''}
        </div>
        <span class="prof-q-badge" style="display: none;"></span>
      </div>
      <div style="margin-top: 0.75rem; width: 100%;">
        ${primaryActionsHTML}
      </div>
      ${hasDrawerContent ? `
        <button class="drawer-toggle-btn" onclick="toggleProfDrawer('${drawerId}', this)" style="display: flex; align-items: center; gap: 0.4rem; width: 100%;">
          <i data-lucide="settings" style="width: 16px; height: 16px;"></i>
          <span>Saved Progress & Missed</span>
          <i data-lucide="chevron-down" class="chevron" style="width: 16px; height: 16px; margin-left: auto;"></i>
        </button>
        <div id="${drawerId}" class="prof-drawer hidden">
          ${continueBtnHTML}
          ${canDownloadOffline ? `
            <button class="btn secondary-btn" style="display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; width: 100%; margin-top: 0.35rem;" onclick="downloadProfessorOfflinePackage('${profName}')">
              <i data-lucide="download" style="width: 16px; height: 16px;"></i> ${getTranslation('offline_download')}
            </button>
          ` : ''}
          ${missedCount > 0 ? `
            <div class="btn-row-dual" style="margin-top: 0.35rem; display: flex; gap: 0.5rem;">
              <button class="btn study-missed-btn" style="display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;" onclick="startMissedSession('${profName}')">
                <i data-lucide="target" style="width: 16px; height: 16px;"></i> ${getTranslation('btn_review_missed')}
              </button>
              <button class="btn clear-btn" style="display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;" onclick="clearSavedMissed('${profName}')">
                <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i> ${getTranslation('btn_clear_missed')}
              </button>
            </div>
          ` : ''}
        </div>
      ` : ''}
    `;

    profList.appendChild(card);
    if (window.lucide) {
      lucide.createIcons({ attrs: { 'aria-hidden': 'true' } });
    }
    const badgeEl = card.querySelector('.prof-q-badge');
    fetchProfQuestionCount(major, year, semester, subject, profName, badgeEl);
  });

  if (window.lucide) {
    lucide.createIcons();
  }
}

function startSubjectSession(mode) {
  const rawProfList = manifestData[currentMajor]?.[currentYear]?.[currentSemester]?.[currentSubject] || [];
  const professors = rawProfList.map(getProfName);
  const sessionConfig = {
    major: currentMajor,
    year: currentYear,
    semester: currentSemester,
    subject: currentSubject,
    professors: professors,
    isSubjectWide: true,
    mode: mode,
    resume: false
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = 'quiz';
}

function continueSubjectStudySession() {
  const rawProfList = manifestData[currentMajor]?.[currentYear]?.[currentSemester]?.[currentSubject] || [];
  const professors = rawProfList.map(getProfName);
  const sessionConfig = {
    major: currentMajor,
    year: currentYear,
    semester: currentSemester,
    subject: currentSubject,
    professors,
    isSubjectWide: true,
    mode: 'study',
    resume: true
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = 'quiz';
}

function startSession(profName, mode) {
  const sessionConfig = {
    major: currentMajor,
    year: currentYear,
    semester: currentSemester,
    subject: currentSubject,
    professor: profName,
    isSubjectWide: false,
    mode: mode,
    resume: false
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = 'quiz';
}

function continueStudySession(profName) {
  const sessionConfig = {
    major: currentMajor,
    year: currentYear,
    semester: currentSemester,
    subject: currentSubject,
    professor: profName,
    isSubjectWide: false,
    mode: 'study',
    resume: true
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = 'quiz';
}

function startMissedSession(profName) {
  const sessionConfig = {
    major: currentMajor,
    year: currentYear,
    semester: currentSemester,
    subject: currentSubject,
    professor: profName,
    isSubjectWide: false,
    mode: 'missed',
    resume: false
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = 'quiz';
}

function clearSavedMissed(profName) {
  const profSlug = profName.toLowerCase().replace(/\s+/g, '-');
  const key = (typeof getStorageKey === 'function')
    ? getStorageKey(currentMajor, currentYear, currentSemester, currentSubject, profName)
    : `missed_${currentMajor.toLowerCase()}_y${currentYear}_s${currentSemester}_${currentSubject.toLowerCase()}_${profSlug}`;
  if (typeof StudyRepository !== 'undefined') {
    StudyRepository.saveMissedQuestions(key, []).then(() => showProfessors(currentMajor, currentYear, currentSemester, currentSubject, 'none'));
  } else {
    localStorage.removeItem(key);
  }
  if (typeof StudyRepository === 'undefined') showProfessors(currentMajor, currentYear, currentSemester, currentSubject, 'none');
}

async function downloadProfessorOfflinePackage(profName) {
  if (typeof isOfflineModeEnabled !== 'function' || !isOfflineModeEnabled()
    || !window.OfflineRepository || typeof window.OfflineRepository.downloadPackage !== 'function') {
    return;
  }

  try {
    const config = {
      major: currentMajor,
      year: currentYear,
      semester: currentSemester,
      subject: currentSubject
    };

    const questions = typeof StudyRepository !== 'undefined'
      ? await StudyRepository.loadQuestions(config, profName)
      : [];

    const saved = await window.OfflineRepository.downloadPackage(config, profName, questions);
    if (saved) {
      const statusMsg = getTranslation('offline_downloaded');
      if (window.alert) {
        window.alert(`${statusMsg}\n${profName}`);
      }
    }
  } catch (error) {
    console.error('Could not save offline package:', error);
    if (window.alert) {
      window.alert(getTranslation('offline_download_failed'));
    }
  }
}

// UPDATE NOTIFICATION SYSTEM
const APP_VERSION = "1.1.0";
let patchNotesEN = "";
let patchNotesKM = "";
let currentModalLang = "EN";

async function initUpdateSystem() {
  const versionBadge = document.getElementById('update-version-badge');
  if (versionBadge) versionBadge.textContent = `v${APP_VERSION}`;
  setupUpdateModalListeners();

  const lastSeenVersion = localStorage.getItem('lastSeenUpdateVersion');
  if (lastSeenVersion !== APP_VERSION) {
    await fetchPatchNotes();
    showUpdateModal();
  }
}

async function fetchPatchNotes() {
  try {
    const [resEN, resKM] = await Promise.all([
      fetch(`english-update.txt?v=${APP_VERSION}`),
      fetch(`khmer-update.txt?v=${APP_VERSION}`)
    ]);
    patchNotesEN = resEN.ok ? await resEN.text() : "No English release notes available.";
    patchNotesKM = resKM.ok ? await resKM.text() : "មិនមានកំណត់ចំណាំការអាប់ដេតភាសាខ្មែរទេ។";
  } catch (e) {
    patchNotesEN = "Failed to load release notes.";
    patchNotesKM = "បរាជ័យក្នុងការទាញយកកំណត់ចំណាំការអាប់ដេត។";
  }
  renderModalContent();
}

function parseSimpleMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/^## (.*$)/gim, '<h3 style="margin: 1rem 0 0.4rem; color: var(--text-heading);">$1</h3>');
  html = html.replace(/^[\-\*]\s+(.*$)/gim, '<li style="margin-left: 1.2rem; list-style-type: disc; margin-bottom: 0.25rem;">$1</li>');
  return html;
}

function renderModalContent() {
  const container = document.getElementById('update-text-container');
  if (!container) return;
  const rawText = currentModalLang === "EN" ? patchNotesEN : patchNotesKM;
  container.innerHTML = parseSimpleMarkdown(rawText);
}

function setupUpdateModalListeners() {
  const modal = document.getElementById('update-modal');
  const triggerBtn = document.getElementById('update-info-btn');
  const closeBtn = document.getElementById('close-update-modal-btn');
  const btnEN = document.getElementById('update-lang-en');
  const btnKM = document.getElementById('update-lang-km');

  if (triggerBtn) {
    triggerBtn.addEventListener('click', async () => {
      if (!patchNotesEN) await fetchPatchNotes();
      showUpdateModal();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      localStorage.setItem('lastSeenUpdateVersion', APP_VERSION);
      if (modal) modal.classList.add('hidden');
    });
  }

  if (btnEN && btnKM) {
    btnEN.addEventListener('click', () => {
      currentModalLang = "EN";
      btnEN.classList.add('active');
      btnKM.classList.remove('active');
      renderModalContent();
    });
    btnKM.addEventListener('click', () => {
      currentModalLang = "KM";
      btnKM.classList.add('active');
      btnEN.classList.remove('active');
      renderModalContent();
    });
  }
}

function showUpdateModal() {
  const modal = document.getElementById('update-modal');
  if (modal) modal.classList.remove('hidden');
}