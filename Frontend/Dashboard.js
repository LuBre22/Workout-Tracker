// Helper to get cookie value by name
async function fetchUserInfo() {
    try {
        const res = await fetch('/me');
        if (!res.ok) throw new Error();
        const data = await res.json();
        document.getElementById('username').textContent = data.username;
        if (data.roles && data.roles.includes("admin")) {
            document.getElementById('manage-users-btn').style.display = "block";
        }
    } catch {
        // Not logged in, redirect to login
        window.location.href = "/login";
    }
}

// Link Exercises button to Exercises.html
document.getElementById('exercises-btn').onclick = function() {
    window.location.href = "/static/Exercises.html";
};

// Link Start Session button to Session.html
document.getElementById('start-session-btn').onclick = function() {
    window.location.href = "/static/Session.html";
};

// Link View Sessions button to Archive.html
document.getElementById('view-sessions-btn').onclick = function() {
    window.location.href = "/static/Archive.html";
};

// Link Personal Records button to PersonalRecords.html
document.getElementById('personal-records-btn').onclick = function() {
    window.location.href = "/static/PersonalRecords.html";
};

// Link Manage Users button to Users.html (only visible for admin)
document.getElementById('manage-users-btn').onclick = function() {
    window.location.href = "/manage-users";
};

// Logout button: call backend to invalidate session token and redirect to login
document.getElementById('logout-btn').onclick = async function() {
    try {
        await fetch('/session', { method: 'DELETE' });
        await fetch('/logout', { method: 'POST' });
    } catch (e) {
        // Ignore errors, proceed to redirect
    }
    window.location.href = "/login";
};

fetchUserInfo();
