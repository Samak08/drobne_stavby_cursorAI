// Form JavaScript functionality
let map;
let selectedMarker;
let selectedLatitude;
let selectedLongitude;

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('orderForm');
    const submitBtn = document.getElementById('submitBtn');
    const textField = document.getElementById('textField');
    const selectValue = document.getElementById('selectValue');
    const phoneNumber = document.getElementById('phoneNumber');
    const checkboxValue = document.getElementById('checkboxValue');
    const confirmationModal = document.getElementById('confirmationModal');
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Initialize map
    initMap();

    // Event listeners
    form.addEventListener('input', validateForm);
    form.addEventListener('submit', handleSubmit);
    phoneNumber.addEventListener('input', validatePhoneNumber);
    backToHomeBtn.addEventListener('click', () => window.location.href = '/');
    logoutBtn.addEventListener('click', logout);

    // Check authentication
    checkAuth();

    function initMap() {
        // Initialize map centered on Czech Republic
        map = L.map('map').setView([49.7437, 15.3386], 7);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add click event to map
        map.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            // Remove existing marker
            if (selectedMarker) {
                map.removeLayer(selectedMarker);
            }
            
            // Add new marker
            selectedMarker = L.marker([lat, lng]).addTo(map);
            selectedLatitude = lat;
            selectedLongitude = lng;
            
            // Update form validation
            validateForm();
        });
    }

    function validatePhoneNumber() {
        const phone = phoneNumber.value.trim();
        // More flexible phone regex that accepts various formats
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,20}$/;
        
        if (phone && !phoneRegex.test(phone)) {
            phoneNumber.style.borderColor = '#e74c3c';
            showFieldError(phoneNumber, 'Neplatný formát telefonního čísla');
        } else {
            phoneNumber.style.borderColor = '#e1e8ed';
            hideFieldError(phoneNumber);
        }
        
        validateForm();
    }

    function validateForm() {
        const isTextFieldValid = textField.value.trim().length > 0;
        const isSelectValid = selectValue.value !== '';
        const isPhoneValid = validatePhoneFormat(phoneNumber.value);
        const isLocationValid = selectedLatitude && selectedLongitude;
        
        const allFieldsValid = isTextFieldValid && isSelectValid && isPhoneValid && isLocationValid;
        
        submitBtn.disabled = !allFieldsValid;
        
        if (allFieldsValid) {
            submitBtn.textContent = 'Odeslat objednávku';
        } else {
            submitBtn.textContent = 'Vyplňte všechna pole';
        }
    }

    function validatePhoneFormat(phone) {
        if (!phone.trim()) return false;
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,20}$/;
        return phoneRegex.test(phone);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        if (submitBtn.disabled) return;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Odesílám...';
        
        const formData = {
            textField: textField.value.trim(),
            checkboxValue: checkboxValue.checked,
            selectValue: selectValue.value,
            phoneNumber: phoneNumber.value.trim(),
            latitude: selectedLatitude,
            longitude: selectedLongitude
        };

        try {
            const response = await fetch('/api/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                showConfirmation(result, formData);
            } else {
                showError(result.error);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Odeslat objednávku';
            }
        } catch (error) {
            console.error('Submit error:', error);
            showError('Chyba při odesílání formuláře');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Odeslat objednávku';
        }
    }

    function showConfirmation(result, formData) {
        const orderDetails = document.getElementById('orderDetails');
        
        orderDetails.innerHTML = `
            <h4>Detaily objednávky #${result.orderId}</h4>
            <p><strong>Typ práce:</strong> ${getOrderTypeText(formData.selectValue)}</p>
            <p><strong>Popis:</strong> ${formData.textField}</p>
            <p><strong>Telefon:</strong> ${formData.phoneNumber}</p>
            <p><strong>Kontakt souhlas:</strong> ${formData.checkboxValue ? 'Ano' : 'Ne'}</p>
            <p><strong>Umístění:</strong> ${selectedLatitude.toFixed(4)}, ${selectedLongitude.toFixed(4)}</p>
            <p><strong>Datum:</strong> ${new Date().toLocaleDateString('cs-CZ')}</p>
        `;
        
        confirmationModal.style.display = 'block';
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

    function showError(message) {
        // Remove existing errors
        document.querySelectorAll('.error').forEach(error => error.remove());
        
        // Add new error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        errorDiv.style.textAlign = 'center';
        errorDiv.style.marginTop = '1rem';
        
        form.appendChild(errorDiv);
    }

    function showFieldError(field, message) {
        hideFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    function hideFieldError(field) {
        const existingError = field.parentNode.querySelector('.error');
        if (existingError) {
            existingError.remove();
        }
    }

    async function checkAuth() {
        try {
            const response = await fetch('/api/user');
            if (!response.ok) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Auth check error:', error);
            window.location.href = '/';
        }
    }

    async function logout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST'
            });

            if (response.ok) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
});
