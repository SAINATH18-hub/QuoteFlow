/**
 * database.js
 * This file serves as a Mock Database Layer (or Mock API)
 * It simulates asynchronous calls to a backend to handle user accounts,
 * mood logs, settings, and email schedules.
 * All data is persisted in localStorage.
 */

const DB_KEY = 'dailyquote_mock_db';
const DEFAULT_SETTINGS = { theme: 'dark', accentColor: 'indigo', defaultPage: 'dashboardPage' };

// --- Private Functions for Local Storage Access ---

// Loads the entire mock database from localStorage
const loadDB = () => {
    const dbString = localStorage.getItem(DB_KEY);
    return dbString ? JSON.parse(dbString) : {
        users: { 'demo': { username: 'demo', password: 'password', email: 'demo@example.com' } }, // Pre-configured demo user
        moods: {}, // { 'username': [{mood: 'happy', date: '...'}] }
        settings: {}, // { 'username': { theme: 'dark', ... } }
        schedules: {} // { 'username': { email: '...', frequency: 'daily', time: '...' } }
    };
};

// Saves the entire mock database to localStorage
const saveDB = (db) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// --- Mock API Interface (Exported Functions) ---

const mockAPI = {

    /**
     * AUTHENTICATION
     */

    // Simulates a user registration request
    registerUser: async (username, password, email) => {
        return new Promise(resolve => {
            setTimeout(() => { // Simulate network delay
                const db = loadDB();
                if (db.users[username]) {
                    resolve({ success: false, message: 'Username already taken.' });
                    return;
                }
                db.users[username] = { username, password, email };
                db.settings[username] = DEFAULT_SETTINGS;
                saveDB(db);
                resolve({ success: true, message: 'Registration successful.' });
            }, 300);
        });
    },

    // Simulates a user login request
    loginUser: async (username, password) => {
        return new Promise(resolve => {
            setTimeout(() => { // Simulate network delay
                const db = loadDB();
                const user = db.users[username];

                if (!user) {
                    resolve({ success: false, message: 'User not found.' });
                    return;
                }
                if (user.password !== password) {
                    resolve({ success: false, message: 'Invalid password.' });
                    return;
                }
                resolve({ success: true, message: 'Login successful.', user });
            }, 300);
        });
    },

    /**
     * DATA LOADING
     */

    // Loads all data required after successful login
    loadAllUserData: async (username) => {
        return new Promise(resolve => {
            setTimeout(() => { // Simulate network delay
                const db = loadDB();
                const moodHistory = db.moods[username] || [];
                const userSettings = db.settings[username] || DEFAULT_SETTINGS;
                resolve({ moodHistory, userSettings });
            }, 50);
        });
    },

    /**
     * MOOD LOGS
     */

    // Saves a new mood log entry
    saveMood: async (username, moodEntry) => {
        return new Promise(resolve => {
            setTimeout(() => { // Simulate network delay
                const db = loadDB();
                db.moods[username] = db.moods[username] || [];
                db.moods[username].unshift(moodEntry);
                saveDB(db);
                resolve({ success: true });
            }, 50);
        });
    },

    // Deletes all mood history for a user
    clearMoodHistory: async (username) => {
         return new Promise(resolve => {
            setTimeout(() => { // Simulate network delay
                const db = loadDB();
                delete db.moods[username];
                saveDB(db);
                resolve({ success: true });
            }, 100);
        });
    },

    /**
     * SETTINGS
     */

    // Saves the user's current settings
    saveSettings: async (username, settings) => {
        return new Promise(resolve => {
            setTimeout(() => { // Simulate network delay
                const db = loadDB();
                db.settings[username] = settings;
                saveDB(db);
                resolve({ success: true });
            }, 50);
        });
    },

    /**
     * EMAIL SCHEDULER
     */

    // Loads the existing email schedule
    loadSchedule: async (username) => {
        return new Promise(resolve => {
            setTimeout(() => { // Simulate network delay
                const db = loadDB();
                const schedule = db.schedules[username] || null;
                resolve({ schedule });
            }, 50);
        });
    },

    // Saves a new email schedule
    saveSchedule: async (username, scheduleData) => {
        return new Promise(resolve => {
            setTimeout(() => { // Simulate network delay (Mocking a successful save to a real scheduler service)
                const db = loadDB();
                db.schedules[username] = scheduleData;
                saveDB(db);
                resolve({ success: true, message: 'Schedule saved successfully.' });
            }, 500);
        });
    },

};

// Expose the mock API globally
window.mockAPI = mockAPI;