document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const authPageWrapper = document.getElementById('authPageWrapper');
    const mainPage = document.getElementById('mainPage');
    const authBtn = document.getElementById('authBtn');
    const authToggle = document.getElementById('authToggle');
    const authHeader = document.getElementById('authHeader');
    const emailField = document.getElementById('emailField'); // New: Email field container
    const logoutBtn = document.getElementById('logoutBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    const moodButtons = document.querySelectorAll('.mood-btn');
    const quoteText = document.getElementById('quoteText');
    const backToLoggerBtn = document.getElementById('backToLoggerBtn');
    const historyList = document.getElementById('historyList');
    const moodChartCanvas = document.getElementById('moodChart');
    const headerTitle = document.getElementById('headerTitle');
    const heatmapContainer = document.getElementById('heatmap');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const authError = document.getElementById('authError');
    const loggedInUserEl = document.getElementById('loggedInUser');
    const insightsPanel = document.getElementById('insightsPanel');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const scheduleBtn = document.getElementById('scheduleBtn');
    const scheduleStatus = document.getElementById('scheduleStatus');

    // Email Scheduler Inputs
    const scheduleEmailInput = document.getElementById('scheduleEmail');
    const scheduleFrequencyInput = document.getElementById('scheduleFrequency');
    const scheduleTimeInput = document.getElementById('scheduleTime');


    // Dashboard elements
    const greetingEl = document.getElementById('greeting'), currentDateEl = document.getElementById('currentDate'), recentMood = document.getElementById('recentMood'), totalLogs = document.getElementById('totalLogs'), streakCountEl = document.getElementById('streakCount'), weeklyMoodChartCanvas = document.getElementById('weeklyMoodChart'), throwbackCard = document.getElementById('throwbackCard'), throwbackText = document.getElementById('throwbackText'), wellnessTipEl = document.getElementById('wellnessTip');

    // Settings elements
    const themeSelector = document.getElementById('themeSelector'), accentColorSelector = document.getElementById('accentColorSelector'), defaultPageSelector = document.getElementById('defaultPageSelector'), exportDataBtn = document.getElementById('exportDataBtn'), clearDataBtn = document.getElementById('clearDataBtn'), confirmationModal = document.getElementById('confirmationModal'), cancelDeleteBtn = document.getElementById('cancelDeleteBtn'), confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    // --- STATE MANAGEMENT ---
    let authMode = 'login'; // 'login' or 'signup'
    let currentUser = null;
    let moodHistory = []; // Now loaded from mock API
    let userSettings = {}; // Now loaded from mock API
    let moodChart = null;
    let weeklyMoodChart = null;
    const moodEmoji = {happy: '😊', sad: '😢', motivated: '🚀', anxious: '😟', calm: '😌', thoughtful: '🤔', proud: '🥳', tired: '😴', default: '🤔'};
    const wellnessTips = ["Take 5 deep, slow breaths. Inhale calm, exhale stress.", "Stretch your arms above your head for 30 seconds.", "Drink a full glass of water right now.", "Think of one thing you're grateful for today.", "Step outside for a minute and notice the weather.", "Tidy up one small thing in your immediate space.", "Listen to one of your favorite songs from start to finish.", "Jot down one goal for tomorrow, no matter how small."];
    const quotes = { happy: ["The purpose of our lives is to be happy. - Dalai Lama", "The very least you can do in your life is figure out what you hope for. And the most you can do is live inside that hope. - Barbara Kingskingsolver", "Happiness is not something ready made. It comes from your own actions. - Dalai Lama"], sad: ["The way to get started is to quit talking and begin doing. - Walt Disney", "It is during our darkest moments that we must focus to see the light. - Aristotle", "Tears come from the heart and not from the brain. - Leonardo da Vinci"], motivated: ["The only way to do great work is to love what you do. - Steve Jobs", "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill", "Believe you can and you're halfway there. - Theodore Roosevelt"], anxious: ["You wouldn't worry so much about what others think of you if you realized how seldom they do. - Eleanor Roosevelt", "Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure. - Oprah Winfrey", "Worry is a misuse of imagination. - Dan Zadra"], calm: ["Within you, there is a stillness and a sanctuary to which you can retreat at any time and be yourself. - Hermann Hesse", "The quieter you become, the more you are able to hear. - Rumi", "Calmness is the cradle of power. - Josiah Gilbert Holland"], thoughtful: ["The unexamined life is not worth living. - Socrates", "The only true wisdom is in knowing you know nothing. - Socrates", "All that we see or seem is but a dream within a dream. - Edgar Allan Poe"], proud: ["If you can dream it, you can do it. - Walt Disney", "Be proud of your scars. They have a story to tell.", "The more you praise and celebrate your life, the more there is in life to celebrate. - Oprah Winfrey"], tired: ["Rest and be thankful. - William Wordsworth", "Almost everything will work again if you unplug it for a few minutes, including you. - Anne Lamott", "Sleep is the best meditation. - Dalai Lama"] };
    const moodColors = ['#22c55e', '#3b82f6', '#f97316', '#eab308', '#14b8a6', '#8b5cf6', '#ec4899', '#6b7280'];

    // --- NOTIFICATION FUNCTION ---
    const showToast = (message, type = 'info') => {
        toastMessage.textContent = message;
        toast.className = 'toast show';
        if (type === 'warning') toast.classList.add('warning');
        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.remove('warning');
        }, 3000);
    };

    // --- DATABASE & SETTINGS ---

    // Load user data (moods and settings) from mock API
    const loadUserData = async () => {
        if (!currentUser) return;
        const data = await mockAPI.loadAllUserData(currentUser);
        moodHistory = data.moodHistory;
        userSettings = data.userSettings;
        applySettings();
    };

    // Save settings to mock API (called when settings change)
    const saveSettings = async () => {
        if (!currentUser) return;
        await mockAPI.saveSettings(currentUser, userSettings);
    };

    const applySettings = () => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('light-mode', userSettings.theme === 'auto' ? !prefersDark : userSettings.theme === 'light');
        document.documentElement.style.setProperty('--accent-color', `var(--${userSettings.accentColor}-400, #818cf8)`);
        document.documentElement.style.setProperty('--accent-color-hover', `var(--${userSettings.accentColor}-600, #6366f1)`);
        updateActiveSettingButtons();
    };

    const updateActiveSettingButtons = () => {
        document.querySelectorAll('#themeSelector .setting-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.theme === userSettings.theme));
        document.querySelectorAll('#accentColorSelector .color-swatch').forEach(btn => btn.classList.toggle('active', btn.dataset.color === userSettings.accentColor));
        document.querySelectorAll('#defaultPageSelector .setting-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.page === userSettings.defaultPage));
    };


    // --- AUTHENTICATION FUNCTIONS ---
    const toggleAuthMode = () => {
        authMode = authMode === 'login' ? 'signup' : 'login';
        authError.textContent = '';
        usernameInput.value = '';
        passwordInput.value = '';
        emailInput.value = '';

        if (authMode === 'login') {
            authHeader.textContent = 'Log in to find your daily inspiration.';
            authBtn.textContent = 'Secure Login';
            authToggle.textContent = 'New user? Click here to Sign Up.';
            emailField.classList.add('hidden');
        } else {
            authHeader.textContent = 'Sign up to start your mood journey.';
            authBtn.textContent = 'Register Account';
            authToggle.textContent = 'Existing user? Click here to Log In.';
            emailField.classList.remove('hidden');
        }
    };

    const handleAuth = async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const email = emailInput.value.trim();
        authError.textContent = '';

        if (!username) {
            authError.textContent = "Username cannot be empty.";
            return;
        }
        if (!password) {
            authError.textContent = "Password is required.";
            return;
        }

        if (authMode === 'signup') {
            const response = await mockAPI.registerUser(username, password, email);
            if (response.success) {
                showToast("Registration successful! Logging in...", 'info');
                // Auto-login after successful registration
                currentUser = username;
                await finalizeLogin(username);
            } else {
                authError.textContent = response.message;
            }

        } else if (authMode === 'login') {
            const response = await mockAPI.loginUser(username, password);
            if (response.success) {
                showToast(`Welcome back, ${username}!`, 'info');
                currentUser = username;
                await finalizeLogin(username);
            } else {
                authError.textContent = response.message;
            }
        }
    };

    const finalizeLogin = async (username) => {
        loggedInUserEl.textContent = username;
        authPageWrapper.classList.add('hidden');
        mainPage.classList.remove('hidden');

        // Load data from mock API
        await loadUserData();
        showPage(userSettings.defaultPage);
    }

    // --- GENERAL FUNCTIONS ---
    const updateHeaderTitle = (pageId) => {
        const title = { dashboardPage: "Dashboard", moodLogger: "Log Mood", historyPage: "Mood History", analyzerPage: "Mood Analyzer", settingsPage: "Settings", quotePage: "Your Quote", schedulerPage: "Email Scheduler" }[pageId];
        headerTitle.textContent = title || "DailyQuoteAI";
    };

    const showPage = (pageId) => {
        pages.forEach(page => page.classList.toggle('hidden', page.id !== pageId));
        updateHeaderTitle(pageId);
        navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.page === pageId));
        
        // Data-dependent pages require data refresh
        if (pageId === 'analyzerPage') {
            renderMoodChart();
            renderHeatmap();
            renderInsights();
        }
        if (pageId === 'dashboardPage') renderDashboard();
        if (pageId === 'historyPage') displayHistory();
        if (pageId === 'schedulerPage') loadScheduleData();
    };

    const getQuoteForMood = (mood) => {
        const moodQuotes = quotes[mood] || ["Just keep swimming!"];
        return moodQuotes[Math.floor(Math.random() * moodQuotes.length)];
    };

    const logMoodHistory = async (mood, quote) => {
        const moodEntry = { mood, quote, date: new Date().toISOString() };
        moodHistory.unshift(moodEntry); // Update local array immediately for responsiveness
        await mockAPI.saveMood(currentUser, moodEntry); // Save to mock database
    };

    const displayHistory = () => {
        historyList.innerHTML = '';
        if (moodHistory.length === 0) { historyList.innerHTML = `<p class="text-center text-text-secondary">No moods logged yet.</p>`; return; }
        moodHistory.forEach(entry => {
            const div = document.createElement('div');
            div.className = 'p-4 bg-surface/80 rounded-lg glass-card';
            div.innerHTML = `<div class="flex items-start space-x-4"><span class="text-3xl">${moodEmoji[entry.mood]}</span><div><p class="font-semibold text-text-primary italic">"${entry.quote}"</p><p class="text-xs text-text-secondary mt-2">${new Date(entry.date).toLocaleString()}</p></div></div>`;
            historyList.appendChild(div);
        });
    };

    // --- DASHBOARD FUNCTIONS ---
    const getGreeting = () => { const h=new Date().getHours(); return h<12?"Good Morning!":h<18?"Good Afternoon!":"Good Evening!"; };
    const getCurrentDate = () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const calculateStreak = () => { if(moodHistory.length===0)return 0; let s=0; const t=new Date(); t.setHours(0,0,0,0); const d=new Set(moodHistory.map(e=>{const dt=new Date(e.date); dt.setHours(0,0,0,0); return dt.getTime();})); if(!d.has(t.getTime())){t.setDate(t.getDate()-1);} while(d.has(t.getTime())){s++; t.setDate(t.getDate()-1);} return s; };
    const findThrowbackMood = () => {
        const today = new Date();
        const throwback = moodHistory.find(e => { const d = new Date(e.date); return d.getMonth()===today.getMonth() && d.getDate()===today.getDate() && d.getFullYear()!==today.getFullYear(); });
        throwbackCard.classList.toggle('hidden', !throwback);
        if (throwback) throwbackText.textContent = `In ${new Date(throwback.date).getFullYear()}, you felt ${throwback.mood}.`;
    };
    const getDailyWellnessTip = () => { const n=new Date(),s=new Date(n.getFullYear(),0,0); return wellnessTips[Math.floor((n-s)/(1e3*60*60*24))%wellnessTips.length]; };

    const renderWeeklyChart = () => {
        const ctx = weeklyMoodChartCanvas.getContext('2d');
        if (weeklyMoodChart) weeklyMoodChart.destroy();
        const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weeklyHistory = moodHistory.filter(e => new Date(e.date) > sevenDaysAgo);
        const container = weeklyMoodChartCanvas.parentElement;
        if(weeklyHistory.length === 0){ 
            if(weeklyMoodChartCanvas) weeklyMoodChartCanvas.classList.add('hidden'); 
            container.innerHTML = `<div class="flex items-center justify-center h-full text-text-secondary">Log moods to see your weekly vibe.</div>`; 
            if(!container.contains(weeklyMoodChartCanvas)) container.appendChild(weeklyMoodChartCanvas); 
            return; 
        }
        weeklyMoodChartCanvas.classList.remove('hidden');
        const moodCounts = weeklyHistory.reduce((a,e)=>(a[e.mood]=(a[e.mood]||0)+1,a),{}); const labels = Object.keys(moodCounts);
        weeklyMoodChart = new Chart(ctx, { type: 'bar', data: { labels: labels.map(l=>moodEmoji[l]), datasets: [{ data: Object.values(moodCounts), backgroundColor: moodColors, borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c)=>`${labels[c.dataIndex]}: ${c.raw}` } } }, scales: { y: { beginAtZero: true, ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary'), stepSize: 1 }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }, x: { ticks: { font: { size: 20 }, color: getComputedStyle(document.body).getPropertyValue('--text-secondary') }, grid: { display: false } } } } });
    };

    const renderDashboard = () => {
        recentMood.textContent = moodHistory.length > 0 ? moodEmoji[moodHistory[0].mood] : moodEmoji['default'];
        totalLogs.textContent = moodHistory.length;
        greetingEl.textContent = getGreeting(); currentDateEl.textContent = getCurrentDate();
        streakCountEl.innerHTML = `${calculateStreak()} 🔥`; wellnessTipEl.textContent = getDailyWellnessTip();
        findThrowbackMood(); renderWeeklyChart();
    };

    // --- ANALYZER PAGE FUNCTIONS ---
    const renderMoodChart = () => {
        const ctx = moodChartCanvas.getContext('2d');
        if (moodChart) moodChart.destroy();
        const moodCounts = moodHistory.reduce((a,e)=>(a[e.mood]=(a[e.mood]||0)+1,a),{});
        if (Object.keys(moodCounts).length === 0) { const c=moodChartCanvas.parentElement; if(!c.contains(moodChartCanvas)) c.appendChild(moodChartCanvas); ctx.clearRect(0,0,moodChartCanvas.width,moodChartCanvas.height); ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--text-secondary'); ctx.textAlign='center'; ctx.fillText('Log moods to see analysis!',moodChartCanvas.width/2,moodChartCanvas.height/2); return; }
        moodChart = new Chart(ctx, { type: 'doughnut', data: { labels: Object.keys(moodCounts).map(l => l.charAt(0).toUpperCase()+l.slice(1)), datasets: [{ data: Object.values(moodCounts), backgroundColor: moodColors, borderColor: getComputedStyle(document.body).getPropertyValue('--bg-surface'), borderWidth: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: getComputedStyle(document.body).getPropertyValue('--text-primary'), font: {size: 14} } } } } });
    };

    const renderInsights = () => {
        insightsPanel.innerHTML = `<h3 class="text-lg font-semibold text-center mb-2 text-accent">Quick Insights</h3>`;
        if (moodHistory.length === 0) { insightsPanel.innerHTML += `<p class="text-center text-text-secondary">No data to analyze yet.</p>`; return; }
        const moodCounts = moodHistory.reduce((a,e)=>(a[e.mood]=(a[e.mood]||0)+1,a),{});
        const dominantMood = Object.keys(moodCounts).reduce((a,b) => moodCounts[a] > moodCounts[b] ? a : b);
        insightsPanel.innerHTML += `<p class="text-text-secondary text-center">Your dominant mood is <strong class="text-text-primary">${dominantMood}</strong>.</p>`;
    };

    const renderHeatmap = () => {
        heatmapContainer.innerHTML = '';
        const moodsByDate = new Map(moodHistory.map(e => [new Date(e.date).toLocaleDateString(), e.mood]));
        for (let i = 34; i >= 0; i--) { const d = new Date(); d.setDate(new Date().getDate() - i); const ds=d.toLocaleDateString(), c=document.createElement('div'); c.className='heatmap-cell'; const m=moodsByDate.get(ds); if(m){c.classList.add(`mood-${m}`);c.innerHTML=`<span class="tooltip">${m.charAt(0).toUpperCase()+m.slice(1)} on ${ds}</span>`;} heatmapContainer.appendChild(c); }
    };

    // --- DATA MANAGEMENT FUNCTIONS ---
    const exportDataToCSV = () => {
        if(moodHistory.length === 0) { showToast('No data to export.', 'warning'); return; }
        const headers = 'date,mood,quote\n', rows = moodHistory.map(e => `"${new Date(e.date).toISOString()}","${e.mood}","${e.quote.replace(/"/g, '""')}"`).join('\n'), csv = headers + rows, blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }), link = document.createElement('a');
        link.href = URL.createObjectURL(blob); link.download = `dailyquote_history_${new Date().toISOString().split('T')[0]}.csv`; link.click();
    };

    // --- EMAIL SCHEDULER FUNCTIONS (MOCK) ---
    const loadScheduleData = async () => {
        scheduleStatus.textContent = '';
        const response = await mockAPI.loadSchedule(currentUser);
        if (response.schedule) {
            scheduleEmailInput.value = response.schedule.email;
            scheduleFrequencyInput.value = response.schedule.frequency;
            scheduleTimeInput.value = response.schedule.time;
            scheduleStatus.textContent = `Current schedule: ${response.schedule.frequency} at ${response.schedule.time}.`;
            scheduleStatus.classList.remove('text-red-400', 'text-text-secondary');
            scheduleStatus.classList.add('text-emerald-400');
        } else {
            scheduleEmailInput.value = '';
            scheduleStatus.textContent = 'No email schedule is currently set.';
            scheduleStatus.classList.remove('text-red-400', 'text-emerald-400');
            scheduleStatus.classList.add('text-text-secondary');
        }
    };

    const handleScheduleEmail = async () => {
        const email = scheduleEmailInput.value.trim();
        const frequency = scheduleFrequencyInput.value;
        const time = scheduleTimeInput.value;

        if (!email || !email.includes('@')) {
            scheduleStatus.textContent = 'Please enter a valid email address.';
            scheduleStatus.classList.remove('text-text-secondary', 'text-emerald-400');
            scheduleStatus.classList.add('text-red-400');
            return;
        }

        const scheduleData = { email, frequency, time };
        const response = await mockAPI.saveSchedule(currentUser, scheduleData);

        if (response.success) {
            scheduleStatus.textContent = response.message + ` (F: ${frequency}, T: ${time})`;
            scheduleStatus.classList.remove('text-red-400', 'text-text-secondary');
            scheduleStatus.classList.add('text-emerald-400');
            showToast('Email schedule saved!', 'info');
        } else {
             scheduleStatus.textContent = 'Failed to save schedule. Please try again.';
             scheduleStatus.classList.remove('text-text-secondary', 'text-emerald-400');
             scheduleStatus.classList.add('text-red-400');
        }
    };

    // --- EVENT LISTENERS ---
    authBtn.addEventListener('click', handleAuth);
    authToggle.addEventListener('click', (e) => { e.preventDefault(); toggleAuthMode(); });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        mainPage.classList.add('hidden');
        authPageWrapper.classList.remove('hidden');
        usernameInput.value = 'demo';
        passwordInput.value = '';
        authError.textContent = '';
        toggleAuthMode(); // Ensure it reverts to login view
    });

    settingsBtn.addEventListener('click', () => showPage('settingsPage'));
    navButtons.forEach(btn => { if(btn.id !== 'logoutBtn') btn.addEventListener('click', () => showPage(btn.dataset.page))});
    
    moodButtons.forEach(btn => btn.addEventListener('click', async () => { 
        const m = btn.dataset.mood; 
        const q = getQuoteForMood(m); 
        quoteText.textContent = q; 
        await logMoodHistory(m,q); // Await the save
        showPage('quotePage'); 
    }));
    
    backToLoggerBtn.addEventListener('click', () => showPage('moodLogger'));

    // Listener for Email Scheduler
    scheduleBtn.addEventListener('click', handleScheduleEmail);

    // Settings Listeners
    themeSelector.addEventListener('click', async e => { if(e.target.dataset.theme){ userSettings.theme = e.target.dataset.theme; applySettings(); await saveSettings(); showToast('Theme updated!'); } });
    accentColorSelector.addEventListener('click', async e => { if(e.target.dataset.color){ userSettings.accentColor = e.target.dataset.color; applySettings(); await saveSettings(); showToast('Accent color updated!'); } });
    defaultPageSelector.addEventListener('click', async e => { if(e.target.dataset.page){ userSettings.defaultPage = e.target.dataset.page; updateActiveSettingButtons(); await saveSettings(); showToast('Default page saved!'); } });
    exportDataBtn.addEventListener('click', exportDataToCSV);
    clearDataBtn.addEventListener('click', () => confirmationModal.classList.remove('hidden'));
    cancelDeleteBtn.addEventListener('click', () => confirmationModal.classList.add('hidden'));
    
    confirmDeleteBtn.addEventListener('click', async () => {
        const response = await mockAPI.clearMoodHistory(currentUser);
        if (response.success) {
            moodHistory = []; // Clear local array
            confirmationModal.classList.add('hidden');
            showToast('All data has been cleared.', 'warning');
            showPage('dashboardPage'); // Go to dashboard to see cleared state
        }
    });

    // Initial setup: ensure the login view is active on load
    toggleAuthMode();
    authMode = 'login'; // Force initial state to login after first toggle
});