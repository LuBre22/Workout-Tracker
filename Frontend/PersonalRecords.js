document.getElementById('back-btn').onclick = function() {
    window.location.href = "/dashboard";
};

// Populate the table with personal records from backend
async function loadPersonalRecords() {
    const tbody = document.querySelector("#pr-table tbody");
    tbody.innerHTML = "";
    try {
        const res = await fetch(`/personal-records`);
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
    try {
        const res = await fetch(`/personal-records/update`, { method: "POST" });
        if (!res.ok) throw new Error();
        await loadPersonalRecords();
        alert("Personal records updated!");
    } catch {
        alert("Failed to update personal records.");
    }
};

loadPersonalRecords();