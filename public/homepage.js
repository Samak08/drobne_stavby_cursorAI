// Homepage JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const newOrderBtn = document.getElementById('new-order-btn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authButtons = document.getElementById('auth-buttons');
    const userSection = document.getElementById('user-section');
    const orderSection = document.getElementById('order-section');
    const loginPrompt = document.getElementById('login-prompt');
    const welcomeText = document.getElementById('welcome-text');
    const ordersList = document.getElementById('orders-list');

    // Check authentication status on page load
    checkAuthStatus();

    // Event listeners
    loginBtn.addEventListener('click', () => openModal(loginModal));
    registerBtn.addEventListener('click', () => openModal(registerModal));
    logoutBtn.addEventListener('click', logout);
    newOrderBtn.addEventListener('click', () => window.location.href = '/form');

    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Form submissions
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/user');
            if (response.ok) {
                const user = await response.json();
                showUserSection(user);
                loadUserOrders();
            } else {
                showAuthSection();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            showAuthSection();
        }
    }

    function showUserSection(user) {
        authButtons.style.display = 'none';
        userSection.style.display = 'block';
        orderSection.style.display = 'block';
        loginPrompt.style.display = 'none';
        welcomeText.textContent = `Vítejte, ${user.username}!`;
    }

    function showAuthSection() {
        authButtons.style.display = 'block';
        userSection.style.display = 'none';
        orderSection.style.display = 'none';
        loginPrompt.style.display = 'block';
    }

    async function loadUserOrders() {
        try {
            const response = await fetch('/api/orders');
            if (response.ok) {
                const orders = await response.json();
                displayOrders(orders);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    function displayOrders(orders) {
        if (orders.length === 0) {
            ordersList.innerHTML = '<p>Zatím nemáte žádné objednávky.</p>';
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-item">
                <h4>${getOrderTypeText(order.select_value)}</h4>
                <p><strong>Popis:</strong> ${order.text_field}</p>
                <p><strong>Telefon:</strong> ${order.phone_number}</p>
                <p><strong>Kontakt souhlas:</strong> ${order.checkbox_value ? 'Ano' : 'Ne'}</p>
                ${order.latitude && order.longitude ? `<p><strong>Umístění:</strong> ${order.latitude.toFixed(4)}, ${order.longitude.toFixed(4)}</p>` : ''}
                <p class="order-date">Vytvořeno: ${new Date(order.created_at).toLocaleDateString('cs-CZ')}</p>
            </div>
        `).join('');
    }

    function getOrderTypeText(type) {
        const types = {
            'rekonstrukce': 'Rekonstrukce',
            'oprava': 'Oprava',
            'novostavba': 'Novostavba',
            'renovace': 'Renovace',
            'jiné': 'Jiné'
        };
        return types[type] || type;
    }

    async function handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                closeModal(loginModal);
                location.reload(); // Reload to show user section
            } else {
                showError(loginForm, result.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            showError(loginForm, 'Chyba při přihlašování');
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const data = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                closeModal(registerModal);
                location.reload(); // Reload to show user section
            } else {
                showError(registerForm, result.error);
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError(registerForm, 'Chyba při registraci');
        }
    }

    async function logout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST'
            });

            if (response.ok) {
                location.reload(); // Reload to show auth section
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    function openModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        // Clear forms
        modal.querySelectorAll('form').forEach(form => form.reset());
        modal.querySelectorAll('.error').forEach(error => error.remove());
    }

    function showError(form, message) {
        // Remove existing errors
        form.querySelectorAll('.error').forEach(error => error.remove());
        
        // Add new error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        form.appendChild(errorDiv);
    }
});
