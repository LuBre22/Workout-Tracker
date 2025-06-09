async function loadUsers() {
    const tbody = document.querySelector("#users-table tbody");
    tbody.innerHTML = "";
    document.getElementById("message").textContent = "";
    try {
        const res = await fetch("/users");
        if (!res.ok) throw new Error();
        const users = await res.json();
        users.forEach(user => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${user.username}</td>
                <td>${user.roles.join(", ")}</td>
                <td>
                    <button class="delete-btn" data-username="${user.username}">Delete</button>
                    <button class="change-pw-btn" data-username="${user.username}">Change Password</button>
                    <button class="roles-btn" data-username="${user.username}" data-roles='${JSON.stringify(user.roles)}'>Edit Roles</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Delete button functionality
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.onclick = async function() {
                const username = btn.getAttribute("data-username");
                if (!confirm(`Delete user "${username}"?`)) return;
                try {
                    const delRes = await fetch(`/user/${encodeURIComponent(username)}`, { method: "DELETE" });
                    if (delRes.status === 204) {
                        loadUsers();
                    } else {
                        const err = await delRes.json();
                        document.getElementById("message").textContent = err.detail || "Delete failed.";
                    }
                } catch {
                    document.getElementById("message").textContent = "Delete failed.";
                }
            };
        });

        // Change password button functionality
        document.querySelectorAll(".change-pw-btn").forEach(btn => {
            btn.onclick = async function() {
                const username = btn.getAttribute("data-username");
                const newPassword = prompt(`Enter a new password for "${username}":`);
                if (!newPassword) return;
                try {
                    const res = await fetch(`/user/${encodeURIComponent(username)}/password`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ password: newPassword })
                    });
                    if (res.ok) {
                        document.getElementById("message").textContent = "Password changed.";
                    } else {
                        const err = await res.json();
                        document.getElementById("message").textContent = err.detail || "Password change failed.";
                    }
                } catch {
                    document.getElementById("message").textContent = "Password change failed.";
                }
            };
        });

        // Edit roles button functionality
        document.querySelectorAll(".roles-btn").forEach(btn => {
            btn.onclick = function(e) {
                e.preventDefault();
                const username = btn.getAttribute("data-username");
                const roles = JSON.parse(btn.getAttribute("data-roles"));
                showRoleMenu(username, roles, btn);
            };
        });

    } catch {
        document.getElementById("message").textContent = "Failed to load users.";
    }
}

function showRoleMenu(username, roles, anchorBtn) {
    const menu = document.getElementById("role-menu");
    const form = document.getElementById("role-form");
    // Set checkboxes
    form.role.forEach(cb => {
        cb.checked = roles.includes(cb.value);
    });
    // Position menu near the button
    const rect = anchorBtn.getBoundingClientRect();
    menu.style.display = "block";
    menu.style.top = (window.scrollY + rect.bottom + 5) + "px";
    menu.style.left = (window.scrollX + rect.left) + "px";
    menu.setAttribute("data-username", username);
}

document.getElementById("close-role-menu").onclick = function() {
    document.getElementById("role-menu").style.display = "none";
};

document.getElementById("role-form").onsubmit = async function(e) {
    e.preventDefault();
    const menu = document.getElementById("role-menu");
    const username = menu.getAttribute("data-username");
    const roles = Array.from(document.querySelectorAll("#role-form input[name='role']:checked")).map(cb => cb.value);
    try {
        const res = await fetch(`/user/${encodeURIComponent(username)}/roles`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roles })
        });
        if (res.ok) {
            document.getElementById("message").textContent = "Roles updated.";
            menu.style.display = "none";
            // If the changed user is the currently logged in user, log them out
            const meRes = await fetch("/me");
            if (meRes.ok) {
                const me = await meRes.json();
                if (me.username === username) {
                    await fetch('/logout', { method: 'POST' });
                    window.location.href = "/login";
                    return;
                }
            }
            loadUsers();
        } else {
            const err = await res.json();
            document.getElementById("message").textContent = err.detail || "Failed to update roles.";
        }
    } catch {
        document.getElementById("message").textContent = "Failed to update roles.";
    }
};

document.getElementById("back-btn").onclick = function() {
    window.location.href = "/dashboard";
};

document.getElementById("add-user-btn").onclick = function() {
    document.getElementById("add-user-form").style.display = "block";
    document.getElementById("add-user-btn").style.display = "none";
    document.getElementById("message").textContent = "";
};

document.getElementById("cancel-add-user").onclick = function() {
    document.getElementById("add-user-form").reset();
    document.getElementById("add-user-form").style.display = "none";
    document.getElementById("add-user-btn").style.display = "inline-block";
    document.getElementById("message").textContent = "";
};

document.getElementById("add-user-form").onsubmit = async function(e) {
    e.preventDefault();
    const username = document.getElementById("new-username").value.trim();
    const password = document.getElementById("new-password").value;
    const email = document.getElementById("new-email").value.trim();
    if (!username || !password || !email) {
        document.getElementById("message").textContent = "All fields are required.";
        return;
    }
    try {
        const res = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, email })
        });
        if (res.ok) {
            document.getElementById("message").textContent = "User registered successfully.";
            document.getElementById("add-user-form").reset();
            document.getElementById("add-user-form").style.display = "none";
            document.getElementById("add-user-btn").style.display = "inline-block";
            loadUsers();
        } else {
            const err = await res.json();
            document.getElementById("message").textContent = err.detail || "Registration failed.";
        }
    } catch {
        document.getElementById("message").textContent = "Registration failed.";
    }
};

loadUsers();