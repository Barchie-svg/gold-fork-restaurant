/* admin/reservations.js */
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAdmin()) return;
  injectAdminSidebar('reservations');
  await loadReservations();
  document.getElementById('res-status-filter').addEventListener('change', loadReservations);
});

async function loadReservations() {
  const status = document.getElementById('res-status-filter').value;
  const from = document.getElementById('date-from').value;
  const to = document.getElementById('date-to').value;
  let params = '?limit=50';
  if (status) params += `&status=${status}`;
  if (from) params += `&from=${from}`;
  if (to) params += `&to=${to}`;
  try {
    const res = await api.reservations.getAll(params);
    renderReservations(res.data || []);
  } catch {
    document.getElementById('res-tbody').innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:2rem;">Could not load reservations</td></tr>';
  }
}

function renderReservations(items) {
  const tbody = document.getElementById('res-tbody');
  if (!items.length) { tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:2rem;">No reservations found</td></tr>'; return; }
  tbody.innerHTML = items.map(r => `
    <tr>
      <td><strong>${r.customerName}</strong></td>
      <td style="color:var(--text-muted);font-size:.85rem;">${r.customerEmail || '—'}</td>
      <td style="color:var(--text-muted);font-size:.85rem;">${r.customerPhone}</td>
      <td>${formatDate(r.date)}</td>
      <td>${r.time}</td>
      <td>${r.guests}</td>
      <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-muted);font-size:.82rem;">${r.specialRequests || '—'}</td>
      <td>${statusBadge(r.status)}</td>
      <td>
        <div class="table-actions">
          ${r.status === 'pending' ? `
            <button class="btn btn-primary" style="font-size:.78rem;padding:.3rem .7rem;" onclick="updateRes('${r._id}','confirmed')"><i class="fas fa-check"></i></button>
            <button class="btn btn-danger" style="font-size:.78rem;padding:.3rem .7rem;" onclick="updateRes('${r._id}','cancelled')"><i class="fas fa-times"></i></button>
          ` : `<span style="color:var(--text-muted);font-size:.82rem;">${r.status}</span>`}
        </div>
      </td>
    </tr>`).join('');
}

async function updateRes(id, status) {
  try {
    await api.reservations.update(id, { status });
    showToast(`Reservation ${status}`);
    await loadReservations();
  } catch (err) {
    showToast(err.message || 'Update failed', 'error');
  }
}
