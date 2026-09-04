// ==========================================================================
// CONTACT & FEEDBACK LOGIC (contact.js)
// ==========================================================================

const WORKER_URL = 'https://telegram-proxy.pensamkhan9.workers.dev';

document.addEventListener('DOMContentLoaded', async () => {
  await syncPendingFeedbacks();
  renderMyFeedbacks();

  const feedbackForm = document.getElementById('feedback-form');
  const confirmModal = document.getElementById('contact-confirm-modal');
  const cancelBtn = document.getElementById('cancel-feedback-btn');
  const confirmBtn = document.getElementById('confirm-feedback-btn');

  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Check 30-Minute Cooldown
      const lastSentTime = localStorage.getItem('last_feedback_time');
      if (lastSentTime) {
        const elapsedMins = (Date.now() - parseInt(lastSentTime, 10)) / (1000 * 60);
        if (elapsedMins < 30) {
          const remainingMins = Math.ceil(30 - elapsedMins);
          alert(`⏱️ Cooldown Active:\nPlease wait ${remainingMins} minute(s) before sending feedback again.`);
          return;
        }
      }

      if (confirmModal) confirmModal.classList.remove('hidden');
    });
  }

  if (cancelBtn && confirmModal) {
    cancelBtn.addEventListener('click', () => confirmModal.classList.add('hidden'));
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      if (confirmModal) confirmModal.classList.add('hidden');
      await submitFeedback();
    });
  }
});

// Check status ONLY for items still marked 'pending'
async function syncPendingFeedbacks() {
  const raw = localStorage.getItem('my_submitted_feedbacks');
  if (!raw) return;

  let logs = JSON.parse(raw);
  const pendingLogs = logs.filter(log => log.status !== 'checked' && log.status !== 'Checked ✅');

  // Skip API call completely if 0 pending reports exist
  if (pendingLogs.length === 0) return;

  const pendingIds = pendingLogs.map(log => log.id);

  try {
    const response = await fetch(`${WORKER_URL}/check-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: pendingIds })
    });

    const data = await response.json();
    if (data.ok && data.statuses) {
      let updated = false;
      logs = logs.map(log => {
        if (data.statuses[log.id] === 'checked') {
          updated = true;
          return { ...log, status: 'checked' };
        }
        return log;
      });

      if (updated) {
        localStorage.setItem('my_submitted_feedbacks', JSON.stringify(logs));
      }
    }
  } catch (e) {
    console.warn('Status sync error:', e);
  }
}

async function submitFeedback() {
  const feedbackText = document.getElementById('feedback-text');
  const feedbackImage = document.getElementById('feedback-image');
  const submitBtn = document.getElementById('submit-feedback-btn');

  if (!feedbackText || !feedbackText.value.trim()) return;

  const textValue = feedbackText.value.trim();

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Sending...';
  }

  const formData = new FormData();
  formData.append('text', textValue);

  if (feedbackImage && feedbackImage.files.length > 0) {
    formData.append('photo', feedbackImage.files[0]);
  }

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok || data.ok === false) {
      throw new Error(data.description || 'Failed to deliver message');
    }

    localStorage.setItem('last_feedback_time', Date.now().toString());
    saveLocalFeedbackLog(textValue, Date.now(), data.result?.message_id, data.report_id);

    feedbackText.value = '';
    if (feedbackImage) feedbackImage.value = '';

    alert('✅ Feedback sent successfully to Telegram!');
    renderMyFeedbacks();
  } catch (error) {
    console.error('Submission error:', error);
    alert(`❌ Failed to send feedback:\n${error.message}`);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '📤 Send Feedback';
    }
  }
}

function saveLocalFeedbackLog(text, timestamp, msgId, reportId) {
  const raw = localStorage.getItem('my_submitted_feedbacks');
  const logs = raw ? JSON.parse(raw) : [];

  logs.unshift({
    id: reportId || Date.now().toString(),
    telegram_msg_id: msgId,
    text: text,
    date: new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'pending'
  });

  localStorage.setItem('my_submitted_feedbacks', JSON.stringify(logs));
}

function deleteLocalFeedback(id) {
  const raw = localStorage.getItem('my_submitted_feedbacks');
  if (!raw) return;

  let logs = JSON.parse(raw);
  logs = logs.filter(log => String(log.id) !== String(id));
  localStorage.setItem('my_submitted_feedbacks', JSON.stringify(logs));
  renderMyFeedbacks();
}

function renderMyFeedbacks() {
  const myFeedbackList = document.getElementById('my-feedback-list');
  if (!myFeedbackList) return;

  const raw = localStorage.getItem('my_submitted_feedbacks');
  const logs = raw ? JSON.parse(raw) : [];

  myFeedbackList.innerHTML = '';

  if (logs.length === 0) {
    myFeedbackList.innerHTML = `<p style="color: var(--text-sub); font-size: 0.9rem;">${getTranslation('no_reports')}</p>`;
    return;
  }

  logs.forEach(log => {
    const card = document.createElement('div');
    card.classList.add('subject-card');
    card.style.padding = '1rem';

    const isChecked = log.status === 'Checked ✅' || log.status === 'checked';
    const statusClass = isChecked ? 'status-checked' : 'status-pending';
    const statusText = isChecked ? getTranslation('status_checked') : getTranslation('status_pending');

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
        <span style="font-size:0.8rem; color:var(--text-sub);">${log.date || ''}</span>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span class="feedback-status-badge ${statusClass}">${statusText}</span>
          <button onclick="deleteLocalFeedback('${log.id}')" title="Delete report" style="background:none; border:none; cursor:pointer; font-size:0.9rem; opacity:0.7; padding:0 4px;">🗑️</button>
        </div>
      </div>
      <p style="margin:0; font-size:0.95rem; color:var(--text-main); line-height:1.4;">${escapeHTML(log.text || '')}</p>
    `;
    myFeedbackList.appendChild(card);
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
