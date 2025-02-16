document.addEventListener('DOMContentLoaded', () => {
    // Authentication Check
    if (!localStorage.getItem('authToken')) {
        window.location.href = 'auth.html';
        return;
    }
  
    // Initialize Components
    initializeComponents();
    loadDashboardData();
    setupEventListeners();
});

// Initialize Components
function initializeComponents() {
    // Initialize all tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => new bootstrap.Tooltip(tooltip));
  
    // Initialize charts
    initializeTrendChart();
    initializeCategoryChart();
  
    // Load user profile
    loadUserProfile();
}

// Load Dashboard Data
function loadDashboardData() {
    const complaints = JSON.parse(localStorage.getItem('complaints')) || [];
    
    // Update statistics with animation
    animateCounter('totalComplaints', complaints.length);
    animateCounter('pendingComplaints', complaints.filter(c => c.status === 'pending').length);
    animateCounter('resolvedComplaints', complaints.filter(c => c.status === 'resolved').length);
    
    // Calculate and update satisfaction rate
    const feedbacks = JSON.parse(localStorage.getItem('userFeedback')) || [];
    const averageRating = feedbacks.length > 0 
        ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length * 20).toFixed(1)
        : 0;
    document.getElementById('satisfactionRate').textContent = `${averageRating}%`;

    // Load recent complaints
    loadRecentComplaints(complaints);
    
    // Load activity logs and feedback
    loadActivityLogs();
    loadUserFeedback();
    
    // Update charts
    updateChartData(complaints);
}

// Animate Counter
function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const duration = 1000;
    const steps = 50;
    const stepValue = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += stepValue;
        element.textContent = Math.round(current);
        
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        }
    }, duration / steps);
}

// Initialize Trend Chart
function initializeTrendChart() {
    const ctx = document.getElementById('trendChart')?.getContext('2d');
    if (!ctx) return;

    window.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'New Complaints',
                borderColor: '#6366f1',
                data: []
            }, {
                label: 'Resolved Complaints',
                borderColor: '#22c55e',
                data: []
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize Category Chart
function initializeCategoryChart() {
    const ctx = document.getElementById('categoryChart')?.getContext('2d');
    if (!ctx) return;

    window.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#6366f1',
                    '#22c55e',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Load Recent Complaints
function loadRecentComplaints(complaints) {
    const tableBody = document.getElementById('recentComplaints');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    complaints.slice(-5).reverse().forEach(complaint => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${complaint.id}</td>
            <td>${complaint.category}</td>
            <td>${complaint.description.substring(0, 50)}...</td>
            <td>
                <span class="badge bg-${complaint.status === 'resolved' ? 'success' : 'warning'}">
                    ${complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                </span>
            </td>
            <td>${new Date(complaint.dateFiled).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="viewComplaint(${complaint.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-success" onclick="updateStatus(${complaint.id})">
                    <i class="fas fa-check"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Load Activity Logs
function loadActivityLogs() {
    const logsList = document.getElementById('activityLogs');
    if (!logsList) return;

    const logs = JSON.parse(localStorage.getItem('activityLogs')) || [];
    logsList.innerHTML = '';

    logs.slice(-5).reverse().forEach(log => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <i class="fas ${log.icon} text-${log.type} me-2"></i>
                    ${log.message}
                </div>
                <small class="text-muted">${new Date(log.timestamp).toLocaleString()}</small>
            </div>
        `;
        logsList.appendChild(li);
    });
}

// Load User Feedback
function loadUserFeedback() {
    const feedbackList = document.getElementById('userFeedback');
    if (!feedbackList) return;

    const feedbacks = JSON.parse(localStorage.getItem('userFeedback')) || [];
    feedbackList.innerHTML = '';

    feedbacks.slice(-5).reverse().forEach(feedback => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="stars mb-1">
                        ${Array(5).fill().map((_, i) => 
                            `<i class="fas fa-star ${i < feedback.rating ? 'text-warning' : 'text-muted'}"></i>`
                        ).join('')}
                    </div>
                    <p class="mb-0">${feedback.feedback}</p>
                </div>
                <small class="text-muted">${new Date(feedback.timestamp).toLocaleString()}</small>
            </div>
        `;
        feedbackList.appendChild(li);
    });
}

// Update Chart Data
function updateChartData(complaints) {
    if (!window.trendChart || !window.categoryChart) return;

    // Process data for trend chart
    const last6Months = Array.from({length: 6}, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toLocaleString('default', { month: 'short' });
    }).reverse();

    const complaintsByMonth = last6Months.map(month => ({
        new: complaints.filter(c => 
            new Date(c.dateFiled).toLocaleString('default', { month: 'short' }) === month
        ).length,
        resolved: complaints.filter(c => 
            c.status === 'resolved' && 
            new Date(c.dateFiled).toLocaleString('default', { month: 'short' }) === month
        ).length
    }));

    // Update trend chart
    window.trendChart.data.labels = last6Months;
    window.trendChart.data.datasets[0].data = complaintsByMonth.map(m => m.new);
    window.trendChart.data.datasets[1].data = complaintsByMonth.map(m => m.resolved);
    window.trendChart.update();

    // Process data for category chart
    const categories = {};
    complaints.forEach(complaint => {
        categories[complaint.category] = (categories[complaint.category] || 0) + 1;
    });

    // Update category chart
    window.categoryChart.data.labels = Object.keys(categories);
    window.categoryChart.data.datasets[0].data = Object.values(categories);
    window.categoryChart.update();
}

// Setup Event Listeners
function setupEventListeners() {
    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Feedback Form
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmission);
    }

    // Setup rating stars
    setupRatingStars();
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    window.location.href = 'auth.html';
}

// Handle Feedback Submission
function handleFeedbackSubmission(e) {
    e.preventDefault();
    
    const feedback = {
        rating: parseInt(document.getElementById('feedbackRating').value),
        feedback: document.getElementById('feedbackText').value,
        timestamp: new Date().toISOString()
    };

    const feedbacks = JSON.parse(localStorage.getItem('userFeedback')) || [];
    feedbacks.push(feedback);
    localStorage.setItem('userFeedback', JSON.stringify(feedbacks));

    // Close modal and reload data
    const modal = bootstrap.Modal.getInstance(document.getElementById('feedbackModal'));
    modal.hide();
    loadDashboardData();

    // Show success message
    showToast('Feedback submitted successfully!', 'success');
}

// Setup Rating Stars
function setupRatingStars() {
    const stars = document.querySelectorAll('.rating i');
    const ratingInput = document.getElementById('feedbackRating');
    if (!stars.length || !ratingInput) return;

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.dataset.rating;
            ratingInput.value = rating;
            
            stars.forEach(s => {
                s.className = parseInt(s.dataset.rating) <= parseInt(rating) 
                    ? 'fas fa-star text-warning' 
                    : 'far fa-star';
            });
        });
    });
}

// Show Toast Message
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

// View Complaint Details
function viewComplaint(id) {
    const complaints = JSON.parse(localStorage.getItem('complaints')) || [];
    const complaint = complaints.find(c => c.id === id);
    if (!complaint) return;

    // Implementation for viewing complaint details
    // You can show a modal or navigate to a details page
}

// Update Complaint Status
function updateStatus(id) {
    const complaints = JSON.parse(localStorage.getItem('complaints')) || [];
    const complaintIndex = complaints.findIndex(c => c.id === id);
    if (complaintIndex === -1) return;

    complaints[complaintIndex].status = 
        complaints[complaintIndex].status === 'pending' ? 'resolved' : 'pending';
    
    localStorage.setItem('complaints', JSON.stringify(complaints));
    loadDashboardData();
    
    // Add to activity logs
    addActivityLog({
        message: `Complaint #${id} status updated to ${complaints[complaintIndex].status}`,
        type: complaints[complaintIndex].status === 'resolved' ? 'success' : 'warning',
        icon: complaints[complaintIndex].status === 'resolved' ? 'fa-check-circle' : 'fa-clock'
    });
}

// Add Activity Log
function addActivityLog(log) {
    const logs = JSON.parse(localStorage.getItem('activityLogs')) || [];
    logs.push({
        ...log,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('activityLogs', JSON.stringify(logs));
    loadActivityLogs();
}