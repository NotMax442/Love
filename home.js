// ==========================================================================
// HOME PAGE LOGIC (index.html)
// ==========================================================================

let currentYear = null;

document.addEventListener('DOMContentLoaded', () => {
  const enterStudyBtn = document.getElementById('enter-study-btn');
  const backToLandingBtn = document.getElementById('back-to-landing-btn');
  const backToYearsBtn = document.getElementById('back-to-years-btn');
  const yearCards = document.querySelectorAll('.year-card');

  const landingScreen = document.getElementById('landing-screen');
  const yearScreen = document.getElementById('year-screen');
  const subjectScreen = document.getElementById('subject-screen');

  // Trigger Google AdSense load for home banner
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (e) {}

  // Check if returning with a saved year state in session
  const savedYear = sessionStorage.getItem('lastYear');
  if (savedYear) {
    currentYear = savedYear;
    if (landingScreen) landingScreen.classList.add('hidden');
    if (yearScreen) yearScreen.classList.add('hidden');
    if (subjectScreen) subjectScreen.classList.remove('hidden');
    showSubjects(currentYear);
  }

  // Click "🚀 Start Studying" -> Show Year Screen
  if (enterStudyBtn) {
    enterStudyBtn.addEventListener('click', () => {
      if (landingScreen) landingScreen.classList.add('hidden');
      if (yearScreen) yearScreen.classList.remove('hidden');
    });
  }

  // Click "⬅️ Back" in Year Screen -> Show Landing Screen
  if (backToLandingBtn) {
    backToLandingBtn.addEventListener('click', () => {
      if (yearScreen) yearScreen.classList.add('hidden');
      if (landingScreen) landingScreen.classList.remove('hidden');
      sessionStorage.removeItem('lastYear');
    });
  }

  // Click Year Card -> Show Subject Screen
  yearCards.forEach(card => {
    card.addEventListener('click', () => {
      currentYear = card.getAttribute('data-year');
      sessionStorage.setItem('lastYear', currentYear);
      if (yearScreen) yearScreen.classList.add('hidden');
      if (subjectScreen) subjectScreen.classList.remove('hidden');
      showSubjects(currentYear);
    });
  });

  // Click "⬅️ Back to Years" -> Show Year Screen
  if (backToYearsBtn) {
    backToYearsBtn.addEventListener('click', () => {
      if (subjectScreen) subjectScreen.classList.add('hidden');
      if (yearScreen) yearScreen.classList.remove('hidden');
      sessionStorage.removeItem('lastYear');
    });
  }
});

function showSubjects(year) {
  const yearScreen = document.getElementById('year-screen');
  const subjectScreen = document.getElementById('subject-screen');
  const selectedYearTitle = document.getElementById('selected-year-title');

  if (yearScreen) yearScreen.classList.add('hidden');
  if (subjectScreen) subjectScreen.classList.remove('hidden');

  const t = translations[currentLang] || translations.en;
  if (selectedYearTitle) {
    selectedYearTitle.textContent = t.subjects_header 
      ? t.subjects_header.replace('{year}', year) 
      : `Year ${year} Subjects`;
  }

  loadSubjectsForYear(year);
}

function loadSubjectsForYear(year) {
  const subjectList = document.getElementById('subject-list');
  if (!subjectList) return;

  subjectList.innerHTML = '';
  const subjects = manifestData[year] || [];
  const t = translations[currentLang] || translations.en;

  subjects.forEach(subject => {
    const storageKey = getStorageKey(year, subject);
    const savedMissed = localStorage.getItem(storageKey);
    const missedCount = savedMissed ? JSON.parse(savedMissed).length : 0;

    // Check for saved mid-session study progress
    const studyProgressKey = `saved_study_y${year}_${subject.toLowerCase()}`;
    const savedStudyRaw = localStorage.getItem(studyProgressKey);
    let studyProgress = null;
    if (savedStudyRaw) {
      try { studyProgress = JSON.parse(savedStudyRaw); } catch(e) {}
    }

    const subjectCard = document.createElement('div');
    subjectCard.classList.add('subject-card');

    const badgeText = t.missed_badge 
      ? t.missed_badge.replace('{count}', missedCount) 
      : `⚠️ ${missedCount} saved missed question(s)`;

    let continueBtnHTML = '';
    let studyBtnLabel = t.btn_study_all;

    if (studyProgress && studyProgress.studyAnsweredCount > 0) {
      const answered = studyProgress.studyAnsweredCount;
      const total = studyProgress.questions ? studyProgress.questions.length : 0;
      continueBtnHTML = `<button class="btn primary-btn" style="background:#10b981; border-color:#059669;" onclick="continueStudySession('${subject}')">▶️ Continue Study (${answered}/${total})</button>`;
      studyBtnLabel = "🔄 Restart Study All";
    }

    subjectCard.innerHTML = `
      <h3>${subject}</h3>
      ${missedCount > 0 ? `<p class="missed-badge">${badgeText}</p>` : ''}
      
      <div class="subject-actions">
        ${continueBtnHTML}
        <button class="btn study-btn" onclick="startSession('${subject}', 'study')">${studyBtnLabel}</button>
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

function startSession(subjectName, mode) {
  // If starting fresh study, clear old saved study progress for this subject
  if (mode === 'study') {
    const studyProgressKey = `saved_study_y${currentYear}_${subjectName.toLowerCase()}`;
    localStorage.removeItem(studyProgressKey);
  }

  const sessionConfig = {
    year: currentYear,
    subject: subjectName,
    mode: mode,
    resume: false
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = 'quiz.html';
}

function continueStudySession(subjectName) {
  const sessionConfig = {
    year: currentYear,
    subject: subjectName,
    mode: 'study',
    resume: true
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = 'quiz.html';
}

function startMissedSession(subjectName) {
  const sessionConfig = {
    year: currentYear,
    subject: subjectName,
    mode: 'missed',
    resume: false
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = 'quiz.html';
}

function clearSavedMissed(subjectName) {
  const key = getStorageKey(currentYear, subjectName);
  localStorage.removeItem(key);
  loadSubjectsForYear(currentYear);
}
