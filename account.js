// ==========================================================================
// MY ACCOUNT & VAULT LOGIC (account.js)
// ==========================================================================

let isSelectMode = false;
let selectedSubjectKeys = new Set();
let activeExportSubjectKey = null;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Auto-Advance Toggle Setting
  const autoAdvanceToggle = document.getElementById('auto-advance-toggle');
  if (autoAdvanceToggle) {
    const isAutoAdvance = localStorage.getItem('auto_advance_quiz') === 'true';
    autoAdvanceToggle.checked = isAutoAdvance;

    autoAdvanceToggle.addEventListener('change', (e) => {
      localStorage.setItem('auto_advance_quiz', e.target.checked);
    });
  }

  // 2. Initialize Result Review Style Setting
  const reviewStyleSelect = document.getElementById('review-style-select');
  if (reviewStyleSelect) {
    const savedStyle = localStorage.getItem('result_review_style') || 'compact';
    reviewStyleSelect.value = savedStyle;

    reviewStyleSelect.addEventListener('change', (e) => {
      localStorage.setItem('result_review_style', e.target.value);
    });
  }

  // 2. Initialize Vault Dashboard & Listeners
  renderAccountDashboard();

  const toggleSelectModeBtn = document.getElementById('toggle-select-mode-btn');
  const selectAllBtn = document.getElementById('select-all-btn');
  const deleteSelectedBtn = document.getElementById('delete-selected-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const deleteConfirmModal = document.getElementById('delete-confirm-modal');

  const ankiModal = document.getElementById('anki-modal');
  const ankiKeepBtn = document.getElementById('anki-keep-btn');
  const ankiClearBtn = document.getElementById('anki-clear-btn');
  const ankiCancelBtn = document.getElementById('anki-cancel-btn');

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

  // Anki Export Listeners
  if (ankiCancelBtn && ankiModal) {
    ankiCancelBtn.addEventListener('click', () => ankiModal.classList.add('hidden'));
  }
  if (ankiKeepBtn) {
    ankiKeepBtn.addEventListener('click', () => executeAnkiDownload(false));
  }
  if (ankiClearBtn) {
    ankiClearBtn.addEventListener('click', () => executeAnkiDownload(true));
  }
});

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

function renderAccountDashboard() {
  const accountSubjectList = document.getElementById('account-subject-list');
  const toggleSelectModeBtn = document.getElementById('toggle-select-mode-btn');
  const bulkControls = document.getElementById('bulk-controls');
  if (!accountSubjectList) return;

  accountSubjectList.innerHTML = '';
  let totalMissedAcrossApp = 0;

  // 1. Collect all missed question keys matching missed_*
  const missedKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('missed_')) {
      missedKeys.push(key);
    }
  }

  // 2. Render cards for each saved missed vault
  missedKeys.sort().forEach(key => {
    const rawData = localStorage.getItem(key);
    const missedArray = rawData ? JSON.parse(rawData) : [];

    if (missedArray.length > 0) {
      totalMissedAcrossApp += missedArray.length;

      // Key format: missed_{major}_y{year}_{subject}_{profSlug}
      const parts = key.split('_');
      let major = 'MED';
      let year = '1';
      let subject = '';
      let profSlug = '';

      if (parts.length >= 5) {
        major = parts[1].toUpperCase();
        year = parts[2].replace('y', '');
        subject = parts[3].toUpperCase();
        profSlug = parts.slice(4).join('_');
      } else {
        subject = key;
      }

      const formattedProf = profSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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
            <h3>${major} Year ${year} - ${subject}</h3>
            <p style="margin: 0 0 0.25rem 0; font-size: 0.9rem; color: var(--text-heading); font-weight: 600;">${profText}</p>
            <p class="missed-badge">${missedText}</p>
            ${!isSelectMode ? `
              <div class="subject-actions" style="flex-direction: column;">
                <button class="btn study-missed-btn" onclick="launchAccountReview('${major}', '${year}', '${subject}', '${formattedProf}')">${getTranslation('card_practice_missed', { count: missedArray.length })}</button>
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

  // 3. Display empty state if vault is empty
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

function launchAccountReview(major, year, subject, professor) {
  const sessionConfig = {
    major: major,
    year: year,
    subject: subject,
    professor: professor,
    mode: 'missed'
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = '/quiz';
}

function promptAnkiExport(storageKey) {
  activeExportSubjectKey = storageKey;
  const ankiModal = document.getElementById('anki-modal');
  if (ankiModal) ankiModal.classList.remove('hidden');
}

function executeAnkiDownload(shouldClearAfter) {
  if (!activeExportSubjectKey) return;

  const raw = localStorage.getItem(activeExportSubjectKey);
  if (!raw) return;

  const questionsList = JSON.parse(raw);
  let fileContent = "#separator:Tab\n#html:true\n";

  questionsList.forEach(q => {
    let optionsText = q.options.map((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      return `<div><b>${letter})</b> ${opt}</div>`;
    }).join('');

    const front = `<div style='font-size:1.1em; font-weight:bold; margin-bottom:8px;'>${q.question}</div>${optionsText}`;
    const correctLetter = String.fromCharCode(65 + q.correctIndex);
    const back = `<div><b>Correct Choice:</b> ${correctLetter}) ${q.options[q.correctIndex]}</div>`;

    fileContent += `${front}\t${back}\n`;
  });

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
