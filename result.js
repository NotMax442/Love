// ==========================================================================
// RESULTS & REVIEW BREAKDOWN LOGIC (result.js)
// ==========================================================================

let resultData = null;
let currentReviewFilter = 'wrong';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Read saved quiz results from sessionStorage
  const rawResult = sessionStorage.getItem('lastQuizResult');
  if (!rawResult) {
    window.location.href = '/';
    return;
  }

  // Populate global resultData
  resultData = JSON.parse(rawResult);

  const totalQuestions = resultData.questions ? resultData.questions.length : 0;
  const correctCount = resultData.userScore || 0;
  const incorrectCount = totalQuestions - correctCount;

  // 2. Trigger the Pie Chart & Counter Animation
  animatePieChartAndCounters(correctCount, incorrectCount, totalQuestions);

  // 3. Render Morale Boost Banner if score is under 50%
  renderMoraleBoost(correctCount, totalQuestions);

  setupFilterControls();
  renderReviewBreakdown();
  checkMissedQuestions();
  setupActionButtons();

  // Natural AdSense Push execution on page load
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (e) {
    // Suppress error if adblocker is active
  }
});

function setupFilterControls() {
  const filterWrongBtn = document.getElementById('filter-wrong-btn');
  const filterAllBtn = document.getElementById('filter-all-btn');
  const toggleStyleBtn = document.getElementById('toggle-style-btn');

  if (filterWrongBtn) {
    filterWrongBtn.addEventListener('click', () => {
      currentReviewFilter = 'wrong';
      renderReviewBreakdown();
    });
  }

  if (filterAllBtn) {
    filterAllBtn.addEventListener('click', () => {
      currentReviewFilter = 'all';
      renderReviewBreakdown();
    });
  }

  // Instant Review Style Switcher with Scroll Stability
  if (toggleStyleBtn) {
    updateStyleToggleUI();

    toggleStyleBtn.addEventListener('click', () => {
      const scrollPos = window.scrollY; // Preserve scroll position
      const currentStyle = localStorage.getItem('result_review_style') || 'full';
      const newStyle = currentStyle === 'compact' ? 'full' : 'compact';
      
      localStorage.setItem('result_review_style', newStyle);
      updateStyleToggleUI();
      renderReviewBreakdown();
      
      window.scrollTo({ top: scrollPos, behavior: 'instant' }); // Prevent view jump
    });
  }
}

function updateStyleToggleUI() {
  const styleLabel = document.getElementById('toggle-style-label');
  if (!styleLabel) return;

  const currentStyle = localStorage.getItem('result_review_style') || 'full';
  const labelText = currentStyle === 'compact' 
    ? getTranslation('option_style_compact') 
    : getTranslation('option_style_full');

  styleLabel.textContent = labelText;
}

function renderReviewBreakdown() {
  const reviewContainer = document.getElementById('review-container');
  const filterWrongBtn = document.getElementById('filter-wrong-btn');
  const filterAllBtn = document.getElementById('filter-all-btn');

  if (!reviewContainer) return;
  reviewContainer.innerHTML = '';

  if (filterWrongBtn && filterAllBtn) {
    if (currentReviewFilter === 'wrong') {
      filterWrongBtn.className = 'btn primary-btn';
      filterAllBtn.className = 'btn secondary-btn';
    } else {
      filterWrongBtn.className = 'btn secondary-btn';
      filterAllBtn.className = 'btn primary-btn';
    }
  }

  const { questions, userAnswers } = resultData;
  const itemsToDisplay = [];

  if (questions) {
    questions.forEach((q, idx) => {
      const userChoiceIdx = userAnswers[idx];
      const isCorrect = userChoiceIdx !== null && userChoiceIdx === q.correctIndex;

      if (currentReviewFilter === 'all' || !isCorrect) {
        itemsToDisplay.push({ q, idx, userChoiceIdx, isCorrect });
      }
    });
  }

  if (itemsToDisplay.length === 0 && currentReviewFilter === 'wrong') {
    reviewContainer.innerHTML = `
      <div class="score-card" style="text-align: center; padding: 1.5rem;">
        <p style="margin: 0; color: #10b981; font-weight: 600;">${getTranslation('review_perfect_score')}</p>
      </div>
    `;
    return;
  }

  // Check saved review style (defaults to 'compact')
  const reviewStyle = localStorage.getItem('result_review_style') || 'full';

  itemsToDisplay.forEach(({ q, idx, userChoiceIdx, isCorrect }) => {
    const card = document.createElement('div');
    card.classList.add('review-card', isCorrect ? 'correct' : 'incorrect');
    card.style.cssText = `
      padding: 1.25rem;
      border-radius: 8px;
      background: var(--bg-subcard);
      border-left: 4px solid ${isCorrect ? '#10b981' : '#ef4444'};
      border-top: 1px solid var(--border-sub);
      border-right: 1px solid var(--border-sub);
      border-bottom: 1px solid var(--border-sub);
      margin-bottom: 1rem;
    `;

    if (reviewStyle === 'compact') {
      // -------------------------------------------------------------
      // COMPACT DESIGN: Text Summary
      // -------------------------------------------------------------
      const userChoiceText = (userChoiceIdx !== null && userChoiceIdx !== undefined)
        ? q.options[userChoiceIdx]
        : getTranslation('review_unanswered');

      card.innerHTML = `
        <h4 style="margin: 0 0 0.5rem 0; color: var(--text-main); font-size: 1rem; line-height: 1.4;">${idx + 1}. ${escapeHTML(q.question)}</h4>
        <p style="margin: 0 0 0.25rem 0; font-size: 0.9rem; color: ${isCorrect ? '#10b981' : '#ef4444'}; font-weight: 600;">
          <strong>${getTranslation('label_your_choice')}:</strong> ${escapeHTML(userChoiceText)} ${isCorrect ? '✓' : '✗'}
        </p>
        ${!isCorrect ? `
          <p style="margin: 0; font-size: 0.9rem; color: #10b981; font-weight: 600;">
            <strong>${getTranslation('label_correct_choice')}:</strong> ${escapeHTML(q.options[q.correctIndex])}
          </p>
        ` : ''}
      `;
    } else {
      // -------------------------------------------------------------
      // FULL OPTIONS DESIGN: Study Mode Style Options
      // -------------------------------------------------------------
      const qTitle = `<h4 style="margin: 0 0 0.85rem 0; color: var(--text-main); font-size: 1rem; line-height: 1.4;">${idx + 1}. ${escapeHTML(q.question)}</h4>`;
      
      let optionsHTML = '<div class="options-grid" style="display: flex; flex-direction: column; gap: 0.5rem;">';

      q.options.forEach((optText, optIdx) => {
        let btnStyle = "pointer-events: none; text-align: left; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.95rem; font-weight: 500; display: flex; justify-content: space-between; align-items: center;";

        if (optIdx === q.correctIndex) {
          // Correct Answer -> Green Accent
          btnStyle += " background-color: #10b981; color: #ffffff; border: 1px solid #059669;";
        } else if (optIdx === userChoiceIdx && !isCorrect) {
          // User's Wrong Answer -> Red Accent
          btnStyle += " background-color: #ef4444; color: #ffffff; border: 1px solid #dc2626;";
        } else {
          // Neutral Unselected Option
          btnStyle += " background-color: var(--bg-subcard); color: var(--text-main); border: 1px solid var(--border-sub); opacity: 0.7;";
        }

        const isUserChoice = (optIdx === userChoiceIdx);
        const choiceBadge = isUserChoice ? `<span>${isCorrect ? '✓' : '✗'}</span>` : '';

        optionsHTML += `
          <button class="option-btn" style="${btnStyle}">
            <span>${escapeHTML(optText)}</span>
            ${choiceBadge}
          </button>
        `;
      });

      optionsHTML += '</div>';
      card.innerHTML = qTitle + optionsHTML;
    }

    reviewContainer.appendChild(card);
  });
}

function checkMissedQuestions() {
  const { major, year, semester, subject, professor } = resultData;
  const retryMissedBtn = document.getElementById('retry-missed-btn');
  const missedCountEl = document.getElementById('missed-count');

  const key = (typeof getStorageKey === 'function')
    ? getStorageKey(major, year, semester, subject, professor)
    : `missed_${major ? major.toLowerCase() : ''}_y${year}_s${semester}_${subject ? subject.toLowerCase() : ''}_${typeof getProfSlug === 'function' ? getProfSlug(professor) : professor}`;

  const savedMissed = localStorage.getItem(key);
  const missedList = savedMissed ? JSON.parse(savedMissed) : [];

  if (missedList.length > 0) {
    if (missedCountEl) missedCountEl.textContent = missedList.length;
    if (retryMissedBtn) retryMissedBtn.classList.remove('hidden');
  } else {
    if (retryMissedBtn) retryMissedBtn.classList.add('hidden');
  }
}

function setupActionButtons() {
  const retryMissedBtn = document.getElementById('retry-missed-btn');
  const restartBtn = document.getElementById('restart-btn');

  if (retryMissedBtn) {
    retryMissedBtn.addEventListener('click', () => {
      const sessionConfig = {
        major: resultData.major,
        year: resultData.year,
        semester: resultData.semester,
        subject: resultData.subject,
        professor: resultData.professor,
        mode: 'missed'
      };
      sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
      window.location.href = '/quiz';
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      window.location.href = '/';
    });
  }
}

function animatePieChartAndCounters(correct, incorrect, total) {
  const CIRCUMFERENCE = 251.327;
  const correctRatio = total > 0 ? correct / total : 0;
  const incorrectRatio = total > 0 ? incorrect / total : 0;

  const correctPct = Math.round(correctRatio * 100);
  const incorrectPct = Math.round(incorrectRatio * 100);

  const correctArc = document.getElementById('correct-arc');
  const incorrectArc = document.getElementById('incorrect-arc');

  const centerPercentEl = document.getElementById('center-percent');
  const correctCountEl = document.getElementById('correct-count-display');
  const correctPercentEl = document.getElementById('correct-percent-display');
  const incorrectCountEl = document.getElementById('incorrect-count-display');
  const incorrectPercentEl = document.getElementById('incorrect-percent-display');

  const correctAngleDegrees = correctRatio * 360;
  if (incorrectArc) {
    incorrectArc.setAttribute('transform', `rotate(${correctAngleDegrees} 50 50)`);
  }

  const phase1Duration = 1000;
  const phase2Duration = 800;

  let startTime = null;

  function runPhase1(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / phase1Duration, 1);

    const easeProgress = 1 - Math.pow(1 - progress, 3);

    const currentCorrectCount = Math.floor(easeProgress * correct);
    const currentCorrectPct = Math.floor(easeProgress * correctPct);
    const currentCorrectOffset = CIRCUMFERENCE - (easeProgress * (CIRCUMFERENCE * correctRatio));

    if (correctArc) correctArc.style.strokeDashoffset = currentCorrectOffset;
    if (centerPercentEl) centerPercentEl.textContent = `${currentCorrectPct}%`;
    if (correctCountEl) correctCountEl.textContent = currentCorrectCount;
    if (correctPercentEl) correctPercentEl.textContent = `${currentCorrectPct}%`;

    if (progress < 1) {
      requestAnimationFrame(runPhase1);
    } else {
      if (correctArc) correctArc.style.strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * correctRatio);
      if (centerPercentEl) centerPercentEl.textContent = `${correctPct}%`;
      if (correctCountEl) correctCountEl.textContent = correct;
      if (correctPercentEl) correctPercentEl.textContent = `${correctPct}%`;

      if (incorrect > 0) {
        startTime = null;
        requestAnimationFrame(runPhase2);
      }
    }
  }

  function runPhase2(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / phase2Duration, 1);

    const easeProgress = 1 - Math.pow(1 - progress, 3);

    const currentIncorrectCount = Math.floor(easeProgress * incorrect);
    const currentIncorrectPct = Math.floor(easeProgress * incorrectPct);
    const currentIncorrectOffset = CIRCUMFERENCE - (easeProgress * (CIRCUMFERENCE * incorrectRatio));

    if (incorrectArc) incorrectArc.style.strokeDashoffset = currentIncorrectOffset;
    if (incorrectCountEl) incorrectCountEl.textContent = currentIncorrectCount;
    if (incorrectPercentEl) incorrectPercentEl.textContent = `${currentIncorrectPct}%`;

    if (progress < 1) {
      requestAnimationFrame(runPhase2);
    } else {
      if (incorrectArc) incorrectArc.style.strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * incorrectRatio);
      if (incorrectCountEl) incorrectCountEl.textContent = incorrect;
      if (incorrectPercentEl) incorrectPercentEl.textContent = `${incorrectPct}%`;
    }
  }

  requestAnimationFrame(runPhase1);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&#34;'
  }[tag] || tag));
}

function renderMoraleBoost(correct, total) {
  const container = document.getElementById('morale-boost-banner');
  if (!container) return;

  const accuracy = total > 0 ? (correct / total) * 100 : 0;

  if (accuracy < 50) {
    const randomIndex = Math.floor(Math.random() * 6) + 1;
    const message = getTranslation(`morale_${randomIndex}`);

    container.innerHTML = `
      <div class="score-card" style="
        background: rgba(239, 68, 68, 0.1); 
        border: 1px solid #ef4444; 
        padding: 1rem 1.25rem; 
        margin-bottom: 1.5rem; 
        border-radius: 10px;
        text-align: center;">
        <p style="margin: 0; color: var(--text-main); font-weight: 600; font-size: 0.95rem; line-height: 1.5;">
          ${message}
        </p>
      </div>
    `;
    container.classList.remove('hidden');
  } else {
    container.innerHTML = '';
    container.classList.add('hidden');
  }
}
