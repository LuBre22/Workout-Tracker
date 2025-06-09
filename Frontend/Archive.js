// Format ISO datetime to readable string
function formatDateTime(dt) {
    if (!dt) return "";
    const d = new Date(dt);
    if (!isNaN(d)) {
        return d.toLocaleString();
    }
    return dt;
}

// Render archived sessions table
async function loadArchivedSessions() {
    const tableBody = document.querySelector("#sessions-table tbody");
    document.getElementById('message').textContent = "";
    tableBody.innerHTML = "";
    try {
        const res = await fetch(`/sessions`);
        if (!res.ok) throw new Error();
        const sessions = await res.json();
        if (!sessions.length) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;"><em>No archived sessions found.</em></td></tr>`;
            return;
        }
        sessions.forEach(session => {
            // Build exercise summary
            let exercisesHtml = "";
            if (session.exercises && session.exercises.length > 0) {
                exercisesHtml = session.exercises.map(ex =>
                    `<div>
                        <strong>${ex.name}</strong>
                        <ul style="margin:0 0 0 1em;padding:0;">
                            ${ex.sets.map(set =>
                                `<li>Set ${set.setNumber}: ${set.reps} reps @ ${set.weight} kg</li>`
                            ).join('')}
                        </ul>
                    </div>`
                ).join('');
            } else {
                exercisesHtml = "<em>No exercises</em>";
            }
            tableBody.innerHTML += `
                <tr>
                    <td>${session.name}</td>
                    <td>${formatDateTime(session.timeStart)}</td>
                    <td>${session.duration !== null && session.duration !== undefined ? session.duration : ""}</td>
                    <td class="exercise-list">${exercisesHtml}</td>
                </tr>
            `;
        });
    } catch {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;"><em>Failed to load archived sessions.</em></td></tr>`;
    }
}

// Back button logic
document.getElementById('back-btn').onclick = function() {
    window.location.href = "/dashboard";
};

// Initial load
loadArchivedSessions();