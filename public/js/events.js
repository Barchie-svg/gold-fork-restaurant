/* events.js */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('ev-date').min = new Date().toISOString().split('T')[0];
  document.getElementById('event-form').addEventListener('submit', submitEvent);
});

async function submitEvent(e) {
  e.preventDefault();
  const btn = document.getElementById('ev-submit');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting…';

  const data = {
    customerName: document.getElementById('ev-name').value.trim(),
    customerEmail: document.getElementById('ev-email').value.trim(),
    customerPhone: document.getElementById('ev-phone').value.trim(),
    eventType: document.getElementById('ev-type').value,
    eventDate: document.getElementById('ev-date').value,
    guestCount: parseInt(document.getElementById('ev-guests').value),
    venue: document.getElementById('ev-venue').value,
    budget: document.getElementById('ev-budget').value,
    description: document.getElementById('ev-desc').value.trim(),
  };

  try {
    await api.events.create(data);
    document.getElementById('ev-form-wrap').style.display = 'none';
    document.getElementById('ev-success').style.display = 'block';
  } catch (err) {
    showToast(err.message || 'Submission failed. Please try again.', 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Booking Request';
  }
}

function resetEvForm() {
  document.getElementById('ev-form-wrap').style.display = 'block';
  document.getElementById('ev-success').style.display = 'none';
  document.getElementById('event-form').reset();
  const btn = document.getElementById('ev-submit');
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Booking Request';
}
