document.addEventListener('DOMContentLoaded', () => {
    // Register form handler
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('register-email').value;
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, username, password })
                });

                if (response.ok) {
                    alert('Registration successful!');
                } else {
                    const error = await response.json();
                    alert('Registration failed: ' + (error.message || 'Unknown error'));
                }
            } catch (err) {
                alert('Error: ' + err.message);
            }
        });
    }

    // Login form handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                if (response.ok) {
                    alert('Login successful!');
                    window.location.href = "/dashboard"; // Redirect to dashboard
                } else {
                    const error = await response.json();
                    alert('Login failed: ' + (error.message || 'Unknown error'));
                }
            } catch (err) {
                alert('Error: ' + err.message);
            }
        });
    }
});