// ==========================================================================
// SHARED UTILITIES & GLOBAL STATE (shared.js)
// ==========================================================================

const translations = {
  en: {
    // Navigation & Modals
    nav_home: "HOME",
    nav_about: "ABOUT",
    nav_contact: "CONTACT US",
    nav_account: "MY ACCOUNT",
    nav_donate: "☕ Support Us",
    donate_modal_title: "☕ Support testforuhs.com",
    donate_modal_desc: "Your donations help keep the platform free, maintain servers, and add new study features!",
    btn_close: "Close",
    donate_tagline: "Every little bit is greatly appreciated! Thank you for your support 😊",
    donate_cta: "You may donate through our KHQR here.",

    // Landing & Page Headers
    landing_title: "Medical Study Platform",
    landing_sub: "Select your year, review saved missed questions, or test your knowledge.",
    btn_start_study: "🚀 Start Studying",
    title_select_major: "Select Major",
    title_select_year: "{major} - Select Academic Year",
    title_select_semester: "{major} Year {year} - Select Semester",
    title_subjects: "{major} Y{year} S{semester} - Subjects",
    title_select_prof: "{subject} - Select Professor",
    click_select_prof: "Click to select professor",

    // Back Buttons
    btn_back_home: "⬅️ Back to Home",
    btn_back_majors: "⬅️ Back to Majors",
    btn_back_years: "⬅️ Back to Years",
    btn_back_semesters: "⬅️ Back to Semesters",
    btn_back_subjects: "⬅️ Back to Subjects",

    // Cards (Major / Year / Semester)
    major_med: "Medicine (MED)",
    year_1: "Year 1",
    year_2: "Year 2",
    year_3: "Year 3",
    year_4: "Year 4",
    year_5: "Year 5",
    year_6: "Year 6",
    semester_1: "Semester 1",
    semester_2: "Semester 2",

    // Study & Professor Actions
    btn_study_all: "📖 Study All",
    btn_quiz: "📝 Quiz",
    btn_review_missed: "🎯 Review Missed",
    btn_clear_missed: "🗑️ Clear Saved Missed",
    missed_badge: "⚠️ {count} saved missed question(s)",
    loading_text: "Loading Questions...",

    // Leave Guard Modal
    btn_cancel: "Cancel",
    btn_leave: "Leave",
    leave_modal_title: "⚠️ Leave Study Session?",
    leave_modal_desc: "Your active test progress will be lost.",

    // Contact / Feedback Page
    contact_title: "Report Question Error",
    contact_notice: "Found an incorrect question or answer? Send us a report below!",
    contact_desc_label: "Description:",
    contact_placeholder: "Describe what is wrong with the question...",
    contact_upload_label: "Upload Screenshot (Optional):",
    contact_submit_btn: "📤 Send Feedback",
    contact_reports_header: "My Submitted Reports",
    contact_modal_title: "⚠️ Confirm Submission",
    contact_modal_desc: "Are you sure? You can only send feedback once every 30 minutes.",
    cooldown_alert: "⏱️ Cooldown Active:\nPlease wait {mins} minute(s) before sending feedback again.",
    btn_send: "Send",
    status_pending: "⏳ Pending Review",
    status_checked: "✅ Reviewed & Fixed",
    no_reports: "You haven't submitted any feedback reports yet.",

    // Vault / Account Page
    account_title: "My Account & Vault",
    account_sub: "Manage your preferences, saved missed questions, and local study vault.",
    account_pref_title: "⚙️ Quiz Preferences",
    account_autoadv_title: "Auto-advance in Quiz Mode",
    account_autoadv_desc: "Automatically move to the next question after selecting an option without having to click \"Next Question\".",
    account_vault_title: "📦 Missed Questions Vault",
    account_empty_vault: "🎉 Fantastic! You have 0 missed questions in your vault.",
    btn_select: "☑️ Select",
    btn_cancel_select: "❌ Cancel",
    btn_select_all: "Select All",
    btn_deselect_all: "Deselect All",
    btn_delete_selected: "🗑️ Delete Selected ({count})",
    delete_modal_title: "⚠️ Are you sure?",
    delete_modal_desc: "Are you sure you want to permanently delete missed questions from {count} selected subject(s)?",
    btn_confirm_delete: "Yes, Delete",
    anki_modal_title: "📦 Export to Anki (.txt)",
    anki_modal_desc: "How would you like to process these questions after downloading?",
    btn_anki_keep: "📥 Export & Keep in Vault",
    btn_anki_clear: "🗑️ Export & Clear Subject Vault",
    card_prof_label: "👨‍🏫 Professor: {prof}",
    card_practice_missed: "🎯 Practice Missed ({count})",
    card_export_anki: "📦 Export to Anki (.txt)",

    // About Page
    about_title: "About TestforUHS",
    about_sub: "A free, dedicated study and self-assessment platform for medical students.",
    about_mission_title: "🎯 Our Mission",
    about_mission_desc: "TestforUHS was created to give medical students an intuitive, accessible way to review questions, practice exam simulation, and track missed topics across their academic years—100% free of charge.",
    about_funding_title: "🤝 How TestforUHS Stays Free & Funded",
    about_funding_desc: "To keep this platform open and free for everyone without charging subscriptions or putting study materials behind paywalls, we cover server, domain, and maintenance costs using two transparent methods:",
    about_ad_title: "1. Non-Intrusive Advertisements (Google AdSense)",
    about_ad_loc: "<strong>Where ads appear:</strong> Only at the bottom of the Home page and on the Session Results summary page.",
    about_ad_zero: "<strong>Zero Interruptions:</strong> We never place ads inside active quiz screens or study sessions so your focus remains 100% on learning.",
    about_ad_filter: "<strong>Strict Content Filtering:</strong> All advertisements are heavily filtered. We strictly block adult content, social casino/gambling, clickbait, and misleading supplements.",
    about_donate_title: "2. Voluntary Community Support (KHQR Donations)",
    about_donate_desc: "If TestforUHS helps you in your studies, you can voluntarily support platform development via our Support Us button (KHQR). Every contribution directly covers domain fees and hosting infrastructure. Donations are completely optional and unlock no special privileges—every student receives full access to all features.",
    about_privacy_title: "🔒 Our Privacy Promise",
    about_privacy_desc: "Your study progress, missed questions, and test scores are stored locally inside your browser (localStorage). We do not track your personal study choices or sell student data to third parties.",

    // Morale Boost Messages
    morale_1: "💪 You can do this! I believe in you.",
    morale_2: "🏃 Don't lose hope. You still have time.",
    morale_3: "🌟 You can try again. Maybe next time it'll be better.",
    morale_4: "🌱 Don't be scared, This is not the real exam.",
    morale_5: "🛡️ Don't be sad, I'll be here for you until you get a good scoring.",
    morale_6: "🩺 Rest for a bit. Then try again later 💞",

    //quiz
    mode_study: "STUDY",
    mode_quiz: "QUIZ",
    mode_missed: "MISSED",
    quiz_progress: "Question {current} of {total}",
    study_progress: "Total Questions: {total} (Answered: {answered})",
    btn_next_question: "Next Question ➡️",
    btn_finish_quiz: "Finish Quiz 🏁",
    btn_fullscreen: "⛶ Fullscreen",
    btn_exit_fullscreen: "Exit Fullscreen",
    time_up_alert: "⏱️ Time is up! Submitting your quiz now.",
    no_missed_alert: "No saved missed questions found for this professor!",
    load_error_alert: "Could not load questions!\nMake sure your file exists at:\n\"{path}\"",
    leave_modal_desc_study: "Are you sure you want to leave? Your progress will be saved, don't worry!",
    leave_modal_desc_quiz: "Are you sure you want to leave? Your active timed quiz progress will be lost.",

    // result
    review_perfect_score: "🎉 Perfect score! You answered all questions correctly!",
    review_unanswered: "⚠️ Unanswered / Skipped",
    label_your_choice: "Your Choice",
    label_correct_choice: "Correct Choice",
    account_review_style_title: "Result Review Display Style",
    account_review_style_desc: "Choose whether to display result reviews as a compact text summary or full study-style options.",
    option_style_compact: "Compact (Text Summary)",
    option_style_full: "Full Options (Study Style)",
    option_style_compact: "Compact View",
    option_style_full: "Full Options View",

    // continue study
    btn_continue_study: "▶️ Continue ({answered}/{total})",
    btn_restart_study: "🔄 Restart Study All",

    // coming soon
    coming_soon_title: "Coming Soon!",
    coming_soon_sub: "There is nothing here yet. Sorry🙏.",
  },
  km: {
    // Navigation & Modals
    nav_home: "ទំព័រដើម",
    nav_about: "អំពីពួកយើង",
    nav_contact: "ទំនាក់ទំនង",
    nav_account: "គណនីខ្ញុំ",
    nav_donate: "☕ ឧបត្ថម្ភ",
    donate_modal_title: "☕ ឧបត្ថម្ភ testforuhs.com",
    donate_modal_desc: "ការឧបត្ថម្ភរបស់លោកអ្នកជួយគាំទ្រដល់ការចំណាយលើ Server និងអភិវឌ្ឍន៍កម្មវិធីសិក្សាឱ្យនៅតែឥតគិតថ្លៃ!",
    btn_close: "បិទ",
    donate_tagline: "ទៅតាមទឹកចិត្តរបស់អ្នករៀងៗខ្លួន។ តិចឬច្រើន គឺជាការលើកទឹកចិត្តយ៉ាងធំធេង! អរគុណសម្រាប់ការគាំទ្រ 😊",
    donate_cta: "អ្នកអាចធ្វើការឧបត្ថម្ភតាមរយៈ KHQR នៅទីនេះ៖",

    // Landing & Page Headers
    landing_title: "កម្មវិធីសិក្សាវេជ្ជសាស្ត្រ",
    landing_sub: "ជ្រើសរើសឆ្នាំសិក្សា រំលឹកសំណួរដែលខុស ឬប្រឡងតេស្តសមត្ថភាព។",
    btn_start_study: "🚀 ចាប់ផ្តើមសិក្សា",
    title_select_major: "ជ្រើសរើសជំនាញសិក្សា",
    title_select_year: "{major} - ជ្រើសរើសឆ្នាំសិក្សា",
    title_select_semester: "{major} ឆ្នាំទី {year} - ជ្រើសរើសឆមាស",
    title_subjects: "មុខវិជ្ជា {major} ឆ្នាំទី {year} ឆមាស {semester}",
    title_select_prof: "{subject} - ជ្រើសរើសសាស្ត្រាចារ្យ",
    click_select_prof: "ចុចទីនេះដើម្បីជ្រើសរើសសាស្ត្រាចារ្យ",

    // Back Buttons
    btn_back_home: "⬅️ ត្រឡប់ទៅទំព័រដើម",
    btn_back_majors: "⬅️ ត្រឡប់ទៅជំនាញ",
    btn_back_years: "⬅️ ត្រឡប់ទៅឆ្នាំសិក្សា",
    btn_back_semesters: "⬅️ ត្រឡប់ទៅឆមាស",
    btn_back_subjects: "⬅️ ត្រឡប់ទៅមុខវិជ្ជា",

    // Cards (Major / Year / Semester)
    major_med: "វេជ្ជសាស្ត្រ (MED)",
    year_1: "ឆ្នាំទី ១",
    year_2: "ឆ្នាំទី ២",
    year_3: "ឆ្នាំទី ៣",
    year_4: "ឆ្នាំទី ៤",
    year_5: "ឆ្នាំទី ៥",
    year_6: "ឆ្នាំទី ៦",
    semester_1: "ឆមាសទី ១",
    semester_2: "ឆមាសទី ២",

    // Study & Professor Actions
    btn_study_all: "📖 សិក្សាទាំងអស់",
    btn_quiz: "📝 ប្រឡងតេស្ត",
    btn_review_missed: "🎯 រំលឹកសំណួរខុស",
    btn_clear_missed: "🗑️ លុបសំណួរខុស",
    missed_badge: "⚠️ {count} សំណួរខុសដែលបានរក្សាទុក",
    loading_text: "កំពុងទាញយកសំណួរ...",

    // Leave Guard Modal
    btn_cancel: "បោះបង់",
    btn_leave: "ចាកចេញ",
    leave_modal_title: "⚠️ តើអ្នកពិតជាចង់ចាកចេញឬ?",
    leave_modal_desc: "ការវិវឌ្ឍនៃការធ្វើតេស្តរបស់អ្នកនឹងត្រូវបាត់បង់។",

    // Contact / Feedback Page
    contact_title: "ផ្តល់មតិត្រឡប់ / រាយការណ៍កំហុស",
    contact_notice: "តើអ្នកប្រទះឃើញសំណួរ ឬចម្លើយមិនត្រឹមត្រូវមែនទេ? សូមផ្ញើការរាយការណ៍មកកាន់យើង!",
    contact_desc_label: "ការបរិយាយ:",
    contact_placeholder: "សូមរៀបរាប់អំពីបញ្ហានៃសំណួរ ឬចម្លើយ...",
    contact_upload_label: "បង្ហោះរូបភាពគំរូ/រូបភាពប្រក្រតី (ជម្រើស):",
    contact_submit_btn: "📤 ផ្ញើការរាយការណ៍",
    contact_reports_header: "ការរាយការណ៍ដែលបានផ្ញើ",
    contact_modal_title: "⚠️ បញ្ជាក់ការផ្ញើ",
    contact_modal_desc: "តើអ្នកពិតជាចង់ផ្ញើមែនទេ? អ្នកអាចផ្ញើការរាយការណ៍បានតែម្តងគត់ក្នុងរយៈពេល ៣០ នាទី។",
    cooldown_alert: "⏱️ រយៈពេលរង់ចាំ:\nសូមរង់ចាំ {mins} នាទីទៀតមុនពេលផ្ញើម្តងទៀត។",
    btn_send: "ផ្ញើ",
    status_pending: "⏳ កំពុងរង់ចាំការពិនិត្យ",
    status_checked: "✅ បានពិនិត្យ និងកែប្រែរួចរាល់",
    no_reports: "អ្នកមិនទាន់មានការរាយការណ៍នៅឡើយទេ។",

    // Vault / Account Page
    account_title: "គណនី និងឃ្លាំងសំណួររបស់ខ្ញុំ",
    account_sub: "គ្រប់គ្រងចំណង់ចំណូលចិត្ត សំណួរខុសដែលបានរក្សាទុក និងឃ្លាំងសិក្សាផ្ទាល់ខ្លួន។",
    account_pref_title: "⚙️ កម្រិតកំណត់ការប្រឡង",
    account_autoadv_title: "ប្តូរទៅសំណួរបន្ទាប់ដោយស្វ័យប្រវត្តិ",
    account_autoadv_desc: "ផ្លាស់ទីទៅសំណួរបន្ទាប់ដោយស្វ័យប្រវត្តិតែម្ដង បន្ទាប់ពីជ្រើសរើសចម្លើយរួច។",
    account_vault_title: "📦 ឃ្លាំងសំណួរខុស",
    account_empty_vault: "🎉 អស្ចារ្យណាស់! អ្នកគ្មានសំណួរដែលខុសនៅក្នុងឃ្លាំងទេ។",
    btn_select: "☑️ ជ្រើសរើស",
    btn_cancel_select: "❌ បោះបង់",
    btn_select_all: "ជ្រើសរើសទាំងអស់",
    btn_deselect_all: "បោះបង់ការជ្រើសរើសទាំងអស់",
    btn_delete_selected: "🗑️ លុបដែលបានជ្រើស ({count})",
    delete_modal_title: "⚠️ តើអ្នកពិតជាប្រាកដមែនទេ?",
    delete_modal_desc: "តើអ្នកពិតជាប្រាកដថានឹងលុបសំណួរខុសដែលបានជ្រើសចំនួន {count} មុខវិជ្ជាមែនទេ? ការធ្វើបែបនេះមិនអាចត្រឡប់ក្រោយបានទេ។",
    btn_confirm_delete: "បាទ/ចាស លុប",
    anki_modal_title: "📦 នាំចេញទៅ Anki (.txt)",
    anki_modal_desc: "តើអ្នកចង់រក្សាទុកសំណួរទាំងនេះយ៉ាងដូចម្តេច បន្ទាប់ពីទាញយករួច?",
    btn_anki_keep: "📥 នាំចេញ និងរក្សាទុកក្នុងឃ្លាំង",
    btn_anki_clear: "🗑️ នាំចេញ និងលុបចេញពីឃ្លាំង",
    card_prof_label: "👨‍🏫 សាស្ត្រាចារ្យ៖ {prof}",
    card_practice_missed: "🎯 អនុវត្តសំណួរខុស ({count})",
    card_export_anki: "📦 នាំចេញទៅ Anki (.txt)",

    // About Page
    about_title: "អំពី TestforUHS",
    about_sub: "កម្មវិធីសិក្សា និងវាយតម្លៃសមត្ថភាពដោយឥតគិតថ្លៃសម្រាប់និស្សិតវេជ្ជសាស្ត្រ។",
    about_mission_title: "🎯 បេសកកម្មរបស់យើង",
    about_mission_desc: "TestforUHS ត្រូវបានបង្កើតឡើងដើម្បីផ្តល់ជូននិស្សិតវេជ្ជសាស្ត្រនូវវិធីងាយស្រួលក្នុងការរំលឹកសំណួរ ធ្វើតេស្តសមត្ថភាព និងតាមដានសំណួរដែលខុស—ដោយឥតគិតថ្លៃ ១០០%។",
    about_funding_title: "🤝 របៀបដែល TestforUHS ដំណើរការដោយឥតគិតថ្លៃ",
    about_funding_desc: "ដើម្បីរក្សាកម្មវិធីនេះឱ្យនៅតែបើកចំហ និងឥតគិតថ្លៃសម្រាប់អ្នករាល់គ្នា ដោយមិនមានការបង់ប្រាក់ប្រចាំខែ ឬដាក់សម្ភារសិក្សានៅពីក្រោយ paywall យើងរ៉ាប់រងការចំណាយលើ Server, Domain និងការថែទាំតាមរយៈវិធីសាស្ត្រតម្លាភាពចំនួនពីរ៖",
    about_ad_title: "១. ពាណិជ្ជកម្មដែលមិនរំខានដល់ការសិក្សា (Google AdSense)",
    about_ad_loc: "<strong>ទីតាំងបង្ហាញពាណិជ្ជកម្ម៖</strong> មានតែនៅផ្នែកខាងក្រោមនៃទំព័រដើម និងទំព័រសរុបលទ្ធផលប៉ុណ្ណោះ។",
    about_ad_zero: "<strong>គ្មានការរំខាន៖</strong> យើងមិនដែលដាក់ពាណិជ្ជកម្មនៅក្នុងផ្ទាំងប្រឡង ឬផ្ទាំងសិក្សាឡើយ ដើម្បីឱ្យអារម្មណ៍របស់អ្នកផ្តោតលើការសិក្សា ១០០%។",
    about_ad_filter: "<strong>ការចោះត្រងខ្លឹមសារយ៉ាងតឹងរ៉ឹង៖</strong> ពាណិជ្ជកម្មទាំងអស់ត្រូវប្រយ័ត្នប្រយែងបំផុត។ យើងបិទពាណិជ្ជកម្មអាសអាភាស ល្បែងស៊ីសង ព័ត៌មានបោកប្រាស់ និងអាហារបំប៉នភូតភរ។",
    about_donate_title: "២. ការចូលរួមគាំទ្រពីសហគមន៍ (ការឧបត្ថម្ភតាម KHQR)",
    about_donate_desc: "ប្រសិនបើ TestforUHS មានប្រយោជន៍ដល់ការសិក្សារបស់អ្នក អ្នកអាចស្ម័គ្រចិត្តចូលរួមឧបត្ថម្ភការអភិវឌ្ឍតាមរយៈប៊ូតុង ឧបត្ថម្ភ (KHQR)។ ថវិកាភាគច្រើនត្រូវប្រើប្រាស់លើថ្លៃ Domain និង Server។ ការឧបត្ថម្ភគឺអាស្រ័យលើទឹកចិត្ត ហើយមិនទទួលបានឯកសិទ្ធិពិសេសឡើយ—និស្សិតគ្រប់រូបទទួលបានការប្រើប្រាស់មុខងារទាំងអស់ស្មើៗគ្នា។",
    about_privacy_title: "🔒 ការប្តេជ្ញាចិត្តលើឯកជនភាព",
    about_privacy_desc: "ការវិវឌ្ឍនៃការសិក្សា សំណួរដែលខុស និងពិន្ទុតេស្តរបស់អ្នកត្រូវបានរក្សាទុកនៅក្នុងកម្មវិធីជ្រាវជ្រោល (browser) របស់អ្នកផ្ទាល់ (localStorage)។ យើងមិនតាមដានទិន្នន័យផ្ទាល់ខ្លួន ឬលក់ទិន្នន័យនិស្សិតទៅកាន់ភាគីទីបីឡើយ។",

    // Morale Boost Messages
    morale_1: "💪 You​ នឹងធ្វើបាន! ខ្ញុំជឿចឹង",
    morale_2: "🏃 កុំអស់សង្ឃឹមអី យើងនៅសល់ពេលទៀត។",
    morale_3: "🌟 ខុសប៉ុណ្ណឹងមានអី យើងនៅសាកម្តងទៀតបាន",
    morale_4: "🌱 នេះមិនមែនជាការប្រឡងពិតទេ កុំភ័យអី",
    morale_5: "🛡️ កុំពិបាកចិត្តអី ខ្ញុំនឹងនៅរង់ចាំពេល you ធ្វើបានសម្រេចល្អ",
    morale_6: "🩺 សម្រាកមួយភ្លែតសិន។ ចាំសាកម្តងទៀតពេលក្រាយ 💞",

    // quiz
    mode_study: "សិក្សា",
    mode_quiz: "ប្រឡង",
    mode_missed: "សំណួរខុស",
    quiz_progress: "សំណួរទី {current} នៃ {total}",
    study_progress: "សំណួរសរុប៖ {total} (បានឆ្លើយ៖ {answered})",
    btn_next_question: "សំណួរបន្ទាប់ ➡️",
    btn_finish_quiz: "បញ្ចប់ការប្រឡង 🏁",
    btn_fullscreen: "⛶ ពេញអេក្រង់",
    btn_exit_fullscreen: "ចាកចេញពីពេញអេក្រង់",
    time_up_alert: "⏱️ អស់ពេលហើយ! ប្រព័ន្ធកំពុងបញ្ជូនចម្លើយរបស់អ្នក។",
    no_missed_alert: "មិនមានសំណួរខុសដែលបានរក្សាទុកសម្រាប់សាស្ត្រាចារ្យនេះទេ!",
    load_error_alert: "មិនអាចទាញយកសំណួរបានទេ!\nសូមពិនិត្យមើលថាឯកសារមាននៅ៖\n\"{path}\"",
    leave_modal_desc_study: "តើអ្នកពិតជាចង់ចាកចេញឬ? កុំបារម្ភ ការវិវឌ្ឍរបស់អ្នកត្រូវបានរក្សាទុក!",
    leave_modal_desc_quiz: "ការវិវឌ្ឍនៃការធ្វើតេស្តប្រឡងរបស់អ្នកនឹងត្រូវបាត់បង់។",

    // result
    review_perfect_score: "🎉 ពិន្ទុពេញ! អ្នកបានឆ្លើយត្រូវគ្រប់សំណួរទាំងអស់!",
    review_unanswered: "⚠️ មិនបានឆ្លើយ / បានរំលង",
    label_your_choice: "ចម្លើយរបស់អ្នក",
    label_correct_choice: "ចម្លើយត្រឹមត្រូវ",
    account_review_style_title: "ទម្រង់ពិនិត្យលទ្ធផលឡើងវិញ",
    account_review_style_desc: "ជ្រើសរើសរវាងទម្រង់សង្ខេប (អត្ថបទ) ឬទម្រង់បង្ហាញជម្រើសទាំងអស់ (ដូច Study Mode)។",
    option_style_compact: "ទម្រង់សង្ខេប (អត្ថបទ)",
    option_style_full: "ទម្រង់បង្ហាញជម្រើសទាំងអស់",
    option_style_compact: "ទម្រង់សង្ខេប",
    option_style_full: "ទម្រង់ពេញ",

    // continue studying
    btn_continue_study: "▶️ បន្ត ({answered}/{total})",
    btn_restart_study: "🔄 ចាប់ផ្តើមសិក្សាឡើងវិញ",

    // coming soon
    coming_soon_title: "នឹងមកដល់ឆាប់ៗនេះ!",
    coming_soon_sub: "ទំព័រនេះមិនទាន់មានអ្វីទេ។ សុំទោស​🙏",
    
  }
};

const currentLang = localStorage.getItem('app_language') || 'en';

// Dynamic string translation helper with parameter substitution (e.g. {year}, {major})
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
    if (translations[currentLang] && translations[currentLang][key]) {
      el.innerHTML = translations[currentLang][key]; // Uses innerHTML for formatting tags like <strong>
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
}

// Reload page cleanly on language toggle
function changeLanguage(lang) {
  localStorage.setItem('app_language', lang);
  location.reload();
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
  applyStaticTranslations();

  const langSelect = document.getElementById('language-select');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => changeLanguage(e.target.value));
  }

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

// --- Theme Manager ---
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

// --- Vault Storage Helpers ---
function getStorageKey(major, year, semester, subject, professor) {
  if (!major || !year || !semester || !subject || !professor) return '';
  const profSlug = getProfSlug(professor);
  return `missed_${major.toLowerCase()}_y${year}_s${semester}_${subject.toLowerCase()}_${profSlug}`;
}

function recordQuestionResult(questionObj, isCorrect, major, year, semester, subject, professor) {
  if (!major || !year || !semester || !subject || !professor) return;
  const key = getStorageKey(major, year, semester, subject, professor);
  const raw = localStorage.getItem(key);
  let vault = raw ? JSON.parse(raw) : [];

  const existingIndex = vault.findIndex(item => item.question === questionObj.question);

  if (!isCorrect) {
    if (existingIndex >= 0) {
      vault[existingIndex].streak = 0;
    } else {
      vault.push({ ...questionObj, streak: 0 });
    }
  } else {
    if (existingIndex >= 0) {
      vault[existingIndex].streak = (vault[existingIndex].streak || 0) + 1;
      if (vault[existingIndex].streak >= 2) {
        vault.splice(existingIndex, 1);
      }
    }
  }

  if (vault.length > 0) {
    localStorage.setItem(key, JSON.stringify(vault));
  } else {
    localStorage.removeItem(key);
  }
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

  const closeDonate = () => donateModal && donateModal.classList.add('hidden');

  if (navDonateBtn && donateModal) {
    navDonateBtn.addEventListener('click', () => donateModal.classList.remove('hidden'));
  }
  if (closeDonateBtn) closeDonateBtn.addEventListener('click', closeDonate);
  if (bottomCloseDonateBtn) bottomCloseDonateBtn.addEventListener('click', closeDonate);
  if (donateModal) {
    donateModal.addEventListener('click', (e) => {
      if (e.target === donateModal) closeDonate();
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



function getProfSlug(profName) {
  if (!profName) return '';
  return profName
    .toLowerCase()
    .replace(/\./g, '')           // Strip dots ("Pr." -> "pr")
    .replace(/\s+/g, '-')         // Convert spaces to dashes
    .replace(/[^a-z0-9-&]/g, ''); // Retain valid characters
}

// ==========================================================================
// PREVENT DEVTOOLS & INSPECT SHORTCUTS
// ==========================================================================

// 1. Disable Right-Click Context Menu
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// 2. Disable DevTools Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  // Block F12
  if (e.key === 'F12') {
    e.preventDefault();
    return false;
  }

  // Block Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element Selector)
  if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) {
    e.preventDefault();
    return false;
  }

  // Block Ctrl+U (View Source) and Ctrl+S (Save Page)
  if (e.ctrlKey && ['U', 'S', 'u', 's'].includes(e.key)) {
    e.preventDefault();
    return false;
  }
});

// ==========================================================================
// ANTI-DEBUGGING LOOP
// ==========================================================================
(function startAntiDebug() {
  setInterval(() => {
    // Dynamically invokes 'debugger' to avoid static code scanning
    (function () {}).constructor("debugger")();
  }, 100);
})();
