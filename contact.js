// ==========================================================================
// CONTACT & FEEDBACK LOGIC (contact.html)
// ==========================================================================

const WORKER_URL = "https://telegram-proxy.pensamkhan9.workers.dev";

document.addEventListener('DOMContentLoaded', () => {
  renderMyFeedbacks();

  const feedbackForm = document.getElementById('feedback-form');
  const feedbackText = document.getElementById('feedback-text');
  const feedbackImage = document.getElementById('feedback-image');
  const contactConfirmModal = document.getElementById('contact-confirm-modal');
  const confirmFeedbackBtn = document.getElementById('confirm-feedback-btn');
  const cancelFeedbackBtn = document.getElementById('cancel-feedback-btn');

  let pendingFeedbackPayload = null;

  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const lastSentTime = localStorage.getItem('last_feedback_internet_time');
      const nowInternet = await getInternetTime();

      if (lastSentTime) {
        const elapsed = nowInternet - parseInt(lastSentTime, 10);
        const cooldownMs = 30 * 60 * 1000;

        if (elapsed < cooldownMs) {
          const remainingMins = Math.ceil((cooldownMs - elapsed) / 60000);
          alert(`⏱️ Cooldown Active / រយៈពេលរង់ចាំ:\nPlease wait ${remainingMins} minute(s) before sending feedback again.`);
          return;
        }
      }

      pendingFeedbackPayload = {
        text: feedbackText.value,
        file: feedbackImage.files[0] || null,
        timestamp: nowInternet
      };

      if (contactConfirmModal) contactConfirmModal.classList.remove('hidden');
    });
  }

  if (cancelFeedbackBtn) {
    cancelFeedbackBtn.addEventListener('click', () => {
      if (contactConfirmModal) contactConfirmModal.classList.add('hidden');
      pendingFeedbackPayload = null;
    });
  }

  if (confirmFeedbackBtn) {
    confirmFeedbackBtn.addEventListener('click', async () => {
      if (!pendingFeedbackPayload) return;

      confirmFeedbackBtn.disabled = true;
      confirmFeedbackBtn.textContent = "Sending... / កំពុងផ្ញើ...";

      const { text, file, timestamp } = pendingFeedbackPayload;

      try {
        const formData = new FormData();
        formData.append('text', text);
        if (file) formData.append('photo', file);

        const res = await fetch(WORKER_URL, {
          method: 'POST',
          body: formData
        });

        const data = await res.json();

        if (data.ok && data.result) {
          const telegramMsgId = data.result.message_id;
          localStorage.setItem('last_feedback_internet_time', timestamp.toString());
          saveLocalFeedbackLog(text, timestamp, telegramMsgId);

          feedbackForm.reset();
          alert("✅ Feedback Sent Successfully! / បានផ្ញើដោយជោគជ័យ!");
        } else {
          alert(`⚠️ Telegram Error:\n${data.description || 'Failed to deliver message.'}`);
        }
      } catch (err) {
        alert(`⚠️ Connection Error:\n${err.message}`);
      }

      confirmFeedbackBtn.disabled = false;
      confirmFeedbackBtn.textContent = "Send / ផ្ញើ";
      if (contactConfirmModal) contactConfirmModal.classList.add('hidden');
      pendingFeedbackPayload = null;
      renderMyFeedbacks();
    });
  }
});

async function getInternetTime() {
  try {
    const response = await fetch(`${WORKER_URL}/time`);
    if (!response.ok) throw new Error("Time API unavailable");
    const data = await response.json();
    return data.timestamp;
  } catch (err) {
    return Date.now();
  }
}

function saveLocalFeedbackLog(text, timestamp, msgId) {
  const raw = localStorage.getItem('my_submitted_feedbacks');
  const logs = raw ? JSON.parse(raw) : [];

  logs.unshift({
    id: Date.now(),
    telegram_msg_id: msgId,
    text: text,
    date: new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Pending ⏳'
  });

  localStorage.setItem('my_submitted_feedbacks', JSON.stringify(logs));
}

async function renderMyFeedbacks() {
  const myFeedbackList = document.getElementById('my-feedback-list');
  if (!myFeedbackList) return;

  const raw = localStorage.getItem('my_submitted_feedbacks');
  const logs = raw ? JSON.parse(raw) : [];

  myFeedbackList.innerHTML = '';

  if (logs.length === 0) {
    myFeedbackList.innerHTML = `<p style="color: var(--text-sub); font-size: 0.9rem;">No submitted reports yet. / មិនទាន់មានប្រវត្តិរាយការណ៍នៅឡើយទេ។</p>`;
    return;
  }

  logs.forEach(log => {
    const card = document.createElement('div');
    card.classList.add('subject-card');
    card.style.padding = '1rem';

    const statusClass = log.status === 'Checked ✅' ? 'status-checked' : 'status-pending';

    card.innerHTML = `
      <div style="display:flex; justify-space-between; align-items:center; margin-bottom:0.5rem;">
        <span style="font-size:0.8rem; color:var(--text-sub);">${log.date}</span>
        <span class="feedback-status-badge ${statusClass}">${log.status}</span>
      </div>
      <p style="margin:0; font-size:0.95rem; color:var(--text-main); line-height:1.4;">${log.text}</p>
    `;
    myFeedbackList.appendChild(card);
  });
}
