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
    const DB_NAME = 'testforuhs-progress-db';
    const DB_VERSION = 1;
    const VAULT_STORE = 'missed-questions';
    const STUDY_STORE = 'study-progress';
    const ANALYTICS_STORE = 'analytics';
    const MIGRATION_KEY = 'study_repository_version';
    const CURRENT_VERSION = 2;
    const questionCache = new Map();
    const questionRequests = new Map();
    let migrationPromise = null;

    function hasIndexedDB() {
        return typeof window !== 'undefined' && 'indexedDB' in window;
    }

    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (!hasIndexedDB()) {
                reject(new Error('IndexedDB is not supported in this browser.'));
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(VAULT_STORE)) db.createObjectStore(VAULT_STORE, { keyPath: 'id' });
                if (!db.objectStoreNames.contains(STUDY_STORE)) db.createObjectStore(STUDY_STORE, { keyPath: 'id' });
                if (!db.objectStoreNames.contains(ANALYTICS_STORE)) db.createObjectStore(ANALYTICS_STORE, { keyPath: 'id' });
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error('Could not open progress database.'));
        });
    }

    function runTransaction(storeName, mode, operation) {
        return openDatabase().then(db => new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, mode);
            const request = operation(transaction.objectStore(storeName));
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error(`Could not access ${storeName}.`));
        }));
    }

    function readLegacy(key, fallback) {
        return readJson(localStorage, key, fallback);
    }

    async function migrateLegacyData() {
        if (!hasIndexedDB()) return;
        if (migrationPromise) return migrationPromise;

        migrationPromise = (async () => {
            let version = 0;
            try { version = Number(localStorage.getItem(MIGRATION_KEY) || 0); } catch (error) { }
            if (version >= CURRENT_VERSION) return;

            const vaultRecords = [];
            const studyRecords = [];
            for (let index = 0; index < localStorage.length; index += 1) {
                const key = localStorage.key(index);
                if (!key) continue;
                if (key.startsWith('missed_')) {
                    const value = readLegacy(key, null);
                    if (Array.isArray(value) && value.length > 0) vaultRecords.push({ id: key, questions: value });
                } else if (key.startsWith('saved_study_')) {
                    const value = readLegacy(key, null);
                    if (value && typeof value === 'object') studyRecords.push({ id: key, ...value });
                }
            }

            const analytics = readLegacy('app_analytics_stats', null);
            await openDatabase().then(db => new Promise((resolve, reject) => {
                const transaction = db.transaction([VAULT_STORE, STUDY_STORE, ANALYTICS_STORE], 'readwrite');
                const vaultStore = transaction.objectStore(VAULT_STORE);
                const studyStore = transaction.objectStore(STUDY_STORE);
                const analyticsStore = transaction.objectStore(ANALYTICS_STORE);
                vaultRecords.forEach(record => vaultStore.put(record));
                studyRecords.forEach(record => studyStore.put(record));
                if (analytics && typeof analytics === 'object') {
                    analyticsStore.put({
                        id: 'app_analytics_stats',
                        total: Number(analytics.total) || 0,
                        correct: Number(analytics.correct) || 0,
                        profs: analytics.profs && typeof analytics.profs === 'object' ? analytics.profs : {}
                    });
                }
                transaction.oncomplete = resolve;
                transaction.onerror = () => reject(transaction.error || new Error('Could not migrate progress data.'));
            }));

            vaultRecords.forEach(record => localStorage.removeItem(record.id));
            studyRecords.forEach(record => localStorage.removeItem(record.id));
            if (analytics && typeof analytics === 'object') localStorage.removeItem('app_analytics_stats');
            localStorage.setItem(MIGRATION_KEY, String(CURRENT_VERSION));
        })().catch(error => {
            migrationPromise = null;
            console.warn('Progress storage migration failed; legacy data remains available.', error);
        });
        return migrationPromise;
    }

    async function getRecord(storeName, key, fallback = null) {
        if (!key) return fallback;
        if (!hasIndexedDB()) return readLegacy(key, fallback);
        await migrateLegacyData();
        try {
            const record = await runTransaction(storeName, 'readonly', store => store.get(key));
            if (!record) return fallback;
            if (storeName === VAULT_STORE) return record.questions || fallback;
            if (storeName === STUDY_STORE) {
                const { id, ...progress } = record;
                return progress;
            }
            return record;
        } catch (error) {
            console.warn(`Could not read ${key}.`, error);
            return readLegacy(key, fallback);
        }
    }

    async function putRecord(storeName, key, value) {
        if (!key) return false;
        if (!hasIndexedDB()) return writeJson(localStorage, key, value);
        await migrateLegacyData();
        try {
            const record = storeName === VAULT_STORE ? { id: key, questions: value } : { id: key, ...value };
            await runTransaction(storeName, 'readwrite', store => store.put(record));
            return true;
        } catch (error) {
            console.warn(`Could not persist ${key}.`, error);
            return writeJson(localStorage, key, value);
        }
    }

    async function deleteRecord(storeName, key) {
        if (!key) return false;
        if (!hasIndexedDB()) {
            localStorage.removeItem(key);
            return true;
        }
        await migrateLegacyData();
        try {
            await runTransaction(storeName, 'readwrite', store => store.delete(key));
            return true;
        } catch (error) {
            localStorage.removeItem(key);
            return false;
        }
    }

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

    async function getStudyProgress(config) {
        const key = studyKey(config);
        return getRecord(STUDY_STORE, key, null);
    }

    async function saveStudyProgress(config, progress) {
        const key = studyKey(config);
        return putRecord(STUDY_STORE, key, progress);
    }

    async function clearStudyProgress(config) {
        const key = studyKey(config);
        return deleteRecord(STUDY_STORE, key);
    }

    async function getMissedQuestions(key) {
        return getRecord(VAULT_STORE, key, []);
    }

    async function saveMissedQuestions(key, questions) {
        if (!questions || questions.length === 0) return deleteRecord(VAULT_STORE, key);
        return putRecord(VAULT_STORE, key, questions);
    }

    async function getAllMissedQuestions() {
        if (!hasIndexedDB()) {
            const records = [];
            for (let index = 0; index < localStorage.length; index += 1) {
                const key = localStorage.key(index);
                if (key && key.startsWith('missed_')) records.push({ id: key, questions: readLegacy(key, []) });
            }
            return records;
        }
        await migrateLegacyData();
        try { return await runTransaction(VAULT_STORE, 'readonly', store => store.getAll()); }
        catch (error) { return []; }
    }

    async function getAnalyticsData() {
        const data = await getRecord(ANALYTICS_STORE, 'app_analytics_stats', null);
        return data ? { total: Number(data.total) || 0, correct: Number(data.correct) || 0, profs: data.profs || {} } : { total: 0, correct: 0, profs: {} };
    }

    async function saveAnalyticsData(data) {
        return putRecord(ANALYTICS_STORE, 'app_analytics_stats', data);
    }

    return {
        clearStudyProgress,
        clearQuestionCache,
        getStudyProgress,
        getMissedQuestions,
        getAllMissedQuestions,
        getAnalyticsData,
        loadQuestions,
        questionPath,
        questionSignature,
        readJson,
        saveStudyProgress,
        saveMissedQuestions,
        saveAnalyticsData,
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
        if (!pkg || !Array.isArray(pkg.questions)) return [];

        return pkg.questions.map(question => ({
            ...question,
            offlineImages: pkg.images && typeof pkg.images === 'object' ? pkg.images : {}
        }));
    }

    function getQuestionImageNames(questions) {
        const imageNames = new Set();
        normalizeQuestionList(questions).forEach(question => {
            const images = Array.isArray(question.images) && question.images.length > 0
                ? question.images
                : (typeof question.image === 'string' ? [question.image] : []);
            images.forEach(imageName => {
                if (typeof imageName === 'string' && imageName.trim()) imageNames.add(imageName.trim());
            });
        });
        return [...imageNames];
    }

    async function fetchImageAsDataUrl(imageName) {
        try {
            const response = await fetch(`${IMAGE_BASE_URL}${encodeURIComponent(imageName)}`);
            if (!response.ok) return null;
            const blob = await response.blob();
            return await new Promise(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.warn(`Could not download offline image: ${imageName}`, error);
            return null;
        }
    }

    async function downloadPackage(config, professor, questions) {
        const packageId = makePackageId(config, professor);
        if (!packageId) return null;

        const validQuestions = normalizeQuestionList(questions);
        if (!validQuestions.length) return null;

        const imageEntries = await Promise.all(getQuestionImageNames(validQuestions).map(async imageName => {
            const dataUrl = await fetchImageAsDataUrl(imageName);
            return dataUrl ? [imageName, dataUrl] : null;
        }));
        const images = Object.fromEntries(imageEntries.filter(Boolean));

        const packageRecord = {
            id: packageId,
            major: String(config.major),
            year: Number(config.year),
            semester: Number(config.semester),
            subject: String(config.subject),
            professor: String(professor),
            questionCount: validQuestions.length,
            questions: validQuestions,
            images,
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
