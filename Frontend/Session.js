let currentSession = null;

// Helper to get cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Render session info and exercises
function renderSession() {
    const infoDiv = document.getElementById('session-info');
    const exercisesDiv = document.getElementById('exercises-list');
    infoDiv.innerHTML = '';
    exercisesDiv.innerHTML = '';

    if (!currentSession) {
        document.getElementById('add-exercise-btn').style.display = "none";
        document.getElementById('save-session-btn').style.display = "none";
        document.getElementById('new-session-btn').style.display = "inline-block";
        return;
    }

    // Format timeStart for display
    let dateStr = "";
    if (currentSession.timeStart) {
        const d = new Date(currentSession.timeStart);
        if (!isNaN(d)) {
            dateStr = d.toLocaleString();
        } else {
            dateStr = currentSession.timeStart;
        }
    }

    infoDiv.innerHTML = `
        <div><span class="label">Session ID:</span> ${currentSession.id}</div>
        <div><span class="label">Username:</span> ${currentSession.username}</div>
        <div><span class="label">Name:</span> ${currentSession.name}</div>
        <div><span class="label">Start Time:</span> ${dateStr}</div>
    `;

    if (currentSession.exercises && currentSession.exercises.length > 0) {
        currentSession.exercises.forEach((ex, i) => {
            let setsHtml = '';
            if (ex.sets && ex.sets.length > 0) {
                setsHtml = ex.sets.map((set, j) =>
                    `<div class="set-item">
                        <span class="label">Set ${set.setNumber}:</span>
                        ${set.reps} reps @ ${set.weight} kg
                        <button class="btn edit-set-btn" data-ex-idx="${i}" data-set-idx="${j}" type="button" style="padding:2px 8px;font-size:0.9em;background:#ffc107;color:#232526;">Edit</button>
                        <button class="btn delete-set-btn" data-ex-idx="${i}" data-set-idx="${j}" type="button" style="padding:2px 8px;font-size:0.9em;background:#e74c3c;">Delete</button>
                    </div>`
                ).join('');
            } else {
                setsHtml = "<em>No sets yet.</em>";
            }
            exercisesDiv.innerHTML += `
                <div class="exercise-block" id="exercise-block-${i}">
                    <div><span class="label">Exercise:</span> ${ex.name}</div>
                    <div class="set-list">${setsHtml}</div>
                    <button class="btn add-set-btn" data-ex-idx="${i}" type="button">Add Set</button>
                </div>
            `;
        });
    } else {
        exercisesDiv.innerHTML = "<em>No exercises in this session.</em>";
    }

    document.getElementById('add-exercise-btn').style.display = "inline-block";
    document.getElementById('save-session-btn').style.display = "inline-block";
    document.getElementById('new-session-btn').style.display = "none";

    // Attach event listeners for Add Set buttons
    document.querySelectorAll('.add-set-btn').forEach(btn => {
        btn.onclick = function() {
            const exIdx = parseInt(this.getAttribute('data-ex-idx'));
            showAddSetPrompt(exIdx);
        };
    });

    // Attach event listeners for Edit Set buttons
    document.querySelectorAll('.edit-set-btn').forEach(btn => {
        btn.onclick = function() {
            const exIdx = parseInt(this.getAttribute('data-ex-idx'));
            const setIdx = parseInt(this.getAttribute('data-set-idx'));
            showEditSetPrompt(exIdx, setIdx);
        };
    });

    // Attach event listeners for Delete Set buttons
    document.querySelectorAll('.delete-set-btn').forEach(btn => {
        btn.onclick = function() {
            const exIdx = parseInt(this.getAttribute('data-ex-idx'));
            const setIdx = parseInt(this.getAttribute('data-set-idx'));
            deleteSet(exIdx, setIdx);
        };
    });
}

// Load current session from backend
async function loadSession() {
    document.getElementById('message').textContent = "";
    let loggedInUser = null;
    try {
        // Fetch current user info
        const meRes = await fetch('/me');
        if (meRes.ok) {
            const me = await meRes.json();
            loggedInUser = me.username;
        }
    } catch {
        loggedInUser = null;
    }

    try {
        const res = await fetch('/session');
        if (!res.ok) throw new Error();
        currentSession = await res.json();
        // Check if session belongs to logged-in user
        if (!loggedInUser || currentSession.username !== loggedInUser) {
            currentSession = null;
            document.getElementById('message').textContent = "No session loaded for your user.";
        }
    } catch {
        currentSession = null;
        if (!document.getElementById('message').textContent)
            document.getElementById('message').textContent = "No session loaded.";
    }
    renderSession();
}

// Create new session
document.getElementById('new-session-btn').onclick = async function() {
    let name = prompt("Enter session name:");
    const id = Date.now().toString();
    const timeStart = new Date().toISOString();

    // Name validation: only letters, numbers, spaces, dashes, underscores, and parentheses
    const namePattern = /^[\w\s\-()]+$/;
    while (name && !namePattern.test(name)) {
        name = prompt("Session name can only contain letters, numbers, spaces, dashes, underscores, and parentheses. Please enter a valid session name:");
    }

    if (!name) {
        document.getElementById('message').textContent = "Valid session name missing.";
        return;
    }
    currentSession = {
        id,
        name,
        timeStart,
        timeEnd: null,
        duration: null,
        exercises: []
    };
    // Save to backend
    const res = await fetch('/session', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(currentSession)
    });
    if (res.ok) {
        document.getElementById('message').textContent = "Session created!";
        loadSession();
    } else {
        document.getElementById('message').textContent = "Failed to create session.";
    }
};

// Fetch exercise names from backend and populate dropdown
async function populateExerciseDropdown() {
    const select = document.getElementById('exercise-name-input');
    select.innerHTML = '<option value="">Select exercise</option>';
    try {
        const res = await fetch('/exercises');
        if (!res.ok) throw new Error();
        const exercises = await res.json();
        exercises.forEach(ex => {
            const option = document.createElement('option');
            option.value = ex.name;
            option.textContent = ex.name;
            select.appendChild(option);
        });
    } catch {
        select.innerHTML = '<option value="">Failed to load exercises</option>';
    }
}

// Show modal and populate dropdown when adding exercise
document.getElementById('add-exercise-btn').onclick = function() {
    document.getElementById('exercise-modal').style.display = "block";
    populateExerciseDropdown();
};

document.getElementById('cancel-exercise-btn').onclick = function() {
    document.getElementById('exercise-modal').style.display = "none";
};

document.getElementById('save-exercise-btn').onclick = function() {
    const name = document.getElementById('exercise-name-input').value.trim();
    if (!name) {
        alert("Exercise name required.");
        return;
    }
    currentSession.exercises.push({ name, sets: [] });
    // Update backend
    fetch('/session', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(currentSession)
    }).then(res => {
        if (res.ok) {
            document.getElementById('exercise-modal').style.display = "none";
            loadSession();
        } else {
            alert("Failed to add exercise.");
        }
    });
};

// Prompt for set details and add to exercise (with validation)
function showAddSetPrompt(exIdx) {
    let reps = prompt("Reps for new set (integer):");
    while (reps !== null && (!/^\d+$/.test(reps) || parseInt(reps) <= 0)) {
        reps = prompt("Please enter a valid positive integer for reps:");
    }
    if (reps === null) return;

    let weight = prompt("Weight (kg) for new set (number):");
    while (weight !== null && (isNaN(weight) || parseFloat(weight) < 0)) {
        weight = prompt("Please enter a valid non-negative number for weight:");
    }
    if (weight === null) return;

    const sets = currentSession.exercises[exIdx].sets;
    sets.push({
        setNumber: sets.length + 1,
        reps: parseInt(reps),
        weight: parseFloat(weight)
    });
    // Update backend
    fetch('/session', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(currentSession)
    }).then(res => {
        if (res.ok) {
            loadSession();
        } else {
            alert("Failed to add set.");
        }
    });
}

// Prompt for editing a set (with validation)
function showEditSetPrompt(exIdx, setIdx) {
    const set = currentSession.exercises[exIdx].sets[setIdx];
    let reps = prompt("Edit reps (integer):", set.reps);
    while (reps !== null && (!/^\d+$/.test(reps) || parseInt(reps) <= 0)) {
        reps = prompt("Please enter a valid positive integer for reps:", set.reps);
    }
    if (reps === null) return;

    let weight = prompt("Edit weight (kg, number):", set.weight);
    while (weight !== null && (isNaN(weight) || parseFloat(weight) < 0)) {
        weight = prompt("Please enter a valid non-negative number for weight:", set.weight);
    }
    if (weight === null) return;

    set.reps = parseInt(reps);
    set.weight = parseFloat(weight);
    // Update backend
    fetch('/session', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(currentSession)
    }).then(res => {
        if (res.ok) {
            loadSession();
        } else {
            alert("Failed to edit set.");
        }
    });
}

// Delete a set
function deleteSet(exIdx, setIdx) {
    if (!confirm("Delete this set?")) return;
    const sets = currentSession.exercises[exIdx].sets;
    sets.splice(setIdx, 1);
    // Re-number setNumber fields
    sets.forEach((set, idx) => set.setNumber = idx + 1);
    // Update backend
    fetch('/session', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(currentSession)
    }).then(res => {
        if (res.ok) {
            loadSession();
        } else {
            alert("Failed to delete set.");
        }
    });
}

// Save session (archive)
document.getElementById('save-session-btn').onclick = async function() {
    // Set timeEnd to now and calculate duration in minutes
    if (currentSession && currentSession.timeStart) {
        const now = new Date();
        currentSession.timeEnd = now.toISOString();
        const start = new Date(currentSession.timeStart);
        if (!isNaN(start)) {
            currentSession.duration = Math.round((now - start) / 60000); // duration in minutes
        } else {
            currentSession.duration = null;
        }
    }
    const res = await fetch('/session/save', { method: 'POST' });
    if (res.ok) {
        document.getElementById('message').textContent = "Session saved!";
        loadSession();
    } else {
        document.getElementById('message').textContent = "Failed to save session.";
    }
};

// Back button logic
document.getElementById('back-btn').onclick = function() {
    window.location.href = "/dashboard";
};

// Initial load
loadSession();