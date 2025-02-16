// Complaint Form JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Authentication Check
    if (!localStorage.getItem('authToken')) {
        window.location.href = 'index.html';
        return;
    }
  
    // Initialize Components
    initializeComponents();
    setupEventListeners();
    setupFormValidation();
  });
  
  // Initialize Components
  function initializeComponents() {
    // Check if form elements exist to prevent errors
    const form = document.getElementById('complaintForm');
    if (!form) {
        console.error('Complaint form not found');
        return;
    }
  
    // Pre-fill user data if available (maintaining backward compatibility)
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        if (nameField) nameField.value = userData.name || '';
        if (emailField) emailField.value = userData.email || '';
    }
  
    // Initialize progress bar
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = '0%';
        progressBar.style.transition = 'width 0.3s ease';
    }
  
    // Fix footer text visibility
    const footerTexts = document.querySelectorAll('.footer .text-muted');
    footerTexts.forEach(text => {
        text.classList.remove('text-muted');
        text.classList.add('text-light', 'opacity-75');
    });
  }
  
  // Setup Event Listeners
  function setupEventListeners() {
    // Logout Button (maintaining existing functionality)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        });
    }
  
    // Character Counter (enhanced from original)
    const descriptionField = document.getElementById('description');
    const charCount = document.getElementById('charCount');
    
    if (descriptionField && charCount) {
        descriptionField.addEventListener('input', () => {
            const length = descriptionField.value.length;
            charCount.textContent = `${length}/500`;
            
            // Using your existing color variable
            charCount.style.color = length > 500 ? 'var(--danger-color)' : 'var(--text-dark)';
            
            // Disable submit button if description is too long
            const submitButton = document.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = length > 500;
            }
        });
    }
  
    // File Upload Validation
    const attachmentInput = document.getElementById('attachments');
    if (attachmentInput) {
        attachmentInput.addEventListener('change', validateFileUpload);
    }
  
    // Update progress bar as form is filled
    const formInputs = document.querySelectorAll('#complaintForm input, #complaintForm select, #complaintForm textarea');
    formInputs.forEach(input => {
        input.addEventListener('change', updateProgress);
    });
  }
  
  // Form Validation
  function setupFormValidation() {
    const form = document.getElementById('complaintForm');
    if (!form) return;
  
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showToast('Please fill in all required fields correctly', 'danger');
            return;
        }
        submitComplaint();
    });
  }
  
  // Validate Form
  function validateForm() {
    const form = document.getElementById('complaintForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
  
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
  
    // Validate email format if email field exists
    const emailField = document.getElementById('email');
    if (emailField && emailField.value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailField.value)) {
            emailField.classList.add('is-invalid');
            isValid = false;
        }
    }
  
    return isValid;
  }
  
  // File Upload Validation (Fixed)
  function validateFileUpload(e) {
    const files = e.target.files;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'image/jpeg',       // JPEG images
      'image/png',        // PNG images
      'image/gif',        // GIF images
      'image/webp',       // WebP images
      'image/svg+xml',    // SVG images
      'application/pdf'   // PDF documents
    ];
    
    for (let file of files) {
        if (file.size > maxSize) {
            showToast(`File ${file.name} exceeds 5MB limit`, 'danger');
            e.target.value = ''; // Clear the input
            return;
        }
        if (!allowedTypes.includes(file.type)) {
            showToast(`File ${file.name} has an unsupported format. Supported formats: JPEG, PNG, GIF, WebP, SVG, PDF`, 'danger');
            e.target.value = ''; // Clear the input
            return;
        }
    }
  }
  
  // Update Progress Bar
  function updateProgress() {
    const form = document.getElementById('complaintForm');
    const progressBar = document.querySelector('.progress-bar');
    if (!form || !progressBar) return;
  
    const requiredFields = form.querySelectorAll('[required]');
    const filledFields = Array.from(requiredFields).filter(field => field.value.trim() !== '');
    const progress = (filledFields.length / requiredFields.length) * 100;
    
    progressBar.style.width = `${progress}%`;
  }
  
  // Submit Complaint (enhanced from original)
  function submitComplaint() {
    const complaint = {
        id: Date.now(),
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        contact: document.getElementById('contact').value,
        address: document.getElementById('address').value,
        category: document.getElementById('category').value,
        priority: document.getElementById('priority')?.value || 'medium',
        subject: document.getElementById('subject')?.value || '',
        description: document.getElementById('description').value,
        attachments: Array.from(document.getElementById('attachments')?.files || []).map(f => f.name),
        status: 'pending',
        dateFiled: new Date().toLocaleDateString(),
        timestamp: new Date().toISOString()
    };
  
    // Save to localStorage (maintaining backward compatibility)
    const complaints = JSON.parse(localStorage.getItem('complaints')) || [];
    complaints.push(complaint);
    localStorage.setItem('complaints', JSON.stringify(complaints));
  
    // Add to activity logs
    const activityLog = JSON.parse(localStorage.getItem('activityLogs')) || [];
    activityLog.push({
        action: 'New Complaint Filed',
        details: `Complaint #${complaint.id} filed under ${complaint.category} category`,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('activityLogs', JSON.stringify(activityLog));
  
    // Show success message and redirect
    showToast('Complaint submitted successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
  }
  
  // Toast Notification System
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0 position-fixed bottom-0 end-0 m-3`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
  }