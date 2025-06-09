document.getElementById('back-btn').onclick = function() {
    window.location.href = "/dashboard";
};

// Helper to get cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Populate the table with personal records from backend
async function loadPersonalRecords() {
    const username = getCookie("username");
    const tbody = document.querySelector("#pr-table tbody");
    tbody.innerHTML = "";
    if (!username) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;"><em>No username found in session.</em></td></tr>`;
        return;
    }
    try {
        const res = await fetch(`/personal-records?username=${encodeURIComponent(username)}`);
        if (!res.ok) throw new Error();
        const records = await res.json();
        if (!records.length) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;"><em>No personal records found.</em></td></tr>`;
            return;
        }
        records.forEach(rec => {
            tbody.innerHTML += `
                <tr>
                    <td>${rec.exercise}</td>
                    <td>${rec.weight}</td>
                    <td>${rec.reps}</td>
                </tr>
            `;
        });
    } catch {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;"><em>Failed to load personal records.</em></td></tr>`;
    }
}

// Update PRs from sessions (calls backend endpoint)
document.getElementById('update-pr-btn').onclick = async function() {
    const username = getCookie("username");
    if (!username) {
        alert("No username found in session.");
        return;
    }
    try {
        const res = await fetch(`/personal-records/update?username=${encodeURIComponent(username)}`, { method: "POST" });
        if (!res.ok) throw new Error();
        await loadPersonalRecords();
        alert("Personal records updated!");
    } catch {
        alert("Failed to update personal records.");
    }
};

loadPersonalRecords();