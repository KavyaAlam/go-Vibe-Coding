// Simple login and tab logic
const loginForm = document.getElementById('login-form');
const loginContainer = document.getElementById('login-container');
const dashboard = document.getElementById('dashboard');
const loginError = document.getElementById('login-error');

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // Simple hardcoded check for demo
    if (username === 'dev' && password === 'password') {
        loginContainer.style.display = 'none';
        dashboard.style.display = 'block';
        // Set login state and timestamp in localStorage
        localStorage.setItem('wired_logged_in', 'true');
        localStorage.setItem('wired_last_activity', Date.now().toString());
    } else {
        loginError.textContent = 'Invalid credentials. Try dev/password.';
    }
});

// On any dashboard interaction, update last activity timestamp
function updateLastActivity() {
    if (dashboard.style.display === 'block') {
        localStorage.setItem('wired_last_activity', Date.now().toString());
    }
}
dashboard.addEventListener('click', updateLastActivity, true);
dashboard.addEventListener('input', updateLastActivity, true);

// Add a place to show search errors (assume an element with id 'search-error' exists in your HTML)

// Real-time unified search
const searchInput = document.getElementById('search');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim().toLowerCase();
        const searchError = document.getElementById('search-error');
        if (searchError) searchError.textContent = '';
        if (!query) {
            // Optionally reset highlights and errors
            tabContents.forEach(section => section.style.background = 'none');
            return;
        }
        // Try to match tab name first
        const tabNames = ['project info', 'code insights', 'documentation', 'learning', 'team'];
        const tabIds = ['project', 'code', 'docs', 'learning', 'team'];
        let foundTab = null;
        tabNames.forEach((name, idx) => {
            if (name.toLowerCase().includes(query) || tabIds[idx].includes(query)) foundTab = tabIds[idx];
        });
        if (foundTab) {
            switchToTab(foundTab);
            tabContents.forEach(section => section.style.background = 'none');
            return;
        }
        // Search all tables for a match
        let found = false;
        tabIds.forEach(tabId => {
            const table = document.getElementById(tabId + '-table');
            if (table && table.innerText.toLowerCase().includes(query)) {
                switchToTab(tabId);
                found = true;
            }
        });
        if (!found && !foundTab) {
            if (searchError) searchError.textContent = `No results found for '${e.target.value}'.`;
            // Optionally show popup
            // showPopup(`No results found for '${e.target.value}'.`);
        }
    });
}

// --- POPUP MODAL LOGIC ---
function showPopup(message) {
    let modal = document.getElementById('wired-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'wired-modal';
        modal.innerHTML = `
            <div id="wired-modal-bg" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.25);z-index:9998;"></div>
            <div id="wired-modal-content" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:2em 2.5em;border-radius:12px;box-shadow:0 8px 32px #0002;z-index:9999;min-width:260px;text-align:center;">
                <div style="font-size:1.1em;margin-bottom:1em;">${message}</div>
                <button id="wired-modal-close" style="background:#0078d4;color:#fff;border:none;padding:0.5em 1.5em;border-radius:6px;cursor:pointer;font-size:1em;">OK</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('wired-modal-close').onclick = () => modal.remove();
        document.getElementById('wired-modal-bg').onclick = () => modal.remove();
    }
}

// --- JIRA-LIKE PROJECT MODAL ---
function showProjectDashboard(project) {
    let modal = document.getElementById('wired-modal');
    if (modal) modal.remove();
    modal = document.createElement('div');
    modal.id = 'wired-modal';
    let sprintsHtml = project.sprints.map(s => `
        <div style="background:#f4f8fb;border-radius:8px;padding:0.7em 1em;margin-bottom:0.7em;box-shadow:0 2px 8px #0078d41a;">
            <b>${s.name}</b> <span style="color:#0078d4;font-weight:500;">[${s.status}]</span> <span style="color:#888;">Tasks: ${s.tasks}</span>
        </div>
    `).join('');
    modal.innerHTML = `
        <div id="wired-modal-bg" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.25);z-index:9998;"></div>
        <div id="wired-modal-content" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:2em 2.5em;border-radius:12px;box-shadow:0 8px 32px #0002;z-index:9999;min-width:320px;max-width:90vw;max-height:90vh;overflow:auto;">
            <div style="font-size:1.3em;font-weight:bold;margin-bottom:0.5em;color:#0078d4;">${project.name} Dashboard</div>
            <div style="margin-bottom:1em;color:#444;">${project.description}</div>
            <div style="font-weight:600;margin-bottom:0.5em;">Sprints</div>
            <div>${sprintsHtml}</div>
            <button id="wired-modal-close" style="background:#0078d4;color:#fff;border:none;padding:0.5em 1.5em;border-radius:6px;cursor:pointer;font-size:1em;margin-top:1em;">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('wired-modal-close').onclick = () => modal.remove();
    document.getElementById('wired-modal-bg').onclick = () => modal.remove();
}

// --- PROJECT TABLE CLICK HANDLER ---
function addProjectRowClickHandlers() {
    const table = document.getElementById('project-table');
    if (!table) return;
    Array.from(table.querySelectorAll('tr')).forEach((row, idx) => {
        if (idx === 0) return; // skip header
        row.style.cursor = 'pointer';
        row.onclick = function() {
            const project = projects[idx-1];
            if (project) showProjectDashboard(project);
        };
    });
}

// Unified search (demo only)
document.getElementById('search').addEventListener('input', function(e) {
    const q = e.target.value.toLowerCase();
    tabContents.forEach(section => {
        if (q && section.textContent.toLowerCase().includes(q)) {
            section.style.background = '#fffbe6';
        } else {
            section.style.background = 'none';
        }
    });
});

// Fun quotes for randomization
const funQuotes = [
    "“Code is like humor. When you have to explain it, it’s bad.” – Cory House",
    "“First, solve the problem. Then, write the code.” – John Johnson",
    "“Experience is the name everyone gives to their mistakes.” – Oscar Wilde",
    "“Simplicity is the soul of efficiency.” – Austin Freeman",
    "“Before software can be reusable it first has to be usable.” – Ralph Johnson",
    "“Make it work, make it right, make it fast.” – Kent Beck",
    "“The best error message is the one that never shows up.” – Thomas Fuchs",
    "“Talk is cheap. Show me the code.” – Linus Torvalds"
];

// User avatars for randomization
const avatars = [
    "https://randomuser.me/api/portraits/men/32.jpg",
    "https://randomuser.me/api/portraits/women/44.jpg",
    "https://randomuser.me/api/portraits/men/65.jpg",
    "https://randomuser.me/api/portraits/women/68.jpg",
    "https://randomuser.me/api/portraits/men/12.jpg"
];

// Project data with sprints
const projects = [
    {
        name: "Wall-E",
        description: "AI-powered home assistant robot.",
        sprints: [
            { name: "Sprint 1", status: "Complete", tasks: 10 },
            { name: "Sprint 2", status: "In Progress", tasks: 8 },
            { name: "Sprint 3", status: "Planned", tasks: 6 }
        ]
    },
    {
        name: "Project Adams",
        description: "Voice-controlled smart workspace.",
        sprints: [
            { name: "Sprint 1", status: "Complete", tasks: 12 },
            { name: "Sprint 2", status: "In Progress", tasks: 9 }
        ]
    },
    {
        name: "Smart HouseBot",
        description: "IoT automation for modern homes.",
        sprints: [
            { name: "Sprint 1", status: "Complete", tasks: 7 },
            { name: "Sprint 2", status: "Planned", tasks: 10 }
        ]
    }
];

// Sample data for each section (duplicated for demo)
const sampleData = {
    project: [
        { name: 'Sprint 1', status: 'Complete', tasks: 12 },
        { name: 'Sprint 2', status: 'In Progress', tasks: 10 },
        { name: 'Sprint 3', status: 'Planned', tasks: 8 }
    ],
    code: [
        { metric: 'Commits', value: 120 },
        { metric: 'Reviews', value: 30 },
        { metric: 'Bugs', value: 5 }
    ],
    docs: [
        { doc: 'API Guide', views: 150 },
        { doc: 'Setup', views: 100 },
        { doc: 'FAQ', views: 80 }
    ],
    learning: [
        { type: 'Certifications', details: 'AWS Certified, Azure Fundamentals, Scrum Master' },
        { type: 'Project Goals', details: 'Launch MVP, 100% test coverage, CI/CD automation' },
        { type: 'New Tech', details: 'AI Copilots, Edge Functions, WebAssembly' },
        { type: 'Workshops', details: 'DevOps Best Practices, UI/UX Trends 2025' },
        { type: 'Webinars', details: 'Security in Cloud, Modern JS Frameworks' }
    ],
    team: [
        { member: 'Alice', role: 'Lead', progress: 90 },
        { member: 'Bob', role: 'Dev', progress: 70 },
        { member: 'Carol', role: 'QA', progress: 60 }
    ]
};

// Render table for each section
typeTable = {
    project: (data) => `<table><tr><th>Project</th><th>Description</th><th>Sprints</th></tr>${projects.map(proj => `<tr><td>${proj.name}</td><td>${proj.description}</td><td>${proj.sprints.length}</td></tr>`).join('')}</table>`,
    code: (data) => `<table><tr><th>Metric</th><th>Value</th></tr>${data.map(d => `<tr><td>${d.metric}</td><td>${d.value}</td></tr>`).join('')}</table>`,
    docs: (data) => `<table><tr><th>Document</th><th>Views</th></tr>${data.map(d => `<tr><td>${d.doc}</td><td>${d.views}</td></tr>`).join('')}</table>`,
    learning: (data) => `<table><tr><th>Type</th><th>Details</th></tr>${data.map(d => `<tr><td>${d.type}</td><td>${d.details}</td></tr>`).join('')}</table>`,
    team: (data) => `<table><tr><th>Member</th><th>Role</th><th>Progress (%)</th></tr>${data.map(d => `<tr><td>${d.member}</td><td>${d.role}</td><td>${d.progress}</td></tr>`).join('')}</table>`
};

const chartRenderers = {
    project: (ctx) => new Chart(ctx, {
        type: 'bar',
        data: {
            labels: projects.map(p => p.name),
            datasets: [{
                label: 'Sprints',
                data: projects.map(p => p.sprints.length),
                backgroundColor: '#0078d4'
            }]
        },
        options: { plugins: { legend: { display: false } } }
    }),
    code: (ctx) => new Chart(ctx, {
        type: 'pie',
        data: {
            labels: sampleData.code.map(d => d.metric),
            datasets: [{
                data: sampleData.code.map(d => d.value),
                backgroundColor: [
                    '#4F8EF7', // blue
                    '#38C6D9', // teal
                    '#7B61FF', // purple
                    '#5AD2F4', // light blue (extra, if needed)
                    '#3A8DFF'  // deep blue (extra, if needed)
                ]
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    position: 'top', // legend above chart
                    align: 'center',
                    labels: {
                        boxWidth: 18,
                        padding: 4, // minimal padding
                        font: { size: 14 },
                        color: '#444'
                    }
                }
            },
            layout: {
                padding: { left: 0, right: 0, top: 0, bottom: 0 }
            }
        }
    }), // <-- add comma here
    docs: (ctx) => new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sampleData.docs.map(d => d.doc),
            datasets: [{
                data: sampleData.docs.map(d => d.views),
                backgroundColor: ['#0078d4', '#00b4a1', '#ffb900']
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    position: 'top', // legend above chart
                    align: 'center',
                    labels: {
                        boxWidth: 18,
                        padding: 4, // minimal padding
                        font: { size: 14 },
                        color: '#444'
                    }
                }
            },
            layout: {
                padding: { left: 0, right: 0, top: 0, bottom: 0 }
            }
        }
    }),
    learning: (ctx) => new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sampleData.learning.map(d => d.type),
            datasets: [{
                label: 'Hours',
                data: sampleData.learning.map(d => d.hours),
                backgroundColor: '#00b4a1'
            }]
        },
        options: { plugins: { legend: { display: false } } }
    }),
    team: (ctx) => new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sampleData.team.map(d => d.member),
            datasets: [{
                label: 'Progress',
                data: sampleData.team.map(d => d.progress),
                backgroundColor: '#ffb900'
            }]
        },
        options: { plugins: { legend: { display: false } } }
    })
};

let charts = {};

// Call after rendering project table
function renderTables() {
    Object.keys(sampleData).forEach(section => {
        if (section === 'docs') {
            renderDocsTable();
        } else {
            document.getElementById(section + '-table').innerHTML = typeTable[section](sampleData[section]);
            document.getElementById(section + '-table').style.display = 'block';
        }
    });
    document.getElementById('project-table').innerHTML = typeTable.project();
    document.getElementById('project-table').style.display = 'block';
    addProjectRowClickHandlers();
}

// Make document upload functional for Documentation tab
let uploadedDocs = [
    ...sampleData.docs // start with initial docs
];

function renderDocsTable() {
    const table = document.getElementById('docs-table');
    table.innerHTML = `<table><tr><th>Document</th><th>Views</th><th>Action</th></tr>${uploadedDocs.map((d, i) => `<tr><td>${d.doc}</td><td>${d.views}</td><td><button class='delete-doc' data-idx='${i}' style='color:#fff;background:#d8000c;border:none;border-radius:4px;padding:0.3em 0.8em;cursor:pointer;'>Delete</button></td></tr>`).join('')}</table>`;
    // Add delete handlers
    table.querySelectorAll('.delete-doc').forEach(btn => {
        btn.onclick = function() {
            const idx = parseInt(btn.dataset.idx);
            uploadedDocs.splice(idx, 1);
            renderDocsTable();
        };
    });
}

const docUpload = document.getElementById('doc-upload');
if (docUpload) {
    docUpload.addEventListener('change', function(e) {
        const status = document.getElementById('doc-upload-status');
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            uploadedDocs.push({ doc: file.name, views: 0 });
            renderDocsTable();
            status.textContent = `Uploaded: ${file.name}`;
        } else {
            status.textContent = '';
        }
    });
}

// Only show chart toggle and chart for project tab
function resetTabViews() {
    Object.keys(sampleData).forEach(section => {
        if (section === 'project') {
            showTable(section);
            const btn = document.querySelector(`.toggle-view[data-section="${section}"]`);
            if (btn) btn.style.display = 'inline-block';
            if (btn) btn.textContent = 'Switch to Chart';
            // Show chart toggle and chart for project only
            document.getElementById(section + '-chart').style.display = 'none';
        } else {
            // Hide chart and toggle for all other tabs
            document.getElementById(section + '-table').style.display = 'block';
            const btn = document.querySelector(`.toggle-view[data-section="${section}"]`);
            if (btn) btn.style.display = 'none';
            document.getElementById(section + '-chart').style.display = 'none';
        }
    });
}

// Tab switching
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        tabContents.forEach(content => {
            content.style.display = content.id === tab.dataset.tab ? 'block' : 'none';
        });
        renderTables();
        resetTabViews();
    });
});

function showTable(section) {
    document.getElementById(section + '-table').style.display = 'block';
    document.getElementById(section + '-chart').style.display = 'none';
    if (charts[section]) { charts[section].destroy(); charts[section] = null; }
}

function showChart(section) {
    document.getElementById(section + '-table').style.display = 'none';
    const canvas = document.getElementById(section + '-chart');
    canvas.style.display = 'block';
    if (charts[section]) charts[section].destroy();
    charts[section] = chartRenderers[section](canvas.getContext('2d'));
}

// Update toggle view logic to only work for project tab
document.querySelectorAll('.toggle-view').forEach(btn => {
    btn.addEventListener('click', function() {
        const section = btn.dataset.section;
        if (section !== 'project') return;
        if (document.getElementById(section + '-table').style.display !== 'none') {
            showChart(section);
            btn.textContent = 'Table';
        } else {
            showTable(section);
            btn.textContent = 'Switch to Chart';
        }
    });
});

// Switch to a tab by its id
function switchToTab(tabId) {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabId) tab.classList.add('active');
    });
    tabContents.forEach(content => {
        content.style.display = content.id === tabId ? 'block' : 'none';
    });
    renderTables();
    resetTabViews();
}

// On page load, check login state and last activity
window.addEventListener('DOMContentLoaded', () => {
    // Login persistence logic
    const loggedIn = localStorage.getItem('wired_logged_in') === 'true';
    const lastActivity = parseInt(localStorage.getItem('wired_last_activity') || '0', 10);
    const now = Date.now();
    const threeHours = 3 * 60 * 60 * 1000;
    if (loggedIn && (now - lastActivity) < threeHours) {
        loginContainer.style.display = 'none';
        dashboard.style.display = 'block';
        // Update activity timestamp
        localStorage.setItem('wired_last_activity', now.toString());
    } else {
        loginContainer.style.display = 'block';
        dashboard.style.display = 'none';
        localStorage.removeItem('wired_logged_in');
        localStorage.removeItem('wired_last_activity');
    }
    renderTables();
    resetTabViews();
    randomizeAvatarAndQuote();
    animateAvatar();
    // Style all chart containers for minimal gap and centering
    const chartSections = ['project', 'code', 'docs', 'learning', 'team'];
    chartSections.forEach(section => {
        const chartCanvas = document.getElementById(section + '-chart');
        if (chartCanvas && chartCanvas.parentElement) {
            chartCanvas.style.marginTop = '12px';
            chartCanvas.style.marginBottom = '0';
            // Stack legend and chart vertically and center for all tabs
            chartCanvas.parentElement.style.display = 'flex';
            chartCanvas.parentElement.style.flexDirection = 'column';
            chartCanvas.parentElement.style.alignItems = 'center';
            chartCanvas.parentElement.style.justifyContent = 'center';
            chartCanvas.style.maxWidth = '320px';
        }
    });
});

function randomizeAvatarAndQuote() {
    // Randomize avatar
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];
    const avatarElem = document.getElementById('user-avatar');
    if (avatarElem) avatarElem.src = avatar;
    // Always randomize quote on every refresh
    const quote = funQuotes[Math.floor(Math.random() * funQuotes.length)];
    const quoteElem = document.getElementById('quote'); // <-- fix id here
    if (quoteElem) quoteElem.textContent = quote;
}
