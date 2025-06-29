async function loadExercises() {
    const listDiv = document.getElementById('exercise-list');
    listDiv.innerHTML = "Loading...";
    try {
        const res = await fetch('/exercises');
        if (!res.ok) throw new Error();
        const exercises = await res.json();
        if (exercises.length === 0) {
            listDiv.innerHTML = "<em>No exercises found.</em>";
            return;
        }
        listDiv.innerHTML = exercises.map(
            (ex, idx) => `<div class="exercise-item" data-idx="${idx}" style="cursor:pointer;">${ex.name}</div>`
        ).join('');

        // Add click listeners to each exercise block
        document.querySelectorAll('.exercise-item').forEach(item => {
            item.onclick = function() {
                const idx = this.getAttribute('data-idx');
                showExerciseDetail(exercises[idx]);
            };
        });
    } catch {
        listDiv.innerHTML = "<span style='color:red;'>Failed to load exercises.</span>";
    }
}

function showExerciseDetail(exercise) {
    // Fill the form with exercise details and disable inputs
    document.getElementById('exercise-name').value = exercise.name;
    document.getElementById('exercise-equipment').value = (exercise.equipment || []).join(', ');
    document.getElementById('exercise-target').value = (exercise.targetMuscles || []).join(', ');
    document.getElementById('exercise-description').value = exercise.description;

    // Disable all inputs
    document.querySelectorAll('#exercise-form input, #exercise-form textarea').forEach(el => el.disabled = true);

    // Hide the Create button, show Back and Update
    document.querySelector('#exercise-form button[type="submit"]').style.display = "none";
    document.getElementById('back-to-list-btn').style.display = "block";
    document.getElementById('update-exercise-btn').style.display = "block";
    document.getElementById('save-exercise-btn').style.display = "none";

    // Show form, hide list, hide show-create-btn
    document.getElementById('exercise-form').style.display = "block";
    document.getElementById('exercise-list').style.display = "none";
    document.getElementById('show-create-btn').style.display = "none";
    document.getElementById('message').textContent = "";

    // Store the current exercise name for update
    document.getElementById('exercise-form').setAttribute('data-current-name', exercise.name);
}

// Show create form and hide list when button is pressed
document.getElementById('show-create-btn').onclick = function() {
    document.getElementById('exercise-form').reset();
    // Enable all inputs
    document.querySelectorAll('#exercise-form input, #exercise-form textarea').forEach(el => el.disabled = false);
    document.querySelector('#exercise-form button[type="submit"]').style.display = "block";
    document.getElementById('back-to-list-btn').style.display = "block";
    document.getElementById('update-exercise-btn').style.display = "none";
    document.getElementById('save-exercise-btn').style.display = "none";
    document.getElementById('exercise-form').removeAttribute('data-current-name');
    document.getElementById('exercise-form').style.display = "block";
    document.getElementById('exercise-list').style.display = "none";
    document.getElementById('show-create-btn').style.display = "none";
    document.getElementById('message').textContent = "";
};

function isValidInput(str) {
    // Only letters, numbers, and spaces
    return /^[A-Za-z0-9\s]+$/.test(str);
}

document.getElementById('exercise-form').onsubmit = async function(e) {
    e.preventDefault();
    if (document.querySelector('#exercise-form button[type="submit"]').style.display === "none") return;

    const name = document.getElementById('exercise-name').value.trim();
    const equipment = document.getElementById('exercise-equipment').value.split(',').map(s => s.trim()).filter(Boolean);
    const targetMuscles = document.getElementById('exercise-target').value.split(',').map(s => s.trim()).filter(Boolean);
    const description = document.getElementById('exercise-description').value.trim();

    // RegEx check for all fields
    if (!isValidInput(name) ||
        equipment.some(eq => !isValidInput(eq)) ||
        targetMuscles.some(tm => !isValidInput(tm)) ||
        (description && !isValidInput(description))) {
        const msgDiv = document.getElementById('message');
        msgDiv.textContent = "All fields may only contain letters, numbers, and spaces.";
        msgDiv.style.color = "red";
        return;
    }

    const response = await fetch('/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, equipment, targetMuscles, description })
    });

    const msgDiv = document.getElementById('message');
    if (response.ok) {
        msgDiv.textContent = "Exercise created successfully!";
        msgDiv.style.color = "green";
        document.getElementById('exercise-form').reset();
        document.getElementById('exercise-form').style.display = "none";
        document.getElementById('exercise-list').style.display = "block";
        document.getElementById('show-create-btn').style.display = "block";
        loadExercises();
    } else {
        const error = await response.json();
        msgDiv.textContent = error.detail || "Failed to create exercise.";
        msgDiv.style.color = "red";
    }
};

// Back button handler
document.getElementById('back-to-list-btn').onclick = function() {
    // Enable all inputs and show Create button for next time
    document.querySelectorAll('#exercise-form input, #exercise-form textarea').forEach(el => el.disabled = false);
    document.querySelector('#exercise-form button[type="submit"]').style.display = "block";
    document.getElementById('update-exercise-btn').style.display = "none";
    document.getElementById('save-exercise-btn').style.display = "none";
    document.getElementById('exercise-form').removeAttribute('data-current-name');
    document.getElementById('exercise-form').style.display = "none";
    document.getElementById('exercise-list').style.display = "block";
    document.getElementById('show-create-btn').style.display = "block";
    document.getElementById('message').textContent = "";
};

// Update button handler
document.getElementById('update-exercise-btn').onclick = function() {
    // Enable all inputs except name (if you want to keep name immutable, otherwise remove this line)
    document.querySelectorAll('#exercise-form input, #exercise-form textarea').forEach(el => el.disabled = false);
    // document.getElementById('exercise-name').disabled = true; // Uncomment to keep name immutable
    document.getElementById('save-exercise-btn').style.display = "block";
    document.getElementById('update-exercise-btn').style.display = "none";
    document.querySelector('#exercise-form button[type="submit"]').style.display = "none";
};

// Save button handler
document.getElementById('save-exercise-btn').onclick = async function() {
    const currentName = document.getElementById('exercise-form').getAttribute('data-current-name');
    if (!currentName) return;

    const name = document.getElementById('exercise-name').value.trim();
    const equipment = document.getElementById('exercise-equipment').value.split(',').map(s => s.trim()).filter(Boolean);
    const targetMuscles = document.getElementById('exercise-target').value.split(',').map(s => s.trim()).filter(Boolean);
    const description = document.getElementById('exercise-description').value.trim();

    // RegEx check for all fields
    if (!isValidInput(name) ||
        equipment.some(eq => !isValidInput(eq)) ||
        targetMuscles.some(tm => !isValidInput(tm)) ||
        (description && !isValidInput(description))) {
        const msgDiv = document.getElementById('message');
        msgDiv.textContent = "All fields may only contain letters, numbers, and spaces.";
        msgDiv.style.color = "red";
        return;
    }

    const response = await fetch(`/exercises/${encodeURIComponent(currentName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, equipment, targetMuscles, description })
    });

    const msgDiv = document.getElementById('message');
    if (response.ok) {
        msgDiv.textContent = "Exercise updated successfully!";
        msgDiv.style.color = "green";
        document.getElementById('exercise-form').removeAttribute('data-current-name');
        document.getElementById('exercise-form').style.display = "none";
        document.getElementById('exercise-list').style.display = "block";
        document.getElementById('show-create-btn').style.display = "block";
        loadExercises();
    } else {
        const error = await response.json();
        msgDiv.textContent = error.detail || "Failed to update exercise.";
        msgDiv.style.color = "red";
    }
};

// Show list and button, hide form on load
document.getElementById('exercise-form').style.display = "none";
document.getElementById('exercise-list').style.display = "block";
document.getElementById('show-create-btn').style.display = "block";
loadExercises();