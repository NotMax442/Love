// ==========================================================================
// HOME PAGE LOGIC (home.js)
// ==========================================================================

// Nested Data Hierarchy: Major -> Year -> Semester -> Subject -> [Professors]
const manifestData = {
  "MED": {
    "1": { "1": {}, "2": {} },
    "2": { 
      "1": {
        "ANATOMIE": [
          "Pr. Ung Chan",
          "Pr. Sin Sagata",
          "Pr. Nhem Aklinn",
          "Pr. Mam Bunsocheat",
          "Pr. Lim Taing & Dr. Meng Sok",
          "Pr. Ich Khuy",
          "Dr. Say Tang"
        ]
      }, 
      "2": {} 
    },
    "3": { "1": {}, "2": {} },
    "4": { "1": {}, "2": {} },
    "5": { "1": {}, "2": {} },
    "6": { "1": {}, "2": {} }
  }
};

let currentMajor = null;
let currentYear = null;
let currentSemester = null;
let currentSubject = null;

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  restoreLastView();
  initUpdateSystem();

  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (e) {}
});

function showScreen(screenId) {
  const screens = ['landing-screen', 'major-screen', 'year-screen', 'semester-screen', 'subject-screen', 'professor-screen'];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === screenId) el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
  });
}

function setupNavigation() {
  const enterStudyBtn = document.getElementById('enter-study-btn');
  const backToLandingBtn = document.getElementById('back-to-landing-btn');
  const backToMajorsBtn = document.getElementById('back-to-majors-btn');
  const backToYearsBtn = document.getElementById('back-to-years-btn');
  const backToSemestersBtn = document.getElementById('back-to-semesters-btn');
  const backToSubjectsBtn = document.getElementById('back-to-subjects-btn');

  // Landing -> Major
  if (enterStudyBtn) {
    enterStudyBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'major');
      showScreen('major-screen');
    });
  }

  // Major -> Landing
  if (backToLandingBtn) {
    backToLandingBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'landing');
      sessionStorage.removeItem('lastActiveMajor');
      showScreen('landing-screen');
    });
  }

  // Select Major -> Show Years
  document.querySelectorAll('#major-grid .year-card').forEach(card => {
    card.addEventListener('click', () => {
      currentMajor = card.getAttribute('data-major');
      sessionStorage.setItem('lastActiveMajor', currentMajor);
      sessionStorage.setItem('lastView', 'year');
      showYears(currentMajor);
    });
  });

  // Year -> Major
  if (backToMajorsBtn) {
    backToMajorsBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'major');
      sessionStorage.removeItem('lastActiveYear');
      showScreen('major-screen');
    });
  }

  // Select Year -> Show Semesters
  document.querySelectorAll('#year-screen .year-card').forEach(card => {
    card.addEventListener('click', () => {
      currentYear = card.getAttribute('data-year');
      sessionStorage.setItem('lastActiveYear', currentYear);
      sessionStorage.setItem('lastView', 'semester');
      showSemesters(currentMajor, currentYear);
    });
  });

  // Semester -> Year
  if (backToYearsBtn) {
    backToYearsBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'year');
      sessionStorage.removeItem('lastActiveSemester');
      showYears(currentMajor);
    });
  }

  // Select Semester -> Show Subjects
  document.querySelectorAll('#semester-screen .year-card').forEach(card => {
    card.addEventListener('click', () => {
      currentSemester = card.getAttribute('data-semester');
      sessionStorage.setItem('lastActiveSemester', currentSemester);
      sessionStorage.setItem('lastView', 'subject');
      showSubjects(currentMajor, currentYear, currentSemester);
    });
  });

  // Subject -> Semester
  if (backToSemestersBtn) {
    backToSemestersBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'semester');
      sessionStorage.removeItem('lastActiveSubject');
      showSemesters(currentMajor, currentYear);
    });
  }

  // Professor -> Subject
  if (backToSubjectsBtn) {
    backToSubjectsBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'subject');
      showSubjects(currentMajor, currentYear, currentSemester);
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
    showProfessors(currentMajor, currentYear, currentSemester, currentSubject);
  } else if (savedView === 'subject' && currentMajor && currentYear && currentSemester) {
    showSubjects(currentMajor, currentYear, currentSemester);
  } else if (savedView === 'semester' && currentMajor && currentYear) {
    showSemesters(currentMajor, currentYear);
  } else if (savedView === 'year' && currentMajor) {
    showYears(currentMajor);
  } else if (savedView === 'major') {
    showScreen('major-screen');
  } else {
    showScreen('landing-screen');
  }
}

function showYears(major) {
  showScreen('year-screen');
  const title = document.getElementById('selected-major-title');
  if (title) title.textContent = getTranslation('title_select_year', { major });
}

function showSemesters(major, year) {
  showScreen('semester-screen');
  const title = document.getElementById('selected-year-title');
  if (title) title.textContent = getTranslation('title_select_semester', { major, year });
}

function showSubjects(major, year, semester) {
  showScreen('subject-screen');
  const title = document.getElementById('selected-subject-screen-title');
  if (title) title.textContent = getTranslation('title_subjects', { major, year, semester });

  const subjectList = document.getElementById('subject-list');
  if (!subjectList) return;
  subjectList.innerHTML = '';

  const subjects = manifestData[major]?.[year]?.[semester] 
    ? Object.keys(manifestData[major][year][semester]) 
    : [];

  // Render "Coming Soon!" card if no subjects exist for this semester
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
      showProfessors(major, year, semester, subject);
    };

    card.addEventListener('click', triggerSelect);
    subjectList.appendChild(card);
  });
}

function showProfessors(major, year, semester, subject) {
  showScreen('professor-screen');
  const title = document.getElementById('selected-prof-screen-title');
  if (title) title.textContent = getTranslation('title_select_prof', { subject });

  const profList = document.getElementById('professor-list');
  if (!profList) return;
  profList.innerHTML = '';

  const professors = manifestData[major]?.[year]?.[semester]?.[subject] || [];

  // Render "Coming Soon!" card if no professors exist for this subject
  if (professors.length === 0) {
    profList.innerHTML = `
      <div class="empty-state-card" style="cursor: default; text-align: center; padding: 2.5rem 1.5rem;">
        <h3 style="color: var(--text-heading); font-size: 1.4rem; margin-bottom: 0.5rem;">${getTranslation('coming_soon_title')}</h3>
        <p style="color: var(--text-sub); font-size: 0.95rem; margin-bottom: 0;">${getTranslation('coming_soon_sub')}</p>
      </div>
    `;
    return;
  }

  professors.forEach(prof => {
    const profSlug = getProfSlug(prof);
    const storageKey = getStorageKey(major, year, semester, subject, prof);

    const savedMissed = localStorage.getItem(storageKey);
    const missedCount = savedMissed ? JSON.parse(savedMissed).length : 0;

    const studyKey = `saved_study_${major.toLowerCase()}_y${year}_s${semester}_${subject.toLowerCase()}_${profSlug}`;
    const savedStudyRaw = localStorage.getItem(studyKey);
    let studyProgress = null;
    if (savedStudyRaw) { try { studyProgress = JSON.parse(savedStudyRaw); } catch(e) {} }

    let continueBtnHTML = '';
    let studyBtnLabel = getTranslation('btn_study_all');

    if (studyProgress && studyProgress.studyAnsweredCount > 0) {
      const answered = studyProgress.studyAnsweredCount;
      const total = studyProgress.questions ? studyProgress.questions.length : 0;
      if (answered < total) {
        const continueText = getTranslation('btn_continue_study', { answered, total });
        continueBtnHTML = `<button class="btn continue-btn" onclick="continueStudySession('${prof}')">${continueText}</button>`;
        studyBtnLabel = getTranslation('btn_restart_study');
      }
    }

    const card = document.createElement('div');
    card.classList.add('subject-card', 'prof-card');
    card.innerHTML = `
      <h3>${prof}</h3>
      ${missedCount > 0 ? `<p class="missed-badge">${getTranslation('missed_badge', { count: missedCount })}</p>` : ''}
      
      <div class="subject-actions" style="display: flex; flex-direction: column; width: 100%;">
        ${continueBtnHTML}
        <div class="btn-row-dual">
          <button class="btn study-btn" onclick="startSession('${prof}', 'study')">${studyBtnLabel}</button>
          <button class="btn quiz-btn" onclick="startSession('${prof}', 'quiz')">${getTranslation('btn_quiz')}</button>
        </div>
      </div>

      ${missedCount > 0 ? `
        <div class="btn-row-dual" style="margin-top: 0.5rem;">
          <button class="btn study-missed-btn" onclick="startMissedSession('${prof}')">${getTranslation('btn_review_missed')}</button>
          <button class="btn clear-btn" onclick="clearSavedMissed('${prof}')">${getTranslation('btn_clear_missed')}</button>
        </div>
      ` : ''}
    `;
    profList.appendChild(card);
  });
}

function startSession(profName, mode) {
  const sessionConfig = {
    major: currentMajor,
    year: currentYear,
    semester: currentSemester,
    subject: currentSubject,
    professor: profName,
    mode: mode,
    resume: false
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = '/quiz';
}

function continueStudySession(profName) {
  const sessionConfig = {
    major: currentMajor,
    year: currentYear,
    semester: currentSemester,
    subject: currentSubject,
    professor: profName,
    mode: 'study',
    resume: true
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = '/quiz';
}

function startMissedSession(profName) {
  const sessionConfig = {
    major: currentMajor,
    year: currentYear,
    semester: currentSemester,
    subject: currentSubject,
    professor: profName,
    mode: 'missed',
    resume: false
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = '/quiz';
}

function clearSavedMissed(profName) {
  const profSlug = profName.toLowerCase().replace(/\s+/g, '-');
  const key = (typeof getStorageKey === 'function')
    ? getStorageKey(currentMajor, currentYear, currentSemester, currentSubject, profName)
    : `missed_${currentMajor.toLowerCase()}_y${currentYear}_s${currentSemester}_${currentSubject.toLowerCase()}_${profSlug}`;

  localStorage.removeItem(key);
  showProfessors(currentMajor, currentYear, currentSemester, currentSubject);
}

// ==========================================================================
// UPDATE NOTIFICATION SYSTEM
// ==========================================================================
const APP_VERSION = "1.0.1"; // Change this string whenever you release an update!

let patchNotesEN = "";
let patchNotesKM = "";
let currentModalLang = "EN"; // Local state for update modal only

async function initUpdateSystem() {
  const versionBadge = document.getElementById('update-version-badge');
  if (versionBadge) versionBadge.textContent = `v${APP_VERSION}`;

  setupUpdateModalListeners();

  // Show automatically if current version hasn't been dismissed yet
  const lastSeenVersion = localStorage.getItem('lastSeenUpdateVersion');
  if (lastSeenVersion !== APP_VERSION) {
    await fetchPatchNotes();
    showUpdateModal();
  }
}

async function fetchPatchNotes() {
  try {
    // Cache-busted fetch ensures browsers don't load outdated cached text
    const [resEN, resKM] = await Promise.all([
      fetch(`english-update.txt?v=${APP_VERSION}`),
      fetch(`khmer-update.txt?v=${APP_VERSION}`)
    ]);

    patchNotesEN = resEN.ok ? await resEN.text() : "No English release notes available.";
    patchNotesKM = resKM.ok ? await resKM.text() : "គ្មានព័ត៌មានបច្ចុប្បន្នភាពភាសាខ្មែរទេ។";
  } catch (e) {
    patchNotesEN = "Failed to load release notes.";
    patchNotesKM = "បរាជ័យក្នុងការទាញយកព័ត៌មានបច្ចុប្បន្នភាព។";
  }
  renderModalContent();
}

function parseSimpleMarkdown(text) {
  if (!text) return "";

  // 1. Escape HTML special characters to prevent XSS
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. **bold text** -> <strong>bold text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 3. ## Section Headers -> <h3>Header</h3>
  html = html.replace(/^## (.*$)/gim, '<h3 style="margin: 1rem 0 0.4rem; color: var(--text-heading);">$1</h3>');

  // 4. Bullet points (- item or * item) -> styled bullet items
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

  // Manual trigger via "Update Info" landing page button
  if (triggerBtn) {
    triggerBtn.addEventListener('click', async () => {
      if (!patchNotesEN) await fetchPatchNotes();
      showUpdateModal();
    });
  }

  // Dismiss modal & mark this version as seen
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      localStorage.setItem('lastSeenUpdateVersion', APP_VERSION);
      if (modal) modal.classList.add('hidden');
    });
  }

  // In-modal language toggles
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
