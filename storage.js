// ============================================================================
// STUDY DATA REPOSITORY
// ============================================================================

const OFFLINE_MODE_KEY = 'offline_mode_enabled';

function isOfflineModeEnabled() {
    return localStorage.getItem(OFFLINE_MODE_KEY) === 'true';
}

function setOfflineModeEnabled(enabled) {
    const isEnabled = Boolean(enabled);
    localStorage.setItem(OFFLINE_MODE_KEY, String(isEnabled));
    if (!isEnabled && typeof StudyRepository !== 'undefined') {
        StudyRepository.clearQuestionCache();
    }
    return isEnabled;
}

const StudyRepository = (() => {
    const MIGRATION_KEY = 'study_repository_version';
    const CURRENT_VERSION = 1;
    const questionCache = new Map();
    const questionRequests = new Map();

    function clearQuestionCache() {
        questionCache.clear();
    }

    function readJson(storage, key, fallback) {
        try {
            const raw = storage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            console.warn(`Ignoring invalid stored value for ${key}.`, error);
            return fallback;
        }
    }

    function writeJson(storage, key, value) {
        try {
            storage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn(`Could not persist ${key}.`, error);
            return false;
        }
    }

    function slug(value) {
        return String(value || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\./g, '')
            .replace(/[^a-z0-9&\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
    }

    function questionSignature(question) {
        if (!question) return '';
        const images = Array.isArray(question.images)
            ? question.images.join(',')
            : String(question.image || '').trim();
        const options = Array.isArray(question.options)
            ? [...question.options].sort().join('|')
            : '';
        return `${question.id || ''}_${String(question.question || '').trim()}_${images}_${options}`;
    }

    function vaultKey(major, year, semester, subject, professor) {
        if (!major || year === undefined || semester === undefined || !subject || !professor) return '';
        return `missed_${String(major).toLowerCase()}_y${year}_s${semester}_${String(subject).toLowerCase()}_${professorPathSegment(professor)}`;
    }

    function studyKey(config) {
        if (!config || !config.major || config.year === undefined || config.semester === undefined || !config.subject) {
            return '';
        }
        const target = config.isSubjectWide ? 'subject_all' : slug(config.professor);
        return `saved_study_${String(config.major).toLowerCase()}_y${config.year}_s${config.semester}_${String(config.subject).toLowerCase()}_${target}`;
    }

    function professorPathSegment(professor) {
        return String(professor || '')
            .toLowerCase()
            .replace(/\./g, '')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-&]/g, '');
    }

    function questionPath(config, professor) {
        return `data/${String(config.major).toLowerCase()}/year${config.year}/sem${config.semester}/${String(config.subject).toLowerCase()}/${professorPathSegment(professor)}.json`;
    }

    function normalizeQuestionList(payload) {
        const list = Array.isArray(payload) ? payload : payload && payload.questions;
        if (!Array.isArray(list)) return [];

        return list.filter(question => (
            question &&
            typeof question.question === 'string' &&
            Array.isArray(question.options) &&
            question.options.length > 1 &&
            Number.isInteger(question.correctIndex) &&
            question.correctIndex >= 0 &&
            question.correctIndex < question.options.length
        ));
    }

    async function loadQuestions(config, professor, options = {}) {
        const path = questionPath(config, professor);
        const cacheKey = options.cacheKey || path;
        const offlineEnabled = isOfflineModeEnabled();
        if (!offlineEnabled) questionCache.delete(cacheKey);
        if (!options.force && questionCache.has(cacheKey)) {
            return questionCache.get(cacheKey).map(question => ({ ...question }));
        }
        if (!options.force && questionRequests.has(cacheKey)) {
            const pending = await questionRequests.get(cacheKey);
            return pending.map(question => ({ ...question }));
        }

        if (offlineEnabled) {
            const offlineQuestions = await OfflineRepository.getQuestions(config, professor);
            if (offlineQuestions.length > 0) {
                questionCache.set(cacheKey, offlineQuestions);
                return offlineQuestions.map(question => ({ ...question }));
            }
        }

        const request = fetch(path)
            .then(response => {
                if (!response.ok) throw new Error(`Question file unavailable: ${path}`);
                return response.json();
            })
            .then(payload => {
                const questions = normalizeQuestionList(payload);
                questionCache.set(cacheKey, questions);
                return questions;
            })
            .finally(() => questionRequests.delete(cacheKey));

        questionRequests.set(cacheKey, request);
        const questions = await request;
        return questions.map(question => ({ ...question }));
    }

    function migrateLegacyData() {
        let version = 0;
        try {
            version = Number(localStorage.getItem(MIGRATION_KEY) || 0);
        } catch (error) {
            return;
        }
        if (version >= CURRENT_VERSION) return;

        // Validate and rewrite legacy JSON records without changing their public keys.
        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);
            if (!key || !/^(missed_|saved_study_)/.test(key)) continue;
            const value = readJson(localStorage, key, null);
            if (value !== null) writeJson(localStorage, key, value);
        }

        const analytics = readJson(localStorage, 'app_analytics_stats', null);
        if (analytics && typeof analytics === 'object') {
            writeJson(localStorage, 'app_analytics_stats', {
                total: Number(analytics.total) || 0,
                correct: Number(analytics.correct) || 0,
                profs: analytics.profs && typeof analytics.profs === 'object' ? analytics.profs : {}
            });
        }

        try {
            localStorage.setItem(MIGRATION_KEY, String(CURRENT_VERSION));
        } catch (error) {
            console.warn('Could not mark storage migration complete.', error);
        }
    }

    function getStudyProgress(config) {
        const key = studyKey(config);
        return key ? readJson(localStorage, key, null) : null;
    }

    function saveStudyProgress(config, progress) {
        const key = studyKey(config);
        return key ? writeJson(localStorage, key, progress) : false;
    }

    function clearStudyProgress(config) {
        const key = studyKey(config);
        if (key) localStorage.removeItem(key);
    }

    migrateLegacyData();

    return {
        clearStudyProgress,
        clearQuestionCache,
        getStudyProgress,
        loadQuestions,
        questionPath,
        questionSignature,
        readJson,
        saveStudyProgress,
        slug,
        studyKey,
        vaultKey,
        writeJson
    };
})();

const OfflineRepository = (() => {
    const DB_NAME = 'testforuhs-offline-db';
    const STORE_NAME = 'question-packages';
    const DB_VERSION = 1;

    function normalizeQuestionList(payload) {
        const list = Array.isArray(payload) ? payload : payload && payload.questions;
        if (!Array.isArray(list)) return [];

        return list.filter(question => (
            question &&
            typeof question.question === 'string' &&
            Array.isArray(question.options) &&
            question.options.length > 1 &&
            Number.isInteger(question.correctIndex) &&
            question.correctIndex >= 0 &&
            question.correctIndex < question.options.length
        ));
    }

    function professorPathSegment(professor) {
        return String(professor || '')
            .toLowerCase()
            .replace(/\./g, '')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-&]/g, '');
    }

    function makePackageId(config, professor) {
        if (!config || !config.major || config.year === undefined || config.semester === undefined || !config.subject || !professor) {
            return '';
        }
        return `${String(config.major).toLowerCase()}_y${config.year}_s${config.semester}_${String(config.subject).toLowerCase()}_${professorPathSegment(professor)}`;
    }

    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                reject(new Error('IndexedDB is not supported in this browser.'));
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('major_year_semester_subject', ['major', 'year', 'semester', 'subject'], { unique: false });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error('Could not open offline database.'));
        });
    }

    async function getAllPackages() {
        if (!('indexedDB' in window)) return [];
        try {
            const db = await openDatabase();
            return await new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error || new Error('Could not read offline packages.'));
            });
        } catch (error) {
            console.warn('Offline package lookup failed:', error);
            return [];
        }
    }

    async function getPackage(config, professor) {
        const packageId = makePackageId(config, professor);
        if (!packageId) return null;

        try {
            const db = await openDatabase();
            return await new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(packageId);
                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => reject(request.error || new Error('Could not fetch offline package.'));
            });
        } catch (error) {
            console.warn('Offline package fetch failed:', error);
            return null;
        }
    }

    async function getQuestions(config, professor) {
        const pkg = await getPackage(config, professor);
        return pkg && Array.isArray(pkg.questions) ? pkg.questions : [];
    }

    async function downloadPackage(config, professor, questions) {
        const packageId = makePackageId(config, professor);
        if (!packageId) return null;

        const validQuestions = normalizeQuestionList(questions);
        if (!validQuestions.length) return null;

        const packageRecord = {
            id: packageId,
            major: String(config.major),
            year: Number(config.year),
            semester: Number(config.semester),
            subject: String(config.subject),
            professor: String(professor),
            questionCount: validQuestions.length,
            questions: validQuestions,
            downloadedAt: Date.now(),
            updatedAt: Date.now()
        };

        try {
            if (navigator.storage && navigator.storage.persist) {
                await navigator.storage.persist().catch(() => false);
            }
            const db = await openDatabase();
            await new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.put(packageRecord);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error || new Error('Could not save offline package.'));
            });
            return packageRecord;
        } catch (error) {
            console.warn('Offline package save failed:', error);
            return null;
        }
    }

    function getSupportStatus() {
        return {
            indexedDB: typeof window !== 'undefined' && 'indexedDB' in window,
            serviceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
            secureContext: typeof window !== 'undefined' && (window.isSecureContext || window.location.hostname === 'localhost')
        };
    }

    async function deletePackage(packageId) {
        if (!packageId) return false;
        try {
            const db = await openDatabase();
            await new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.delete(packageId);
                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error || new Error('Could not delete offline package.'));
            });
            return true;
        } catch (error) {
            console.warn('Offline package delete failed:', error);
            return false;
        }
    }

    async function clearAllPackages() {
        try {
            const db = await openDatabase();
            await new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.clear();
                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error || new Error('Could not clear offline packages.'));
            });
            return true;
        } catch (error) {
            console.warn('Offline package clear failed:', error);
            return false;
        }
    }

    return {
        clearAllPackages,
        deletePackage,
        downloadPackage,
        getAllPackages,
        getPackage,
        getQuestions,
        getSupportStatus,
        makePackageId,
        normalizeQuestionList
    };
})();

if (typeof window !== 'undefined') {
    window.OfflineRepository = OfflineRepository;
    window.downloadOfflinePackage = OfflineRepository.downloadPackage;
    window.getAllOfflinePackages = OfflineRepository.getAllPackages;
    window.deleteOfflinePackage = OfflineRepository.deletePackage;
    window.clearAllOfflinePackages = OfflineRepository.clearAllPackages;
}
