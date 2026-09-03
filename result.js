// ==========================================================================
// RESULTS & REVIEW BREAKDOWN LOGIC (result.html)
// ==========================================================================

let resultData = null;
let currentReviewFilter = 'wrong';

document.addEventListener('DOMContentLoaded', () => {
  const rawResult = sessionStorage.getItem('lastQuizResult');
  if (!rawResult) {
    window.location.href = 'index.html';
    return;
  }

  resultData = JSON.parse(rawResult);
  renderScoreSummary();
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

function renderScoreSummary() {
  const { questions, userScore } = resultData;
  const finalScore = document.getElementById('final-score');
  const scorePercentageEl = document.getElementById('score-percentage');
  const progressBarFillEl = document.getElementById('progress-bar-fill');

  const total = questions ? questions.length : 0;
  const percentage = total > 0 ? Math.round((userScore / total) * 100) : 0;

  if (finalScore) {
    finalScore.textContent = `You answered ${userScore} out of ${total} questions correctly!`;
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
}

function setupFilterControls() {
  const filterWrongBtn = document.getElementById('filter-wrong-btn');
  const filterAllBtn = document.getElementById('filter-all-btn');

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
}

function renderReviewBreakdown() {
  const reviewContainer = document.getElementById('review-container');
  const filterWrongBtn = document.getElementById('filter-wrong-btn');
  const filterAllBtn = document.getElementById('filter-all-btn');

  if (!reviewContainer) return;
  reviewContainer.innerHTML = '';

  // Update button active states
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

  questions.forEach((q, idx) => {
    const userChoiceIdx = userAnswers[idx];
    const isCorrect = userChoiceIdx !== null && userChoiceIdx === q.correctIndex;

    if (currentReviewFilter === 'all' || !isCorrect) {
      itemsToDisplay.push({ q, idx, userChoiceIdx, isCorrect });
    }
  });

  if (itemsToDisplay.length === 0 && currentReviewFilter === 'wrong') {
    reviewContainer.innerHTML = `
      <div class="score-card" style="text-align: center; padding: 1.5rem;">
        <p style="margin: 0; color: #10b981; font-weight: 600;">🎉 Perfect score! You answered all questions correctly!</p>
      </div>
    `;
    return;
  }

  itemsToDisplay.forEach(({ q, idx, userChoiceIdx, isCorrect }) => {
    const card = document.createElement('div');
    card.classList.add('review-card', isCorrect ? 'correct' : 'incorrect');
    card.style.cssText = `
      padding: 1rem;
      border-radius: 8px;
      background: var(--bg-subcard);
      border-left: 4px solid ${isCorrect ? '#10b981' : '#ef4444'};
      border-top: 1px solid var(--border-sub);
      border-right: 1px solid var(--border-sub);
      border-bottom: 1px solid var(--border-sub);
    `;

    const userChoiceText = (userChoiceIdx !== null && userChoiceIdx !== undefined)
      ? q.options[userChoiceIdx]
      : "⚠️ Unanswered / Skipped";

    card.innerHTML = `
      <h4 style="margin: 0 0 0.5rem 0; color: var(--text-main); font-size: 1rem; line-height: 1.4;">${idx + 1}. ${q.question}</h4>
      <p style="margin: 0 0 0.25rem 0; font-size: 0.9rem; color: ${isCorrect ? '#10b981' : '#ef4444'}; font-weight: 600;">
        <strong>Your Choice:</strong> ${userChoiceText} ${isCorrect ? '✓' : '✗'}
      </p>
      ${!isCorrect ? `
        <p style="margin: 0; font-size: 0.9rem; color: #10b981; font-weight: 600;">
          <strong>Correct Choice:</strong> ${q.options[q.correctIndex]}
        </p>
      ` : ''}
    `;

    reviewContainer.appendChild(card);
  });
}

function checkMissedQuestions() {
  const { year, subject } = resultData;
  const retryMissedBtn = document.getElementById('retry-missed-btn');
  const missedCountEl = document.getElementById('missed-count');

  const key = getStorageKey(year, subject);
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
        year: resultData.year,
        subject: resultData.subject,
        mode: 'missed'
      };
      sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
      window.location.href = 'quiz.html';
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
}
