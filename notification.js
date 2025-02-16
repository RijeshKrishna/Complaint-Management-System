function sendNotification(user, message) {
  const notificationContainer = document.createElement('div');
  notificationContainer.className = 'alert alert-info position-fixed top-0 end-0 m-3 shadow-lg';
  notificationContainer.style.zIndex = 1050;
  notificationContainer.innerHTML = `
      <strong>Notification:</strong> ${user}, ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  document.body.appendChild(notificationContainer);

  setTimeout(() => {
      notificationContainer.remove();
  }, 5000); // Auto-dismiss after 5 seconds
}

// Example Usage
document.addEventListener('DOMContentLoaded', () => {
  const complaints = JSON.parse(localStorage.getItem('complaints')) || [];
  
  if (complaints.some(c => c.status === 'resolved')) {
      sendNotification("John Doe", "Your complaint has been resolved!");
  }
});
