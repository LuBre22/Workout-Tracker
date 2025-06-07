document.addEventListener('DOMContentLoaded', () => {
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
                    // Registration successful
                    alert('Registration successful!');
                } else {
                    // Registration failed
                    const error = await response.json();
                    alert('Registration failed: ' + (error.message || 'Unknown error'));
                }
            } catch (err) {
                alert('Error: ' + err.message);
            }
        });
    }
});