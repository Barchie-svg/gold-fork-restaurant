/* admin/events.js */
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAdmin()) return;
  injectAdminSidebar('events');
  await loadEvents();
  document.getElementById('ev-status-filter').addEventListener('change', loadEvents);
  document.getElementById('ev-type-filter').addEventListener('change', loadEvents);
});

async function loadEvents() {
  const status = document.getElementById('ev-status-filter').value;
  const type = document.getElementById('ev-type-filter').value;
  let params = '?limit=50';
  if (status) params += `&status=${status}`;
  if (type) params += `&eventType=${encodeURIComponent(type)}`;
  try {
    const res = await api.events.getAll(params);
    renderEvents(res.data || []);
  } catch {
    document.getElementById('events-tbody').innerHTML =
      '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:2rem;">Could not load events</td></tr>';
  }
}

function renderEvents(items) {
  const tbody = document.getElementById('events-tbody');
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:2rem;">No event bookings yet</td></tr>';
    return;
  }
  tbody.innerHTML = items.map(ev => `
    <tr>
      <td>
        <div style="font-weight:600;">${ev.customerName}</div>
        <div style="font-size:.8rem;color:var(--text-muted);">${ev.customerEmail}</div>
        <div style="font-size:.8rem;color:var(--text-muted);">${ev.customerPhone}</div>
      </td>
      <td><span class="badge badge-pending" style="background:rgba(201,168,76,.1);color:var(--gold);">${ev.eventType}</span></td>
      <td>${formatDate(ev.eventDate)}</td>
      <td>${ev.guestCount || '—'}</td>
      <td>${ev.venue || '—'}</td>
      <td style="font-size:.85rem;color:var(--text-muted);">${ev.budget || '—'}</td>
      <td>
        <select style="background:var(--bg-elevated);border:1px solid var(--border-color);border-radius:4px;color:var(--text-secondary);padding:.3rem .5rem;font-size:.82rem;cursor:pointer;"
          onchange="updateEventStatus('${ev._id}', this.value)">
          ${['pending','reviewing','confirmed','cancelled'].map(s =>
            `<option value="${s}" ${ev.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
      <td>
        <button class="btn btn-outline" style="font-size:.78rem;padding:.3rem .7rem;" onclick="viewDetail(${JSON.stringify(ev).replace(/"/g,'&quot;')})">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>`).join('');
}

async function updateEventStatus(id, status) {
  try {
    await api.events.update(id, { status });
    showToast(`Event status updated to "${status}"`);
  } catch (err) {
    showToast(err.message || 'Update failed', 'error');
    await loadEvents();
  }
}

function viewDetail(ev) {
  document.getElementById('ev-detail-body').innerHTML = `
    <div style="display:grid;gap:.75rem;">
      ${[
        ['Customer', ev.customerName],
        ['Email', ev.customerEmail],
        ['Phone', ev.customerPhone],
        ['Event Type', ev.eventType],
        ['Event Date', formatDate(ev.eventDate)],
        ['Guests', ev.guestCount],
        ['Venue', ev.venue || '—'],
        ['Budget', ev.budget || '—'],
        ['Status', statusBadge(ev.status)],
        ['Submitted', formatDateTime(ev.createdAt)],
      ].map(([label, val]) => `
        <div style="display:flex;gap:1rem;align-items:flex-start;padding:.6rem 0;border-bottom:1px solid var(--border-color);">
          <span style="color:var(--text-muted);font-size:.88rem;min-width:110px;flex-shrink:0;">${label}</span>
          <span style="color:var(--text-primary);font-size:.9rem;">${val}</span>
        </div>`).join('')}
      ${ev.description ? `
        <div style="padding:.6rem 0;">
          <div style="color:var(--text-muted);font-size:.88rem;margin-bottom:.4rem;">Description</div>
          <p style="color:var(--text-secondary);font-size:.9rem;line-height:1.6;">${ev.description}</p>
        </div>` : ''}
    </div>`;
  document.getElementById('ev-detail-modal').style.display = 'flex';
}
