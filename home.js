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
        ],
        "PHYSIOLOGIE": [
          "Pr. Im Bunthoeun",
          "Pr. Duong Dararith",
          "Dr. Sou Sipanha",
          "Dr. Em Savoeun",
          "Dr. Chea Ong",
          "Pr. Ku No",
          "Pr. Ast Sann Sary"

        ],
        "HISTOLOGIE": [
          "Pr. Chhut Serey Vathana",
          "Pr. Pheav Piseth"
        ],
        "TP-ANATOMIE": [
          "Dr. Koam Phaly",
          "Dr. Heng Sophea",
          "Pr. Ast Nhem Aklinn",
          "Pr. Ast Ich Khuy",
          "Pr. Sin Sagata"
        ],
        "TP-HISTOLOGIE": [
          "Pr. Chhut SereyVathana"
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
});

// Directional Screen Switcher (Forward vs. Back Animations)
function showScreen(screenId, direction = 'forward') {
  const screens = ['landing-screen', 'major-screen', 'year-screen', 'semester-screen', 'subject-screen', 'professor-screen'];
  
  const currentVisibleId = screens.find(id => {
    const el = document.getElementById(id);
    return el && !el.classList.contains('hidden');
  });

  const currentEl = document.getElementById(currentVisibleId);
  const targetEl = document.getElementById(screenId);

  if (!targetEl || currentVisibleId === screenId) return;

  // Clear animation state
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('slide-in-right', 'slide-out-left', 'slide-in-left', 'slide-out-right');
  });

  // Animate transition if switching screens interactively
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
    // Instant swap for page restores or initial loads
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

  // Landing -> Major
  if (enterStudyBtn) {
    enterStudyBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'major');
      showScreen('major-screen', 'forward');
    });
  }

  // Major -> Landing
  if (backToLandingBtn) {
    backToLandingBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'landing');
      sessionStorage.removeItem('lastActiveMajor');
      showScreen('landing-screen', 'back');
    });
  }

  // Select Major -> Show Years
  document.querySelectorAll('#major-grid .year-card').forEach(card => {
    card.addEventListener('click', () => {
      currentMajor = card.getAttribute('data-major');
      sessionStorage.setItem('lastActiveMajor', currentMajor);
      sessionStorage.setItem('lastView', 'year');
      showYears(currentMajor, 'forward');
    });
  });

  // Year -> Major
  if (backToMajorsBtn) {
    backToMajorsBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'major');
      sessionStorage.removeItem('lastActiveYear');
      showScreen('major-screen', 'back');
    });
  }

  // Select Year -> Show Semesters
  document.querySelectorAll('#year-screen .year-card').forEach(card => {
    card.addEventListener('click', () => {
      currentYear = card.getAttribute('data-year');
      sessionStorage.setItem('lastActiveYear', currentYear);
      sessionStorage.setItem('lastView', 'semester');
      showSemesters(currentMajor, currentYear, 'forward');
    });
  });

  // Semester -> Year
  if (backToYearsBtn) {
    backToYearsBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'year');
      sessionStorage.removeItem('lastActiveSemester');
      showYears(currentMajor, 'back');
    });
  }

  // Select Semester -> Show Subjects
  document.querySelectorAll('#semester-screen .year-card').forEach(card => {
    card.addEventListener('click', () => {
      currentSemester = card.getAttribute('data-semester');
      sessionStorage.setItem('lastActiveSemester', currentSemester);
      sessionStorage.setItem('lastView', 'subject');
      showSubjects(currentMajor, currentYear, currentSemester, 'forward');
    });
  });

  // Subject -> Semester
  if (backToSemestersBtn) {
    backToSemestersBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'semester');
      sessionStorage.removeItem('lastActiveSubject');
      showSemesters(currentMajor, currentYear, 'back');
    });
  }

  // Professor -> Subject
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
}

function showProfessors(major, year, semester, subject, direction = 'forward') {
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

  // --- 1. Render Top Banner ONLY if there are multiple professors ---
  if (!isSingleProf) {
    const subjectBanner = document.createElement('div');
    subjectBanner.classList.add('subject-card', 'prof-card');
    subjectBanner.style.cssText = 'margin-bottom: 1.5rem; border-left: 4px solid var(--accent, #38bdf8); background: var(--bg-subcard, #1e293b); padding: 1.25rem; border-radius: 10px;';

    subjectBanner.innerHTML = `
      <h3 style="margin: 0 0 0.25rem 0; font-size: 1.1rem; color: var(--text-main);">
        ${getTranslation('subject_assessments_title', { subject })}
      </h3>
      <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: var(--text-sub);">
        ${getTranslation('subject_assessments_desc')}
      </p>
      <div class="btn-row-dual" style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn quiz-btn" style="flex: 1; min-width: 180px; background: #10b981;" onclick="startSubjectSession('quiz')">
          ${getTranslation('btn_subject_quiz')}
        </button>
        <button class="btn study-btn" style="flex: 1; min-width: 180px; background: #8b5cf6; color: white;" onclick="startSubjectSession('study')">
          ${getTranslation('btn_subject_study_all')}
        </button>
      </div>
    `;
    profList.appendChild(subjectBanner);
  }

  // --- 2. Render Individual Professor Cards ---
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
    let studyBtnLabel = isSingleProf ? getTranslation('btn_subject_study_all') : getTranslation('btn_study');

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

    let actionsHTML = '';
    if (isSingleProf) {
      actionsHTML = `
        <div class="subject-actions" style="display: flex; flex-direction: column; width: 100%;">
          ${continueBtnHTML}
          <div class="btn-row-dual" style="display: flex; gap: 0.75rem; width: 100%;">
            <button class="btn quiz-btn" style="flex: 1; background: #10b981; color: white;" onclick="startSession('${prof}', 'quiz')">
              ${getTranslation('btn_subject_quiz')}
            </button>
            <button class="btn study-btn" style="flex: 1; background: #8b5cf6; color: white;" onclick="startSession('${prof}', 'study')">
              ${studyBtnLabel}
            </button>
          </div>
        </div>
      `;
    } else {
      actionsHTML = `
        <div class="subject-actions" style="display: flex; flex-direction: column; width: 100%;">
          ${continueBtnHTML}
          <div class="btn-row-single" style="width: 100%;">
            <button class="btn study-btn" style="width: 100%;" onclick="startSession('${prof}', 'study')">${studyBtnLabel}</button>
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <h3>${prof}</h3>
      ${missedCount > 0 ? `<p class="missed-badge">${getTranslation('missed_badge', { count: missedCount })}</p>` : ''}
      
      ${actionsHTML}

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

function startSubjectSession(mode) {
  const professors = manifestData[currentMajor]?.[currentYear]?.[currentSemester]?.[currentSubject] || [];
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
  window.location.href = '/quiz';
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
  window.location.href = '/quiz';
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
  window.location.href = '/quiz';
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
  window.location.href = '/quiz';
}

function clearSavedMissed(profName) {
  const profSlug = profName.toLowerCase().replace(/\s+/g, '-');
  const key = (typeof getStorageKey === 'function')
    ? getStorageKey(currentMajor, currentYear, currentSemester, currentSubject, profName)
    : `missed_${currentMajor.toLowerCase()}_y${currentYear}_s${currentSemester}_${currentSubject.toLowerCase()}_${profSlug}`;

  localStorage.removeItem(key);
  showProfessors(currentMajor, currentYear, currentSemester, currentSubject, 'none');
}

// ==========================================================================
// UPDATE NOTIFICATION SYSTEM
// ==========================================================================
const APP_VERSION = "1.0.2";

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
    patchNotesKM = resKM.ok ? await resKM.text() : "គ្មានព័ត៌មានបច្ចុប្បន្នភាពភាសាខ្មែរទេ។";
  } catch (e) {
    patchNotesEN = "Failed to load release notes.";
    patchNotesKM = "បរាជ័យក្នុងការទាញយកព័ត៌មានបច្ចុប្បន្នភាព។";
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
