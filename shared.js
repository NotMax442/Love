// ==========================================================================
// SHARED UTILITIES & GLOBAL STATE (shared.js)
// ==========================================================================

const IMAGE_BASE_URL = 'https://notmax442.github.io/testforuhs-images/';


const currentLang = localStorage.getItem('app_language') || 'en';

// Dynamic string translation helper with parameter substitution
function getTranslation(key, params = {}) {
  let str = (translations[currentLang] && translations[currentLang][key])
    || (translations.en && translations.en[key])
    || key;

  Object.keys(params).forEach(param => {
    str = str.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
  });

  return str;
}

function applyStaticTranslations() {
  document.documentElement.setAttribute('lang', currentLang);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translatedText = (translations[currentLang] && translations[currentLang][key]) || (translations.en && translations.en[key]);

    if (translatedText) {
      const cleanText = translatedText.replace(/<[^>]*>?/gm, '');
      const icon = el.querySelector('i[data-lucide], svg.lucide');

      if (icon) {
        // Keep icon element intact and update text label beside it
        const iconHTML = icon.outerHTML;
        el.innerHTML = `${iconHTML} ${cleanText}`;
      } else {
        el.textContent = cleanText;
      }
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[currentLang] && translations[currentLang][key]) {
      el.placeholder = translations[currentLang][key];
    }
  });

  const langSelect = document.getElementById('language-select');
  if (langSelect) langSelect.value = currentLang;

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Reload page cleanly on language toggle
function changeLanguage(lang) {
  localStorage.setItem('app_language', lang);
  location.reload();
}

const DESIGN_STORAGE_KEY = 'app_design';
const DESIGN_MODES = ['current', 'new-dashboard'];

function getSavedDesign() {
  const savedDesign = localStorage.getItem(DESIGN_STORAGE_KEY);
  return DESIGN_MODES.includes(savedDesign) ? savedDesign : 'current';
}

function applyDesign(design = getSavedDesign()) {
  const activeDesign = DESIGN_MODES.includes(design) ? design : 'current';
  document.documentElement.setAttribute('data-design', activeDesign);

  document.querySelectorAll('input[name="app-design"]').forEach(input => {
    input.checked = input.value === activeDesign;
  });

  return activeDesign;
}

function setDesign(design) {
  const activeDesign = applyDesign(design);
  localStorage.setItem(DESIGN_STORAGE_KEY, activeDesign);
  if (activeDesign === 'new-dashboard') setupDashboardNavigation();
  else closeDashboardNavigation();
  return activeDesign;
}

function closeDashboardNavigation() {
  const nav = document.querySelector('.main-navbar');
  const toggle = document.querySelector('.dashboard-menu-toggle');
  if (!nav || !toggle) return;
  nav.classList.remove('is-menu-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<i data-lucide="menu" style="width: 20px; height: 20px;"></i>';
  if (window.lucide) lucide.createIcons();
}

function setupDashboardNavigation() {
  const nav = document.querySelector('.main-navbar');
  const toggle = document.querySelector('.dashboard-menu-toggle');
  if (!nav) return;

  const isNewDashboard = document.documentElement.getAttribute('data-design') === 'new-dashboard';
  if (isNewDashboard && (!toggle || toggle.dataset.ready === 'true')) return;
  if (!isNewDashboard && nav.dataset.currentIconsReady === 'true') return;

  const iconMap = {
    nav_home: 'house',
    nav_about: 'circle-help',
    nav_contact: 'message-square',
    nav_account: 'user-round',
    nav_donate: 'heart-handshake'
  };

  nav.querySelectorAll('.nav-links .nav-item').forEach(link => {
    const iconName = iconMap[link.dataset.i18n];
    if (!iconName) return;
    if (!link.querySelector('.dashboard-nav-icon, i[data-lucide], svg.lucide')) {
      const icon = document.createElement('i');
      icon.className = 'dashboard-nav-icon';
      icon.dataset.lucide = iconName;
      icon.setAttribute('aria-hidden', 'true');
      link.prepend(icon);
    }

    const label = link.dataset.i18n === 'nav_home' ? 'Home'
      : link.dataset.i18n === 'nav_about' ? 'About'
        : link.dataset.i18n === 'nav_contact' ? 'Contact Us'
          : link.dataset.i18n === 'nav_account' ? 'My Account'
            : 'Support Us';
    link.setAttribute('aria-label', label);
    link.title = label;
    if (!isNewDashboard) {
      [...link.childNodes].forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          const textLabel = document.createElement('span');
          textLabel.className = 'current-nav-label';
          textLabel.textContent = node.textContent.trim();
          node.replaceWith(textLabel);
        }
      });
    }
  });

  if (!isNewDashboard) {
    nav.dataset.currentIconsReady = 'true';
    if (window.lucide) lucide.createIcons();
    return;
  }

  const setMenuState = (isOpen) => {
    nav.classList.toggle('is-menu-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    toggle.innerHTML = `<i data-lucide="${isOpen ? 'x' : 'menu'}" style="width: 20px; height: 20px;"></i>`;
    if (window.lucide) lucide.createIcons();
  };

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setMenuState(!nav.classList.contains('is-menu-open'));
  });

  nav.querySelectorAll('.nav-links .nav-item').forEach(link => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuState(false);
  });

  toggle.dataset.ready = 'true';
  if (window.lucide) lucide.createIcons();
}

function showToast(message, type = 'info', duration = 4200) {
  if (!message || !document || !document.body) return;

  let container = document.getElementById('app-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'app-toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `app-toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  window.setTimeout(() => {
    toast.classList.remove('show');
    window.setTimeout(() => toast.remove(), 220);
  }, duration);
}

function ensureOfflineStatusIndicator() {
  let indicator = document.getElementById('offline-status-indicator');
  if (indicator) return indicator;

  indicator = document.createElement('div');
  indicator.id = 'offline-status-indicator';
  indicator.className = 'offline-status-indicator';
  indicator.setAttribute('role', 'status');
  indicator.setAttribute('aria-live', 'polite');
  indicator.title = 'Network status';

  const target = document.querySelector('.nav-controls');
  if (target) {
    target.appendChild(indicator);
  } else {
    document.body.appendChild(indicator);
  }

  return indicator;
}

function updateOfflineStatus() {
  const indicator = ensureOfflineStatusIndicator();
  const isOnline = navigator.onLine;

  if (!isOnline) {
    indicator.title = 'You are offline.';
    indicator.classList.remove('is-online');
    indicator.classList.add('is-offline');
    return;
  }

  indicator.title = 'You are online.';
  indicator.classList.remove('is-offline');
  indicator.classList.add('is-online');
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
  applyDesign();
  applyStaticTranslations();
  setupDashboardNavigation();
  updateOfflineStatus();

  window.addEventListener('online', updateOfflineStatus);
  window.addEventListener('offline', updateOfflineStatus);

  const langSelect = document.getElementById('language-select');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => changeLanguage(e.target.value));
  }

  registerServiceWorker();

  // Set Theme
  const savedTheme = localStorage.getItem('app_theme') || 'dark';
  applyTheme(savedTheme);

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const newTheme = isLight ? 'dark' : 'light';
      applyTheme(newTheme);
      localStorage.setItem('app_theme', newTheme);
    });
  }

  // Reset navigation view to Landing ("Start Studying") when clicking HOME
  const homeNavLinks = document.querySelectorAll('[data-i18n="nav_home"]');
  homeNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      localStorage.setItem('lastView', 'landing');
      localStorage.removeItem('lastActiveYear');
      localStorage.removeItem('lastActiveSemester');
      sessionStorage.setItem('lastView', 'landing');
      sessionStorage.removeItem('lastActiveYear');
      sessionStorage.removeItem('lastActiveSemester');
    });
  });

  setupSharedModals();
});

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  if (typeof isOfflineModeEnabled !== 'function' || !isOfflineModeEnabled()) {
    await updateServiceWorkerForOfflineMode(false);
    return;
  }

  const isSecureContext = window.isSecureContext || window.location.hostname === 'localhost';
  if (!isSecureContext) {
    document.documentElement.setAttribute('data-offline-support', 'limited');
    console.warn('Offline app caching requires HTTPS or localhost.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('./sw.js', {
      scope: './',
      updateViaCache: 'none'
    });
    await registration.update();
    document.documentElement.setAttribute('data-offline-support', 'ready');
    updateOfflineStatus();
  } catch (error) {
    document.documentElement.setAttribute('data-offline-support', 'limited');
    console.warn('Service worker registration failed:', error);
    updateOfflineStatus();
  }
}

async function updateServiceWorkerForOfflineMode(enabled) {
  if (!('serviceWorker' in navigator)) return;

  if (enabled) {
    await registerServiceWorker();
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(registration => registration.unregister()));
    if ('caches' in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys
        .filter(key => key.startsWith('testforuhs-offline-'))
        .map(key => caches.delete(key)));
    }
    document.documentElement.setAttribute('data-offline-support', 'disabled');
    updateOfflineStatus();
  } catch (error) {
    console.warn('Could not disable offline support:', error);
    updateOfflineStatus();
  }
}

// --- Theme Manager ---
function applyTheme(theme) {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = '<i data-lucide="sun" style="width:16px;height:16px;"></i> Light';
    }
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = '<i data-lucide="moon" style="width:16px;height:16px;"></i> Dark';
    }
  }
  if (window.lucide) {
    lucide.createIcons();
  }
}

// --- Helper: Professor Slug Generator ---
function getProfSlug(profName) {
  if (!profName) return '';
  return profName
    .toLowerCase()
    .replace(/\./g, '')           // Strip dots ("Pr." -> "pr")
    .replace(/\s+/g, '-')         // Convert spaces to dashes
    .replace(/[^a-z0-9-&]/g, ''); // Retain valid characters
}

// --- Vault Storage Helpers ---
function getStorageKey(major, year, semester, subject, professor) {
  if (typeof StudyRepository !== 'undefined') {
    return StudyRepository.vaultKey(major, year, semester, subject, professor);
  }
  if (!major || year === undefined || semester === undefined || !subject || !professor) return '';
  const profSlug = getProfSlug(professor);
  return `missed_${major.toLowerCase()}_y${year}_s${semester}_${subject.toLowerCase()}_${profSlug}`;
}

// Helper: Unique signature for questions
function getQuestionSignature(q) {
  if (typeof StudyRepository !== 'undefined') {
    return StudyRepository.questionSignature(q);
  }
  if (!q) return '';
  const text = (q.question || '').trim();
  const img = Array.isArray(q.images) && q.images.length > 0
    ? q.images.join(',')
    : (q.image || '').trim();
  const sortedOpts = Array.isArray(q.options) ? [...q.options].sort().join('|') : '';
  return `${q.id || ''}_${text}_${img}_${sortedOpts}`;
}

// ==========================================================================
// PERSISTENT PERFORMANCE ANALYTICS TRACKING
// ==========================================================================

async function getAnalyticsData() {
  if (typeof StudyRepository !== 'undefined') return StudyRepository.getAnalyticsData();
  const raw = localStorage.getItem('app_analytics_stats');
  if (!raw) return { total: 0, correct: 0, profs: {} };
  try { return JSON.parse(raw); } catch (e) { return { total: 0, correct: 0, profs: {} }; }
}

async function recordAnalyticsAnswer(major, year, semester, subject, professor, isCorrect) {
  if (!major || year === undefined || semester === undefined || !subject || !professor) return;

  const stats = await getAnalyticsData();
  const profSlug = getProfSlug(professor);
  const profKey = `${major.toLowerCase()}_y${year}_s${semester}_${subject.toLowerCase()}_${profSlug}`;

  // Update Overall Stats
  stats.total = (stats.total || 0) + 1;
  if (isCorrect) stats.correct = (stats.correct || 0) + 1;

  // Update Per-Professor Stats
  if (!stats.profs) stats.profs = {};
  if (!stats.profs[profKey]) {
    stats.profs[profKey] = {
      major,
      year,
      semester,
      subject,
      professor,
      total: 0,
      correct: 0
    };
  }

  stats.profs[profKey].total += 1;
  if (isCorrect) stats.profs[profKey].correct += 1;

  if (typeof StudyRepository !== 'undefined') await StudyRepository.saveAnalyticsData(stats);
  else localStorage.setItem('app_analytics_stats', JSON.stringify(stats));
}

// Record question result in vault + update accuracy analytics
async function recordQuestionResult(questionObj, isCorrect, major, year, semester, subject, professor) {
  if (!major || year === undefined || semester === undefined || !subject || !professor) return;

  // 1. Record in Analytics Engine
  await recordAnalyticsAnswer(major, year, semester, subject, professor, isCorrect);

  // 2. Record in Missed Question Vault
  const key = getStorageKey(major, year, semester, subject, professor);
  if (!key) return;

  let vault = typeof StudyRepository !== 'undefined'
    ? await StudyRepository.getMissedQuestions(key)
    : (() => {
      const raw = localStorage.getItem(key);
      try { return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
    })();

  const targetSig = getQuestionSignature(questionObj);
  if (!targetSig) return;

  const existingIndex = vault.findIndex(item => getQuestionSignature(item) === targetSig);

  if (!isCorrect) {
    if (existingIndex >= 0) {
      vault[existingIndex] = { ...questionObj, streak: 0 };
    } else {
      vault.push({ ...questionObj, streak: 0 });
    }
  } else {
    if (existingIndex >= 0) {
      const currentStreak = (vault[existingIndex].streak || 0) + 1;
      if (currentStreak >= 2) {
        vault.splice(existingIndex, 1);
      } else {
        vault[existingIndex].streak = currentStreak;
      }
    }
  }

  if (typeof StudyRepository !== 'undefined') await StudyRepository.saveMissedQuestions(key, vault);
  else if (vault.length > 0) localStorage.setItem(key, JSON.stringify(vault));
  else localStorage.removeItem(key);
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// --- Shared Modal Controller ---
function setupSharedModals() {
  const navDonateBtn = document.getElementById('nav-donate-btn');
  const donateModal = document.getElementById('donate-modal');
  const closeDonateBtn = document.getElementById('close-donate-btn');
  const bottomCloseDonateBtn = document.getElementById('bottom-close-donate-btn');

  let donateTrigger = null;
  const closeDonate = () => {
    if (!donateModal) return;
    donateModal.classList.add('hidden');
    if (donateTrigger) donateTrigger.focus();
  };

  if (navDonateBtn && donateModal) {
    navDonateBtn.addEventListener('click', () => {
      donateTrigger = navDonateBtn;
      donateModal.classList.remove('hidden');
      closeDonateBtn?.focus();
    });
  }
  if (closeDonateBtn) closeDonateBtn.addEventListener('click', closeDonate);
  if (bottomCloseDonateBtn) bottomCloseDonateBtn.addEventListener('click', closeDonate);
  if (donateModal) {
    donateModal.addEventListener('click', (e) => {
      if (e.target === donateModal) closeDonate();
    });
    donateModal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDonate();
    });
  }

  const openPrivacyBtn = document.getElementById('open-privacy-btn');
  const privacyModal = document.getElementById('privacy-modal');
  const closePrivacyBtn = document.getElementById('close-privacy-btn');
  const bottomClosePrivacyBtn = document.getElementById('bottom-close-privacy-btn');

  const closePrivacy = () => privacyModal && privacyModal.classList.add('hidden');

  if (openPrivacyBtn && privacyModal) {
    openPrivacyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      privacyModal.classList.remove('hidden');
    });
  }
  if (closePrivacyBtn) closePrivacyBtn.addEventListener('click', closePrivacy);
  if (bottomClosePrivacyBtn) bottomClosePrivacyBtn.addEventListener('click', closePrivacy);
  if (privacyModal) {
    privacyModal.addEventListener('click', (e) => {
      if (e.target === privacyModal) closePrivacy();
    });
  }
}
