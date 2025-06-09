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

    } catch {
        document.getElementById("message").textContent = "Failed to load users.";
    }
}

document.getElementById("back-btn").onclick = function() {
    window.location.href = "/dashboard";
};

loadUsers();