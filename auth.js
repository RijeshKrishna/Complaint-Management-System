document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (localStorage.getItem('authToken')) {
        const role = localStorage.getItem('role');
        if (role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
        return;
    }

    // Get form elements
    const loginForm = document.querySelector('#loginForm form');
    const signupForm = document.querySelector('#signupForm form');
    
    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            
            const btn = loginForm.querySelector('button');
            const spinner = btn.querySelector('.spinner-border');
            const btnText = btn.querySelector('span');

            // Show loading state
            btn.disabled = true;
            btnText.classList.add('d-none');
            spinner.classList.remove('d-none');

            // Simulate API call
            setTimeout(() => {
                localStorage.setItem('authToken', 'dummy-token-123');
                localStorage.setItem('role', currentRole);

                if (currentRole === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1500);
        });
    }

    // Handle Signup
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = signupForm.querySelector('input[type="text"]').value;
            const email = signupForm.querySelector('input[type="email"]').value;
            const password = signupForm.querySelector('input[type="password"]').value;
            
            const btn = signupForm.querySelector('button');
            const spinner = btn.querySelector('.spinner-border');
            const btnText = btn.querySelector('span');

            // Show loading state
            btn.disabled = true;
            btnText.classList.add('d-none');
            spinner.classList.remove('d-none');

            // Simulate API call
            setTimeout(() => {
                localStorage.setItem('authToken', 'dummy-token-123');
                localStorage.setItem('role', currentRole);

                if (currentRole === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1500);
        });
    }
});