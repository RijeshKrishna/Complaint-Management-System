// Profile Page JavaScript with Enhanced Performance and Error Handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Authentication Check with proper error handling
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            hideLoadingState(); // Ensure loading state is cleared before redirect
            window.location.href = 'index.html';
            return;
        }

        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Initialize Components with loading state and error handling
        initializeProfilePage().catch(error => {
            console.error('Failed to initialize profile page:', error);
            showToast('Error loading profile page. Please refresh.', 'danger');
            hideLoadingState();
        });
    } catch (error) {
        console.error('Error during page initialization:', error);
        hideLoadingState();
        showToast('An error occurred while loading the page.', 'danger');
    }
});

// Initialize Profile Page
async function initializeProfilePage() {
    try {
        showLoadingState();
        await initializeComponents();
        setupEventListeners();
        setupFormValidation();
        hideLoadingState();
    } catch (error) {
        throw new Error(`Failed to initialize profile page: ${error.message}`);
    }
}

// Show Loading State
function showLoadingState() {
    const existingLoader = document.getElementById('pageLoader');
    if (existingLoader) {
        existingLoader.remove();
    }

    const loader = document.createElement('div');
    loader.id = 'pageLoader';
    loader.innerHTML = `
        <div class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white" style="z-index: 9999;">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    document.body.appendChild(loader);
}

// Hide Loading State
function hideLoadingState() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
    }
}

// Initialize Components with proper error handling
async function initializeComponents() {
    try {
        const userData = localStorage.getItem('userData');
        const parsedUserData = userData ? JSON.parse(userData) : null;
        const isEditMode = !!parsedUserData;
        
        const titleElement = document.querySelector('.display-4');
        const submitButton = document.querySelector('button[type="submit"]');
        
        if (!titleElement || !submitButton) {
            throw new Error('Required elements not found');
        }

        // Update page title and button text based on mode
        titleElement.textContent = isEditMode ? 'Edit Profile' : 'Create Profile';
        submitButton.innerHTML = 
            `<i class="fas fa-${isEditMode ? 'save' : 'plus'} me-2"></i>${isEditMode ? 'Save Changes' : 'Create Profile'}`;
        
        if (isEditMode && parsedUserData) {
            // Populate form fields with null checks
            const fields = ['name', 'email', 'phone', 'age', 'address'];
            fields.forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    element.value = parsedUserData[field] || '';
                }
            });
            
            const profilePicture = document.getElementById('profilePicture');
            if (profilePicture && parsedUserData.profilePicture) {
                profilePicture.src = parsedUserData.profilePicture;
            }
        }
    } catch (error) {
        throw new Error(`Failed to initialize components: ${error.message}`);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    try {
        // Add any additional event listeners here
        const form = document.getElementById('profileForm');
        if (form) {
            form.addEventListener('reset', () => {
                showToast('Form has been reset', 'info');
            });
        }
    } catch (error) {
        console.error('Error setting up event listeners:', error);
        showToast('Error setting up page interactions', 'warning');
    }
}

// Form Validation with Performance Optimization
function setupFormValidation() {
    const form = document.getElementById('profileForm');
    if (!form) {
        console.error('Profile form not found');
        return;
    }

    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const validateField = debounce((field) => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            return false;
        }
        field.classList.remove('is-invalid');
        return true;
    }, 200);

    const validateForm = () => {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        return isValid;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showToast('Please fill in all required fields correctly', 'danger');
            return;
        }
        await saveProfile();
    });

    // Optimize field validation with event delegation
    form.addEventListener('input', (e) => {
        if (e.target.hasAttribute('required')) {
            validateField(e.target);
        }
    });
}

// Save Profile with Success Message and Error Handling
async function saveProfile() {
    showLoadingState();
    
    try {
        const form = document.getElementById('profileForm');
        if (!form) {
            throw new Error('Profile form not found');
        }

        const userData = {
            name: document.getElementById('name')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            age: document.getElementById('age')?.value || '',
            address: document.getElementById('address')?.value || '',
            profilePicture: document.getElementById('profilePicture')?.src || '',
            createdAt: new Date().toISOString()
        };

        // Validate required fields
        if (!userData.name || !userData.email) {
            throw new Error('Required fields are missing');
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Save to localStorage
        localStorage.setItem('userData', JSON.stringify(userData));

        // Show success message
        showToast('Profile saved successfully!', 'success');

        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        console.error('Error saving profile:', error);
        showToast(error.message || 'Error saving profile. Please try again.', 'danger');
    } finally {
        hideLoadingState();
    }
}

// Enhanced Toast Notification System with Error Handling
function showToast(message, type = 'info') {
    try {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0 position-fixed top-0 end-0 m-3`;
        toast.style.zIndex = '9999';
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Check if Bootstrap is available
        if (typeof bootstrap !== 'undefined') {
            const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
            bsToast.show();
            
            toast.addEventListener('hidden.bs.toast', () => {
                toast.remove();
            });
        } else {
            // Fallback if Bootstrap is not available
            toast.style.display = 'block';
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    } catch (error) {
        console.error('Error showing toast:', error);
    }
}