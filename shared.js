
// ==========================================================================
// CLIENT-SIDE INSPECT & DEVTOOLS BLOCKER (SHARED ACROSS ALL PAGES)
// ==========================================================================

// 1. Block Right-Click Context Menu
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// 2. Block Keyboard Shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U, Cmd+Option+I/J/C)
document.addEventListener('keydown', (e) => {
  const key = e.key.toUpperCase();
  const isCmdOrCtrl = e.ctrlKey || e.metaKey;

  if (
    key === 'F12' ||
    (isCmdOrCtrl && e.shiftKey && ['I', 'J', 'C', 'K'].includes(key)) ||
    (isCmdOrCtrl && ['U', 'S'].includes(key))
  ) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
});

// 3. Anti-Debugging Loop (Freezes performance & clears page if DevTools is opened)
setInterval(() => {
  const startTime = performance.now();
  debugger;
  const endTime = performance.now();

  if (endTime - startTime > 100) {
    document.body.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; height:100vh; background:#0f172a; color:#ef4444; font-family:sans-serif; text-align:center; padding:1rem;">
        <div>
          <h2>⚠️ Developer Tools Disabled</h2>
          <p style="color:#94a3b8;">Please close DevTools and refresh the page to continue studying.</p>
        </div>
      </div>
    `;
  }
}, 1000);


// ==========================================================================
// SHARED UTILITIES, TRANSLATIONS & GLOBAL STATE
// ==========================================================================

const manifestData = {
  "1": ["I-D-A", "MED-PRO-B1", "MED-PRO", "MED-PRO-250", "I-D-A-Khmer"],
  "2": [],
  "3": [],
  "4": [],
  "5": [],
  "6": ["MED-PRO"]
};

const translations = {
  en: {
    nav_home: "HOME",
    nav_about: "ABOUT",
    nav_contact: "CONTACT US",
    nav_account: "MY ACCOUNT",
    landing_title: "Medical Study Platform",
    landing_sub: "Select your academic year, review saved missed questions, or test your knowledge.",
    btn_start_study: "🚀 Start Studying",
    btn_cancel: "Cancel",
    btn_leave: "Leave",
    leave_modal_title: "⚠️ Leave Study Session?",
    leave_modal_desc: "Your active test progress will be lost.",
    contact_title: "Report Question Error",
    contact_notice: "Found an incorrect question or answer? Send us a report below!",
    contact_desc_label: "Description:",
    contact_submit_btn: "📤 Send Feedback",
    cooldown_alert: "⏱️ Cooldown Active:\nPlease wait {mins} minute(s) before sending feedback again.",
    btn_back: "⬅️ Back",
    account_title: "My Account & Vault",
    account_empty_vault: "🎉 Fantastic! You have 0 missed questions in your vault.",
    year_selection_title: "Select Academic Year",
    year_1: "Year 1",
    year_2: "Year 2",
    year_3: "Year 3",
    year_4: "Year 4",
    year_5: "Year 5",
    year_6: "Year 6",
    btn_back_years: "⬅️ Back to Years",
    btn_study_all: "📖 Study All",
    btn_quiz: "📝 Quiz",
    btn_review_missed: "🎯 Review Missed",
    btn_clear_missed: "🗑️ Clear Saved Missed",
    subjects_header: "Year {year} Subjects",
    missed_badge: "⚠️ {count} saved missed question(s)",
    loading_text: "Loading Questions...",
    nav_donate: "☕ Support Us",
    donate_modal_title: "☕ Support testforuhs.com",
    donate_modal_desc: "Your donations help keep the platform free, maintain servers, and add new study features!",
    btn_close: "Close",
    donate_tagline: "Every little bit is greatly appreciated! Thank you for your support 😊",
    donate_cta: "You may donate through our KHQR here.",
    leave_modal_title: "⚠️ Leave Session?",
    leave_modal_desc: "Are you sure you want to leave? Your progress is saved, don't worry!",
    btn_leave: "Leave",
    btn_cancel: "Cancel",
    about_title: "About TestforUHS",
    about_sub: "A free, dedicated study and self-assessment platform for medical students.",
    about_mission_title: "🎯 Our Mission",
    about_mission_desc: "TestforUHS was created to give medical students an intuitive, accessible way to review questions, practice exam simulation, and track missed topics across their academic years—100% free of charge.",
    about_funding_title: "🤝 How TestforUHS Stays Free & Funded",
    about_funding_desc: "To keep this platform open and free for everyone without charging subscriptions or putting study materials behind paywalls, we cover server, domain, and maintenance costs using two transparent methods:",
    about_ad_title: "1. Non-Intrusive Advertisements (Google AdSense)",
    about_ad_loc: "Where ads appear: Only at the bottom of the Home page and on the Session Results summary page.",
    about_ad_zero: "Zero Interruptions: We never place ads inside active quiz screens or study sessions so your focus remains 100% on learning.",
    about_ad_filter: "Strict Content Filtering: All advertisements are heavily filtered. We strictly block adult content, social casino/gambling, clickbait, and misleading supplements.",
    about_donate_title: "2. Voluntary Community Support (KHQR Donations)",
    about_donate_desc: "If TestforUHS helps you in your studies, you can voluntarily support platform development via our Support Us button (KHQR). Every contribution directly covers domain fees and hosting infrastructure. Donations are completely optional and unlock no special privileges—every student receives full access to all features.",
    about_privacy_title: "🔒 Our Privacy Promise",
    about_privacy_desc: "Your study progress, missed questions, and test scores are stored locally inside your browser (localStorage). We do not track your personal study choices or sell student data to third parties.",
    
  },
  km: {
    nav_home: "ទំព័រដើម",
    nav_about: "អំពីពួកយើង",
    nav_contact: "ទំនាក់ទំនង",
    nav_account: "គណនីខ្ញុំ",
    landing_title: "កម្មវិធីសិក្សាវេជ្ជសាស្ត្រ",
    landing_sub: "ជ្រើសរើសឆ្នាំសិក្សា រំលឹកសំណួរដែលខុស ឬប្រឡងតេស្តសមត្ថភាព។",
    btn_start_study: "🚀 ចាប់ផ្តើមសិក្សា",
    btn_cancel: "បោះបង់",
    btn_leave: "ចាកចេញ",
    leave_modal_title: "⚠️ តើអ្នកពិតជាចង់ចាកចេញឬ?",
    leave_modal_desc: "ការវិវឌ្ឍនៃការធ្វើតេស្តរបស់អ្នកនឹងត្រូវបាត់បង់។",
    contact_title: "ផ្តល់មតិត្រឡប់ / រាយការណ៍កំហុស",
    contact_notice: "តើអ្នកប្រទះឃើញសំណួរ ឬចម្លើយមិនត្រឹមត្រូវមែនទេ? សូមផ្ញើការរាយការណ៍មកកាន់យើង!",
    contact_desc_label: "ការបរិយាយ:",
    contact_submit_btn: "📤 ផ្ញើការរាយការណ៍",
    cooldown_alert: "⏱️ រយៈពេលរង់ចាំ:\nសូមរង់ចាំ {mins} នាទីទៀតមុនពេលផ្ញើម្តងទៀត។",
    btn_back: "⬅️ ត្រឡប់ក្រោយ",
    account_title: "គណនី និងឃ្លាំងសំណួររបស់ខ្ញុំ",
    account_empty_vault: "🎉 អស្ចារ្យណាស់! អ្នកគ្មានសំណួរដែលខុសនៅក្នុងឃ្លាំងទេ។",
    year_selection_title: "ជ្រើសរើសឆ្នាំសិក្សា",
    year_1: "ឆ្នាំទី ១",
    year_2: "ឆ្នាំទី ២",
    year_3: "ឆ្នាំទី ៣",
    year_4: "ឆ្នាំទី ៤",
    year_5: "ឆ្នាំទី ៥",
    year_6: "ឆ្នាំទី ៦",
    btn_back_years: "⬅️ ត្រឡប់ទៅឆ្នាំ",
    btn_study_all: "📖 សិក្សាទាំងអស់",
    btn_quiz: "📝 ប្រឡងតេស្ត",
    btn_review_missed: "🎯 រំលឹកសំណួរខុស",
    btn_clear_missed: "🗑️ លុបសំណួរខុស",
    subjects_header: "មុខវិជ្ជាឆ្នាំទី {year}",
    missed_badge: "⚠️ {count} សំណួរខុសដែលបានរក្សាទុក",
    loading_text: "កំពុងទាញយកសំណួរ...",
    nav_donate: "☕ ឧបត្ថម្ភ",
    donate_modal_title: "☕ ឧបត្ថម្ភ testforuhs.com",
    donate_modal_desc: "ការឧបត្ថម្ភរបស់លោកអ្នកជួយគាំទ្រដល់ការចំណាយលើ Server និងអភិវឌ្ឍន៍កម្មវិធីសិក្សាឱ្យនៅតែឥតគិតថ្លៃ!",
    btn_close: "បិទ",
    donate_tagline: "ទៅតាមទឹកចិត្តរបស់អ្នករៀងៗខ្លួន។ តិចឬច្រើន គឺជាការលើកទឹកចិត្តយ៉ាងធំធេង! អរគុណសម្រាប់ការគាំទ្រ 😊",
    donate_cta: "អ្នកអាចធ្វើការឧបត្ថម្ភតាមរយៈ KHQR នៅទីនេះ៖",
    leave_modal_title: "⚠️ ចាកចេញពីការសិក្សា?",
    leave_modal_desc: "តើអ្នកពិតជាចង់ចាកចេញឬ? កុំបារម្ភ ការវិវឌ្ឍរបស់អ្នកត្រូវបានរក្សាទុក!",
    btn_leave: "ចាកចេញ",
    btn_cancel: "បោះបង់",
    about_title: "អំពី TestforUHS",
    about_sub: "វេទិកាសិក្សា និងវាយតម្លៃសមត្ថភាពដោយខ្លួនឯងឥតគិតថ្លៃ សម្រាប់និស្សិតវេជ្ជសាស្ត្រ។",
    about_mission_title: "🎯 បេសកកម្មរបស់យើង",
    about_mission_desc: "TestforUHS ត្រូវបានបង្កើតឡើងដើម្បីផ្តល់ជូននិស្សិតវេជ្ជសាស្ត្រនូវវិធីសាស្ត្រដ៏ងាយស្រួល ក្នុងការរំលឹកសំណួរ ធ្វើតេស្តប្រឡង និងតាមដានសំណួរដែលឆ្លើយខុស តាមឆ្នាំសិក្សានីមួយៗ—ដោយឥតគិតថ្លៃ ១០០%។",
    about_funding_title: "🤝 របៀបដែល TestforUHS រក្សាការប្រើប្រាស់ដោយឥតគិតថ្លៃ",
    about_funding_desc: "ដើម្បីរក្សាវេទិកានេះឱ្យបើកទូលាយ និងឥតគិតថ្លៃសម្រាប់និសិត្សទាំងអស់ ដោយមិនមានការទារប្រាក់ជាប្រចាំ យើងរ៉ាប់រងថ្លៃ(Server) និង(Domain) តាមរយៈវិធីសាស្ត្រច្បាស់លាស់ពីរ៖",
    about_ad_title: "១. ការផ្សាយពាណិជ្ជកម្មដែលមិនរំខាន (Google AdSense)",
    about_ad_loc: "កន្លែងបង្ហាញពាណិជ្ជកម្ម៖ បង្ហាញតែនៅផ្នែកខាងក្រោមនៃទំព័រដើម (Home) និងទំព័រលទ្ធផល (Results) ប៉ុណ្ណោះ។",
    about_ad_zero: "មិនមានការរំខាន៖ យើងមិនដែលដាក់ពាណិជ្ជកម្មនៅក្នុងទំព័រធ្វើតេស្ត ឬទំព័រសិក្សាឡើយ ដើម្បីឱ្យអ្នកផ្ដោតអារម្មណ៍ ១០០% លើការសិក្សា។",
    about_ad_filter: "ការចោះត្រងម៉ឺងម៉ាត់៖ រាល់ពាណិជ្ជកម្មទាំងអស់ត្រូវបានចោះត្រងយ៉ាងម៉ឺងម៉ាត់។ យើងហាមឃាត់ដាច់ខាតនូវខ្លឹមសារមនុស្សធំ ល្បែងស៊ីសង និងពាណិជ្ជកម្មភូតភរ។",
    about_donate_title: "២. ការគាំទ្រដោយស្ម័គ្រចិត្តពីសហគមន៍ (KHQR)",
    about_donate_desc: "ប្រសិនបើ TestforUHS ជួយដល់ការសិក្សារបស់អ្នក អ្នកអាចជួយឧបត្ថម្ភដល់ការអភិវឌ្ឍវេទិកានេះតាមរយៈប៊ូតុង 'Support Us' (KHQR)។ ការបរិច្ចាគគឺធ្វើឡើងដោយស្ម័គ្រចិត្តទាំងស្រុង ហើយនិស្សិតគ្រប់រូបទទួលបានសិទ្ធិប្រើប្រាស់មុខងារទាំងអស់ដូចៗគ្នា។",
    about_privacy_title: "🔒 សេចក្តីប្រកាសអំពីឯកជនភាព",
    about_privacy_desc: "ការវិវឌ្ឍនៃការសិក្សា ពិន្ទុ និងសំណួរខុសៗរបស់អ្នកត្រូវបានរក្សាទុកនៅក្នុងកម្មវិធីរុករក (Browser) របស់អ្នកផ្ទាល់ (localStorage)។ យើងមិនតាមដាន ឬលក់ទិន្នន័យរបស់និស្សិតទៅឱ្យភាគីទីបីឡើយ។",
    
  }
};

let currentLang = localStorage.getItem('app_language') || 'en';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('app_language', lang);
  document.documentElement.setAttribute('lang', lang);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });

  const langSelect = document.getElementById('language-select');
  if (langSelect) langSelect.value = lang;
}

function applyTheme(theme) {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeToggleBtn) themeToggleBtn.textContent = '☀️ Light';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeToggleBtn) themeToggleBtn.textContent = '🌙 Dark';
  }
}

function getStorageKey(year, subject) {
  return `missed_y${year}_${subject.toLowerCase()}`;
}

function recordQuestionResult(questionObj, isCorrect, year, subject) {
  const key = getStorageKey(year, subject);
  const raw = localStorage.getItem(key);
  let vault = raw ? JSON.parse(raw) : [];

  const existingIndex = vault.findIndex(item => item.question === questionObj.question);

  if (!isCorrect) {
    if (existingIndex >= 0) vault[existingIndex].streak = 0;
    else vault.push({ ...questionObj, streak: 0 });
  } else if (existingIndex >= 0) {
    vault[existingIndex].streak = (vault[existingIndex].streak || 0) + 1;
    if (vault[existingIndex].streak >= 2) vault.splice(existingIndex, 1);
  }

  if (vault.length > 0) localStorage.setItem(key, JSON.stringify(vault));
  else localStorage.removeItem(key);
}

document.addEventListener('DOMContentLoaded', () => {
  setLanguage(currentLang);
  const savedTheme = localStorage.getItem('app_theme') || 'dark';
  applyTheme(savedTheme);

  const langSelect = document.getElementById('language-select');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
  }

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const newTheme = isLight ? 'dark' : 'light';
      applyTheme(newTheme);
      localStorage.setItem('app_theme', newTheme);
    });
  }

  // Donate Modal Handlers
  const navDonateBtn = document.getElementById('nav-donate-btn');
  const donateModal = document.getElementById('donate-modal');
  const closeDonateBtn = document.getElementById('close-donate-btn');
  const bottomCloseDonateBtn = document.getElementById('bottom-close-donate-btn');

  if (navDonateBtn && donateModal) {
    navDonateBtn.addEventListener('click', () => donateModal.classList.remove('hidden'));
    if (closeDonateBtn) closeDonateBtn.addEventListener('click', () => donateModal.classList.add('hidden'));
    if (bottomCloseDonateBtn) bottomCloseDonateBtn.addEventListener('click', () => donateModal.classList.add('hidden'));
    donateModal.addEventListener('click', (e) => {
      if (e.target === donateModal) donateModal.classList.add('hidden');
    });
  }

  // Privacy Policy Modal Handlers
  const openPrivacyBtn = document.getElementById('open-privacy-btn');
  const privacyModal = document.getElementById('privacy-modal');
  const closePrivacyBtn = document.getElementById('close-privacy-btn');
  const bottomClosePrivacyBtn = document.getElementById('bottom-close-privacy-btn');

  if (openPrivacyBtn && privacyModal) {
    openPrivacyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      privacyModal.classList.remove('hidden');
    });
    if (closePrivacyBtn) closePrivacyBtn.addEventListener('click', () => privacyModal.classList.add('hidden'));
    if (bottomClosePrivacyBtn) bottomClosePrivacyBtn.addEventListener('click', () => privacyModal.classList.add('hidden'));
    privacyModal.addEventListener('click', (e) => {
      if (e.target === privacyModal) privacyModal.classList.add('hidden');
    });
  }
});
