/**
 * ==============================================================================
 * AUTOMATON ENTERPRISE SOAR - INTERACTIVE DEMO MODE
 * DESCRIPTION: This is a static mockup for GitHub Pages. All Backend APIs (FastAPI),
 * AI (OpenAI), and Databases (SQLite) have been replaced with simulated Mock Data 
 * to protect Intellectual Property while showcasing the UI/UX capabilities.
 * ==============================================================================
 */

function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>'"]/g, function(match) {
        const escape = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
        return escape[match];
    });
}

// --- MOCK DATA ---
const mockAlertsDb = [
    {
        id: 1042, timestamp: new Date().toLocaleString(), status: "Pending", category: "Network", title: "Data Exfiltration to Known Malicious IP", severity: "Critical", source_ip: "10.0.5.99", owner: "", escalated_by: "", comments: "",
        raw_data: JSON.stringify({ index: "firewall-traffic", dest_ip: "185.20.44.12", bytes_sent: 4509122, mitre_tactic: "Exfiltration" })
    },
    {
        id: 1043, timestamp: new Date(Date.now() - 3600000).toLocaleString(), status: "Investigating", category: "Endpoint", title: "Ransomware Behavior: Mass File Modification", severity: "Critical", source_ip: "10.0.2.55", owner: "demo_user", escalated_by: "L1_Analyst", comments: "Started triage. Looks like a rapid encryption sequence.",
        raw_data: JSON.stringify({ process: "vssadmin.exe", files_encrypted: 2045, mitre_tactic: "Impact", switch_ip: "192.168.1.5", switch_port: "Gi1/0/4" })
    },
    {
        id: 1044, timestamp: new Date(Date.now() - 7200000).toLocaleString(), status: "Resolved", category: "Identity", title: "Impossible Travel Activity (Geo-IP Anomaly)", severity: "Medium", source_ip: "88.140.2.1", owner: "demo_user", escalated_by: "", comments: "[AUTOMATON SOAR] - Executed Identity Containment. Account locked.\n\n--- AI AUDIT DRAFT ---\nUser 'jsmith' exhibited impossible travel. Account disabled proactively via LDAP.",
        raw_data: JSON.stringify({ user: "jsmith", location_1: "Athens, GR", location_2: "Moscow, RU", mitre_tactic: "Initial Access" })
    }
];

const mockUsersDb = [
    { username: "demo_user", full_name: "Demo Analyst", role: "Incident_Commander" },
    { username: "alex_l2", full_name: "Alex (L2)", role: "L2_Analyst" }
];

let globalAlerts = [...mockAlertsDb];
let globalUsers = [...mockUsersDb]; 
let charts = {}; 
let openAccordions = new Set();
let openHistoryAccordions = new Set();
let openTeamAccordions = new Set(); 
let currentActionAlertId = null;
let pendingSoarAction = null; 

// --- MOCKED WEBSOCKET ---
function initWebSocket() {
    console.log("Mock WebSocket Initialized.");
    // Simulate a new alert coming in after 30 seconds to wow the interviewer
    setTimeout(() => {
        if(localStorage.getItem("automaton_token")) {
            showToast("🚨 SIEM Alert", "New lateral movement detected on DMZ!");
            globalAlerts.unshift({
                id: 1045, timestamp: new Date().toLocaleString(), status: "Pending", category: "Endpoint", title: "Pass-the-Hash Attempt", severity: "High", source_ip: "10.0.4.15", owner: "", escalated_by: "", comments: "",
                raw_data: JSON.stringify({ dest_ip: "10.0.4.22", user: "admin_svc", mitre_tactic: "Credential Access" })
            });
            updateDashboard(); renderCharts();
        }
    }, 30000);
}

function showToast(title, message) {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = 'glass-ui bg-slate-900/90 dark:bg-black/80 backdrop-blur-md p-4 rounded-lg shadow-2xl border-l-4 border-indigo-500 transform transition-all duration-300 translate-x-full w-80 pointer-events-auto';
    toast.innerHTML = `<div class="flex justify-between items-start"><h4 class="text-sm font-bold text-slate-100">${escapeHTML(title)}</h4><button onclick="this.parentElement.parentElement.remove()" class="text-slate-400 hover:text-white">×</button></div><p class="text-xs text-slate-300 mt-1">${escapeHTML(message)}</p>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-x-full'), 10);
    setTimeout(() => { toast.classList.add('translate-x-full'); setTimeout(() => toast.remove(), 300); }, 5000);
}

function checkAuthState() {
    const token = localStorage.getItem("automaton_token");
    const role = localStorage.getItem("automaton_role");
    const fullName = localStorage.getItem("automaton_fullname");
    const authButtons = document.getElementById("auth-buttons");
    const userProfile = document.getElementById("user-profile");
    const adminNav = document.getElementById("nav-admin");

    if (token) {
        if(authButtons) { authButtons.classList.add("hidden"); authButtons.classList.remove("flex"); }
        if(userProfile) {
            userProfile.classList.remove("hidden"); userProfile.classList.add("flex");
            document.getElementById("profile-name").innerText = escapeHTML(fullName);
            document.getElementById("profile-role").innerText = escapeHTML(role).replace("_", " ");
            document.getElementById("profile-avatar").innerText = escapeHTML(fullName).charAt(0).toUpperCase();
        }
        if(adminNav) {
            if (role === 'Incident_Commander' || role === 'SOC_Manager') adminNav.style.display = "flex";
            else { adminNav.style.display = "none"; if (window.location.hash === "#/admin") window.location.hash = "#/dashboard"; }
        }
        updateDashboard(); updateInvestigations(); updateHistory(); renderCharts();
    } else {
        if(authButtons) { authButtons.classList.remove("hidden"); authButtons.classList.add("flex"); }
        if(userProfile) { userProfile.classList.add("hidden"); userProfile.classList.remove("flex"); }
        if(adminNav) adminNav.style.display = "none";
        updateDashboard(); updateInvestigations(); updateHistory();
    }
}

// --- MOCKED LOGIN ---
function openLoginModal() {
    document.getElementById("login-modal-overlay").classList.remove("hidden");
    document.getElementById("login-modal").classList.remove("hidden");
    document.getElementById("login-modal").style.display = "flex";
    document.getElementById("login-username").value = "demo";
    document.getElementById("login-password").value = "demo";
    document.getElementById("login-error").classList.add("hidden");
}

function closeLoginModal() {
    document.getElementById("login-modal-overlay").classList.add("hidden");
    document.getElementById("login-modal").classList.add("hidden");
    document.getElementById("login-modal").style.display = "none";
}

function attemptLogin() {
    const errorBox = document.getElementById("login-error");
    // Simulate network delay
    setTimeout(() => {
        localStorage.setItem("automaton_token", "mock_jwt_token_12345");
        localStorage.setItem("automaton_user", "demo_user");
        localStorage.setItem("automaton_role", "Incident_Commander");
        localStorage.setItem("automaton_fullname", "Demo Interviewer");
        closeLoginModal();
        checkAuthState(); 
        showToast("Access Granted", "Welcome to Automaton Interactive Demo.");
    }, 800);
}

function openRegisterModal() { showToast("Demo Notice", "Registration is disabled in the static interactive demo."); }
function closeRegisterModal() { document.getElementById("register-modal-overlay").classList.add("hidden"); document.getElementById("register-modal").style.display = "none"; }
function attemptRegister() {}

function logout() {
    localStorage.removeItem("automaton_token"); localStorage.removeItem("automaton_user");
    localStorage.removeItem("automaton_role"); localStorage.removeItem("automaton_fullname");
    checkAuthState();
}

// --- SPA ROUTING & UI SETUP (No changes needed here) ---
document.addEventListener("DOMContentLoaded", () => {
    initWebSocket();
    const pwdInput = document.getElementById("login-password");
    if(pwdInput) pwdInput.addEventListener('keypress', function(e) { if(e.key === 'Enter') attemptLogin(); });

    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const sunIcon = document.getElementById("theme-toggle-sun-icon");
    const moonIcon = document.getElementById("theme-toggle-moon-icon");
    const directionalFlare = document.querySelector(".directional-flare");

    const applyTheme = (theme) => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark"); document.documentElement.classList.remove("light");
            document.body.classList.add("dark-theme"); document.body.classList.remove("light-theme");
            sunIcon.classList.remove("hidden"); moonIcon.classList.add("hidden");
        } else {
            document.documentElement.classList.remove("dark"); document.documentElement.classList.add("light");
            document.body.classList.remove("dark-theme"); document.body.classList.add("light-theme");
            sunIcon.classList.add("hidden"); moonIcon.classList.remove("hidden");
        }
        renderCharts(); 
    };

    themeToggleBtn.addEventListener("click", () => {
        const newTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
        localStorage.setItem("theme", newTheme); applyTheme(newTheme);
    });

    let flareTicking = false;
    window.addEventListener("mousemove", (e) => {
        if (!flareTicking) {
            window.requestAnimationFrame(() => {
                directionalFlare.style.opacity = "1";
                directionalFlare.style.transform = `translate(${e.clientX - directionalFlare.offsetWidth / 2}px, ${e.clientY - directionalFlare.offsetHeight / 2}px)`;
                flareTicking = false;
            });
            flareTicking = true;
        }
    });

    const settingsBtn = document.getElementById("settings-btn");
    const settingsMenu = document.getElementById("settings-menu");
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");
    const toggleMenuBtn = document.getElementById("toggle-menu-btn");
    const overlay = document.getElementById("overlay");
    const sidebarNav = document.getElementById("sidebar-nav");

    settingsBtn.addEventListener("click", (e) => { e.stopPropagation(); settingsMenu.classList.toggle("hidden"); });
    document.addEventListener("click", (e) => { if (!settingsMenu.contains(e.target) && !settingsBtn.contains(e.target)) settingsMenu.classList.add("hidden"); });

    const openSidebar = () => { sidebar.classList.remove("-translate-x-full"); mainContent.classList.add("lg:ml-64"); if (window.innerWidth < 1024) overlay.classList.remove("hidden"); };
    const closeSidebar = () => { sidebar.classList.add("-translate-x-full"); mainContent.classList.remove("lg:ml-64"); overlay.classList.add("hidden"); };
    toggleMenuBtn.addEventListener("click", () => { sidebar.classList.contains("-translate-x-full") ? openSidebar() : closeSidebar(); });
    overlay.addEventListener("click", closeSidebar);
    if (window.innerWidth >= 1024) { openSidebar(); } else { closeSidebar(); }

    const pageContainer = document.getElementById("page-container");
    const pages = pageContainer.querySelectorAll(".page-content");
    const navLinks = sidebarNav.querySelectorAll(".nav-link");

    const navigate = () => {
        const path = window.location.hash || "#/dashboard";
        pages.forEach((page) => page.classList.add("hidden")); 
        const targetPageId = "page-" + path.substring(2);
        const targetPage = document.getElementById(targetPageId);
        if (targetPage) { targetPage.classList.remove("hidden"); if (targetPageId === 'page-admin') renderAdminPanel(); } 
        else { document.getElementById("page-dashboard").classList.remove("hidden"); }

        navLinks.forEach((link) => {
            if (link.getAttribute("href") === path) { link.classList.add("bg-indigo-500/20", "text-indigo-400", "font-semibold"); link.querySelector("svg").classList.add("text-indigo-400"); } 
            else { link.classList.remove("bg-indigo-500/20", "text-indigo-400", "font-semibold"); link.querySelector("svg").classList.remove("text-indigo-400"); }
        });
        if (window.innerWidth < 1024) closeSidebar();
    };
    window.addEventListener("hashchange", navigate);

    const chatInput = document.getElementById('ai-input');
    if (chatInput) chatInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') sendMessage(); });

    const initialTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(initialTheme);
    navigate();
    checkAuthState();
});

// --- MOCKED ADMIN PANEL ---
function renderAdminPanel() {
    const pList = document.getElementById("admin-pending-list");
    const aList = document.getElementById("admin-active-list");
    if(!pList || !aList) return;

    pList.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-slate-500 italic">No pending approvals.</td></tr>`;
    
    aList.innerHTML = globalUsers.map(user => {
        const isMe = user.username === localStorage.getItem("automaton_user");
        return `
        <tr class="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <td class="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">${escapeHTML(user.full_name)} ${isMe ? '<span class="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-400">YOU</span>' : ''}</td>
            <td class="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">${escapeHTML(user.username)}</td>
            <td class="px-6 py-4"><span class="bg-slate-100 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded p-1 text-xs text-slate-800 dark:text-slate-200">${escapeHTML(user.role).replace("_", " ")}</span></td>
            <td class="px-6 py-4 text-right flex justify-end gap-2"><button onclick="showToast('Demo', 'Admin actions disabled in Demo Mode.')" class="px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-white/10 rounded transition-all">Demo Action</button></td>
        </tr>`
    }).join('');
}

// --- RENDERING LOGIC (DASHBOARD & INVESTIGATIONS) ---
function getSeverityStyle(severity, isBackground = false) {
    const s = severity.toLowerCase();
    if (isBackground) {
        if(s === 'critical') return 'bg-red-100 text-red-700 dark:bg-sev-critical dark:text-red-400';
        if(s === 'high') return 'bg-orange-100 text-orange-700 dark:bg-sev-high dark:text-orange-400';
        if(s === 'medium') return 'bg-blue-100 text-blue-700 dark:bg-sev-medium dark:text-blue-400';
        return 'bg-green-100 text-green-700 dark:bg-sev-low dark:text-green-400';
    }
    if(s === 'critical') return 'text-red-600 dark:text-red-400';
    if(s === 'high') return 'text-orange-600 dark:text-orange-400';
    if(s === 'medium') return 'text-blue-600 dark:text-blue-400';
    return 'text-green-600 dark:text-green-400';
}

function updateDashboard() {
    const queue = document.getElementById('dashboard-pending-log');
    if(!queue) return;
    if(!localStorage.getItem("automaton_token")) { queue.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500 italic">Please sign in to view telemetry.</td></tr>`; return; }
    
    const pendingAlerts = globalAlerts.filter(a => a.status === 'Pending');
    if (pendingAlerts.length === 0) { queue.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500 italic">No pending alerts. System is secure.</td></tr>`; return; }

    queue.innerHTML = pendingAlerts.map(alert => `
        <tr class="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <td class="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">${escapeHTML(alert.timestamp)}</td>
            <td class="px-6 py-4"><span class="px-3 py-1 rounded-md text-xs border border-transparent dark:border-white/10 ${getSeverityStyle(alert.severity, true)}">${escapeHTML(alert.severity)}</span></td>
            <td class="px-6 py-4 font-mono text-sm text-indigo-600 dark:text-indigo-300">${escapeHTML(alert.source_ip)}</td>
            <td class="px-6 py-4 text-slate-800 dark:text-slate-200"><span class="font-bold text-slate-500">[${escapeHTML(alert.category)}]</span> ${escapeHTML(alert.title)}</td>
            <td class="px-6 py-4 text-right"><button onclick="startInvestigation(${alert.id})" class="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-md transition-all">Investigate</button></td>
        </tr>
    `).join('');
}

function startInvestigation(alertId) {
    const currentUser = localStorage.getItem("automaton_user");
    const alertData = globalAlerts.find(a => a.id === alertId);
    if(alertData) { alertData.status = 'Investigating'; alertData.owner = currentUser; }
    openAccordions.add(alertId); updateDashboard(); updateInvestigations(); window.location.hash = "#/investigation"; 
}

function returnToPending(event, alertId) {
    event.stopPropagation(); openAccordions.delete(alertId); 
    const alertData = globalAlerts.find(a => a.id === alertId);
    if(alertData) { alertData.status = 'Pending'; alertData.owner = ""; }
    updateDashboard(); updateInvestigations();
}

function updateInvestigations() {
    const container = document.getElementById('investigation-accordion-container');
    const userRole = localStorage.getItem("automaton_role");
    const currentUser = localStorage.getItem("automaton_user");
    
    const allActiveCases = globalAlerts.filter(a => a.status === 'Investigating');
    renderTeamWorkload(allActiveCases);

    if(!container) return;
    if(!currentUser) { container.innerHTML = `<div class="p-8 text-center text-slate-500 italic">Please sign in to view active investigations.</div>`; return; }

    const myActiveCases = allActiveCases.filter(a => a.owner === currentUser);
    if (myActiveCases.length === 0) { container.innerHTML = `<div class="p-8 text-center text-slate-500 italic">You have no active investigations.</div>`; return; }

    let htmlString = "";
    
    myActiveCases.forEach(alert => {
        let rawDataObj = JSON.parse(alert.raw_data || "{}");
        let detailsGridHtml = `<div class="details-grid"><div class="detail-item"><span class="detail-label text-slate-500 dark:text-slate-400">Source IP</span><span class="detail-value text-red-600 dark:text-red-400 font-bold">${escapeHTML(alert.source_ip)}</span></div>`;
        for (const [key, value] of Object.entries(rawDataObj)) { detailsGridHtml += `<div class="detail-item"><span class="detail-label text-slate-500 dark:text-slate-400">${escapeHTML(key.replace(/_/g, ' '))}</span><span class="detail-value text-slate-800 dark:text-slate-300">${escapeHTML(value)}</span></div>`; }
        detailsGridHtml += `</div>`;

        const aiAnalysisHtml = `
            <div class="mt-6 p-5 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg">
                <h4 class="text-indigo-700 dark:text-indigo-400 font-bold mb-3 flex items-center gap-2">🤖 Automaton AI Analysis</h4>
                <div id="ai-content-${alert.id}" class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <button onclick="triggerAiAnalysis(${alert.id})" class="px-4 py-2 bg-white dark:bg-indigo-600/20 border border-indigo-300 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-600 dark:hover:text-white rounded transition-colors">Generate Threat Analysis & Playbook</button>
                </div>
            </div>
        `;

        let soarHtml = `<div class="mt-6 pt-5 border-t border-slate-200 dark:border-white/10"><h4 class="text-slate-800 dark:text-slate-200 font-bold mb-3">⚡ SOAR Playbooks (Demo Mode)</h4><div class="flex gap-3">`;
        if (alert.category === 'Network') { soarHtml += `<button onclick="initiateSOAR('block_ip', '${escapeHTML(alert.source_ip)}', ${alert.id})" class="px-4 py-2 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/50 hover:bg-red-500 hover:text-white rounded text-sm font-bold shadow-sm">🔒 Block IP (pfSense)</button>`; } 
        else if (alert.category === 'Endpoint') { soarHtml += `<button onclick="initiateSOAR('shutdown_port', null, ${alert.id}, null, '10.0.0.1', 'Gi1/0')" class="px-4 py-2 bg-pink-100 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 border border-pink-300 dark:border-pink-500/50 hover:bg-pink-500 hover:text-white rounded text-sm font-bold shadow-sm">🔌 Isolate Host (Ansible)</button>`; }
        soarHtml += `</div></div>`;

        const isOpen = openAccordions.has(alert.id) ? "open" : ""; 
        const caretRotate = isOpen ? "rotate-180" : "";

        htmlString += `
            <div class="border-b border-slate-200 dark:border-white/10 last:border-0">
                <div class="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors" onclick="toggleAccordion(${alert.id})">
                    <div class="flex items-center gap-4">
                        <span class="font-mono font-bold text-slate-600 dark:text-slate-500">#${alert.id}</span>
                        <span class="px-2 py-1 rounded text-[10px] uppercase font-bold border border-transparent dark:border-white/10 ${getSeverityStyle(alert.severity, true)}">${escapeHTML(alert.severity)}</span>
                        <span class="font-medium text-slate-800 dark:text-slate-200 flex items-center">[${escapeHTML(alert.category)}] ${escapeHTML(alert.title)}</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <button onclick="openDispositionModal(event, ${alert.id})" class="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-500 hover:text-white flex items-center justify-center shadow-md">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                        <button onclick="returnToPending(event, ${alert.id})" class="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-600 px-2 py-1 rounded">↩ Return</button>
                        <svg id="caret-${alert.id}" class="w-5 h-5 text-slate-500 transform transition-transform ${caretRotate}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
                <div id="acc-content-${alert.id}" class="accordion-content ${isOpen} bg-slate-50 dark:bg-black/10 px-6 pt-2">
                    <h4 class="text-xs font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider mb-3">SIEM Telemetry Data</h4>
                    ${detailsGridHtml} ${aiAnalysisHtml} ${soarHtml}
                </div>
            </div>`;
    });
    container.innerHTML = htmlString;
}

function renderTeamWorkload(activeCasesArray) { /* Simplified for demo */ }
function toggleAccordion(alertId) {
    const content = document.getElementById(`acc-content-${alertId}`); const caret = document.getElementById(`caret-${alertId}`);
    if (!content) return;
    if (!content.classList.contains('open')) { content.classList.add('open'); caret.classList.add('rotate-180'); openAccordions.add(alertId); } 
    else { content.classList.remove('open'); caret.classList.remove('rotate-180'); openAccordions.delete(alertId); }
}

// --- MOCKED MODALS & DISPOSITION ---
function openDispositionModal(event, alertId) {
    event.stopPropagation(); currentActionAlertId = alertId;
    document.getElementById('disposition-modal-overlay').classList.remove('hidden');
    document.getElementById('disposition-modal').classList.remove('hidden');
    document.getElementById('disposition-modal').style.display = 'flex'; 
    const alertData = globalAlerts.find(a => a.id === alertId);
    document.getElementById('modal-comments').value = alertData.comments ? alertData.comments : ""; 
}
function closeModal() {
    document.getElementById('disposition-modal').classList.add('hidden');
    document.getElementById('disposition-modal').style.display = 'none';
    document.getElementById('disposition-modal-overlay').classList.add('hidden');
    currentActionAlertId = null;
}
function submitDisposition() {
    const comments = document.getElementById('modal-comments').value;
    const alertData = globalAlerts.find(a => a.id === currentActionAlertId);
    if(alertData) { alertData.status = "Resolved"; alertData.comments = comments; }
    openAccordions.delete(currentActionAlertId); closeModal(); updateDashboard(); updateInvestigations(); updateHistory(); renderCharts();
}
function generateAIAuditNote() {
    const textarea = document.getElementById('modal-comments');
    textarea.value = `⚡ Connecting to Automaton AI Engine...\nGenerating context-aware audit draft...`;
    setTimeout(() => {
        textarea.value = `--- AUTOMATON AI DRAFT AUDIT LOG ---\nThreat contained successfully via automated SOAR playbook. External IPs isolated and internal accounts rotated. Monitoring established for further anomalies.`;
    }, 1500);
}

// --- MOCKED AI & CHATOPS ---
function triggerAiAnalysis(alertId) {
    const aiContainer = document.getElementById(`ai-content-${alertId}`);
    aiContainer.innerHTML = `<p class="text-indigo-600 dark:text-indigo-400 italic font-bold animate-pulse">⚡ Connecting to OpenAI Engine (Mocked)...</p>`;
    setTimeout(() => {
        aiContainer.innerHTML = `
            <p class="mb-2"><strong class="text-slate-800 dark:text-slate-200">Threat Overview:</strong> (MOCK AI) The telemetry indicates a high probability of credential dumping or lateral movement.</p>
            <div class="flex gap-2 mb-4">
                <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30 rounded text-xs font-mono font-bold">Credential Access (TA0006)</span>
            </div>
            <ul class="list-disc list-inside space-y-1 ml-4 text-slate-700 dark:text-slate-400">
                <li><strong class="text-slate-800 dark:text-slate-300">Containment:</strong> Isolate host immediately via Ansible switch shutdown.</li>
                <li><strong class="text-slate-800 dark:text-slate-300">Investigation:</strong> Check proxy logs for C2 beaconing.</li>
            </ul>
        `;
    }, 2000);
}

function initiateSOAR(action, targetIp, alertId, targetUser = null, switchIp = null, switchPort = null) {
    const history = document.getElementById('chat-history');
    pendingSoarAction = { action: action, alert_id: alertId };
    history.innerHTML += `<div class="mb-4 pl-3 border-l-2 border-orange-500"><span class="text-orange-600 dark:text-orange-400 font-bold">Automaton SOAR:</span> <div class="text-slate-800 dark:text-slate-300 mt-1 whitespace-pre-wrap">🤖 [SOAR ChatOps] Action Preparation:\nI am about to execute a simulated SOAR block. Do you confirm? Reply "Yes" or "No".</div></div>`;
    history.scrollTop = history.scrollHeight; document.getElementById('ai-input').focus();
}

function sendMessage() {
    const input = document.getElementById('ai-input'); const history = document.getElementById('chat-history');
    const msg = input.value.trim(); if (!msg) return; 
    history.innerHTML += `<div class="mb-3"><span class="text-indigo-600 dark:text-indigo-400 font-bold">You:</span> <span class="text-slate-800 dark:text-slate-300">${escapeHTML(msg)}</span></div>`;
    input.value = ''; history.scrollTop = history.scrollHeight;
    
    if (pendingSoarAction !== null) {
        if (msg.toLowerCase() === "yes" || msg.toLowerCase() === "y") {
            history.innerHTML += `<div class="mb-3 pl-3 border-l-2 border-indigo-500"><span class="text-indigo-600 dark:text-indigo-400 font-bold">Automaton SOAR:</span> <span class="text-slate-600 dark:text-slate-500 italic">Executing simulated command...</span></div>`;
            setTimeout(() => {
                history.innerHTML += `<div class="mb-4 pl-3 border-l-2 border-green-500"><span class="text-green-600 dark:text-green-400 font-bold">✅ SOAR Execution Success:</span> <div class="text-slate-800 dark:text-slate-300 mt-1">Action completed successfully in demo mode!</div></div>`;
                const targetAlert = globalAlerts.find(a => a.id === pendingSoarAction.alert_id);
                if (targetAlert) targetAlert.comments = (targetAlert.comments ? targetAlert.comments + "\n" : "") + "[AUTOMATON SOAR] - Simulated action executed successfully.";
                pendingSoarAction = null; history.scrollTop = history.scrollHeight;
            }, 1500);
        } else {
            history.innerHTML += `<div class="mb-4 pl-3 border-l-2 border-slate-500"><span class="text-slate-600 dark:text-slate-400 font-bold">Automaton SOAR:</span> <div class="text-slate-800 dark:text-slate-300 mt-1">Action cancelled.</div></div>`;
            pendingSoarAction = null; history.scrollTop = history.scrollHeight;
        }
        return;
    }

    const typingId = 'typing-' + Date.now();
    history.innerHTML += `<div id="${typingId}" class="mb-3 pl-3 border-l-2 border-indigo-500"><span class="text-indigo-600 dark:text-indigo-400 font-bold">Automaton AI:</span> <span class="text-slate-600 dark:text-slate-500 italic">Analyzing telemetry...</span></div>`;
    history.scrollTop = history.scrollHeight;

    setTimeout(() => {
        document.getElementById(typingId).remove();
        history.innerHTML += `<div class="mb-4 pl-3 border-l-2 border-indigo-500"><span class="text-indigo-600 dark:text-indigo-400 font-bold">Automaton AI:</span> <div class="text-slate-800 dark:text-slate-300 mt-1">This is a simulated AI response for the interactive portfolio demo. In production, this integrates directly with OpenAI models for context-aware SOC responses.</div></div>`;
        history.scrollTop = history.scrollHeight;
    }, 1200);
}

// --- MOCKED HISTORY & CHARTS ---
function updateHistory() {
    const container = document.getElementById('history-accordion-container');
    if(!localStorage.getItem("automaton_token")) { container.innerHTML = `<div class="p-8 text-center text-slate-500 italic">Please sign in to view history.</div>`; return; }
    const historyCases = globalAlerts.filter(a => a.status === 'Resolved');
    if (historyCases.length === 0) { container.innerHTML = `<div class="p-8 text-center text-slate-500 italic">No historical records found.</div>`; return; }

    container.innerHTML = historyCases.map(alert => {
        const isOpen = openHistoryAccordions.has(alert.id) ? "open" : "";
        const caretRotate = isOpen ? "rotate-180" : "";
        return `
            <div class="border-b border-slate-200 dark:border-white/10 last:border-0">
                <div class="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors" onclick="toggleHistoryAccordion(${alert.id})">
                    <div class="flex items-center gap-4">
                        <span class="font-mono text-slate-600 dark:text-slate-500">#${alert.id}</span>
                        <span class="font-medium text-slate-800 dark:text-slate-300">[${escapeHTML(alert.category)}] ${escapeHTML(alert.title)}</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="px-3 py-1 rounded text-xs font-bold border border-transparent dark:border-current bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">Resolved</span>
                        <svg id="hist-caret-${alert.id}" class="w-5 h-5 text-slate-500 transform transition-transform ${caretRotate}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
                <div id="hist-content-${alert.id}" class="accordion-content ${isOpen} bg-slate-50 dark:bg-black/10 px-6 pt-2">
                    <pre class="bg-white dark:bg-black/30 p-4 rounded-lg text-slate-800 dark:text-slate-300 font-mono text-sm whitespace-pre-wrap border-l-4 border-green-400 dark:border-green-500/50 shadow-sm">${escapeHTML(alert.comments)}</pre>
                </div>
            </div>`;
    }).join('');
}

function toggleHistoryAccordion(alertId) {
    const content = document.getElementById(`hist-content-${alertId}`); const caret = document.getElementById(`hist-caret-${alertId}`);
    if (!content) return;
    if (!content.classList.contains('open')) { content.classList.add('open'); caret.classList.add('rotate-180'); openHistoryAccordions.add(alertId); } 
    else { content.classList.remove('open'); caret.classList.remove('rotate-180'); openHistoryAccordions.delete(alertId); }
}

function getChartOptions() {
    return { responsive: true, maintainAspectRatio: false, color: document.documentElement.classList.contains("dark") ? "#f8fafc" : "#1e293b", plugins: { legend: { display: false } } };
}

function renderCharts() {
    const sevCtx = document.getElementById('severity-chart');
    if (sevCtx) {
        const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 }; globalAlerts.forEach(a => { if(counts[a.severity] !== undefined) counts[a.severity]++; });
        if (charts['severity']) charts['severity'].destroy();
        charts['severity'] = new Chart(sevCtx, { type: 'doughnut', data: { labels: ['Critical', 'High', 'Medium', 'Low'], datasets: [{ data: [counts.Critical, counts.High, counts.Medium, counts.Low], backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e'] }] }, options: getChartOptions() });
    }
    const volCtx = document.getElementById('volume-chart');
    if (volCtx) {
        if (charts['volume']) charts['volume'].destroy();
        charts['volume'] = new Chart(volCtx, { type: 'line', data: { labels: ["-60m", "-50m", "-40m", "-30m", "-20m", "-10m", "Now"], datasets: [{ label: "Alerts", borderColor: "#6366f1", backgroundColor: "rgba(99, 102, 241, 0.1)", fill: true, tension: 0.4, data: [1, 3, 2, 5, 2, 4, globalAlerts.length] }] }, options: getChartOptions() });
    }
    const histCtx = document.getElementById('history-chart');
    if (histCtx) {
        if (charts['history']) charts['history'].destroy();
        charts['history'] = new Chart(histCtx, { type: 'bar', data: { labels: ["Shift 1", "Shift 2", "Current Shift"], datasets: [{ label: "Resolved", backgroundColor: "#22c55e", data: [4, 7, globalAlerts.filter(a => a.status === 'Resolved').length] }] }, options: getChartOptions() });
    }
}
function exportHistoryCSV() { showToast("Demo", "CSV Export disabled in demo mode."); }
function exportSinglePDF(event, alertId) { event.stopPropagation(); showToast("Demo", "PDF Export disabled in demo mode."); }