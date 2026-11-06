/* reservations.js */
document.addEventListener('DOMContentLoaded', () => {
  // Set min date to today
  const dateInput = document.getElementById('res-date');
  dateInput.min = new Date().toISOString().split('T')[0];

  // Populate times: 12:00 PM to 10:00 PM in 30-min intervals
  const timeSelect = document.getElementById('res-time');
  for (let h = 12; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 22 && m > 0) break;
      const hh = h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const mm = m === 0 ? '00' : '30';
      const label = `${hh}:${mm} ${ampm}`;
      const value = `${String(h).padStart(2,'0')}:${mm}`;
      timeSelect.insertAdjacentHTML('beforeend', `<option value="${value}">${label}</option>`);
    }
  }

  document.getElementById('reservation-form').addEventListener('submit', submitReservation);
});

async function submitReservation(e) {
  e.preventDefault();
  const btn = document.getElementById('res-submit');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking…';

  const data = {
    customerName: document.getElementById('res-name').value.trim(),
    customerEmail: document.getElementById('res-email').value.trim(),
    customerPhone: document.getElementById('res-phone').value.trim(),
    date: document.getElementById('res-date').value,
    time: document.getElementById('res-time').value,
    guests: parseInt(document.getElementById('res-guests').value),
    specialRequests: document.getElementById('res-requests').value.trim(),
  };

  try {
    await api.reservations.create(data);

    // Show success
    document.getElementById('res-form-card').style.display = 'none';
    const success = document.getElementById('res-success');
    success.style.display = 'block';

    const dateStr = new Date(data.date).toLocaleDateString('en-KE', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    const [hh, mm] = data.time.split(':');
    const hour = parseInt(hh);
    const timeStr = `${hour > 12 ? hour - 12 : hour}:${mm} ${hour >= 12 ? 'PM' : 'AM'}`;

    document.getElementById('booking-detail').innerHTML = `
      <div><span>Name</span><span>${data.customerName}</span></div>
      <div><span>Date</span><span>${dateStr}</span></div>
      <div><span>Time</span><span>${timeStr}</span></div>
      <div><span>Guests</span><span>${data.guests}</span></div>
      ${data.specialRequests ? `<div><span>Notes</span><span>${data.specialRequests}</span></div>` : ''}
    `;

    success.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    showToast(err.message || 'Booking failed. Please try again.', 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-calendar-check"></i> Book Table';
  }
}

function resetForm() {
  document.getElementById('res-form-card').style.display = 'block';
  document.getElementById('res-success').style.display = 'none';
  document.getElementById('reservation-form').reset();
  const btn = document.getElementById('res-submit');
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-calendar-check"></i> Book Table';
}
