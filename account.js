// ==========================================================================
// MY ACCOUNT & VAULT LOGIC (account.html)
// ==========================================================================

let isSelectMode = false;
let selectedSubjectKeys = new Set();
let activeExportSubjectKey = null;

document.addEventListener('DOMContentLoaded', () => {
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
        toggleSelectModeBtn.textContent = '❌ Cancel';
        if (bulkControls) bulkControls.classList.remove('hidden');
      } else {
        toggleSelectModeBtn.textContent = '☑️ Select';
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
        deleteWarningText.textContent = `Are you sure you want to permanently delete missed questions from ${selectedSubjectKeys.size} selected subject(s)?`;
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
      if (toggleSelectModeBtn) toggleSelectModeBtn.textContent = '☑️ Select';
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
  deleteSelectedBtn.textContent = `🗑️ Delete Selected (${count})`;
  deleteSelectedBtn.disabled = count === 0;

  if (selectAllBtn) {
    const totalCards = document.querySelectorAll('.card-checkbox').length;
    selectAllBtn.textContent = (totalCards > 0 && selectedSubjectKeys.size === totalCards) 
      ? 'Deselect All' 
      : 'Select All';
  }
}

function renderAccountDashboard() {
  const accountSubjectList = document.getElementById('account-subject-list');
  const toggleSelectModeBtn = document.getElementById('toggle-select-mode-btn');
  const bulkControls = document.getElementById('bulk-controls');
  if (!accountSubjectList) return;

  accountSubjectList.innerHTML = '';
  let totalMissedAcrossApp = 0;

  Object.keys(manifestData).forEach(year => {
    manifestData[year].forEach(subject => {
      const key = getStorageKey(year, subject);
      const rawData = localStorage.getItem(key);
      const missedArray = rawData ? JSON.parse(rawData) : [];

      if (missedArray.length > 0) {
        totalMissedAcrossApp += missedArray.length;

        const card = document.createElement('div');
        card.classList.add('subject-card');
        if (selectedSubjectKeys.has(key)) card.classList.add('selected-for-delete');

        const isChecked = selectedSubjectKeys.has(key) ? 'checked' : '';
        const checkboxHTML = isSelectMode 
          ? `<input type="checkbox" class="card-checkbox" data-key="${key}" ${isChecked}>` 
          : '';

        card.innerHTML = `
          <div style="display: flex; gap: 1rem; align-items: flex-start;">
            ${checkboxHTML}
            <div style="flex: 1;">
              <h3>Year ${year} - ${subject}</h3>
              <p class="missed-badge">⚠️ ${missedArray.length} Missed Question${missedArray.length > 1 ? 's' : ''} Saved</p>
              ${!isSelectMode ? `
                <div class="subject-actions" style="flex-direction: column;">
                  <button class="btn study-missed-btn" onclick="launchAccountReview('${year}', '${subject}')">🎯 Practice Missed (${missedArray.length})</button>
                  <button class="btn primary-btn" onclick="promptAnkiExport('${key}')">📦 Export to Anki (.txt)</button>
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
  });

  if (totalMissedAcrossApp === 0) {
    if (toggleSelectModeBtn) toggleSelectModeBtn.classList.add('hidden');
    if (bulkControls) bulkControls.classList.add('hidden');
    
    const emptyText = translations[currentLang]?.account_empty_vault 
      || "🎉 Fantastic! You have 0 missed questions in your vault.";

    accountSubjectList.innerHTML = `
      <div class="score-card" style="text-align: center; padding: 2rem;">
        <p style="margin: 0; color: var(--text-sub);" data-i18n="account_empty_vault">${emptyText}</p>
      </div>
    `;
  } else {
    if (toggleSelectModeBtn) toggleSelectModeBtn.classList.remove('hidden');
  }
}

function launchAccountReview(year, subject) {
  const sessionConfig = {
    year: year,
    subject: subject,
    mode: 'missed'
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = 'quiz.html';
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
