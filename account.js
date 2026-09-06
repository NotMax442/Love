// ==========================================================================
// MY ACCOUNT, VAULT & ANALYTICS LOGIC (account.js)
// ==========================================================================

const IMAGE_BASE_URL = 'https://notmax442.github.io/testforuhs-images/';

let isSelectMode = false;
let selectedSubjectKeys = new Set();
let activeExportSubjectKey = null;
let activeAccountTab = 'stats'; // 'stats' | 'vault'

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Tab Switcher
  setupAccountTabs();

  // 2. Initialize Preferences Toggles
  setupPreferences();

  // 3. Render Initial Dashboard Views
  renderAnalyticsDashboard();
  renderAccountDashboard();

  // 4. Bind Vault & Bulk Delete Listeners
  setupVaultListeners();

  // 5. Bind Anki Export Listeners
  setupAnkiListeners();
});

// ==========================================================================
// 1. SUB-NAVBAR TAB SWITCHER
// ==========================================================================

function setupAccountTabs() {
  const tabStatsBtn = document.getElementById('tab-stats-btn');
  const tabVaultBtn = document.getElementById('tab-vault-btn');
  const statsView = document.getElementById('account-stats-view');
  const vaultView = document.getElementById('account-vault-view');

  const savedTab = sessionStorage.getItem('activeAccountTab');
  if (savedTab) activeAccountTab = savedTab;

  const switchTab = (targetTab) => {
    activeAccountTab = targetTab;
    sessionStorage.setItem('activeAccountTab', targetTab);

    if (targetTab === 'stats') {
      if (tabStatsBtn) tabStatsBtn.classList.add('active');
      if (tabVaultBtn) tabVaultBtn.classList.remove('active');
      if (statsView) statsView.classList.remove('hidden');
      if (vaultView) vaultView.classList.add('hidden');
      renderAnalyticsDashboard();
    } else {
      if (tabVaultBtn) tabVaultBtn.classList.add('active');
      if (tabStatsBtn) tabStatsBtn.classList.remove('active');
      if (vaultView) vaultView.classList.remove('hidden');
      if (statsView) statsView.classList.add('hidden');
      renderAccountDashboard();
    }
  };

  if (tabStatsBtn) tabStatsBtn.addEventListener('click', () => switchTab('stats'));
  if (tabVaultBtn) tabVaultBtn.addEventListener('click', () => switchTab('vault'));

  // Initial State
  switchTab(activeAccountTab);
}

// ==========================================================================
// 2. ACCURACY ANALYTICS & ANIMATED FULL PIE CHART
// ==========================================================================

function renderAnalyticsDashboard() {
  const statsData = typeof getAnalyticsData === 'function' 
    ? getAnalyticsData() 
    : { total: 0, correct: 0, profs: {} };

  const total = statsData.total || 0;
  const correct = statsData.correct || 0;
  const incorrect = total - correct;
  const accuracyPct = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Render SVG Animated Full Pie Chart
  renderAnimatedPieChart(correct, incorrect, total);

  // Render Stats Metric Cards
  const totalEl = document.getElementById('stat-total-val');
  const correctEl = document.getElementById('stat-correct-val');
  const incorrectEl = document.getElementById('stat-incorrect-val');
  const rateEl = document.getElementById('stat-rate-val');

  if (totalEl) totalEl.textContent = total;
  if (correctEl) correctEl.textContent = correct;
  if (incorrectEl) incorrectEl.textContent = incorrect;
  if (rateEl) rateEl.textContent = `${accuracyPct}%`;

  // Render Filter Dropdown & Professor Breakdown List
  renderProfessorAnalyticsList(statsData);
}

function renderAnimatedPieChart(correct, incorrect, total) {
  const chartWrapper = document.getElementById('pie-chart-wrapper');
  if (!chartWrapper) return;

  if (total === 0) {
    chartWrapper.innerHTML = `
      <div class="pie-chart-container">
        <svg class="pie-chart-svg" viewBox="0 0 42 42">
          <circle cx="21" cy="21" r="15.9155" fill="#334155"></circle>
        </svg>
        <div class="pie-center-text">
          <span id="center-percent" style="font-size: 1.5rem; color: var(--text-sub);">0%</span>
          <span class="center-label">${getTranslation('stats_accuracy_rate')}</span>
        </div>
      </div>
    `;
    return;
  }

  const correctPct = (correct / total) * 100;

  chartWrapper.innerHTML = `
    <div class="pie-chart-container">
      <svg class="pie-chart-svg" viewBox="0 0 42 42">
        <!-- Base Circle (Incorrect / Total Background) -->
        <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#ef4444" stroke-width="31.831" />
        
        <!-- Animated Overlay Circle (Correct Slice) -->
        <circle id="animated-correct-slice" cx="21" cy="21" r="15.9155" fill="none" 
          stroke="#10b981" stroke-width="31.831" 
          stroke-dasharray="0 100" stroke-dashoffset="25"
          style="transition: stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1);" />
      </svg>
      <div class="pie-center-text" style="pointer-events: none; text-shadow: 0 2px 6px rgba(0,0,0,0.6);">
        <span id="center-percent">${Math.round(correctPct)}%</span>
        <span class="center-label">${getTranslation('stats_accuracy_rate')}</span>
      </div>
    </div>
  `;

  // Trigger smooth slice sweep animation on frame render
  requestAnimationFrame(() => {
    setTimeout(() => {
      const sliceEl = document.getElementById('animated-correct-slice');
      if (sliceEl) {
        sliceEl.setAttribute('stroke-dasharray', `${correctPct} ${100 - correctPct}`);
      }
    }, 50);
  });
}

function renderProfessorAnalyticsList(statsData) {
  const profListContainer = document.getElementById('stats-prof-list');
  const filterSelect = document.getElementById('stats-filter-select');
  if (!profListContainer) return;

  profListContainer.innerHTML = '';
  const profEntries = Object.values(statsData.profs || {});

  if (profEntries.length === 0) {
    profListContainer.innerHTML = `
      <div class="score-card" style="text-align: center; padding: 2rem;">
        <p style="margin: 0; color: var(--text-sub);">${getTranslation('stats_empty_data')}</p>
      </div>
    `;
    return;
  }

  // Populate Filter Dropdown
  if (filterSelect && filterSelect.options.length <= 1) {
    filterSelect.innerHTML = `<option value="ALL">${getTranslation('stats_filter_all')}</option>`;
    const subjectsSet = new Set(profEntries.map(p => p.subject));
    subjectsSet.forEach(subj => {
      const opt = document.createElement('option');
      opt.value = subj;
      opt.textContent = subj;
      filterSelect.appendChild(opt);
    });

    filterSelect.addEventListener('change', () => renderProfessorAnalyticsList(statsData));
  }

  const selectedFilter = filterSelect ? filterSelect.value : 'ALL';

  const filteredEntries = profEntries.filter(entry => {
    if (selectedFilter === 'ALL') return true;
    return entry.subject === selectedFilter;
  });

  filteredEntries.forEach(entry => {
    const total = entry.total || 0;
    const correct = entry.correct || 0;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    let statusColor = '#10b981'; // Green >= 80%
    if (pct < 50) statusColor = '#ef4444'; // Red < 50%
    else if (pct < 80) statusColor = '#f59e0b'; // Yellow 50-79%

    const card = document.createElement('div');
    card.classList.add('subject-card');
    card.style.cssText = 'margin-bottom: 0.85rem; padding: 1.1rem; cursor: default; transform: none !important;';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 0.5rem;">
        <div>
          <h4 style="margin: 0 0 0.2rem 0; font-size: 1.05rem; color: var(--text-main);">${entry.professor}</h4>
          <p style="margin: 0; font-size: 0.82rem; color: var(--text-sub); font-weight: 600;">
            ${entry.major} Y${entry.year} S${entry.semester} - ${entry.subject}
          </p>
        </div>
        <span style="font-size: 1.25rem; font-weight: 800; color: ${statusColor}; white-space: nowrap;">
          ${pct}%
        </span>
      </div>

      <!-- Accuracy Progress Bar -->
      <div style="width: 100%; height: 8px; background: var(--bg-subcard); border-radius: 4px; overflow: hidden; margin-top: 0.6rem;">
        <div style="width: ${pct}%; height: 100%; background: ${statusColor}; transition: width 0.8s ease;"></div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 0.4rem; font-size: 0.78rem; color: var(--text-sub);">
        <span>${getTranslation('stats_correct_answers')}: ${correct}/${total}</span>
        <span>${getTranslation('stats_total_questions')}: ${total}</span>
      </div>
    `;

    profListContainer.appendChild(card);
  });
}

// ==========================================================================
// 3. PREFERENCES & SETTINGS
// ==========================================================================

function setupPreferences() {
  const autoAdvanceToggle = document.getElementById('auto-advance-toggle');
  if (autoAdvanceToggle) {
    const isAutoAdvance = localStorage.getItem('auto_advance_quiz') === 'true';
    autoAdvanceToggle.checked = isAutoAdvance;

    autoAdvanceToggle.addEventListener('change', (e) => {
      localStorage.setItem('auto_advance_quiz', e.target.checked);
    });
  }

  const reviewStyleSelect = document.getElementById('review-style-select');
  if (reviewStyleSelect) {
    const savedStyle = localStorage.getItem('result_review_style') || 'compact';
    reviewStyleSelect.value = savedStyle;

    reviewStyleSelect.addEventListener('change', (e) => {
      localStorage.setItem('result_review_style', e.target.value);
    });
  }
}

// ==========================================================================
// 4. MISSED QUESTION VAULT DASHBOARD
// ==========================================================================

function renderAccountDashboard() {
  const accountSubjectList = document.getElementById('account-subject-list');
  const toggleSelectModeBtn = document.getElementById('toggle-select-mode-btn');
  const bulkControls = document.getElementById('bulk-controls');
  if (!accountSubjectList) return;

  accountSubjectList.innerHTML = '';
  let totalMissedAcrossApp = 0;

  const missedKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('missed_')) {
      missedKeys.push(key);
    }
  }

  missedKeys.sort().forEach(key => {
    const rawData = localStorage.getItem(key);
    const missedArray = rawData ? JSON.parse(rawData) : [];

    if (missedArray.length > 0) {
      totalMissedAcrossApp += missedArray.length;

      const parts = key.split('_');
      let major = 'MED';
      let year = '1';
      let semester = '1';
      let subject = '';
      let profSlug = '';

      if (parts.length >= 6 && parts[3].startsWith('s')) {
        major = parts[1].toUpperCase();
        year = parts[2].replace('y', '');
        semester = parts[3].replace('s', '');
        subject = parts[4].toUpperCase();
        profSlug = parts.slice(5).join('_');
      } else if (parts.length >= 5) {
        major = parts[1].toUpperCase();
        year = parts[2].replace('y', '');
        semester = '1';
        subject = parts[3].toUpperCase();
        profSlug = parts.slice(4).join('_');
      } else {
        subject = key;
      }

      const formattedProf = profSlug
        .split('-')
        .map(word => {
          if (word === '&') return '&';
          if (word === 'pr') return 'Pr.';
          if (word === 'dr') return 'Dr.';
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');

      const card = document.createElement('div');
      card.classList.add('subject-card');
      if (selectedSubjectKeys.has(key)) card.classList.add('selected-for-delete');

      const isChecked = selectedSubjectKeys.has(key) ? 'checked' : '';
      const checkboxHTML = isSelectMode 
        ? `<input type="checkbox" class="card-checkbox" data-key="${key}" ${isChecked}>` 
        : '';

      const missedText = getTranslation('missed_badge', { count: missedArray.length });
      const profText = getTranslation('card_prof_label', { prof: formattedProf });

      card.innerHTML = `
        <div style="display: flex; gap: 1rem; align-items: flex-start;">
          ${checkboxHTML}
          <div style="flex: 1;">
            <h3>${major} Year ${year} Sem ${semester} - ${subject}</h3>
            <p style="margin: 0 0 0.25rem 0; font-size: 0.9rem; color: var(--text-heading); font-weight: 600;">${profText}</p>
            <p class="missed-badge">${missedText}</p>
            ${!isSelectMode ? `
              <div class="subject-actions" style="flex-direction: column;">
                <button class="btn study-missed-btn" onclick="launchAccountReview('${major}', '${year}', '${semester}', '${subject}', '${formattedProf}')">${getTranslation('card_practice_missed', { count: missedArray.length })}</button>
                <button class="btn primary-btn" onclick="promptAnkiExport('${key}')">${getTranslation('card_export_anki')}</button>
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
          
          if (selectedSubjectKeys.has(key)) selectedSubjectKeys.delete(key);
          else selectedSubjectKeys.add(key);
          
          updateDeleteButtonState();
          renderAccountDashboard();
        });
      }

      accountSubjectList.appendChild(card);
    }
  });

  if (totalMissedAcrossApp === 0) {
    if (toggleSelectModeBtn) toggleSelectModeBtn.classList.add('hidden');
    if (bulkControls) bulkControls.classList.add('hidden');
    
    accountSubjectList.innerHTML = `
      <div class="score-card" style="text-align: center; padding: 2rem;">
        <p style="margin: 0; color: var(--text-sub);" data-i18n="account_empty_vault">${getTranslation('account_empty_vault')}</p>
      </div>
    `;
  } else {
    if (toggleSelectModeBtn) toggleSelectModeBtn.classList.remove('hidden');
  }
}

function setupVaultListeners() {
  const toggleSelectModeBtn = document.getElementById('toggle-select-mode-btn');
  const selectAllBtn = document.getElementById('select-all-btn');
  const deleteSelectedBtn = document.getElementById('delete-selected-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const deleteConfirmModal = document.getElementById('delete-confirm-modal');

  if (toggleSelectModeBtn) {
    toggleSelectModeBtn.addEventListener('click', () => {
      isSelectMode = !isSelectMode;
      selectedSubjectKeys.clear();
      
      const bulkControls = document.getElementById('bulk-controls');
      if (isSelectMode) {
        toggleSelectModeBtn.textContent = getTranslation('btn_cancel_select');
        if (bulkControls) bulkControls.classList.remove('hidden');
      } else {
        toggleSelectModeBtn.textContent = getTranslation('btn_select');
        if (bulkControls) bulkControls.classList.add('hidden');
      }
      
      updateDeleteButtonState();
      renderAccountDashboard();
    });
  }

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

  if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener('click', () => {
      if (selectedSubjectKeys.size === 0) return;
      const deleteWarningText = document.getElementById('delete-warning-text');
      if (deleteWarningText) {
        deleteWarningText.textContent = getTranslation('delete_modal_desc', { count: selectedSubjectKeys.size });
      }
      if (deleteConfirmModal) deleteConfirmModal.classList.remove('hidden');
    });
  }

  if (cancelDeleteBtn && deleteConfirmModal) {
    cancelDeleteBtn.addEventListener('click', () => deleteConfirmModal.classList.add('hidden'));
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      selectedSubjectKeys.forEach(key => localStorage.removeItem(key));
      selectedSubjectKeys.clear();
      isSelectMode = false;
      
      const bulkControls = document.getElementById('bulk-controls');
      if (toggleSelectModeBtn) toggleSelectModeBtn.textContent = getTranslation('btn_select');
      if (bulkControls) bulkControls.classList.add('hidden');
      if (deleteConfirmModal) deleteConfirmModal.classList.add('hidden');
      
      updateDeleteButtonState();
      renderAccountDashboard();
    });
  }
}

function updateDeleteButtonState() {
  const deleteSelectedBtn = document.getElementById('delete-selected-btn');
  const selectAllBtn = document.getElementById('select-all-btn');
  if (!deleteSelectedBtn) return;

  const count = selectedSubjectKeys.size;
  deleteSelectedBtn.textContent = getTranslation('btn_delete_selected', { count });
  deleteSelectedBtn.disabled = count === 0;

  if (selectAllBtn) {
    const totalCards = document.querySelectorAll('.card-checkbox').length;
    selectAllBtn.textContent = (totalCards > 0 && selectedSubjectKeys.size === totalCards) 
      ? getTranslation('btn_deselect_all') 
      : getTranslation('btn_select_all');
  }
}

function launchAccountReview(major, year, semester, subject, professor) {
  const sessionConfig = {
    major: major,
    year: year,
    semester: semester,
    subject: subject,
    professor: professor,
    isSubjectWide: false,
    mode: 'missed'
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = '/quiz';
}

// ==========================================================================
// 5. ANKI EXPORT ENGINE WITH BASE64 OFFLINE IMAGES
// ==========================================================================

function setupAnkiListeners() {
  const ankiModal = document.getElementById('anki-modal');
  const ankiKeepBtn = document.getElementById('anki-keep-btn');
  const ankiClearBtn = document.getElementById('anki-clear-btn');
  const ankiCancelBtn = document.getElementById('anki-cancel-btn');

  if (ankiCancelBtn && ankiModal) {
    ankiCancelBtn.addEventListener('click', () => ankiModal.classList.add('hidden'));
  }
  if (ankiKeepBtn) {
    ankiKeepBtn.addEventListener('click', () => executeAnkiDownload(false));
  }
  if (ankiClearBtn) {
    ankiClearBtn.addEventListener('click', () => executeAnkiDownload(true));
  }
}

function promptAnkiExport(storageKey) {
  activeExportSubjectKey = storageKey;
  const ankiModal = document.getElementById('anki-modal');
  if (ankiModal) ankiModal.classList.remove('hidden');
}

async function fetchImageAsBase64(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn(`Could not convert image to Base64: ${url}`, e);
    return null;
  }
}

async function executeAnkiDownload(shouldClearAfter) {
  if (!activeExportSubjectKey) return;

  const raw = localStorage.getItem(activeExportSubjectKey);
  if (!raw) return;

  const questionsList = JSON.parse(raw);

  const ankiKeepBtn = document.getElementById('anki-keep-btn');
  const ankiClearBtn = document.getElementById('anki-clear-btn');
  const origKeepText = ankiKeepBtn ? ankiKeepBtn.textContent : '';
  const origClearText = ankiClearBtn ? ankiClearBtn.textContent : '';

  if (ankiKeepBtn) { ankiKeepBtn.disabled = true; ankiKeepBtn.textContent = 'Preparing Export...'; }
  if (ankiClearBtn) { ankiClearBtn.disabled = true; ankiClearBtn.textContent = 'Preparing Export...'; }

  let fileContent = "#separator:Tab\n#html:true\n";

  for (const q of questionsList) {
    let optionsText = q.options.map((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      return `<div><b>${letter})</b> ${opt}</div>`;
    }).join('');

    let imgHTML = '';
    const imgList = (Array.isArray(q.images) && q.images.length > 0)
      ? q.images
      : (q.image ? [q.image] : []);

    if (imgList.length > 0) {
      const b64Promises = imgList.map(imgName => {
        const fullUrl = `${IMAGE_BASE_URL}${imgName.trim()}`;
        return fetchImageAsBase64(fullUrl);
      });

      const b64Results = await Promise.all(b64Promises);

      imgHTML = b64Results.map((b64Data, idx) => {
        const src = b64Data || `${IMAGE_BASE_URL}${imgList[idx].trim()}`;
        return `<br><img src="${src}" style="max-height:300px;" />`;
      }).join('');
    }

    const front = `<div style='font-size:1.1em; font-weight:bold; margin-bottom:8px;'>${q.question}</div>${imgHTML}${optionsText}`;
    const correctLetter = String.fromCharCode(65 + q.correctIndex);
    const back = `<div><b>Correct Choice:</b> ${correctLetter}) ${q.options[q.correctIndex]}</div>`;

    fileContent += `${front}\t${back}\n`;
  }

  if (ankiKeepBtn) { ankiKeepBtn.disabled = false; ankiKeepBtn.textContent = origKeepText; }
  if (ankiClearBtn) { ankiClearBtn.disabled = false; ankiClearBtn.textContent = origClearText; }

  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `Anki_${activeExportSubjectKey}.txt`;
  downloadLink.click();

  if (shouldClearAfter) {
    localStorage.removeItem(activeExportSubjectKey);
    renderAccountDashboard();
  }

  const ankiModal = document.getElementById('anki-modal');
  if (ankiModal) ankiModal.classList.add('hidden');
}
