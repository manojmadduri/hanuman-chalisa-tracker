document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    console.log('Login response:', result);
    if (result.token) {
        localStorage.setItem('token', `Bearer ${result.token}`);
        localStorage.setItem('userId', result.userId);
        window.location.href = 'profile.html';
    } else {
        document.getElementById('login-message').textContent = result.message || result.error;
    }
});
